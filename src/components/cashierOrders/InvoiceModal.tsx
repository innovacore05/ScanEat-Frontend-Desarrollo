import { useEffect, useRef, useState } from "react";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import { IoCloseOutline } from "react-icons/io5";
import { HiArrowUp, HiArrowDown } from "react-icons/hi";
import {
    retryReceiptEmission,
    replaceRejectedReceipt,
    type PayOrderResponse,
    type ReceiptUpdateResponse,
} from "../../services/billingService";
import { printReceipt } from "../../services/printService";
import { useTheme } from "../../contexts/ThemeContext";
import { getProfile } from "../../services/authService";


type InvoiceModalProps = {
    isOpen: boolean;
    receipt: PayOrderResponse | null;
    onClose: () => void;
    onReceiptUpdated: (receipt: ReceiptUpdateResponse) => void;
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

function InvoiceModal({ isOpen, receipt, onClose,
    onReceiptUpdated, }: InvoiceModalProps) {
    const { theme } = useTheme();
    const [businessName, setBusinessName] = useState("");
    const invoiceScrollRef = useRef<HTMLDivElement>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryError, setRetryError] = useState("");
    const [isReplacing, setIsReplacing] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getProfile();
                setBusinessName(data.business?.name ?? "");
            } catch (error) {
                console.error("Error cargando el negocio:", error);
            }
        };

        void loadProfile();
    }, []);


    const scrollInvoice = (position: "top" | "bottom") => {
        const container = invoiceScrollRef.current;
        if (!container) return;
        container.scrollTo({
            top: position === "top" ? 0 : container.scrollHeight,
            behavior: "smooth",
        });
    };


    const handlePrint = async () => {
        if (!receipt) return;

        try {
            await printReceipt(receipt, theme.logoUrl, businessName);
        } catch (error) {
            console.error("Error al imprimir el tiquete:", error);
        }
    };


    const handleRetryEmission = async () => {
        if (!receipt || isRetrying) return;

        setIsRetrying(true);
        setRetryError("");

        try {
            const updatedReceipt = await retryReceiptEmission(receipt.receiptId);
            onReceiptUpdated(updatedReceipt);
        } catch (error) {
            setRetryError(
                error && typeof error === "object" && "message" in error
                    ? String((error as { message?: string }).message)
                    : "No se pudo reintentar la emisión.",
            );
        } finally {
            setIsRetrying(false);
        }
    };

    const handleReplaceRejectedReceipt = async () => {
        if (!receipt || isReplacing) return;

        setIsReplacing(true);
        setRetryError("");

        try {
            const updatedReceipt = await replaceRejectedReceipt(receipt.receiptId);
            onReceiptUpdated(updatedReceipt);
        } catch (error) {
            setRetryError(
                error && typeof error === "object" && "message" in error
                    ? String((error as { message?: string }).message)
                    : "No se pudo crear el comprobante sustituto.",
            );
        } finally {
            setIsReplacing(false);
        }
    };



    if (!isOpen || !receipt) return null;

    const formatRate = (rate: number) =>
        `${new Intl.NumberFormat("es-CR", {
            maximumFractionDigits: 2,
        }).format(rate)} %`;


    const { issuer } = receipt;

    const statusLabels: Record<string, string> = {
        not_sent: "Pendiente de emisión",
        pending: "Pendiente de confirmación",
        queued: "Pendiente de confirmación",
        signing: "Pendiente de confirmación",
        sent: "Enviado a Hacienda",
        polling: "Enviado a Hacienda",
        accepted: "Aceptado por Hacienda",
        rejected: "Rechazado por Hacienda",
    };

    const formatPhone = (phone: string | null) =>
        phone && phone.length === 8 ? `${phone.slice(0, 4)}-${phone.slice(4)}` : (phone ?? "");


    const issueDate = new Date(receipt.issueDate).toLocaleString("es-CR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex items-center gap-4">
                <div
                    ref={invoiceScrollRef}
                    className="relative flex h-148 w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white px-6 py-10"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        className="absolute right-4 top-4"
                    >
                        <IoCloseOutline className="h-6 w-6" />
                    </button>


                    {/* Emisor */}
                    {/* Emisor */}
                    <div className="mt-4 mb-4 flex flex-col items-center gap-2 text-center">
                        <RestaurantLogo className="h-16 w-16 mb-2" />

                        <p className="text-sm font-semibold text-gray-700">
                            {issuer.tradeName || issuer.legalName}
                        </p>
                        {issuer.tradeName && (
                            <p className="text-sm text-gray-700">{issuer.legalName}</p>
                        )}
                        <p className="text-sm font-semibold text-gray-700">
                            Cédula {issuer.legalId}
                        </p>
                        <p className="text-sm font-semibold text-gray-700">{issuer.address}</p>
                        <p className="text-sm font-semibold text-gray-700">
                            Tel {formatPhone(issuer.phone)}
                        </p>
                    </div>

                    <div className="border border-border"></div>

                    <div className="mt-4 flex flex-col">
                        <h1 className="text-center text-xl font-bold text-mint-dark">
                            Tiquete Electrónico
                        </h1>
                        {/* Datos del comprobante */}
                        <div className="mt-3 flex flex-col gap-2">
                            <Row label="Consecutivo" value={receipt.consecutiveNumber ?? "Pendiente"} />
                            <Row label="Fecha de emisión" value={issueDate} />
                            <Row label="Clave numérica" value={receipt.clave ?? "Pendiente"} />
                            <Row label="Condición de venta" value="Contado" />
                            <Row
                                label="Estado"
                                value={statusLabels[receipt.haciendaStatus] ??
                                    receipt.haciendaStatus}
                            />
                        </div>

                        {receipt.environment === "sandbox" && (
                            <p className="mt-3 text-center text-xs font-semibold text-red-600">
                                AMBIENTE DE PRUEBAS: este comprobante no tiene valor fiscal
                            </p>
                        )}

                        {receipt.haciendaStatus === "rejected" && receipt.haciendaMessage && (
                            <p className="mt-3 text-center text-xs font-semibold text-red-600">
                                {receipt.haciendaMessage}
                            </p>
                        )}

{receipt.haciendaStatus === "rejected" && (
  <div className="mt-3">
    <button
      type="button"
      onClick={() => void handleReplaceRejectedReceipt()}
      disabled={isReplacing || isRetrying}
      className="w-full rounded-xl bg-mint-dark py-3 font-semibold text-white disabled:opacity-50"
    >
      {isReplacing ? "Creando sustituto…" : "Crear comprobante sustituto"}
    </button>

    {retryError && (
      <p className="mt-2 text-center text-sm text-red-600">
        {retryError}
      </p>
    )}
  </div>
)}

                        {receipt.haciendaStatus === "not_sent" && (
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => void handleRetryEmission()}
                                    disabled={isRetrying}
                                    className="w-full rounded-xl bg-mint-dark py-3 font-semibold text-white disabled:opacity-50"
                                >
                                    {isRetrying ? "Reintentando…" : "Reintentar envío a Hacienda"}
                                </button>

                                {retryError && (
                                    <p className="mt-2 text-center text-sm text-red-600">
                                        {retryError}
                                    </p>
                                )}
                            </div>
                        )}



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

                            <div className="mt-5 pr-0">
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
                                            Total
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
                                                <p className="text-sm text-gray-700">
                                                    {line.detail}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {line.ivaRateCode === "10"
                                                        ? "Exento de IVA"
                                                        : `IVA ${formatRate(Number(line.ivaRate))}`}
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
                                                            {formatCRC(
                                                                Number(line.subtotal) / line.quantity
                                                            )}
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
                                label="Neto después del descuento (sin IVA)"
                                value={formatCRC(receipt.totals.totalNetSale)}
                            />
                            {/* si hay descuento  */}
                            <Row
                                label="Descuento"
                                value={formatCRC(receipt.totals.totalDiscount)}
                            />

                            {/* mostrar las tarifas que realmente aparecen en las líneas */}
                            {receipt.taxSummary.map(({ rate, amount }) => (
                                <Row
                                    key={rate}
                                    label={
                                        receipt.lines.every((line) => line.ivaRateCode === "10")
                                            ? "Exento de IVA"
                                            : `IVA ${formatRate(Number(rate))}`
                                    }
                                    value={formatCRC(amount)}
                                />
                            ))}

                            {Number(receipt.totals.serviceCharge) > 0 && (
                                <Row
                                    label="Servicio 10 %"
                                    value={formatCRC(receipt.totals.serviceCharge)}
                                />
                            )}
                        </div>

                        <div className="mt-4 border border-border"></div>

                        <div className="mt-4">
                            <div className="flex justify-between">
                                <h1 className="text-xl font-bold text-mint-dark">
                                    Total
                                </h1>

                                <p className="text-2xl font-bold text-mint-dark">
                                    {formatCRC(receipt.totals.totalVoucher)}
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
                            </div>
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

                <div className=" flex shrink-0 flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => scrollInvoice("top")}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-mint-dark text-white shadow-lg transition hover:bg-mint-darker"
                    >
                        <HiArrowUp className="h-6 w-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollInvoice("bottom")}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-mint-dark text-white shadow-lg transition hover:bg-mint-darker"
                    >
                        <HiArrowDown className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
export default InvoiceModal;
