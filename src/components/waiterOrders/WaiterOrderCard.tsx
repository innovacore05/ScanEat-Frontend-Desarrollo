import { Link } from "@tanstack/react-router";


type OrderItem = {
  name: string;
    quantity: number;
  price: number;
  options?: Record<string, string>;
};

export type Order = {
  orderId: number;
  tableId: number;
  time: string;
  specialInstructions?: string;
  price: string;
  items: OrderItem[];
  status?: "Pendiente" | "En preparación" | "Listo" | "Entregado";
};

type WaiterOrderCardProps = {
    order: Order;
    onDetails?: () => void;
};

function WaiterOrderCard({ order, onDetails}: WaiterOrderCardProps) {
  return (
    <div>
      <div className="w-full min-w-0 h-full bg-neutral-100 py-6 px-6 lg:px-8 rounded-2xl flex items-center justify-between gap-6">
        <div className="flex flex-col gap-4 min-w-0">
          <h2 className="text-xl font-bold text-mint-dark">
            Mesa #{order.tableId}
          </h2>

          <h2 className="w-fit text-lg font-bold text-text-primary bg-neutral-300 py-2 px-2 rounded-lg">
            Orden #{order.orderId}
          </h2>

          <p className="text-base font-semibold text-mint-dark">
            Estado: {order.status}
          </p>

          <p className="text-base font-semibold text-text-primary">
            Hora: {order.time}
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8 shrink-0">
  <p className="py-2 rounded-lg text-base font-semibold bg-mint-dark text-white w-20 text-center">
    {order.price}
  </p>

  {/* Celular */}
  <Link
    to="/waiterOrderDetails"
    search={{ orderId: order.orderId }}
    className="text-center w-20 rounded-lg border border-mint-dark py-2 text-sm font-bold text-mint-darker cursor-pointer hover:bg-mint/10 lg:hidden"
  >
    Detalles
  </Link>

  {/* Computadora */}
  <button
    type="button"
    onClick={onDetails}
    className="hidden w-20 cursor-pointer rounded-lg border border-mint-dark py-2 text-sm font-bold text-mint-darker hover:bg-mint/10 lg:block"
  >
    Detalles
  </button>
</div>
      </div>
    </div>
  );
}

export default WaiterOrderCard;