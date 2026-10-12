import { useEffect, useState } from "react";
import { GiRoundTable } from "react-icons/gi";
import { getOrders } from "../../services/orderService";

function PendingTables() {
  const [tables, setTables] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPendingTables = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const orders = await getOrders("pending");

        const tableNumbers = [
          ...new Set(orders.map((order) => order.tableId)),
        ].sort((a, b) => a - b);

        setTables(tableNumbers);
      } catch (error) {
        console.error("Error cargando las mesas pendientes:", error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPendingTables();
  }, []);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h2 className="text-base font-semibold text-black">
        Mesas pendientes
      </h2>

      <div className="flex min-h-28 flex-col rounded-xl bg-mint-dark p-4">
        {isLoading ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-white">
            Cargando mesas...
          </p>
        ) : error ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-white">
            No se pudieron cargar las mesas.
          </p>
        ) : tables.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-white">
            No hay mesas con pedidos pendientes.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-y-4">
            {tables.map((tableNumber, index) => (
              <div
                key={tableNumber}
                className={`flex min-w-0 flex-col items-center gap-2 px-2 ${
                  index === 0
                    ? "border-r border-white"
                    : ""
                }`}
              >
                <GiRoundTable className="h-10 w-10 rounded-xl bg-white/20 p-1 text-white" />

                <p className="text-lg font-semibold text-white">
                  {tableNumber}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingTables;
