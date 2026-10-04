import { RestaurantLogo } from "../theme/RestaurantLogo";
import { IoCloseOutline } from "react-icons/io5";
import type { PayOrderResponse } from "../../services/billingService";
import { printReceipt } from "../../services/printService";
import { useTheme } from "../../contexts/ThemeContext";
import { getProfile } from "../../services/authService";
import { useEffect, useState } from "react";

type InvoiceModalProps = {
    isOpen: boolean;
    receipt: PayOrderResponse | null;
    onClose: () => void;
};
const formatCRC = (value: string | number) =>
    `₡${Number(value).toLocaleString("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const methodLabels: Record<PayOrderResponse["payment"]["method"], string> = {
    cash: "Efectivo",
    card: "Tarjeta",
    sinpe: "SINPE Móvil",
};

function Row({ label, value }: { label: string; value: string }) {

    return (
        <div className="flex justify-between gap-4">
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            <p className="break-all text-right text-sm font-semibold text-gray-700">
                {value}
            </p>
        </div>
    );
}

function InvoiceModal({ isOpen, receipt, onClose }: InvoiceModalProps) {
    const { theme } = useTheme();

    const [businessName, setBusinessName] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getProfile();
                setBusinessName(data.business?.name ?? "");
            } catch (error) {
                console.error("Error cargando el negocio:", error);
            }
        };

        loadProfile();
    }, []);

    if (!isOpen || !receipt) return null;

const handlePrint = async () => {
    try {
        await printReceipt(receipt, theme.logoUrl, businessName);
    } catch (error) {
        console.error("Error al imprimir el ticket:", error);
    }
};



       const issueDate = new Date(receipt.issueDate).toLocaleString("es-CR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative flex h-148 w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white px-6 py-10">
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
    {businessName || "Nombre del negocio"}
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

                    <div className="mt-3 flex flex-col gap-2">
                        <Row label="Consecutivo" value="Pendiente" />
                        <Row label="Fecha" value={issueDate} />
                        <Row label="Mesa" value={`#${receipt.tableNumber}`} />
                        <Row label="Condición venta" value="Contado" />
                        <Row label="Clave" value="Pendiente" />
                    </div>

                    <div className="mt-4 border border-border"></div>

                    <div className="mt-4">
                        <Row label="Cliente" value="Cliente de contado" />
                    </div>

                    <div className="mt-4 border border-border"></div>

                    <div className="mt-4">
                        <h1 className="text-xl font-bold text-mint-dark">
                            Total de pedido
                        </h1>

                        <div className="mt-5 max-h-60 overflow-y-auto pr-6">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-[1fr_50px_100px] items-center gap-4 border-b border-border pb-2">
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

                                {receipt.lines.map((line, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-[1fr_50px_100px] items-center gap-4"
                                    >
                                        <p className="text-sm font-semibold text-gray-700">
                                            {line.detail}
                                        </p>

                                        <p className="text-center text-sm font-semibold text-gray-700">
                                            {line.quantity}
                                        </p>

                                        <p className="text-right text-sm font-semibold text-gray-700">
                                            {formatCRC(line.subtotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 border border-border"></div>

                    <div className="mt-4 flex flex-col gap-2">
                        <Row
                            label="Subtotal"
                            value={formatCRC(receipt.totals.totalNetSale)}
                        />
                        <Row
                            label="IVA (13%)"
                            value={formatCRC(receipt.totals.totalTax)}
                        />
                    </div>

                    <div className="mt-4 border border-border"></div>

                    <div className="mt-4">
                        <div className="flex justify-between">
                            <h1 className="text-xl font-bold text-mint-dark">
                                Total
                            </h1>

                            <p className="text-2xl font-bold text-mint-dark">
                                {formatCRC(receipt.totals.totalSale)}
                            </p>
                        </div>

                        <div className="mt-4 border border-border"></div>

                        <div className="mt-4 flex flex-col gap-2">
                            <Row
                                label="Medio de pago"
                                value={methodLabels[receipt.payment.method]}
                            />

                            {receipt.payment.reference && (
                                <Row
                                    label="Comprobante"
                                    value={receipt.payment.reference}
                                />
                            )}

                            {receipt.payment.amountTendered && (
                                <Row
                                    label="Pagó con"
                                    value={formatCRC(receipt.payment.amountTendered)}
                                />
                            )}

                            {receipt.payment.change && (
                                <Row
                                    label="Cambio"
                                    value={formatCRC(receipt.payment.change)}
                                />
                            )}
                        </div>
                    </div>

                    <button
    type="button"
    onClick={handlePrint}
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