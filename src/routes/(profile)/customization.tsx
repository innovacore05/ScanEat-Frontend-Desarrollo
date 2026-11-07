import { createFileRoute } from "@tanstack/react-router";
import ThemeCustomizer from "../../components/theme/ThemeCustomizer";
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute(
  "/(profile)/customization",
)({
  beforeLoad: requireRole(1),
  component: CustomizationPage,
});

function CustomizationPage() {
  return <ThemeCustomizer />;
}