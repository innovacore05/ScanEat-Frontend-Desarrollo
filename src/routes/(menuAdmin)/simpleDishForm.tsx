import { createFileRoute } from "@tanstack/react-router";
import SimpleDishForm from "../../components/menuAdmin/SimpleDishForm";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(menuAdmin)/simpleDishForm")({
    validateSearch: (search) => ({
        mode: search.mode === "edit" ? "edit" : "create",
        productId: search.productId ? Number(search.productId) : undefined,
    }),
    beforeLoad: requireRole(1),
    component: SimpleDishFormPage,
});

function SimpleDishFormPage() {
    const { mode, productId } = Route.useSearch();

    return <SimpleDishForm mode={mode} productId={productId} />;
}