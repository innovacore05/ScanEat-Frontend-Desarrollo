import { createFileRoute, redirect } from "@tanstack/react-router";
import MenuClient from "../../components/menuClient/MenuClient";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/(menuClient)/menuClient")({
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

   beforeLoad: ({ search }) => {
    if (!search.mesaId || !UUID_REGEX.test(search.mesaId)) {
      throw redirect({
        to: "/invalidTableScreen",
      });
    }
  },

  component: RouteComponent,
});

function RouteComponent() {
  return <MenuClient />;
}