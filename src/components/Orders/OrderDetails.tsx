import { Link } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi";
import type { Order } from "../waiterOrders/WaiterOrderCard";
import DashboardLayoutWaiter from "../layout/DashboardLayoutWaiter";
import type { ReactNode, ComponentType } from "react";
import { useState } from "react";
import { confirmOrder, deliverOrder } from "../../services/orderService";

type OrderDetailsProps = {
  order: Order;
  embedded?: boolean;
  showConfirmButton?: boolean;
  onStatusChanged?: () => void | Promise<void>;
  mobileBackRoute?: string;
  showMobileBack?: boolean;
  Layout?: ComponentType<{ children: ReactNode }>;
};

function OrderDetailsContent({
  order,
  showConfirmButton,
  mobileBackRoute,
  showMobileBack,
  onStatusChanged,
}: {
  order: Order;
  showConfirmButton: boolean;
  mobileBackRoute: string;
  showMobileBack: boolean;
  onStatusChanged?: () => void | Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const subtotal = order.subtotal ?? 0;
  const iva = order.tax ?? 0;
  const total = order.total ?? subtotal + iva;
  const canChangeStatus =
    showConfirmButton &&
    (order.status === "Pendiente" || order.status === "Listo");

  const handleStatusChange = async () => {
    if (!order.status) return;

    try {
      setIsUpdating(true);
      if (order.status === "Pendiente") {
        await confirmOrder(order.orderId);
      } else if (order.status === "Listo") {
        await deliverOrder(order.orderId);
      }
      await onStatusChanged?.();
    } catch (error) {
      console.error("No se pudo cambiar el estado de la orden:", error);
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "No se pudo cambiar el estado de la orden.";
      alert(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Celular */}
      <section className="lg:hidden">
       <div className="flex items-center gap-2">
  {showMobileBack ? (
    <Link
      to={mobileBackRoute}
      className="flex items-center gap-2 text-mint-dark"
    >
      <HiArrowLeft className="h-6 w-6" />

      <span className="text-[32px] font-bold">
        Orden #{order.orderId}
      </span>
    </Link>
  ) : (
    <span className="text-2xl font-bold text-mint-dark">
      Orden #{order.orderId}
    </span>
  )}
</div>

        <div className="mt-2 rounded-4xl bg-neutral-100 px-6 py-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-mint-dark">
              Mesa #{order.tableId}
            </h2>

            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold text-mint-dark">
                Estado: {order.status}
              </p>

              <p className="text-base font-semibold text-text-primary">
                Hora: {order.time}
              </p>
            </div>
          </div>

          {order.specialInstructions && (
            <div className="mt-8">
              <p className="text-base font-bold text-mint-dark">
                Instrucciones especiales
              </p>

              <div className="mt-2 rounded-lg border border-border p-4">
                <p className="text-base text-text-primary">
                  {order.specialInstructions}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-xl font-bold text-mint-dark">
              Pedido
            </p>

            <div className="mt-4 flex flex-col gap-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-base font-bold text-text-primary">
                      {item.quantity}x {item.name}
                    </p>

                    {item.options && (
                      <div className="mt-1 flex flex-col gap-1">
                        {Object.entries(item.options).map(
                          ([name, value]) => (
                            <p
                              key={name}
                              className="text-sm text-text-primary"
                            >
                              {name}: {value}
                            </p>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  <p className="shrink-0 text-base font-semibold text-text-primary">
                    ₡
                    {(
                      Number(item.price) * item.quantity
                    ).toLocaleString("es-CR")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-4">
            <div className="flex justify-between text-base">
              <span>Subtotal</span>

              <span>
                ₡{subtotal.toLocaleString("es-CR")}
              </span>
            </div>

            <div className="mt-2 flex justify-between text-base">
              <span>IVA (13%)</span>

              <span>
                ₡{iva.toLocaleString("es-CR")}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-xl font-bold text-mint-dark">
              <span>Total</span>

              <span>
                ₡{total.toLocaleString("es-CR")}
              </span>
            </div>
          </div>

          {canChangeStatus && (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => void handleStatusChange()}
                disabled={isUpdating}
                className="cursor-pointer rounded-lg bg-mint-dark px-6 py-2 text-lg font-bold text-white"
              >
                {isUpdating
                  ? "Actualizando..."
                  : order.status === "Listo"
                    ? "Entregar"
                    : "Confirmar"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Computadora */}
      <section className="hidden lg:block">
        <div className="w-full min-w-0 rounded-4xl bg-neutral-100 px-8 py-8">
          <div className="flex flex-col gap-4">
            <p className="text-2xl font-bold text-mint-dark">
              Orden #{order.orderId}
            </p>

            <h2 className="text-2xl font-bold text-text-primary">
              Mesa #{order.tableId}
            </h2>

            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold text-mint-dark">
                Estado: {order.status}
              </p>

              <p className="text-lg font-semibold text-text-primary">
                Hora: {order.time}
              </p>
            </div>
          </div>

          {order.specialInstructions && (
            <div className="mt-8">
              <p className="text-xl font-bold text-mint-dark">
                Instrucciones especiales
              </p>

              <div className="mt-3 rounded-lg border border-border p-5">
                <p className="text-base text-text-primary">
                  {order.specialInstructions}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-xl font-bold text-mint-dark">
              Pedido
            </p>

            <div className="mt-4 flex flex-col gap-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-lg font-bold text-text-primary">
                      {item.quantity}x {item.name}
                    </p>

                    {item.options && (
                      <div className="mt-2 flex flex-col gap-1">
                        {Object.entries(item.options).map(
                          ([name, value]) => (
                            <p
                              key={name}
                              className="text-base text-text-primary"
                            >
                              {name}: {value}
                            </p>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  <p className="shrink-0 text-lg font-semibold text-text-primary">
                    ₡
                    {(
                      Number(item.price) * item.quantity
                    ).toLocaleString("es-CR")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-5">
            <div className="flex justify-between text-base">
              <span>Subtotal</span>

              <span>
                ₡{subtotal.toLocaleString("es-CR")}
              </span>
            </div>

            <div className="mt-2 flex justify-between text-base">
              <span>IVA (13%)</span>

              <span>
                ₡{iva.toLocaleString("es-CR")}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-xl font-bold text-mint-dark">
              <span>Total</span>

              <span>
                ₡{total.toLocaleString("es-CR")}
              </span>
            </div>
          </div>

          {canChangeStatus && (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => void handleStatusChange()}
                disabled={isUpdating}
                className="cursor-pointer rounded-lg bg-mint-dark px-6 py-2 text-lg font-bold text-white"
              >
                {isUpdating
                  ? "Actualizando..."
                  : order.status === "Listo"
                    ? "Entregar"
                    : "Confirmar"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function OrderDetails({
  order,
  embedded = false,
  showConfirmButton = true,
  mobileBackRoute = "/waiterOrders",
  showMobileBack = true,
  Layout = DashboardLayoutWaiter,
  onStatusChanged,
}: OrderDetailsProps) {
  if (embedded) {
    return (
      <OrderDetailsContent
        order={order}
        showConfirmButton={showConfirmButton}
        mobileBackRoute={mobileBackRoute}
        showMobileBack={showMobileBack}
        onStatusChanged={onStatusChanged}
      />
    );
  }

  return (
    <Layout>
      <main className="min-h-screen bg-white px-6 py-8 lg:px-10 lg:py-10">
        <OrderDetailsContent
          order={order}
          showConfirmButton={showConfirmButton}
          mobileBackRoute={mobileBackRoute}
          showMobileBack={showMobileBack}
          onStatusChanged={onStatusChanged}
        />
      </main>
    </Layout>
  );
}

export default OrderDetails;