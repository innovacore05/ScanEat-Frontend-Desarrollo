import { createFileRoute } from '@tanstack/react-router'
import CheckOrder from '../../components/clientOrders/CheckOrder'

export const Route = createFileRoute('/(clientOrders)/checkOrder')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CheckOrder />
}
