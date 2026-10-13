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

    const formatRate = (rate: number) =>
        `${new Intl.NumberFormat("es-CR", {
            maximumFractionDigits: 2,
        }).format(rate)} %`;


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


                {/* Emisor */}
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
                    {/* Datos del comprobante */}
                    <div className="mt-3 flex flex-col gap-2">
                        <Row label="Consecutivo" value="Pendiente" />
                        <Row label="Fecha de emisión" value={issueDate} />
                        <Row label="Clave numérica" value="Pendiente" />
                        <Row label="Condición de venta" value="Contado" />


                    </div>

                    <div className="mt-4 border border-border"></div>
                    {/* Receptor */}
                    <div className="mt-4">
                        <Row label="Cliente" value="Cliente de contado" />
                    </div>

                    <div className="mt-4 border border-border"></div>
                    {/* Detalle */}
                    <div className="mt-4">
                        <h1 className="text-xl font-bold text-mint-dark">
                            Detalle de pedido
                        </h1>

                        <div className="mt-5 max-h-60  pr-0">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-[minmax(0,1fr)_38px_82px_88px] items-center gap-2 border-b border-border pb-3">
                                    <p className="text-xs font-semibold text-gray-700">
                                        Producto
                                    </p>
                                    <p className="text-center text-xs font-semibold text-gray-700">
                                        Cant.
                                    </p>
                                    <p className="text-right text-xs font-semibold text-gray-700">
                                        Precio unitario
                                    </p>
                                    <p className="text-right text-xs font-semibold text-gray-700">
                                        Total (con IVA)
                                    </p>
                                </div>

                                {receipt.lines.map((line, index) => (
                                   
                                   <div
    key={index}
    className={`grid grid-cols-[minmax(0,1fr)_38px_82px_88px] gap-2 py-2 ${index !== receipt.lines.length - 1
        ? "border-b border-border"
        : ""
        }`}
>
    <div className="min-w-0">
        <p className="text-sm text-gray-700">{line.detail}</p>
        <p className="text-xs text-gray-500">
            IVA {formatRate(Number(line.ivaRate))}
        </p>
    </div>

    <p className="text-center text-sm text-gray-700">
        {line.quantity}
    </p>

    {/* precio unitario: con descuento tacha el original y muestra el nuevo debajo */}
    <div className="text-right text-sm text-gray-700">
        {Number(line.discount) > 0 ? (
            <>
                <p className="text-xs text-gray-500 line-through">
                    {formatCRC(line.unitPrice)}
                </p>
                <p>
                    {formatCRC(Number(line.subtotal) / line.quantity)}
                </p>
            </>
        ) : (
            <p>{formatCRC(line.unitPrice)}</p>
        )}
    </div>

    {/* monto de la linea despues del descuento y con IVA */}
    <p className="text-right text-sm text-gray-700">
        {formatCRC(line.total)}
    </p>
</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 border border-border"></div>

                    {/* Resumen */}
                    <div className="mt-4 flex flex-col gap-2">
                        <Row
                            label="Subtotal (sin IVA)"
                            value={formatCRC(receipt.totals.totalNetSale)}
                        />


                        {/*  mostrar las tarifas que realmente aparecen en las LINEAS */}
                        {receipt.taxSummary.map(({ rate, amount }) => (
                            <Row
                                key={rate}
                                label={`IVA (${formatRate(rate)})`}
                                value={formatCRC(amount)}
                            />
                        ))}

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

                            {receipt.payment.change !== null && (
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