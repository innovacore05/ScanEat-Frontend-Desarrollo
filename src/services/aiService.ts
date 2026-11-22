import {
  buildUrl,
  cookieSessionClient,
} from "./cookieSessionClient";

const AI_BASE_URL = "/api/ai";


//Aqui se define la funcion para generar un reporte de ventas con IA
export const generateAISalesReport = async (
  period: "today" | "week" | "month" | "year",
) => {
  return cookieSessionClient.request<{
    success: boolean;
    report: {
      summary: string;
      bestProduct: string;
      peakHours: string;
      cancellations: string;
      recommendation: string;
    };
  }>(
    buildUrl(`${AI_BASE_URL}/sales-report`),
    {
      method: "POST",
      body: JSON.stringify({
        period,
      }),
      fallBackMessage: "No se pudo generar el reporte con IA",
    },
  );
};

export type ChatAction =
  | {
      type: "none";
    }
  | {
      type: "confirm_add_to_cart";
      productId: number;
      productName: string;
      quantity: number;
    };

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
export const sendMenuChatMessage = async (
  mesaId: string,
  message: string,
  history: ChatMessage[] = [],
) => {
  return cookieSessionClient.request<{
  reply: string;
  recommendations: {
    productId: number;
    productName: string;
    price: number;
    reason: string;
    role: "meal" | "drink" | "dessert";
  }[];
  action: ChatAction;
}>("/api/ai/menu-chat", {
    method: "POST",
    body: JSON.stringify({ mesaId, message, history }),
    fallBackMessage: "No se pudo consultar el asistente",
  });
};
