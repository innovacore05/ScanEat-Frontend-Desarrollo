import { cookieSessionClient } from "./cookieSessionClient";
import type {
  RestaurantTheme,
  ThemeFormValues,
} from "../config/restaurantTheme";

export async function getRestaurantTheme(
  businessId: number,
) {
  return cookieSessionClient.request<RestaurantTheme>(
    `/api/businesses/${businessId}/theme`,
    {
      method: "GET",
      fallBackMessage:
        "No se pudo cargar la personalización",
    },
  );
}

export async function updateRestaurantTheme(
  businessId: number,
  theme: ThemeFormValues,
) {
  return cookieSessionClient.request<RestaurantTheme>(
    `/api/businesses/${businessId}/theme`,
    {
      method: "PUT",
      body: JSON.stringify(theme),
      fallBackMessage:
        "No se pudo guardar la personalización",
    },
  );
}

export async function uploadRestaurantLogo(
  businessId: number,
  file: File,
) {
  const formData = new FormData();
  formData.append("logo", file);

  return cookieSessionClient.request<{
    logoUrl: string;
  }>(
    `/api/businesses/${businessId}/theme/logo`,
    {
      method: "POST",
      body: formData,
      fallBackMessage: "No se pudo subir el logo",
    },
  );
}

export async function getThemeByTable(
  tableId: string,
) {
  return cookieSessionClient.request<RestaurantTheme>(
    `/api/public/tables/${tableId}/theme`,
    {
      method: "GET",
      fallBackMessage:
        "No se pudo cargar el tema del restaurante",
    },
  );
}