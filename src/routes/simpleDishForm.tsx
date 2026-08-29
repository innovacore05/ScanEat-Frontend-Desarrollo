import { createFileRoute } from "@tanstack/react-router";
import SimpleDishForm from "../components/menuAdmin/SimpleDishForm";

export const Route = createFileRoute("/simpleDishForm")({
    component: SimpleDishFormPage,
});

function SimpleDishFormPage() {
    return <SimpleDishForm />;
}