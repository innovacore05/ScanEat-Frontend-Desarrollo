import { createFileRoute } from "@tanstack/react-router";
import Expenses from "../../components/dashboard/Expenses";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(dashboard)/expenses")({
  beforeLoad: requireRole(1),
  component: Expenses,
});
