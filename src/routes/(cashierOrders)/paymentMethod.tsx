import { createFileRoute } from '@tanstack/react-router'
import PaymentMethod from '../../components/cashierOrders/PaymentMethod'

export const Route = createFileRoute('/(cashierOrders)/paymentMethod')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PaymentMethod />
}