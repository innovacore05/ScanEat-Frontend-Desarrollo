import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { SalesAnalytics } from "../../services/analyticsService";

export type SalesPeriod =
  | "Hoy"
  | "Esta semana"
  | "Último mes"
  | "Este año";

type SalesChartProps = {
  data: SalesAnalytics["salesByPeriod"];
  period: SalesPeriod;
  isLoading?: boolean;
};

function SalesChart({
  data,
  period,
  isLoading = false,
}: SalesChartProps) {
  const formatChartLabel = (label: string) => {
    if (period === "Hoy") {
      return label;
    }

    const date = new Date(`${label}T12:00:00`);

    if (period === "Este año") {
      return date.toLocaleDateString("es-CR", {
        month: "short",
      });
    }

    if (period === "Esta semana") {
      return date.toLocaleDateString("es-CR", {
        weekday: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("es-CR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <section className="min-w-0">
      <div className="flex justify-center text-sm font-bold text-text-primary">
        <span>Ventas de {period.toLowerCase()}</span>
      </div>

      <div className="mt-1 h-44 rounded-xl border border-border px-4 py-3">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-text-primary">
            Cargando ventas...
          </div>
        ) : data?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 14,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  formatChartLabel(String(value))
                }
              />

              <YAxis
                tick={{
                  fontSize: 14,
                }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickFormatter={(value) =>
                  `₡${Number(value).toLocaleString("es-CR")}`
                }
              />

              <Tooltip
                labelFormatter={(label) =>
                  formatChartLabel(String(label))
                }
                formatter={(value) => [
                  `₡${Number(value).toLocaleString("es-CR")}`,
                  "Ventas",
                ]}
              />

              <Bar
                dataKey="sales"
                fill="var(--color-mint-dark)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-text-primary">
            No hay datos de ventas para este periodo.
          </div>
        )}
      </div>
    </section>
  );
}

export default SalesChart;