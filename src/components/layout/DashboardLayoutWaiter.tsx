import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getProfile } from "../../services/authService";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaRegCircleUser } from "react-icons/fa6";
import { RiNotification2Line } from "react-icons/ri";
import { LuLogOut } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { IoRestaurantOutline } from "react-icons/io5";
import { LuShoppingBag } from "react-icons/lu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutWaiter({ children }: DashboardLayoutProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setEmail(data.user.email);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Barra lateral - COMPUTADORA */}

            <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-neutral-50  px-8 py-8 lg:flex lg:flex-col rounded-r-4xl">
    

        <nav className="mt-10 flex flex-col">
          <Link
            to="/dashboardWaiter"
            className="flex items-center gap-4 py-3 text-left text-text-primary"
          >
            <GoHome className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">Inicio</span>
          </Link>

          <Link
            to="/menuWaiter"
            className="flex items-center gap-4 py-3 text-left text-text-primary"
          >
            <IoRestaurantOutline className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">Menú</span>
          </Link>

          <button
            type="button"
            className="flex items-center gap-4 py-3 text-left text-text-primary"
          >
            <LuShoppingBag className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">
              Pedidos
            </span>
          </button>

          <div className="mt-10">
            <button
              type="button"
              className="flex w-full items-center py-3 text-left text-text-primary"
            >
              <span className="text-[15px] font-bold cursor-pointer">
                Descuentos
              </span>
            </button>


            <Link
              to="/tablesManagment"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center py-3 text-left text-text-primary"
            >
              <span className="text-[15px] font-bold cursor-pointer">
                Mesas
              </span>
            </Link>
          </div>
        </nav>

        <div className="mt-10 border-t border-neutral-300 pt-5">
        

          <button
            type="button"
            className="flex items-center gap-4 py-3 text-left text-text-primary"
          >
            <RiNotification2Line className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">
              Notificaciones
            </span>
          </button>

          {/* //cerrar sesion normal , regresa al registro inicio de sesion/ */}
          <Link
            to="/login"
            className="flex items-center gap-4 py-3 pb-8 text-left text-text-primary border-b border-neutral-300"
          >
            <LuLogOut className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer ">
              Cerrar sesión
            </span>
          </Link>


        </div>

        <div className="mt-10  pt-5">
          <div className="flex items-center gap-3">
            <FaRegCircleUser className="h-9 w-9 shrink-0 text-mint-darker" />

            <div className="min-w-0">
              <p className="truncate font-bold text-mint-darker">
                {firstName || "Usuario"} {lastName}
              </p>

              <p className="truncate text-sm text-mint-darker">
                {email || "correo electrónico"}
              </p>
            </div>
          </div>
        </div>
      </aside>


          
      <div className="lg:ml-64">
        {/* Barra superior - TELÉFONO Y TABLET */}
        <div className="px-6 pt-8 lg:hidden">
          <div className="flex justify-start">
            <img src="/img/logoS.png" alt="Logo del negocio" />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsProfileMenuOpen(false);
              }}
              className="cursor-pointer text-mint-dark"
              aria-label="Abrir menú"
            >
              <GiHamburgerMenu className="h-8 w-8" />
            </button>

           
          </div>
        </div>

        {children}
      </div>

      {isMenuOpen && (
  <>
    <button
      type="button"
      aria-label="Cerrar menú"
      onClick={() => setIsMenuOpen(false)}
      className={`fixed inset-0 z-40 cursor-default bg-transparent transition-opacity duration-300 lg:hidden ${
        isMenuOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    />

    <div
      className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col rounded-r-[30px] bg-mint-dark px-8 pt-10 transition-transform duration-300 ease-in-out lg:hidden ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mt-14 w-full">

        <div className="flex flex-col gap-2">
          <Link
            to="/dashboardWaiter"
            onClick={() => setIsMenuOpen(false)}
            className="flex w-full items-center gap-4 py-4 text-left text-white"
          >
            <GoHome className="h-6 w-6 shrink-0" />
            <span className="text-xl font-bold">Inicio</span>
          </Link>

          <Link
            to="/menuWaiter"
            onClick={() => setIsMenuOpen(false)}
            className="flex w-full items-center gap-4 py-4 text-left text-white"
          >
            <IoRestaurantOutline className="h-6 w-6 shrink-0" />
            <span className="text-xl font-bold">Menú</span>
          </Link>

          <button
            type="button"
            className="flex w-full items-center gap-4 py-4 text-left text-white"
          >
            <LuShoppingBag className="h-6 w-6 shrink-0" />
            <span className="text-xl font-bold">Pedidos</span>
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-2">
          <button
            type="button"
            className="flex w-full items-center gap-4 py-4 text-left text-white"
          >
            <span className="text-xl font-bold">Descuentos</span>
          </button>

          <Link
            to="/tablesManagment"
            onClick={() => setIsMenuOpen(false)}
            className="flex w-full items-center gap-4 py-4 text-left text-white"
          >
            <span className="text-xl font-bold">Mesas</span>
          </Link>
        </div>

       
        <div className="mt-10 flex flex-col gap-2">
          <button
            type="button"
            className="flex w-full items-center gap-4 py-4 text-left text-white"
          >
            <RiNotification2Line className="h-6 w-6 shrink-0" />
            <span className="text-xl font-bold">Notificaciones</span>
          </button>
        

        
          <Link
            to="/login"
            className="flex w-full items-center gap-4 py-4 text-left text-white"
          >
            <LuLogOut className="h-6 w-6 shrink-0" />
            <span className="text-xl font-bold">Cerrar sesión</span>
          </Link>
        </div>

      </div>
    </div>
  </>
)}

      
    </main>
  );
}

export default DashboardLayoutWaiter;
