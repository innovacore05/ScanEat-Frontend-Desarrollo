import { RestaurantLogo } from "../theme/RestaurantLogo";
import { IoCloseOutline } from "react-icons/io5";

type InvoiceModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

function InvoiceModal({ isOpen, onClose }: InvoiceModalProps) {
    if (!isOpen) return null;

    const order = {
        products: [
            { name: "Cappuccino", quantity: 1, price: "₡1500" },
            { name: "Croissant", quantity: 2, price: "₡2400" },
            { name: "Cheesecake", quantity: 1, price: "₡2200" },
            { name: "Café Americano", quantity: 2, price: "₡1800" },
        ],
        subtotal: 5800,
        iva: 754,
        total: 6554,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative flex h-[37rem] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white px-6 py-10">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar modal"
                    className="absolute right-4 top-4"
                >
                    <IoCloseOutline className="h-6 w-6" />
                </button>

                <div className="mt-4 mb-4 flex flex-col items-center gap-2 text-center">
                    <RestaurantLogo className="h-16 w-16 mb-2" />

                    <p className="text-sm font-semibold text-gray-700">
                        Nombre del negocio
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                        Cédula jurídica x-xxx-xxxxx
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                        Dirección,
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                        Tel 8888-8888
                    </p>
                </div>

                <div className="border border-border"></div>

                <div className="mt-4 flex flex-col">
                    <h1 className="text-center text-xl font-bold text-mint-dark">
                        Ticket
                    </h1>

                    <div className="mt-3 flex justify-between">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold text-gray-700">
                                Consecutivo
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                Fecha
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                Condición venta
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                Clave
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 text-right">
                            <p className="text-sm font-semibold text-gray-700">
                                xxxxxxxxxxxxxx
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                25/09/2026 14:32
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                Contado
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                xxxxxxxxxxxxxxxxx
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 border border-border"></div>

                    <div className="mt-4 flex justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">
                                Cliente
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-700">
                                Cliente de contado
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 border border-border"></div>

                    <div className="mt-4">
                        <h1 className="text-xl font-bold text-mint-dark">
                            Total de pedido
                        </h1>

                        <div className="mt-5 max-h-60 overflow-y-auto pr-6">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-[1fr_50px_80px] items-center gap-4 border-b border-border pb-2">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Producto
                                    </p>

                                    <p className="text-center text-sm font-semibold text-gray-700">
                                        Ctd
                                    </p>

                                    <p className="text-right text-sm font-semibold text-gray-700">
                                        Precio
                                    </p>
                                </div>

                                {order.products.map((product, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-[1fr_50px_80px] items-center gap-4"
                                    >
                                        <p className="text-sm font-semibold text-gray-700">
                                            {product.name}
                                        </p>

                                        <p className="text-center text-sm font-semibold text-gray-700">
                                            {product.quantity}
                                        </p>

                                        <p className="text-right text-sm font-semibold text-gray-700">
                                            {product.price}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 border border-border"></div>

                    <div className="mt-4 flex justify-between">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold text-gray-700">
                                Subtotal
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                IVA (13%)
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 text-right">
                            <p className="text-sm font-semibold text-gray-700">
                                ₡{order.subtotal.toFixed(2)}
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                ₡{order.iva.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 border border-border"></div>

                    <div className="mt-4">
                        <div className="flex justify-between">
                            <h1 className="text-xl font-bold text-mint-dark">
                                Total
                            </h1>

                            <p className="text-2xl font-bold text-mint-dark">
                                ₡{order.total.toFixed(2)}
                            </p>
                        </div>

                        <div className="mt-4 border border-border"></div>

                        <div className="mt-4 flex justify-between">
                            <p className="text-sm font-semibold text-gray-700">
                                Medio de pago
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                                Tarjeta
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="mt-6 w-full cursor-pointer rounded-xl bg-mint-dark py-3 text-lg font-semibold text-white"
                    >
                        Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InvoiceModal;