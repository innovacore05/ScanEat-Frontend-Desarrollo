import { useId, type ReactNode } from "react";

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
}: ConfirmDeleteModalProps) {
	const titleId = useId();

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
		>
			<div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
				<h3 id={titleId} className="text-lg font-bold text-mint-darker">
					{title}
				</h3>
				<p className="mt-2 text-sm text-text-primary">{message}</p>
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={isLoading}
						className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isLoading}
						className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isLoading ? loadingText : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmDeleteModal;