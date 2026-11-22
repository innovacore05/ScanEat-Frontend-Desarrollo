
import { createFileRoute } from "@tanstack/react-router";
import SelectOrderProducts from "../../components/cashierOrders/SelectOrderProducts";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute(
  "/(cashierOrders)/selectOrderProducts",
)({
  beforeLoad: requireRole(4),
  component: RouteComponent,
});

function RouteComponent() {
  return <SelectOrderProducts />;
}
