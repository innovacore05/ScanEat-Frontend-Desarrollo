import { createFileRoute } from "@tanstack/react-router";
import ProfileSettingsForm from "../../components/profile/ProfileSettingsForm";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute("/(profile)/profileSettings")({
	  beforeLoad: requireRole(1),
	component: ProfileSettingsPage,
});

function ProfileSettingsPage() {
	return <ProfileSettingsForm />;
}