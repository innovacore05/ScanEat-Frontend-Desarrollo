

type OrderCookItem = {
  name: string;
  quantity: number;
  options?: Record<string, string>;
};

type OrderCook = {
  orderId: number;
  tableId: number;
  time: string;
  date: string;
  specialInstructions?: string;
  items: OrderCookItem[];
};

type OrderCardCookProps = {
  order: OrderCook;
  onReady?: () => void;
  isUpdating?: boolean;
};

function getElapsedTime(date: string) {
  const orderDate = new Date(date);
  const now = new Date();

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now.getTime() - orderDate.getTime()) / 60000)
  );

  if (elapsedMinutes < 1) {
    return "menos de un minuto";
  }

  if (elapsedMinutes === 1) {
    return "1 minuto";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minutos`;
  }

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (hours === 1 && minutes === 0) {
    return "1 hora";
  }

  if (minutes === 0) {
    return `${hours} horas`;
  }

  return `${hours} h ${minutes} min`;
}

function OrderCardCook({ order, onReady, isUpdating = false }: OrderCardCookProps) {
  return (
    <div className="w-full h-120 overflow-y-auto bg-white border border-border py-8 px-8 rounded-2xl flex flex-col gap-4 ">
      
      <h2 className="text-4xl font-bold text-mint-dark">
        Mesa #{order.tableId}
      </h2>

      <div className="flex flex-col gap-1">
      <p className="text-lg text-gray-500">Hora del pedido: {order.time}</p>
      <p className="text-lg text-gray-500">Pedido hace {getElapsedTime(order.date)}</p>
      </div>
      {order.specialInstructions && (
        <>
          <p className="text-2xl font-bold text-red-600">
            Instrucciones especiales:
          </p>

          <p className="text-2xl text-gray-600">
            {order.specialInstructions}
          </p>
        </>
      )}

      <div className="mt-5">
        <p className="text-2xl font-bold text-mint-dark">
          Platillos
        </p>

        <div className="mt-3 flex flex-col gap-4">
          {order.items.map((item, index) => (
            <div key={index}>
              <p className="text-2xl text-gray-600">
                {item.quantity}x {item.name}
              </p>

              {item.options && (
                <div>
                  {Object.entries(item.options).map(([name, value]) => (
                    <p key={name} className="text-2xl text-gray-600">
                      {name}: {value}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={isUpdating}
        onClick={onReady}
        className="mt-auto w-full rounded-2xl bg-mint-dark py-4 text-2xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUpdating ? "Cambiando..." : "Listo"}
      </button>
    </div>
  );
}

export default OrderCardCook;