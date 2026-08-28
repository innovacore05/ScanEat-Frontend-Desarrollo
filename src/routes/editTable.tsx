import { createFileRoute } from "@tanstack/react-router";
import EditTable from "../components/tableAdmin/EditTable";

export const Route = createFileRoute("/editTable")({
  component: EditTable,
});