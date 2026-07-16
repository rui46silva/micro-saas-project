"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ITEM_KIND_LABEL,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_STYLE,
  type ItemKind,
  daysSince,
  formatEUR,
  needsFollowUp,
  quoteTotal,
  waLink,
} from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";

const IVA = 0.23;

export default function OrcamentoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, demo, data, update } = useDemo();

  if (!ready) return null;

  const quote = data?.quotes.find((q) => q.id === id);

  if (!demo || !quote) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Link href="/orcamentos" className="text-blue-700">
          ← Orçamentos
        </Link>
        <p className="mt-8 text-center text-zinc-500">
          Orçamento não encontrado.
        </p>
      </div>
    );
  }

  const client = data!.clients.find((c) => c.id === quote.clientId);
  const subtotal = quoteTotal(quote);
  const total = subtotal * (1 + IVA);
  const kinds: ItemKind[] = ["mao_de_obra", "material", "outro"];

  function setStatus(status: "enviado" | "aceite" | "recusado") {
    update((d) => {
      const q = d.quotes.find((x) => x.id === quote!.id);
      if (!q) return d;
      q.status = status;
      if (status === "enviado") q.sentAt = new Date().toISOString();
      const r = d.requests.find((x) => x.id === q.requestId);
      if (r) {
        if (status === "enviado") r.status = "orcamentado";
        if (status === "aceite") r.status = "aceite";
      }
      return d;
    });
  }

  const sendMessage = `Bom dia! Segue o orçamento ${quote.reference}: total ${formatEUR(total)} (IVA incluído). Qualquer dúvida, diga. Obrigado!`;

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link href="/orcamentos" className="text-blue-700">
        ← Orçamentos
      </Link>

      <div className="mt-2 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{quote.reference}</h1>
          <p className="text-zinc-500">{quote.clientName}</p>
        </div>
        <span
          className={`mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${QUOTE_STATUS_STYLE[quote.status]}`}
        >
          {QUOTE_STATUS_LABEL[quote.status]}
        </span>
      </div>

      {needsFollowUp(quote) && client && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">
            ⏰ Enviado há {daysSince(quote.sentAt!)} dias sem resposta.
          </p>
          <a
            href={waLink(
              client.phone,
              `Bom dia! Enviei-lhe o orçamento ${quote.reference} há uns dias — ficou com alguma dúvida? Obrigado!`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-lg bg-green-600 p-2 text-center font-medium text-white active:bg-green-700"
          >
            💬 Relembrar no WhatsApp
          </a>
        </div>
      )}

      {kinds.map((kind) => {
        const items = quote.items.filter((i) => i.kind === kind);
        if (items.length === 0) return null;
        return (
          <section
            key={kind}
            className="mt-4 rounded-xl border border-zinc-200 bg-white p-4"
          >
            <h2 className="text-sm font-semibold text-zinc-500">
              {ITEM_KIND_LABEL[kind].toUpperCase()}
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-2 text-sm">
                  <span>
                    {i.description}
                    <span className="text-zinc-400">
                      {" "}
                      · {i.quantity} {i.unit} × {formatEUR(i.unitPrice)}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatEUR(i.quantity * i.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex justify-between text-sm text-zinc-600">
          <span>Subtotal</span>
          <span>{formatEUR(subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-zinc-600">
          <span>IVA (23%)</span>
          <span>{formatEUR(subtotal * IVA)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 text-lg font-bold">
          <span>Total</span>
          <span>{formatEUR(total)}</span>
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-2">
        {quote.status === "rascunho" && client && (
          <a
            href={waLink(client.phone, sendMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setStatus("enviado")}
            className="rounded-xl bg-green-600 p-4 text-center text-lg font-semibold text-white active:bg-green-700"
          >
            💬 Enviar por WhatsApp
          </a>
        )}
        {quote.status === "enviado" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus("aceite")}
              className="flex-1 rounded-xl bg-green-600 p-4 font-semibold text-white active:bg-green-700"
            >
              ✅ Aceite
            </button>
            <button
              type="button"
              onClick={() => setStatus("recusado")}
              className="flex-1 rounded-xl border border-red-300 bg-white p-4 font-semibold text-red-600 active:bg-red-50"
            >
              Recusado
            </button>
          </div>
        )}
        <Link
          href={`/orcamentos/${quote.id}/pdf`}
          className="rounded-xl border border-zinc-300 bg-white p-4 text-center text-lg font-semibold text-zinc-700 active:bg-zinc-50"
        >
          📄 Ver PDF
        </Link>
      </div>
    </div>
  );
}
