import { createFileRoute } from '@tanstack/react-router'
import CustomDishForm from '../../components/menuAdmin/CustomDishForm';
export const Route = createFileRoute('/(menuAdmin)/customDishForm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CustomDishForm/>
}

