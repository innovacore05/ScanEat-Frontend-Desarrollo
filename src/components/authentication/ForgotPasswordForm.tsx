import { useState } from "react";
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { Link, useNavigate } from "@tanstack/react-router";
import { forgotPassword } from "../../services/authService";

function ForgotPasswordForm() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (!email.trim()) {
			setError("Ingresa tu correo electrónico.");
			return;
		}

		setIsSubmitting(true);

		try {
			await forgotPassword(email.trim());
			localStorage.setItem("verificationFlow", "reset");
			localStorage.setItem("pendingResetEmail", email.trim().toLowerCase());
			navigate({ to: "/verificationCode" });
		} catch (err) {
			const message =
				err &&
				typeof err === "object" &&
				"message" in err
					? String((err as { message?: string }).message)
					: "No se pudo enviar el código de recuperación.";

			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen bg-white">
			<div className="mt-38" />

			<section className="min-h-[calc(100vh-11rem)] rounded-t-[40px] bg-white px-6 py-10">
				<form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col">

					{/* Título y descripción */}
					<div className="flex flex-col gap-4">
						<h1 className="text-center font-bold text-mint-dark">
							Recuperar contraseña
						</h1>

						<p className="text-center text-text-primary">
							Ingresa tu correo electrónico para recuperar tu contraseña.
						</p>
					</div>

					{/* Correo y botón */}
					<div className="mt-14 flex flex-col gap-14">
						<input
							id="email"
							type="email"
							placeholder="Correo electrónico"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brown focus:outline-none"
						/>

						{error ? <p className="text-sm text-red-600">{error}</p> : null}

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-center text-white disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isSubmitting ? "Enviando..." : "Recuperar contraseña"}
						</button>
					</div>

					{/* Volver al Login */}
					<Link
						to="/login"
						className="mx-auto mt-14 cursor-pointer text-mint"
						aria-label="Volver al inicio de sesión"
					>
						<BsFillArrowLeftCircleFill className="h-10 w-10" />
					</Link>

				</form>
			</section>
		</main>
	);
}

export default ForgotPasswordForm;