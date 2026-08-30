import QRCode from "react-qr-code";
import { IoCloseOutline } from "react-icons/io5";
import { LuSend } from "react-icons/lu";

type QrCodeModalProps = {
    isOpen: boolean;
    value: string;
    onClose: () => void;
};

function QrCodeModal({ isOpen, value, onClose }: QrCodeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-90 rounded-2xl bg-white p-6 shadow-2xl">

                <div className="flex justify-center rounded-xl  p-4">
                    <QRCode value={value} size={220} />
                </div>

                <div className="mt-4 flex gap-4 justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className=" w-12 h-12 items-center justify-center flex rounded-full bg-brand-mint-dark text-base font-bold text-white"
                    >
                        <IoCloseOutline className="w-8 h-8" />
                    </button>

                    {/* button para descargar el QR */}
                    <button  className=" w-12 h-12  items-center justify-center flex rounded-full bg-brand-mint-dark text-base font-bold text-white">
                        <LuSend className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QrCodeModal;