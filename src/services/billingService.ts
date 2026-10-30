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
    orderId:number;
    tableNumber:number;
lines:Array<ReceiptLine & {detailId:number}>;
totals:ReceiptTotals;
taxSummary: { rate: number; amount: string }[];
 chargesVat: boolean | null;
//producto sin codigo cabys
missingCabys:string[];
};

export type PayOrderPayload = (
  | { method: "cash"; amountTendered: number }
  | { method: "card" | "sinpe"; reference: string }
) & { includeServiceCharge: boolean };


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

//lo que va al cajero antes de cobrar

export const getPaymentPreview = (orderId: number, includeService = true) =>
  cookieSessionClient.request<PaymentPreview>(
    `${BILLING_BASE_URL}/orders/${orderId}?service=${includeService}`,
    { method: "GET", fallBackMessage: "No se puede cargar la orden" },
  );

    //registro de cobro y creacion de tiquete
    export const payOrder =(orderId : number, payload : PayOrderPayload)=>
        cookieSessionClient.request<PayOrderResponse>
    (
        `${BILLING_BASE_URL}/orders/${orderId}/payments`,
    
    {
        method:"POST",
        body:JSON.stringify(payload),
        fallBackMessage:"No se pudo registrar el cobro",
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