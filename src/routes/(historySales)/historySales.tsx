import { createFileRoute } from '@tanstack/react-router'
import HistorySales from '../../components/salesHistory/HistorySales'

export const Route = createFileRoute('/(historySales)/historySales')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HistorySales />
}
