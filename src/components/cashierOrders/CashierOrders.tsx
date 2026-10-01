import { useEffect,useState } from "react";
import { RestaurantLogo } from "../theme/RestaurantLogo";
import OrderCard, { type Order } from "../Orders/OrderCard";
import { getOrders } from "../../services/orderService";

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
            <div className="h-22 bg-mint px-8 py-4">
                <RestaurantLogo className="h-16 w-16" />
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