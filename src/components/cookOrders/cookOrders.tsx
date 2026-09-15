import { useEffect, useState } from "react";
import { getOrders, markOrderReady } from "../../services/orderService";
import OrderCard from "./OrderCard";

function CookOrders() {
  const [orders, setOrders] = useState<Array<{
    orderId: number;
    tableId: number;
    status: string;
    items: Array<{ name: string; quantity: number; options?: Record<string, string> }>;
    specialInstructions?: string;
  }>>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      const backendOrders = await getOrders("in_preparation");

      setOrders(
        backendOrders.map((order) => ({
          orderId: order.orderId,
          tableId: order.tableId,
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
    void loadOrders();
  }, []);

  const handleReadyOrder = async (orderId: number) => {
    try {
      setUpdatingOrderId(orderId);
      await markOrderReady(orderId);
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
      <div className="h-22 bg-mint px-8 py-4">
        <img
          src="/img/LogoSBlanco.svg"
          alt="Logo del negocio"
          className="h-15.5 w-10 object-contain"
        />
      </div>

      <section className="px-8 pt-8">
        <div className="mx-auto max-w-300">
          <h1 className="text-4xl font-bold text-mint-dark">
            Pedidos
          </h1>

          <div className="mt-8 grid grid-cols-3 gap-6 pb-16">
            {orders.map((order) => (
              <OrderCard
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