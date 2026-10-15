import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import WaiterOrderDetails from "../../components/Orders/OrderDetails";
import { getOrders } from "../../services/orderService";
import type { Order } from "../../components/Orders/OrderCard";
import Skeleton from "../../components/shared/Skeleton";

export const Route = createFileRoute("/(waiterOrders)/waiterOrderDetails",)({
  validateSearch: (search) => ({
    orderId: Number(search.orderId),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrder = async () => {
    setIsLoading(true);

    try {
      const orders = await getOrders();
      const selected = orders.find((item) => item.orderId === orderId) ?? null;
      setOrder(selected);
    } catch (error) {
      console.error("No se pudo cargar la orden:", error);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white p-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </main>
    );
  }

  if (!order) {
    return <p>Orden no encontrada</p>;
  }

  return (
    <WaiterOrderDetails
      order={order}
      onStatusChanged={loadOrder}
      canAddProducts
    />
  );
}
