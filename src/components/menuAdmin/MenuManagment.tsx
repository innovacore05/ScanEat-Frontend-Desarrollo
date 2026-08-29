import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";
import { getProducts, type Product } from "../../services/productService";
import { HiArrowLeft } from "react-icons/hi";
import { GoPlus } from "react-icons/go";
import { IoSearch } from "react-icons/io5";
import { LuCakeSlice } from "react-icons/lu";
import { RiDrinks2Line } from "react-icons/ri";
import { GiCoffeeCup } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { LuUtensils } from "react-icons/lu";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DishCard from "../menu/DishCard";


//limite de muestras
const PAGE_SIZE = 10;

//categorias asociadas a iconos
const CATEGORIES = [
  { id: 1, name: "Postres", icon: LuCakeSlice },
  { id: 2, name: "Bebidas", icon: RiDrinks2Line },
  { id: 3, name: "Café", icon: GiCoffeeCup },
  { id: 4, name: "Salados", icon: LuSandwich },
  { id: 5, name: "Almuerzos", icon: LuUtensils },
];

//funcion de carga de datos de platillos/productos desde la bd:
function ProductList({
  initialLoading,
  isFiltering,
  products,
}: {
  initialLoading: boolean;
  isFiltering: boolean;
  products: Product[];
}) {
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

      {products.map((product) => (
        <div key={product.productId} className="w-full lg:w-87.5">
          <DishCard
            name={product.productName ?? ""}
            description={product.description ?? ""}
            price={product.price}
            image={product.image ?? ""}
            rating={product.rating}
            isAdmin={true}
          />
        </div>
      ))}
    </div>
  );
}

// filtro de categoria apagado visual
function CategoryFilter({

selected,
onSelect,
disabled,

}:{
	 selected: number | null;
  onSelect: (id: number | null) => void;
  disabled: boolean;
}){
	return(

<div>
      <p className="mb-3 text-base font-bold text-text-primary">Filtro</p>
      <div className="flex items-center gap-5">
        {CATEGORIES.map(({ id, name, icon: Icon }) => {
          const active = !disabled && selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(active ? null : id)}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white transition
                ${active ? "bg-brand-mint-darker" : "bg-brand-mint-dark"}`}
              aria-label={name}
              aria-pressed={active}
            >
              <Icon className="h-8 w-8" />
            </button>
          );
        })}
      </div>
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



  return (
    <DashboardLayout>
      <main className="min-h-screen bg-brand-white px-8 py-8">
        {/* Celular */}
        <section className="lg:hidden">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-brand-mint-dark"
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

              <GoPlus className="h-6 w-6 shrink-0 text-brand-mint-dark" />
            </Link>

            <Link
              to=""
              className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo personalizado
              </span>

              <GoPlus className="h-6 w-6 shrink-0 text-brand-mint-dark" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-5">
  <div className="mt-6 flex items-center rounded-lg border border-border bg-white px-4 py-3">
              <input
                type="text"
                placeholder="Buscar un platillo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-base font-normal text-text-primary outline-none placeholder:text-text-primary"
              />
 
              <IoSearch className="ml-3 h-6 w-6 shrink-0 text-brand-mint-dark" />
            </div>
 
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

            <div className="mt-8 flex flex-col gap-4">
              <ProductList
                initialLoading={initialLoading}
                isFiltering={isFiltering}
                products={products}
              />
            </div>

 {hasMore && (
      <button
        type="button"
        onClick={handleLoadMore}
        disabled={isLoadingMore}
        className="rounded-lg border border-border py-3 text-base font-bold text-brand-mint-dark disabled:opacity-50"
      >
        {isLoadingMore ? "Cargando..." : "Cargar más"}
      </button>
    )}


  {/* <Link
              to="/simpleDishForm"
              className="flex items-center rounded-lg border border-border px-4 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo simple
              </span>
            </Link>

            <Link
              to=""
              className="flex items-center rounded-lg border border-border px-4 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo personalizado
              </span>
            </Link> */}

          </div>
       
        </section>

        {/* Computadora */}

        <section className="hidden lg:block">
          <div className="rounded-2xl bg-brand-mint-dark px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              Hola, {firstName ? `${firstName}!` : "Usuario!"}
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

              <GoPlus className="h-6 w-6 shrink-0 text-brand-mint-dark" />
            </Link>

            <Link
              to=""
              className="flex items-center justify-between gap-8 rounded-lg border border-border px-5 py-3"
            >
              <span className="text-base font-bold text-text-primary">
                Añadir un platillo personalizado
              </span>

              <GoPlus className="h-6 w-6 shrink-0 text-brand-mint-dark" />
            </Link>
          </div>

          <div className="mt-8 w-2/5 flex items-center rounded-lg border border-border bg-white px-4 py-3">
            <input
              type="text"
              placeholder="Buscar un platillo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-base font-normal text-text-primary outline-none placeholder:text-text-primary"
            />

            <IoSearch className="ml-3 h-6 w-6 shrink-0 text-brand-mint-dark" />
          </div>
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
            />
          </div>

{hasMore && (
  <div className="mt-6 flex justify-center">
    <button
      type="button"
      onClick={handleLoadMore}
      disabled={isLoadingMore}
      className="rounded-lg border border-border px-8 py-3 text-base font-bold text-brand-mint-dark disabled:opacity-50"
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
