import { createFileRoute } from "@tanstack/react-router";
import HistorySalesDetails from "../../components/salesHistory/HistorySalesDetails";

export const Route = createFileRoute("/(historySales)/historySalesDetails")({
  validateSearch: (search) => ({
    orderId: Number(search.orderId),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useSearch();
  return <HistorySalesDetails orderId={orderId} />;
}
