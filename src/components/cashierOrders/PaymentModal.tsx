
import { useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

export type PaymentType = "sinpe" | "tarjeta" | "efectivo";

export type PaymentDetails=
{
    reference?:string;
    amountTendered?:number;

};

type PaymentModalProps = {
    isOpen: boolean;
    paymentMethod: PaymentType | "";
    total: string;
    isSubmitting?: boolean;
    errorMessage?: string;
    onClose: () => void;
    onConfirm: (details: PaymentDetails) => void;
};
function PaymentModal({
    isOpen,
    paymentMethod,
    total,
    isSubmitting = false,
    errorMessage = "",
    onClose,
    onConfirm,
}: PaymentModalProps) {
    const [cashReceived, setCashReceived] = useState("");
    const [isCashConfirmed, setIsCashConfirmed] = useState(false);
const [reference,setReference]=useState("");
   
useEffect(() => {
        if (!isOpen) {
            setCashReceived("");
            setIsCashConfirmed(false);
            setReference("");
        }
    }, [isOpen]);

    if (!isOpen || !paymentMethod) {
        return null;
    }

    const paymentLabels: Record<PaymentType, string> = {
        sinpe: "SINPE Móvil",
        tarjeta: "Tarjeta",
        efectivo: "Efectivo",
    };

    const totalAmount = Number(total);
    const receivedAmount=Number(cashReceived);
    const change = Math.round((receivedAmount-totalAmount)*100)/100;

    const formatMoney = (amount: number) =>
        `₡${amount.toLocaleString("es-CR",{
            minimumFractionDigits:2,
            maximumFractionDigits:2,
        })}`;

    const isCash = paymentMethod === "efectivo";
    const requiresReceipt =
        paymentMethod === "sinpe" || paymentMethod === "tarjeta";

    const handleConfirm = () => {
  if (isCash) {
    if (!isCashConfirmed) {
      if (receivedAmount < totalAmount) return;
      setIsCashConfirmed(true);
      return;
    }

    onConfirm({ amountTendered: receivedAmount });
    return;
  }

  const trimmed = reference.trim();
  if (!trimmed) return;
  onConfirm({ reference: trimmed });
};
const isDisabled=
    (isCash &&
    !isCashConfirmed &&
    (!cashReceived || receivedAmount<totalAmount))
||
(requiresReceipt && !reference.trim());

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative flex h-148 w-full max-w-md flex-col rounded-2xl bg-white px-6 py-10">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar modal"
                    className="absolute right-4 top-4"
                >
                    <IoCloseOutline className="h-6 w-6" />
                </button>

                <div className="flex flex-1 flex-col items-center justify-center gap-3">

                    <h2 className="text-center text-2xl font-bold text-mint-dark">
                        {paymentLabels[paymentMethod]}
                    </h2>

                    {requiresReceipt && (
                        <div className="mt-6 flex flex-col items-center">
                            <label htmlFor="receipt-number" className="text-sm">
                                Comprobante
                            </label>

                            <input
                                id="receipt-number"
                                type="text"
                                value={reference}
                                onChange={(event)=>setReference(event.target.value)}
                                maxLength={50}
                                className="mt-3 w-44 rounded-md border border-gray-300 p-2 text-center text-sm"
                            />
                        </div>
                    )}

                    {isCash && !isCashConfirmed && (
                        <div className="mt-6 flex flex-col items-center">
                            <p className="text-sm text-gray-700">Paga con</p>

                            <input
                                type="number"
                                value={cashReceived}
                                onChange={(event) =>
                                    setCashReceived(event.target.value)
                                }
                                placeholder="₡0"
                                className="mt-3 w-44 rounded-md border border-gray-300 p-2 text-center"
                            />
                        </div>
                    )}

                    {isCash && isCashConfirmed && (
                        <div className="mt-6 space-y-5 text-center">
                            <div>
                                <p className="text-gray-500">Pagó con</p>
                                <p className="text-xl text-mint-dark">
                                    {formatMoney(receivedAmount)}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Cambio</p>
                                <p className="text-2xl font-semibold text-mint-dark">
                                    {formatMoney(change)}
                                </p>
                            </div>
                        </div>
                    )}

                   {errorMessage && (
    <p className="mt-4 w-full rounded-md bg-red-50 p-3 text-center text-sm text-red-700">
        {errorMessage}
    </p>
)}

<button
    type="button"
    onClick={handleConfirm}
    disabled={isDisabled}
    className="mt-8 w-44 rounded-xl bg-mint-dark p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
>
    {isCash && !isCashConfirmed
        ? "Calcular cambio"
        : isSubmitting
            ? "Cobrando..."
            : "Confirmar cobro"}
</button>
                </div>
            </div>
        </div>
    );
}

export default PaymentModal;