import { createFileRoute } from '@tanstack/react-router'
import MenuWaiter from '../../components/menuWaiter/menuWaiter'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(menuWaiter)/menuWaiter')({
  beforeLoad: requireRole(3),
  component: RouteComponent,
})

function RouteComponent() {
  return <MenuWaiter />
}
