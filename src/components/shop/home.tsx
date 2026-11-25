import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Headphones,
  Laptop,
  Pause,
  Play,
  Camera,
  Gamepad2,
  Plug,
  ShieldCheck,
  Smartphone,
  Star,
  Tv,
  Truck,
  Undo2,
  Watch,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { brands, categories, products, testimonials, type Category } from "@/lib/shop/data";
import { cn } from "@/lib/utils";
import { Stars } from "./common";
import { ProductCard } from "./product-card";

const slides = [
  {
    title: "Smartphones de última geração",
    subtitle: "Câmeras incríveis, bateria para o dia todo e até 18% de desconto.",
    cta: "Ver smartphones",
    search: { category: "Smartphones" },
    bg: "from-indigo-600 via-violet-600 to-fuchsia-600",
    icon: Smartphone,
  },
  {
    title: "Áudio que te leva para outro nível",
    subtitle: "Fones com cancelamento de ruído a partir de R$ 149,90.",
    cta: "Explorar fones",
    search: { category: "Fones de Ouvido" },
    bg: "from-sky-600 via-cyan-600 to-teal-600",
    icon: Headphones,
  },
  {
    title: "Ofertas imperdíveis de verdade",
    subtitle: "Produtos selecionados com preços especiais por tempo limitado.",
    cta: "Ver ofertas",
    search: { sale: true },
    bg: "from-rose-600 via-orange-600 to-amber-500",
    icon: BadgePercent,
  },
] as const;

