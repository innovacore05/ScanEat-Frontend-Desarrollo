import { cookieSessionClient } from "./cookieSessionClient";

const BILLING_BASE_URL= "/api/billing";

export type PaymentMethodType= "cash" | "card" | "sinpe";


export type ReceiptLine = {
  detailId: number;
  detail: string;
  quantity: number;
  originalQuantity: number;
  paidQuantity: number;
  pendingQuantity: number;
  unitPrice: string;
  gross: string;
  discount: string;
  subtotal: string;
  tax: string;
  total: string;
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


export type PaymentPreview = {
  orderId: number;
  tableId: string;
  tableNumber: number;
  lines: ReceiptLine[];
  totals: ReceiptTotals;
  taxSummary: { rate: number; amount: string }[];
  missingCabys: string[];
};



export type PayOrderPayload = {
  items: {
    detailId: number;
    quantity: number;
  }[];
} & (
  | { method: "cash"; amountTendered: number }
  | { method: "card" | "sinpe"; reference: string }
);



export type PayOrderResponse={
receiptId: number;
  orderId: number;
  tableNumber: number;
    documentType:string;
    issueDate:string;
    haciendaStatus:string;
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

export const getPaymentPreview=(orderId:number)=>
    cookieSessionClient.request<PaymentPreview>(
     `${BILLING_BASE_URL}/orders/${orderId}`,  
     {
        method:"GET",
        fallBackMessage:"No se puede cargar la orden",
     },
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