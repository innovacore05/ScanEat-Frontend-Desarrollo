

import { cookieSessionClient } from "./cookieSessionClient";
const TABLES_BASE_URL = `${import.meta.env.VITE_API_URL}/api/table`;

//tipos de table solo una vez:
export type Table={
  
}


export const createTable = async (tableNumber: number, chairNumber?: number) => {
    // const token = localStorage.getItem("authToken");

    // const response = await fetch(`${TABLES_BASE_URL}`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //     },
    //     body: JSON.stringify({
    //         tableNumber: Number(tableNumber),
    //         chairNumber: Number(chairNumber),
    //     }),
    // });

    // const data = await response.json().catch(() => ({}));

    // if (!response.ok) {
    //     throw data as ApiError;
    // }
const data=await cookieSessionClient.request<any>(`${TABLES_BASE_URL}`, {
  method:"POST",
  body:JSON.stringify({
    tableNumber:Number(tableNumber),
    chairNumber:Number(chairNumber),
  }),
});
    // El backend puede devolver la mesa directamente o dentro de `table`/`data`.
    const table = data.table ?? data.data ?? data;

    return table as {
        id: string;
        tableNumber: number;
        chairNumber: number;
        active: boolean;
        createdAt: string;
    };
};


export const getTables = async () => {
  // const token = localStorage.getItem("authToken");

  // const response = await fetch(`${TABLES_BASE_URL}`, {
  //   method: "GET",
  //   headers: {
  //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //   },
  // });

  // const data = await response.json().catch(() => []);

  // if (!response.ok) {
  //   throw data;
  // }
const data = await cookieSessionClient.request<any>(`${TABLES_BASE_URL}`, {
method:"GET",
});
  return (Array.isArray(data) ? data : data.tables ?? data.data ?? []) as Array<{
    id: string;
    tableNumber: number;
    chairNumber: number;
    active?: boolean;
    createdAt?: string;
  }>;
};


export const getTableById = async (tableId: string) => {
  // const token = localStorage.getItem("authToken");

  // const response = await fetch(`${TABLES_BASE_URL}/${tableId}`, {
  //   method: "GET",
  //   headers: {
  //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //   },
  // });

  // const data = await response.json().catch(() => ({}));

  // if (!response.ok) {
  //   throw data;
  // }

  return cookieSessionClient.request<{
    id: string;
    tableNumber: number;
    chairNumber: number;
    active?: boolean;
    createdAt?: string;
  }>(`${TABLES_BASE_URL}/${tableId}`, {
    method: "GET",
  });
};

//update chairs number of a table 
// El endpoint PUT valida la representación completa de la mesa, aunque solo se
// modifique la cantidad de sillas.
export const updateTableChairs = async (
  tableId: string,
  tableNumber: number,
  chairNumber: number
) => {
  // const token = localStorage.getItem("authToken");

  // const response = await fetch(`${TABLES_BASE_URL}/${tableId}`, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //   },
  //   body: JSON.stringify({
  //     tableNumber: Number(tableNumber),
  //     chairNumber: Number(chairNumber),
  //   }),
  // });

  // const data = await response.json().catch(() => ({}));

  // if (!response.ok) {
  //   throw data;
  // }

  // return data;
  return cookieSessionClient.request(`${TABLES_BASE_URL}/${tableId}`, {
    method:"PUT",
    body:JSON.stringify({
      tableNumber:Number(tableNumber),
      chairNumber:Number(chairNumber),
    }),
});
};

//delete a table
export const deleteTable = async (tableId: string) => {
  // const token = localStorage.getItem("authToken");

  // const response = await fetch(`${TABLES_BASE_URL}/${tableId}`, {
  //   method: "DELETE",
  //   headers: {
  //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //   },
  // });
  // const data = await response.json().catch(() => ({}));

  // if (!response.ok) {
  //   throw data;
  // }
  // return data as {
  //   message: string;
  // };
  return cookieSessionClient.request<{ message:string}
  >(`${TABLES_BASE_URL}/${tableId}`, {
    method:"DELETE"
});
}
