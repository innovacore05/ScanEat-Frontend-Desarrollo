import { createFileRoute } from '@tanstack/react-router'
import MenuWaiter from '../../components/menuWaiter/menuWaiter'

export const Route = createFileRoute('/(menuWaiter)/menuWaiter')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MenuWaiter />
}
