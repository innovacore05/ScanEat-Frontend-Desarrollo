import { createFileRoute } from "@tanstack/react-router";
import SalesReport from "../../components/dashboard/SalesReport";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(dashboard)/salesReport")({
  beforeLoad: requireRole(1),
  component: SalesReport,
});
