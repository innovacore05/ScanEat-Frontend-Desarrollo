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

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered";

type ApiError = {
  message?: string;
  [key: string]: unknown;
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

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

type FrontendOrderStatus =
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
      ? detail.selectedOptions
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
  const response = await fetch(ORDERS_BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data as ApiError;
  }

  return data as {
    order: {
      orderId: number;
      tableId: string;
      observation: string | null;
      subtotal: string;
      tax: string;
      total: string;
      state: OrderStatus;
    };
    details: Array<{
      productId: number;
      quantity: number;
      unitPrice: string;
      subtotal: number;
      selectedOptions?: Record<string, string>;
    }>;
  };
};

export const getOrders = async (state?: string) => {
  const url = new URL(ORDERS_BASE_URL);

  if (state) {
    url.searchParams.set("state", state);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw (data as ApiError) ?? { message: "No se pudieron cargar los pedidos" };
  }

  return (Array.isArray(data) ? data : []).map(mapBackendOrderToFrontend);
};

export const confirmOrder = async (orderId: number) => {
  const response = await fetch(`${ORDERS_BASE_URL}/${orderId}/confirm`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw (data as ApiError) ?? {
      message: "No se pudo confirmar la orden",
    };
  }

  return data;
};

export const markOrderReady = async (orderId: number) => {
  const response = await fetch(`${ORDERS_BASE_URL}/${orderId}/ready`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data as ApiError;
  }

  return data;
};

export const deliverOrder = async (orderId: number) => {
  const response = await fetch(`${ORDERS_BASE_URL}/${orderId}/deliver`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data as ApiError;
  }

  return data;
};
