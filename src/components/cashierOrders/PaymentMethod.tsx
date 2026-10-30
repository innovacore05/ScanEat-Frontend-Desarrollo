import { useEffect, useState } from "react";
import Skeleton from "../shared/Skeleton";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import PaymentStatus, { type StatusType } from "./PaymentStatus";
import { HiArrowLeft } from "react-icons/hi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import {
  getPaymentPreview,
  getReceiptStatus,
  payOrder,
  type PayOrderPayload,
  type PayOrderResponse,
  type PaymentPreview,
   type RetryReceiptEmissionResponse,
} from "../../services/billingService";
import PaymentModal, {
  type PaymentDetails,
  type PaymentType,
} from "./PaymentModal";
import InvoiceModal from "./InvoiceModal";

const formatCRC = (value: string | number) =>
  `₡${Number(value).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const IN_FLIGHT = new Set(["queued", "signing", "sent", "polling", "pending"]);

type SelectedLineAmounts = {
  gross: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
};

const toCents = (value: string | number): number => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new Error("Monto no válido");
  }

  return Math.round(amount * 100);
};

const allocatedDiscountCents = (
  totalDiscountCents: number,
  totalQuantity: number,
  alreadyPaid: number,
  selectedQuantity: number,
): number => {
  if (
    totalQuantity <= 0 ||
    alreadyPaid < 0 ||
    selectedQuantity < 0 ||
    alreadyPaid + selectedQuantity > totalQuantity
  ) {
    throw new Error("Cantidad no válida para distribuir el descuento");
  }

  const cumulative = (units: number) =>
    Number(
      (BigInt(totalDiscountCents) * BigInt(units)) /
        BigInt(totalQuantity),
    );

  return (
    cumulative(alreadyPaid + selectedQuantity) -
    cumulative(alreadyPaid)
  );
};

const taxCentsFor = (subtotalCents: number, ivaRate: string): number => {
  const rateBasisPoints = Math.round(Number(ivaRate) * 100);

  if (!Number.isFinite(rateBasisPoints) || rateBasisPoints < 0) {
    throw new Error("Tarifa de IVA no válida");
  }

  return Number(
    (BigInt(subtotalCents) * BigInt(rateBasisPoints) + 5_000n) /
      10_000n,
  );
};

function getSelectedLineAmounts(
  line: PaymentPreview["lines"][number],
  quantity: number,
): SelectedLineAmounts {
  if (quantity <= 0) {
    return { gross: 0, discount: 0, subtotal: 0, tax: 0, total: 0 };
  }

  const grossCents = toCents(line.unitPrice) * quantity;
  const discountCents = allocatedDiscountCents(
    toCents(line.discount),
    line.quantity,
    line.paidQuantity,
    quantity,
  );
  const subtotalCents = grossCents - discountCents;
  const taxCents = taxCentsFor(subtotalCents, line.ivaRate);

  return {
    gross: grossCents / 100,
    discount: discountCents / 100,
    subtotal: subtotalCents / 100,
    tax: taxCents / 100,
    total: (subtotalCents + taxCents) / 100,
  };
}

function getSelectedTotals(
  lines: PaymentPreview["lines"],
  selectedQuantities: Record<number, number>,
  includeService: boolean,
) {
  let grossCents = 0;
  let subtotalCents = 0;
  let discountCents = 0;
  let taxCents = 0;

  const taxByRate = new Map<number, number>();

  for (const line of lines) {
    const quantity = selectedQuantities[line.detailId] ?? 0;
    if (quantity <= 0) continue;

    const amounts = getSelectedLineAmounts(line, quantity);
    const lineGrossCents = toCents(amounts.gross);
    const lineSubtotalCents = toCents(amounts.subtotal);
    const lineDiscountCents = toCents(amounts.discount);
    const lineTaxCents = toCents(amounts.tax);
    const rate = Number(line.ivaRate);

    grossCents += lineGrossCents;
    subtotalCents += lineSubtotalCents;
    discountCents += lineDiscountCents;
    taxCents += lineTaxCents;
    taxByRate.set(rate, (taxByRate.get(rate) ?? 0) + lineTaxCents);
  }

  const serviceCents = includeService
    ? Math.floor((subtotalCents + 5) / 10)
    : 0;

  const money = (cents: number) => (cents / 100).toFixed(2);

  return {
    totalSale: money(grossCents),
    totalNetSale: money(subtotalCents),
    totalDiscount: money(discountCents),
    totalTax: money(taxCents),
    serviceCharge: money(serviceCents),
    totalVoucher: money(subtotalCents + taxCents + serviceCents),
    taxSummary: [...taxByRate.entries()].map(([rate, cents]) => ({
      rate,
      amount: money(cents),
    })),
  };
}

function PaymentMethod() {
  const search = useSearch({ strict: false });
  const orderId = Number(search.orderId);
  const navigate = useNavigate();

  const [order, setOrder] = useState<PaymentPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType | "">("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [receipt, setReceipt] = useState<PayOrderResponse | null>(null);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<StatusType | "">("");
  const [includeService, setIncludeService] = useState(true);
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<number, number>
  >({});
  const [pollTick, setPollTick] = useState(0);

  const selectedItems =
    order?.lines
      .map((line) => ({
        detailId: line.detailId,
        quantity: selectedQuantities[line.detailId] ?? 0,
      }))
      .filter((item) => item.quantity > 0) ?? [];

  const selectedTotals = order
    ? getSelectedTotals(order.lines, selectedQuantities, includeService)
    : null;

  useEffect(() => {
    let isActive = true;

    const loadOrder = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const data = await getPaymentPreview(orderId, true);

        if (!isActive) return;

        setOrder(data);
        setSelectedQuantities(
          Object.fromEntries(
            data.lines.map((line) => [line.detailId, line.pendingQuantity]),
          ),
        );
      } catch (error) {
        if (!isActive) return;

        console.error("Error cargando la orden:", { orderId, error });
        setLoadError(
          error && typeof error === "object" && "message" in error
            ? String((error as { message?: string }).message)
            : "No se pudo cargar la orden.",
        );
      } finally {
        if (isActive) setLoading(false);
      }
    };

    if (orderId) {
      void loadOrder();
    } else {
      setLoading(false);
      setLoadError("El identificador de la orden no es válido.");
    }

    return () => {
      isActive = false;
    };
  }, [orderId]);

  const receiptId = receipt?.receiptId;
  const fiscalStatus = receipt?.haciendaStatus;

  useEffect(() => {
    if (!receiptId || !fiscalStatus || !IN_FLIGHT.has(fiscalStatus)) {
      return;
    }

    const delay = Math.min(5000 * 2 ** Math.min(pollTick, 3), 40000);

    const timer = window.setTimeout(async () => {
      try {
        const next = await getReceiptStatus(receiptId);

        setReceipt((previous) =>
          previous && previous.receiptId === next.receiptId
            ? {
              ...previous,
              haciendaStatus: next.haciendaStatus,
              haciendaMessage: next.haciendaMessage,
              clave: next.clave,
              consecutiveNumber: next.consecutiveNumber,
            }
            : previous,
        );
      } catch (error) {
        console.error("Error consultando el estado del tiquete:", error);
      } finally {
        setPollTick((tick) => tick + 1);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [receiptId, fiscalStatus, pollTick]);

  const openPaymentModal = (method: PaymentType) => {
    setPaymentMethod(method);
    setPayError("");
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    if (isPaying) return;

    setIsPaymentModalOpen(false);
    setPaymentMethod("");
    setPayError("");
  };

  const buildPayload = (
    method: PaymentType,
    details: PaymentDetails,
  ): PayOrderPayload | null => {
    if (selectedItems.length === 0) {
      setPayError("Seleccioná al menos un producto para cobrar.");
      return null;
    }

    const common = {
      includeServiceCharge: includeService,
      items: selectedItems,
    };

    if (method === "efectivo") {
      if (details.amountTendered === undefined) return null;

      return {
        ...common,
        method: "cash",
        amountTendered: details.amountTendered,
      };
    }

    if (!details.reference) return null;

    return {
      ...common,
      method: method === "tarjeta" ? "card" : "sinpe",
      reference: details.reference,
    };
  };

  const handleCharge = async (details: PaymentDetails) => {
    if (!paymentMethod || isPaying || receipt) return;

    const payload = buildPayload(paymentMethod, details);
    if (!payload) return;

    try {
      setIsPaying(true);
      setPayError("");

      const response = await payOrder(orderId, payload);

      setReceipt(response);
      setIsPaymentModalOpen(false);
      setPaymentStatus("Aprobado");
      setIsPaymentStatusOpen(true);
    } catch (error) {
      setPayError(
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "No se pudo registrar el cobro.",
      );
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex h-30 items-center justify-between gap-4 border-b-4 border-mint-dark bg-neutral-50 px-4 py-4 sm:px-8">
          <RestaurantLogo className="h-16 w-16" />
        </div>

        <section className="px-6 py-8 lg:px-8">
          <div className="mx-auto max-w-300">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-96 max-w-full" />
            </div>

            <Skeleton className="mt-6 h-14 w-74 max-w-full rounded-xl" />

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-xl border border-border p-6 lg:p-8">
                <Skeleton className="mx-auto h-9 w-28" />
                <Skeleton className="mt-8 h-6 w-44" />

                <div className="mt-6 space-y-5">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="border-t border-border pt-3">
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-5 px-2 lg:px-8">
                <Skeleton className="h-14 w-full max-w-72 rounded-xl" />
                <Skeleton className="h-14 w-full max-w-72 rounded-xl" />
                <Skeleton className="h-14 w-full max-w-72 rounded-xl" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-white p-6">
        <p className="text-red-600">
          {loadError || "No se pudo cargar la orden."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex h-30 items-center justify-between gap-4 border-b-4 border-mint-dark bg-neutral-50 px-4 py-4 sm:px-8">
        <RestaurantLogo className="h-16 w-16" />
      </div>

      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-300">
          <div className="flex items-center gap-4">
            <Link
              to="/cashierOrders"
              className="cursor-pointer text-mint"
              aria-label="Volver a pedidos"
            >
              <HiArrowLeft className="h-8 w-8 text-mint-dark" />
            </Link>

            <h1 className="text-3xl font-bold text-mint-dark lg:text-4xl">
              Selecciona el método de pago
            </h1>
          </div>

          <p className="mt-6 w-74 rounded-xl border border-border p-3 text-xl text-gray-600 lg:text-2xl">
            Cuenta de mesa #{order.tableNumber}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-border p-6 lg:p-8">
              <h2 className="text-center text-2xl font-bold text-mint-dark lg:text-3xl">
                Recibo
              </h2>

              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="font-semibold">Servicio de mesa (10 %)</span>
                <input
                  type="checkbox"
                  checked={includeService}
                  disabled={isPaying || receipt !== null}
                  onChange={(event) => setIncludeService(event.target.checked)}
                  className="h-5 w-5 accent-mint-dark"
                />
              </label>

              <h3 className="mt-7 text-lg font-bold text-mint-dark lg:text-xl">
                Productos de la cuenta
              </h3>

              <div className="mt-5 max-h-80 overflow-y-auto pr-2">
                <div className="flex flex-col gap-4">
                  {order.lines.map((line) => {
                    const selectedQuantity =
                      selectedQuantities[line.detailId] ?? line.pendingQuantity;
                    const selectedAmounts = getSelectedLineAmounts(
                      line,
                      selectedQuantity,
                    );

                    return (
                      <div
                        key={line.detailId}
                        className="flex items-center justify-between gap-4 border-b border-border pb-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{line.detail}</p>

                          <p className="text-xs text-gray-500">
Pendientes: {line.pendingQuantity} ·{" "}
{line.ivaRateCode === "10"
  ? "Exento de IVA"
  : `IVA ${Number(line.ivaRate)} %`}
</p>

                          <label className="mt-2 flex items-center gap-2 text-sm">
                            Cantidad a cobrar
                            <input
                              type="number"
                              min={0}
                              max={line.pendingQuantity}
                              step={1}
                              value={selectedQuantity}
                              disabled={isPaying || receipt !== null}
                              onChange={(event) => {
                                const parsed = Number.parseInt(
                                  event.target.value,
                                  10,
                                );
                                const quantity = Number.isNaN(parsed)
                                  ? 0
                                  : Math.max(
                                    0,
                                    Math.min(parsed, line.pendingQuantity),
                                  );

                                setSelectedQuantities((previous) => ({
                                  ...previous,
                                  [line.detailId]: quantity,
                                }));
                              }}
                              className="w-20 rounded-md border border-gray-300 p-1 text-center"
                            />
                          </label>
                        </div>

                        <p className="shrink-0 tracking-wider">
                          {formatCRC(selectedAmounts.total)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedTotals && (
  <div className="mt-6 border-t border-border pt-4">
    <div className="flex items-center justify-between">
      <p>Venta antes del descuento (sin IVA)</p>
      <p>{formatCRC(selectedTotals.totalSale)}</p>
    </div>

    <div className="mt-2 flex items-center justify-between">
      <p>Descuento</p>
      <p>{formatCRC(selectedTotals.totalDiscount)}</p>
    </div>

    <div className="mt-2 flex items-center justify-between">
      <p>Neto después del descuento (sin IVA)</p>
      <p>{formatCRC(selectedTotals.totalNetSale)}</p>
    </div>

    {selectedTotals.taxSummary.map(({ rate, amount }) => (
      <div
        key={rate}
        className="mt-2 flex items-center justify-between"
      >
        <p>
          {order.chargesVat === false
            ? "Exento de IVA"
            : `IVA ${rate} %`}
        </p>
        <p>{formatCRC(amount)}</p>
      </div>
    ))}

                  {includeService &&
                    Number(selectedTotals.serviceCharge) > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <p>Servicio 10 %</p>
                        <p>{formatCRC(selectedTotals.serviceCharge)}</p>
                      </div>
                    )}

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <p className="text-xl font-bold text-mint-dark">Total</p>
                    <p className="text-xl font-bold text-mint-dark">
                      {formatCRC(selectedTotals.totalVoucher)}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Link
                  to="/menuClient"
                  search={{
                    mesaId: order.tableId,
                    orderId: order.orderId,
                    mode: "add",
                    returnTo: "cashier",
                  }}
                  aria-label="Agregar productos a la orden"
                >
                  <BsFillPlusCircleFill className="h-8 w-8 text-mint-dark" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-center px-2 lg:px-8">
              <div className="flex flex-col items-center gap-5">
                <button
                  type="button"
                  onClick={() => openPaymentModal("sinpe")}
                  disabled={
                    isPaying || receipt !== null || selectedItems.length === 0
                  }
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${paymentMethod === "sinpe"
                      ? "bg-mint-darker text-white"
                      : "text-gray-700"
                    }`}
                >
                  SINPE Móvil
                </button>

                <button
                  type="button"
                  onClick={() => openPaymentModal("tarjeta")}
                  disabled={
                    isPaying || receipt !== null || selectedItems.length === 0
                  }
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${paymentMethod === "tarjeta"
                      ? "bg-mint-darker text-white"
                      : "text-gray-700"
                    }`}
                >
                  Tarjeta
                </button>

                <button
                  type="button"
                  onClick={() => openPaymentModal("efectivo")}
                  disabled={
                    isPaying || receipt !== null || selectedItems.length === 0
                  }
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${paymentMethod === "efectivo"
                      ? "bg-mint-darker text-white"
                      : "text-gray-700"
                    }`}
                >
                  Efectivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        paymentMethod={paymentMethod}
        total={selectedTotals?.totalVoucher ?? "0.00"}
        isSubmitting={isPaying}
        errorMessage={payError}
        onClose={closePaymentModal}
        onConfirm={(details) => void handleCharge(details)}
      />

      <PaymentStatus
        isOpen={isPaymentStatusOpen}
        status={paymentStatus}
        orderId={orderId}
        paymentMethod={paymentMethod}
        onConfirm={() => {
          setIsPaymentStatusOpen(false);
          if (paymentStatus === "Aprobado") {
            setIsInvoiceModalOpen(true);
          }
        }}
      />

      <InvoiceModal
  isOpen={isInvoiceModalOpen}
  receipt={receipt}
  onReceiptUpdated={(updatedReceipt) => {
    setReceipt((previous) => {
      if (!previous) return previous;

      const isSameReceipt =
        previous.receiptId === updatedReceipt.receiptId;

      const isReplacement =
        "replacesReceiptId" in updatedReceipt &&
        previous.receiptId === updatedReceipt.replacesReceiptId;

      if (!isSameReceipt && !isReplacement) return previous;

      return {
        ...previous,
        receiptId: updatedReceipt.receiptId,
        haciendaStatus: updatedReceipt.haciendaStatus,
        clave: updatedReceipt.clave,
        consecutiveNumber: updatedReceipt.consecutiveNumber,
        haciendaMessage:
          "emissionError" in updatedReceipt
            ? updatedReceipt.emissionError ?? null
            : null,
      };
    });
  }}
  onClose={() => {
    setIsInvoiceModalOpen(false);
    setReceipt(null);
  }}
/>
    </main>
  );
}

export default PaymentMethod;
