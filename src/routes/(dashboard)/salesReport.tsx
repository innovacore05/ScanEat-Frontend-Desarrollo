import { createFileRoute } from "@tanstack/react-router";
import SalesReport from "../../components/dashboard/SalesReport";

export const Route = createFileRoute("/(dashboard)/salesReport")({
  component: SalesReport,
});
