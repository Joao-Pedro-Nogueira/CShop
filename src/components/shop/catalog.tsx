import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as SliderPrimitive from "@radix-ui/react-slider";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  PackageSearch,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { brands, categories, products, type Product } from "@/lib/shop/data";
import { money } from "@/lib/shop/format";
import { cn } from "@/lib/utils";
import { PageHeading } from "./common";
import { ProductCard, ProductCardSkeleton } from "./product-card";

export type CatalogSearch = {
  q?: string | undefined;
  category?: string | undefined;
  brand?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  rating?: number | undefined;
  sale?: boolean | undefined;
  stock?: boolean | undefined;
  sort?: string | undefined;
  page?: number | undefined;
  view?: "list" | undefined;
};

const num = (v: unknown) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(n) ? n : undefined;
};
const flag = (v: unknown) => (v === true || v === "true" ? true : undefined);
const text = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : String(v));

export function validateCatalogSearch(s: { [K in keyof CatalogSearch]?: unknown }): CatalogSearch {
  const page = num(s.page);
  const rating = num(s.rating);
  return {
    q: text(s.q),
    category: text(s.category),
    brand: text(s.brand),
    min: num(s.min),
    max: num(s.max),
    rating: rating && rating >= 2 && rating <= 4 ? Math.round(rating) : undefined,
    sale: flag(s.sale),
    stock: flag(s.stock),
    sort: sortOptions.some((o) => o.value === s.sort) ? (s.sort as string) : undefined,
    page: page && page > 1 ? Math.floor(page) : undefined,
    view: s.view === "list" ? "list" : undefined,
  };
}

export const sortOptions = [
  { value: "relevance", label: "Relevância" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "rating", label: "Melhor avaliados" },
  { value: "discount", label: "Maiores descontos" },
  { value: "az", label: "A-Z" },
];

const PAGE_SIZE = 12;
const PRICE_MAX = Math.ceil(Math.max(...products.map((p) => p.price)) / 100) * 100;
const split = (v?: string) => (v ? v.split(",").filter(Boolean) : []);

