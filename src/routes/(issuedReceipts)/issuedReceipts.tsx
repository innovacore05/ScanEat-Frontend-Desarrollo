import { createFileRoute } from "@tanstack/react-router";
import IssuedReceipts from "../../components/IssuedReceiptsHistory/IssuedReceipts";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(issuedReceipts)/issuedReceipts")({
	  beforeLoad: requireRole(1),
	component: IssuedReceiptsPage,
});

function IssuedReceiptsPage() {
	return <IssuedReceipts />;
}