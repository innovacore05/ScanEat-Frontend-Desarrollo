import { createFileRoute } from "@tanstack/react-router";
import InvalidTableScreen from "../../components/shared/InvalidTableScreen";

export const Route = createFileRoute("/(menuClient)/invalidTableScreen")({
  component: InvalidTableScreen,
});
