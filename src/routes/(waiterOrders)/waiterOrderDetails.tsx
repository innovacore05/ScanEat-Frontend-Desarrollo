import { createFileRoute } from "@tanstack/react-router";
import WaiterOrderDetails from "../../components/Orders/OrderDetails";
import { orders } from "../../components/waiterOrders/mockOrders";

export const Route = createFileRoute("/(waiterOrders)/waiterOrderDetails",)({
  validateSearch: (search) => ({
    orderId: Number(search.orderId),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useSearch();

  const order = orders.find((order) => order.orderId === orderId);

  if (!order) {
    return <p>Orden no encontrada</p>;
  }

  return <WaiterOrderDetails order={order} />;
}