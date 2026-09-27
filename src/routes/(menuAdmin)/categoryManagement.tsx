import { createFileRoute } from "@tanstack/react-router";
import CategoryManagement from "../../components/menuAdmin/CategoryManagement";

export const Route = createFileRoute("/(menuAdmin)/categoryManagement")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryManagement />;
}