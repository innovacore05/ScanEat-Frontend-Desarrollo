import { createFileRoute } from "@tanstack/react-router";
import EditTable from "../../components/tableAdmin/EditTable";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(tableAdmin)/editTable")({
  validateSearch: (search: Record<string, unknown>) => ({
    tableId: typeof search.tableId === "string" ? search.tableId : undefined,
  }),
  beforeLoad: requireRole(1),
  component: EditTable,
});
