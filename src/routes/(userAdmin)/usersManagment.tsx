import { createFileRoute } from "@tanstack/react-router";
import UsersManagement from "../../components/userAdmin/UsersManagement";

export const Route = createFileRoute("/(userAdmin)/usersManagment")({
	component: UsersManagement,
});
