import { createFileRoute } from "@tanstack/react-router";
import IssuedReceipts from "../../components/IssuedReceiptsHistory/IssuedReceipts";

export const Route = createFileRoute("/(issuedReceipts)/issuedReceipts")({
	component: IssuedReceiptsPage,
});

function IssuedReceiptsPage() {
	return <IssuedReceipts />;
}