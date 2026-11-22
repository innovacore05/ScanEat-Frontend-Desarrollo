import { createFileRoute } from "@tanstack/react-router";
import CategoryForm from "../../components/menuAdmin/CategoryForm";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(menuAdmin)/categoryForm")({
    validateSearch: (search) => ({
        mode: search.mode as "create" | "edit" | undefined,
        categoryId: search.categoryId
            ? Number(search.categoryId)
            : undefined,
    }),
    beforeLoad: requireRole(1),
    component: RouteComponent,
});

function RouteComponent() {
    return <CategoryForm />;
}