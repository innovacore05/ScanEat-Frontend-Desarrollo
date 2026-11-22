
import { cookieSessionClient } from "./cookieSessionClient";

const EXPENSES_BASE_URL = "/api/expenses";


export type Expense = {
  expense_id: number;
  motive: string;
  amount: number | string;
  supplier: string;
  date: string;
  observations: string | null;
  invoice_key: string | null;
  business_id?: number;
  created_at?: string;
};

export type ExpenseFormData = {
  motive: string;
  amount: number;
  supplier: string;
  date: string;
  observations: string;
  invoice?: File | null;
};


// Obtener el historial de egresos
export const getExpenses = async (): Promise<Expense[]> => {
  const response = await cookieSessionClient.request<{
    expenses: Expense[];
  }>(EXPENSES_BASE_URL, {
    method: "GET",
    fallBackMessage: "No se pudieron cargar los egresos",
  });

  return response.expenses;
};

// Registrar un egreso

export const createExpense = async (
  data: ExpenseFormData,
): Promise<Expense> => {
  const formData = new FormData();

  formData.append("motive", data.motive);
  formData.append("amount", String(data.amount));
  formData.append("supplier", data.supplier);
  formData.append("date", data.date);
  formData.append("observations", data.observations);

  if (data.invoice) {
    formData.append("invoice", data.invoice);
  }

  const response = await cookieSessionClient.request<{
    message: string;
    expense: Expense;
  }>(EXPENSES_BASE_URL, {
    method: "POST",
    body: formData,
    fallBackMessage: "No se pudo registrar el egreso",
  });

  return response.expense;
};


// Actualizar un egreso

export const updateExpense = async (
  id: number,
  data: ExpenseFormData,
): Promise<Expense> => {
  const formData = new FormData();

  formData.append("motive", data.motive);
  formData.append("amount", String(data.amount));
  formData.append("supplier", data.supplier);
  formData.append("date", data.date);
  formData.append("observations", data.observations);

  if (data.invoice) {
    formData.append("invoice", data.invoice);
  }

  const response = await cookieSessionClient.request<{
    message: string;
    expense: Expense;
  }>(`${EXPENSES_BASE_URL}/${id}`, {
    method: "PUT",
    body: formData,
    fallBackMessage: "No se pudo actualizar el egreso",
  });

  return response.expense;
};


// Eliminar un egreso
export const deleteExpense = async (id: number): Promise<void> => {
  await cookieSessionClient.request(
    `${EXPENSES_BASE_URL}/${id}`,
    {
      method: "DELETE",
      fallBackMessage: "No se pudo eliminar el egreso",
    },
  );
};


export const getExpenseInvoice = async (
    id: number,
): Promise<Blob> => {
    return await cookieSessionClient.request<Blob>(
        `${EXPENSES_BASE_URL}/${id}/invoice`,
        {
            method: "GET",
            fallBackMessage: "No se pudo abrir la factura",
        },
    );
};
