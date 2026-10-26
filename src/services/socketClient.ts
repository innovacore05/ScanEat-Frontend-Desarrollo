
import { io, type Socket } from "socket.io-client";

// const API_BASE_URL = import.meta.env.VITE_API_URL;

// if (!API_BASE_URL) {
//   throw new Error("Falta configurar la variable VITE_API_URL");
// }

// export const socket: Socket = io(API_BASE_URL, {
//   autoConnect: false,
//   withCredentials: true,
//   transports: ["websocket", "polling"],
// });

export const socket: Socket = io({
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
});