import { createFileRoute, useSearch } from "@tanstack/react-router";
import ReviewPlate from "../../components/reviewClient/ReviewPlate";

export const Route = createFileRoute("/(clientOrders)/reviewPlate")({
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
    from: "/(clientOrders)/reviewPlate",
  });

  if (!tableId) {
    return <p className="p-8">No se encontró la mesa del pedido.</p>;
  }

  return <ReviewPlate orderId={orderId} tableId={tableId} />;
}