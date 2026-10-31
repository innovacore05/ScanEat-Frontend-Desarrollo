import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getProfile, getStoredFirstName, logout } from "../../services/authService";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaRegCircleUser } from "react-icons/fa6";
import { RiSettingsLine } from "react-icons/ri";
import { LuLogOut } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { IoRestaurantOutline } from "react-icons/io5";
import { LuCalculator } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { MdOutlineDiscount } from "react-icons/md";
import { MdOutlineTableBar } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { IoReceiptOutline } from "react-icons/io5";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import { LuHistory } from "react-icons/lu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardAdmin({ children }: DashboardLayoutProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [firstName, setFirstName] = useState(getStoredFirstName);
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  {/*const [businessName, setBusinessName] = useState("");*/ }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setEmail(data.user.email);
        {/*setBusinessName(data.business?.name || "");*/ }
        console.log("Negocio:", data.business);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Barra lateral - COMPUTADORA */}

      <aside className="fixed left-0 top-0 hidden scrollbar-thin scrollbar-thumb-mint-darker/75 scrollbar-track-mint-dark/20 h-screen overflow-y-auto w-66 bg-neutral-50  px-8 py-8 lg:flex lg:flex-col rounded-r-4xl">
        <div className="flex justify-start">
          <RestaurantLogo className="h-16 w-16 object-contain" />
          <span className="font-bold text-mint-darker">
            {/*{businessName || "Mi negocio"}*/}
          </span>
        </div>

        <div className="mt-10 border-t border-neutral-300 "></div>

        <nav className="flex flex-col gap-3 mt-5">
          <Link
            to="/dashboardAdmin"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <GoHome className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="text-[15px] font-bold">Inicio</span>
          </Link>

          <Link
            to="/menuManagment"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-700
    `,
            }}
          >
            <IoRestaurantOutline className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">Menú</span>
          </Link>

          <Link
            to="/discountProducts"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <MdOutlineDiscount className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold cursor-pointer">
              Descuentos
            </span>
          </Link>

          <Link
            to="/salesReport"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <HiOutlineDocumentReport className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold cursor-pointer">
              Reporte de ventas
            </span>
          </Link>

          <Link
            to="/expenses"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <LuCalculator className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold cursor-pointer">
              Egresos
            </span>
          </Link>

          <Link
            to="/tablesManagment"
            onClick={() => setIsMenuOpen(false)}
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <MdOutlineTableBar className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold cursor-pointer">
              Mesas
            </span>
          </Link>

        </nav>

        <div className="mt-5 flex flex-col gap-3  border-t border-neutral-300 pt-5">

          <Link
            to="/issuerInformation"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <IoReceiptOutline className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold cursor-pointer ">
              Datos de hacienda
            </span>
          </Link>


          <Link
            to="/profileSettings"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <RiSettingsLine className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold cursor-pointer">Perfil</span>
          </Link>

          <Link
            to="/usersManagment"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <FiUsers className="h-6 w-6 shrink-0" />
            <span className="text-[15px] font-bold cursor-pointer">
              Gestión de personal
            </span>
          </Link>

          <Link
            to="/customization"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <RiSettingsLine className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold">
              Negocio
            </span>
          </Link>

          <Link
            to="/historySales"
            activeProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      bg-mint-darker px-4 py-3 text-white shadow-md
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-darker after:transition-all after:duration-700
      hover:after:scale-[300]
      transition-all duration-700
    `,
            }}
            inactiveProps={{
              className: `
      relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500
    `,
            }}
          >
            <LuHistory className="h-6 w-6 shrink-0" />

            <span className="text-[15px] font-bold">
              Historial de ventas
            </span>
          </Link>

          <div className="mt-2 border-t border-neutral-300 pt-5">

            {/* //cerrar sesion normal , regresa al registro inicio de sesion/ */}
            <Link
              to="/login"
              onClick={logout}
              className="relative z-30 flex items-center gap-4 overflow-hidden rounded-xl
      px-4 py-3 text-text-primary hover:bg-mint-dark/10
      after:absolute after:bottom-0 after:left-5 after:z-[-1]
      after:h-1 after:w-1 after:translate-y-full after:rounded-md
      after:bg-mint-dark after:transition-all after:duration-1500
      hover:after:scale-[300]
      hover:text-white
      transition-all duration-1500"
            >
              <LuLogOut className="h-6 w-6 shrink-0" />

              <span className="text-[15px] font-bold cursor-pointer ">
                Cerrar sesión
              </span>
            </Link>
          </div>
          <div className="mt-2 border-t border-neutral-300 "></div>

        </div>

        <div className="mt-8">
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
            <RestaurantLogo className="h-15.5 w-10 object-contain" />
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

            <button
              type="button"
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsMenuOpen(false);
              }}
              className="cursor-pointer text-mint-dark"
              aria-label="Abrir perfil"
            >
              <FaRegCircleUser className="h-8 w-8" />
            </button>
          </div>
        </div>

        {children}
      </div>

      {isMenuOpen && (
        // ANIMACION
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsMenuOpen(false)}
            className={`fixed inset-0 z-40 cursor-default bg-transparent transition-opacity duration-300 lg:hidden ${isMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
              }`}
          />
          <div
            className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col rounded-r-[30px] bg-mint-dark px-8 pt-10 transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >


            <div className="mt-14 w-full">
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboardAdmin"
                  onClick={() => setIsMenuOpen(false)}
                  activeProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                  }}
                >
                  <GoHome className="h-6 w-6 shrink-0" />

                  <span className="text-xl font-bold">Inicio</span>
                </Link>

                <Link
                  to="/menuManagment"
                  onClick={() => setIsMenuOpen(false)}
                  activeProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                  }}
                >
                  <IoRestaurantOutline className="h-6 w-6 shrink-0" />

                  <span className="text-xl font-bold">Menú</span>
                </Link>

              </div>


              <Link
                to="/discountProducts"
                onClick={() => setIsMenuOpen(false)}
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >
                <MdOutlineDiscount className="h-6 w-6 shrink-0" />
                <span className="text-xl font-bold">Descuentos</span>
              </Link>

              <Link
                to="/salesReport"
                onClick={() => setIsMenuOpen(false)}
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >
                <HiOutlineDocumentReport className="h-6 w-6 shrink-0" />
                <span className="text-xl font-bold">Reporte de ventas</span>
              </Link>

              <Link
                to="/expenses"
                onClick={() => setIsMenuOpen(false)}
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >
                <LuCalculator className="h-6 w-6 shrink-0" />
                <span className="text-xl font-bold">Egresos</span>
              </Link>


              <Link
                to="/tablesManagment"
                onClick={() => setIsMenuOpen(false)}
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >
                <MdOutlineTableBar className="h-6 w-6 shrink-0" />
                <span className="text-xl font-bold">Mesas</span>
              </Link>

              <Link
                to="/issuerInformation"
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >
                <IoReceiptOutline className="h-6 w-6 shrink-0" />
                <span className="text-xl font-bold">
                  Datos de hacienda
                </span>
              </Link>

              <Link
                to="/historySales"
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >
                <LuHistory className="h-6 w-6 shrink-0" />

                <span className="text-xl font-bold">
                  Historial de ventas
                </span>
              </Link>


            </div>
          </div>
        </>
      )}

      {/* ANIMACION */}
      {isProfileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsProfileMenuOpen(false)}
            className={`fixed inset-0 z-40 cursor-default bg-transparent transition-opacity duration-300 lg:hidden ${isProfileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
              }`}
          />

          <div
            className={`fixed right-0 top-0 z-50 flex h-screen w-72 flex-col items-center rounded-l-[30px] bg-mint-dark px-8 pt-10 transition-transform duration-300 ease-in-out lg:hidden ${isProfileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
          >



            <div className="mt-14 w-58">
              <Link
                to="/profileSettings"
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >
                <RiSettingsLine className="h-6 w-6 shrink-0" />

                <span className="text-xl font-bold">Perfil</span>
              </Link>

              <Link
                to="/usersManagment"
                onClick={() => setIsMenuOpen(false)}
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >
                <FiUsers className="h-6 w-6 shrink-0" />
                <span className="text-xl font-bold">Gestión de personal</span>
              </Link>

              <Link
                to="/customization"
                activeProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 bg-white/20 text-white ",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-white",
                }}
              >


                <RiSettingsLine className="h-6 w-6 shrink-0" />

                <span className="text-xl font-bold">Negocio</span>
              </Link>

              {/* cerrar sesion regresa al registro/inicio de sesion */}
              <Link
                to="/login"
                onClick={logout}
                className="mt-10 flex w-full items-center gap-4 px-4 py-3 text-left text-white "
              >
                <LuLogOut className="h-6 w-6 shrink-0" />

                <span className="text-xl font-bold">Cerrar sesión</span>
              </Link>
              {/* cerrar sesion regresa a la pagina informativa */}
              {/* <a
    href={import.meta.env.VITE_LANDING_URL}
    className="mt-10 flex w-full items-center gap-4 py-4 text-left text-white"
>
    <LuLogOut className="h-6 w-6 shrink-0" />
    <span className="text-xl font-bold">
        Cerrar sesión
    </span>
</a> */}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default DashboardAdmin;
