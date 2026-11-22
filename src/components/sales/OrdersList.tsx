
import { FiDownload } from "react-icons/fi";
import { getOrders } from "../../services/orderService";
import Skeleton from "../shared/Skeleton";

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
  const handleExport = () => {
    if (isLoading || orders.length === 0) return;

    // Al tocar el botón de exportar, se genera un archivo CSV con los pedidos pagados del periodo seleccionado.
    // Preparar los encabezados y las filas del archivo CSV.
    const headers = ["Orden", "Mesa", "Total", "Hora"];

    const rows = orders.map((order) => [
      `#${order.orderId}`,
      `Mesa ${order.tableId}`,
      order.price,
      order.time,
    ]);

    // Escapar comillas y campos que contienen comas o saltos de línea.
    const escapeCsvValue = (value: unknown) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvContent = [headers, ...rows]
  .map((row) => row.map(escapeCsvValue).join(","))
  .join("\r\n");

    // BOM para facilitar la lectura de caracteres especiales en Excel.
    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safePeriod = period
      .trim()
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, "_");

    link.href = url;
    link.download = `pedidos_${safePeriod || "exportacion"}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-3 rounded-2xl border border-border bg-white p-5 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-text-primary">{period}</p>

          <h2 className="text-base font-semibold text-black">
            Pedidos pagados
          </h2>
        </div>

        {showExportButton && (
          <div className="flex gap-2 ">
            <button
              type="button"
              onClick={handleExport}
              disabled={isLoading || orders.length === 0}
              className="flex items-center gap-2 rounded-xl border border-mint-dark px-3 py-2 text-sm font-semibold text-mint-darker transition hover:bg-mint-darker/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload />
              Exportar
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border scrollbar-thin scrollbar-thumb-mint-darker/75 scrollbar-track-mint-dark/20">
        <div className="min-w-145">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center  bg-neutral-100 px-4 py-3 text-sm font-semibold text-text-primary">
            <span>Orden</span>
            <span>Mesa</span>
            <span>Total</span>
            <span>Hora</span>
          </div>

          <div className="text-sm text-text-primary">
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 px-4 py-5">
                  {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
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

                    <span>Mesa {order.tableId}</span>

                    <span className="font-semibold">{order.price}</span>

                    <span>{order.time}</span>
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