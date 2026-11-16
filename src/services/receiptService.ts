const API_URL = import.meta.env.VITE_API_URL ?? "";

/**
true cuando se pueda enviar por correo
 */
export const RECEIPT_EMAIL_RESEND_ENABLED = false;


export type ReceiptStatus =
  | "pending"
  | "queued"
  | "signing"
  | "sent"
  | "polling"
  | "accepted"
  | "rejected"
  | "failed";

export type ReceiptStatusFilter =
  | ""
  | "accepted"
  | "rejected"
  | "in_progress"
  | "failed";

export interface Receipt {
  id: string; 
  issuedAt: string; 
  documentType: string; 
  consecutivo: string;
  clave: string;
  total: number;
  tax: number;
  status: ReceiptStatus;
  hasXml: boolean;
  /**   motivo del fallo, ya en texto legible */
  haciendaMessage: string | null;
  /** id del comprobante que lo sustituyó, si ya se emitió el reemplazo */
  replacedById: string | null;
}

export interface ReceiptListParams {
  from: string; 
  to: string; 
  status: ReceiptStatusFilter;
  search: string; 
  page: number;
  limit: number;
}

export interface ReceiptListResponse {
  items: Receipt[];
  page: number;
  limit: number;
  total: number; 
  // Del período completo y del filtro aplicado, no solo de la página.
  summary: {
    count: number; 
    total: number; 
    taxTotal: number; 
    acceptedCount: number; 
  };
}

export interface ReceiptReplacementResponse {
  receiptId: number;
  replacesReceiptId: number;
  haciendaStatus: string;
  clave: string | null;
  consecutiveNumber: string | null;
  emissionError?: string;
}


export interface ReceiptActionResponse {
  receiptId: number;
  haciendaStatus: string;
  haciendaMessage?: string | null;
  clave: string | null;
  consecutiveNumber: string | null;
}


export class ReceiptApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }

  /** El backend todavía no tiene la ruta. */
  get isMissingEndpoint() {
    return this.status === 404 || this.status === 501;
  }
}

async function toError(res: Response) {
  let message = `Error ${res.status}`;
  try {
    const body = await res.json();
    message = body?.message ?? body?.error ?? message;
  } catch {
    // respuesta sin JSON
  }
  return new ReceiptApiError(res.status, message);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) throw await toError(res);
  return (await res.json()) as T;
}

const base = (id: string) => `/api/receipts/${encodeURIComponent(id)}`;

export function listReceipts(params: ReceiptListParams, signal?: AbortSignal) {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.status) query.set("status", params.status);
  if (params.search.trim()) query.set("search", params.search.trim());

 return request<ReceiptListResponse>(`/api/receipts?${query.toString()}`, {
  signal,
  cache: "no-store",
});
}

export function refreshReceiptStatus(id: string) {
  return request<ReceiptActionResponse>(`${base(id)}/refresh`, {
    method: "POST",
  });
}

export function retryReceiptSend(id: string) {
  return request<ReceiptActionResponse>(`${base(id)}/retry`, {
    method: "POST",
  });
}

export function issueReplacementReceipt(id: string) {
  return request<ReceiptReplacementResponse>(`${base(id)}/replace`, {
    method: "POST",
  });
}

/** Reenvia el comprobante aceptado por correo*/
export function resendReceiptEmail(id: string) {
  return request<{ ok: true }>(`${base(id)}/resend-email`, { method: "POST" });
}

async function downloadFile(path: string, filename: string) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw await toError(res);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadReceiptXml(receipt: Pick<Receipt, "id" | "consecutivo">) {
  return downloadFile(`${base(receipt.id)}/xml`, `${receipt.consecutivo}.xml`);
}

