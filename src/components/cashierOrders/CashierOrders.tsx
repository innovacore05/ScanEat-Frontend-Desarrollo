import { useEffect,useState } from "react";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import OrderCard, { type Order } from "../Orders/OrderCard";
import { getOrders } from "../../services/orderService";
import { logout } from "../../services/authService";
import { LuLogOut } from "react-icons/lu";
import { Link } from "@tanstack/react-router";

function CashierOrders (){
const [orders,setOrders]=useState<Order[]>([]);

useEffect(()=>{
    const loadOrders =async ()=>{
        try{
       const data = await getOrders("delivered",true);
       setOrders(data);
        }catch(error){
        console.error("Error caragdno órdenes:", error);
        }
    };
    loadOrders();

},[]);

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

                    <p className="mt-4 text-gray-600 text-2xl">
                        Órdenes
                    </p>

                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                isCashier
                            />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default CashierOrders;