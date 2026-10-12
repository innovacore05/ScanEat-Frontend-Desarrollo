import { createFileRoute } from "@tanstack/react-router";
import DiscountProducts from "../../components/menu/DiscountProducts";

export const Route = createFileRoute("/(menu)/discountProducts")({
	component: DiscountProducts,
});
