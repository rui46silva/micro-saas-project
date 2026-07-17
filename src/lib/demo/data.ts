// Dados fictícios do modo demonstração: uma carpintaria com pedidos,
// orçamentos e clientes em vários estados, para mostrar o MVP em ação.

export type RequestStatus =
  | "novo"
  | "orcamentado"
  | "aceite"
  | "em_curso"
  | "concluido";

export type QuoteStatus = "rascunho" | "enviado" | "aceite" | "recusado";

export type ItemKind = "mao_de_obra" | "material" | "outro";

export type AccountStatus = "ativa" | "pausada";

export interface Profile {
  id?: string;
  email?: string;
  fullName?: string;
  businessName?: string;
  phone?: string;
  trade: string;
  address?: string;
  nif?: string;
  isAdmin: boolean;
  accountStatus: AccountStatus;
  pausedReason?: string;
}

export interface DemoClient {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export interface DemoRequest {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  description: string;
  status: RequestStatus;
  photoCount: number;
  createdAt: string;
  rating?: number;
}

export interface DemoQuoteItem {
  id: string;
  kind: ItemKind;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface DemoQuote {
  id: string;
  requestId?: string;
  clientId?: string;
  clientName: string;
  reference: string;
  status: QuoteStatus;
  sentAt?: string;
  paidAt?: string;
  items: DemoQuoteItem[];
  createdAt: string;
}

export interface DemoData {
  profile: Profile;
  clients: DemoClient[];
  requests: DemoRequest[];
  quotes: DemoQuote[];
}

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  novo: "Novo",
  orcamentado: "Orçamentado",
  aceite: "Aceite",
  em_curso: "Em curso",
  concluido: "Concluído",
};

export const REQUEST_STATUS_STYLE: Record<RequestStatus, string> = {
  novo: "bg-blue-100 text-blue-800",
  orcamentado: "bg-amber-100 text-amber-800",
  aceite: "bg-green-100 text-green-800",
  em_curso: "bg-purple-100 text-purple-800",
  concluido: "bg-zinc-200 text-zinc-600",
};

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aceite: "Aceite",
  recusado: "Recusado",
};

export const QUOTE_STATUS_STYLE: Record<QuoteStatus, string> = {
  rascunho: "bg-zinc-200 text-zinc-700",
  enviado: "bg-amber-100 text-amber-800",
  aceite: "bg-green-100 text-green-800",
  recusado: "bg-red-100 text-red-700",
};

export const ITEM_KIND_LABEL: Record<ItemKind, string> = {
  mao_de_obra: "Mão de obra",
  material: "Materiais",
  outro: "Outro",
};

export interface PresetItem {
  kind: ItemKind;
  description: string;
  unit: string;
  price: number;
  keywords: string[];
}

