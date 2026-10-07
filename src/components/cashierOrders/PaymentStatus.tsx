import type { PaymentType } from "./PaymentModal";
import { FaCircleCheck } from "react-icons/fa6";
import { CiCircleCheck } from "react-icons/ci";
import { CiCircleAlert } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { FaCircleArrowRight } from "react-icons/fa6";


export type StatusType = "Aprobado" | "Rechazado" | "Procesando";

type StatusModalProps = {
    isOpen: boolean;
    status: StatusType | "";
    orderId: number | string;
    paymentMethod: PaymentType | "";
     haciendaMessage?: string;
    onConfirm: () => void;
};

function PaymentStatus({
    isOpen,
    status,
    orderId,
    paymentMethod,
    haciendaMessage = "",
    onConfirm,
}: StatusModalProps) {
    if (!isOpen || !status) {
        return null;
    }
    const statusContent = {
        Aprobado: {
            icon: <CiCircleCheck className="text-mint-dark h-35 w-35" />,
            title: "¡Aprobado!",
            message: "Pago completado",
        },
        Rechazado: {
            icon: <CiCircleAlert className="text-red-500 h-35 w-35" />,
            title: "Pago Rechazado",
            message: "Reintenta enviar la solicitud",
        },
        Procesando: {
            icon: <IoTimeOutline className="text-mint-dark h-35 w-35" />,
            title: "Procesando",
            message: "Pago en proceso, por favor espere",
        },
    };

    const content = statusContent[status];
    const paymentLabels: Record<PaymentType, string> = {
        sinpe: "SINPE Móvil",
        tarjeta: "Tarjeta",
        efectivo: "Efectivo",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative flex h-148 w-full max-w-md flex-col items-center justify-center rounded-2xl bg-white px-6 py-10 text-center">
                {content.icon}

                <h2
                    className={`mt-4 text-3xl font-semibold ${status === "Rechazado"
                            ? "text-red-500"
                            : "text-mint-dark"
                        }`}
                >
                    {content.title}
                </h2>

                <p className="mt-2 text-s text-gray-600">
                    {content.message}
                </p>

{haciendaMessage && (
    <p className="mt-3 text-sm font-semibold text-mint-dark">
        {haciendaMessage}
    </p>
)}

                <div className="mt-8 text-sm text-mint-dark font-medium">
                    <p className="">
                        Order #{orderId}
                    </p>
                    <p className="">
                        Método de pago:{" "}
                        {paymentMethod ? paymentLabels[paymentMethod] : ""}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onConfirm}
                    className="mt-20 p-2 text-mint-dark text-5xl"
                >
                    {status === "Aprobado" ? <FaCircleCheck /> : <FaCircleArrowRight />}
                </button>

            </div>
        </div>
    );
}

export default PaymentStatus;



