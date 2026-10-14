import { useEffect, useState } from "react";

export interface GeoItem {
  id: string; 
  name_local: string;
  parent_id?: string;
}

const API_BASE = "https://api.openadmindata.org/api/v1/cr";

async function fetchLevel(
  level: "province" | "canton" | "district",
): Promise<GeoItem[]> {
  const res = await fetch(`${API_BASE}/${level}.json`);
  if (!res.ok) throw new Error(`No se pudo cargar ${level}`);
  const data = await res.json();
  return data.entities;
}

export function useGeography() {
  const [provinces, setProvinces] = useState<GeoItem[]>([]);
  const [cantons, setCantons] = useState<GeoItem[]>([]);
  const [districts, setDistricts] = useState<GeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [p, c, d] = await Promise.all([
          fetchLevel("province"),
          fetchLevel("canton"),
          fetchLevel("district"),
        ]);
        setProvinces(p);
        setCantons(c);
        setDistricts(d);
      } catch (err) {
        console.error("Error cargando ubicaciones:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void loadAll();
  }, []);

  return { provinces, cantons, districts, loading, error };
}