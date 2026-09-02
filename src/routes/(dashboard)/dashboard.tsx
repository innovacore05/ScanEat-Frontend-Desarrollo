import { createFileRoute } from "@tanstack/react-router";
import DashboardForm from "../../components/dashboard/DashboardForm";

export const Route = createFileRoute("/(dashboard)/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	return <DashboardForm />;
}