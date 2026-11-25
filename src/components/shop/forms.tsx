import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Address, SavedCard } from "@/lib/shop/data";
import {
  cardBrand,
  cardMask,
  cepMask,
  digits,
  expiryMask,
  isCardNumber,
  isCep,
  isExpiry,
  mockCep,
} from "@/lib/shop/format";
import { Field, Spinner } from "./common";

/** Estado de formulário com validação em tempo real (erro aparece após tocar no campo). */
export function useForm<T extends Record<string, string>>(
  initial: T,
  validate: (v: T) => Partial<Record<keyof T, string>>,
) {
  const [values, setValues] = useState<T>(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const errors = validate(values);
  const set = (patch: Partial<T>) => setValues((v) => ({ ...v, ...patch }));
  const touch = (k: keyof T) => setTouched((t) => ({ ...t, [k]: true }));
  const shown = (k: keyof T) => (touched[k] ? errors[k] : undefined);
  const touchAll = () =>
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])) as never);
  const valid = Object.keys(errors).length === 0;
  return {
    values,
    set,
    touch,
    shown,
    touchAll,
    valid,
    errors,
    reset: () => {
      setValues(initial);
      setTouched({});
    },
  };
}

export function fieldProps<T extends Record<string, string>>(
  f: ReturnType<typeof useForm<T>>,
  k: keyof T & string,
  id: string,
) {
  const err = f.shown(k);
  return {
    id,
    value: f.values[k],
    onBlur: () => f.touch(k),
    "aria-invalid": !!err,
    "aria-describedby": err ? `${id}-error` : undefined,
  };
}

type AddressValues = {
  label: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
};

