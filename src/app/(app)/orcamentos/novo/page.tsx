"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, Minus, Plus, Sparkles } from "lucide-react";
import {
  ITEM_KIND_LABEL,
  PRESET_ITEMS,
  type DemoQuoteItem,
  type ItemKind,
  type PresetItem,
  formatEUR,
} from "@/lib/demo/data";
import { newId } from "@/lib/demo/store";
import { useAppData } from "@/lib/app-data";

// Sugestão de itens a partir do texto do pedido. Na versão real será a IA
// (Claude) a estruturar o orçamento; aqui usamos palavras-chave para
// demonstrar o fluxo.
function suggestItems(text: string): DemoQuoteItem[] {
  const lower = text.toLowerCase();
  const picked = new Map<string, DemoQuoteItem>();

  for (const preset of PRESET_ITEMS) {
    for (const keyword of preset.keywords) {
      const idx = lower.indexOf(keyword);
      if (idx === -1) continue;
      // Procura uma quantidade perto da palavra-chave (ex.: "3 janelas", "24 metros").
      const before = lower.slice(Math.max(0, idx - 20), idx);
      const numMatch = before.match(/(\d+(?:[.,]\d+)?)\s*(?:m2|m²|ml|metros?)?\s*$/);
      const quantity = numMatch ? parseFloat(numMatch[1].replace(",", ".")) : 1;
      if (!picked.has(preset.description)) {
        picked.set(preset.description, {
          id: newId(),
          kind: preset.kind,
          description: preset.description,
          quantity,
          unit: preset.unit,
          unitPrice: preset.price,
        });
      }
      break;
    }
  }

  if (picked.size > 0) {
    picked.set("Deslocação", {
      id: newId(),
      kind: "mao_de_obra",
      description: "Deslocação",
      quantity: 1,
      unit: "un",
      unitPrice: 20,
    });
  }

  return [...picked.values()];
}

function NovoOrcamento() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("pedido") ?? undefined;
  const { ready, data, createQuote } = useAppData();

  const [items, setItems] = useState<DemoQuoteItem[]>([]);
  const [editedDescription, setEditedDescription] = useState<string | null>(
    null
  );
  const [suggested, setSuggested] = useState(false);
  const [saving, setSaving] = useState(false);

  const request = data?.requests.find((r) => r.id === requestId);
  // Pré-preenche com a descrição do pedido até o utilizador editar.
  const description = editedDescription ?? request?.description ?? "";

  if (!ready) return null;

  if (!data) return null;

  function addPreset(preset: PresetItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.description === preset.description);
      if (existing) {
        return prev.map((i) =>
          i.description === preset.description
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          id: newId(),
          kind: preset.kind,
          description: preset.description,
          quantity: 1,
          unit: preset.unit,
          unitPrice: preset.price,
        },
      ];
    });
  }

  function changeQuantity(id: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function handleSuggest() {
    const result = suggestItems(description);
    if (result.length > 0) setItems(result);
    setSuggested(true);
  }

  async function handleSave() {
    setSaving(true);
    const id = await createQuote({
      requestId,
      clientId: request?.clientId,
      clientName: request?.clientName ?? "Cliente",
      items,
    });
    setSaving(false);
    if (id) router.push(`/orcamentos/${id}`);
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const kinds: ItemKind[] = ["mao_de_obra", "material", "outro"];

  return (
    <div className="mx-auto max-w-lg p-4 pb-40">
      <Link
        href={request ? `/pedidos/${request.id}` : "/orcamentos"}
        className="flex items-center gap-1 font-medium text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900">Novo orçamento</h1>
      {request && (
        <p className="font-medium text-zinc-600">Para: {request.clientName}</p>
      )}

      <section className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-blue-900">
          <Sparkles className="h-5 w-5" />
          Descreva o trabalho e a app sugere os itens
        </h2>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Ex.: substituir 3 janelas e colocar 24 ml de rodapé"
          className="mt-2 w-full rounded-xl border border-blue-200 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-600"
        />
        <button
          type="button"
          onClick={handleSuggest}
          className="mt-2 w-full rounded-xl bg-blue-600 p-3 font-semibold text-white shadow-sm active:bg-blue-700"
        >
          Sugerir itens
        </button>
        {suggested && items.length === 0 && (
          <p className="mt-2 text-sm font-medium text-blue-900">
            Não reconheci nenhum item — adicione manualmente em baixo.
          </p>
        )}
      </section>

      {items.length > 0 && (
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            No orçamento
          </h2>
          <ul className="mt-2 flex flex-col gap-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-900">{i.description}</p>
                  <p className="text-sm font-medium text-zinc-600">
                    {i.quantity} {i.unit} × {formatEUR(i.unitPrice)} ={" "}
                    {formatEUR(i.quantity * i.unitPrice)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeQuantity(i.id, -1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 active:bg-zinc-100"
                  >
                    <Minus className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                  <span className="w-8 text-center font-bold text-zinc-900">
                    {i.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(i.id, 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 active:bg-zinc-100"
                  >
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {kinds.map((kind) => {
        const presets = PRESET_ITEMS.filter((p) => p.kind === kind);
        if (presets.length === 0) return null;
        return (
          <section key={kind} className="mt-4">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
              {ITEM_KIND_LABEL[kind]}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.description}
                  type="button"
                  onClick={() => addPreset(p)}
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm active:bg-zinc-100"
                >
                  + {p.description}
                </button>
              ))}
            </div>
          </section>
        );
      })}

      <div className="fixed inset-x-0 bottom-24 border-t border-zinc-200 bg-white p-4">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-600">Subtotal (s/ IVA)</p>
            <p className="text-xl font-bold text-zinc-900">{formatEUR(subtotal)}</p>
          </div>
          <button
            type="button"
            disabled={items.length === 0 || saving}
            onClick={handleSave}
            className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm active:bg-blue-700 disabled:opacity-40"
          >
            {saving ? "A guardar…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NovoOrcamentoPage() {
  return (
    <Suspense fallback={null}>
      <NovoOrcamento />
    </Suspense>
  );
}
