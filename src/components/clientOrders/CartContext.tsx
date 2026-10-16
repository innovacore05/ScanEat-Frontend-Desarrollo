
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getSharedCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from "../../services/sharedCartService";

import { getClientId } from "../../services/orderService";
import { getProductById } from "../../services/productService";
import { socket } from "../../services/socketClient";
import type {
  SharedCart,
  SharedCartItem,
} from "../../services/sharedCartService";

export type CartItem = {
  cartItemId: string;
  clientId: string;
  productId: number;
  name: string;
  price: number;
  discount?: number;
  image: string;
  quantity: number;
  selectedOptions: Record<string, string>;
};

type CartContextType = {
  mesaId: string | undefined;
  setMesaId: (mesaId: string | undefined) => void;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "cartItemId" | "clientId">) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  canModifyItem: (item: CartItem) => boolean;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [mesaId, setMesaId] = useState<string | undefined>(undefined);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingSharedCart, setIsLoadingSharedCart] = useState(false);

  const sharedCartIdRef = useRef<string | null>(null);

  const saveSharedCartId = (id: string | null) => {
    sharedCartIdRef.current = id;
  };

  const mapSharedCartItems = async (
    items: SharedCartItem[],
  ): Promise<CartItem[]> => {
    return Promise.all(
      items.map(async (item) => {
        const product = await getProductById(item.productId);

        return {
          cartItemId: String(item.id),
          clientId: item.clientId,
          productId: item.productId,
          name: item.productName,
          price: Number(item.unitPrice),
          discount: Number(
            product.discountPercentage ??
              product.discount_percent ??
              product.discount ??
              0,
          ),
          image: product.image ?? "",
          quantity: item.quantity,
          selectedOptions: item.selectedOptions ?? {},
        };
      }),
    );
  };

  const applySharedCart = async (sharedCart: SharedCart) => {
    saveSharedCartId(sharedCart.cartId);

    if (sharedCart.status !== "open") {
      setCartItems([]);
      return;
    }

    const items = await mapSharedCartItems(sharedCart.items);
    setCartItems(items);
  };

  // Cargar el carrito de la mesa.
  useEffect(() => {
    if (!mesaId) {
      setCartItems([]);
      saveSharedCartId(null);
      setIsLoadingSharedCart(false);
      return;
    }

    let cancelled = false;

    const loadSharedCart = async () => {
      setIsLoadingSharedCart(true);

      try {
        const sharedCart = await getSharedCart(mesaId);

        if (cancelled) return;

        await applySharedCart(sharedCart);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "No se pudo cargar el carrito compartido:",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSharedCart(false);
        }
      }
    };

    void loadSharedCart();

    return () => {
      cancelled = true;
    };
  }, [mesaId]);

  // Conectar Socket.IO y entrar a la sala de la mesa.
  useEffect(() => {
    if (!mesaId) return;

    const clientId = getClientId();

    const joinTable = () => {
      socket.emit(
        "join_table",
        { tableId: mesaId, clientId },
        (response: { ok: boolean; message?: string }) => {
          if (!response.ok) {
            console.error(
              "No se pudo entrar a la sala de la mesa:",
              response.message,
            );
          }
        },
      );
    };

    const handleCartUpdated = (sharedCart: SharedCart) => {
      void applySharedCart(sharedCart).catch((error) => {
        console.error(
          "No se pudo actualizar el carrito compartido:",
          error,
        );
      });
    };

    const handleCartExpired = (data: { cartId: string }) => {
      if (
        !data?.cartId ||
        data.cartId !== sharedCartIdRef.current
      ) {
        return;
      }

      setCartItems([]);
      saveSharedCartId(null);
    };

    const handleCartSubmitted = (data: {
      tableId: string;
      orderId: number;
    }) => {
      if (data.tableId !== mesaId) return;

      setCartItems([]);
      saveSharedCartId(null);
    };

    socket.on("connect", joinTable);
    socket.on("cart:updated", handleCartUpdated);
    socket.on("cart:expired", handleCartExpired);
    socket.on("cart:submitted", handleCartSubmitted);

    if (socket.connected) {
      joinTable();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", joinTable);
      socket.off("cart:updated", handleCartUpdated);
      socket.off("cart:expired", handleCartExpired);
      socket.off("cart:submitted", handleCartSubmitted);
      socket.disconnect();
    };
  }, [mesaId]);

  const addToCart = async (
    item: Omit<CartItem, "cartItemId" | "clientId">,
  ) => {
    if (!mesaId || isLoadingSharedCart) {
      console.warn(
        "No se puede agregar el producto sin una mesa lista.",
      );
      return;
    }

    try {
      const updatedCart = await addCartItem(mesaId, {
        productId: item.productId,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        clientId: getClientId(),
      });

      await applySharedCart(updatedCart);
    } catch (error) {
      console.error(
        "No se pudo agregar el producto al carrito:",
        error,
      );
    }
  };

  const canModifyItem = (item: CartItem) =>
    item.clientId === getClientId();

  const changeQuantity = async (
    cartItemId: string,
    amount: number,
  ) => {
    if (!mesaId || isLoadingSharedCart) return;

    const item = cartItems.find(
      (currentItem) => currentItem.cartItemId === cartItemId,
    );

    if (!item || !canModifyItem(item)) return;

    const newQuantity = item.quantity + amount;

    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      const updatedCart = await updateCartItem(
        mesaId,
        Number(cartItemId),
        {
          clientId: getClientId(),
          quantity: newQuantity,
        },
      );

      await applySharedCart(updatedCart);
    } catch (error) {
      console.error(
        "No se pudo actualizar la cantidad:",
        error,
      );
    }
  };

  const increaseQuantity = (cartItemId: string) => {
    void changeQuantity(cartItemId, 1);
  };

  const decreaseQuantity = (cartItemId: string) => {
    void changeQuantity(cartItemId, -1);
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!mesaId || isLoadingSharedCart) return;

    const item = cartItems.find(
      (currentItem) => currentItem.cartItemId === cartItemId,
    );

    if (!item || !canModifyItem(item)) return;

    try {
      const updatedCart = await removeCartItem(
        mesaId,
        Number(cartItemId),
        getClientId(),
      );

      await applySharedCart(updatedCart);
    } catch (error) {
      console.error(
        "No se pudo eliminar el producto:",
        error,
      );
    }
  };

  const clearCart = () => {
    // Solo limpia la vista local; no elimina el carrito del servidor.
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        mesaId,
        setMesaId,
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        canModifyItem,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}
