import { digits } from "./format";

export const categories = [
  "Smartphones",
  "Notebooks",
  "Fones de Ouvido",
  "Smart TVs",
  "Câmeras",
  "Games",
  "Acessórios",
  "Smartwatches",
] as const;
export type Category = (typeof categories)[number];

export const brands = [
  "Nexora",
  "Orbit",
  "Sonique",
  "Lumina",
  "Focus",
  "Playbox",
  "Connect",
  "Pulse",
  "Voltix",
] as const;

export type Review = { id: string; author: string; rating: number; date: string; comment: string };

export type Product = {
  id: number;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number | undefined;
  discount: number;
  rating: number;
  reviews: number;
  stock: number;
  shortDescription: string;
  description: string;
  specs: { key: string; value: string }[];
  images: string[];
  tags: string[];
  /** posição no ranking de vendas (1 = mais vendido) */
  sales: number;
};

const categoryStyle: Record<Category, { hue: number; icon: string }> = {
  Smartphones: { hue: 250, icon: "📱" },
  Notebooks: { hue: 200, icon: "💻" },
  "Fones de Ouvido": { hue: 320, icon: "🎧" },
  "Smart TVs": { hue: 280, icon: "📺" },
  Câmeras: { hue: 20, icon: "📷" },
  Games: { hue: 150, icon: "🎮" },
  Acessórios: { hue: 40, icon: "🔌" },
  Smartwatches: { hue: 175, icon: "⌚" },
};

