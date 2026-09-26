import { createFileRoute } from "@tanstack/react-router";
import ThemeCustomizer from "../../components/theme/ThemeCustomizer";

export const Route = createFileRoute(
  "/(profile)/customization",
)({
  component: CustomizationPage,
});

function CustomizationPage() {
  return <ThemeCustomizer />;
}