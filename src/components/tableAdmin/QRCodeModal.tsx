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
    const descargarJPG = () => {
        const svgElement = qrRef.current?.querySelector("svg");
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const URLObj = window.URL || window.webkitURL || window;
        const blobURL = URLObj.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            
         
            const margen = 30;
            const espacioTexto = 50; 
            canvas.width = image.width + margen * 2;
            canvas.height = image.height + margen * 2 + espacioTexto;

            const context = canvas.getContext("2d");

            if (context) {
            
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, canvas.width, canvas.height);


                context.drawImage(image, margen, margen);

                // Dibujar el texto "Mesa X" abajo del QR
                context.font = "bold 22px sans-serif";
                context.fillStyle = "#1F2937"; 
                context.textAlign = "center";
                
                const textoMesa = numeroMesa ? `Mesa #${numeroMesa}` : "Mesa";
                context.fillText(textoMesa, canvas.width / 2, image.height + margen + 40);

                // Descargar el archivo JPG
                const jpgUrl = canvas.toDataURL("image/jpeg", 1.0);
                const downloadLink = document.createElement("a");
                downloadLink.href = jpgUrl;
                downloadLink.download = `QR-Mesa-${numeroMesa || "ScanEat"}.jpg`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        };

        image.src = blobURL;
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
                        className="w-12 h-12 items-center justify-center flex rounded-full bg-brand-mint-dark text-base font-bold text-white hover:opacity-90 transition-opacity"
                    >
                        <IoCloseOutline className="w-8 h-8" />
                    </button>

                    {/* Botón Descargar JPG */}
                    <button 
                        type="button"
                        onClick={descargarJPG}
                        title="Guardar como JPG"
                        className="w-12 h-12 items-center justify-center flex rounded-full bg-brand-mint-dark text-base font-bold text-white hover:opacity-90 transition-opacity"
                    >
                        <LuSend className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QrCodeModal;