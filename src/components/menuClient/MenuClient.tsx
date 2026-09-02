import { useEffect, useState } from "react";
import { getProducts, type Product } from "../../services/productService";
import { LuShoppingBag } from "react-icons/lu";
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
}: {
  initialLoading: boolean;
  isFiltering: boolean;
  products: Product[];
  onDeleteProduct: (productId: number) => void;
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
            isAdmin={false}
            productId={product.productId}
            onDelete={onDeleteProduct}
          />
        </div>
      ))}
    </div>
  );
}



function MenuClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasMore , setHasMore]=useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);



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

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((product) => product.productId !== productId));
  };


  return (
     
      <main className="min-h-screen bg-white px-8 pt-8 lg:bg-neutral-50">
        {/* Celular */}
        <section className="lg:hidden">

            <div className="mt-4 flex flex-col gap-5">
            <div className="flex justify-start">
            <img src="/img/logoS.png" alt="Logo del negocio" />
            
          </div>
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
            <div className="mt-8 flex flex-col gap-4">
              <ProductList
                initialLoading={initialLoading}
                isFiltering={isFiltering}
                products={products}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>

            {hasMore && (
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

        <section className="hidden lg:block ml-44 pb-20">
        

          <h2 className="mt-8 text-2xl font-bold text-black">Menú</h2>

          

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
            />
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center ">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="rounded-lg cursor-pointer bg-white border border-border px-8 py-3 text-base font-bold text-mint-dark disabled:opacity-50"
              >
                {isLoadingMore ? "Cargando..." : "Cargar más"}
              </button>
                  </div>
                  
          )}
          </section>
          
          <div className="fixed bottom-2 left-8 right-8 z-50 flex h-12 items-center justify-center rounded-2xl border border-border bg-white lg:bottom-8 lg:left-10 lg:right-auto lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-20 lg:rounded-full lg:border-0">
            
              <img
                  src="/img/logoS.png"
                  alt="Logo del negocio"
                  className="absolute top-6 hidden h-15 w-15 object-contain lg:block"
              />
              <div className="absolute cursor-pointer flex h-14 w-14 items-center justify-center rounded-full bg-mint-dark lg:top-1/2 lg:-translate-y-1/2">
                  <LuShoppingBag className="h-7 w-7 text-white " />
              </div>
          </div>

      </main>
    
  );
}

export default MenuClient;
