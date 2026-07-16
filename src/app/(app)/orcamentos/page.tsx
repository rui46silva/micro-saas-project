"use client";

import Link from "next/link";
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
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="text-5xl" aria-hidden>
            📄
          </span>
          <p className="text-lg text-zinc-600">
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
      <h1 className="text-2xl font-bold">Orçamentos</h1>

      {followUps.length > 0 && (
        <section className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <h2 className="font-semibold text-amber-900">
            ⏰ Sem resposta — vale a pena relembrar
          </h2>
          <ul className="mt-2 flex flex-col gap-3">
            {followUps.map((q) => {
              const client = data.clients.find((c) => c.id === q.clientId);
              return (
                <li key={q.id} className="rounded-lg bg-white p-3">
                  <Link href={`/orcamentos/${q.id}`} className="block">
                    <span className="font-medium">{q.clientName}</span>
                    <span className="block text-sm text-zinc-500">
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
                      className="mt-2 block rounded-lg bg-green-600 p-2 text-center font-medium text-white active:bg-green-700"
                    >
                      💬 Relembrar no WhatsApp
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ul className="mt-4 flex flex-col gap-3">
        {quotes.map((q) => (
          <li key={q.id}>
            <Link
              href={`/orcamentos/${q.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 active:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold">{q.clientName}</span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${QUOTE_STATUS_STYLE[q.status]}`}
                >
                  {QUOTE_STATUS_LABEL[q.status]}
                </span>
              </div>
              <div className="mt-1 flex gap-3 text-sm text-zinc-500">
                <span>{q.reference}</span>
                <span className="font-medium text-zinc-800">
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
