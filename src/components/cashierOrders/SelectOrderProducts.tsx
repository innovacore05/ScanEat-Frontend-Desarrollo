
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi";
import { FiMinus, FiPlus } from "react-icons/fi";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import Skeleton from "../shared/Skeleton";
import {
  getPaymentPreview,
  type PaymentPreview,
} from "../../services/billingService";

const formatCRC = (value: string | number) =>
  `₡${Number(value).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function SelectOrderProducts() {
  const search = useSearch({ strict: false });
  const orderId = Number(search.orderId);
  const navigate = useNavigate();

  const [order, setOrder] = useState<PaymentPreview | null>(null);
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<number, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHaciendaPopup, setShowHaciendaPopup] = useState(false);

 useEffect(() => {
    const loadOrder = async () => {
        try {
            const data = await getPaymentPreview(orderId);
            setOrder(data);
        } catch (err: unknown) {
            const apiError = err as {
                message?: string;
                response?: {
                    data?: {
                        message?: string;
                        error?: string;
                    };
                };
            };

            const message =
                apiError.response?.data?.message ??
                apiError.response?.data?.error ??
                apiError.message ??
                "No se pudo cargar la orden.";

            console.log("Error completo:", err);
            console.log("Mensaje recibido:", message);

            const normalizedMessage = message
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

            if (
                normalizedMessage.includes("verificacion") &&
                normalizedMessage.includes("regimen") &&
                normalizedMessage.includes("venc")
            ) {
                setShowHaciendaPopup(true);
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (orderId) {
        void loadOrder();
    } else {
        setError("No se recibió el número de la orden.");
        setLoading(false);
    }
}, [orderId]);

  const selectedItems =
    order?.lines
      .map((line) => ({
        detailId: line.detailId,
        quantity: selectedQuantities[line.detailId] ?? 0,
      }))
      .filter((item) => item.quantity > 0) ?? [];

  const allSelected =
    !!order &&
    order.lines.some((line) => line.pendingQuantity > 0) &&
    order.lines.every(
      (line) =>
        line.pendingQuantity <= 0 ||
        (selectedQuantities[line.detailId] ?? 0) ===
          line.pendingQuantity,
    );

  const updateQuantity = (
    detailId: number,
    pending: number,
    quantity: number,
  ) => {
    const safeQuantity = Math.min(
      pending,
      Math.max(0, Math.floor(quantity)),
    );

    setSelectedQuantities((previous) => ({
      ...previous,
      [detailId]: safeQuantity,
    }));

    setError("");
  };

  const toggleAllProducts = () => {
    if (!order) return;

    if (allSelected) {
      setSelectedQuantities({});
    } else {
      const quantities: Record<number, number> = {};

      order.lines.forEach((line) => {
        if (line.pendingQuantity > 0) {
          quantities[line.detailId] = line.pendingQuantity;
        }
      });

      setSelectedQuantities(quantities);
    }

    setError("");
  };

  const total = order
    ? order.lines.reduce((sum, line) => {
        const quantity = selectedQuantities[line.detailId] ?? 0;

        if (line.originalQuantity <= 0 || quantity <= 0) {
          return sum;
        }

        return (
          sum +
          (Number(line.total) * quantity) / line.originalQuantity
        );
      }, 0)
    : 0;

  const continueToPayment = () => {
    if (!selectedItems.length) {
      setError("Selecciona al menos un producto para cobrar.");
      return;
    }

    void navigate({
      to: "/paymentMethod",
      search: {
        orderId,
        selectedItems: JSON.stringify(selectedItems),
      },
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-8">
        <Skeleton className="mb-6 h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
    );
  }

if (!order) {
    return (
        <main className="min-h-screen bg-white">
            {showHaciendaPopup ? (
                <AnimatePresence>
                    <motion.div
                        key="hacienda-expired-modal"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                        role="dialog"
                        aria-modal="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-sm rounded-2xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="w-full rounded-2xl bg-white p-6 shadow-xl">
                                <h3 className="text-lg font-bold text-mint-darker">
                                    Verificación de Hacienda vencida
                                </h3>

                                <p className="mt-2 text-sm text-text-primary">
                                    La verificación del régimen de Hacienda ha
                                    vencido. Solicita al propietario o
                                    administrador del negocio que actualice
                                    los datos del emisor para continuar con
                                    la facturación electrónica.
                                </p>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void navigate({
                                                to: "/cashierOrders",
                                            })
                                        }
                                        className="cursor-pointer rounded-lg bg-mint-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                                    >
                                        Volver a las órdenes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            ) : (
                <div className="p-8">
                    <p className="text-red-600">
                        {error || "No se pudo cargar la orden."}
                    </p>
                </div>
            )}
        </main>
    );
}
 
    return (
    <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
            duration: 0.5,
            ease: "easeOut",
        }}
        className="min-h-screen bg-white"
    >

      <header className="flex h-30 items-center border-b-4 border-mint-dark bg-neutral-50 px-4 py-4 sm:px-8">
        <RestaurantLogo className="h-16 w-16" />
      </header>

      <section className="mx-auto max-w-300 px-6 py-8 lg:px-8">
        <button
          type="button"
          onClick={() => void navigate({ to: "/cashierOrders" })}
          className="mb-6 flex items-center gap-3 text-mint-dark cursor-pointer"
        >
          <HiArrowLeft className="h-7 w-7" />
          Volver a las órdenes
        </button>

        <h1 className="text-3xl font-bold text-mint-dark">
          Seleccionar productos
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Cuenta de mesa #{order.tableNumber}
        </p>

        <div className="mt-8 rounded-xl border border-border p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-mint-dark">
              Productos pendientes de pago
            </h2>

            <button
              type="button"
              onClick={toggleAllProducts}
              className="rounded-lg border border-mint-dark px-4 py-2 font-semibold text-mint-dark transition hover:bg-mint-dark hover:text-white"
            >
              {allSelected
                ? "Deseleccionar todos"
                : "Seleccionar todos"}
            </button>
          </div>

          <div className="space-y-5">
            {order.lines.map((line,index) => {
              const pending = line.pendingQuantity;
              const selected =
                selectedQuantities[line.detailId] ?? 0;

              const pendingTotal =
                pending > 0 && line.originalQuantity > 0
                  ? (Number(line.total) * pending) /
                    line.originalQuantity
                  : 0;

              return (
                <motion.div
        key={line.detailId}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
            duration: 0.35,
            delay: index * 0.06,
            ease: "easeOut",
        }}
        className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between"
    >

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{line.detail}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      Pendientes: {pending} · IVA{" "}
                      {Number(line.ivaRate)} %
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Precio total pendiente:{" "}
                      {formatCRC(pendingTotal)}
                    </p>

                    {selected > 0 && (
                      <p className="mt-1 text-sm font-medium text-mint-dark">
                        Seleccionados: {selected} de {pending}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="text-sm font-medium text-gray-600">
                      Cantidad
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${line.detail}`}
                        disabled={pending <= 0 || selected <= 0}
                        onClick={() =>
                          updateQuantity(
                            line.detailId,
                            pending,
                            selected - 1,
                          )
                        }
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-mint-dark transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>

                      <span
                        aria-live="polite"
                        className="w-8 text-center text-lg font-semibold tabular-nums"
                      >
                        {selected}
                      </span>

                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${line.detail}`}
                        disabled={
                          pending <= 0 || selected >= pending
                        }
                        onClick={() =>
                          updateQuantity(
                            line.detailId,
                            pending,
                            selected + 1,
                          )
                        }
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-mint-dark text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 pt-5">
            <p className="text-lg font-bold text-mint-dark">
              Total seleccionado
            </p>

            <p className="text-xl font-bold text-mint-dark">
              {formatCRC(total)}
            </p>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={continueToPayment}
            disabled={selectedItems.length === 0}
            className="mt-6 w-full rounded-xl bg-mint-dark px-6 py-3 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar al pago
          </button>
        </div>
      </section>
      
    
        <AnimatePresence>
    {showHaciendaPopup && (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {/* Conserva aquí el contenido actual del popup */}
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
    </motion.main>
  );
}

export default SelectOrderProducts;
