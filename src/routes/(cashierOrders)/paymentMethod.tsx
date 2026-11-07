import { createFileRoute } from '@tanstack/react-router'
import PaymentMethod from '../../components/cashierOrders/PaymentMethod'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(cashierOrders)/paymentMethod')({
  beforeLoad: requireRole(4),
  component: RouteComponent,
})

function RouteComponent() {
  return <PaymentMethod />
}