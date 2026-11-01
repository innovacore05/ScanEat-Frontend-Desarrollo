import { useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { LuBot, LuLoaderCircle, LuSend, LuX } from "react-icons/lu";
import { sendMenuChatMessage } from "../../services/aiService";
import { getProductById, type Product } from "../../services/productService";
import { Bot } from '@/components/animate-ui/icons/bot';

type Role = "meal" | "drink" | "dessert";

type Recommendation = {
  productId: number;
  productName: string;
  price: number;
  reason: string;
  role: Role;
};

type Message = {
  from: "client" | "assistant";
  text: string;
  recommendations?: Recommendation[];
};

type CartProduct = {
  productId: number;
  name: string;
  price: number;
  discount: number;
  image: string;
  quantity: number;
  selectedOptions: Record<string, string>;
};

type Props = {
  mesaId?: string;
  isAddingToOrder: boolean;
  onAddToCart: (product: CartProduct) => void;
  onAddToOrderCart: (product: CartProduct) => void;
};

const roleName: Record<Role, string> = {
  meal: "Comida",
  drink: "Bebida",
  dessert: "Postre",
};

function MenuAssistant({
  mesaId,
  isAddingToOrder,
  onAddToCart,
  onAddToOrderCart,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [productToCustomize, setProductToCustomize] = useState<Product | null>(null);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [buttonPosition, setButtonPosition] = useState<{ left: number; top: number } | null>(null);
  const [panelPosition, setPanelPosition] = useState<{ left: number; top: number; width: number }>({
    left: 0,
    top: 0,
    width: 352,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStart = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const wasDragged = useRef(false);

  const placePanel = (buttonLeft: number, buttonTop: number) => {
    const width = Math.min(352, window.innerWidth - 32);
    const height = Math.min(window.innerHeight * 0.75, 576);
    const left = Math.max(16, Math.min(buttonLeft + 56 - width, window.innerWidth - width - 16));
    const top = buttonTop > window.innerHeight / 2
      ? Math.max(16, buttonTop - height - 12)
      : Math.min(buttonTop + 68, window.innerHeight - height - 16);

    setPanelPosition({ left, top, width });
  };

  const startDragging = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      left: bounds.left,
      top: bounds.top,
    };
    wasDragged.current = false;
  };

  const dragButton = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) return;

    const left = Math.max(8, Math.min(
      dragStart.current.left + event.clientX - dragStart.current.x,
      window.innerWidth - 64,
    ));
    const top = Math.max(8, Math.min(
      dragStart.current.top + event.clientY - dragStart.current.y,
      window.innerHeight - 64,
    ));

    if (Math.abs(event.clientX - dragStart.current.x) > 3 || Math.abs(event.clientY - dragStart.current.y) > 3) {
      wasDragged.current = true;
    }

    setButtonPosition({ left, top });
    if (isOpen) placePanel(left, top);
  };

  const stopDragging = () => {
    dragStart.current = null;
  };

  const toggleChat = () => {
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }

    if (!isOpen && buttonRef.current) {
      const bounds = buttonRef.current.getBoundingClientRect();
      placePanel(bounds.left, bounds.top);
    }
    setIsOpen(!isOpen);
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mesaId || !text.trim() || isSending || loadingRecommendation) return;

    const clientMessage = text.trim();
    setText("");
    setNotice("");
    setMessages((current) => [...current, { from: "client", text: clientMessage }]);
    setIsSending(true);

    try {
      const answer = await sendMenuChatMessage(mesaId, clientMessage);
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: answer.reply,
          recommendations: answer.recommendations,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: "No pude consultar el menú. Puedes elegir un platillo directamente.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const putInCart = (product: Product, selectedOptions: Record<string, string>) => {
    const cartProduct: CartProduct = {
      productId: product.productId,
      name: product.productName,
      price: Number(product.price),
      discount: Number(product.discount ?? 0),
      image: product.image ?? "",
      quantity: 1,
      selectedOptions,
    };

    if (isAddingToOrder) onAddToOrderCart(cartProduct);
    else onAddToCart(cartProduct);

    setNotice(`${product.productName} se agregó al carrito.`);
    setProductToCustomize(null);
    setOptions({});
  };

  const chooseProduct = async (recommendation: Recommendation) => {
    const recommendationKey = `${recommendation.role}-${recommendation.productId}`;
    setLoadingRecommendation(recommendationKey);
    setNotice("");

    try {
      const product = await getProductById(recommendation.productId);

      if (product.optionGroups?.length) {
        setProductToCustomize(product);
        setOptions({});
      } else {
        putInCart(product, {});
      }
    } catch {
      setNotice("No pude cargar las opciones de ese platillo. Inténtalo de nuevo.");
    } finally {
      setLoadingRecommendation(null);
    }
  };

  const confirmOptions = () => {
    if (!productToCustomize) return;

    const groups = productToCustomize.optionGroups ?? [];
    const allOptionsChosen = groups.every((group) => options[String(group.id)]);

    if (!allOptionsChosen) {
      setNotice("Elige una opción en cada grupo.");
      return;
    }

    putInCart(productToCustomize, options);
  };

  return (
    <>
      {isOpen && (
        <section
          aria-label="Asistente del menú"
          style={{ left: panelPosition.left, top: panelPosition.top, width: panelPosition.width }}
          className="fixed z-59 flex h-[min(75vh,36rem)] flex-col overflow-hidden rounded-3xl  bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-mint-darker p-3 text-white">
            <div className="flex items-center gap-2">

              <Bot animateOnHover />
              <span className="font-bold">Asistente del menú</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
              <LuX className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-3">
            {messages.length === 0 && (
              <p className="max-w-[90%] rounded-2xl bg-white p-3 text-sm shadow-sm">
                ¡Hola! ¿Qué te gustaría comer y cuál es tu presupuesto? Te recomiendo platillos para cada ocasión.
              </p>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`max-w-[92%] rounded-2xl p-3 text-sm ${message.from === "client"
                    ? "ml-auto bg-mint-dark text-white"
                    : "bg-white text-text-primary shadow-sm"
                  }`}
              >
                <p>{message.text}</p>

                {message.recommendations?.map((item) => (
                  <article key={`${item.role}-${item.productId}`} className="mt-3 rounded-xl bg-neutral-50 p-3 text-text-primary">
                    <p className="text-xs font-bold uppercase text-mint-dark">{roleName[item.role]}</p>
                    <div className="mt-1 flex justify-between gap-2">
                      <strong>{item.productName}</strong>
                      <strong>₡{item.price.toLocaleString("es-CR")}</strong>
                    </div>
                    <p className="mt-1 text-xs">{item.reason}</p>
                    <button
                      type="button"
                      disabled={isSending || loadingRecommendation !== null}
                      onClick={() => void chooseProduct(item)}
                      className="mt-3 w-full rounded-xl bg-mint-darker p-2 font-semibold text-white"
                    >
                      {loadingRecommendation === `${item.role}-${item.productId}`
                        ? "Agregando..."
                        : "Agregar al carrito"}
                    </button>
                  </article>
                ))}
              </div>
            ))}

            {isSending && (
              <p className="flex items-center gap-2 text-sm text-neutral-600">
                <LuLoaderCircle className="h-4 w-4 animate-spin" />
                Un momento...
              </p>
            )}

            {productToCustomize && (
              <div className="space-y-3 rounded-xl bg-white p-3">
                <strong>Opciones de {productToCustomize.productName}</strong>
                {productToCustomize.optionGroups?.map((group) => (
                  <label key={group.id} className="block text-sm">
                    <span>{group.name}</span>
                    <select
                      value={options[String(group.id)] ?? ""}
                      onChange={(event) =>
                        setOptions({ ...options, [String(group.id)]: event.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-border p-2"
                    >
                      <option value="">Elige una opción</option>
                      {group.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={confirmOptions}
                  className="w-full rounded-xl bg-mint-dark p-2 font-semibold text-white"
                >
                  Confirmar y agregar
                </button>
              </div>
            )}

            {notice && <p role="status" className="text-sm text-mint-dark">{notice}</p>}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-border p-3">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              disabled={!mesaId || isSending || loadingRecommendation !== null}
              placeholder="Escribe tu mensaje..."
              className="min-w-0 flex-1 rounded-full border border-border px-3"
            />
            <button
              type="submit"
              disabled={!mesaId || isSending || loadingRecommendation !== null || !text.trim()}
              aria-label="Enviar mensaje"
              className="rounded-full bg-mint-dark p-3 text-white disabled:opacity-50"
            >
              <LuSend className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        ref={buttonRef}
        type="button"
        onPointerDown={startDragging}
        onPointerMove={dragButton}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onClick={toggleChat}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
        title="Arrastra para mover"
        style={buttonPosition ? { left: buttonPosition.left, top: buttonPosition.top } : undefined}
        className={`fixed z-60 flex h-14 w-14 touch-none cursor-grab items-center justify-center rounded-full bg-mint-darker text-white shadow-xl ring-4 ring-white active:cursor-grabbing ${buttonPosition ? "" : "bottom-24 right-5"}`}
      >
        {isOpen ? <LuX className="h-6 w-6" /> : <Bot animation="blink" animate loop />}
      </button>
    </>
  );
}

export default MenuAssistant;
