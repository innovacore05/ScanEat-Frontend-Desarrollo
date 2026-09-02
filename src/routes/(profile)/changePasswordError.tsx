import { createFileRoute } from "@tanstack/react-router";
import ChangePasswordError from "../../components/profile/ChangePasswordError";

export const Route = createFileRoute("/(profile)/changePasswordError")({
	component: ChangePasswordErrorPage,
});

function ChangePasswordErrorPage() {
	return <ChangePasswordError />;
}