export function filterProducts(s: CatalogSearch): Product[] {
  const cats = split(s.category);
  const brs = split(s.brand);
  const q = s.q?.toLowerCase().trim();
  const list = products.filter(
    (p) =>
      (!cats.length || cats.includes(p.category)) &&
      (!brs.length || brs.includes(p.brand)) &&
      p.price >= (s.min ?? 0) &&
      p.price <= (s.max ?? PRICE_MAX) &&
      (!s.rating || p.rating >= s.rating) &&
      (!s.sale || p.discount > 0) &&
      (!s.stock || p.stock > 0) &&
      (!q || `${p.name} ${p.brand} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(q)),
  );
  const sorters: Record<string, (a: Product, b: Product) => number> = {
    relevance: (a, b) => a.sales - b.sales,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    discount: (a, b) => b.discount - a.discount,
    az: (a, b) => a.name.localeCompare(b.name, "pt-BR"),
  };
  return list.sort(sorters[s.sort ?? "relevance"]);
}

function CheckList({
  title,
  items,
  selected,
  onToggle,
  idp,
}: {
  title: string;
  items: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  idp: string;
}) {
  return (
    <fieldset className="border-b pb-4">
      <legend className="mb-2 text-sm font-bold">{title}</legend>
      <div className="space-y-1.5">
        {items.map((it) => (
          <label key={it} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              id={`${idp}-${title}-${it}`}
              checked={selected.includes(it)}
              onChange={() => onToggle(it)}
            />
            {it}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Filters({
  s,
  update,
  idp,
}: {
  s: CatalogSearch;
  update: (p: Partial<CatalogSearch>) => void;
  idp: string;
}) {
  const [range, setRange] = useState<[number, number]>([s.min ?? 0, s.max ?? PRICE_MAX]);
  useEffect(() => setRange([s.min ?? 0, s.max ?? PRICE_MAX]), [s.min, s.max]);
  const toggle = (key: "category" | "brand", v: string) => {
    const cur = split(s[key]);
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    update({ [key]: next.join(",") || undefined });
  };
  const commit = (r: [number, number]) =>
    update({ min: r[0] > 0 ? r[0] : undefined, max: r[1] < PRICE_MAX ? r[1] : undefined });
  const numField = (idx: 0 | 1, label: string) => (
    <div className="flex-1">
      <label htmlFor={`${idp}-price-${idx}`} className="field-label text-xs">
        {label}
      </label>
      <input
        id={`${idp}-price-${idx}`}
        type="number"
        min={0}
        max={PRICE_MAX}
        inputMode="numeric"
        value={range[idx]}
        onChange={(e) => {
          const v = Math.max(0, Math.min(PRICE_MAX, Number(e.target.value) || 0));
          setRange((r) => (idx === 0 ? [v, r[1]] : [r[0], v]));
        }}
        onBlur={() => commit(range[0] > range[1] ? [range[1], range[0]] : range)}
        onKeyDown={(e) =>
          e.key === "Enter" && commit(range[0] > range[1] ? [range[1], range[0]] : range)
        }
      />
    </div>
  );
  return (
    <div className="space-y-4">
      <CheckList
        idp={idp}
        title="Categoria"
        items={categories}
        selected={split(s.category)}
        onToggle={(v) => toggle("category", v)}
      />
      <CheckList
        idp={idp}
        title="Marca"
        items={brands}
        selected={split(s.brand)}
        onToggle={(v) => toggle("brand", v)}
      />
      <fieldset className="border-b pb-4">
        <legend className="mb-3 text-sm font-bold">Faixa de preço</legend>
        <SliderPrimitive.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          min={0}
          max={PRICE_MAX}
          step={50}
          minStepsBetweenThumbs={1}
          value={range}
          onValueChange={(v) => setRange([v[0] ?? 0, v[1] ?? PRICE_MAX])}
          onValueCommit={(v) => commit([v[0] ?? 0, v[1] ?? PRICE_MAX])}
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
          </SliderPrimitive.Track>
          {["Preço mínimo", "Preço máximo"].map((l) => (
            <SliderPrimitive.Thumb
              key={l}
              aria-label={l}
              className="block size-5 rounded-full border-2 border-primary bg-card shadow transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary"
            />
          ))}
        </SliderPrimitive.Root>
        <div className="mt-3 flex gap-2">
          {numField(0, "Mínimo (R$)")}
          {numField(1, "Máximo (R$)")}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {money(range[0])} – {money(range[1])}
        </p>
      </fieldset>
      <fieldset className="border-b pb-4">
        <legend className="mb-2 text-sm font-bold">Avaliação mínima</legend>
        <div className="space-y-1.5">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${idp}-rating`}
                checked={s.rating === r}
                onChange={() => update({ rating: r })}
              />
              {r}+ estrelas
            </label>
          ))}
          {s.rating && (
            <button
              type="button"
              className="text-xs text-primary underline"
              onClick={() => update({ rating: undefined })}
            >
              Qualquer avaliação
            </button>
          )}
        </div>
      </fieldset>
      <div className="flex items-center justify-between">
        <label htmlFor={`${idp}-sale`} className="text-sm font-medium">
          Somente em promoção
        </label>
        <Switch
          id={`${idp}-sale`}
          checked={!!s.sale}
          onCheckedChange={(c) => update({ sale: c || undefined })}
        />
      </div>
      <div className="flex items-center justify-between">
        <label htmlFor={`${idp}-stock`} className="text-sm font-medium">
          Somente disponíveis
        </label>
        <Switch
          id={`${idp}-stock`}
          checked={!!s.stock}
          onCheckedChange={(c) => update({ stock: c || undefined })}
        />
      </div>
    </div>
  );
}

function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (n: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="size-4" /> Anterior
      </Button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Button
          key={n}
          size="sm"
          variant={n === page ? "default" : "outline"}
          aria-current={n === page ? "page" : undefined}
          aria-label={`Página ${n}`}
          onClick={() => onPage(n)}
        >
          {n}
        </Button>
      ))}
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Próxima <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

