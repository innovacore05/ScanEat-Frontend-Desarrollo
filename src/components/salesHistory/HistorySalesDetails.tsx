import { useEffect, useState } from "react";
import DashboardLayoutAdmin from "../layout/DashboardLayoutAdmin";
import OrderDetails from "../Orders/OrderDetails";
import type { Order } from "../Orders/OrderCard";
import Skeleton from "../shared/Skeleton";
import { getOrders } from "../../services/orderService";

type HistorySalesDetailsProps = {
  orderId: number;
};

function HistorySalesDetails({ orderId }: HistorySalesDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);

      try {
        const orders = await getOrders("paid");
        setOrder(orders.find((item) => item.orderId === orderId) ?? null);
      } catch (error) {
        console.error("No se pudo cargar la orden del historial:", error);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <DashboardLayoutAdmin>
        <main className="min-h-screen bg-white px-6 py-8">
          <Skeleton className="mb-6 h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </main>
      </DashboardLayoutAdmin>
    );
  }

  if (!order) {
    return (
      <DashboardLayoutAdmin>
        <main className="min-h-screen bg-white px-6 py-8">
          <p className="font-semibold text-text-primary">Orden no encontrada</p>
        </main>
      </DashboardLayoutAdmin>
    );
  }

  return (
    <OrderDetails
      order={order}
      Layout={DashboardLayoutAdmin}
      mobileBackRoute="/historySales"
      showConfirmButton={false}
    />
  );
}

export default HistorySalesDetails;