// Espelha os preset_items de carpintaria da base de dados.
export const PRESET_ITEMS: PresetItem[] = [
  { kind: "mao_de_obra", description: "Instalação de porta interior", unit: "un", price: 60, keywords: ["porta interior", "porta"] },
  { kind: "mao_de_obra", description: "Instalação de porta exterior/blindada", unit: "un", price: 120, keywords: ["porta exterior", "blindada", "porta da rua", "porta de entrada"] },
  { kind: "mao_de_obra", description: "Substituição de janela", unit: "un", price: 90, keywords: ["janela"] },
  { kind: "mao_de_obra", description: "Colocação de rodapé", unit: "ml", price: 6, keywords: ["rodapé", "rodape"] },
  { kind: "mao_de_obra", description: "Colocação de pavimento flutuante", unit: "m²", price: 12, keywords: ["pavimento", "flutuante", "chão", "chao", "soalho"] },
  { kind: "mao_de_obra", description: "Montagem de móvel de cozinha", unit: "un", price: 80, keywords: ["cozinha", "móvel", "movel"] },
  { kind: "mao_de_obra", description: "Montagem de roupeiro", unit: "un", price: 150, keywords: ["roupeiro", "armário", "armario"] },
  { kind: "mao_de_obra", description: "Afinação de porta/janela", unit: "un", price: 30, keywords: ["afinar", "afinação", "empena", "empenada"] },
  { kind: "mao_de_obra", description: "Deslocação", unit: "un", price: 20, keywords: [] },
  { kind: "material", description: "Porta interior (folha)", unit: "un", price: 85, keywords: ["porta interior", "porta"] },
  { kind: "material", description: "Aro e guarnições", unit: "un", price: 45, keywords: ["porta"] },
  { kind: "material", description: "Rodapé MDF", unit: "ml", price: 4, keywords: ["rodapé", "rodape"] },
  { kind: "material", description: "Pavimento flutuante AC4", unit: "m²", price: 15, keywords: ["pavimento", "flutuante", "chão", "chao", "soalho"] },
  { kind: "material", description: "Dobradiças e ferragens", unit: "un", price: 12, keywords: ["dobradiça", "fechadura"] },
  { kind: "material", description: "Puxadores", unit: "un", price: 15, keywords: ["puxador"] },
  { kind: "material", description: "Silicone/espuma/consumíveis", unit: "un", price: 10, keywords: ["janela"] },
];

// ---------- Helpers ----------

export function quoteTotal(quote: DemoQuote): number {
  return quote.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}

