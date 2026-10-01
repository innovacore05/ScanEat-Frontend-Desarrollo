import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { RestaurantLogo } from "../theme/RestaurantLogo";

import { HiArrowLeft } from "react-icons/hi";
import { BsFillPlusCircleFill } from "react-icons/bs";

function PaymentMethod() {
    const [paymentMethod, setPaymentMethod] = useState("");

    const order = {
        tableId: 5,
        date: "02/05/26",
        products: [
            { name: "1x Cappuccino", price: "₡1500" },
            { name: "2x Croissant", price: "₡2400" },
            { name: "1x Cheesecake", price: "₡2200" },
            { name: "2x Café Americano", price: "₡1800" },
            { name: "1x Sandwich de pollo", price: "₡3500" },
            { name: "1x Jugo de naranja", price: "₡1800" },
            { name: "2x Galletas de chocolate", price: "₡1600" },
            { name: "1x Hamburguesa clásica", price: "₡4200" },
            { name: "1x Papas fritas", price: "₡1800" },
            { name: "2x Té frío", price: "₡2200" },
            { name: "1x Pizza personal", price: "₡3800" },
            { name: "2x Empanada de carne", price: "₡2600" },
            { name: "1x Batido de fresa", price: "₡2500" },
            { name: "2x Agua embotellada", price: "₡1800" },
            { name: "1x Club sandwich", price: "₡3900" },
        ],
        tax: "₡1937",
        total: "₡16,737",
    };

    return (
        <main className="min-h-screen bg-white">
            <div className="h-22 bg-mint px-8 py-4">
                <RestaurantLogo className="h-16 w-16" />
            </div>

            <section className="px-6 py-8 lg:px-8">
                <div className="mx-auto max-w-300">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/cashierOrders"
                            className="cursor-pointer text-mint"
                            aria-label="Volver a pedidos"
                        >
                            <HiArrowLeft className="h-8 w-8 text-mint-dark" />
                        </Link>

                        <h1 className="text-3xl font-bold text-mint-dark lg:text-4xl">
                            Selecciona el método de pago
                        </h1>
                    </div>

                    <p className="mt-6 w-74 rounded-xl border border-border p-3 text-xl text-gray-600 lg:text-2xl">
                        Cuenta de mesa #{order.tableId}
                    </p>

                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">

                        <div className="rounded-xl border border-border p-6 lg:p-8">
                            <h2 className="text-center text-2xl font-bold text-mint-dark lg:text-3xl">
                                Recibo
                            </h2>

                            <p className="mt-3 text-gray-600">{order.date}</p>

                            <h3 className="mt-7 text-lg font-bold text-mint-dark lg:text-xl">
                                Total de pedido
                            </h3>

                            <div className="mt-5 max-h-60 overflow-y-auto pr-6">
                                <div className="flex flex-col gap-4">
                                    {order.products.map((product, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <p>{product.name}</p>
                                            <p className="tracking-wider">
                                                {product.price}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 border-t border-border pt-4">
                                <div className="flex items-center justify-between">
                                    <p>IVA (13%)</p>
                                    <p className="tracking-wider">{order.tax}</p>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-xl font-bold">Total</p>
                                    <p className="text-xl font-bold tracking-wider text-mint-dark">
                                        {order.total}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button type="button" className="cursor-pointer">
                                    <BsFillPlusCircleFill className="h-9 w-9 text-mint-dark" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center px-2 lg:px-8">
                            <div className="flex flex-col items-center gap-5">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("sinpe")}
                                    className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition ${
                                        paymentMethod === "sinpe"
                                            ? "bg-mint text-white"
                                            : "text-gray-700"
                                    }`}
                                >
                                    SINPE Móvil
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("tarjeta")}
                                    className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition ${
                                        paymentMethod === "tarjeta"
                                            ? "bg-mint text-white"
                                            : "text-gray-700"
                                    }`}
                                >
                                    Tarjeta
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("efectivo")}
                                    className={`w-full max-w-72 cursor-pointer rounded-xl border border-border py-3 text-xl transition ${
                                        paymentMethod === "efectivo"
                                            ? "bg-mint text-white"
                                            : "text-gray-700"
                                    }`}
                                >
                                    Efectivo
                                </button>

                                <button
                                    type="button"
                                    className="mt-3 w-full max-w-72 cursor-pointer rounded-xl bg-mint-dark p-3 text-lg font-semibold text-white"
                                >
                                    Confirmar Cobro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default PaymentMethod;