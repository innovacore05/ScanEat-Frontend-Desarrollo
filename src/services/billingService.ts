import { cookieSessionClient } from "./cookieSessionClient";

const BILLING_BASE_URL= "/api/billing";

export type PaymentMethodType= "cash" | "card" | "sinpe";

export type ReceiptLine = {
  detail: string;
  quantity: number;
  unitPrice: string;
  gross: string;
  discount: string;
  subtotal: string;
  tax: string;
  total: string;
  //  el backend devuelve estas tarifas
  ivaRate: string;
  ivaRateCode: string;
};

export type ReceiptTotals={
    totalSale:string;
    totalDiscount:string;
    totalNetSale:string;
    totalTax:string;
    serviceCharge:string;
    totalOtherCharges:string;
    totalVoucher:string;
};

export type PaymentPreview={
    orderId: number;
    tableId: string;
    tableNumber: number;
lines:Array<
ReceiptLine & {
    detailId:number;
originalQuantity: number;
      paidQuantity: number;
      pendingQuantity: number;

}>;
totals:ReceiptTotals;
taxSummary: { rate: number; amount: string }[];
chargesVat: boolean | null;
//producto sin codigo cabys
missingCabys:string[];
};

type SelectedPaymentItem = {
  detailId: number;
  quantity: number;
};

export type PayOrderPayload = (
  | { method: "cash"; amountTendered: number }
  | { method: "card" | "sinpe"; reference: string }
) & { includeServiceCharge: boolean ;
items: SelectedPaymentItem[];};


export type PayOrderResponse={
receiptId: number;
  orderId: number;
  tableNumber: number;
    documentType:string;
    issueDate:string;
    haciendaStatus:string;
    haciendaMessage?: string | null;
     clave: string | null;
  consecutiveNumber: string | null;
  environment: string;
  issuer: {
    legalName: string;
    tradeName: string | null;
    legalId: string;
    legalIdType: string;
    phone: string | null;
    address: string | null;
  };
    lines:ReceiptLine[];
    totals:ReceiptTotals;
    taxSummary: { rate: number; amount: string }[];
    payment:{
        method:PaymentMethodType;
        reference:string|null;
        amount:string;
        amountTendered:string|null;
        change:string|null;
    };
};

export type ReplaceRejectedReceiptResponse = {
  receiptId: number;
  replacesReceiptId: number;
  haciendaStatus: string;
  clave: string | null;
  consecutiveNumber: string | null;
  emissionError?: string;
};

export type ReceiptUpdateResponse =
  | RetryReceiptEmissionResponse
  | ReplaceRejectedReceiptResponse;

export const replaceRejectedReceipt = (receiptId: number) =>
  cookieSessionClient.request<ReplaceRejectedReceiptResponse>(
    `${BILLING_BASE_URL}/receipts/${receiptId}/replace-rejected`,
    {
      method: "POST",
      fallBackMessage: "No se pudo crear el comprobante sustituto",
    },
  );

//lo que va al cajero antes de cobrar

export const getPaymentPreview = (
  orderId: number,
  includeService = true,
) =>
  cookieSessionClient.request<PaymentPreview>(
    `${BILLING_BASE_URL}/orders/${orderId}?service=${includeService}`,
    {
      method: "GET",
      fallBackMessage: "No se puede cargar la orden",
    },
  );

export const payOrder = (
  orderId: number,
  payload: PayOrderPayload,
) =>
  cookieSessionClient.request<PayOrderResponse>(
    `${BILLING_BASE_URL}/orders/${orderId}/payments`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      fallBackMessage: "No se pudo registrar el cobro",
    },
  );

export type ReceiptStatus = {
  receiptId: number;
  haciendaStatus: string;
  haciendaMessage: string | null;
  clave: string | null;
  consecutiveNumber: string | null;
};

// consulta el estado del tiquete ante Hacienda
export const getReceiptStatus = (receiptId: number) =>
  cookieSessionClient.request<ReceiptStatus>(
    `${BILLING_BASE_URL}/receipts/${receiptId}/status`,
    {
      method: "GET",
      fallBackMessage: "No se pudo consultar el estado del tiquete",
    },
  );

  export type RetryReceiptEmissionResponse = {
  receiptId: number;
  haciendaStatus: string;
  clave: string | null;
  consecutiveNumber: string | null;
};

export const retryReceiptEmission = (receiptId: number) =>
  cookieSessionClient.request<RetryReceiptEmissionResponse>(
    `${BILLING_BASE_URL}/receipts/${receiptId}/retry-emission`,
    {
      method: "POST",
      fallBackMessage: "No se pudo reintentar la emisión del tiquete",
    },
  );

  