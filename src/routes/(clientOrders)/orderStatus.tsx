import { createFileRoute, useSearch } from "@tanstack/react-router";
import OrderStatus from "../../components/clientOrders/OrderStatus";

export const Route = createFileRoute("/(clientOrders)/orderStatus")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: Number(search.orderId),
    tableId: typeof search.tableId === "string"
      ? search.tableId
      : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId, tableId } = useSearch({
    from: "/(clientOrders)/orderStatus",
  });

  return <OrderStatus orderId={orderId} tableId={tableId} />;
}
