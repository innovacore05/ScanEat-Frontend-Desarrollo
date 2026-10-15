import { createFileRoute } from "@tanstack/react-router";
import MenuClient from "../../components/menuClient/MenuClient";

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

    component: RouteComponent,
});

function RouteComponent() {
    return <MenuClient />;
}