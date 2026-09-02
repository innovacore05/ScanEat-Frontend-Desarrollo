import { createFileRoute } from "@tanstack/react-router";
import SimpleDishForm from "../../components/menuAdmin/SimpleDishForm";

export const Route = createFileRoute("/(menuAdmin)/simpleDishForm")({
    validateSearch: (search) => ({
        mode: search.mode === "edit" ? "edit" : "create",
        productId: search.productId ? Number(search.productId) : undefined,
    }),
    component: SimpleDishFormPage,
});

function SimpleDishFormPage() {
    const { mode, productId } = Route.useSearch();

    return <SimpleDishForm mode={mode} productId={productId} />;
}