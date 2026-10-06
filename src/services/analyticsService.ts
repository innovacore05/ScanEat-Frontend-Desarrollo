import {
  buildUrl,
  cookieSessionClient,
} from "./cookieSessionClient";

const ORDERS_BASE_URL = "/api/orders";

//Aqui se define el tipo de datos para el reporte de ventas y las funciones
//para obtener los datos del reporte y generar un reporte con IA.
export type SalesAnalytics = {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalSales: number;
    totalOrders: number;
    averageOrder: number;
  };
    salesByPeriod: {
    label: string;
    sales: number;
  }[];

  bestProduct: {
    productId: number;
    name: string;
    quantity: number;
  } | null;
  peakHours: {
    hour: number;
    orders: number;
  }[];
  cancellations: {
    total: number;
    rate: number;
  };
};

//Aqui se define la funcion para obtener los datos del reporte de ventas
export const getSalesAnalytics = async (
  period: "today" | "week" | "month" | "year",
) => {
  return cookieSessionClient.request<SalesAnalytics>(
    buildUrl(`${ORDERS_BASE_URL}/analytics`, {
      period,
    }),
    {
      method: "GET",
      fallBackMessage: "No se pudo obtener el reporte de ventas",
    },
  );
};