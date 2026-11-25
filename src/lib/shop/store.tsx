import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  COUPONS,
  avatarFor,
  computeTotals,
  findCoupon,
  initialAddresses,
  initialCards,
  initialFavorites,
  initialOrders,
  initialUser,
  productById,
  shippingOptions,
  type Address,
  type CouponCode,
  type Order,
  type SavedCard,
  type ShippingOption,
  type User,
} from "./data";
import { money } from "./format";

export type CartLine = { productId: number; quantity: number };
type ShippingState = { cep: string; option: "normal" | "express" } | null;

type PersistedState = {
  cart: CartLine[];
  favorites: number[];
  coupon: CouponCode | null;
  shipping: ShippingState;
  user: User;
  addresses: Address[];
  cards: SavedCard[];
  orders: Order[];
  loggedIn: boolean;
};

const STORAGE_KEY = "cshop:v1";
const THEME_KEY = "cshop:theme";

const defaults: PersistedState = {
  cart: [],
  favorites: initialFavorites,
  coupon: null,
  shipping: null,
  user: initialUser,
  addresses: initialAddresses,
  cards: initialCards,
  orders: initialOrders,
  loggedIn: true,
};

export type PlaceOrderInput = { address: Address; payment: string; shippingOption: ShippingOption };

type Shop = PersistedState & {
  hydrated: boolean;
  theme: "light" | "dark";
  cartBump: number;
  cartCount: number;
  cartSubtotal: number;
  selectedShipping: ShippingOption | undefined;
  totals: ReturnType<typeof computeTotals>;
  openedProduct: number | null;
  openProduct: (id: number | null) => void;
  toggleTheme: () => void;
  addToCart: (id: number, quantity?: number) => boolean;
  removeFromCart: (id: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  moveToFavorites: (id: number) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setShipping: (s: ShippingState) => void;
  updateUser: (patch: Partial<User>) => void;
  saveAddress: (a: Address) => void;
  deleteAddress: (id: string) => void;
  setMainAddress: (id: string) => void;
  addCard: (c: SavedCard) => void;
  removeCard: (id: string) => void;
  placeOrder: (input: PlaceOrderInput) => Order;
  cancelOrder: (number: string) => void;
  reorder: (number: string) => void;
  login: () => void;
  logout: () => void;
};

const Ctx = createContext<Shop | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [cartBump, setCartBump] = useState(0);
  const [openedProduct, setOpenedProduct] = useState<number | null>(null);

  // Restaura o estado salvo somente após a hidratação (mantém o SSR consistente).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaults, ...JSON.parse(raw) });
      const t = localStorage.getItem(THEME_KEY);
      if (t === "dark" || t === "light") setTheme(t);
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) setTheme("dark");
    } catch {
      /* armazenamento indisponível */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (hydrated) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        /* ignore */
      }
    }
  }, [theme, hydrated]);

  // Sincroniza entre abas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setState({ ...defaults, ...JSON.parse(e.newValue) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const patch = useCallback(
    (p: (s: PersistedState) => Partial<PersistedState>) => setState((s) => ({ ...s, ...p(s) })),
    [],
  );

  const addToCart = useCallback(
    (id: number, quantity = 1) => {
      const product = productById(id);
      if (!product || product.stock === 0) {
        toast.error("Produto indisponível no momento.");
        return false;
      }
      const current = state.cart.find((l) => l.productId === id)?.quantity ?? 0;
      if (current >= product.stock) {
        toast.error(`Você já tem todas as ${product.stock} unidades disponíveis no carrinho.`);
        return false;
      }
      const next = Math.min(product.stock, current + quantity);
      patch((s) => ({
        cart: s.cart.some((l) => l.productId === id)
          ? s.cart.map((l) => (l.productId === id ? { ...l, quantity: next } : l))
          : [...s.cart, { productId: id, quantity: next }],
      }));
      setCartBump((n) => n + 1);
      toast.success("Item adicionado ao carrinho", { description: product.name });
      return true;
    },
    [state.cart, patch],
  );

  const removeFromCart = useCallback(
    (id: number) => {
      patch((s) => ({ cart: s.cart.filter((l) => l.productId !== id) }));
      toast("Item removido do carrinho");
    },
    [patch],
  );

  const setQuantity = useCallback(
    (id: number, quantity: number) => {
      const product = productById(id);
      if (!product) return;
      const q = Math.max(1, Math.min(quantity, Math.max(product.stock, 1)));
      patch((s) => ({ cart: s.cart.map((l) => (l.productId === id ? { ...l, quantity: q } : l)) }));
    },
    [patch],
  );

  const isFavorite = useCallback((id: number) => state.favorites.includes(id), [state.favorites]);

  const toggleFavorite = useCallback(
    (id: number) => {
      const was = state.favorites.includes(id);
      patch((s) => ({
        favorites: was ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
      }));
      toast(was ? "Removido dos favoritos" : "Adicionado aos favoritos");
    },
    [state.favorites, patch],
  );

  const moveToFavorites = useCallback(
    (id: number) => {
      patch((s) => ({
        cart: s.cart.filter((l) => l.productId !== id),
        favorites: s.favorites.includes(id) ? s.favorites : [...s.favorites, id],
      }));
      toast("Item movido para os favoritos");
    },
    [patch],
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const c = findCoupon(code);
      if (!c) {
        toast.error("Cupom inválido", { description: "Verifique o código e tente novamente." });
        return false;
      }
      patch(() => ({ coupon: c }));
      toast.success("Cupom aplicado", { description: `${c}: ${COUPONS[c].label}` });
      return true;
    },
    [patch],
  );

  const placeOrder = useCallback(
    ({ address, payment, shippingOption }: PlaceOrderInput) => {
      const items = state.cart.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        price: productById(l.productId)?.price ?? 0,
      }));
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const t = computeTotals(subtotal, state.coupon, shippingOption);
      const maxNumber = state.orders.reduce(
        (m, o) => Math.max(m, Number(o.number.split("-")[2]) || 0),
        1000,
      );
      const order: Order = {
        number: `CS-2026-${maxNumber + 1}`,
        date: new Date().toISOString(),
        status: "Aguardando pagamento",
        items,
        subtotal,
        shipping: t.shipping ?? 0,
        discount: t.discount,
        total: t.total,
        payment,
        address,
      };
      patch((s) => ({ orders: [order, ...s.orders], cart: [], coupon: null, shipping: null }));
      return order;
    },
    [state.cart, state.coupon, state.orders, patch],
  );

  const value = useMemo<Shop>(() => {
    const cartSubtotal = state.cart.reduce(
      (s, l) => s + (productById(l.productId)?.price ?? 0) * l.quantity,
      0,
    );
    const selectedShipping = state.shipping
      ? shippingOptions(state.shipping.cep).find((o) => o.id === state.shipping!.option)
      : undefined;
    return {
      ...state,
      hydrated,
      theme,
      cartBump,
      cartCount: state.cart.reduce((s, l) => s + l.quantity, 0),
      cartSubtotal,
      selectedShipping,
      totals: computeTotals(cartSubtotal, state.coupon, selectedShipping),
      openedProduct,
      openProduct: setOpenedProduct,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      addToCart,
      removeFromCart,
      setQuantity,
      isFavorite,
      toggleFavorite,
      moveToFavorites,
      applyCoupon,
      removeCoupon: () => patch(() => ({ coupon: null })),
      setShipping: (shipping) => patch(() => ({ shipping })),
      updateUser: (p) => patch((s) => ({ user: { ...s.user, ...p } })),
      saveAddress: (a) =>
        patch((s) => {
          let list = s.addresses.some((x) => x.id === a.id)
            ? s.addresses.map((x) => (x.id === a.id ? a : x))
            : [...s.addresses, a];
          if (a.main || list.length === 1) list = list.map((x) => ({ ...x, main: x.id === a.id }));
          return { addresses: list };
        }),
      deleteAddress: (id) =>
        patch((s) => {
          const list = s.addresses.filter((a) => a.id !== id);
          if (list.length && !list.some((a) => a.main)) list[0] = { ...list[0]!, main: true };
          return { addresses: list };
        }),
      setMainAddress: (id) =>
        patch((s) => ({ addresses: s.addresses.map((a) => ({ ...a, main: a.id === id })) })),
      addCard: (c) => patch((s) => ({ cards: [...s.cards, c] })),
      removeCard: (id) => patch((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
      placeOrder,
      cancelOrder: (number) => {
        patch((s) => ({
          orders: s.orders.map((o) =>
            o.number === number && o.status === "Aguardando pagamento"
              ? { ...o, status: "Cancelado" }
              : o,
          ),
        }));
        toast("Pedido cancelado", { description: number });
      },
      reorder: (number) => {
        const order = state.orders.find((o) => o.number === number);
        if (!order) return;
        let added = 0;
        let skipped = 0;
        patch((s) => {
          let cart = s.cart;
          for (const it of order.items) {
            const p = productById(it.productId);
            if (!p || p.stock === 0) {
              skipped++;
              continue;
            }
            const cur = cart.find((l) => l.productId === it.productId)?.quantity ?? 0;
            const q = Math.min(p.stock, cur + it.quantity);
            cart = cart.some((l) => l.productId === it.productId)
              ? cart.map((l) => (l.productId === it.productId ? { ...l, quantity: q } : l))
              : [...cart, { productId: it.productId, quantity: q }];
            added++;
          }
          return { cart };
        });
        setCartBump((n) => n + 1);
        if (added)
          toast.success("Itens adicionados ao carrinho", {
            description: skipped
              ? `${skipped} item(ns) indisponível(is) foram ignorados.`
              : undefined,
          });
        else toast.error("Nenhum item deste pedido está disponível.");
      },
      login: () => patch(() => ({ loggedIn: true })),
      logout: () => patch(() => ({ loggedIn: false })),
    };
  }, [
    state,
    hydrated,
    theme,
    cartBump,
    openedProduct,
    addToCart,
    removeFromCart,
    setQuantity,
    isFavorite,
    toggleFavorite,
    moveToFavorites,
    applyCoupon,
    placeOrder,
    patch,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop deve ser usado dentro de ShopProvider");
  return v;
}

export { money, avatarFor };
