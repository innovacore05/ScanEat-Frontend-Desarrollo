import { createFileRoute } from "@tanstack/react-router";
import EditMenu from "../components/menuAdmin/EditMenu";

export const Route = createFileRoute("/editMenu")({
	component: RouteComponent,
});

function RouteComponent() {
	return <EditMenu />;
}