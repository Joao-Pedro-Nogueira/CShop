import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShoppingCart, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productById, products, reviewsFor, type Product } from "@/lib/shop/data";
import { formatDate, installment, money } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";
import { SafeImage, Stars } from "./common";
import { ProductCard } from "./product-card";
import { ShippingCalculator } from "./shipping";

function Gallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  return (
    <div>
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border bg-muted"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <SafeImage
          src={product.images[index]}
          alt={`${product.name} — imagem ${index + 1} de ${product.images.length}`}
          className="size-full object-cover transition-transform duration-150"
          style={
            zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined
          }
        />
      </div>
      <div className="mt-3 flex gap-2" role="group" aria-label="Miniaturas">
        {product.images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ver imagem ${i + 1}`}
            aria-pressed={i === index}
            className={cn(
              "size-16 overflow-hidden rounded-lg border-2 transition-colors",
              i === index ? "border-primary" : "border-transparent hover:border-border",
            )}
          >
            <SafeImage src={src} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Detail({ product }: { product: Product }) {
  const { addToCart, isFavorite, toggleFavorite, openProduct, cart } = useShop();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const out = product.stock === 0;
  const inCart = cart.find((l) => l.productId === product.id)?.quantity ?? 0;
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const fav = isFavorite(product.id);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Gallery product={product} />
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {product.brand} · {product.category}
          </p>
          <DialogTitle className="mt-1 text-2xl font-extrabold leading-tight">
            {product.name}
          </DialogTitle>
          <DialogDescription className="mt-1">{product.shortDescription}</DialogDescription>
          <div className="mt-2 flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1).replace(".", ",")} ({product.reviews} avaliações)
            </span>
          </div>
        </div>
        <div>
          {product.originalPrice && (
            <p className="text-sm text-muted-foreground line-through">
              {money(product.originalPrice)}
            </p>
          )}
          <p className="flex items-center gap-2 text-3xl font-extrabold">
            {money(product.price)}
            {product.discount > 0 && (
              <span className="rounded bg-sale/15 px-2 py-0.5 text-sm font-bold text-sale">
                -{product.discount}%
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {installment(product.price)} · ou em até 12x no cartão
          </p>
        </div>
        <p
          className={cn(
            "text-sm font-medium",
            out ? "text-destructive" : product.stock <= 5 ? "text-sale" : "text-success",
          )}
        >
          {out
            ? "Produto indisponível"
            : product.stock <= 5
              ? `Restam ${product.stock} ${product.stock === 1 ? "unidade" : "unidades"}`
              : "Em estoque"}
        </p>
        {!out && (
          <div className="flex items-center gap-3">
            <span id="qty-label" className="text-sm font-semibold">
              Quantidade
            </span>
            <div
              role="group"
              aria-labelledby="qty-label"
              className="flex items-center rounded-lg border"
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label="Diminuir quantidade"
                disabled={qty <= 1}
                onClick={() => setQty((q) => q - 1)}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center font-semibold" aria-live="polite">
                {qty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Aumentar quantidade"
                disabled={qty >= product.stock}
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">Máx. {product.stock}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            disabled={out}
            onClick={() => addToCart(product.id, qty)}
            className="flex-1"
          >
            <ShoppingCart className="size-4" />
            {out ? "Indisponível" : "Adicionar ao carrinho"}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            disabled={out || inCart >= product.stock}
            className="flex-1 border border-primary/30"
            onClick={() => {
              if (addToCart(product.id, qty)) {
                openProduct(null);
                navigate({ to: "/carrinho" });
              }
            }}
          >
            <Zap className="size-4" />
            Comprar agora
          </Button>
          <Button
            size="lg"
            variant="outline"
            aria-pressed={fav}
            aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart className={cn("size-5", fav && "fill-sale text-sale")} />
          </Button>
        </div>
        <div className="rounded-xl border bg-muted/50 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Truck className="size-4" aria-hidden="true" /> Calcular frete e prazo
          </p>
          <ShippingCalculator subtotal={product.price * qty} idPrefix="pdp" />
        </div>
      </div>

      <div className="lg:col-span-2">
        <Tabs defaultValue="descricao">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="descricao">Descrição</TabsTrigger>
            <TabsTrigger value="specs">Especificações técnicas</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          </TabsList>
          <TabsContent
            value="descricao"
            className="animate-fade-up whitespace-pre-line pt-4 text-sm leading-relaxed text-muted-foreground"
          >
            {product.description}
          </TabsContent>
          <TabsContent value="specs" className="animate-fade-up pt-4">
            <dl className="divide-y rounded-lg border text-sm">
              {product.specs.map((s) => (
                <div key={s.key} className="grid grid-cols-2 gap-2 px-4 py-2.5 odd:bg-muted/50">
                  <dt className="font-medium">{s.key}</dt>
                  <dd className="text-muted-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="avaliacoes" className="animate-fade-up space-y-3 pt-4">
            {reviewsFor(product).map((r) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm">{r.author}</strong>
                    <Stars rating={r.rating} />
                  </div>
                  <time className="text-xs text-muted-foreground" dateTime={r.date}>
                    {formatDate(r.date)}
                  </time>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <section className="lg:col-span-2" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-3 text-lg font-bold">
            Produtos relacionados
          </h2>
          <div className="product-grid cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function ProductModal() {
  const { openedProduct, openProduct } = useShop();
  const product = openedProduct ? productById(openedProduct) : undefined;
  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && openProduct(null)}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-5xl overflow-y-auto p-4 sm:p-6">
        {product && <Detail key={product.id} product={product} />}
      </DialogContent>
    </Dialog>
  );
}
