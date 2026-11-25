import { useState } from "react";
import { Button } from "@/components/ui/button";
import { computeTotals, shippingOptions, type ShippingOption } from "@/lib/shop/data";
import { cepMask, isCep, money } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import { Spinner } from "./common";

/**
 * Cálculo de frete por CEP (mockado). Na página do produto funciona de forma local;
 * no carrinho (`persist`) o resultado é guardado no estado global.
 */
export function ShippingCalculator({
  subtotal,
  idPrefix,
  persist = false,
}: {
  subtotal: number;
  idPrefix: string;
  persist?: boolean;
}) {
  const { shipping, setShipping, coupon } = useShop();
  const [cep, setCep] = useState(persist && shipping ? cepMask(shipping.cep) : "");
  const [options, setOptions] = useState<ShippingOption[] | null>(
    persist && shipping ? shippingOptions(shipping.cep) : null,
  );
  const [selected, setSelected] = useState<string | undefined>(
    persist ? shipping?.option : undefined,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const calc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCep(cep)) {
      setError("Digite um CEP válido com 8 dígitos.");
      return;
    }
    setError("");
    setBusy(true);
    setTimeout(() => {
      const opts = shippingOptions(cep);
      setOptions(opts);
      setBusy(false);
      if (persist) {
        setSelected("normal");
        setShipping({ cep, option: "normal" });
      }
    }, 500);
  };

  return (
    <div>
      <form onSubmit={calc} noValidate className="flex gap-2">
        <label htmlFor={`${idPrefix}-cep`} className="sr-only">
          CEP
        </label>
        <input
          id={`${idPrefix}-cep`}
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(cepMask(e.target.value))}
          aria-invalid={!!error}
          aria-describedby={error ? `${idPrefix}-cep-error` : undefined}
        />
        <Button type="submit" variant="outline" disabled={busy}>
          {busy ? <Spinner /> : "Calcular"}
        </Button>
      </form>
      {error && (
        <p id={`${idPrefix}-cep-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
      {options && (
        <ul className="mt-3 space-y-2" aria-label="Opções de frete">
          {options.map((o) => {
            const free = computeTotals(subtotal, coupon, o).freeShipping;
            const content = (
              <>
                <span>
                  <strong className="text-sm">{o.name}</strong>
                  <span className="block text-xs text-muted-foreground">{o.days}</span>
                </span>
                <span className="text-sm font-bold">
                  {free ? <span className="text-success">Grátis</span> : money(o.price)}
                </span>
              </>
            );
            return (
              <li key={o.id}>
                {persist ? (
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent">
                    <input
                      type="radio"
                      name={`${idPrefix}-ship`}
                      className="mr-1"
                      checked={selected === o.id}
                      onChange={() => {
                        setSelected(o.id);
                        setShipping({ cep, option: o.id });
                      }}
                    />
                    <span className="flex flex-1 items-center justify-between">{content}</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
