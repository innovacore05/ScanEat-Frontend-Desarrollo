import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";
import { getProducts, type Product } from "../../services/productService";
import { HiArrowLeft } from "react-icons/hi";
import { GoPlus } from "react-icons/go";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DishCard from "../menu/DishCard";
import CategoryFilter from "../menu/CategoryFilter";
import SearchBar from "../menu/SearchBar";


//limite de muestras
const PAGE_SIZE = 10;


//funcion de carga de datos de platillos/productos desde la bd:
function ProductList({
  initialLoading,
  isFiltering,
  products,
  onDeleteProduct,
	selectedProductId,
	onViewMore,
	onCloseDetails,
}: {
  initialLoading: boolean;
  isFiltering: boolean;
  products: Product[];
  onDeleteProduct: (productId: number) => void;
	selectedProductId: number | null;
	onViewMore: (productId: number) => void;
	onCloseDetails: () => void;
}) {
	const visibleProducts = selectedProductId === null
		? products
		: products.filter((product) => product.productId === selectedProductId);
  return (
    <div
      className={`contents transition-opacity duration-200 ${
        isFiltering ? "opacity-50" : "opacity-100"
      }`}
    >
      {initialLoading && (
        <p className="text-text-primary">Cargando platillos...</p>
      )}
      {!initialLoading && products.length === 0 && (
        <p className="text-text-primary">No hay platillos...</p>
      )}

		{visibleProducts.map((product) => (
		<div key={product.productId} className={selectedProductId === product.productId ? "w-full lg:w-192.5" : "w-full lg:w-87.5"}>
          <DishCard
            name={product.productName ?? ""}
            description={product.description ?? ""}
            price={product.price}
            image={product.image ?? ""}
            rating={product.rating}
            isAdmin={true}
            productId={product.productId}
            onDelete={onDeleteProduct}
			isDetailView={selectedProductId === product.productId}
			onViewMore={() => onViewMore(product.productId)}
			onCloseDetails={onCloseDetails}
          />
        </div>
      ))}
    </div>
  );
}



function MenuManagment() {
  const [firstName, setFirstName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasMore , setHasMore]=useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [selectedProductId, setSelectedProductId] = useState<number | null>(null);


  // cargar el perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setFirstName(data.user.firstName);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  //cargar los productos
  useEffect(() => {
    const loadProducts = async () => {
		setSelectedProductId(null);
      setIsFiltering(true);
      try {
        const data = await getProducts({
          search: searchTerm,
		  //si hay texto en elbuscador se ignora categoria
          category: searchTerm ? undefined : selectedCategory ?? undefined,
          limit:PAGE_SIZE,
          offset:0
        });
        setProducts(data.products);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setInitialLoading(false);
        setIsFiltering(false);
      }
    };
    //duracion de carga entre busqueda o filtro
    const delay = searchTerm ? 400 : 0;
    const timeoutId = setTimeout(loadProducts, delay);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const handleLoadMore=async()=>{
    setIsLoadingMore(true);
    try{
      const data = await getProducts({
        search: searchTerm,
        category: searchTerm ? undefined : selectedCategory ?? undefined,
        limit: PAGE_SIZE,
        offset: products.length,
      });
		setProducts((prev)=>[...prev, ...data.products]);
		setHasMore(data.hasMore)
	}catch(error){
      console.error("Error loading more products:", error);
  } finally {
      setIsLoadingMore(false);
    }
};

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((product) => product.productId !== productId));
		setSelectedProductId((current) => current === productId ? null : current);
  };


  return (
    <DashboardLayout>
      <main className="min-h-screen bg-brand-white  ">
        {/* Celular */}
        <section className="lg:hidden px-8 ">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard" 
              className="flex items-center gap-2 text-mint-dark"
            >
              <HiArrowLeft className="h-6 w-6" />

              <span className="text-[32px] font-bold">Menú</span>
            </Link>
          </div>
          
          <div className="mt-6 flex flex-col gap-4">
            <Link
              to="/simpleDishForm"
              className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo simple
              </span>

              <GoPlus className="h-6 w-6 shrink-0 text-mint-dark" />
            </Link>

            <Link
              to="/customDishForm"
              className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo personalizado
              </span>

              <GoPlus className="h-6 w-6 shrink-0 text-mint-dark" />
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-5  bg-white  ">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              className="mt-6 w-full"
            />

            <div className="mt-2">
              <CategoryFilter
                selected={selectedCategory}
                onSelect={(id) => {
                  setSelectedCategory(id);
                  setSearchTerm("");
                }}
                disabled={!!searchTerm}
              />
            </div>

             <div className="-mx-8  bg-neutral-50 px-8 pb-20 rounded-t-4xl ">
            <div className=" mt-8 flex flex-col gap-4">
              <ProductList
                initialLoading={initialLoading}
                isFiltering={isFiltering}
                products={products}
                onDeleteProduct={handleDeleteProduct}
				selectedProductId={selectedProductId}
				onViewMore={setSelectedProductId}
				onCloseDetails={() => setSelectedProductId(null)}
              />
            </div>

			{hasMore && selectedProductId === null && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full mt-6  rounded-2xl bg-white border border-border py-3 text-base font-bold text-mint-dark disabled:opacity-50"
              >
                {isLoadingMore ? "Cargando..." : "Cargar más"}
              </button>
            )}

          </div>
          </div>
        </section>

        {/* Computadora */}

        <section className="hidden px-15 py-15 lg:block">
          <div className="rounded-2xl bg-mint-dark px-8 py-6">
            <h1 className="text-3xl font-bold text-white ">
              ¡Hola, {firstName ? `${firstName}!` : "Usuario!"}
            </h1>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-black">Menú</h2>

          <div className="mt-6 flex gap-4">
            <Link
              to="/simpleDishForm"
              className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo simple
              </span>

              <GoPlus className="h-6 w-6 shrink-0 text-mint-dark" />
            </Link>

            <Link
              to="/customDishForm"
              className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo personalizado
              </span>

              <GoPlus className="h-6 w-6 shrink-0 text-mint-dark" />
            </Link>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="mt-8 w-153"
          />

          <div className="mt-6">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={(id) => {
                setSelectedCategory(id);
                setSearchTerm(""); 
              }}
              disabled={!!searchTerm}
            />
          </div>
  
          <h2 className="mt-8 text-2xl font-bold text-black">Menú popular</h2>

          {/* Platillos */}
          <div className="mt-6 flex flex-wrap gap-4">
            <ProductList
              initialLoading={initialLoading}
              isFiltering={isFiltering}
              products={products}
              onDeleteProduct={handleDeleteProduct}
				selectedProductId={selectedProductId}
				onViewMore={setSelectedProductId}
				onCloseDetails={() => setSelectedProductId(null)}
            />
          </div>

		  {hasMore && selectedProductId === null && (
            <div className="mt-6 flex justify-center ">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="rounded-lg bg-white border border-border px-8 py-3 text-base font-bold text-mint-dark disabled:opacity-50"
              >
                {isLoadingMore ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}

export default MenuManagment;
