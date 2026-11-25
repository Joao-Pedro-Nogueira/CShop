import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Facebook,
  Heart,
  Instagram,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  UserRound,
  Youtube,
  Zap,
  X,
  CreditCard,
  QrCode,
  Barcode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categories, productById, products } from "@/lib/shop/data";
import { isEmail, money } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";
import { SafeImage, Spinner } from "./common";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="CShop — página inicial"
      className={cn("flex items-center gap-2 font-display text-2xl font-extrabold", className)}
    >
      <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Zap className="size-5" fill="currentColor" aria-hidden="true" />
      </span>
      CShop
    </Link>
  );
}

const navLink = "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent";
const activeProps = { className: "text-primary bg-accent", "aria-current": "page" as const };

function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const { openProduct } = useShop();
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const term = q.trim().toLowerCase();
  const results = term
    ? products
        .filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term))
        .slice(0, 5)
    : [];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = () => {
    setOpen(false);
    navigate({ to: "/produtos", search: q.trim() ? { q: q.trim() } : {} });
  };

  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="header-search" className="sr-only">
          Buscar produtos
        </label>
        <input
          id="header-search"
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder="O que você procura?"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (e.key === "Enter" && active >= 0 && results[active]) {
              e.preventDefault();
              openProduct(results[active].id);
              setOpen(false);
            }
          }}
          className="!rounded-full !bg-muted !pr-11"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="absolute right-1 top-1 grid size-8 place-items-center rounded-full text-muted-foreground hover:text-primary"
        >
          <Search className="size-4" />
        </button>
      </form>
      {open && term && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sugestões de produtos"
          className="absolute left-0 right-0 top-full z-50 mt-2 animate-fade-up overflow-hidden rounded-xl border bg-card shadow-xl"
        >
          {results.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">
              Nenhum produto encontrado para “{q}”.
            </li>
          )}
          {results.map((p, i) => (
            <li key={p.id} role="option" id={`${listId}-${i}`} aria-selected={active === i}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent",
                  active === i && "bg-accent",
                )}
                onClick={() => {
                  openProduct(p.id);
                  setOpen(false);
                }}
              >
                <SafeImage
                  src={p.images[0]}
                  alt=""
                  className="size-11 shrink-0 rounded-md object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="text-sm font-bold text-primary">{money(p.price)}</span>
                </span>
              </button>
            </li>
          ))}
          {results.length > 0 && (
            <li>
              <button
                type="button"
                onClick={submit}
                className="w-full border-t px-3 py-2 text-left text-sm font-medium text-primary hover:bg-accent"
              >
                Ver todos os resultados
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function MiniCart() {
  const { cart, cartCount, cartSubtotal, cartBump, removeFromCart } = useShop();
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 150);
  };
  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Carrinho, ${cartCount} itens`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="relative"
      >
        <ShoppingCart className="size-5" />
        {cartCount > 0 && (
          <span
            key={cartBump}
            className="absolute -right-1 -top-1 grid min-w-5 animate-bump place-items-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-foreground"
          >
            {cartCount}
          </span>
        )}
      </Button>
      {open && (
        <div
          id={id}
          role="region"
          aria-label="Mini-carrinho"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] animate-fade-up rounded-xl border bg-card p-4 shadow-xl"
        >
          {cart.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Seu carrinho está vazio.
            </p>
          ) : (
            <ul className="max-h-72 space-y-3 overflow-auto">
              {cart.map((l) => {
                const p = productById(l.productId)!;
                return (
                  <li key={l.productId} className="flex items-center gap-3">
                    <SafeImage
                      src={p.images[0]}
                      alt=""
                      className="size-12 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.quantity} × {money(p.price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Remover ${p.name}`}
                      onClick={() => removeFromCart(p.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <strong className="text-base">{money(cartSubtotal)}</strong>
          </div>
          <Button asChild className="mt-3 w-full" onClick={() => setOpen(false)}>
            <Link to="/carrinho">Ver carrinho</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { favorites, theme, toggleTheme, user } = useShop();
  const [menu, setMenu] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="bg-primary px-4 py-1.5 text-center text-xs font-medium text-primary-foreground">
        Frete grátis acima de R$ 299 · Em até 12x · Troca em 30 dias
      </div>
      <div className="container-shop flex h-16 items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menu"
          onClick={() => setMenu(true)}
        >
          <Menu className="size-5" />
        </Button>
        <Logo />
        <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 lg:flex">
          <Link
            to="/"
            className={navLink}
            activeProps={activeProps}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link
            to="/produtos"
            className={navLink}
            activeProps={activeProps}
            activeOptions={{ includeSearch: false }}
          >
            Produtos
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(navLink, "flex items-center gap-1")}>
              Categorias <ChevronDown className="size-3.5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {categories.map((c) => (
                <DropdownMenuItem key={c} asChild>
                  <Link to="/produtos" search={{ category: c }}>
                    {c}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/produtos" search={{ sale: true }} className={cn(navLink, "text-sale")}>
            Ofertas
          </Link>
        </nav>
        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBox />
        </div>
        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link
              to="/perfil"
              search={{ tab: "favoritos" }}
              aria-label={`Favoritos, ${favorites.length} itens`}
            >
              <Heart className="size-5" />
              {favorites.length > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-sale px-1 text-[11px] font-bold leading-5 text-white dark:text-black">
                  {favorites.length}
                </span>
              )}
            </Link>
          </Button>
          <MiniCart />
          <Button asChild variant="ghost" size="icon">
            <Link to="/perfil" aria-label={`Perfil de ${user.name}`}>
              <UserRound className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="container-shop pb-3 md:hidden">
        <SearchBox />
      </div>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-[85vw] max-w-sm overflow-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navegue pela CShop</SheetDescription>
          </SheetHeader>
          <nav
            aria-label="Menu mobile"
            className="mt-4 flex flex-col gap-1"
            onClick={() => setMenu(false)}
          >
            <Link to="/" className={navLink}>
              Home
            </Link>
            <Link to="/produtos" className={navLink}>
              Produtos
            </Link>
            <Link to="/produtos" search={{ sale: true }} className={cn(navLink, "text-sale")}>
              Ofertas
            </Link>
            <Link to="/carrinho" className={navLink}>
              Carrinho
            </Link>
            <Link to="/perfil" className={navLink}>
              Meu perfil
            </Link>
            <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Categorias
            </p>
            {categories.map((c) => (
              <Link key={c} to="/produtos" search={{ category: c }} className={navLink}>
                {c}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setError("Informe um e-mail válido, por exemplo nome@dominio.com.");
      setDone(false);
      return;
    }
    setError("");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
      setEmail("");
    }, 700);
  };
  const col = (title: string, items: string[]) => (
    <div>
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-primary hover:underline"
            >
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="container-shop grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Tecnologia para o seu próximo passo. Eletrônicos selecionados, preço justo e entrega
            para todo o Brasil.
          </p>
          <form onSubmit={submit} noValidate className="mt-4 max-w-sm">
            <label htmlFor="newsletter" className="field-label">
              Receba ofertas por e-mail
            </label>
            <div className="flex gap-2">
              <input
                id="newsletter"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
                aria-describedby="newsletter-msg"
              />
              <Button type="submit" disabled={busy}>
                {busy ? <Spinner /> : "Assinar"}
              </Button>
            </div>
            <p
              id="newsletter-msg"
              role="status"
              className={cn("mt-1 text-xs", error ? "text-destructive" : "text-success")}
            >
              {error || (done ? "Inscrição realizada! Obrigado por assinar nossa newsletter." : "")}
            </p>
          </form>
        </div>
        {col("Institucional", [
          "Sobre a CShop",
          "Trocas e devoluções",
          "Política de privacidade",
          "Termos de uso",
        ])}
        {col("Atendimento", ["Central de ajuda", "Rastrear pedido", "Fale conosco", "Garantia"])}
        <div className="sm:col-span-2 lg:col-span-5 grid gap-6 border-t pt-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-bold">Formas de pagamento</h3>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {[
                ["Visa", CreditCard],
                ["Mastercard", CreditCard],
                ["Elo", CreditCard],
                ["Pix", QrCode],
                ["Boleto", Barcode],
              ].map(([n, Icon]) => {
                const I = Icon as typeof CreditCard;
                return (
                  <span
                    key={n as string}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1"
                  >
                    <I className="size-3.5" aria-hidden="true" /> {n as string}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="sm:text-right">
            <h3 className="mb-2 text-sm font-bold">Redes sociais</h3>
            <div className="flex gap-2 sm:justify-end">
              {[
                ["Instagram", Instagram],
                ["Facebook", Facebook],
                ["YouTube", Youtube],
              ].map(([n, Icon]) => {
                const I = Icon as typeof Instagram;
                return (
                  <a
                    key={n as string}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    aria-label={n as string}
                    className="grid size-9 place-items-center rounded-full border transition-colors hover:bg-accent hover:text-primary"
                  >
                    <I className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 CShop. Todos os direitos reservados. Loja fictícia — dados e pagamentos simulados.
      </div>
    </footer>
  );
}
