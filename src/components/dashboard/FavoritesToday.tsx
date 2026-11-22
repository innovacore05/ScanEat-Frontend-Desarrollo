import { useEffect, useState } from "react";
import {
  getSalesAnalytics,
  type SalesAnalytics,
} from "../../services/analyticsService";
import Skeleton from "../shared/Skeleton";
import { motion } from "motion/react";

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

  const maxQuantity = Math.max(
    ...topProducts.slice(0, 3).map((product) => product.quantity),
    1,
  );

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
            <motion.div
              key={product.productId}
              className="flex min-h-10 min-w-24 origin-left items-center justify-between gap-3 overflow-hidden rounded-lg bg-mint-darker px-4 py-2 text-white"
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: `${Math.max(
                  42,
                  (product.quantity / maxQuantity) * 100,
                )}%`,
                opacity: 1,
              }}
              transition={{
                width: {
                  duration: 0.65,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                },
                opacity: { duration: 0.25, delay: index * 0.12 },
              }}
            >
              <motion.span
                className="truncate"
                initial={{ x: -8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.25 + index * 0.12 }}
              >
                {product.name}
              </motion.span>
              <motion.span
                className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-sm font-semibold"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                  delay: 0.45 + index * 0.12,
                }}
              >
                {product.quantity}
              </motion.span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesToday;