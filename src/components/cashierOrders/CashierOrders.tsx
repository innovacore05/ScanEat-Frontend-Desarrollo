import { RestaurantLogo } from "../theme/RestaurantLogo";

function CashierOrders() {
    return (
        <main className="min-h-screen bg-white">
            <div className="h-22 bg-mint px-8 py-4">
                <RestaurantLogo className="h-16 w-16" />
            </div>

            <section className="px-8 pt-8">
                <div className="mx-auto max-w-300">
                    <h1 className="text-4xl font-bold text-mint-dark">
                        Proximos pagos
                    </h1>

                    <p className="mt-4 text-gray-600 text-2xl">
                        Ordenes
                    </p>

                    <div className="mt-8">
                        {/* Aquí aparecerán las órdenes para el cajero */}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default CashierOrders;