export function Catalog({ search }: { search: CatalogSearch }) {
  const navigate = useNavigate({ from: "/produtos" });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const results = useMemo(() => filterProducts(search), [search]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(search.page ?? 1, pages);
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const key = JSON.stringify(search);

  // Simula latência de 600ms a cada mudança de filtros/página
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [key]);

  const update = (patch: Partial<CatalogSearch>, keepPage = false) =>
    navigate({
      search: (prev: CatalogSearch) => ({
        ...prev,
        ...patch,
        page: keepPage ? (patch.page ?? prev.page) : undefined,
      }),
    });
  const clear = () => navigate({ search: { sort: search.sort, view: search.view } });
  const setPage = (n: number) => {
    update({ page: n > 1 ? n : undefined }, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chips: { label: string; remove: () => void }[] = [
    ...split(search.category).map((c) => ({
      label: c,
      remove: () =>
        update({
          category:
            split(search.category)
              .filter((x) => x !== c)
              .join(",") || undefined,
        }),
    })),
    ...split(search.brand).map((b) => ({
      label: b,
      remove: () =>
        update({
          brand:
            split(search.brand)
              .filter((x) => x !== b)
              .join(",") || undefined,
        }),
    })),
    ...(search.min !== undefined || search.max !== undefined
      ? [
          {
            label: `${money(search.min ?? 0)} – ${money(search.max ?? PRICE_MAX)}`,
            remove: () => update({ min: undefined, max: undefined }),
          },
        ]
      : []),
    ...(search.rating
      ? [{ label: `${search.rating}+ estrelas`, remove: () => update({ rating: undefined }) }]
      : []),
    ...(search.sale ? [{ label: "Em promoção", remove: () => update({ sale: undefined }) }] : []),
    ...(search.stock ? [{ label: "Disponíveis", remove: () => update({ stock: undefined }) }] : []),
    ...(search.q
      ? [{ label: `Busca: “${search.q}”`, remove: () => update({ q: undefined }) }]
      : []),
  ];

  const list = search.view === "list";

  return (
    <>
      <PageHeading
        title="Produtos"
        subtitle="Encontre o eletrônico ideal com filtros e ordenação."
      />
      <div className="container-shop mt-6 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-32 rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Filtros</h2>
              <Button variant="link" size="sm" className="h-auto p-0" onClick={clear}>
                Limpar filtros
              </Button>
            </div>
            <Filters s={search} update={update} idp="d" />
          </div>
        </aside>

        <section aria-label="Listagem de produtos" className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
            <Button variant="outline" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <SlidersHorizontal className="size-4" /> Filtrar
              {chips.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {chips.length}
                </span>
              )}
            </Button>
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              <strong className="text-foreground">{results.length}</strong>{" "}
              {results.length === 1 ? "resultado" : "resultados"}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="sort" className="sr-only">
                Ordenar por
              </label>
              <select
                id="sort"
                className="!w-auto"
                value={search.sort ?? "relevance"}
                onChange={(e) =>
                  update({ sort: e.target.value === "relevance" ? undefined : e.target.value })
                }
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <div className="flex rounded-lg border" role="group" aria-label="Modo de exibição">
                <Button
                  variant={list ? "ghost" : "secondary"}
                  size="icon"
                  aria-label="Exibir em grade"
                  aria-pressed={!list}
                  onClick={() => update({ view: undefined }, true)}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  variant={list ? "secondary" : "ghost"}
                  size="icon"
                  aria-label="Exibir em lista"
                  aria-pressed={list}
                  onClick={() => update({ view: "list" }, true)}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
              {chips.map((c) => (
                <li key={c.label}>
                  <button
                    type="button"
                    onClick={c.remove}
                    aria-label={`Remover filtro ${c.label}`}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium transition-colors hover:bg-secondary"
                  >
                    {c.label} <X className="size-3" />
                  </button>
                </li>
              ))}
              <li>
                <Button variant="link" size="sm" onClick={clear}>
                  Limpar filtros
                </Button>
              </li>
            </ul>
          )}

          <div className="mt-4" aria-busy={loading}>
            {loading ? (
              <div
                className={cn("product-grid", list && "!grid-cols-1")}
                role="status"
                aria-label="Carregando produtos"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="grid place-items-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
                <PackageSearch className="size-14 text-muted-foreground" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-bold">Nenhum produto encontrado</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Não encontramos produtos com esses filtros. Tente remover algum deles.
                </p>
                <Button className="mt-5" onClick={clear}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className={cn("product-grid", list && "!grid-cols-1")}>
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} layout={list ? "list" : "grid"} />
                ))}
              </div>
            )}
          </div>
          {!loading && <Pagination page={page} pages={pages} onPage={setPage} />}
        </section>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col overflow-hidden p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>Refine sua busca de produtos.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <Filters s={search} update={update} idp="m" />
          </div>
          <SheetFooter className="flex-row gap-2 border-t p-4">
            <Button variant="outline" className="flex-1" onClick={clear}>
              Limpar filtros
            </Button>
            <Button className="flex-1" onClick={() => setMobileOpen(false)}>
              Ver {results.length} {results.length === 1 ? "produto" : "produtos"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
