import { createFileRoute } from "@tanstack/react-router";
import UsersManagement from "../../components/userAdmin/UsersManagement";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(userAdmin)/usersManagment")({
	beforeLoad: requireRole(1),
	component: UsersManagement,
});
