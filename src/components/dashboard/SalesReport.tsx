import { useEffect, useState } from "react";
import { FiDownload, FiRefreshCw, FiCpu, FiCheckCircle } from "react-icons/fi";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, } from "recharts";
import DashboardLayout from "../layout/DashboardLayout";
import { getProfile, getStoredFirstName } from "../../services/authService";
import { getOrders } from "../../services/orderService";
import { generateAISalesReport } from "../../services/aiService";
import type { SalesAnalytics } from "../../services/analyticsService";
import { getSalesAnalytics } from "../../services/analyticsService";

//Este tipo de datos define los periodos de tiempo que se pueden seleccionar para el reporte de ventas.
type SalesPeriod = | "Hoy"
  | "Esta semana"
  | "Último mes"
  | "Este año";

//Este objeto mapea los periodos de tiempo a los valores que se envían a la API para obtener los datos del reporte de ventas.
const periodToApiValue: Record<SalesPeriod, "today" | "week" | "month" | "year"
> = {
  Hoy: "today",
  "Esta semana": "week",
  "Último mes": "month",
  "Este año": "year",
};


function SalesReport() {
  const [firstName, setFirstName] = useState(getStoredFirstName);
  const [period, setPeriod] = useState<SalesPeriod>("Hoy");
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getOrders>>>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [aiReport, setAiReport] = useState<{
    summary: string;
    bestProduct: string;
    peakHours: string;
    cancellations: string;
    recommendation: string;
  } | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  //Esta función genera un nuevo reporte de ventas utilizando inteligencia artificial.
  //Se llama cuando el usuario hace clic en el botón "Generar nuevo reporte".
  const generateAIReport = async () => {
    try {
      setIsGeneratingAI(true);

      const response = await generateAISalesReport(
        periodToApiValue[period],
      );

      setAiReport(response.report);
    } catch (error) {
      console.error("Error generando reporte con IA:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setFirstName(data.user.firstName);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    void loadProfile();
  }, []);

  //Este efecto se ejecuta cada vez que el periodo de tiempo seleccionado cambia.
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const data = await getSalesAnalytics(periodToApiValue[period]);
        setAnalytics(data);
      } catch (error) {
        console.error("Error loading sales analytics:", error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    void loadAnalytics();
  }, [period]);

  //  Este efecto de cargar ordenes se ejecuta cada vez que el periodo de tiempo seleccionado cambia.
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoadingOrders(true);

      try {
        const data = await getOrders("paid");

        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (period === "Hoy") {
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);

          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
        } else if (period === "Esta semana") {
          startDate = new Date(now);

          const day = startDate.getDay();
          const daysFromMonday = day === 0 ? 6 : day - 1;

          startDate.setDate(
            startDate.getDate() - daysFromMonday,
          );
          startDate.setHours(0, 0, 0, 0);

          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
        } else if (period === "Último mes") {
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
            0,
            0,
            0,
            0,
          );

          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1,
            0,
            0,
            0,
            0,
          );
        } else {
          startDate = new Date(
            now.getFullYear(),
            0,
            1,
            0,
            0,
            0,
            0,
          );

          endDate = new Date(
            now.getFullYear() + 1,
            0,
            1,
            0,
            0,
            0,
            0,
          );
        }

        const filteredOrders = data.filter((order) => {
          if (!order.paidAt) {
            return false;
          }

          const orderDate = new Date(order.paidAt);

          return (
            orderDate >= startDate &&
            orderDate < endDate
          );
        });

        setOrders(filteredOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    void loadOrders();
  }, [period]);

  //Este efecto se ejecuta cada vez que el periodo de tiempo seleccionado cambia.
  useEffect(() => {
    const loadAIReport = async () => {
      try {
        setIsGeneratingAI(true);
        setAiReport(null);

        const response = await generateAISalesReport(
          periodToApiValue[period],
        );

        setAiReport(response.report);
      } catch (error) {
        console.error("Error generando reporte con IA:", error);
        setAiReport(null);
      } finally {
        setIsGeneratingAI(false);
      }
    };

    void loadAIReport();
  }, [period]);

  //Esta función se llama cuando el usuario selecciona un nuevo periodo de tiempo para el reporte de ventas.
  const handlePeriodChange = (option: SalesPeriod) => {
    setPeriod(option);
  };

  //Esta función formatea las etiquetas del eje X del gráfico de barras según el periodo de tiempo seleccionado.
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
    <DashboardLayout>
      <section className="px-6 py-8 lg:px-15 lg:py-15">
        <div className="w-full">
          <div className="rounded-2xl bg-mint-dark px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              ¡Hola, {firstName || "Usuario"}!
            </h1>
          </div>

          <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-mint-dark">
                Reporte de ventas
              </h2>
            </div>
          </div>

          {/* Filtros y gráfico */}
          <div className="mt-5 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">

            <section className="flex flex-col">
              <p className="text-sm font-semibold leading-5 text-text-primary">
                Filtrar
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {(["Hoy", "Esta semana", "Último mes", "Este año"] as SalesPeriod[]).map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handlePeriodChange(option)}
                      className={`rounded border px-3 py-1 text-xs transition ${period === option
                        ? "border-mint-dark bg-mint-dark font-semibold text-white"
                        : "border-mint-dark text-mint-darker hover:bg-mint-light"
                        }`}
                    >
                      {option}
                    </button>
                  ),
                )}
              </div>


              <div className="mt-6 grid w-full grid-cols-3 items-start gap-2 rounded-xl bg-mint-dark px-4 py-4 text-center text-white">
                <div className="min-w-0">
                  <p className="whitespace-nowrap text-sm leading-5">Ventas totales</p>
                  <p className="mt-2 text-sm font-semibold leading-5">
                    {isLoadingAnalytics
                      ? "..."
                      : `₡${(analytics?.summary.totalSales ?? 0).toLocaleString("es-CR")}`}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="whitespace-nowrap text-sm leading-5">Pedidos</p>
                  <p className="mt-2 text-sm font-semibold leading-5">
                    {isLoadingAnalytics
                      ? "..."
                      : analytics?.summary.totalOrders ?? 0}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="whitespace-nowrap text-sm leading-5">Cancelados</p>
                  <p className="mt-2 text-sm font-semibold leading-5">
                    {isLoadingAnalytics
                      ? "..."
                      : analytics?.cancellations.total ?? 0}
                  </p>
                </div>
              </div>
            </section>

            {/* Gráfico */}
            <section className="min-w-0">
              <div className="flex justify-center text-sm font-bold text-text-primary">
                <span>Ventas de {period.toLowerCase()}</span>
              </div>

              <div className="mt-1 h-44 rounded-xl border border-border px-4 py-3">
                {isLoadingAnalytics ? (
                  <div className="flex h-full w-full items-center justify-center text-sm text-text-primary">
                    Cargando ventas...
                  </div>
                ) : analytics?.salesByPeriod?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.salesByPeriod}
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
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => formatChartLabel(String(value))}
                      />

                      <YAxis
                        tick={{
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={65}
                        tickFormatter={(value) =>
                          `₡${Number(value).toLocaleString("es-CR")}`
                        }
                      />

                      <Tooltip
                        labelFormatter={(label) => formatChartLabel(String(label))}
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
          </div>

          {/* Esta es la parte de el reporte de la IA*/}
          <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
            {/* Header IA */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-mint-dark px-5 py-5 text-white lg:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <FiCpu className="h-6 w-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">
                      Análisis inteligente
                    </h2>

                    <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                      IA
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-white/75">
                    Resumen generado a partir de tus datos de ventas
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={generateAIReport}
                disabled={isGeneratingAI}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-mint-darker transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FiRefreshCw
                  className={isGeneratingAI ? "animate-spin" : ""}
                />

                {isGeneratingAI
                  ? "Generando reporte..."
                  : "Generar nuevo reporte"}
              </button>
            </div>

            {/* Este es el mensaje de carga */}
            <div className="p-5 lg:p-7">

              {isGeneratingAI ? (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-light">
                    <FiCpu className="h-7 w-7 animate-pulse text-mint-dark" />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-mint-dark">
                    Analizando tus ventas...
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-text-primary">
                    La inteligencia artificial está revisando el comportamiento
                    de tus pedidos para generar un nuevo análisis.
                  </p>

                  <div className="mt-4 flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mint-dark" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mint-dark [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mint-dark [animation-delay:300ms]" />
                  </div>
                </div>
              ) : aiReport ? (
                <>
                  {/* Aquí si va el contenido del reporte de la IA */}
                  <div className="mb-5 flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-xs text-mint-darker">
                    <FiCheckCircle className="h-4 w-4" />

                    <span>
                      Análisis generado para el periodo:{" "}
                      <strong>{period}</strong>
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <article className="rounded-xl border border-border p-4 transition hover:border-mint-dark">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold text-mint-dark">
                          01
                        </span>

                        <h3 className="text-sm font-bold text-mint-dark">
                          Resumen de ventas
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-5 text-text-primary">
                        {aiReport.summary}
                      </p>
                    </article>

                    <article className="rounded-xl border border-border p-4 transition hover:border-mint-dark">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold text-mint-dark">
                          02
                        </span>

                        <h3 className="text-sm font-bold text-mint-dark">
                          Producto más vendido
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-5 text-text-primary">
                        {aiReport.bestProduct}
                      </p>
                    </article>

                    <article className="rounded-xl border border-border p-4 transition hover:border-mint-dark">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold text-mint-dark">
                          03
                        </span>

                        <h3 className="text-sm font-bold text-mint-dark">
                          Horas pico
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-5 text-text-primary">
                        {aiReport.peakHours}
                      </p>
                    </article>

                    <article className="rounded-xl border border-border p-4 transition hover:border-mint-dark">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold text-mint-dark">
                          04
                        </span>

                        <h3 className="text-sm font-bold text-mint-dark">
                          Pedidos cancelados
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-5 text-text-primary">
                        {aiReport.cancellations}
                      </p>
                    </article>
                  </div>

                  <div className="mt-4 rounded-xl bg-mint-dark px-5 py-4 text-white">
                    <div className="flex items-center gap-2">
                      <FiCpu className="h-4 w-4" />

                      <h3 className="text-sm font-bold">
                        Recomendación de IA
                      </h3>
                    </div>

                    <p className="mt-2 text-sm leading-5 text-white/90">
                      {aiReport.recommendation}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-light">
                    <FiCpu className="h-7 w-7 text-mint-dark" />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-mint-dark">
                    Genera tu análisis de ventas
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-text-primary">
                    Haz clic en "Generar nuevo reporte" para obtener
                    un análisis de tus ventas con inteligencia artificial.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/*Aquí es la parte de las ordenes*/}
          <section className="mt-6 rounded-2xl border border-border bg-white p-5 lg:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-text-primary">{period}</p>

                <h2 className="text-xl font-bold text-mint-darker">
                  Detalle de pedidos
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-mint-dark px-3 py-2 text-xs font-semibold text-mint-darker transition hover:bg-mint-light"
                >
                  <FiDownload />

                  Exportar
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-border">
              <div className="min-w-145">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center bg-neutral-100 px-4 py-3 text-sm font-semibold text-text-primary">
                  <span>Orden</span>
                  <span>Mesa</span>
                  <span>Total</span>
                  <span>Hora</span>
                </div>

                <div className="text-sm text-text-primary">
                  <div className="max-h-80 overflow-y-auto">
                    {isLoadingOrders ? (
                      <div className="px-4 py-5 text-sm text-text-primary">
                        Cargando pedidos...
                      </div>
                    ) : orders.length > 0 ? (
                      orders.map((order) => (
                        <div
                          key={order.orderId}
                          className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center border-t border-border px-4 py-4 text-sm text-text-primary"
                        >
                          <span className="font-semibold text-mint-darker">
                            #{order.orderId}
                          </span>

                          <span>
                            Mesa {order.tableId}
                          </span>

                          <span className="font-semibold">
                            {order.price}
                          </span>

                          <span>
                            {order.time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-5 text-sm text-text-primary">
                        No hay pedidos para este periodo.
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </div>
          </section>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default SalesReport;
