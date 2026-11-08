import { createFileRoute } from "@tanstack/react-router";
import CategoryManagement from "../../components/menuAdmin/CategoryManagement";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(menuAdmin)/categoryManagement")({
  beforeLoad: requireRole(1),
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryManagement />;
}