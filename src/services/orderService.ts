import { buildUrl, cookieSessionClient} from "./cookieSessionClient";


// const ORDERS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/orders`;
const ORDERS_BASE_URL = "/api/orders";


export type CreateOrderPayload = {
  tableId: string;
  observation?: string;
  items: Array<{
    productId: number;
    quantity: number;
    selectedOptions: Record<string, string>;
  }>;
};

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered";



type BackendOrderDetail = {
  detailId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  isCustom: number | null;
  selectedOptions: Record<string, string>;
  optionGroups: Array<{
    id: number;
    name: string;
    options: Array<{
      id: number;
      name: string;
    }>;
  }>;
};

type BackendOrder = {
  order: {
    orderId: number;
    date: string;
    state: OrderStatus;
    subtotal: string;
    tax: string;
    total: string;
    observation: string | null;
    tableId: string;
  };
  table: {
    id: string;
    tableNumber: number;
  };
  details: BackendOrderDetail[];
};

const formatSelectedOptions = (
  selectedOptions: Record<string, string>,
  optionGroups: BackendOrderDetail["optionGroups"],
) => {
  const optionGroupNames = new Map(
    optionGroups.map((group) => [String(group.id), group.name]),
  );

  return Object.fromEntries(
    Object.entries(selectedOptions).map(([groupId, value]) => [
      optionGroupNames.get(groupId) ?? groupId,
      value,
    ]),
  );
};

// const getAuthHeaders = () => {
//   const token = localStorage.getItem("authToken");

//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// };

export type FrontendOrderStatus =
  | "Pendiente"
  | "En preparación"
  | "Listo"
  | "Entregado";

export const stateToLabel: Record<OrderStatus, FrontendOrderStatus> = {
  pending: "Pendiente",
  preparing: "En preparación",
  ready: "Listo",
  delivered: "Entregado",
};

export const statusIdToState: Record<number, OrderStatus> = {
  1: "pending",
  2: "preparing",
  3: "ready",
  4: "delivered",
};

const mapBackendOrderToFrontend = (backendOrder: BackendOrder) => {
  const totalValue = Number(backendOrder.order.total || 0);
  const items = backendOrder.details.map((detail) => ({
    name: detail.productName,
    quantity: detail.quantity,
    price: Number(detail.unitPrice || 0),
    options: Object.keys(detail.selectedOptions ?? {}).length
      ? formatSelectedOptions(detail.selectedOptions, detail.optionGroups ?? [])
      : undefined,
  }));

  return {
    orderId: backendOrder.order.orderId,
    tableId: backendOrder.table?.tableNumber ?? Number(backendOrder.order.tableId),
    time: backendOrder.order.date
      ? new Date(backendOrder.order.date).toLocaleTimeString("es-CR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "--:--",
    specialInstructions: backendOrder.order.observation ?? undefined,
    price: `₡${totalValue.toLocaleString("es-CR")}`,
    subtotal: Number(backendOrder.order.subtotal || 0),
    tax: Number(backendOrder.order.tax || 0),
    total: totalValue,
    status: stateToLabel[backendOrder.order.state] as FrontendOrderStatus,
    items,
  };
};

export const createOrder = async (payload: CreateOrderPayload) => {
  // const response = await fetch(ORDERS_BASE_URL, {
  //   method: "POST",
  //   headers: getAuthHeaders(),
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
  //     state: OrderStatus;
  //   };
  //   details: Array<{
  //     productId: number;
  //     quantity: number;
  //     unitPrice: string;
  //     subtotal: number;
  //     selectedOptions?: Record<string, string>;
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
state:OrderStatus;

  };
  
    details: Array<{
      productId: number;
      quantity: number;
      unitPrice: string;
      subtotal: number;
selectedOptions?:Record<string, string>;
    }>;
  
  
}>(ORDERS_BASE_URL,{
  method:"POST",
  body:JSON.stringify(payload),
  fallBackMessage: "No se pudo crear el pedido",
});
};

export const getOrders = async (state?: string) => {

  // if (state) {
  //   url.searchParams.set("state", state);
  // }

  // const response = await fetch(url.toString(), {
  //   method: "GET",
  //   headers: getAuthHeaders(),
  // });

  // const data = await response.json().catch(() => []);

  // if (!response.ok) {
  //   throw (data as ApiError) ?? { message: "No se pudieron cargar los pedidos" };
  // }

  // return (Array.isArray(data) ? data : []).map(mapBackendOrderToFrontend);

const data = await cookieSessionClient.request<BackendOrder[]>(
  buildUrl(ORDERS_BASE_URL,{state}),
  {
    method:"GET",
    fallBackMessage:"No se pudieron cargar los pedidos",
  },
);
return (Array.isArray(data)?data:[]).map(mapBackendOrderToFrontend);
};
  

export const confirmOrder = async (orderId: number) => {
  // const response = await fetch(`${ORDERS_BASE_URL}/${orderId}/confirm`, {
  //   method: "PATCH",
  //   headers: getAuthHeaders(),
  // });

  // const data = await response.json().catch(() => ({}));

  // if (!response.ok) {
  //   throw (data as ApiError) ?? {
  //     message: "No se pudo confirmar la orden",
  //   };
  // }

  // return data;
   return cookieSessionClient.request(`${ORDERS_BASE_URL}/${orderId}/confirm`,  {
    method:"PATCH",
    fallBackMessage: "No se pudo confirmar el pedido",
  });
};

export const markOrderReady = async (orderId: number) => {
  // const response = await fetch(`${ORDERS_BASE_URL}/${orderId}/ready`, {
  //   method: "PATCH",
  //   headers: getAuthHeaders(),
  // });

  // const data = await response.json().catch(() => ({}));

  // if (!response.ok) {
  //   throw data as ApiError;
  // }

  // return data;
  return cookieSessionClient.request(`${ORDERS_BASE_URL}/${orderId}/ready`,{
    method:"PATCH",
    fallBackMessage: "No se pudo marcar el pedido como listo",
  });
  };


export const deliverOrder = async (orderId: number) => {
  // const response = await fetch(`${ORDERS_BASE_URL}/${orderId}/deliver`, {
  //   method: "PATCH",
  //   headers: getAuthHeaders(),
  // });

  // const data = await response.json().catch(() => ({}));

  // if (!response.ok) {
  //   throw data as ApiError;
  // }

  // return data;

  return cookieSessionClient.request(`${ORDERS_BASE_URL}/${orderId}/deliver`,{
    method:"PATCH",
     fallBackMessage: "No se pudo marcar el pedido como entregado",
  });
};


export const getOrderStatus = async (orderId: number) => {
  // const response = await fetch(
  //   `${ORDERS_BASE_URL}/${orderId}/status`,
  //   {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   },
  // );

  // const data = await response.json().catch(() => ({}));

  // if (!response.ok) {
  //   throw (data as ApiError) ?? {
  //     message: "No se pudo consultar el estado del pedido",
  //   };
  // }

  // return data as {
  //   orderId: number;
  //   state: OrderStatus;
  // };

return cookieSessionClient.request<{
    orderId: number;
    state: OrderStatus;
  }>(`${ORDERS_BASE_URL}/${orderId}/status`, {
    method: "GET",
    fallBackMessage: "No se pudo consultar el estado del pedido",
  });


};