function Hero() {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const paused = hover || manualPause;
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused, i]);
  const go = (n: number) => setI((n + slides.length) % slides.length);
  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da loja"
      className="relative overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${i * 100}%)` }}
        aria-live={paused ? "polite" : "off"}
      >
        {slides.map((s, n) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${n + 1} de ${slides.length}`}
              aria-hidden={n !== i}
              className={cn(
                "relative min-h-[360px] w-full shrink-0 bg-gradient-to-br text-white md:min-h-[420px]",
                s.bg,
              )}
            >
              <Icon
                aria-hidden="true"
                className="absolute -bottom-10 -right-6 size-72 text-white/15 md:right-16 md:size-96"
              />
              <div className="container-shop relative flex min-h-[inherit] flex-col justify-center py-12">
                <h2 className="max-w-xl text-3xl font-extrabold leading-tight md:text-5xl">
                  {s.title}
                </h2>
                <p className="mt-3 max-w-md text-base text-white/90 md:text-lg">{s.subtitle}</p>
                <div className="mt-6">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-neutral-900 hover:bg-white/90"
                    tabIndex={n === i ? 0 : -1}
                  >
                    <Link to="/produtos" search={s.search}>
                      {s.cta} <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => go(i - 1)}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        onClick={() => go(i + 1)}
        aria-label="Próximo slide"
        className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
      >
        <ChevronRight />
      </button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-1.5">
        <div role="tablist" aria-label="Escolher slide" className="flex gap-2">
          {slides.map((s, n) => (
            <button
              key={s.title}
              role="tab"
              aria-selected={n === i}
              aria-label={`Ir para o slide ${n + 1}`}
              onClick={() => setI(n)}
              className={cn(
                "h-2.5 rounded-full bg-white transition-all",
                n === i ? "w-6" : "w-2.5 opacity-60",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setManualPause((p) => !p)}
          aria-label={manualPause ? "Retomar rotação" : "Pausar rotação"}
          className="text-white"
        >
          {manualPause ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
        </button>
      </div>
    </section>
  );
}

const benefits = [
  { icon: Truck, title: "Frete grátis", text: "Acima de R$ 299" },
  { icon: CreditCard, title: "Até 12x", text: "Parcele no cartão" },
  { icon: Undo2, title: "Troca em 30 dias", text: "Sem burocracia" },
  { icon: ShieldCheck, title: "Pagamento seguro", text: "Dados protegidos" },
];

const catIcons: Record<Category, typeof Smartphone> = {
  Smartphones: Smartphone,
  Notebooks: Laptop,
  "Fones de Ouvido": Headphones,
  "Smart TVs": Tv,
  Câmeras: Camera,
  Games: Gamepad2,
  Acessórios: Plug,
  Smartwatches: Watch,
};

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000)));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

function Countdown() {
  const left = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts =
    left === null
      ? ["--", "--", "--"]
      : [pad(Math.floor(left / 3600)), pad(Math.floor((left % 3600) / 60)), pad(left % 60)];
  return (
    <div
      className="flex items-center gap-1.5"
      role="timer"
      aria-label={
        left === null
          ? "Tempo restante"
          : `Termina em ${parts[0]} horas, ${parts[1]} minutos e ${parts[2]} segundos`
      }
    >
      <span className="mr-1 text-sm text-muted-foreground">Termina em</span>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span
            className="rounded-md bg-foreground px-2 py-1 font-mono text-sm font-bold text-background"
            aria-hidden="true"
          >
            {p}
          </span>
          {i < 2 && <span aria-hidden="true">:</span>}
        </span>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
  action,
  extra,
  id,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  extra?: React.ReactNode;
  id: string;
}) {
  return (
    <section className="container-shop mt-12" aria-labelledby={id}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 id={id} className="text-2xl font-extrabold">
            {title}
          </h2>
          {extra}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function BestSellers() {
  const ref = useRef<HTMLDivElement>(null);
  const list = [...products].sort((a, b) => a.sales - b.sales).slice(0, 10);
  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <Section
      id="best"
      title="Mais vendidos"
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Rolar para a esquerda"
            onClick={() => scroll(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Rolar para a direita"
            onClick={() => scroll(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      }
    >
      <div
        ref={ref}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3"
        tabIndex={0}
        role="region"
        aria-label="Lista de mais vendidos"
      >
        {list.map((p) => (
          <div
            key={p.id}
            className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[23.5%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </Section>
  );
}

const promos = [
  {
    title: "Games com até 20% OFF",
    text: "Controles e consoles para sua diversão.",
    search: { category: "Games" },
    bg: "from-emerald-600 to-teal-700",
    icon: Gamepad2,
  },
  {
    title: "Notebooks para trabalhar e criar",
    text: "Potência e portabilidade, em até 12x.",
    search: { category: "Notebooks" },
    bg: "from-slate-700 to-indigo-800",
    icon: Laptop,
  },
] as const;

export function Home() {
  const deals = products
    .filter((p) => p.discount > 0 && p.stock > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);
  const launches = products.filter((p) => p.tags.includes("Novo")).slice(0, 4);
  return (
    <>
      <h1 className="sr-only">CShop — Tecnologia para o seu próximo passo</h1>
      <Hero />
      <section aria-label="Benefícios" className="border-b bg-card">
        <ul className="container-shop grid grid-cols-2 gap-4 py-5 lg:grid-cols-4">
          {benefits.map((b) => (
            <li key={b.title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-primary">
                <b.icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-sm">{b.title}</strong>
                <span className="text-xs text-muted-foreground">{b.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Section id="cats" title="Compre por categoria">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => {
            const Icon = catIcons[c];
            return (
              <li key={c}>
                <Link
                  to="/produtos"
                  search={{ category: c }}
                  className="flex h-full flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                >
                  <Icon className="size-8 text-primary" aria-hidden="true" />
                  {c}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        id="deals"
        title="Ofertas do dia"
        extra={<Countdown />}
        action={
          <Link
            to="/produtos"
            search={{ sale: true }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Ver todas <ArrowRight className="size-4" />
          </Link>
        }
      >
        <div className="product-grid cols-4">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <BestSellers />

      <section className="container-shop mt-12 grid gap-4 md:grid-cols-2" aria-label="Promoções">
        {promos.map((p) => (
          <Link
            key={p.title}
            to="/produtos"
            search={p.search}
            className={cn(
              "group relative flex min-h-48 flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-white",
              p.bg,
            )}
          >
            <p.icon
              aria-hidden="true"
              className="absolute -right-4 -top-4 size-44 text-white/15 transition-transform duration-300 group-hover:scale-110"
            />
            <h3 className="relative max-w-xs text-2xl font-extrabold">{p.title}</h3>
            <p className="relative mt-1 max-w-xs text-sm text-white/90">{p.text}</p>
            <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold">
              Aproveitar{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <Section
        id="new"
        title="Lançamentos"
        action={<Zap className="size-5 text-primary" aria-hidden="true" />}
      >
        <div className="product-grid cols-4">
          {launches.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section id="brands" title="Marcas em destaque">
        <ul className="flex flex-wrap gap-3">
          {brands.map((b) => (
            <li key={b}>
              <Link
                to="/produtos"
                search={{ brand: b }}
                className="block rounded-xl border bg-card px-6 py-4 font-display text-lg font-extrabold tracking-tight transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
                aria-label={`Ver produtos ${b}`}
              >
                {b}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="reviews" title="O que dizem nossos clientes">
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-xl border bg-card p-5">
              <Stars rating={t.rating} />
              <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2 text-sm font-semibold">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                  {t.name[0]}
                </span>
                {t.name}
                <span className="ml-auto flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                  <Star className="size-3 fill-star text-star" aria-hidden="true" /> {t.rating},0
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
