import { useEffect, useState } from "react";
import {
  getSalesAnalytics,
  type SalesAnalytics,
} from "../../services/analyticsService";
import Skeleton from "../shared/Skeleton";

function FavoritesToday() {
  const [topProducts, setTopProducts] = useState<
    SalesAnalytics["topProducts"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        setLoading(true);
        setError(false);

        const analytics = await getSalesAnalytics("today");

        setTopProducts(analytics.topProducts ?? []);
      } catch (err) {
        console.error("Error al cargar los favoritos de hoy:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void loadTopProducts();
  }, []);

  const barWidths = ["w-full", "w-4/5", "w-3/5"];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h2 className="text-base font-semibold text-black">
        Favoritos de hoy
      </h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">
          No se pudieron cargar los productos.
        </p>
      ) : topProducts.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía no hay productos vendidos hoy.
        </p>
      ) : (
        <div className="flex flex-col items-start gap-2">
          {topProducts.slice(0, 3).map((product, index) => (
            <div
              key={product.productId}
              className={`${barWidths[index]} flex min-w-0 items-center justify-between gap-3 rounded-lg bg-mint-darker px-4 py-2 text-white`}
            >
              <span className="truncate">{product.name}</span>
              <span className="shrink-0 text-sm font-semibold">
                {product.quantity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesToday;