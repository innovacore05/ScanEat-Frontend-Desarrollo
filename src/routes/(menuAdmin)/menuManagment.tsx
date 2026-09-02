import { createFileRoute } from '@tanstack/react-router'
import MenuManagment from '../../components/menuAdmin/MenuManagment'

export const Route = createFileRoute('/(menuAdmin)/menuManagment')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MenuManagment />
}
