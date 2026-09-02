import { useEffect, useState } from "react";
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { Link, useNavigate } from "@tanstack/react-router";
import { resendVerificationCode, verifyEmail } from "../../services/authService";

function AccountVerificationForm() {
	const navigate = useNavigate();
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResending, setIsResending] = useState(false);

	useEffect(() => {
		const storedEmail = localStorage.getItem("pendingVerificationEmail");
		if (storedEmail) {
			setEmail(storedEmail);
		}
	}, []);

	function handleChange(index: number, value: string) {
		const digit = value.replace(/\D/g, "").slice(0, 1);
		const newCode = [...code];
		newCode[index] = digit;
		setCode(newCode);
		setError("");
		setSuccessMessage("");

		if (digit && index < 5) {
			document.getElementById(`code-${index + 1}`)?.focus();
		}
	}

	function handleKeyDown(
		index: number,
		event: React.KeyboardEvent<HTMLInputElement>,
	) {
		if (event.key === "Backspace" && !code[index] && index > 0) {
			document.getElementById(`code-${index - 1}`)?.focus();
		}
	}

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setSuccessMessage("");

		const verificationCode = code.join("");

		if (!email) {
			setError("No se encontró el correo para verificar.");
			return;
		}

		if (verificationCode.length !== 6) {
			setError("Ingresa los 6 dígitos del código.");
			return;
		}

		setIsSubmitting(true);

		try {
			await verifyEmail(email, verificationCode);
			localStorage.removeItem("pendingVerificationEmail");
			navigate({ to: "/accountSuccess" });
		} catch (err) {
			const message =
				err &&
				typeof err === "object" &&
				"message" in err
					? String((err as { message?: string }).message)
					: "No se pudo verificar el código.";

			setError(message);
			navigate({ to: "/unexpectedIssueV" });
		} finally {
			setIsSubmitting(false);
		}
	}

	

	async function handleResendCode() {
		if (!email) {
			setError("No se encontró el correo para reenviar el código.");
			return;
		}

		setIsResending(true);
		setError("");
		setSuccessMessage("");

		try {
			const response = await resendVerificationCode(email);
			setSuccessMessage(response.message || "Se reenviaron los códigos.");
			setCode(["", "", "", "", "", ""]);
		} catch (err) {
			const message =
				err &&
				typeof err === "object" &&
				"message" in err
					? String((err as { message?: string }).message)
					: "No se pudo reenviar el código.";

			setError(message);
		} finally {
			setIsResending(false);
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
						<h1 className="text-center text-2xl font-bold text-mint-dark">
							Verificar cuenta
						</h1>

						<p className="text-center text-text-primary">
							Hemos enviado un código de 6 dígitos a{" "}
							<span className="text-mint-dark">
								{email || "tu correo"}
							</span>
						</p>
					</div>

					<div className="mt-14 flex justify-center gap-2">
						{code.map((digit, index) => (
							<input
								key={index}
								id={`code-${index}`}
								type="text"
								inputMode="numeric"
								maxLength={1}
								value={digit}
								onChange={(event) =>
									handleChange(index, event.target.value)
								}
								onKeyDown={(event) =>
									handleKeyDown(index, event)
								}
								className="h-12 w-10 rounded-lg border border-border text-center text-lg font-semibold text-text-primary outline-none focus:border-2 focus:border-brown"
								aria-label={`Dígito ${index + 1}`}
							/>
						))}
					</div>

					{error ? (
						<p className="mt-4 text-center text-sm text-red-600">{error}</p>
					) : null}

					{successMessage ? (
						<p className="mt-4 text-center text-sm text-green-600">
							{successMessage}
						</p>
					) : null}

					<button
						type="submit"
						disabled={isSubmitting}
						className="mt-14 w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-center text-white disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? "Verificando..." : "Verificar"}
					</button>

					<button
						type="button"
						onClick={handleResendCode}
						disabled={isResending}
						className="mt-4 text-sm text-brand-mint-dark disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isResending ? "Reenviando..." : "Reenviar código"} 
					</button>

					<Link
						to="/register"
						className="mx-auto mt-14 cursor-pointer text-mint"
						aria-label="Volver al registro"
					>
						<BsFillArrowLeftCircleFill className="h-10 w-10" />
					</Link>
				</form>
			</section>
		</main>
	);
}

export default AccountVerificationForm;