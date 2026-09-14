
import { cookieSessionClient } from "./cookieSessionClient";

const ORDERS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

export type CreateOrderPayload = {
  tableId: string;
  observation?: string;
  items: Array<{
    productId: number;
    quantity: number;
    selectedOptions: Record<string, string>;
  }>;
};

// type ApiError = {
//   message?: string;
//   [key: string]: unknown;
// };

export const createOrder = async (payload: CreateOrderPayload) => {
  // const response = await fetch(ORDERS_BASE_URL, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(payload),
  // });

  // const data = await response.json().catch(() => ({}));

  // if (!response.ok) {
  //   throw data as ApiError;
  // }

  // return data as {
  //   order: {
  //     orderId: number;
  //     tableId: string;
  //     observation: string | null;
  //     subtotal: string;
  //     tax: string;
  //     total: string;
  //   };
  //   details: Array<{
  //     productId: number;
  //     quantity: number;
  //     unitPrice: string;
  //     subtotal: number;
  //   }>;
  // };


  return cookieSessionClient.request<{
  order: {
      orderId: number;
      tableId: string;
      observation: string | null;
      subtotal: string;
      tax: string;
      total: string;

  };
  
    details: Array<{
      productId: number;
      quantity: number;
      unitPrice: string;
      subtotal: number;
    }>;
  
  
}>(ORDERS_BASE_URL,{
  method:"POST",
  body:JSON.stringify(payload),
});
};
