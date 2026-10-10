import { useEffect, useState } from "react";
import { getProducts, type Product } from "../../services/productService";
import SearchBar from "../menu/SearchBar";

function DiscountsToday() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        const data = await getProducts({ limit: 20 });

        const discounts = data.products
          .filter((product) => Number(product.discount ?? 0) > 0)
          .slice(0, 3);

        setProducts(discounts);
      } catch (error) {
        console.error("No se pudieron cargar los descuentos:", error);
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

      <div className="flex flex-col gap-3 border border-border rounded-2xl">
        {visibleProducts.map((product) => {
          const discount = Number(product.discount ?? 0);
          const finalPrice = product.price * (1 - discount / 100);

          return (
            <article
              key={product.productId}
              className="flex h-30 overflow-hidden rounded-xl bg-white"
            >
              <img
                src={product.image ?? "/img/placeholder.jpg"}
                alt={product.productName}
                className="w-44 object-cover"
              />

              <div className="px-4 py-2">
                <h3 className="text-sm font-bold text-mint-dark">
                  {product.productName}
                </h3>

                <p className="text-xs text-text-primary">
                  {product.description}
                </p>

                <div className="mt-8">
                  <span className="relative mr-2 text-xs text-text-primary">
                    ₡{product.price.toLocaleString("es-CR")}
                    <span className="absolute left-0 top-1/2 h-px w-full rotate-[-12deg] bg-red-500" />
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