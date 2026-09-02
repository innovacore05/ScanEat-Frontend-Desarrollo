//Hice este componente para mostrar un mensaje de error inesperado cuando el usuario no puede verificar su cuenta.
// Es el mismo que estaba hecho pero necesitaba este para que redirigiera a la página de verificación de cuenta.

import { AiOutlineExclamationCircle } from "react-icons/ai";
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { Link } from "@tanstack/react-router";

function UnexpectedIssueFormV() {
    return (
        <main className="min-h-screen bg-mint flex items-center justify-center px-6">
            <section className="w-full max-w-sm rounded-[40px] bg-white px-8 py-22">
                <div className="flex flex-col items-center text-center">
                    
                    <AiOutlineExclamationCircle className="h-20 w-20 text-pink" />

                    <h1 className="mt-8 text-2xl font-bold text-pink">
                        Problema inesperado
                    </h1>

                    <p className="mt-4 text-text-primary">
                        Código de verificación incorrecto.
                    </p>

                    <Link
                        to="/accountVerification"
                        className="mt-8 cursor-pointer text-mint"
                        aria-label="Volver a verificar cuenta"
                    >
                        <BsFillArrowLeftCircleFill className="h-10 w-10" />
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default UnexpectedIssueFormV;