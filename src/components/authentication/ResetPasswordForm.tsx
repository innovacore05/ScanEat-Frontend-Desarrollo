import { useEffect, useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { Link, useNavigate } from "@tanstack/react-router";
import { resetPassword } from "../../services/authService";

function ResetPasswordForm() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const storedEmail = localStorage.getItem("pendingResetEmail");
		const storedCode = localStorage.getItem("pendingResetCode");

		setEmail(storedEmail ?? "");
		setCode(storedCode ?? "");
	}, []);

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (!password.trim()) {
			setError("Ingresa una nueva contraseña.");
			return;
		}

		if (password.length < 8) {
			setError("La contraseña debe tener al menos 8 caracteres.");
			return;
		}

		if (!/\d/.test(password)) {
			setError("La contraseña debe contener al menos un número.");
			return;
		}

		if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]'/+=;`~]/.test(password)) {
			setError("La contraseña debe contener al menos un símbolo.");
			return;
		}

		if (!email || !code) {
			setError("No se encontró el correo o código de recuperación.");
			return;
		}

		setIsSubmitting(true);

		try {
			await resetPassword(email, code, password);

			localStorage.removeItem("pendingResetEmail");
			localStorage.removeItem("pendingResetCode");
			localStorage.removeItem("verificationFlow");

			navigate({ to: "/passwordSuccess" });
		} catch (err) {
			const message =
				err &&
				typeof err === "object" &&
				"message" in err
					? String((err as { message?: string }).message)
					: "No se pudo cambiar la contraseña.";

			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen bg-white">
			<section className="mt-38 min-h-[calc(100vh-11rem)] rounded-t-[40px] bg-white px-6 py-10">
				<form
					onSubmit={handleSubmit}
					className="mx-auto flex w-full max-w-sm flex-col"
				>
					<div className="flex flex-col gap-4">
						<h1 className="text-center font-bold text-mint-dark">
							Cambiar contraseña
						</h1>

						<p className="text-center text-text-primary">
							Ingresa tu nueva contraseña
						</p>
					</div>

					<div className="mt-14 flex flex-col gap-4">
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Nueva contraseña"
								value={password}
								onChange={(event) => {
									setPassword(event.target.value);
									setError("");
								}}
								className="w-full rounded-lg border border-border px-4 py-3 pr-12 focus:border-2 focus:border-brown focus:outline-none"
							/>

							<button
								type="button"
								onClick={() =>
									setShowPassword(!showPassword)
								}
								className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-mint-dark"
								aria-label={
									showPassword
										? "Ocultar contraseña"
										: "Mostrar contraseña"
								}
							>
								{showPassword ? (
									<ImEye />
								) : (
									<ImEyeBlocked />
								)}
							</button>
						</div>

						<div className="flex flex-col gap-4">
							<div className="flex items-center justify-center gap-2">
								<FaRegCheckCircle className="text-mint-dark" />

								<p className="text-text-primary">
									Tu contraseña debe contener:
								</p>
							</div>

							<div className="mx-auto flex w-fit flex-col gap-4 text-left text-text-primary">
								<p>Al menos 8 caracteres</p>
								<p>Al menos un número</p>
								<p>Al menos un símbolo</p>
							</div>
						</div>
					</div>

					{error ? (
						<p className="mt-4 text-center text-sm text-red-600">
							{error}
						</p>
					) : null}

					<button
						type="submit"
						disabled={isSubmitting}
						className="mt-14 w-full cursor-pointer whitespace-nowrap rounded-lg bg-mint-dark px-4 py-3 text-center text-white disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
					</button>

					<Link
						to="/verificationCode"
						className="mx-auto mt-14 cursor-pointer text-mint"
						aria-label="Volver al código de verificación"
					>
						<BsFillArrowLeftCircleFill className="h-10 w-10" />
					</Link>
				</form>
			</section>
		</main>
	);
}

export default ResetPasswordForm;