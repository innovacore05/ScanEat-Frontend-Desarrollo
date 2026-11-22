import { createFileRoute } from "@tanstack/react-router";
import CheckOrder from "../../components/clientOrders/CheckOrder";

export const Route = createFileRoute("/(clientOrders)/checkOrder")({
  validateSearch: (search: Record<string, unknown>) => {
    const parsedOrderId = Number(search.orderId);

    return {
      mesaId:
        typeof search.mesaId === "string"
          ? search.mesaId
          : undefined,

      orderId:
        Number.isInteger(parsedOrderId) && parsedOrderId > 0
          ? parsedOrderId
          : undefined,

      mode: search.mode === "add" ? "add" : undefined,

      returnTo:
        search.returnTo === "cashier" ||
          search.returnTo === "waiter"
          ? search.returnTo
          : undefined,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <CheckOrder />;
}
