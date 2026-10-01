import { RestaurantLogo } from "../theme/RestaurantLogo";
import OrderCard, { type Order } from "../Orders/OrderCard";

function CashierOrders() {

    const orders: Order[] = [
        {
            orderId: 1,
            tableId: 5,
            time: "12:30 p. m.",
            price: "₡8,500",
            items: [],
            status: "Listo",
        },
        {
            orderId: 2,
            tableId: 3,
            time: "12:45 p. m.",
            price: "₡6,200",
            items: [],
            status: "Listo",
        },
    ];

    return (
        <main className="min-h-screen bg-white">
            <div className="h-22 bg-mint px-8 py-4">
                <RestaurantLogo className="h-16 w-16" />
            </div>

            <section className="px-8 pt-8">
                <div className="mx-auto max-w-300">
                    <h1 className="text-4xl font-bold text-mint-dark">
                        Próximos pagos
                    </h1>

                    <p className="mt-4 text-gray-600 text-2xl">
                        Órdenes
                    </p>

                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                isCashier
                            />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default CashierOrders;