import { createFileRoute, useSearch } from "@tanstack/react-router";
import OrderStatus from "../../components/clientOrders/OrderStatus";

export const Route = createFileRoute("/(clientOrders)/orderStatus")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: Number(search.orderId),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = useSearch({
    from: "/(clientOrders)/orderStatus",
  });

  return <OrderStatus orderId={orderId} />;
}
