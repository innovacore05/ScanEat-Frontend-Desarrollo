import { useState } from "react";
import { Link,useNavigate } from "@tanstack/react-router";

function RegisterBusiness() {
    const navigate = useNavigate();
    const [businessName, setBusinessName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [businessEmail, setBusinessEmail] = useState("");
    const [businessCode, setBusinessCode] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (
            !businessName.trim() ||
            !phoneNumber.trim()||
            !businessEmail.trim() ||
            !businessCode.trim() 
        ) {
			setError(
				"Completa todos los campos requeridos",
			);
			return;
		}
       

        setIsSubmitting(true);

    
    }

    return (
        <main className="min-h-screen bg-white">
            	<div className="h-38 bg-mint" />
            <section className="-mt-10 min-h-[calc(100vh-11rem)] rounded-t-[40px] bg-white px-6 py-10">
                <form
    onSubmit={handleSubmit}
    className="mx-auto flex w-full max-w-sm flex-col gap-5"
> 
    <h1 className="text-center font-bold text-mint-dark">
        Registra tu negocio
    </h1>

    <input
        id="businessName"
        type="text"
        placeholder="Nombre del negocio"
        value={businessName}
        onChange={(event) =>
            setBusinessName(event.target.value)
        }
        className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brown focus:outline-none"
    />

    <input
        id="email"
        type="email"
        placeholder="Correo electrónico"
        value={businessEmail}
        onChange={(event) =>
            setBusinessEmail(event.target.value)
        }
        className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brown focus:outline-none"
    />

    <input
        id="phoneNumber"
        type="tel"
        placeholder="Número de teléfono"
        value={phoneNumber}
        onChange={(event) =>
            setPhoneNumber(event.target.value)
        }
        className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brown focus:outline-none"
    />

    <input
        id="businessCode"
        type="text"
        placeholder="Código del negocio"
        value={businessCode}
        onChange={(event) =>
            setBusinessCode(event.target.value)
        }
        className="w-full rounded-lg border border-border px-4 py-3 focus:border-2 focus:border-brown focus:outline-none"
    />

    {error ? (
        <p className="text-sm text-red-600">
            {error}
        </p>
    ) : null}

    <button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer rounded-lg bg-mint-dark px-4 py-3 text-white hover:bg-mint-dark/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
        {isSubmitting
            ? "Registrando negocio..."
            : "Siguiente"}
    </button>

</form>
            </section>
        </main>
    );
}

export default RegisterBusiness;