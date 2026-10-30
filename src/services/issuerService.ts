

import { cookieSessionClient } from "./cookieSessionClient";



export type IssuerConfig = {
  legalIdType: string;
  legalId: string;
  legalName: string;
  tradeName: string;
  activityCode: string;
  email: string;
  phone: string;
  province: string;
  canton: string;
  district: string;
  neighborhood: string;
  address: string;
  environment: string;
};
export type TaxpayerLookup = {
 legalName: string | null;
  tradeName: string | null;
  registered: boolean | null;
  legalIdType: string;
  canIssue: boolean | null;
  chargesVat: boolean | null;
  hasCommercialActivity: boolean;
  activities: { code: string; description: string }[];
};


async function lookupTaxpayer(legalId: string): Promise<TaxpayerLookup> {
  return cookieSessionClient.request<TaxpayerLookup>(
    `/api/issuer/lookup/${encodeURIComponent(legalId)}`,
    {
      method: "GET",
      fallBackMessage: "No se pudo consultar la cédula.",
    },
  );
}


export type IssuerConfigResponse = IssuerConfig & {
  certificateUploadedAt: string | null;
  regimeKey: string | null;
  chargesVat: boolean | null;
};
//obetener info del emisor
async function getIssuer():Promise<IssuerConfigResponse | null>
{
  return cookieSessionClient.request<IssuerConfigResponse|null>("/api/issuer",{
    method: "GET",
    fallBackMessage:"No se pudo cargar la información del emisor.",
  });
}
//guardar emisor
async function saveIssuer(
  payload: IssuerConfig,
): Promise<{
  ok: boolean;
  regimeVerified: boolean;
  certificateInvalidated: boolean;
}> {
  return cookieSessionClient.request<{
    ok: boolean;
    regimeVerified: boolean;
    certificateInvalidated: boolean;
  }>("/api/issuer", {
    method: "PUT",
    body: JSON.stringify(payload),
    fallBackMessage: "No se pudo guardar la información del emisor.",
  });
}
async function uploadCertificate (formData:FormData):Promise<{ok:boolean}>{
  return cookieSessionClient.request<{ok:boolean}> ("/api/issuer/certificate",{
    method:"POST",
    body:formData,
    fallBackMessage: "No se pudo subir el certificado.",
  });
}
export function getErrorMessage(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message?: string }).message)
    : fallback;
}


export const issuerService = {
  get: getIssuer,
  save: saveIssuer,
  uploadCertificate,
  lookupTaxpayer,
};