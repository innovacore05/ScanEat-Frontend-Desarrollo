import { createFileRoute } from '@tanstack/react-router'
import CheckOrder from '../../components/menuClient/CheckOrder'

export const Route = createFileRoute('/(menuClient)/checkOrder')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CheckOrder />
}
