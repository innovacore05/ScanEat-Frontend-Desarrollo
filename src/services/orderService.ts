
import { cookieSessionClient } from "./cookieSessionClient";

// const ORDERS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/orders`;
//cambiamos lo de arriba por esto apra que exista una relacion directra hacia el bakcned y no tenagmos problemas con el movimeinto de la scookies 
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


export const createOrder = async (payload: CreateOrderPayload) => {

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
//     ...(token ? { Authorization: Bearer ${token} } : {}),
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


export const getOrders = async (state?: string) => {
  const url = new URL(ORDERS_BASE_URL);

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

if(state)url.searchParams.set("state",state);

const data = await cookieSessionClient.request<BackendOrder[]>(url.toString(),{
  method:"GET",
  fallBackMessage: "No se pudieron cargar los pedidos",
});
  return (Array.isArray(data) ? data : []).map(mapBackendOrderToFrontend);

};
  

//comentario de verificacion para error de token 


export const confirmOrder = async (orderId: number) => {
  return cookieSessionClient.request(`${ORDERS_BASE_URL}/${orderId}/confirm`,  {
    method:"PATCH",
    fallBackMessage: "No se pudo confirmar el pedido",
  });
};




export const markOrderReady = async (orderId: number) => {
  // const response = await fetch(${ORDERS_BASE_URL}/${orderId}/ready, {
  //   method: "PATCH",
  //   headers: getAuthHeaders(),
  return cookieSessionClient.request(`${ORDERS_BASE_URL}/${orderId}/ready`,{
    method:"PATCH",
    fallBackMessage: "No se pudo marcar el pedido como listo",
  });
  };

 
export const deliverOrder = async (orderId: number) => {
  // const response = await fetch(${ORDERS_BASE_URL}/${orderId}/deliver, {
  //   method: "PATCH",
  //   headers: getAuthHeaders(),
  return cookieSessionClient.request(`${ORDERS_BASE_URL}/${orderId}/deliver`,{
    method:"PATCH",
     fallBackMessage: "No se pudo marcar el pedido como entregado",
  });
  };

 
