import { createFileRoute } from "@tanstack/react-router";
import TablesManagment from "../../components/tableAdmin/TablesManagment";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(tableAdmin)/TablesManagment")({
  beforeLoad: requireRole(1, 3),
  component: TablesManagment,
});