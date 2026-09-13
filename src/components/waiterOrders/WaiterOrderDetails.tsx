import { Link } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi";
import type { Order } from "./WaiterOrderCard";
import DashboardLayoutWaiter from "../layout/DashboardLayoutWaiter";

type WaiterOrderDetailsProps = {
  order: Order;
  embedded?: boolean;
};

function OrderDetailsContent({ order }: { order: Order }) {
  const subtotal = Number(order.price.replace("₡", "").replace(",", ""));
  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  return (
      <div className="w-full">
          
      {/* Celular */}
      <section className="lg:hidden">
        <div className="flex items-center gap-2">
          <Link
            to="/waiterOrders"
            className="flex items-center gap-2 text-mint-dark"
          >
            <HiArrowLeft className="h-6 w-6" />

            <span className="text-[32px] font-bold">
              Orden #{order.orderId}
            </span>
          </Link>
        </div>

        <div className="mt-8 rounded-4xl bg-neutral-100 px-6 py-6">
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

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-mint-dark px-6 py-2 text-lg font-bold text-white"
            >
              Confirmar
            </button>
          </div>
        </div>
      </section>

          
          
      {/* Computadora */}
          <section className="hidden lg:block">
              
        

        <div className="w-245 rounded-4xl bg-neutral-100 px-8 py-8">
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

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-mint-dark px-6 py-2 text-lg font-bold text-white"
            >
              Confirmar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function WaiterOrderDetails({
  order,
  embedded = false,
}: WaiterOrderDetailsProps) {
  if (embedded) {
    return <OrderDetailsContent order={order} />;
  }

  return (
    <DashboardLayoutWaiter>
      <main className="min-h-screen bg-white px-6 py-8 lg:px-10 lg:py-10">
        <OrderDetailsContent order={order} />
      </main>
    </DashboardLayoutWaiter>
  );
}

export default WaiterOrderDetails;