import OrderCard from "../Orders/OrderCard";

function CookOrders() {
  const orders = [
    {
      orderId: 1,
      tableId: 4,
      status: "Pendiente",
      items: [
        { name: "Hamburguesa clásica", quantity: 2 },
        { name: "Papas fritas", quantity: 1 },
      ],
      specialInstructions: "Hamburguesa sin tomate",
    },
    {
      orderId: 2,
      tableId: 2,
      status: "Pendiente",
      items: [
        { name: "Pizza de pepperoni", quantity: 1 },
        { name: "Batido de mora", quantity: 2 },
      ],
    },
    {
      orderId: 3,
      tableId: 3,
      status: "Pendiente",
      items: [
        {
          name: "Casado",
          quantity: 1,
          options: {
            Proteína: "Pescado",
          },
        },
        { name: "Agua mineral", quantity: 1 },
      ],
      },
     {
      orderId: 1,
      tableId: 4,
      status: "Pendiente",
      items: [
        { name: "Hamburguesa clásica", quantity: 2 },
        { name: "Papas fritas", quantity: 1 },
      ],
      specialInstructions: "Hamburguesa sin tomate",
    },
    {
      orderId: 2,
      tableId: 2,
      status: "Pendiente",
      items: [
        { name: "Pizza de pepperoni", quantity: 1 },
        { name: "Batido de mora", quantity: 2 },
      ],
    },
    {
      orderId: 3,
      tableId: 3,
      status: "Pendiente",
      items: [
        {
          name: "Casado",
          quantity: 1,
          options: {
            Proteína: "Pescado",
          },
        },
        { name: "Agua mineral", quantity: 1 },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <div className="h-22 bg-mint px-8 py-4">
        <img
          src="/img/LogoSBlanco.svg"
          alt="Logo del negocio"
          className="h-15.5 w-10 object-contain"
        />
      </div>

      <section className="px-8 pt-8">
        <div className="mx-auto max-w-300">
          <h1 className="text-4xl font-bold text-mint-dark">
            Pedidos
          </h1>

          <div className="mt-8 grid grid-cols-3 gap-6 pb-16">
            {orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default CookOrders;