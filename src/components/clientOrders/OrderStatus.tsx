import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiClock,
  HiStar,
} from "react-icons/hi";
import { GiCampCookingPot } from "react-icons/gi";
import { IoBagCheck } from "react-icons/io5";
import {
  getOrderStatus,
  stateToLabel,
  type FrontendOrderStatus,
} from "../../services/orderService";

type OrderStatusProps = {
  orderId: number;
  tableId?: string;
};

const statusContent: Record<
  FrontendOrderStatus,
  {
    icon: typeof HiClock;
    title: string;
    description: string;
  }
> = {
  Pendiente: {
    icon: HiClock,
    title: "Pedido pendiente",
    description: "Tu pedido fue recibido y está esperando confirmación.",
  },
  "En preparación": {
    icon: GiCampCookingPot,
    title: "Pedido en preparación",
    description: "La cocina ya está preparando tu pedido.",
  },
  Listo: {
    icon: HiCheckCircle,
    title: "Pedido listo",
    description: "Tu pedido está listo para ser entregado.",
  },
  Entregado: {
    icon: IoBagCheck,
    title: "Pedido entregado",
    description: "¡Disfruta tu pedido!",
  },
};

const statusOrder: FrontendOrderStatus[] = [
  "Pendiente",
  "En preparación",
  "Listo",
  "Entregado",
];

const statusIcons = {
  Pendiente: HiClock,
  "En preparación": GiCampCookingPot,
  Listo: HiCheckCircle,
  Entregado: IoBagCheck,
} satisfies Record<FrontendOrderStatus, typeof HiClock>;

function OrderStatus({ orderId, tableId }: OrderStatusProps) {
  const [status, setStatus] = useState<FrontendOrderStatus>("Pendiente");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

 const loadOrderStatus = async () => {
  try {
    const order = await getOrderStatus(orderId);

    console.log("ESTADO DE LA ORDEN:", order);

    if (isMounted) {
  const newStatus = stateToLabel[order.state];

  setStatus(newStatus);
  setError("");

  if (newStatus === "Entregado") {
    localStorage.removeItem("currentOrderId");
    localStorage.removeItem("currentOrderTableId");
  }
}
  } catch (loadError) {
    console.error("No se pudo consultar el estado del pedido:", loadError);

    if (isMounted) {
  const errorMessage =
    loadError && typeof loadError === "object" && "message" in loadError
      ? String(loadError.message)
      : "";

  if (errorMessage === "Orden no encontrada") {
    localStorage.removeItem("currentOrderId");
    localStorage.removeItem("currentOrderTableId");
    setError("");
    return;
  }

  setError("No se pudo actualizar el estado del pedido.");
}
  }
};

    void loadOrderStatus();
    const intervalId = window.setInterval(() => {
      void loadOrderStatus();
    }, 2000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [orderId]);

  const currentContent = statusContent[status];
  const currentStatusIndex = statusOrder.indexOf(status);

  return (
    <main className="min-h-screen bg-white">
      <div className="h-20 bg-mint" />

      <section className="-mt-10 min-h-[calc(100vh-5rem)] rounded-t-[40px] bg-white px-6 py-10 lg:px-10">
        <Link
          to="/menuClient"
          search={{ mesaId: tableId }}
          className="flex w-fit items-center gap-2 text-mint-dark"
        >
          <HiArrowLeft className="h-6 w-6" />
          <span className="text-2xl font-bold">Pedido</span>
        </Link>

        <div className="mx-auto mt-10 flex w-full max-w-2xl flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-mint-dark">
            Pedido #{orderId}
          </p>

          <currentContent.icon
            className="mt-6 h-64 w-full text-mint-dark sm:h-80"
            aria-label={currentContent.title}
            role="img"
          />

          <h1 className="mt-6 text-3xl font-bold text-mint-darker">
            {currentContent.title}
          </h1>
          <p className="mt-3 max-w-md text-base text-text-primary">
            {currentContent.description}
          </p>

          <div className="mt-8 grid w-full grid-cols-4 gap-2">
            {statusOrder.map((orderStatus, index) => (
              <div key={orderStatus} className="flex flex-col items-center gap-2">
                {(() => {
                  const StatusIcon = statusIcons[orderStatus];

                  return (
                    <StatusIcon
                      className={`h-6 w-6 ${index <= currentStatusIndex
                          ? "text-mint-dark"
                          : "text-gray-300"
                        }`}
                      aria-hidden="true"
                    />
                  );
                })()}
                <span
                  className={`text-xs ${index <= currentStatusIndex
                      ? "font-semibold text-mint-darker"
                      : "text-gray-400"
                    }`}
                >
                  {orderStatus}
                </span>
              </div>
            ))}
          </div>

          {status === "Entregado" && tableId && (
            <Link
              to="/reviewPlate"
              search={{ orderId, tableId }}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-mint-dark px-5 py-3 font-semibold text-white transition hover:bg-mint-darker"
            >
              <HiStar className="h-5 w-5" aria-hidden="true" />
              <span>Dejar reseñas de tu pedido</span>
            </Link>
          )}

          {error && <p className="mt-6 text-sm text-red-500">{error}</p>}
        </div>
      </section>
    </main>
  );
}

export default OrderStatus;
