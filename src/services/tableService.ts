const TABLES_BASE_URL = `${import.meta.env.VITE_API_URL}/api/table`;

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

  const response = await fetch(`${TABLES_BASE_URL}/${tableId}`, {
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
