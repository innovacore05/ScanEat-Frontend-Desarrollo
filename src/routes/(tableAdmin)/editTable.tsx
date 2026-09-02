import { createFileRoute } from "@tanstack/react-router";
import EditTable from "../../components/tableAdmin/EditTable";

export const Route = createFileRoute("/(tableAdmin)/editTable")({
  validateSearch: (search: Record<string, unknown>) => ({
    tableId: typeof search.tableId === "string" ? search.tableId : undefined,
  }),
  component: EditTable,
});
