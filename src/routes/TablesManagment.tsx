import { createFileRoute } from "@tanstack/react-router";
import TablesManagment from "../components/tableAdmin/TablesManagment";

export const Route = createFileRoute("/TablesManagment")({
  component: TablesManagment,
});