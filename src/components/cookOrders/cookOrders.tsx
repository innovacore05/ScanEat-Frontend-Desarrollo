import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getKitchenOrders, markKitchenOrderReady } from "../../services/orderService";
import { logout } from "../../services/authService";
import OrderCardCook from "./OrderCardCook";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import { LuLogOut } from "react-icons/lu";
import { socket } from "../../services/socketClient";

function CookOrders() {
  const [orders, setOrders] = useState<Array<{
    orderId: number;
    tableId: number;
    time: string;
    date: string,
    status: string;
    items: Array<{ name: string; quantity: number; options?: Record<string, string> }>;
    specialInstructions?: string;
  }>>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      const backendOrders = await getKitchenOrders();

      setOrders(
        backendOrders.map((order) => ({
          orderId: order.orderId,
          tableId: order.tableId,
          time: order.time,
          date: order.date,
          status: order.status,
          items: order.items,
          specialInstructions: order.specialInstructions,
        })),
      );
    } catch (error) {
      console.error("No se pudieron cargar los pedidos del cocinero:", error);
      setOrders([]);
    }
  };

  useEffect(() => {   

    const handleKitchenOrdersUpdated = () => {
      void loadOrders();
    };

    const handleConnect = () => {
      void loadOrders();
    };

    socket.on("kitchen_orders_updated", handleKitchenOrdersUpdated);
    socket.on("connect", handleConnect);

    if (socket.connected) {
      void loadOrders();
    } else {
      socket.connect();
    }
    
    return () => {
      socket.off("kitchen_orders_updated", handleKitchenOrdersUpdated);
      socket.off("connect", handleConnect);
    };

    
  }, []);
  

  const handleReadyOrder = async (orderId: number) => {
    try {
      setUpdatingOrderId(orderId);
      await markKitchenOrderReady(orderId);
      await loadOrders();
    } catch (error) {
      console.error("No se pudo marcar la orden como lista:", error);
      alert("No se pudo cambiar el estado de la orden.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex h-30 items-center justify-between gap-4 bg-neutral-50 border-b-4 border-mint-dark px-4 py-4 sm:px-8">
        <RestaurantLogo className="h-16 w-16 object-contain " />
        <Link
          to="/login"
          onClick={logout}
          className="flex items-center justify-center gap-2 rounded-2xl bg-mint-dark hover:bg-mint-darker px-3 py-3 text-base font-bold text-white sm:gap-3 sm:px-8 sm:py-4 sm:text-xl"
        >
          <LuLogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Cerrar sesión</span>
        </Link>
      </div>

      <section className="px-8 pt-8">
        <div className="mx-auto max-w-300">
          <h1 className="text-4xl font-bold text-mint-dark">
            Pedidos
          </h1>

          <div className="mt-8 grid grid-cols-3 gap-6 pb-16">
            {orders.map((order) => (
              <OrderCardCook
                key={order.orderId}
                order={order}
                onReady={() => void handleReadyOrder(order.orderId)}
                isUpdating={updatingOrderId === order.orderId}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default CookOrders;
