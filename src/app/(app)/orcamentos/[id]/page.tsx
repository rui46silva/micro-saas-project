"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlarmClock,
  ArrowLeft,
  BadgeEuro,
  Check,
  FileText,
  MessageCircle,
  X,
} from "lucide-react";
import {
  ITEM_KIND_LABEL,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_STYLE,
  type ItemKind,
  daysSince,
  formatDate,
  formatEUR,
  needsFollowUp,
  quoteTotal,
  waLink,
} from "@/lib/demo/data";
import { useAppData } from "@/lib/app-data";

const IVA = 0.23;

export default function OrcamentoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, data, setQuoteStatus, markQuotePaid } = useAppData();

  if (!ready) return null;

  const quote = data?.quotes.find((q) => q.id === id);

  if (!quote) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Link
          href="/orcamentos"
          className="flex items-center gap-1 font-medium text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Orçamentos
        </Link>
        <p className="mt-8 text-center text-zinc-600">
          Orçamento não encontrado.
        </p>
      </div>
    );
  }

  const client = data!.clients.find((c) => c.id === quote.clientId);
  const request = data!.requests.find((r) => r.id === quote.requestId);
  const phone = client?.phone || request?.clientPhone;
  const subtotal = quoteTotal(quote);
  const total = subtotal * (1 + IVA);
  const kinds: ItemKind[] = ["mao_de_obra", "material", "outro"];

  const sendMessage = `Bom dia! Segue o orçamento ${quote.reference}: total ${formatEUR(total)} (IVA incluído). Qualquer dúvida, diga. Obrigado!`;

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link
        href="/orcamentos"
        className="flex items-center gap-1 font-medium text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Orçamentos
      </Link>

      <div className="mt-2 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {quote.reference}
          </h1>
          <p className="font-medium text-zinc-600">{quote.clientName}</p>
        </div>
        <span className="mt-1 flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${QUOTE_STATUS_STYLE[quote.status]}`}
          >
            {QUOTE_STATUS_LABEL[quote.status]}
          </span>
          {quote.paidAt && (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
              Pago
            </span>
          )}
        </span>
      </div>

      {needsFollowUp(quote) && phone && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="flex items-center gap-2 font-bold text-amber-900">
            <AlarmClock className="h-5 w-5" />
            Enviado há {daysSince(quote.sentAt!)} dias sem resposta.
          </p>
          <a
            href={waLink(
              phone,
              `Bom dia! Enviei-lhe o orçamento ${quote.reference} há uns dias — ficou com alguma dúvida? Obrigado!`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 p-2.5 font-semibold text-white active:bg-emerald-700"
          >
            <MessageCircle className="h-5 w-5" />
            Relembrar no WhatsApp
          </a>
        </div>
      )}

      {kinds.map((kind) => {
        const items = quote.items.filter((i) => i.kind === kind);
        if (items.length === 0) return null;
        return (
          <section
            key={kind}
            className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              {ITEM_KIND_LABEL[kind]}
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-2 text-sm">
                  <span className="text-zinc-800">
                    {i.description}
                    <span className="font-medium text-zinc-500">
                      {" "}
                      · {i.quantity} {i.unit} × {formatEUR(i.unitPrice)}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-zinc-900">
                    {formatEUR(i.quantity * i.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex justify-between text-sm font-medium text-zinc-600">
          <span>Subtotal</span>
          <span>{formatEUR(subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm font-medium text-zinc-600">
          <span>IVA (23%)</span>
          <span>{formatEUR(subtotal * IVA)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 text-lg font-bold text-zinc-900">
          <span>Total</span>
          <span>{formatEUR(total)}</span>
        </div>
        {quote.paidAt && (
          <p className="mt-2 text-sm font-medium text-emerald-700">
            Recebido a {formatDate(quote.paidAt)}
          </p>
        )}
      </section>

      <div className="mt-4 flex flex-col gap-2">
        {quote.status === "rascunho" && phone && (
          <a
            href={waLink(phone, sendMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setQuoteStatus(quote.id, "enviado")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-4 text-lg font-semibold text-white shadow-sm active:bg-emerald-700"
          >
            <MessageCircle className="h-5 w-5" />
            Enviar por WhatsApp
          </a>
        )}
        {quote.status === "enviado" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuoteStatus(quote.id, "aceite")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-4 font-semibold text-white shadow-sm active:bg-emerald-700"
            >
              <Check className="h-5 w-5" strokeWidth={2.5} />
              Aceite
            </button>
            <button
              type="button"
              onClick={() => setQuoteStatus(quote.id, "recusado")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-300 bg-white p-4 font-semibold text-red-700 shadow-sm active:bg-red-50"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
              Recusado
            </button>
          </div>
        )}
        {quote.status === "aceite" && !quote.paidAt && (
          <button
            type="button"
            onClick={() => markQuotePaid(quote.id)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-4 text-lg font-semibold text-white shadow-sm active:bg-emerald-700"
          >
            <BadgeEuro className="h-5 w-5" />
            Marcar como recebido
          </button>
        )}
        <Link
          href={`/orcamentos/${quote.id}/pdf`}
          className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white p-4 text-lg font-semibold text-zinc-800 shadow-sm active:bg-zinc-50"
        >
          <FileText className="h-5 w-5" />
          Ver PDF
        </Link>
      </div>
    </div>
  );
}
