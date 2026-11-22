import { createFileRoute } from "@tanstack/react-router";
import EditMenu from "../../components/menuAdmin/EditMenu";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(menuAdmin)/editMenu")({
	  beforeLoad: requireRole(1),
	component: RouteComponent,
});

function RouteComponent() {
	return <EditMenu />;
}