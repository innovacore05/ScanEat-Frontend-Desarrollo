import { createFileRoute, redirect } from "@tanstack/react-router";
import MenuClient from "../../components/menuClient/MenuClient";
import { getPublicTableNumber } from "../../services/tableService";

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

  beforeLoad: async ({ search }) => {
    if (!search.mesaId || !UUID_REGEX.test(search.mesaId)) {
        throw redirect({
            to: "/invalidTableScreen",
        });
    }

    try {
        await getPublicTableNumber(search.mesaId);
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "status" in error &&
            error.status === 404
        ) {
            throw redirect({
                to: "/invalidTableScreen",
            });
        }

        throw error;
    }
},

    component: RouteComponent,
});

function RouteComponent() {
    return <MenuClient />;
}