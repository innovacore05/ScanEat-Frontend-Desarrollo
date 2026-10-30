
import { useEffect, useState } from "react";
import {
  getProducts,
  getCategories,
  type Product,
  type Category,
} from "../../services/productService";
import { LuShoppingBag } from "react-icons/lu";
import DishCard from "../menu/DishCard";
import CategoryFilter from "../menu/CategoryFilter";
import SearchBar from "../menu/SearchBar";
import Skeleton from "../shared/Skeleton";
import {
  Link,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useCart } from "../clientOrders/CartContext";
import type { CartItem } from "../clientOrders/CartContext";
import { getProductReviews } from "../../services/reviewService";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import { getPublicTableNumber } from "../../services/tableService";
import { HiArrowLeft } from "react-icons/hi";

// Límite de muestras
const PAGE_SIZE = 10;

type ProductToAdd = Omit<CartItem, "cartItemId" | "clientId">;

// Función para mostrar los productos
function ProductList({
  initialLoading,
  isFiltering,
  products,
  mesaId,
  selectedProductId,
  onViewMore,
  onCloseDetails,
  isAddingToOrder = false,
  onAddProduct,
}: {
  initialLoading: boolean;
  isFiltering: boolean;
  products: Product[];
  mesaId?: string;
  onDeleteProduct: (productId: number) => void;
  selectedProductId: number | null;
  onViewMore: (productId: number) => void;
  onCloseDetails: () => void;
  isAddingToOrder?: boolean;
  onAddProduct?: (item: ProductToAdd) => void;
}) {
  const visibleProducts =
    selectedProductId === null
      ? products
      : products.filter(
          (product) => product.productId === selectedProductId,
        );

  return (
    <div
      className={`contents transition-opacity duration-200 ${
        isFiltering ? "opacity-50" : "opacity-100"
      }`}
    >
      {initialLoading && (
        <>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-80 w-full rounded-2xl lg:w-87.5"
            />
          ))}
        </>
      )}

      {!initialLoading && products.length === 0 && (
        <p className="text-text-primary">No hay platillos...</p>
      )}

      {visibleProducts.map((product) => (
        <div
          key={product.productId}
          className={
            selectedProductId === product.productId
              ? "w-full lg:w-192.5"
              : "w-full lg:w-87.5"
          }
        >
          <DishCard
            name={product.productName ?? ""}
            description={product.description ?? ""}
            price={product.price}
            priceWithTax={product.priceWithTax}
discountedPriceWithTax={product.discountedPriceWithTax}
displayIvaRate={product.displayIvaRate}
            discount={Number(product.discount ?? 0)}
            image={product.image ?? ""}
            rating={product.rating}
            isAdmin={false}
            productId={product.productId}
            mesaId={mesaId}
            optionGroups={product.optionGroups}
            isDetailView={selectedProductId === product.productId}
            showReviews
            isAddingToOrder={isAddingToOrder}
            onAddProduct={onAddProduct}
            onViewMore={() => onViewMore(product.productId)}
            onCloseDetails={onCloseDetails}
          />
        </div>
      ))}
    </div>
  );
}

function MenuClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    null,
  );
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [tableInfo, setTableInfo] = useState<{
    mesaId: string;
    tableNumber: number;
  } | null>(null);

  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [currentOrderTableId, setCurrentOrderTableId] = useState<
    string | undefined
  >(undefined);

  const {
    cartCount,
    orderAddCount,
    setMesaId,
    addToOrderCart,
  } = useCart();

  const { mesaId, orderId, mode, returnTo } = useSearch({
    from: "/(menuClient)/menuClient",
  });

  const isAddingToOrder = mode === "add" && orderId !== undefined;

  // Recuperar la comanda actual de esta mesa
  useEffect(() => {
    const savedOrderId = localStorage.getItem("currentOrderId");
    const savedOrderTableId = localStorage.getItem("currentOrderTableId");

    if (!mesaId || !savedOrderId || !savedOrderTableId) {
      setCurrentOrderId(null);
      setCurrentOrderTableId(undefined);
      return;
    }

    if (savedOrderTableId !== mesaId) {
      localStorage.removeItem("currentOrderId");
      localStorage.removeItem("currentOrderTableId");

      setCurrentOrderId(null);
      setCurrentOrderTableId(undefined);
      return;
    }

    const parsedOrderId = Number(savedOrderId);

    if (Number.isInteger(parsedOrderId) && parsedOrderId > 0) {
      setCurrentOrderId(parsedOrderId);
      setCurrentOrderTableId(savedOrderTableId);
    } else {
      localStorage.removeItem("currentOrderId");
      localStorage.removeItem("currentOrderTableId");

      setCurrentOrderId(null);
      setCurrentOrderTableId(undefined);
    }
  }, [mesaId]);

  // Mantener identificada la mesa del carrito compartido
  useEffect(() => {
    setMesaId(mesaId);
  }, [mesaId, setMesaId]);

  // Obtener el número público de la mesa
  useEffect(() => {
    if (!mesaId) return;

    let isCurrentRequest = true;

    void getPublicTableNumber(mesaId)
      .then(({ tableNumber: number }) => {
        if (isCurrentRequest) {
          setTableInfo({ mesaId, tableNumber: number });
        }
      })
      .catch((error) => {
        console.error("Error loading table number:", error);

        if (isCurrentRequest) {
          setTableInfo(null);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [mesaId]);

  // Cargar productos con sus calificaciones
  const loadProductsWithRatings = async (products: Product[]) => {
    return Promise.all(
      products.map(async (product) => {
        try {
          const reviewData = await getProductReviews(product.productId);

          return {
            ...product,
            rating: reviewData.averageRating,
          };
        } catch {
          return {
            ...product,
            rating: 0,
          };
        }
      }),
    );
  };

  // Cargar categorías
  useEffect(() => {
    if (!mesaId) return;

    let isCurrentRequest = true;

    const loadCategories = async () => {
      setIsLoadingCategories(true);

      try {
        const data = await getCategories(mesaId);

        if (isCurrentRequest) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        if (isCurrentRequest) {
          setIsLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isCurrentRequest = false;
    };
  }, [mesaId]);

  // Cargar los productos
  useEffect(() => {
    if (!mesaId) {
      setInitialLoading(false);
      return;
    }

    let isCurrentRequest = true;

    const loadProducts = async () => {
      setSelectedProductId(null);
      setIsFiltering(true);

      try {
        const data = await getProducts({
          mesaId,
          search: searchTerm,
          category: searchTerm ? undefined : selectedCategory ?? undefined,
          limit: PAGE_SIZE,
          offset: 0,
        });

        const productsWithRatings = await loadProductsWithRatings(
          data.products,
        );

        if (isCurrentRequest) {
          setProducts(productsWithRatings);
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        if (isCurrentRequest) {
          setInitialLoading(false);
          setIsFiltering(false);
        }
      }
    };

    const delay = searchTerm ? 400 : 0;
    const timeoutId = setTimeout(() => {
      void loadProducts();
    }, delay);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, selectedCategory, mesaId]);

  // Cargar más productos
  const handleLoadMore = async () => {
    if (isLoadingMore || !mesaId) return;

    setIsLoadingMore(true);

    try {
      const data = await getProducts({
        mesaId,
        search: searchTerm,
        category: searchTerm ? undefined : selectedCategory ?? undefined,
        limit: PAGE_SIZE,
        offset: products.length,
      });

      const productsWithRatings = await loadProductsWithRatings(
        data.products,
      );

      setProducts((prev) => [...prev, ...productsWithRatings]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) =>
      prev.filter((product) => product.productId !== productId),
    );

    setSelectedProductId((current) =>
      current === productId ? null : current,
    );
  };

  const navigate = useNavigate();

  // Volver a la pantalla anterior al agregar productos
  const handleReturnFromAdd = () => {
    if (returnTo === "cashier" && orderId !== undefined) {
      void navigate({
        to: "/paymentMethod",
        search: { orderId },
      });

      return;
    }

    void navigate({
      to: "/waiterOrders",
    });
  };

  return (
    <main className="min-h-screen bg-white px-8 pt-8 lg:bg-neutral-50">
      {/* Celular */}
      <section className="lg:hidden">
        <div className="mt-4 flex flex-col gap-5">
          {isAddingToOrder && (
            <button
              type="button"
              onClick={handleReturnFromAdd}
              className="flex w-fit items-center gap-2 text-mint-dark"
            >
              <HiArrowLeft className="h-6 w-6" />
              <span className="font-semibold">Volver</span>
            </button>
          )}

          <div className="flex items-center justify-between">
            <RestaurantLogo className="h-16 w-16 object-contain" />

            <h2 className="text-2xl font-bold text-black">Menú</h2>

            {tableInfo && tableInfo.mesaId === mesaId && (
              <p className="font-bold text-mint-dark">
                Mesa #{tableInfo.tableNumber}
              </p>
            )}
          </div>

          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="mt-6 w-full"
          />

          <div className="mt-2">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={(id) => {
                setSelectedCategory(id);
                setSearchTerm("");
              }}
              disabled={!!searchTerm}
              isLoading={isLoadingCategories}
              mobileFiveColumns
            />
          </div>

          <div className="-mx-8 rounded-t-4xl bg-neutral-50 px-8 pb-20">
            <div className="mt-8 flex flex-col gap-4">
              <ProductList
                initialLoading={initialLoading}
                isFiltering={isFiltering}
                products={products}
                mesaId={mesaId}
                onDeleteProduct={handleDeleteProduct}
                selectedProductId={selectedProductId}
                onViewMore={setSelectedProductId}
                onCloseDetails={() => setSelectedProductId(null)}
                isAddingToOrder={isAddingToOrder}
                onAddProduct={addToOrderCart}
              />
            </div>

            {hasMore && selectedProductId === null && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="mt-6 w-full rounded-2xl border border-border bg-white py-3 text-base font-bold text-mint-dark disabled:opacity-50"
              >
                {isLoadingMore ? "Cargando..." : "Cargar más"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Computadora */}
      <section className="ml-44 hidden pb-20 lg:block">
        <div className="mt-8 flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-black">Menú</h2>

          {isAddingToOrder && (
            <button
              type="button"
              onClick={handleReturnFromAdd}
              className="flex items-center gap-2 text-mint-dark"
            >
              <span>Volver</span>
            </button>
          )}

          {tableInfo && tableInfo.mesaId === mesaId && (
            <p className="text-xl font-bold text-mint-dark">
              Mesa #{tableInfo.tableNumber}
            </p>
          )}
        </div>

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          className="mt-8 w-153"
        />

        <div className="mt-6">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={(id) => {
              setSelectedCategory(id);
              setSearchTerm("");
            }}
            disabled={!!searchTerm}
            isLoading={isLoadingCategories}
            mobileFiveColumns
          />
        </div>

        <h2 className="mt-8 text-2xl font-bold text-black">
          Menú popular
        </h2>

        <div className="mt-6 flex flex-wrap gap-4">
          <ProductList
            initialLoading={initialLoading}
            isFiltering={isFiltering}
            products={products}
            mesaId={mesaId}
            onDeleteProduct={handleDeleteProduct}
            selectedProductId={selectedProductId}
            onViewMore={setSelectedProductId}
            onCloseDetails={() => setSelectedProductId(null)}
            isAddingToOrder={isAddingToOrder}
            onAddProduct={addToOrderCart}
          />
        </div>

        {hasMore && selectedProductId === null && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="cursor-pointer rounded-lg border border-border bg-white px-8 py-3 text-base font-bold text-mint-dark disabled:opacity-50"
            >
              {isLoadingMore ? "Cargando..." : "Cargar más"}
            </button>
          </div>
        )}
      </section>

      {/* Acceso al carrito o a la comanda actual */}
      <div className="fixed bottom-2 left-8 right-8 z-50 flex h-12 items-center justify-center rounded-2xl border border-border bg-white lg:bottom-8 lg:left-10 lg:right-auto lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-20 lg:rounded-full lg:border-0">
        <RestaurantLogo className="absolute top-6 hidden h-16 w-16 object-contain lg:block" />

        {!isAddingToOrder && currentOrderId !== null ? (
          <Link
            to="/orderStatus"
            search={{
              orderId: currentOrderId,
              tableId: currentOrderTableId ?? mesaId,
            }}
            className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-mint-dark lg:top-1/2 lg:-translate-y-1/2"
          >
            <LuShoppingBag className="h-7 w-7 text-white" />
          </Link>
        ) : (
          <Link
            to="/checkOrder"
            search={{
              mesaId,
              orderId,
              mode,
              returnTo,
            }}
            className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-mint-dark lg:top-1/2 lg:-translate-y-1/2"
          >
            <LuShoppingBag className="h-7 w-7 text-white" />

            {(isAddingToOrder ? orderAddCount : cartCount) > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {isAddingToOrder ? orderAddCount : cartCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </main>
  );
}

export default MenuClient;
