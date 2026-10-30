
import { createFileRoute } from "@tanstack/react-router";
import SelectOrderProducts from "../../components/cashierOrders/SelectOrderProducts";

export const Route = createFileRoute(
  "/(cashierOrders)/selectOrderProducts",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <SelectOrderProducts />;
}
