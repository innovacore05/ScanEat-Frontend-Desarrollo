import { createFileRoute } from "@tanstack/react-router";
import Expenses from "../../components/dashboard/Expenses";

export const Route = createFileRoute("/(dashboard)/expenses")({
  component: Expenses,
});
