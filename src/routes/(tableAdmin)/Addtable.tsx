import { createFileRoute } from "@tanstack/react-router";
import AddTable from "../../components/tableAdmin/AddTable";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(tableAdmin)/Addtable")({
  beforeLoad: requireRole(1),
  component: AddTable,
});