import { useEffect, useState } from "react";
import { getProducts, type Product } from "../../services/productService";
import SearchBar from "../menu/SearchBar";
import Skeleton from "../shared/Skeleton";

function DiscountsToday() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        const allProducts: Product[] = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const data = await getProducts({ limit: 20, offset });
          allProducts.push(...data.products);
          hasMore = data.hasMore && data.products.length > 0;
          offset += data.products.length;
        }

        const discounts = allProducts.filter(
          (product) => Number(product.discount ?? 0) > 0,
        );

        setProducts(discounts);
      } catch (error) {
        console.error("No se pudieron cargar los descuentos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscounts();
  }, []);

  const visibleProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section>
      <h2 className=" text-2xl font-bold text-mint-dark">
        Descuentos de hoy
      </h2>

      <div className="mb-6 flex items-center">
        <SearchBar
              searchTerm={search}
              setSearchTerm={setSearch}
              className="mt-6 w-full"
            />
      </div>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto rounded-2xl border border-border">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex h-30 shrink-0 overflow-hidden rounded-xl bg-white">
              <Skeleton className="h-full w-44 shrink-0 rounded-none" />
              <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-full max-w-sm" />
                <Skeleton className="mt-auto h-4 w-28" />
              </div>
            </div>
          ))
        ) : visibleProducts.map((product) => {
          const discount = Number(product.discount ?? 0);
          const finalPrice = product.price * (1 - discount / 100);

          return (
            <article
              key={product.productId}
              className="flex h-30 min-w-0 shrink-0 overflow-hidden rounded-xl bg-white"
            >
              <img
                src={product.image ?? "/img/placeholder.jpg"}
                alt={product.productName}
                className="h-full w-44 min-w-44 flex-none object-cover"
              />

              <div className="min-w-0 overflow-hidden px-4 py-2">
                <h3 className="text-sm font-bold text-mint-dark">
                  {product.productName}
                </h3>

                <p className="line-clamp-2 text-xs text-text-primary">
                  {product.description}
                </p>

                <div className="mt-8">
                  <span className="relative mr-2 text-xs text-text-primary">
                    ₡{product.price.toLocaleString("es-CR")}
                    <span className="absolute left-0 top-1/2 h-px w-full -rotate-12 bg-red-500" />
                  </span>

                  <span className="font-bold text-mint-dark">
                    ₡{finalPrice.toLocaleString("es-CR")}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default DiscountsToday;