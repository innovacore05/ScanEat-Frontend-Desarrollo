
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import DashboardLayoutAdmin from "../layout/DashboardLayoutAdmin";
import OrderDetails from "../Orders/OrderDetails";
import { getOrders } from "../../services/orderService";
import HistoryCard from "../salesHistory/HistoryCard";
import type { Order } from "../Orders/OrderCard";
import Skeleton from "../shared/Skeleton";
import { socket } from "../../services/socketClient";
import SearchOrders from "../Orders/SearchOrders";
import { ArrowLeftIcon } from "@animateicons/react/lucide";


function HistorySales() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadOrders = useCallback(async (showLoading = false) => {
        if (showLoading) {
            setIsLoading(true);
        }

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
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {

        const handleCashierOrdersUpdated = () => {
            void loadOrders();
        };

        const handleConnect = () => {
            void loadOrders(true);
        };

        socket.on("cashier_orders_updated", handleCashierOrdersUpdated);
        socket.on("connect", handleConnect);

        if (socket.connected) {
            void loadOrders(true);
        } else {
            socket.connect();
        }

        return () => {
            socket.off("cashier_orders_updated", handleCashierOrdersUpdated);
            socket.off("connect", handleConnect);
        };

    }, [loadOrders]);


    const filteredOrders = orders.filter((order) => {

        return (
            order.tableId.toString().includes(searchTerm.trim()) ||
            order.orderId.toString().includes(searchTerm.trim())
        );
    });


    return (
        <DashboardLayoutAdmin>
            <main className="min-h-screen bg-white">
                {/* Celular */}
                <section className="px-6 lg:hidden">
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboardAdmin"
                            className="flex items-center gap-2 text-mint-dark"
                        >
                            <ArrowLeftIcon
                                size={28}
                                duration={1}
                            />

                            <span className="text-[32px] font-bold">
                                Historial de ventas
                            </span>
                        </Link>
                    </div>
                    <div className="mt-6">
                    </div>
                    <div className="my-6 flex flex-col gap-5 bg-white">
                        <SearchOrders
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            className="w-full"
                        />
                    </div>

                    <div className="mt-8">
                        <div className="flex min-w-0 flex-col gap-4">
                            {isLoading ? (
                                Array.from({ length: 4 }, (_, index) => (
                                    <Skeleton key={index} className="h-44 w-full rounded-2xl" />
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <HistoryCard
                                        key={order.orderId}
                                        order={order}
                                        onDetails={() => setSelectedOrder(order)}
                                    />
                                ))
                            ) : (
                                <p className="py-8 text-center text-gray-500">
                                    No hay resultados para esta búsqueda.
                                </p>
                            )}
                        </div>
                    </div>
                </section>


                {/* Computadora */}
                <section className="hidden px-15 py-15 lg:block">


                    <h2 className="text-3xl font-bold text-mint-dark">
                        Historial de ventas
                    </h2>

                    <div className="my-6 flex flex-col gap-5 bg-white">
                        <SearchOrders
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            className="w-full"
                        />
                    </div>

                    <div className="mt-8 grid grid-cols-[minmax(0,612px)_minmax(280px,1fr)] gap-6">
                        {/* Pedidos */}
                        <div className="flex flex-col gap-12">
                            {isLoading ? (
                                Array.from({ length: 4 }, (_, index) => (
                                    <Skeleton key={index} className="h-44 w-full rounded-2xl" />
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <HistoryCard
                                        key={order.orderId}
                                        order={order}
                                        onDetails={() => setSelectedOrder(order)}
                                    />
                                ))
                            ) : (
                                <p className="py-8 text-center text-gray-500">
                                    No hay resultados para esta búsqueda.
                                </p>
                            )}
                        </div>

                        {/* Detalles */}
                        <div>
                            <p className="pb-4 text-xl text-text-primary font-bold ">Orden actual</p>
                            {isLoading ? (
                                <Skeleton className="min-h-80 w-full rounded-4xl" />
                            ) : selectedOrder ? (
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
        </DashboardLayoutAdmin>
    );
}

export default HistorySales;