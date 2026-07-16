"use client";

import Link from "next/link";
import { AlarmClock, FileText, MessageCircle } from "lucide-react";
import {
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_STYLE,
  daysSince,
  formatEUR,
  needsFollowUp,
  quoteTotal,
  waLink,
} from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";

export default function OrcamentosPage() {
  const { ready, demo, data } = useDemo();

  if (!ready) return null;

  if (!demo || !data) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <h1 className="text-2xl font-bold text-zinc-900">Orçamentos</h1>
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <FileText className="h-10 w-10 text-blue-700" />
          </span>
          <p className="text-lg text-zinc-700">
            Os seus orçamentos vão aparecer aqui.
            <br />
            Crie o primeiro a partir de um pedido.
          </p>
        </div>
      </div>
    );
  }

  const quotes = [...data.quotes].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const followUps = quotes.filter(needsFollowUp);

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-bold text-zinc-900">Orçamentos</h1>

      {followUps.length > 0 && (
        <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-amber-900">
            <AlarmClock className="h-5 w-5" />
            Sem resposta — vale a pena relembrar
          </h2>
          <ul className="mt-2 flex flex-col gap-3">
            {followUps.map((q) => {
              const client = data.clients.find((c) => c.id === q.clientId);
              return (
                <li key={q.id} className="rounded-xl bg-white p-3 shadow-sm">
                  <Link href={`/orcamentos/${q.id}`} className="block">
                    <span className="font-semibold text-zinc-900">
                      {q.clientName}
                    </span>
                    <span className="block text-sm font-medium text-zinc-600">
                      {q.reference} · {formatEUR(quoteTotal(q))} · enviado há{" "}
                      {daysSince(q.sentAt!)} dias
                    </span>
                  </Link>
                  {client && (
                    <a
                      href={waLink(
                        client.phone,
                        `Bom dia! Enviei-lhe o orçamento ${q.reference} há uns dias — ficou com alguma dúvida? Diga-me algo, para eu poder reservar-lhe a data. Obrigado!`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 p-2.5 font-semibold text-white active:bg-emerald-700"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Relembrar no WhatsApp
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ul className="mt-4 flex flex-col gap-2.5">
        {quotes.map((q) => (
          <li key={q.id}>
            <Link
              href={`/orcamentos/${q.id}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm active:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-zinc-900">
                  {q.clientName}
                </span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${QUOTE_STATUS_STYLE[q.status]}`}
                >
                  {QUOTE_STATUS_LABEL[q.status]}
                </span>
              </div>
              <div className="mt-1 flex gap-3 text-sm">
                <span className="font-medium text-zinc-600">{q.reference}</span>
                <span className="font-bold text-zinc-900">
                  {formatEUR(quoteTotal(q))}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
