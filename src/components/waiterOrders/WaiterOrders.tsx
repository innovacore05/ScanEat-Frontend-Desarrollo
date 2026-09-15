import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import FilterOrders from "../waiterOrders/FilterOrders";
import SearchOrders from "../waiterOrders/SearchOrders";
import DashboardLayoutWaiter from "../layout/DashboardLayoutWaiter";
import { getStoredFirstName } from "../../services/authService";
import WaiterOrderCard from "../waiterOrders/WaiterOrderCard";
import type { Order } from "../waiterOrders/WaiterOrderCard";
import OrderDetails from "../Orders/OrderDetails";
import { getOrders, statusIdToState } from "../../services/orderService";

function WaiterOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [firstName] = useState(getStoredFirstName);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    null,
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    try {
      const backendOrders = await getOrders(selectedCategory ? statusIdToState[selectedCategory] : undefined);
      setOrders(backendOrders);
      setSelectedOrder((current) => {
        if (current && backendOrders.some((order) => order.orderId === current.orderId)) {
          return backendOrders.find((order) => order.orderId === current.orderId) ?? current;
        }

        return backendOrders[0] ?? null;
      });
    } catch (error) {
      console.error("No se pudieron cargar los pedidos:", error);
      setOrders([]);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [selectedCategory]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.tableId.toString().includes(searchTerm.trim()) ||
      order.orderId.toString().includes(searchTerm.trim());

    return matchesSearch;
  });

  return (
    <DashboardLayoutWaiter>
      <main className="min-h-screen bg-brand-white">

              
        {/* Celular */}
        <section className="px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboardWaiter"
              className="flex items-center gap-2 text-mint-dark"
            >
              <HiArrowLeft className="h-6 w-6" />

              <span className="text-[32px] font-bold">
                Pedidos
              </span>
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-5 bg-white">
            <SearchOrders
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              className="w-full"
            />

            <div className="mt-2">
              <FilterOrders
                selected={selectedCategory}
                onSelect={(id) => {
                  setSelectedCategory(id);
                  setSearchTerm("");
                }}
                disabled={!!searchTerm}
              />
            </div>

            <p className="mt-4 text-2xl font-bold text-mint-dark">
              Pedidos
            </p>

            <div className="flex flex-col gap-8 pb-20">
              {filteredOrders.map((order) => (
                <WaiterOrderCard
                  key={order.orderId}
                  order={order}
                  onDetails={() => setSelectedOrder(order)}
                />
              ))}
            </div>
          </div>
        </section>

              

        {/* Computadora */}
        <section className="hidden px-15 py-15 lg:block">
          <div className="rounded-2xl bg-mint-dark px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              ¡Hola, {firstName ? `${firstName}!` : "Usuario!"}
            </h1>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-black">
            Pedidos
          </h2>

          <SearchOrders
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="mt-8 w-153"
          />

          <div className="mt-6">
            <FilterOrders
              selected={selectedCategory}
              onSelect={(id) => {
                setSelectedCategory(id);
                setSearchTerm("");
              }}
              disabled={!!searchTerm}
            />
          </div>

          <div className="mt-8 grid grid-cols-[minmax(0,612px)_minmax(280px,1fr)] gap-6">
            {/* Pedidos */}
            <div className="flex flex-col gap-12">
              {filteredOrders.map((order) => (
                <WaiterOrderCard
                  key={order.orderId}
                  order={order}
                  onDetails={() => setSelectedOrder(order)}
                />
              ))}
            </div>

            {/* Detalles */}
                      <div>
                          <p className="pb-4 text-xl text-text-primary font-bold ">Orden actual</p>
              {selectedOrder ? (
                <OrderDetails
                  order={selectedOrder}
                  embedded
                  onStatusChanged={loadOrders}
                />
              ) : (
                <div className="flex min-h-80 items-center justify-center rounded-4xl bg-neutral-100 px-8">
                  <p className="text-lg font-semibold text-text-primary">
                    Selecciona un pedido para ver sus detalles
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </DashboardLayoutWaiter>
  );
}

export default WaiterOrders;