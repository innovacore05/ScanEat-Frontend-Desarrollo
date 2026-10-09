import { useEffect, useState } from "react";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";

import { RestaurantLogo } from "../theme/RestaurantLogo";
import PaymentStatus, { type StatusType } from "./PaymentStatus";
import { HiArrowLeft } from "react-icons/hi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import {
  getPaymentPreview,
  payOrder,
  type PayOrderPayload,
  type PayOrderResponse,
  type PaymentPreview,
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

function PaymentMethod() {
  const search = useSearch({ strict: false });
  const orderId = Number(search.orderId);

  const [order, setOrder] = useState<PaymentPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType | "">("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const navigate = useNavigate();

  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [receipt, setReceipt] = useState<PayOrderResponse | null>(null);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<StatusType | "">("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getPaymentPreview(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Error cargando la orden", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      void loadOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

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
    if (method === "efectivo") {
      if (details.amountTendered === undefined) return null;
      return { method: "cash", amountTendered: details.amountTendered };
    }

    if (!details.reference) return null;
    return {
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
          : "No se pudo registrar el cobro",
      );
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return <p>Cargando recibo...</p>;
  }

  if (!order) {
    return <p>No se pudo cargar la orden.</p>;
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex h-30 items-center justify-between gap-4 bg-neutral-50 border-b-4 border-mint-dark px-4 py-4 sm:px-8">
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

              <h3 className="mt-7 text-lg font-bold text-mint-dark lg:text-xl">
                Total de pedido
              </h3>

              <div className="mt-5 max-h-60 overflow-y-auto pr-6">
                <div className="flex flex-col gap-4">
                  {order.lines.map((line) => (
                    <div
                      key={line.detailId}
                      className="flex items-center justify-between gap-4"
                    >
                      <p className="min-w-0 flex-1">
                        {line.detail} x {line.quantity}
                      </p>

                      <div className="flex shrink-0 items-center justify-end gap-2">
                        {Number(line.discount) > 0 && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatCRC(Number(line.gross) * 1.13)}
                          </p>
                        )}

                        <p className="tracking-wider ">
                          {formatCRC(line.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <p>IVA (13%)</p>
                  <p className="tracking-wider">
                    {formatCRC(order.totals.totalTax)}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xl font-bold text-mint-dark">Total</p>
                  {/* total */}
                  <p className="text-xl font-bold tracking-wider text-mint-dark">
                    {formatCRC(order.totals.totalSale)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="button" className="cursor-pointer">
                  <BsFillPlusCircleFill className="h-9 w-9 text-mint-dark" />
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center px-2 lg:px-8">
              <div className="flex flex-col items-center gap-5">
                <button
                  type="button"
                  onClick={() => openPaymentModal("sinpe")}
                  disabled={isPaying || receipt !== null}
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    paymentMethod === "sinpe"
                      ? "bg-mint-darker text-white"
                      : "text-gray-700"
                  }`}
                >
                  SINPE Móvil
                </button>

                <button
                  type="button"
                  onClick={() => openPaymentModal("tarjeta")}
                  disabled={isPaying || receipt !== null}
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    paymentMethod === "tarjeta"
                      ? "bg-mint-darker text-white"
                      : "text-gray-700"
                  }`}
                >
                  Tarjeta
                </button>

                <button
                  type="button"
                  onClick={() => openPaymentModal("efectivo")}
                  disabled={isPaying || receipt !== null}
                  className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    paymentMethod === "efectivo"
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
        total={order.totals.totalSale}
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
        onClose={() => {
          setIsInvoiceModalOpen(false);
          void navigate({ to: "/cashierOrders" });
        }}
      />
    </main>
  );
}

export default PaymentMethod;