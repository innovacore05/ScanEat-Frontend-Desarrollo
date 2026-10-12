import { useEffect, useState } from "react";
import { getSalesAnalytics } from "../../services/analyticsService";
import type { SalesAnalytics } from "../../services/analyticsService";
import { getOrders } from "../../services/orderService";

function DataSummary() {
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [occupiedTables, setOccupiedTables] = useState(0);
  const [ordersInKitchen, setOrdersInKitchen] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const [
          salesData,
          pendingOrders,
          preparingOrders,
          readyOrders,
          deliveredOrders,
        ] = await Promise.all([
          getSalesAnalytics("today"),
          getOrders("pending"),
          getOrders("preparing"),
          getOrders("ready"),
          getOrders("delivered"),
        ]);

        setAnalytics(salesData);

        // Mesas con pedidos activos, sin contar una mesa más de una vez.
        const activeTableIds = new Set([
          ...pendingOrders.map((order) => order.tableId),
          ...preparingOrders.map((order) => order.tableId),
          ...readyOrders.map((order) => order.tableId),
          ...deliveredOrders.map((order) => order.tableId),
        ]);

        setOccupiedTables(activeTableIds.size);

        setOccupiedTables(activeTableIds.size);

        // Cantidad de pedidos que están en preparación.
        setOrdersInKitchen(preparingOrders.length);
      } catch (error) {
        console.error("Error cargando el resumen del dashboard:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const summary = analytics?.summary;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-neutral-50 p-3 sm:p-4">
        <h2 className="text-sm sm:text-base">Ventas hoy</h2>
        <p className="text-xl font-bold text-mint-dark sm:text-2xl">
          {isLoading
            ? "Cargando..."
            : hasError
              ? "—"
              : `₡${(summary?.totalSales ?? 0).toLocaleString("es-CR")}`}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-neutral-50 p-3 sm:p-4">
        <h2 className="text-sm sm:text-base">Órdenes hoy</h2>
        <p className="text-xl font-bold text-mint-dark sm:text-2xl">
          {isLoading
            ? "Cargando..."
            : hasError
              ? "—"
              : summary?.totalOrders ?? 0}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-neutral-50 p-3 sm:p-4">
        <h2 className="text-sm sm:text-base">Mesas ocupadas</h2>
        <p className="text-xl font-bold text-mint-dark sm:text-2xl">
          {isLoading ? "Cargando..." : hasError ? "—" : occupiedTables}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-neutral-50 p-3 sm:p-4">
        <h2 className="text-sm sm:text-base">En cocina</h2>
        <p className="text-xl font-bold text-mint-dark sm:text-2xl">
          {isLoading ? "Cargando..." : hasError ? "—" : ordersInKitchen}
        </p>
      </div>
    </div>
  );
}

export default DataSummary;
