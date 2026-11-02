import { useCallback, useEffect, useRef, useState } from "react";
import { GiRoundTable } from "react-icons/gi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOrders } from "../../services/orderService";
import Skeleton from "../shared/Skeleton";

function PendingTables() {
  const [tables, setTables] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1,
    );
  }, []);

  const scrollTables = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: direction === "right" ? container.clientWidth : -container.clientWidth,
      behavior: "smooth",
    });
  };

  const tablePages = tables.reduce<number[][]>((pages, tableNumber, index) => {
    const pageIndex = Math.floor(index / 3);

    if (!pages[pageIndex]) {
      pages[pageIndex] = [];
    }

    pages[pageIndex].push(tableNumber);
    return pages;
  }, []);

  useEffect(() => {
    const loadPendingTables = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const orders = await getOrders("pending");

        const tableNumbers = [
          ...new Set(orders.map((order) => order.tableId)),
        ].sort((a, b) => a - b);

        setTables(tableNumbers);
      } catch (error) {
        console.error("Error cargando las mesas pendientes:", error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPendingTables();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container || isLoading || tables.length === 0) {
      return;
    }

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [isLoading, tables.length, updateScrollState]);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h2 className="text-base font-semibold text-black">
        Mesas pendientes
      </h2>

      <div className="flex min-h-28 flex-col rounded-xl bg-mint-dark p-4">
        {isLoading ? (
          <div className="flex flex-1 items-center gap-3 overflow-hidden">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton
                key={index}
                className="mx-auto h-10 w-10 shrink-0 rounded-full bg-white/30"
              />
            ))}
          </div>
        ) : error ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-white">
            No se pudieron cargar las mesas.
          </p>
        ) : tables.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-white">
            No hay mesas con pedidos pendientes.
          </p>
        ) : (
          <div className="relative flex min-h-20 items-center">
            <button
              type="button"
              aria-label="Ver mesas anteriores"
              onClick={() => scrollTables("left")}
              disabled={!canScrollLeft}
              className="absolute left-0 z-10 rounded-full bg-white/25 p-1 text-white transition hover:bg-white/40 disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tablePages.map((page, pageIndex) => (
                <div
                  key={pageIndex}
                  className="flex w-full shrink-0 snap-start"
                >
                  {page.map((tableNumber, index) => (
                    <div
                      key={tableNumber}
                      className={`flex basis-1/3 flex-col items-center gap-2 px-2 ${
                        index < page.length - 1
                          ? "border-r border-white/80"
                          : ""
                      }`}
                    >
                      <GiRoundTable className="h-10 w-10 rounded-xl bg-white/20 p-1 text-white" />

                      <p className="text-lg font-semibold text-white">
                        {tableNumber}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <button
              type="button"
              aria-label="Ver más mesas"
              onClick={() => scrollTables("right")}
              disabled={!canScrollRight}
              className="absolute right-0 z-10 rounded-full bg-white/25 p-1 text-white transition hover:bg-white/40 disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingTables;
