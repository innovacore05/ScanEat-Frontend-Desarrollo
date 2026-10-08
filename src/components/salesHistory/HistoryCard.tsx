import type { Order } from "../Orders/OrderCard";

type HistoryCardProps = {
    order: Order;
    onDetails: () => void;
};

function HistoryCard({ order, onDetails }: HistoryCardProps) {
    return (
        <div>
            <div className="flex w-full items-center rounded-2xl bg-neutral-100 px-6 py-6">
                <div className="flex w-full min-w-0 flex-col gap-4">

                    <h2 className="w-fit text-lg font-bold text-text-primary bg-neutral-300 py-2 px-7 rounded-lg">
                        Orden #{order.orderId}
                    </h2>
                    <div className="text-base font-semibold text-text-primary">
                        <p>
                            Fecha:{" "}
                            {new Date(order.date).toLocaleDateString("es-CR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                        </p>

                        <p>
                            Hora: {order.time}
                        </p>
                    </div>


                    <div className="w-full min-w-0 h-full bg-neutral-100 rounded-2xl flex items-center justify-between gap-6">
                        <button
                            onClick={onDetails}
                            className="py-2 px-2 rounded-lg text-base font-semibold border border-mint-dark text-mint-dark hover:bg-mint-dark hover:text-white transition-colors"
                        >
                            Detalles
                        </button>


                        <p className="py-2 px-2 rounded-lg text-base font-semibold bg-mint-darker text-white min-w-20 text-center">
                            {order.price}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HistoryCard;