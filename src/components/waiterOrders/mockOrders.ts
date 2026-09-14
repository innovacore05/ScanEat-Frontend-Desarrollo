import type { Order } from "./WaiterOrderCard";

export const orders: Order[] = [
  {
    orderId: 1,
    tableId: 4,
    specialInstructions: "Hamburguesa sin tomate",
    price: "₡3500",
    time: "12:30 PM",
    status: "Pendiente",
    items: [
      {
        name: "Hamburguesa clásica",
        quantity: 2,
        price: 3500,
      },
      {
        name: "Papas fritas",
        quantity: 1,
        price: 3500,
      },
    ],
  },
  {
    orderId: 2,
    tableId: 2,
    time: "01:15 PM",
    price: "₡5000",
    status: "En preparación",
    items: [
      {
        name: "Pizza de pepperoni",
        quantity: 1,
        price: 3500,
      },
      {
        name: "Batido de mora",
        quantity: 2,
        price: 3500,
      },
    ],
  },
  {
    orderId: 3,
    tableId: 3,
    time: "02:00 PM",
    price: "₡3000",
    status: "Listo",
    items: [
      {
        name: "Casado",
        quantity: 1,
        price: 3500,
        options: {
          Proteína: "Pescado",
        },
      },
      {
        name: "Agua mineral",
        quantity: 1,
        price: 3500,
      },
    ],
  },
];