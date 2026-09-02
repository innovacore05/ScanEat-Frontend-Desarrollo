import { createFileRoute } from "@tanstack/react-router";
import AddTable from "../../components/tableAdmin/AddTable";

export const Route = createFileRoute("/(tableAdmin)/Addtable")({
  component: AddTable,
});