export function AddressForm({
  initial,
  onSave,
  onCancel,
  idp = "addr",
  submitLabel = "Salvar endereço",
}: {
  initial?: Address | undefined;
  onSave: (a: Address, makeMain: boolean) => void;
  onCancel?: (() => void) | undefined;
  idp?: string;
  submitLabel?: string;
}) {
  const [main, setMain] = useState(initial?.main ?? false);
  const [busy, setBusy] = useState(false);
  const f = useForm<AddressValues>(
    {
      label: initial?.label ?? "",
      cep: initial?.cep ?? "",
      street: initial?.street ?? "",
      number: initial?.number ?? "",
      complement: initial?.complement ?? "",
      district: initial?.district ?? "",
      city: initial?.city ?? "",
      uf: initial?.uf ?? "",
    },
    (v) => ({
      ...(v.label.trim() ? {} : { label: "Dê um nome ao endereço (ex.: Casa)." }),
      ...(isCep(v.cep) ? {} : { cep: "Informe um CEP válido com 8 dígitos." }),
      ...(v.street.trim() ? {} : { street: "Informe a rua ou avenida." }),
      ...(v.number.trim() ? {} : { number: "Informe o número." }),
      ...(v.district.trim() ? {} : { district: "Informe o bairro." }),
      ...(v.city.trim() ? {} : { city: "Informe a cidade." }),
      ...(/^[A-Z]{2}$/.test(v.uf) ? {} : { uf: "Use a sigla com 2 letras (ex.: SP)." }),
    }),
  );
  const p = (k: keyof AddressValues) => fieldProps(f, k, `${idp}-${k}`);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    f.touchAll();
    if (!f.valid) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onSave(
        { id: initial?.id ?? `a${Date.now()}`, ...f.values, label: f.values.label.trim(), main },
        main,
      );
    }, 500);
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${idp}-label`} label="Nome do endereço" error={f.shown("label")}>
          <input
            {...p("label")}
            placeholder="Casa, Trabalho…"
            onChange={(e) => f.set({ label: e.target.value })}
          />
        </Field>
        <Field
          id={`${idp}-cep`}
          label="CEP"
          error={f.shown("cep")}
          hint="Preenchimento automático ao completar o CEP."
        >
          <input
            {...p("cep")}
            inputMode="numeric"
            placeholder="00000-000"
            autoComplete="postal-code"
            onChange={(e) => {
              const cep = cepMask(e.target.value);
              f.set(digits(cep).length === 8 ? { cep, ...mockCep(cep) } : { cep });
            }}
          />
        </Field>
        <Field
          id={`${idp}-street`}
          label="Rua / Avenida"
          error={f.shown("street")}
          className="sm:col-span-2"
        >
          <input
            {...p("street")}
            autoComplete="address-line1"
            onChange={(e) => f.set({ street: e.target.value })}
          />
        </Field>
        <Field id={`${idp}-number`} label="Número" error={f.shown("number")}>
          <input
            {...p("number")}
            inputMode="numeric"
            onChange={(e) => f.set({ number: e.target.value })}
          />
        </Field>
        <Field id={`${idp}-complement`} label="Complemento (opcional)">
          <input {...p("complement")} onChange={(e) => f.set({ complement: e.target.value })} />
        </Field>
        <Field id={`${idp}-district`} label="Bairro" error={f.shown("district")}>
          <input {...p("district")} onChange={(e) => f.set({ district: e.target.value })} />
        </Field>
        <Field id={`${idp}-city`} label="Cidade" error={f.shown("city")}>
          <input {...p("city")} onChange={(e) => f.set({ city: e.target.value })} />
        </Field>
        <Field id={`${idp}-uf`} label="UF" error={f.shown("uf")}>
          <input
            {...p("uf")}
            maxLength={2}
            onChange={(e) => f.set({ uf: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") })}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={main} onChange={(e) => setMain(e.target.checked)} /> Definir
        como endereço principal
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy && <Spinner />} {busy ? "Salvando…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

type CardValues = { number: string; holder: string; expiry: string; cvv: string };

/** Formulário de cartão. Número completo e CVV nunca são armazenados: só final, bandeira e validade. */
export function CardForm({
  onSave,
  onCancel,
  idp = "card",
  submitLabel = "Salvar cartão",
}: {
  onSave: (c: SavedCard) => void;
  onCancel?: (() => void) | undefined;
  idp?: string;
  submitLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const f = useForm<CardValues>({ number: "", holder: "", expiry: "", cvv: "" }, (v) => ({
    ...(isCardNumber(v.number)
      ? {}
      : { number: "Número de cartão inválido. Para testar use 4242 4242 4242 4242." }),
    ...(v.holder.trim().split(/\s+/).length >= 2
      ? {}
      : { holder: "Informe o nome completo como no cartão." }),
    ...(isExpiry(v.expiry) ? {} : { expiry: "Validade inválida ou vencida (MM/AA)." }),
    ...(/^\d{3,4}$/.test(v.cvv) ? {} : { cvv: "CVV deve ter 3 ou 4 dígitos." }),
  }));
  const p = (k: keyof CardValues) => fieldProps(f, k, `${idp}-${k}`);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    f.touchAll();
    if (!f.valid) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onSave({
        id: `c${Date.now()}`,
        last4: digits(f.values.number).slice(-4),
        brand: cardBrand(f.values.number),
        expiry: f.values.expiry,
        holder: f.values.holder.trim().toUpperCase(),
      });
      f.reset();
    }, 500);
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={`${idp}-number`}
          label="Número do cartão"
          error={f.shown("number")}
          className="sm:col-span-2"
        >
          <input
            {...p("number")}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            onChange={(e) => f.set({ number: cardMask(e.target.value) })}
          />
        </Field>
        <Field
          id={`${idp}-holder`}
          label="Nome impresso no cartão"
          error={f.shown("holder")}
          className="sm:col-span-2"
        >
          <input
            {...p("holder")}
            autoComplete="cc-name"
            onChange={(e) => f.set({ holder: e.target.value.toUpperCase() })}
          />
        </Field>
        <Field id={`${idp}-expiry`} label="Validade (MM/AA)" error={f.shown("expiry")}>
          <input
            {...p("expiry")}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            onChange={(e) => f.set({ expiry: expiryMask(e.target.value) })}
          />
        </Field>
        <Field id={`${idp}-cvv`} label="CVV" error={f.shown("cvv")}>
          <input
            {...p("cvv")}
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            maxLength={4}
            onChange={(e) => f.set({ cvv: digits(e.target.value).slice(0, 4) })}
          />
        </Field>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy && <Spinner />} {busy ? "Validando…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

export const addressLine = (a: Address) =>
  `${a.street}, ${a.number}${a.complement ? ` – ${a.complement}` : ""} · ${a.district}, ${a.city}/${a.uf} · CEP ${a.cep}`;
