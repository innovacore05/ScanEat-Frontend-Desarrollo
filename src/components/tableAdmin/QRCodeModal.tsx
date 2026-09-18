import { useRef } from "react";
import QRCode from "react-qr-code";
import { IoCloseOutline } from "react-icons/io5";
import { LuSend } from "react-icons/lu";

type QrCodeModalProps = {
    isOpen: boolean;
    value: string;
    numeroMesa?: number | string;
    onClose: () => void;
};

function QrCodeModal({ isOpen, value, numeroMesa, onClose }: QrCodeModalProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    // Función para descargar el QR en JPG incluyendo el texto "Mesa X"
    const descargarJPG = async () => {
        const svgElement = qrRef.current?.querySelector("svg");

        if (!svgElement) {
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
        });
        const blobUrl = URL.createObjectURL(svgBlob);
        const image = new Image();

        image.onload = async () => {
            const canvas = document.createElement("canvas");
            const margin = 30;
            const textSpace = 60;

            canvas.width = image.width + margin * 2;
            canvas.height = image.height + margin * 2 + textSpace;

            const context = canvas.getContext("2d");

            if (!context) {
                URL.revokeObjectURL(blobUrl);
                return;
            }

            context.fillStyle = "#FFFFFF";
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = "bold 22px sans-serif";
            context.fillStyle = "#1F2937";
            context.textAlign = "center";

            const tableText = numeroMesa
                ? `Mesa #${numeroMesa}`
                : "Mesa";

            context.fillText(
                tableText,
                canvas.width / 2,
                margin + 28,
            );

            context.drawImage(
                image,
                margin,
                margin + textSpace,
            );

            canvas.toBlob(async (blob) => {
                URL.revokeObjectURL(blobUrl);

                if (!blob) {
                    return;
                }

                const fileName = `QR-Mesa-${numeroMesa ?? "ScanEat"}.jpg`;
                const file = new File([blob], fileName, {
                    type: "image/jpeg",
                });

                if (
                    navigator.share &&
                    navigator.canShare?.({ files: [file] })
                ) {
                    await navigator.share({
                        title: "Código QR de ScanEat",
                        text: tableText,
                        files: [file],
                    });

                    return;
                }

                const downloadUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement("a");

                downloadLink.href = downloadUrl;
                downloadLink.download = fileName;
                downloadLink.click();

                URL.revokeObjectURL(downloadUrl);
            }, "image/jpeg", 1);
        };

        image.onerror = () => {
            URL.revokeObjectURL(blobUrl);
        };

        image.src = blobUrl;
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-80 rounded-2xl bg-white p-6 shadow-2xl">

                {/* Texto visible arriba del QR en el modal */}
                {numeroMesa && (
                    <p className="text-center font-bold text-gray-800 text-lg mb-1">
                        Mesa #{numeroMesa}
                    </p>
                )}

                <div ref={qrRef} className="flex justify-center rounded-xl p-2">
                    <QRCode value={value} size={220} />
                </div>

                <div className="mt-4 flex gap-4 justify-center">
                    {/* Botón Cerrar */}
                    <button
                        type="button"
                        onClick={onClose}
                        title="Cerrar"
                        className="cursor-pointer w-12 h-12 items-center justify-center flex rounded-full bg-mint-dark text-base font-bold text-white hover:opacity-90 transition-opacity"
                    >
                        <IoCloseOutline className="w-8 h-8" />
                    </button>

                    {/* Botón Descargar JPG */}
                    <button
                        type="button"
                        onClick={descargarJPG}
                        title="Guardar como JPG"
                        className="cursor-pointer w-12 h-12 items-center justify-center flex rounded-full bg-mint-dark text-base font-bold text-white hover:opacity-90 transition-opacity"
                    >
                        <LuSend className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QrCodeModal;