/** Gera um placeholder SVG (data URL) para o produto, sem depender de rede. */
function placeholder(name: string, category: Category, variant: number) {
  const { hue, icon } = categoryStyle[category];
  const h = (hue + variant * 14) % 360;
  const label = (name.length > 30 ? `${name.slice(0, 28)}…` : name)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},70%,92%)"/><stop offset="1" stop-color="hsl(${(h + 40) % 360},65%,78%)"/></linearGradient></defs><rect width="640" height="640" fill="url(#g)"/><circle cx="${200 + variant * 120}" cy="${180 + variant * 30}" r="${90 + variant * 20}" fill="hsl(${h},70%,60%)" opacity=".18"/><text x="320" y="360" font-size="${190 - variant * 20}" text-anchor="middle">${icon}</text><text x="320" y="520" font-size="26" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="hsl(${h},50%,22%)">${label}</text><text x="320" y="560" font-size="18" font-family="sans-serif" text-anchor="middle" fill="hsl(${h},40%,32%)">Vista ${variant + 1}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const FALLBACK_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e5e7eb"/><text x="200" y="215" font-size="64" text-anchor="middle">🖼️</text></svg>',
)}`;

const specsByCategory: Record<Category, [string, string][]> = {
  Smartphones: [
    ["Tela", '6,7" AMOLED 120Hz'],
    ["Memória", "8GB RAM"],
    ["Câmera", "50MP + 12MP"],
    ["Bateria", "5.000 mAh"],
    ["Conectividade", "5G, Wi-Fi 6E, NFC"],
  ],
  Notebooks: [
    ["Tela", '15,6" Full HD IPS'],
    ["Processador", "Octa-core 3,8GHz"],
    ["Memória", "16GB DDR5"],
    ["Armazenamento", "SSD NVMe 512GB"],
    ["Bateria", "Até 12 horas"],
  ],
  "Fones de Ouvido": [
    ["Tipo", "Bluetooth 5.3"],
    ["Cancelamento de ruído", "Ativo (ANC)"],
    ["Autonomia", "Até 30 horas"],
    ["Microfone", "Duplo com redução de ruído"],
    ["Resistência", "IPX4"],
  ],
  "Smart TVs": [
    ["Tela", "LED 4K UHD"],
    ["Taxa de atualização", "60Hz"],
    ["Sistema", "Smart OS com apps de streaming"],
    ["Conexões", "3x HDMI, 2x USB, Wi-Fi"],
    ["Áudio", "20W Dolby Audio"],
  ],
  Câmeras: [
    ["Sensor", "24,2MP CMOS"],
    ["Vídeo", "4K 30fps"],
    ["ISO", "100–25.600"],
    ["Tela", '3" articulada touch'],
    ["Conectividade", "Wi-Fi e Bluetooth"],
  ],
  Games: [
    ["Compatibilidade", "Console Playbox e PC"],
    ["Conexão", "Sem fio 2,4GHz / Bluetooth"],
    ["Bateria", "Até 40 horas"],
    ["Vibração", "Háptica avançada"],
    ["Peso", "280 g"],
  ],
  Acessórios: [
    ["Compatibilidade", "Universal"],
    ["Material", "Alumínio e nylon trançado"],
    ["Potência", "Até 65W"],
    ["Conexão", "USB-C"],
    ["Comprimento", "1,5 m"],
  ],
  Smartwatches: [
    ["Tela", '1,9" AMOLED'],
    ["Bateria", "Até 7 dias"],
    ["Sensores", "Frequência cardíaca, SpO2, GPS"],
    ["Resistência", "5 ATM"],
    ["Compatibilidade", "Android e iOS"],
  ],
};

// nome, marca, categoria, preço, desconto %, avaliação, nº avaliações, estoque, tags, ranking de vendas
type Row = [string, string, Category, number, number, number, number, number, string[], number];
const rows: Row[] = [
  [
    "Smartphone Nexora Pro 256GB",
    "Nexora",
    "Smartphones",
    3299.9,
    18,
    4.8,
    842,
    14,
    ["Mais vendido", "Oferta"],
    1,
  ],
  [
    "Smartphone Nexora Lite 128GB",
    "Nexora",
    "Smartphones",
    1299.9,
    0,
    4.4,
    512,
    25,
    ["Mais vendido"],
    4,
  ],
  ["Smartphone Voltix Edge 5G", "Voltix", "Smartphones", 2199.9, 12, 4.5, 301, 3, ["Oferta"], 9],
  ["Smartphone Nexora Ultra 512GB", "Nexora", "Smartphones", 5499.9, 0, 4.9, 156, 6, ["Novo"], 15],
  [
    'Notebook Orbit Air 14"',
    "Orbit",
    "Notebooks",
    4599.9,
    15,
    4.7,
    389,
    9,
    ["Mais vendido", "Oferta"],
    3,
  ],
  ['Notebook Orbit Pro 16"', "Orbit", "Notebooks", 6999.9, 0, 4.9, 121, 0, ["Novo"], 18],
  ['Notebook Voltix Go 15"', "Voltix", "Notebooks", 2999.9, 10, 4.2, 267, 12, [], 12],
  ["Notebook Orbit Studio Creator", "Orbit", "Notebooks", 8499.9, 0, 4.8, 74, 4, ["Novo"], 24],
  [
    "Headphone Sonique Studio ANC",
    "Sonique",
    "Fones de Ouvido",
    599.9,
    25,
    4.9,
    1204,
    30,
    ["Mais vendido", "Oferta"],
    2,
  ],
  ["Headphone Sonique Bass Max", "Sonique", "Fones de Ouvido", 349.9, 0, 4.3, 433, 18, [], 14],
  [
    "Fone Connect Buds Pro",
    "Connect",
    "Fones de Ouvido",
    249.9,
    20,
    4.6,
    987,
    40,
    ["Mais vendido", "Oferta"],
    5,
  ],
  ["Fone Connect Air Mini", "Connect", "Fones de Ouvido", 149.9, 0, 4.1, 612, 0, [], 20],
  [
    'Smart TV Lumina 55" 4K',
    "Lumina",
    "Smart TVs",
    2799.9,
    20,
    4.7,
    701,
    7,
    ["Mais vendido", "Oferta"],
    6,
  ],
  ['Smart TV Lumina 43" Full HD', "Lumina", "Smart TVs", 1799.9, 0, 4.3, 354, 11, [], 16],
  ['Smart TV Lumina OLED 65"', "Lumina", "Smart TVs", 6499.9, 0, 4.9, 98, 2, ["Novo"], 28],
  ['Smart TV Voltix QLED 50"', "Voltix", "Smart TVs", 2399.9, 14, 4.5, 215, 9, ["Oferta"], 11],
  ["Câmera Focus Mirrorless X1", "Focus", "Câmeras", 3499.9, 12, 4.8, 187, 5, ["Oferta"], 13],
  ["Câmera Focus Alpha 4K", "Focus", "Câmeras", 4299.9, 0, 4.7, 143, 8, [], 21],
  ["Câmera Focus Compact Pro", "Focus", "Câmeras", 1599.9, 0, 4.2, 266, 15, ["Novo"], 22],
  ["Câmera de Ação Pulse Hero 5K", "Pulse", "Câmeras", 1199.9, 0, 4.4, 321, 0, [], 25],
  [
    "Controle Playbox DualSense",
    "Playbox",
    "Games",
    399.9,
    20,
    4.8,
    1432,
    35,
    ["Mais vendido", "Oferta"],
    7,
  ],
  ["Controle Playbox Wireless", "Playbox", "Games", 249.9, 0, 4.5, 876, 22, [], 10],
  ["Headset Playbox Gamer 7.1", "Playbox", "Games", 449.9, 0, 4.4, 358, 13, ["Novo"], 19],
  ["Console Playbox Mini 1TB", "Playbox", "Games", 3799.9, 0, 4.9, 233, 4, ["Novo"], 26],
  [
    "Carregador Voltix GaN 65W",
    "Voltix",
    "Acessórios",
    189.9,
    0,
    4.7,
    1520,
    60,
    ["Mais vendido"],
    8,
  ],
  ["Cabo Connect USB-C 2m Trançado", "Connect", "Acessórios", 59.9, 0, 4.5, 2210, 120, [], 17],
  ["Power Bank Voltix 20.000 mAh", "Voltix", "Acessórios", 229.9, 15, 4.6, 689, 28, ["Oferta"], 23],
  ["Hub Orbit USB-C 8 em 1", "Orbit", "Acessórios", 279.9, 0, 4.3, 174, 17, ["Novo"], 27],
  [
    "Smartwatch Pulse Series 9",
    "Pulse",
    "Smartwatches",
    999.9,
    15,
    4.8,
    934,
    20,
    ["Mais vendido", "Oferta"],
    29,
  ],
  ["Smartwatch Pulse Fit", "Pulse", "Smartwatches", 399.9, 0, 4.2, 512, 31, [], 30],
  ["Smartwatch Pulse Ultra", "Pulse", "Smartwatches", 1799.9, 0, 4.9, 167, 7, ["Novo"], 31],
  ["Smartwatch Nexora Active", "Nexora", "Smartwatches", 649.9, 10, 4.4, 276, 16, [], 32],
];

export const products: Product[] = rows.map(
  ([name, brand, category, price, discount, rating, reviews, stock, tags, sales], i) => ({
    id: i + 1,
    name,
    brand,
    category,
    price,
    originalPrice: discount ? Math.round((price / (1 - discount / 100)) * 100) / 100 : undefined,
    discount,
    rating,
    reviews,
    stock,
    shortDescription: `${name}: design premium e desempenho que acompanha o seu ritmo.`,
    description: `O ${name} da ${brand} une tecnologia de ponta a uma experiência intuitiva. Acabamento de alta qualidade, excelente desempenho e conectividade completa para transformar o seu dia a dia.\n\nProduto novo, lacrado, com nota fiscal e 12 meses de garantia. Acompanha todos os itens necessários para começar a usar imediatamente.`,
    specs: [
      { key: "Marca", value: brand },
      { key: "Modelo", value: name.replace(brand, "").trim() },
      ...specsByCategory[category].map(([key, value]) => ({ key, value })),
      { key: "Garantia", value: "12 meses" },
    ],
    images: [0, 1, 2].map((v) => placeholder(name, category, v)),
    tags,
    sales,
  }),
);

export const productById = (id: number) => products.find((p) => p.id === id);

const reviewAuthors = [
  "Mariana S.",
  "Carlos E.",
  "Fernanda L.",
  "Rafael P.",
  "Juliana M.",
  "Bruno A.",
  "Camila R.",
  "Diego T.",
];
const reviewTexts = [
  "Excelente custo-benefício, superou minhas expectativas. Chegou antes do prazo.",
  "Qualidade de construção muito boa. Recomendo para quem busca desempenho.",
  "Muito bom, porém a embalagem poderia ser melhor. O produto em si é ótimo.",
  "Uso todos os dias e não tenho do que reclamar. Compraria novamente.",
  "Atendeu bem ao que eu precisava. Entrega rápida e produto original.",
  "Ótimo produto! Acabamento premium e funcionamento perfeito.",
];
export function reviewsFor(product: Product): Review[] {
  return Array.from({ length: 5 }, (_, i) => {
    const seed = product.id * 7 + i * 3;
    const rating = Math.max(3, Math.min(5, Math.round(product.rating) - (i === 2 ? 1 : 0)));
    return {
      id: `${product.id}-${i}`,
      author: reviewAuthors[seed % reviewAuthors.length] ?? "Cliente",
      rating,
      date: `2026-${String(10 - (i % 4)).padStart(2, "0")}-${String(3 + ((seed * 3) % 24)).padStart(2, "0")}`,
      comment: reviewTexts[seed % reviewTexts.length] ?? "",
    };
  });
}

// ---------- Usuário, pedidos, cupons ----------

export type Address = {
  id: string;
  label: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
  main: boolean;
};

export type SavedCard = {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  holder: string;
};

export type User = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  avatar: string;
  createdAt: string;
};

export const orderStatuses = [
  "Aguardando pagamento",
  "Em separação",
  "Enviado",
  "Entregue",
  "Cancelado",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export type OrderItem = { productId: number; quantity: number; price: number };
export type Order = {
  number: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment: string;
  tracking?: string | undefined;
  address: Address;
};

export function avatarFor(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#0f766e"/><text x="100" y="125" font-size="80" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const initialUser: User = {
  name: "João Pedro Nogueira",
  email: "joao.nogueira@example.com",
  phone: "(11) 99999-1234",
  cpf: "***.456.789-**",
  birthDate: "1995-05-15",
  avatar: avatarFor("João Pedro Nogueira"),
  createdAt: "2025-03-12",
};

export const initialAddresses: Address[] = [
  {
    id: "a1",
    label: "Casa",
    cep: "01310-100",
    street: "Avenida Paulista",
    number: "1000",
    complement: "Apto 42",
    district: "Bela Vista",
    city: "São Paulo",
    uf: "SP",
    main: true,
  },
  {
    id: "a2",
    label: "Trabalho",
    cep: "04538-132",
    street: "Avenida Brigadeiro Faria Lima",
    number: "2000",
    complement: "Sala 501",
    district: "Itaim Bibi",
    city: "São Paulo",
    uf: "SP",
    main: false,
  },
];

export const initialCards: SavedCard[] = [
  { id: "c1", last4: "4242", brand: "Visa", expiry: "12/29", holder: "JOAO P NOGUEIRA" },
  { id: "c2", last4: "5678", brand: "Mastercard", expiry: "08/28", holder: "JOAO P NOGUEIRA" },
];

export const initialFavorites = [1, 9, 21];

const mkOrder = (
  n: number,
  date: string,
  status: OrderStatus,
  items: [number, number][],
  shipping: number,
  payment: string,
  tracking?: string,
): Order => {
  const its = items.map(([productId, quantity]) => ({
    productId,
    quantity,
    price: productById(productId)!.price,
  }));
  const subtotal = its.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    number: `CS-2026-${n}`,
    date,
    status,
    items: its,
    subtotal,
    shipping,
    discount: 0,
    total: subtotal + shipping,
    payment,
    tracking,
    address: initialAddresses[0]!,
  };
};

export const initialOrders: Order[] = [
  mkOrder(
    1052,
    "2026-11-22T14:20:00",
    "Aguardando pagamento",
    [
      [11, 1],
      [25, 2],
    ],
    0,
    "Pix",
  ),
  mkOrder(1047, "2026-11-18T10:05:00", "Em separação", [[9, 1]], 0, "Cartão Visa final 4242"),
  mkOrder(
    1039,
    "2026-11-12T16:40:00",
    "Enviado",
    [[13, 1]],
    0,
    "Cartão Mastercard final 5678",
    "BR123456789SP",
  ),
  mkOrder(
    1021,
    "2026-10-28T09:15:00",
    "Entregue",
    [
      [29, 1],
      [26, 1],
    ],
    0,
    "Boleto",
  ),
  mkOrder(1008, "2026-10-05T19:30:00", "Cancelado", [[2, 1]], 24.9, "Pix"),
];

export const COUPONS = {
  BEMVINDO10: { label: "10% de desconto", percent: 10, freeShipping: false },
  FRETEGRATIS: { label: "Frete grátis", percent: 0, freeShipping: true },
} as const;
export type CouponCode = keyof typeof COUPONS;

export function findCoupon(code: string): CouponCode | null {
  const c = code.trim().toUpperCase();
  return c in COUPONS ? (c as CouponCode) : null;
}

export const FREE_SHIPPING_FROM = 299;

export type ShippingOption = {
  id: "normal" | "express";
  name: string;
  days: string;
  price: number;
};

export function shippingOptions(cep: string): ShippingOption[] {
  const first = Number(digits(cep)[0] ?? 0);
  return [
    {
      id: "normal",
      name: "Normal",
      days: `${5 + (first % 3)} a ${8 + (first % 3)} dias úteis`,
      price: Math.round((14.9 + first * 1.5) * 100) / 100,
    },
    {
      id: "express",
      name: "Expresso",
      days: `${1 + (first % 2)} a ${3 + (first % 2)} dias úteis`,
      price: Math.round((29.9 + first * 2) * 100) / 100,
    },
  ];
}

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number | null;
  freeShipping: boolean;
  total: number;
};

/** Frete grátis: cupom FRETEGRATIS (qualquer opção) ou subtotal ≥ R$ 299 (opção Normal). */
export function computeTotals(
  subtotal: number,
  coupon: CouponCode | null,
  option?: ShippingOption,
): Totals {
  const c = coupon ? COUPONS[coupon] : null;
  const discount = c ? Math.round(subtotal * c.percent) / 100 : 0;
  const free =
    subtotal > 0 &&
    (Boolean(c?.freeShipping) || (subtotal >= FREE_SHIPPING_FROM && option?.id !== "express"));
  const shipping = subtotal === 0 ? 0 : free ? 0 : option ? option.price : null;
  return {
    subtotal,
    discount,
    shipping,
    freeShipping: free,
    total: subtotal - discount + (shipping ?? 0),
  };
}

export const testimonials = [
  {
    name: "Ana Beatriz",
    rating: 5,
    text: "Entrega muito rápida e o notebook veio perfeito. O atendimento da CShop foi impecável do início ao fim!",
  },
  {
    name: "Marcos Vinícius",
    rating: 5,
    text: "Melhor preço que encontrei em fones. Comprei com Pix, o desconto compensou e chegou em 2 dias.",
  },
  {
    name: "Luciana Prado",
    rating: 4,
    text: "Site fácil de usar, ótimas ofertas e troca sem burocracia. Já indiquei para toda a família.",
  },
];
