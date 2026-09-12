type OrderItem = {
  name: string;
  quantity: number;
  options?: Record<string, string>;
};

type Order = {
  orderId: number;
  tableId: number;
  specialInstructions?: string;
  items: OrderItem[];
};

type OrderCardProps = {
  order: Order;
};

function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="w-full h-full bg-white border border-border py-8 px-8 rounded-2xl flex flex-col gap-4">
      <h2 className="text-4xl font-bold text-mint-dark">
        Mesa #{order.tableId}
      </h2>

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
        className="mt-auto w-full rounded-2xl bg-mint-dark py-4 text-2xl font-bold text-white"
      >
        Listo
      </button>
    </div>
  );
}

export default OrderCard;