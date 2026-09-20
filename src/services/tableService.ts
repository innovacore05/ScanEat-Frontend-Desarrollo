const TABLES_BASE_URL = `${import.meta.env.VITE_API_URL}/api/table`;

//Validación para que el id de la mesa tenga, entre 1 y 100 caracteres, solo tenga
//letras, numeros, guiones(medios y bajos). 
const getTablePath = (tableId: string) => {
  const normalizedTableId = tableId.trim();

  if (!/^[A-Za-z0-9_-]{1,100}$/.test(normalizedTableId)) {
    throw new Error("Identificador de mesa inválido");
  }

  return `${TABLES_BASE_URL}/${encodeURIComponent(normalizedTableId)}`;
};

type ApiError = {
    message?: string;
    [key: string]: unknown;
};

export const createTable = async (tableNumber: number, chairNumber?: number) => {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`${TABLES_BASE_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            tableNumber: Number(tableNumber),
            chairNumber: Number(chairNumber),
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data as ApiError;
    }

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
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${TABLES_BASE_URL}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw data;
  }

  return (Array.isArray(data) ? data : data.tables ?? data.data ?? []) as Array<{
    id: string;
    tableNumber: number;
    chairNumber: number;
    active?: boolean;
    createdAt?: string;
  }>;
};


export const getTableById = async (tableId: string) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(getTablePath(tableId), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data;
  }

  return data as {
    id: string;
    tableNumber: number;
    chairNumber: number;
    active?: boolean;
    createdAt?: string;
  };
};

//update chairs number of a table 
// El endpoint PUT valida la representación completa de la mesa, aunque solo se
// modifique la cantidad de sillas.
export const updateTableChairs = async (
  tableId: string,
  tableNumber: number,
  chairNumber: number
) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(getTablePath(tableId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      tableNumber: Number(tableNumber),
      chairNumber: Number(chairNumber),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data;
  }

  return data;
};

//delete a table
export const deleteTable = async (tableId: string) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(getTablePath(tableId), {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data;
  }
  return data as {
    message: string;
  };
}
