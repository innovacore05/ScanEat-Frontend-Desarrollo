import { createFileRoute } from '@tanstack/react-router'
import MenuClient from '../../components/menuClient/MenuClient'

export const Route = createFileRoute('/(menuClient)/menuClient')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MenuClient />
}
