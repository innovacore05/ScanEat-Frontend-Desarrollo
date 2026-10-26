import { useEffect,useState } from "react";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import OrderCard, { type Order } from "../Orders/OrderCard";
import { getOrders } from "../../services/orderService";
import { logout } from "../../services/authService";
import { LuLogOut } from "react-icons/lu";
import { Link } from "@tanstack/react-router";
import Skeleton from "../shared/Skeleton";
import { socket } from "../../services/socketClient";
import SearchOrders from "../Orders/SearchOrders";

function CashierOrders (){
const [orders,setOrders]=useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
    //Consulta las órdenes que están pendientes de pago
    const loadOrders =async ()=>{
        try{
       const data = await getOrders("delivered",true);
       setOrders(data);
        }catch(error){
        console.error("Error cargando órdenes:", error);
        } finally {
        setIsLoading(false);
        }
    };

    //Se actualiza las órdenes cuando el backend notifica un cqambio
    const handleCashierOrdersUpdated = () => {
        void loadOrders();
    };

    //Vuelve a consultar las órdenes al conectarse o reconectarse
    const handleConnect = () => {
        void loadOrders();
    };

        //Escucha las notificaciones que están destinadas a la pantalla del cajero
    socket.on("cashier_orders_updated", handleCashierOrdersUpdated);
    socket.on("connect", handleConnect);

    //Carga las órdenes iniciales y establece conexión si hace falta (como por ejemplo si se pierde la conexión a internet)
    if (socket.connected) {
        void loadOrders();
    } else {
        socket.connect();
    }

    //Elimina los listeners cuando sale de la pantalla
     return () => {
        socket.off("cashier_orders_updated", handleCashierOrdersUpdated);
        socket.off("connect", handleConnect);
     };
    
    }, []);
    
    


  const filteredOrders = orders.filter((order) => {
    if (order.status !== "Entregado") {
        return false;
    }
    return (
        order.tableId.toString().includes(searchTerm.trim()) ||
      order.orderId.toString().includes(searchTerm.trim())
    );
});

    
    
    return (
        <main className="min-h-screen bg-white">
            <div className="flex h-30 items-center justify-between gap-4 bg-neutral-50 border-b-4 border-mint-dark px-4 py-4 sm:px-8">
                <RestaurantLogo className="h-16 w-16" />
                <Link
                          to="/login"
                          onClick={logout}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-mint-dark px-3 py-3 text-base font-bold text-white sm:gap-3 sm:px-8 sm:py-4 sm:text-xl"
                        >
                          <LuLogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Cerrar sesión</span>
                        </Link>
            </div>

            <section className="px-8 pt-8">
                <div className="mx-auto max-w-300">
                    <h1 className="text-4xl font-bold text-mint-dark">
                        Próximos pagos
                    </h1>


                    <div className="my-6 flex flex-col gap-5 bg-white">
                        <SearchOrders
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                            className="w-full"
                        />
                    </div>
                    

                    <p className="mt-4 text-mint-darker text-2xl">
                        Órdenes
                    </p>

                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {isLoading ? (
                            Array.from({ length: 4 }, (_, index) => (
                                <Skeleton key={index} className="h-56 w-full rounded-2xl" />
                            ))
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                isCashier
                            />
                            ))
                            ) : (
                                    <p className="py-8  text-gray-500">
                                        No hay resultados para esta búsqueda.
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default CashierOrders;