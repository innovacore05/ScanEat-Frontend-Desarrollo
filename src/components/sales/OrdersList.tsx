import { FiDownload } from "react-icons/fi";

import { getOrders } from "../../services/orderService";

type OrdersListProps = {
  orders: Awaited<ReturnType<typeof getOrders>>;
  period: string;
  isLoading?: boolean;
  showExportButton?: boolean;
};

function OrdersList({
  orders,
  period,
  isLoading = false,
  showExportButton = true,
}: OrdersListProps) {
  return (
    <section className="mt-3 rounded-2xl border border-border bg-white p-5 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-text-primary">
            {period}
          </p>

          <h2 className="text-xl font-bold text-mint-darker">
            Detalle de pedidos
          </h2>
        </div>

        {showExportButton && (
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-mint-dark px-3 py-2 text-sm font-semibold text-mint-darker transition hover:bg-mint-light"
            >
              <FiDownload />
              Exportar
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <div className="min-w-145">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center bg-neutral-100 px-4 py-3 text-sm font-semibold text-text-primary">
            <span>Orden</span>
            <span>Mesa</span>
            <span>Total</span>
            <span>Hora</span>
          </div>

          <div className="text-sm text-text-primary">
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-5 text-sm text-text-primary">
                  Cargando pedidos...
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center border-t border-border px-4 py-4 text-sm text-text-primary"
                  >
                    <span className="font-semibold text-mint-darker">
                      #{order.orderId}
                    </span>

                    <span>
                      Mesa {order.tableId}
                    </span>

                    <span className="font-semibold">
                      {order.price}
                    </span>

                    <span>
                      {order.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-sm text-text-primary">
                  No hay pedidos para este periodo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrdersList;