import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { Star } from "lucide-react";
import { FALLBACK_IMAGE } from "@/lib/shop/data";
import { cn } from "@/lib/utils";

export function SafeImage({ src, alt, className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      {...rest}
      src={failed || !src ? FALLBACK_IMAGE : src}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function Stars({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <span
        className="flex"
        role="img"
        aria-label={`Avaliação ${rating.toFixed(1).replace(".", ",")} de 5`}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(
              "size-3.5",
              rating >= i - 0.25
                ? "fill-star text-star"
                : rating >= i - 0.75
                  ? "fill-star/50 text-star"
                  : "text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      {count !== undefined && <span>({count})</span>}
    </div>
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <div className="border-b bg-gradient-to-br from-secondary to-background">
      <div className="container-shop flex flex-wrap items-end justify-between gap-3 py-8">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Aguardando pagamento": "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
    "Em separação": "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
    Enviado: "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200",
    Entregue: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
    Cancelado: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200",
  };
  return (
    <span
      className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", styles[status])}
    >
      {status}
    </span>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
