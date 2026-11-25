import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CreditCard,
  Heart,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Plus,
  Star,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { orderStatuses, productById, type Address, type Order } from "@/lib/shop/data";
import {
  formatDate,
  formatDateTime,
  isEmail,
  isPhone,
  money,
  passwordStrength,
  phoneMask,
} from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";
import { Field, PageHeading, SafeImage, Spinner, StatusBadge } from "./common";
import { AddressForm, CardForm, addressLine, fieldProps, useForm } from "./forms";
import { ProductCard } from "./product-card";

export const profileTabs = [
  { id: "dados", label: "Meus dados", icon: UserIcon },
  { id: "pedidos", label: "Meus pedidos", icon: Package },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "enderecos", label: "Endereços", icon: MapPin },
  { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { id: "seguranca", label: "Segurança", icon: KeyRound },
] as const;
export type ProfileTab = (typeof profileTabs)[number]["id"];

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="panel-title"
      className="animate-fade-up rounded-xl border bg-card p-5 md:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 id="panel-title" className="text-xl font-bold">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// ---------- Meus dados ----------
function DataSection() {
  const { user, updateUser } = useShop();
  const [avatar, setAvatar] = useState(user.avatar);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState("");
  const f = useForm(
    { name: user.name, email: user.email, phone: user.phone, birthDate: user.birthDate },
    (v) => ({
      ...(v.name.trim().split(/\s+/).length >= 2 ? {} : { name: "Informe nome e sobrenome." }),
      ...(isEmail(v.email) ? {} : { email: "Informe um e-mail válido." }),
      ...(isPhone(v.phone) ? {} : { phone: "Informe um telefone com DDD." }),
      ...(v.birthDate && new Date(v.birthDate) < new Date() && v.birthDate >= "1900-01-01"
        ? {}
        : { birthDate: "Informe uma data de nascimento válida." }),
    }),
  );
  const p = (k: "name" | "email" | "phone" | "birthDate") => fieldProps(f, k, `pf-${k}`);
  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setAvatarError("Selecione um arquivo de imagem (PNG, JPG…).");
    if (file.size > 1024 * 1024) return setAvatarError("A imagem deve ter no máximo 1 MB.");
    setAvatarError("");
    const r = new FileReader();
    r.onload = () => setAvatar(String(r.result));
    r.readAsDataURL(file);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    f.touchAll();
    if (!f.valid) return;
    setBusy(true);
    setTimeout(() => {
      updateUser({ ...f.values, name: f.values.name.trim(), avatar });
      setBusy(false);
      toast.success("Perfil salvo com sucesso");
    }, 600);
  };
  return (
    <Panel title="Meus dados">
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="flex items-center gap-4">
          <SafeImage
            src={avatar}
            alt={`Avatar de ${user.name}`}
            className="size-20 rounded-full border object-cover"
          />
          <div>
            <input
              ref={fileRef}
              id="pf-avatar"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="size-4" /> Alterar foto
            </Button>
            <label htmlFor="pf-avatar" className="sr-only">
              Upload de avatar
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG ou JPG, até 1 MB. Cliente desde {formatDate(user.createdAt)}.
            </p>
            {avatarError && (
              <p role="alert" className="field-error">
                {avatarError}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="pf-name" label="Nome completo" error={f.shown("name")}>
            <input
              {...p("name")}
              autoComplete="name"
              onChange={(e) => f.set({ name: e.target.value })}
            />
          </Field>
          <Field id="pf-email" label="E-mail" error={f.shown("email")}>
            <input
              {...p("email")}
              type="email"
              autoComplete="email"
              onChange={(e) => f.set({ email: e.target.value })}
            />
          </Field>
          <Field id="pf-phone" label="Telefone" error={f.shown("phone")}>
            <input
              {...p("phone")}
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              onChange={(e) => f.set({ phone: phoneMask(e.target.value) })}
            />
          </Field>
          <Field id="pf-cpf" label="CPF" hint="Não pode ser alterado.">
            <input id="pf-cpf" value={user.cpf} readOnly />
          </Field>
          <Field id="pf-birthDate" label="Data de nascimento" error={f.shown("birthDate")}>
            <input
              {...p("birthDate")}
              type="date"
              onChange={(e) => f.set({ birthDate: e.target.value })}
            />
          </Field>
        </div>
        <Button type="submit" disabled={busy}>
          {busy && <Spinner />} {busy ? "Salvando…" : "Salvar"}
        </Button>
      </form>
    </Panel>
  );
}

// ---------- Pedidos ----------
function Timeline({ order }: { order: Order }) {
  const steps = ["Pedido realizado", "Pagamento confirmado", "Em separação", "Enviado", "Entregue"];
  const reached = {
    "Aguardando pagamento": 0,
    "Em separação": 2,
    Enviado: 3,
    Entregue: 4,
    Cancelado: -1,
  }[order.status];
  const base = new Date(order.date).getTime();
  if (order.status === "Cancelado")
    return (
      <ol className="space-y-3">
        <li className="flex gap-3 text-sm">
          <span className="mt-1 size-3 rounded-full bg-primary" />
          <span>
            Pedido realizado{" "}
            <time className="block text-xs text-muted-foreground">
              {formatDateTime(order.date)}
            </time>
          </span>
        </li>
        <li className="flex gap-3 text-sm font-semibold text-destructive">
          <span className="mt-1 size-3 rounded-full bg-destructive" />
          Pedido cancelado
        </li>
      </ol>
    );
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li
          key={s}
          aria-current={i === reached ? "step" : undefined}
          className={cn("flex gap-3 text-sm", i > reached && "text-muted-foreground")}
        >
          <span
            className={cn(
              "mt-1 size-3 shrink-0 rounded-full border-2",
              i <= reached ? "border-primary bg-primary" : "border-border",
            )}
          />
          <span className={cn(i === reached && "font-semibold")}>
            {s}
            {i <= reached && (
              <time className="block text-xs font-normal text-muted-foreground">
                {formatDateTime(new Date(base + i * 86400000 * 0.7).toISOString())}
              </time>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const { reorder, cancelOrder } = useShop();
  const [confirm, setConfirm] = useState(false);
  return (
    <Panel
      title={`Pedido ${order.number}`}
      action={
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Voltar aos pedidos
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge status={order.status} />
        <span className="text-muted-foreground">Realizado em {formatDateTime(order.date)}</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-semibold">Itens</h3>
          <ul className="divide-y rounded-lg border">
            {order.items.map((it) => {
              const p = productById(it.productId);
              return (
                <li key={it.productId} className="flex items-center gap-3 p-3 text-sm">
                  <SafeImage
                    src={p?.images[0]}
                    alt=""
                    className="size-14 rounded-md object-cover"
                  />
                  <span className="flex-1">
                    <span className="block font-medium">{p?.name}</span>
                    <span className="text-muted-foreground">
                      {it.quantity} × {money(it.price)}
                    </span>
                  </span>
                  <strong>{money(it.price * it.quantity)}</strong>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Desconto</dt>
                <dd>- {money(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frete</dt>
              <dd>{order.shipping ? money(order.shipping) : "Grátis"}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
          <div className="text-sm">
            <h3 className="font-semibold">Endereço de entrega</h3>
            <p className="text-muted-foreground">{addressLine(order.address)}</p>
          </div>
          <div className="text-sm">
            <h3 className="font-semibold">Pagamento</h3>
            <p className="text-muted-foreground">{order.payment}</p>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Acompanhamento</h3>
          <Timeline order={order} />
          {order.tracking && (
            <p className="mt-4 rounded-lg bg-accent p-3 text-sm">
              Código de rastreio: <strong className="font-mono">{order.tracking}</strong>
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={() => reorder(order.number)}>Comprar novamente</Button>
        {order.status === "Aguardando pagamento" && (
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:text-destructive"
            onClick={() => setConfirm(true)}
          >
            Cancelar pedido
          </Button>
        )}
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar pedido {order.number}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter pedido</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelOrder(order.number)}>
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}

function OrdersSection() {
  const { orders } = useShop();
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const selected = orders.find((o) => o.number === open);
  if (selected) return <OrderDetail order={selected} onBack={() => setOpen(null)} />;
  const list = orders.filter((o) => !filter || o.status === filter);
  return (
    <Panel
      title="Meus pedidos"
      action={
        <div className="flex items-center gap-2">
          <label htmlFor="order-filter" className="text-sm">
            Status
          </label>
          <select
            id="order-filter"
            className="!w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {orderStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      }
    >
      {list.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum pedido com este status.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((o) => (
            <li
              key={o.number}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border p-4 text-sm transition-colors hover:bg-muted/50"
            >
              <div className="min-w-32">
                <p className="font-bold">{o.number}</p>
                <p className="text-muted-foreground">{formatDate(o.date)}</p>
              </div>
              <StatusBadge status={o.status} />
              <p className="font-bold sm:ml-auto">{money(o.total)}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(o.number)}
                aria-label={`Ver detalhes do pedido ${o.number}`}
              >
                Ver detalhes
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// ---------- Favoritos ----------
function FavoritesSection() {
  const { favorites, toggleFavorite } = useShop();
  const items = favorites.map(productById).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <Panel title={`Favoritos (${items.length})`}>
      {items.length === 0 ? (
        <div className="grid place-items-center py-10 text-center">
          <Heart className="size-14 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold">Você ainda não tem favoritos</h3>
          <p className="text-sm text-muted-foreground">
            Toque no coração dos produtos para salvá-los aqui.
          </p>
          <Button asChild className="mt-4">
            <Link to="/produtos">Explorar produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="product-grid cols-3">
          {items.map((p) => (
            <div key={p.id} className="flex flex-col gap-2">
              <ProductCard product={p} />
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => toggleFavorite(p.id)}
              >
                <Trash2 className="size-4" /> Remover dos favoritos
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ---------- Endereços ----------
function AddressesSection() {
  const { addresses, saveAddress, deleteAddress, setMainAddress } = useShop();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [del, setDel] = useState<Address | null>(null);
  return (
    <Panel
      title="Endereços"
      action={
        !editing && (
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Adicionar endereço
          </Button>
        )
      }
    >
      {editing ? (
        <AddressForm
          key={editing === "new" ? "new" : editing.id}
          idp="pa"
          initial={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSave={(a, main) => {
            saveAddress({ ...a, main });
            setEditing(null);
            toast.success(editing === "new" ? "Endereço adicionado" : "Endereço atualizado");
          }}
        />
      ) : addresses.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum endereço cadastrado.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a.id}
              className={cn(
                "flex flex-col rounded-xl border p-4 text-sm",
                a.main && "border-primary",
              )}
            >
              <p className="flex items-center gap-2 font-bold">
                <MapPin className="size-4" aria-hidden="true" /> {a.label}
                {a.main && (
                  <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    Principal
                  </span>
                )}
              </p>
              <p className="mt-1 flex-1 text-muted-foreground">{addressLine(a)}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
                  Editar
                </Button>
                {!a.main && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMainAddress(a.id);
                      toast.success("Endereço principal atualizado");
                    }}
                  >
                    Definir como principal
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDel(a)}
                  aria-label={`Excluir endereço ${a.label}`}
                >
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir endereço “{del?.label}”?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (del) {
                  deleteAddress(del.id);
                  toast("Endereço excluído");
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}

// ---------- Pagamentos ----------
function PaymentsSection() {
  const { cards, addCard, removeCard } = useShop();
  const [adding, setAdding] = useState(false);
  return (
    <Panel
      title="Formas de pagamento"
      action={
        !adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Adicionar cartão
          </Button>
        )
      }
    >
      {adding && (
        <div className="mb-5 rounded-xl border p-4">
          <CardForm
            idp="pp"
            onCancel={() => setAdding(false)}
            onSave={(c) => {
              addCard(c);
              setAdding(false);
              toast.success("Cartão adicionado");
            }}
          />
        </div>
      )}
      {cards.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground">Nenhum cartão salvo.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {cards.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border bg-gradient-to-br from-primary/10 to-transparent p-4"
            >
              <CreditCard className="size-8 text-primary" aria-hidden="true" />
              <div className="flex-1 text-sm">
                <p className="font-bold">
                  {c.brand} •••• {c.last4}
                </p>
                <p className="text-muted-foreground">
                  {c.holder} · validade {c.expiry}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                aria-label={`Remover cartão final ${c.last4}`}
                onClick={() => {
                  removeCard(c.id);
                  toast("Cartão removido");
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// ---------- Segurança ----------
function SecuritySection() {
  const { logout } = useShop();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const f = useForm({ current: "", next: "", confirm: "" }, (v) => ({
    ...(v.current ? {} : { current: "Informe sua senha atual." }),
    ...(v.next.length >= 8 && passwordStrength(v.next).score >= 3
      ? {}
      : { next: "Mínimo de 8 caracteres, com letras maiúsculas/minúsculas e números." }),
    ...(v.confirm && v.confirm === v.next
      ? {}
      : { confirm: "A confirmação deve ser igual à nova senha." }),
  }));
  const strength = passwordStrength(f.values.next);
  const p = (k: "current" | "next" | "confirm") => fieldProps(f, k, `sec-${k}`);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    f.touchAll();
    if (!f.valid) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      f.reset();
      toast.success("Senha alterada com sucesso");
    }, 700);
  };
  return (
    <div className="space-y-6">
      <Panel title="Alterar senha">
        <form onSubmit={submit} noValidate className="max-w-md space-y-4">
          <Field id="sec-current" label="Senha atual" error={f.shown("current")}>
            <input
              {...p("current")}
              type="password"
              autoComplete="current-password"
              onChange={(e) => f.set({ current: e.target.value })}
            />
          </Field>
          <Field id="sec-next" label="Nova senha" error={f.shown("next")}>
            <input
              {...p("next")}
              type="password"
              autoComplete="new-password"
              onChange={(e) => f.set({ next: e.target.value })}
            />
          </Field>
          {f.values.next && (
            <div aria-live="polite">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full bg-muted",
                      strength.score >= i &&
                        (strength.score <= 1
                          ? "bg-destructive"
                          : strength.score === 2
                            ? "bg-amber-500"
                            : "bg-emerald-500"),
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Força da senha: <strong>{strength.label}</strong>
              </p>
            </div>
          )}
          <Field id="sec-confirm" label="Confirmar nova senha" error={f.shown("confirm")}>
            <input
              {...p("confirm")}
              type="password"
              autoComplete="new-password"
              onChange={(e) => f.set({ confirm: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={busy}>
            {busy && <Spinner />} {busy ? "Salvando…" : "Alterar senha"}
          </Button>
        </form>
      </Panel>
      <Panel title="Sessão">
        <p className="mb-3 text-sm text-muted-foreground">
          Ao sair, sua sessão é encerrada neste dispositivo.
        </p>
        <Button
          variant="outline"
          className="border-destructive/50 text-destructive hover:text-destructive"
          onClick={() => {
            logout();
            toast("Você saiu da sua conta");
            navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" /> Sair
        </Button>
      </Panel>
    </div>
  );
}

export function ProfilePage({ tab }: { tab: ProfileTab }) {
  const { loggedIn, login, user, hydrated } = useShop();
  if (hydrated && !loggedIn)
    return (
      <div className="container-shop grid place-items-center py-24 text-center">
        <UserIcon className="size-16 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold">Você saiu da sua conta</h1>
        <p className="mt-1 text-muted-foreground">
          Entre novamente para acessar seus dados, pedidos e favoritos.
        </p>
        <Button
          className="mt-5"
          size="lg"
          onClick={() => {
            login();
            toast.success("Bem-vindo de volta!");
          }}
        >
          Entrar
        </Button>
      </div>
    );
  return (
    <>
      <PageHeading title="Meu perfil" subtitle={`Olá, ${user.name.split(" ")[0]}!`}>
        <Star className="hidden" />
      </PageHeading>
      <div className="container-shop grid gap-6 py-8 md:grid-cols-[15rem_1fr]">
        <nav aria-label="Seções do perfil" className="md:sticky md:top-32 md:h-fit">
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0">
            {profileTabs.map((t) => (
              <li key={t.id} className="shrink-0">
                <Link
                  to="/perfil"
                  search={{ tab: t.id }}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                    tab === t.id && "bg-primary text-primary-foreground hover:bg-primary",
                  )}
                >
                  <t.icon className="size-4" aria-hidden="true" /> {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
          {tab === "dados" && <DataSection key={user.name + user.avatar.length} />}
          {tab === "pedidos" && <OrdersSection />}
          {tab === "favoritos" && <FavoritesSection />}
          {tab === "enderecos" && <AddressesSection />}
          {tab === "pagamentos" && <PaymentsSection />}
          {tab === "seguranca" && <SecuritySection />}
        </div>
      </div>
    </>
  );
}
