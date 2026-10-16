
import { cookieSessionClient } from "./cookieSessionClient";

const SHARED_CARTS_BASE_URL = "/api/shared-carts";

export type SharedCartItem = {
  id: number;
  clientId: string;
  productId: number;
  productName: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  unitPrice: number;
  lineTotal: number;
};

export type SharedCart = {
  cartId: string | null;
  status: "open" | "submitted" | "expired" | "cancelled" | null;
  expiresAt: string | null;
  observation: string | null;
  items: SharedCartItem[];
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
};

export type AddSharedCartItemPayload = {
  productId: number;
  quantity: number;
  selectedOptions: Record<string, string>;
  clientId: string;
};

export type UpdateSharedCartItemPayload = {
  clientId: string;
  quantity: number;
};

export const getSharedCart = (tableId: string) =>
  cookieSessionClient.request<SharedCart>(
    `${SHARED_CARTS_BASE_URL}/${tableId}`,
    {
      method: "GET",
      fallBackMessage: "No se pudo consultar el carrito compartido",
    },
  );

export const addCartItem = (
  tableId: string,
  payload: AddSharedCartItemPayload,
) =>
  cookieSessionClient.request<SharedCart>(
    `${SHARED_CARTS_BASE_URL}/${tableId}/items`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      fallBackMessage: "No se pudo agregar el producto al carrito",
    },
  );

export const updateCartItem = (
  tableId: string,
  itemId: number,
  payload: UpdateSharedCartItemPayload,
) =>
  cookieSessionClient.request<SharedCart>(
    `${SHARED_CARTS_BASE_URL}/${tableId}/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      fallBackMessage: "No se pudo actualizar el producto",
    },
  );

export const removeCartItem = (
  tableId: string,
  itemId: number,
  clientId: string,
) =>
  cookieSessionClient.request<SharedCart>(
    `${SHARED_CARTS_BASE_URL}/${tableId}/items/${itemId}?clientId=${encodeURIComponent(clientId)}`,
    {
      method: "DELETE",
      fallBackMessage: "No se pudo eliminar el producto",
    },
  );
