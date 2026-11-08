import { createFileRoute } from "@tanstack/react-router";
import HistorySalesDetails from "../../components/salesHistory/HistorySalesDetails";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(historySales)/historySalesDetails")({
  validateSearch: (search) => ({
    orderId: Number(search.orderId),
  }),
  beforeLoad: requireRole(1),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useSearch();
  return <HistorySalesDetails orderId={orderId} />;
}
