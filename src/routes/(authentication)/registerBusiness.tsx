import { createFileRoute } from "@tanstack/react-router";
import RegisterBusiness from "../../components/authentication/RegisterBusiness";

export const Route = createFileRoute("/(authentication)/registerBusiness")({
	component: RegisterPage,
});

function RegisterPage() {
	return <RegisterBusiness />;
}