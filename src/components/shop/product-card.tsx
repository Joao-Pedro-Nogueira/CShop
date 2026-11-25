import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { installment, money } from "@/lib/shop/format";
import type { Product } from "@/lib/shop/data";
import { useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";
import { SafeImage, Stars } from "./common";

const tagStyle: Record<string, string> = {
  Novo: "bg-emerald-600 text-white",
  "Mais vendido": "bg-amber-500 text-black",
  Oferta: "bg-sale text-white dark:text-black",
};

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  const { isFavorite, toggleFavorite, addToCart, openProduct } = useShop();
  const fav = isFavorite(product.id);
  const out = product.stock === 0;
  const tag = out ? undefined : product.tags.includes("Oferta") ? "Oferta" : product.tags[0];

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:shadow-lg",
        layout === "list" ? "flex-col sm:flex-row" : "flex-col",
      )}
    >
      <div
        className={cn(
          "relative bg-muted",
          layout === "list" ? "aspect-square sm:w-56 sm:shrink-0" : "aspect-square",
        )}
      >
        <SafeImage
          src={product.images[0]}
          alt={`Imagem de ${product.name}`}
          className={cn(
            "size-full object-cover transition-transform duration-300 group-hover:scale-105",
            out && "opacity-60 grayscale",
          )}
        />
        {tag && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-bold",
              tagStyle[tag] ?? "bg-primary text-primary-foreground",
            )}
          >
            {tag}
          </span>
        )}
        {out && (
          <span className="absolute left-2 top-2 rounded-md bg-foreground px-2 py-0.5 text-[11px] font-bold text-background">
            Esgotado
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={fav}
          aria-label={
            fav
              ? `Remover ${product.name} dos favoritos`
              : `Adicionar ${product.name} aos favoritos`
          }
          className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full bg-card/90 shadow transition-transform hover:scale-110"
        >
          <Heart className={cn("size-4", fav ? "fill-sale text-sale" : "text-foreground")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="text-sm font-semibold leading-snug">
          <button
            type="button"
            onClick={() => openProduct(product.id)}
            className="text-left after:absolute after:inset-0 after:content-[''] hover:text-primary"
            aria-label={`Ver detalhes de ${product.name}`}
          >
            {product.name}
          </button>
        </h3>
        {layout === "list" && (
          <p className="hidden text-sm text-muted-foreground sm:block">
            {product.shortDescription}
          </p>
        )}
        <Stars rating={product.rating} count={product.reviews} />
        <div className="mt-auto pt-2">
          {product.originalPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {money(product.originalPrice)}
            </p>
          )}
          <p className="flex items-center gap-2 text-xl font-extrabold">
            {money(product.price)}
            {product.discount > 0 && (
              <span className="rounded bg-sale/15 px-1.5 py-0.5 text-xs font-bold text-sale">
                -{product.discount}%
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{installment(product.price)}</p>
        </div>
        <Button
          className="relative z-10 mt-2 w-full"
          disabled={out}
          onClick={() => addToCart(product.id)}
          aria-label={
            out ? `${product.name} indisponível` : `Adicionar ${product.name} ao carrinho`
          }
        >
          <ShoppingCart className="size-4" />
          {out ? "Indisponível" : "Adicionar ao carrinho"}
        </Button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card" aria-hidden="true">
      <div className="skeleton aspect-square rounded-none" />
      <div className="space-y-2 p-3.5">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton mt-4 h-6 w-2/5" />
        <div className="skeleton h-9 w-full" />
      </div>
    </div>
  );
}
