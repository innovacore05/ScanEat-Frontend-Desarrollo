import { createFileRoute } from '@tanstack/react-router'
import CustomDishForm from '../../components/menuAdmin/CustomDishForm';
export const Route = createFileRoute('/(menuAdmin)/customDishForm')({
  validateSearch: (search) => ({
    mode: search.mode === "edit" ? "edit" : "create",
    productId: search.productId ? Number(search.productId) : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { mode, productId } = Route.useSearch();

  return <CustomDishForm mode={mode} productId={productId} />;
}
