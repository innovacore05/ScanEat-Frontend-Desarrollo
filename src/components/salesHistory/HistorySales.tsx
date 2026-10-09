
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import DashboardLayout from "../layout/DashboardLayout";
import OrderDetails from "../Orders/OrderDetails";
import { getOrders } from "../../services/orderService";
import HistoryCard from "../salesHistory/HistoryCard";
import { getStoredFirstName } from "../../services/authService";
import type { Order } from "../Orders/OrderCard";

function HistorySales() {
    const [firstName] = useState(getStoredFirstName);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    const loadOrders = useCallback(async () => {
        try {
            const backendOrders = await getOrders("paid");
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
    }, []);

    useEffect(() => {
        void loadOrders();

        const intervalId = window.setInterval(() => {
            void loadOrders();
        }, 2000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [loadOrders]);



    return (
        <DashboardLayout>
            <main className="min-h-screen bg-white">
                {/* Celular */}
                <section className="px-6 lg:hidden">
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 text-mint-dark"
                        >
                            <HiArrowLeft className="h-6 w-6" />

                            <span className="text-[32px] font-bold mt-3">
                                Historial de ventas
                            </span>
                        </Link>
                    </div>
                    <div className="mt-6">
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6">
                        <div className="flex min-w-0 flex-col gap-4">
                            {orders.map((order) => (
                                <HistoryCard
                                    key={order.orderId}
                                    order={order}
                                    onDetails={() => setSelectedOrder(order)}
                                />
                            ))}
                        </div>

                        <div className="min-w-0">
                            <p className="pb-4 text-xl font-bold text-text-primary">
                                Orden actual
                            </p>

                            {selectedOrder ? (
                                <OrderDetails
                                    order={selectedOrder}
                                    embedded
                                    onStatusChanged={loadOrders}
                                />
                            ) : (
                                <div className="flex min-h-80 items-center justify-center rounded-4xl bg-neutral-100 px-4">
                                    <p className="text-center text-base font-semibold text-text-primary">
                                        Selecciona un pedido para ver sus detalles
                                    </p>
                                </div>
                            )}
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

                    <h2 className="mt-8 text-2xl font-bold text-mint-dark">
                        Historial de ventas
                    </h2>


                    <div className="mt-6">
                    </div>

                    <div className="mt-8 grid grid-cols-[minmax(0,612px)_minmax(280px,1fr)] gap-6">
                        {/* Pedidos */}
                        <div className="flex flex-col gap-12">
                            {orders.map((order) => (
                                <HistoryCard
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
        </DashboardLayout>
    );
}

export default HistorySales;