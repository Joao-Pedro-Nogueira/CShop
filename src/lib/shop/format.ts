const nf = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Formata como "R$ 1.299,90". */
export const money = (n: number) => `R$ ${nf.format(n)}`;

export const installment = (n: number, times = 10) =>
  `ou ${times}x de ${money(n / times)} sem juros`;

export const digits = (v: string) => v.replace(/\D/g, "");

export const cepMask = (v: string) =>
  digits(v)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");

export const phoneMask = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const cardMask = (v: string) =>
  digits(v)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

export const expiryMask = (v: string) =>
  digits(v)
    .slice(0, 4)
    .replace(/^(\d{2})(\d)/, "$1/$2");

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => [10, 11].includes(digits(v).length);
export const isCep = (v: string) => digits(v).length === 8;

export function isCardNumber(v: string) {
  const d = digits(v);
  if (d.length < 13 || d.length > 16) return false;
  let sum = 0;
  let dbl = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function isExpiry(v: string) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  const now = new Date();
  if (month < 1 || month > 12) return false;
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export const cardBrand = (v: string) => {
  const d = digits(v);
  if (d.startsWith("4")) return "Visa";
  if (/^5[1-5]|^2[2-7]/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "Amex";
  if (/^(606282|3841)/.test(d) || d.startsWith("636")) return "Hipercard";
  return "Elo";
};

export function passwordStrength(p: string) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const labels = ["Muito fraca", "Fraca", "Média", "Boa", "Forte"];
  return { score, label: p ? labels[score] : "" };
}

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

export const formatDateTime = (iso: string) => {
  const dt = new Date(iso);
  return `${dt.toLocaleDateString("pt-BR")} às ${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

/** Nome da cidade/UF mockado a partir do CEP, para preenchimento automático. */
export function mockCep(cep: string) {
  const d = digits(cep);
  const table: Record<string, { street: string; district: string; city: string; uf: string }> = {
    "0": { street: "Avenida Paulista", district: "Bela Vista", city: "São Paulo", uf: "SP" },
    "2": { street: "Avenida Atlântica", district: "Copacabana", city: "Rio de Janeiro", uf: "RJ" },
    "3": { street: "Avenida Afonso Pena", district: "Centro", city: "Belo Horizonte", uf: "MG" },
    "4": { street: "Avenida Sete de Setembro", district: "Centro", city: "Salvador", uf: "BA" },
    "5": { street: "Rua da Aurora", district: "Boa Vista", city: "Recife", uf: "PE" },
    "7": { street: "Eixo Monumental", district: "Asa Sul", city: "Brasília", uf: "DF" },
    "8": { street: "Rua XV de Novembro", district: "Centro", city: "Curitiba", uf: "PR" },
    "9": {
      street: "Avenida Borges de Medeiros",
      district: "Centro Histórico",
      city: "Porto Alegre",
      uf: "RS",
    },
  };
  return table[d[0] ?? "0"] ?? table["0"];
}
