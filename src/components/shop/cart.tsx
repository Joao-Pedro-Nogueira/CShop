import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Barcode,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Heart,
  Minus,
  Plus,
  QrCode,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  productById,
  products,
  shippingOptions,
  computeTotals,
  type Address,
  type Order,
  type SavedCard,
} from "@/lib/shop/data";
import { formatDateTime, money } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";
import { PageHeading, SafeImage, Spinner } from "./common";
import { AddressForm, CardForm, addressLine } from "./forms";
import { ProductCard } from "./product-card";
import { ShippingCalculator } from "./shipping";

type PaymentChoice = { method: "card"; cardId: string } | { method: "pix" } | { method: "boleto" };

const PIX_CODE =
  "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540512.345802BR5905CShop6009SAO PAULO62070503***6304ABCD";
const BOLETO_CODE = "23793.38128 60000.000003 00000.000400 1 98760000012345";

function Summary({
  checkoutOpen,
  onCheckout,
  blocked,
}: {
  checkoutOpen: boolean;
  onCheckout: () => void;
  blocked: boolean;
}) {
  const { totals, coupon, applyCoupon, removeCoupon, cartSubtotal, selectedShipping } = useShop();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Digite um código de cupom.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      if (applyCoupon(code)) setCode("");
      setBusy(false);
    }, 400);
  };
  return (
    <aside
      aria-label="Resumo do pedido"
      className="h-fit space-y-4 rounded-xl border bg-card p-5 lg:sticky lg:top-32"
    >
      <h2 className="text-lg font-bold">Resumo do pedido</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{money(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Desconto ({coupon})</dt>
            <dd>- {money(totals.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Frete{selectedShipping ? ` (${selectedShipping.name})` : ""}
          </dt>
          <dd>
            {totals.shipping === null ? (
              "A calcular"
            ) : totals.shipping === 0 ? (
              <span className="font-semibold text-success">Grátis</span>
            ) : (
              money(totals.shipping)
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd className="text-xl">{money(totals.total)}</dd>
        </div>
      </dl>
      <p className="-mt-2 text-xs text-muted-foreground">
        ou em até 12x de {money(totals.total / 12)}
      </p>
      {cartSubtotal < 299 && (
        <p className="rounded-lg bg-accent p-2 text-xs">
          Faltam {money(299 - cartSubtotal)} para frete grátis (opção Normal)!
        </p>
      )}

      {!checkoutOpen && (
        <>
          <form onSubmit={apply} noValidate>
            <label htmlFor="coupon" className="field-label">
              Cupom de desconto
            </label>
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-semibold text-success">
                  <Tag className="size-4" /> {coupon} aplicado
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  aria-label="Remover cupom"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  id="coupon"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="BEMVINDO10"
                  autoComplete="off"
                />
                <Button type="submit" variant="outline" disabled={busy}>
                  {busy ? <Spinner /> : "Aplicar"}
                </Button>
              </div>
            )}
          </form>
          <div>
            <p className="field-label">Frete</p>
            <ShippingCalculator subtotal={cartSubtotal} idPrefix="cart" persist />
          </div>
          <Button size="lg" className="w-full" disabled={blocked} onClick={onCheckout}>
            Finalizar compra
          </Button>
          {blocked && (
            <p role="alert" className="text-xs text-destructive">
              Resolva os avisos de estoque nos itens para continuar.
            </p>
          )}
        </>
      )}
    </aside>
  );
}

function CartItems({ stockIssue }: { stockIssue: (id: number) => string | null }) {
  const { cart, setQuantity, removeFromCart, moveToFavorites, openProduct } = useShop();
  return (
    <ul className="space-y-3">
      {cart.map((l) => {
        const p = productById(l.productId)!;
        const issue = stockIssue(p.id);
        return (
          <li
            key={p.id}
            className={cn("rounded-xl border bg-card p-4", issue && "border-destructive/60")}
          >
            <div className="flex gap-4">
              <button
                type="button"
                className="shrink-0"
                aria-label={`Ver ${p.name}`}
                onClick={() => openProduct(p.id)}
              >
                <SafeImage
                  src={p.images[0]}
                  alt=""
                  className="size-20 rounded-lg object-cover sm:size-24"
                />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                <h3 className="font-semibold leading-snug">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Unitário: {money(p.price)}</p>
              </div>
              <p className="hidden text-right font-bold sm:block">{money(p.price * l.quantity)}</p>
            </div>
            {issue && (
              <p
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-2 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {issue}
                {p.stock > 0 && (
                  <button
                    type="button"
                    className="ml-auto shrink-0 font-semibold underline"
                    onClick={() => setQuantity(p.id, p.stock)}
                  >
                    Ajustar para {p.stock}
                  </button>
                )}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label={`Quantidade de ${p.name}`}
                className="flex items-center rounded-lg border"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Diminuir quantidade"
                  disabled={l.quantity <= 1}
                  onClick={() => setQuantity(p.id, l.quantity - 1)}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-10 text-center font-semibold" aria-live="polite">
                  {l.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Aumentar quantidade"
                  disabled={l.quantity >= p.stock}
                  onClick={() => setQuantity(p.id, l.quantity + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <span className="font-bold sm:hidden">{money(p.price * l.quantity)}</span>
              <div className="ml-auto flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => moveToFavorites(p.id)}>
                  <Heart className="size-4" /> Mover para favoritos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(p.id)}
                  aria-label={`Remover ${p.name}`}
                >
                  <Trash2 className="size-4" /> Remover
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Endereço", "Pagamento", "Revisão"];
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Etapas do checkout">
      {steps.map((s, i) => (
        <li
          key={s}
          aria-current={step === i + 1 ? "step" : undefined}
          className="flex flex-1 items-center gap-2 text-sm"
        >
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full border-2 font-bold",
              step > i + 1
                ? "border-primary bg-primary text-primary-foreground"
                : step === i + 1
                  ? "border-primary text-primary"
                  : "text-muted-foreground",
            )}
          >
            {step > i + 1 ? <Check className="size-4" /> : i + 1}
          </span>
          <span
            className={cn(
              "hidden font-medium sm:inline",
              step === i + 1 ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 && <span className="h-0.5 flex-1 bg-border" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

function AddressStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { addresses, saveAddress } = useShop();
  const [adding, setAdding] = useState(addresses.length === 0);
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">Endereço de entrega</h2>
      <div role="radiogroup" aria-label="Endereços salvos" className="space-y-2">
        {addresses.map((a) => (
          <label
            key={a.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
              selected === a.id && "border-primary bg-accent",
            )}
          >
            <input
              type="radio"
              name="address"
              className="mt-1"
              checked={selected === a.id}
              onChange={() => onSelect(a.id)}
            />
            <span className="text-sm">
              <strong>{a.label}</strong>{" "}
              {a.main && (
                <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Principal
                </span>
              )}
              <span className="block text-muted-foreground">{addressLine(a)}</span>
            </span>
          </label>
        ))}
      </div>
      {adding ? (
        <div className="mt-4 rounded-xl border bg-card p-4">
          <h3 className="mb-3 font-semibold">Novo endereço</h3>
          <AddressForm
            idp="ck-addr"
            onCancel={addresses.length ? () => setAdding(false) : undefined}
            onSave={(a, main) => {
              saveAddress({ ...a, main: main || addresses.length === 0 });
              onSelect(a.id);
              setAdding(false);
              toast.success("Endereço cadastrado");
            }}
          />
        </div>
      ) : (
        <Button variant="outline" className="mt-3" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Cadastrar novo endereço
        </Button>
      )}
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" /> Voltar ao carrinho
        </Button>
        <Button disabled={!selected} onClick={onNext}>
          Continuar para pagamento
        </Button>
      </div>
    </div>
  );
}

function BarcodeSvg() {
  const bars = Array.from({ length: 60 }, (_, i) => ((i * 37) % 5) + 1);
  let x = 0;
  return (
    <svg
      viewBox="0 0 300 60"
      className="h-16 w-full max-w-sm rounded bg-white p-1"
      role="img"
      aria-label="Código de barras do boleto (ilustrativo)"
    >
      {bars.map((w, i) => {
        const rect =
          i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="60" fill="#000" /> : null;
        x += w;
        return rect;
      })}
    </svg>
  );
}

function QrPlaceholder() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const r = Math.floor(i / 21);
    const c = i % 21;
    const finder = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
    const finderOn =
      finder &&
      (r % 14 === 0 ||
        c % 14 === 0 ||
        r % 14 === 6 ||
        c % 14 === 6 ||
        (r % 14 > 1 && r % 14 < 5 && c % 14 > 1 && c % 14 < 5));
    return finder ? finderOn : (r * 7 + c * 13 + r * c) % 3 === 0;
  });
  return (
    <svg
      viewBox="0 0 21 21"
      className="size-40 rounded bg-white p-2"
      role="img"
      aria-label="QR Code Pix (ilustrativo)"
      shapeRendering="crispEdges"
    >
      {cells.map((on, i) =>
        on ? (
          <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#000" />
        ) : null,
      )}
    </svg>
  );
}

function CopyField({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <label htmlFor={`copy-${label}`} className="field-label">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={`copy-${label}`}
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            navigator.clipboard?.writeText(value);
            toast.success("Código copiado");
          }}
        >
          <Copy className="size-4" /> Copiar
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({
  choice,
  setChoice,
  onNext,
  onBack,
}: {
  choice: PaymentChoice;
  setChoice: (c: PaymentChoice) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { cards, addCard } = useShop();
  const [newCard, setNewCard] = useState(cards.length === 0);
  const methods = [
    { id: "card", label: "Cartão", icon: CreditCard },
    { id: "pix", label: "Pix", icon: QrCode },
    { id: "boleto", label: "Boleto", icon: Barcode },
  ] as const;
  const valid = choice.method !== "card" || !!choice.cardId;
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">Forma de pagamento</h2>
      <div role="tablist" aria-label="Métodos de pagamento" className="grid grid-cols-3 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={choice.method === m.id}
            onClick={() =>
              setChoice(
                m.id === "card" ? { method: "card", cardId: cards[0]?.id ?? "" } : { method: m.id },
              )
            }
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border bg-card p-3 text-sm font-semibold transition-colors",
              choice.method === m.id && "border-primary bg-accent text-primary",
            )}
          >
            <m.icon className="size-5" aria-hidden="true" /> {m.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-4 animate-fade-up">
        {choice.method === "card" && (
          <div className="space-y-3">
            <div role="radiogroup" aria-label="Cartões salvos" className="space-y-2">
              {cards.map((c) => (
                <label
                  key={c.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4",
                    choice.cardId === c.id && !newCard && "border-primary bg-accent",
                  )}
                >
                  <input
                    type="radio"
                    name="card"
                    checked={choice.cardId === c.id && !newCard}
                    onChange={() => {
                      setNewCard(false);
                      setChoice({ method: "card", cardId: c.id });
                    }}
                  />
                  <span className="text-sm">
                    <strong>{c.brand}</strong> final {c.last4}{" "}
                    <span className="text-muted-foreground">· validade {c.expiry}</span>
                  </span>
                </label>
              ))}
            </div>
            {newCard ? (
              <div className="rounded-xl border bg-card p-4">
                <h3 className="mb-3 font-semibold">Novo cartão</h3>
                <CardForm
                  idp="ck-card"
                  submitLabel="Usar este cartão"
                  onCancel={cards.length ? () => setNewCard(false) : undefined}
                  onSave={(c: SavedCard) => {
                    addCard(c);
                    setChoice({ method: "card", cardId: c.id });
                    setNewCard(false);
                    toast.success("Cartão adicionado");
                  }}
                />
              </div>
            ) : (
              <Button variant="outline" onClick={() => setNewCard(true)}>
                <Plus className="size-4" /> Usar novo cartão
              </Button>
            )}
          </div>
        )}
        {choice.method === "pix" && (
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row">
            <QrPlaceholder />
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                Após confirmar o pedido, escaneie o QR Code ou use o código copia e cola. O
                pagamento é confirmado na hora.
              </p>
              <CopyField label="Pix copia e cola" value={PIX_CODE} />
            </div>
          </div>
        )}
        {choice.method === "boleto" && (
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              O boleto vence em 3 dias úteis. O pedido é liberado após a compensação.
            </p>
            <BarcodeSvg />
            <CopyField label="Linha digitável" value={BOLETO_CODE} />
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" /> Voltar
        </Button>
        <Button disabled={!valid} onClick={onNext}>
          Revisar pedido
        </Button>
      </div>
    </div>
  );
}

function paymentLabel(c: PaymentChoice, cards: SavedCard[]) {
  if (c.method === "pix") return "Pix";
  if (c.method === "boleto") return "Boleto";
  const card = cards.find((x) => x.id === c.cardId);
  return card ? `Cartão ${card.brand} final ${card.last4}` : "Cartão";
}

function ReviewStep({
  address,
  choice,
  onBack,
  onConfirm,
}: {
  address: Address;
  choice: PaymentChoice;
  onBack: () => void;
  onConfirm: (o: Order) => void;
}) {
  const { cart, cards, cartSubtotal, coupon, shipping, setShipping, placeOrder } = useShop();
  const [busy, setBusy] = useState(false);
  const options = shippingOptions(address.cep);
  const option = options.find((o) => o.id === (shipping?.option ?? "normal")) ?? options[0]!;
  const t = computeTotals(cartSubtotal, coupon, option);
  useEffect(() => {
    if (shipping?.cep !== address.cep)
      setShipping({ cep: address.cep, option: shipping?.option ?? "normal" });
  }, [address.cep, shipping, setShipping]);
  const confirm = () => {
    setBusy(true);
    setTimeout(() => {
      const order = placeOrder({
        address,
        payment: paymentLabel(choice, cards),
        shippingOption: option,
      });
      setBusy(false);
      onConfirm(order);
    }, 900);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Revise seu pedido</h2>
      <section className="rounded-xl border bg-card p-4 text-sm">
        <h3 className="font-semibold">Entrega</h3>
        <p className="text-muted-foreground">
          {address.label} — {addressLine(address)}
        </p>
        <fieldset className="mt-3">
          <legend className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
            Modalidade
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o) => {
              const free = computeTotals(cartSubtotal, coupon, o).freeShipping;
              return (
                <label
                  key={o.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border p-3",
                    option.id === o.id && "border-primary bg-accent",
                  )}
                >
                  <input
                    type="radio"
                    name="ck-ship"
                    checked={option.id === o.id}
                    onChange={() => setShipping({ cep: address.cep, option: o.id })}
                  />
                  <span className="flex-1">
                    <strong>{o.name}</strong>
                    <span className="block text-xs text-muted-foreground">{o.days}</span>
                  </span>
                  <strong>{free ? "Grátis" : money(o.price)}</strong>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>
      <section className="rounded-xl border bg-card p-4 text-sm">
        <h3 className="font-semibold">Pagamento</h3>
        <p className="text-muted-foreground">{paymentLabel(choice, cards)}</p>
      </section>
      <section className="rounded-xl border bg-card p-4 text-sm">
        <h3 className="mb-2 font-semibold">Itens</h3>
        <ul className="divide-y">
          {cart.map((l) => {
            const p = productById(l.productId)!;
            return (
              <li key={p.id} className="flex items-center gap-3 py-2">
                <SafeImage src={p.images[0]} alt="" className="size-12 rounded-md object-cover" />
                <span className="flex-1">
                  {l.quantity}× {p.name}
                </span>
                <strong>{money(p.price * l.quantity)}</strong>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 flex justify-between border-t pt-3 text-base font-bold">
          <span>Total</span>
          <span>{money(t.total)}</span>
        </p>
      </section>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={busy}>
          <ArrowLeft className="size-4" /> Voltar
        </Button>
        <Button size="lg" onClick={confirm} disabled={busy}>
          {busy && <Spinner />} {busy ? "Processando…" : "Confirmar pedido"}
        </Button>
      </div>
    </div>
  );
}

function Success({ order }: { order: Order }) {
  return (
    <div className="container-shop my-10 max-w-2xl">
      <div className="rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-16 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold">Pedido realizado com sucesso!</h1>
        <p className="mt-1 text-muted-foreground">
          Número do pedido: <strong className="text-foreground">{order.number}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDateTime(order.date)} · Status: {order.status}
        </p>
        <ul className="mt-6 divide-y rounded-xl border text-left text-sm">
          {order.items.map((it) => {
            const p = productById(it.productId);
            return (
              <li key={it.productId} className="flex justify-between gap-3 p-3">
                <span>
                  {it.quantity}× {p?.name}
                </span>
                <span>{money(it.price * it.quantity)}</span>
              </li>
            );
          })}
          <li className="flex justify-between p-3 text-muted-foreground">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </li>
          {order.discount > 0 && (
            <li className="flex justify-between p-3 text-success">
              <span>Desconto</span>
              <span>- {money(order.discount)}</span>
            </li>
          )}
          <li className="flex justify-between p-3 text-muted-foreground">
            <span>Frete</span>
            <span>{order.shipping ? money(order.shipping) : "Grátis"}</span>
          </li>
          <li className="flex justify-between p-3 font-bold">
            <span>Total ({order.payment})</span>
            <span>{money(order.total)}</span>
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Entrega em: {addressLine(order.address)}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/perfil" search={{ tab: "pedidos" }}>
              Ver meus pedidos
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/produtos">Continuar comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const { cart, addresses, cards, hydrated } = useShop();
  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState("");
  const [choice, setChoice] = useState<PaymentChoice>({ method: "card", cardId: "" });
  const [placed, setPlaced] = useState<Order | null>(null);

  // Valores padrão (endereço principal e primeiro cartão) após carregar o estado salvo
  useEffect(() => {
    if (!addressId) setAddressId((addresses.find((a) => a.main) ?? addresses[0])?.id ?? "");
  }, [addresses, addressId]);
  useEffect(() => {
    setChoice((c) =>
      c.method === "card" && !cards.some((x) => x.id === c.cardId)
        ? { method: "card", cardId: cards[0]?.id ?? "" }
        : c,
    );
  }, [cards]);

  const stockIssue = (id: number) => {
    const p = productById(id)!;
    const q = cart.find((l) => l.productId === id)!.quantity;
    if (p.stock === 0) return "Este item está sem estoque. Remova-o para continuar.";
    if (q > p.stock)
      return `Apenas ${p.stock} ${p.stock === 1 ? "unidade disponível" : "unidades disponíveis"} em estoque.`;
    return null;
  };
  const blocked = cart.some((l) => stockIssue(l.productId));

  // Se algo mudou no estoque durante o checkout, volta para o carrinho
  useEffect(() => {
    if (step > 0 && blocked) setStep(0);
  }, [blocked, step]);

  if (placed) return <Success order={placed} />;

  const address = addresses.find((a) => a.id === addressId);
  const suggestions = products
    .filter((p) => p.stock > 0 && !cart.some((l) => l.productId === p.id))
    .sort((a, b) => a.sales - b.sales)
    .slice(0, 4);

  if (hydrated && cart.length === 0) {
    return (
      <>
        <PageHeading title="Carrinho" />
        <div className="container-shop py-10">
          <div className="grid place-items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
            <ShoppingCart
              className="size-20 text-primary/70"
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <h2 className="mt-4 text-2xl font-extrabold">Seu carrinho está vazio</h2>
            <p className="mt-1 text-muted-foreground">
              Explore nossos produtos e adicione os que mais gostar.
            </p>
            <Button asChild size="lg" className="mt-5">
              <Link to="/produtos">Ver produtos</Link>
            </Button>
          </div>
          <h2 className="mb-4 mt-12 text-xl font-bold">Você pode gostar</h2>
          <div className="product-grid cols-4">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeading
        title={step === 0 ? "Carrinho" : "Finalizar compra"}
        subtitle={
          step === 0
            ? `${cart.length} ${cart.length === 1 ? "item" : "itens"} no carrinho`
            : undefined
        }
      />
      <div className="container-shop grid gap-6 py-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {!hydrated ? (
            <div className="skeleton h-40" aria-hidden="true" />
          ) : step === 0 ? (
            <CartItems stockIssue={stockIssue} />
          ) : (
            <>
              <Stepper step={step} />
              {step === 1 && (
                <AddressStep
                  selected={addressId}
                  onSelect={setAddressId}
                  onNext={() => setStep(2)}
                  onBack={() => setStep(0)}
                />
              )}
              {step === 2 && (
                <PaymentStep
                  choice={choice}
                  setChoice={setChoice}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && address && (
                <ReviewStep
                  address={address}
                  choice={choice}
                  onBack={() => setStep(2)}
                  onConfirm={(o) => {
                    setPlaced(o);
                    window.scrollTo({ top: 0 });
                  }}
                />
              )}
            </>
          )}
        </div>
        <Summary
          checkoutOpen={step > 0}
          blocked={blocked}
          onCheckout={() => {
            setStep(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </>
  );
}
