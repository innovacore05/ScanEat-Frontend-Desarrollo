import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import WaiterOrderDetails from "../../components/Orders/OrderDetails";
import { getOrders } from "../../services/orderService";
import type { Order } from "../../components/waiterOrders/WaiterOrderCard";

export const Route = createFileRoute("/(waiterOrders)/waiterOrderDetails",)({
  validateSearch: (search) => ({
    orderId: Number(search.orderId),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);

  const loadOrder = async () => {
    try {
      const orders = await getOrders();
      const selected = orders.find((item) => item.orderId === orderId) ?? null;
      setOrder(selected);
    } catch (error) {
      console.error("No se pudo cargar la orden:", error);
      setOrder(null);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  if (!order) {
    return <p>Orden no encontrada</p>;
  }

  return <WaiterOrderDetails order={order} onStatusChanged={loadOrder} />;
}