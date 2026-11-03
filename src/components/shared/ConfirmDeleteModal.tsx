import { useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react"

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  loadingText?: string;
  cancelText?: string;
  variant?: "danger" | "message";
};


function ConfirmDeleteModal({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	isLoading = false,
	confirmText = "Eliminar",
	loadingText = "Eliminando...",
	cancelText = "Cancelar",
	variant = "danger",
}: ConfirmDeleteModalProps) {
	const titleId = useId();

	if (!isOpen) return null;

	return (
		
  <AnimatePresence>
    {isOpen && (
      <motion.div
        key="confirm-delete-modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <h3
              id={titleId}
              className="text-lg font-bold text-mint-darker"
            >
              {title}
            </h3>

            <div className="mt-2 text-sm text-text-primary">
              {message}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {variant === "danger" && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelText}
                </button>
              )}

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-mint-dark hover:bg-mint-darker"
                }`}
              >
                {isLoading ? loadingText : confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

	);
}

export default ConfirmDeleteModal;