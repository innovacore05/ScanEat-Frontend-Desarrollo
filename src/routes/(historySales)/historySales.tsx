import { createFileRoute } from '@tanstack/react-router'
import HistorySales from '../../components/salesHistory/HistorySales'
import { requireRole } from "../-routeGuards";

export const Route = createFileRoute('/(historySales)/historySales')({
    beforeLoad: requireRole(1),
  component: RouteComponent,
})

function RouteComponent() {
  return <HistorySales />
}
