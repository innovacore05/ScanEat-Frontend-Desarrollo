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

type NewCartItem = Omit<CartItem, "cartItemId" | "clientId">;

type CartContextType = {
  mesaId: string | undefined;
  setMesaId: (mesaId: string | undefined) => void;

  // Carrito compartido de los clientes
  cartItems: CartItem[];
  addToCart: (item: NewCartItem) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  canModifyItem: (item: CartItem) => boolean;
  clearCart: () => void;
  cartCount: number;

  // Carrito temporal para agregar productos a una comanda existente
  orderAddItems: CartItem[];
  addToOrderCart: (item: NewCartItem) => void;
  increaseOrderItemQuantity: (cartItemId: string) => void;
  decreaseOrderItemQuantity: (cartItemId: string) => void;
  removeOrderItem: (cartItemId: string) => void;
  clearOrderAddCart: () => void;
  orderAddCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [mesaId, setMesaId] = useState<string | undefined>(undefined);

  // Carrito compartido
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingSharedCart, setIsLoadingSharedCart] = useState(false);
  const sharedCartIdRef = useRef<string | null>(null);

  // Carrito temporal para una comanda ya existente
  const [orderAddItems, setOrderAddItems] = useState<CartItem[]>([]);

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

  // Cargar el carrito compartido de la mesa
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

      localStorage.setItem("currentOrderId", String(data.orderId));
      localStorage.setItem("currentOrderTableId", data.tableId);

      window.dispatchEvent(
        new CustomEvent("scaneat:order-submitted", {
          detail: {
            tableId: data.tableId,
            orderId: data.orderId,
          },
        }),
      );
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

  // Agregar al carrito compartido.
  const addToCart = async (item: NewCartItem) => {
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

  // Limpiar únicamente la vista local del carrito compartido
  const clearCart = () => {
    setCartItems([]);
  };

  // Agregar un producto al carrito temporal de la comanda existente
  const addToOrderCart = (item: NewCartItem) => {
    const newItem: CartItem = {
      ...item,
      cartItemId: `order-add-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      clientId: getClientId(),
      selectedOptions: { ...item.selectedOptions },
    };

    setOrderAddItems((currentItems) => [...currentItems, newItem]);
  };

  const increaseOrderItemQuantity = (cartItemId: string) => {
    setOrderAddItems((items) =>
      items.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseOrderItemQuantity = (cartItemId: string) => {
    setOrderAddItems((items) =>
      items
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeOrderItem = (cartItemId: string) => {
    setOrderAddItems((items) =>
      items.filter((item) => item.cartItemId !== cartItemId),
    );
  };

  const clearOrderAddCart = () => {
    setOrderAddItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const orderAddCount = orderAddItems.reduce(
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

        orderAddItems,
        addToOrderCart,
        increaseOrderItemQuantity,
        decreaseOrderItemQuantity,
        removeOrderItem,
        clearOrderAddCart,
        orderAddCount,
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