import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  getProfile,
  getStoredEmail,
  getStoredFirstName,
  getStoredLastName,
  logout,
} from "../../services/authService";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaRegCircleUser } from "react-icons/fa6";
import { LuLogOut } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { IoRestaurantOutline } from "react-icons/io5";
import { LuShoppingBag } from "react-icons/lu";
import { MdOutlineDiscount } from "react-icons/md";
import { MdOutlineTableBar } from "react-icons/md";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import { AnimatePresence, motion } from "motion/react";
import { HiCheckCircle, HiX } from "react-icons/hi";
import { socket } from "../../services/socketClient";
import { getOrders } from "../../services/orderService";
import { useBell } from "../../hooks/useBell";

type OrderReadyEvent = {
  orderId?: number;
  tableNumber?: number;
  order?: {
    orderId?: number;
    tableNumber?: number;
    table?: {
      tableNumber?: number;
    };
  };
  table?: {
    tableNumber?: number;
  };
};

type WaiterNotification = {
  id: string;
  type: "ready" | "new";
  tableNumber: number | null;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutWaiter({ children }: DashboardLayoutProps) {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [firstName, setFirstName] = useState(getStoredFirstName);
  const [lastName, setLastName] = useState(getStoredLastName);
  const [email, setEmail] = useState(getStoredEmail);
  const [notifications, setNotifications] = useState<WaiterNotification[]>([]);
  const knownOrderIdsRef = useRef<Set<number> | null>(null);
  const notificationSequenceRef = useRef(0);
  const { playBell } = useBell();

  const addNotification = (
    type: WaiterNotification["type"],
    tableNumber: number | null,
    orderId?: number,
  ) => {
    notificationSequenceRef.current += 1;
    const id = `${type}-${orderId ?? "unknown"}-${notificationSequenceRef.current}`;

    setNotifications((current) => [
      { id, type, tableNumber },
      ...current,
    ]);
  };
//Cuando llega orden desde cocina (pedido listo) se reproduce sonido y se agrega notificación
  useEffect(() => {
    const handleOrderReady = async (event: OrderReadyEvent = {}) => {
      playBell("waiter");

      const eventTableNumber =
        event.tableNumber ??
        event.order?.tableNumber ??
        event.order?.table?.tableNumber ??
        event.table?.tableNumber ??
        null;

      let tableNumber = eventTableNumber;
      if (tableNumber === null) {
        try {
          const updatedOrders = await getOrders();
          const eventOrderId = event.orderId ?? event.order?.orderId;
          const readyOrder = eventOrderId
            ? updatedOrders.find((order) => order.orderId === eventOrderId)
            : updatedOrders.find((order) => order.status === "Listo");

          tableNumber = readyOrder?.tableId ?? null;
        } catch (error) {
          console.error("No se pudo identificar la mesa del pedido listo:", error);
        }
      }

      addNotification(
        "ready",
        tableNumber,
        event.orderId ?? event.order?.orderId,
      );
    };

    socket.on("waiter:order-ready", handleOrderReady);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("waiter:order-ready", handleOrderReady);
    };
  }, [playBell]);

  //Cuando llega orden desde cliente (pedido nuevo) solo se agrega notificación por el momento
  useEffect(() => {
    const loadKnownOrders = async () => {
      try {
        const orders = await getOrders();
        knownOrderIdsRef.current = new Set(
          orders.map((order) => order.orderId),
        );
      } catch (error) {
        console.error("No se pudieron preparar las notificaciones de pedidos:", error);
      }
    };

    const handleNewOrder = async (event: OrderReadyEvent = {}) => {
      let updatedOrders;
      try {
        updatedOrders = await getOrders();
      } catch (error) {
        console.error("No se pudo comprobar si llegó un nuevo pedido:", error);
        return;
      }

      const currentOrderIds = new Set(
        updatedOrders.map((order) => order.orderId),
      );
      const knownOrderIds = knownOrderIdsRef.current;
      knownOrderIdsRef.current = currentOrderIds;

      if (!knownOrderIds) {
        return;
      }

      const eventOrderId = event.orderId ?? event.order?.orderId;
      const newOrder = eventOrderId
        ? !knownOrderIds.has(eventOrderId)
          ? updatedOrders.find((order) => order.orderId === eventOrderId)
          : undefined
        : updatedOrders.find((order) => !knownOrderIds.has(order.orderId));

      if (!newOrder) {
        return;
      }

      const eventTableNumber =
        event.tableNumber ??
        event.order?.tableNumber ??
        event.order?.table?.tableNumber ??
        event.table?.tableNumber ??
        null;

      let tableNumber = eventTableNumber;
      if (tableNumber === null) {
        try {
          tableNumber = newOrder.tableId;
        } catch (error) {
          console.error("No se pudo identificar la mesa del nuevo pedido:", error);
        }
      }

      addNotification("new", tableNumber, newOrder.orderId);
    };

    socket.on("waiter_orders_updated", handleNewOrder);
    void loadKnownOrders();

    return () => {
      socket.off("waiter_orders_updated", handleNewOrder);
    };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setEmail(data.user.email);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="notification-stack fixed right-4 top-4 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-96 flex-col gap-3 overflow-y-auto pr-1 sm:right-6">
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            role="alert"
            aria-live={notification.type === "ready" ? "assertive" : "polite"}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.92, height: 0, marginTop: -12 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="flex items-start gap-3 rounded-2xl border border-mint-dark bg-white p-4 text-mint-darker shadow-sm"
          >
            <HiCheckCircle
              aria-hidden="true"
              className="mt-0.5 h-7 w-7 shrink-0 text-mint-dark"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold">
                {notification.type === "ready"
                  ? notification.tableNumber === null
                    ? "Pedido listo para entregar"
                    : `El pedido de la mesa #${notification.tableNumber} está listo para entregar`
                  : notification.tableNumber === null
                    ? "Nuevo pedido recibido"
                    : `Nuevo pedido de la mesa #${notification.tableNumber}`}
              </p>
            </div>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() =>
                setNotifications((current) =>
                  current.filter((item) => item.id !== notification.id),
                )
              }
              className="rounded-full p-1 text-text-primary transition-colors hover:bg-neutral-100"
            >
              <HiX aria-hidden="true" className="h-5 w-5" />
            </button>
          </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Barra lateral - COMPUTADORA */}

      <motion.aside
  className="fixed left-0 top-0 hidden h-screen overflow-y-auto w-66 bg-neutral-50 px-8 py-8 lg:flex lg:flex-col rounded-r-4xl"
  initial={{ opacity: 0, x: -30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  
        <div className="flex justify-start">
          <RestaurantLogo className="h-16 w-16 object-contain" />
        </div>
        <div className="mt-10 border-t border-neutral-300 "></div>



        <nav className=" flex flex-col gap-3 mt-6">
          <Link
            to="/dashboardWaiter"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <GoHome className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer ">Inicio</span>
          </Link>

          <Link
            to="/menuWaiter"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <IoRestaurantOutline className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold">Menú</span>
          </Link>

          <Link
            to="/waiterOrders"
            onClick={() => setIsMenuOpen(false)}
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <LuShoppingBag className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">
              Pedidos
            </span>
          </Link>

          <Link
            to="/discountProducts"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <MdOutlineDiscount className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold cursor-pointer">
              Descuentos
            </span>
          </Link>


          <Link
            to="/tablesManagment"
            onClick={() => setIsMenuOpen(false)}
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <MdOutlineTableBar className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold cursor-pointer">
              Mesas
            </span>
          </Link>

        </nav>

        <div className="mt-5 border-t border-neutral-300 pt-5 ">


          {/* //cerrar sesion normal , regresa al registro inicio de sesion/ */}
          <Link
            to="/login"
            onClick={logout}
            className="relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500"
          >
            <LuLogOut className="h-6 w-6 shrink-0 " />

            <span className="text-[15px] font-bold cursor-pointer ">
              Cerrar sesión
            </span>
          </Link>

          <div className="mt-5 border-t border-neutral-300  "></div>

        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <FaRegCircleUser className="h-9 w-9 shrink-0 text-mint-darker" />

            <div className="min-w-0">
              <p className="truncate font-bold text-mint-darker">
                {firstName || "Usuario"} {lastName}
              </p>

              <p className="truncate text-sm text-mint-darker">
                {email || "correo electrónico"}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>



      <div className="lg:ml-64">
        {/* Barra superior - TELÉFONO Y TABLET */}
        <div className="px-6 pt-8 lg:hidden">
          <div className="flex justify-start">
            <RestaurantLogo className="h-15.5 w-10 object-contain" />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
              }}
              className="cursor-pointer text-mint-dark"
              aria-label="Abrir menú"
            >
              <GiHamburgerMenu className="h-8 w-8" />
            </button>


          </div>
        </div>

        {children}
      </div>

      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsMenuOpen(false)}
            className={`fixed inset-0 z-40 cursor-default bg-transparent transition-opacity duration-300 lg:hidden ${isMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
              }`}
          />

          <div
            className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col rounded-r-[30px] bg-mint-dark px-8 pt-10 transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="mt-14 w-full">

              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboardWaiter"
                  onClick={() => setIsMenuOpen(false)}
                  activeProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                  }}
                >
                  <GoHome className="h-6 w-6 shrink-0" />
                  <span className="text-xl font-bold">Inicio</span>
                </Link>

                <Link
                  to="/menuWaiter"
                  activeProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <IoRestaurantOutline className="h-6 w-6 shrink-0" />
                  <span className="text-xl font-bold">Menú</span>
                </Link>

                <Link
                  to="/waiterOrders"
                  onClick={() => setIsMenuOpen(false)}
                  activeProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                  }}
                >
                  <LuShoppingBag className="h-6 w-6 shrink-0" />
                  <span className="text-xl font-bold">Pedidos</span>
                </Link>
              </div>

              <div className="mt-10 flex flex-col gap-2">
                <Link
                  to="/discountProducts"
                  onClick={() => setIsMenuOpen(false)}
                  activeProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                  }}
                >
                  <MdOutlineDiscount className="h-6 w-6 shrink-0" />
                  <span className="text-xl font-bold">Descuentos</span>
                </Link>

                <Link
                  to="/tablesManagment"
                  onClick={() => setIsMenuOpen(false)}
                  activeProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                  }}
                >
                  <MdOutlineTableBar className="h-6 w-6 shrink-0" />
                  <span className="text-xl font-bold">Mesas</span>
                </Link>
              </div>


              <div className="mt-10 flex flex-col gap-2">

                <Link
                  to="/login"
                  onClick={logout}
                  activeProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                  }}
                >
                  <LuLogOut className="h-6 w-6 shrink-0" />
                  <span className="text-xl font-bold">Cerrar sesión</span>
                </Link>
              </div>

            </div>
          </div>
        </>
      )}


    </main>
  );
}

export default DashboardLayoutWaiter;
