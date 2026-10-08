

import { cookieSessionClient } from "./cookieSessionClient";

export interface CreateIssuerResponse {
  message?: string;
  [key: string]: unknown;
}

async function createIssuer(
  formData: FormData,
): Promise<CreateIssuerResponse> {
  return cookieSessionClient.request<CreateIssuerResponse>("/api/issuer", {
    method: "POST",
    body: formData,
    fallBackMessage: "No se pudo guardar la información del emisor.",
  });
}

export const issuerService = {
  create: createIssuer,
};