export function formatEUR(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function formatRelative(iso: string): string {
  const days = daysSince(iso);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT");
}

// Orçamentos enviados há mais de 5 dias sem resposta precisam de follow-up.
export const FOLLOW_UP_DAYS = 5;

export function needsFollowUp(quote: DemoQuote): boolean {
  return (
    quote.status === "enviado" &&
    !!quote.sentAt &&
    daysSince(quote.sentAt) >= FOLLOW_UP_DAYS
  );
}

export function waLink(phone: string | undefined, text: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const full = digits.length === 9 ? `351${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

// ---------- Dataset de exemplo ----------

export function seedData(): DemoData {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

  const profile: Profile = {
    email: "demo@apontado.pt",
    fullName: "João Silva",
    businessName: "Carpintaria Exemplo",
    phone: "910 000 000",
    trade: "carpintaria",
    address: "Rua da Oficina 8, Braga",
    nif: "123 456 789",
    isAdmin: false,
    accountStatus: "ativa",
  };

  const clients: DemoClient[] = [
    {
      id: "c1",
      name: "Maria Santos",
      phone: "912 345 671",
      address: "Rua das Flores 12, Braga",
      notes: "Prefere ser contactada depois das 18h.",
      createdAt: daysAgo(60),
    },
    {
      id: "c2",
      name: "António Ferreira",
      phone: "917 654 322",
      address: "Av. da Liberdade 45, 2.º Esq, Guimarães",
      createdAt: daysAgo(145),
    },
    {
      id: "c3",
      name: "Café Central (D. Fernanda)",
      phone: "925 111 333",
      address: "Praça do Comércio 3, Braga",
      notes: "Obras só à segunda-feira (dia de descanso do café).",
      createdAt: daysAgo(150),
    },
    {
      id: "c4",
      name: "Joana Melo",
      phone: "934 222 444",
      address: "Quinta do Souto, lote 7, Vila Verde",
      createdAt: daysAgo(10),
    },
  ];

  const requests: DemoRequest[] = [
    {
      id: "r1",
      clientId: "c1",
      clientName: "Maria Santos",
      clientPhone: "912 345 671",
      description:
        "Substituir 3 janelas de alumínio no rés-do-chão e colocar rodapé novo em 2 quartos (cerca de 24 metros).",
      status: "novo",
      photoCount: 3,
      createdAt: daysAgo(0),
    },
    {
      id: "r2",
      clientId: "c2",
      clientName: "António Ferreira",
      clientPhone: "917 654 322",
      description:
        "Porta da rua está empenada e a fechadura prende. Afinar ou substituir, conforme o estado.",
      status: "novo",
      photoCount: 2,
      createdAt: daysAgo(1),
    },
    {
      id: "r3",
      clientId: "c4",
      clientName: "Joana Melo",
      clientPhone: "934 222 444",
      description:
        "Pavimento flutuante em 2 quartos (28 m²) com rodapé incluído. Casa nova, quer começar em setembro.",
      status: "orcamentado",
      photoCount: 4,
      createdAt: daysAgo(8),
    },
    {
      id: "r4",
      clientId: "c3",
      clientName: "Café Central (D. Fernanda)",
      clientPhone: "925 111 333",
      description:
        "Balcão novo em madeira de carvalho com 3,5 m, incluindo prateleiras interiores e porta de correr.",
      status: "aceite",
      photoCount: 5,
      createdAt: daysAgo(15),
    },
    {
      id: "r5",
      clientId: "c1",
      clientName: "Maria Santos",
      clientPhone: "912 345 671",
      description:
        "Roupeiro embutido no corredor (2,4 m de largura, até ao teto) com portas de correr e espelho.",
      status: "em_curso",
      photoCount: 2,
      createdAt: daysAgo(20),
    },
    {
      id: "r6",
      clientId: "c2",
      clientName: "António Ferreira",
      clientPhone: "917 654 322",
      description: "Montagem de cozinha completa (móveis já comprados).",
      status: "concluido",
      photoCount: 6,
      createdAt: daysAgo(35),
      rating: 5,
    },
    {
      id: "r7",
      clientId: "c1",
      clientName: "Maria Santos",
      clientPhone: "912 345 671",
      description: "Substituição de porta interior e afinação dos armários da cozinha.",
      status: "concluido",
      photoCount: 2,
      createdAt: daysAgo(55),
      rating: 5,
    },
    {
      id: "r8",
      clientId: "c4",
      clientName: "Joana Melo",
      clientPhone: "934 222 444",
      description: "Estantes por medida na sala, em carvalho, do chão ao teto.",
      status: "concluido",
      photoCount: 4,
      createdAt: daysAgo(82),
      rating: 4,
    },
  ];

  const quotes: DemoQuote[] = [
    {
      id: "q1",
      requestId: "r3",
      clientId: "c4",
      clientName: "Joana Melo",
      reference: "2026-014",
      status: "enviado",
      sentAt: daysAgo(6),
      createdAt: daysAgo(7),
      items: [
        { id: "q1i1", kind: "mao_de_obra", description: "Colocação de pavimento flutuante", quantity: 28, unit: "m²", unitPrice: 12 },
        { id: "q1i2", kind: "mao_de_obra", description: "Colocação de rodapé", quantity: 26, unit: "ml", unitPrice: 6 },
        { id: "q1i3", kind: "material", description: "Pavimento flutuante AC4", quantity: 30, unit: "m²", unitPrice: 15 },
        { id: "q1i4", kind: "material", description: "Rodapé MDF", quantity: 26, unit: "ml", unitPrice: 4 },
        { id: "q1i5", kind: "mao_de_obra", description: "Deslocação", quantity: 1, unit: "un", unitPrice: 20 },
      ],
    },
    {
      id: "q2",
      requestId: "r4",
      clientId: "c3",
      clientName: "Café Central (D. Fernanda)",
      reference: "2026-013",
      status: "aceite",
      sentAt: daysAgo(12),
      paidAt: daysAgo(9),
      createdAt: daysAgo(14),
      items: [
        { id: "q2i1", kind: "mao_de_obra", description: "Balcão em carvalho 3,5 m (fabrico e instalação)", quantity: 1, unit: "un", unitPrice: 1450 },
        { id: "q2i2", kind: "material", description: "Madeira de carvalho e ferragens", quantity: 1, unit: "un", unitPrice: 680 },
        { id: "q2i3", kind: "mao_de_obra", description: "Deslocação", quantity: 2, unit: "un", unitPrice: 20 },
      ],
    },
    {
      id: "q3",
      requestId: "r2",
      clientId: "c2",
      clientName: "António Ferreira",
      reference: "2026-015",
      status: "rascunho",
      createdAt: daysAgo(0),
      items: [
        { id: "q3i1", kind: "mao_de_obra", description: "Afinação de porta/janela", quantity: 1, unit: "un", unitPrice: 30 },
        { id: "q3i2", kind: "material", description: "Dobradiças e ferragens", quantity: 1, unit: "un", unitPrice: 12 },
        { id: "q3i3", kind: "mao_de_obra", description: "Deslocação", quantity: 1, unit: "un", unitPrice: 20 },
      ],
    },
    {
      id: "q5",
      requestId: "r6",
      clientId: "c2",
      clientName: "António Ferreira",
      reference: "2026-012",
      status: "aceite",
      sentAt: daysAgo(40),
      paidAt: daysAgo(30),
      createdAt: daysAgo(42),
      items: [
        { id: "q5i1", kind: "mao_de_obra", description: "Montagem de cozinha completa", quantity: 1, unit: "un", unitPrice: 350 },
      ],
    },
    {
      id: "q6",
      requestId: "r7",
      clientId: "c1",
      clientName: "Maria Santos",
      reference: "2026-006",
      status: "aceite",
      sentAt: daysAgo(56),
      paidAt: daysAgo(50),
      createdAt: daysAgo(57),
      items: [
        { id: "q6i1", kind: "mao_de_obra", description: "Instalação de porta interior", quantity: 1, unit: "un", unitPrice: 60 },
        { id: "q6i2", kind: "material", description: "Porta interior (folha)", quantity: 1, unit: "un", unitPrice: 85 },
        { id: "q6i3", kind: "mao_de_obra", description: "Afinação de armários", quantity: 1, unit: "un", unitPrice: 45 },
      ],
    },
    {
      id: "q7",
      requestId: "r8",
      clientId: "c4",
      clientName: "Joana Melo",
      reference: "2026-005",
      status: "aceite",
      sentAt: daysAgo(84),
      paidAt: daysAgo(74),
      createdAt: daysAgo(85),
      items: [
        { id: "q7i1", kind: "mao_de_obra", description: "Estantes por medida (fabrico e montagem)", quantity: 1, unit: "un", unitPrice: 520 },
        { id: "q7i2", kind: "material", description: "Madeira de carvalho e ferragens", quantity: 1, unit: "un", unitPrice: 240 },
      ],
    },
    {
      id: "q8",
      clientId: "c3",
      clientName: "Café Central (D. Fernanda)",
      reference: "2026-002",
      status: "aceite",
      sentAt: daysAgo(140),
      paidAt: daysAgo(132),
      createdAt: daysAgo(141),
      items: [
        { id: "q8i1", kind: "mao_de_obra", description: "Reparação de portadas e balcão", quantity: 1, unit: "un", unitPrice: 380 },
        { id: "q8i2", kind: "material", description: "Madeira e ferragens", quantity: 1, unit: "un", unitPrice: 130 },
      ],
    },
    {
      id: "q4",
      clientId: "c4",
      clientName: "Joana Melo",
      reference: "2026-009",
      status: "recusado",
      sentAt: daysAgo(30),
      createdAt: daysAgo(32),
      items: [
        { id: "q4i1", kind: "mao_de_obra", description: "Instalação de porta exterior/blindada", quantity: 1, unit: "un", unitPrice: 120 },
        { id: "q4i2", kind: "material", description: "Porta blindada", quantity: 1, unit: "un", unitPrice: 890 },
      ],
    },
  ];

  return { profile, clients, requests, quotes };
}
