
import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import DataSummary from "./DataSummary";
import PendingTables from "./PendingTables";
import FavoritesToday from "./FavoritesToday";
import SalesChart, {type SalesPeriod,} from "../../components/sales/SalesChart";
import OrdersList from "../../components/sales/OrdersList";
import {getProfile, getStoredFirstName,} from "../../services/authService";
import { getOrders } from "../../services/orderService";
import {getSalesAnalytics, type SalesAnalytics,} from "../../services/analyticsService";

const periodToApiValue: Record< SalesPeriod, "today" | "week" | "month" | "year"
> = {
  Hoy: "today",
  "Esta semana": "week",
  "Último mes": "month",
  "Este año": "year",
};

function DashboardForm() {
  const [firstName, setFirstName] = useState(getStoredFirstName);
  const [period] = useState<SalesPeriod>("Esta semana");

  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [orders, setOrders] = useState< Awaited<ReturnType<typeof getOrders>>>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

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

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoadingOrders(true);

      try {
        const data = await getOrders("paid");

        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const filteredOrders = data.filter((order) => {
          if (!order.paidAt) return false;

          const orderDate = new Date(order.paidAt);
          return orderDate >= startDate && orderDate < endDate;
        });

        setOrders(filteredOrders);
      } catch (error) {
        console.error("Error loading today's orders:", error);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    void loadOrders();
  }, []);

  return (
    <DashboardLayout>
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 rounded-2xl bg-mint-dark px-5 py-5 sm:px-8 sm:py-6">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            ¡Hola, {firstName || "Usuario"}!
          </h1>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2 xl:gap-6">
          <div className="flex min-w-0 flex-col gap-5">
            <DataSummary />
            <PendingTables />
            <FavoritesToday />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="min-w-0 rounded-xl bg-white">
              <SalesChart
                data={analytics?.salesByPeriod ?? []}
                period={period}
                isLoading={isLoadingAnalytics}
              />
            </div>

            <div className="flex min-w-0 flex-col mt-3">
    <h2 className="text-base font-semibold text-black">
      Ventas del día
    </h2>

    <OrdersList
      orders={orders}
      period="Hoy"
      isLoading={isLoadingOrders}
      showExportButton={false}
    />
  </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default DashboardForm;