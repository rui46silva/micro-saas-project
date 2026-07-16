"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone, StickyNote } from "lucide-react";
import {
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_STYLE,
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_STYLE,
  formatEUR,
  formatRelative,
  quoteTotal,
  waLink,
} from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, demo, data } = useDemo();

  if (!ready) return null;

  const client = data?.clients.find((c) => c.id === id);

  if (!demo || !client) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Link
          href="/clientes"
          className="flex items-center gap-1 font-medium text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Clientes
        </Link>
        <p className="mt-8 text-center text-zinc-600">
          Cliente não encontrado.
        </p>
      </div>
    );
  }

  const requests = data!.requests
    .filter((r) => r.clientId === client.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const quotes = data!.quotes
    .filter((q) => q.clientId === client.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link
        href="/clientes"
        className="flex items-center gap-1 font-medium text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Clientes
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-zinc-900">{client.name}</h1>
      {client.address && (
        <p className="font-medium text-zinc-600">{client.address}</p>
      )}

      <div className="mt-4 flex gap-2">
        <a
          href={`tel:${client.phone.replace(/\s/g, "")}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white p-3 font-semibold text-zinc-800 shadow-sm active:bg-zinc-50"
        >
          <Phone className="h-5 w-5" />
          Ligar
        </a>
        <a
          href={waLink(client.phone, "Bom dia!")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-3 font-semibold text-white shadow-sm active:bg-emerald-700"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
      </div>

      {client.notes && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900 shadow-sm">
          <StickyNote className="h-5 w-5 shrink-0" />
          {client.notes}
        </div>
      )}

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          Trabalhos
        </h2>
        {requests.length === 0 && (
          <p className="mt-1 text-sm text-zinc-600">Ainda sem trabalhos.</p>
        )}
        <ul className="mt-2 flex flex-col gap-2">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/pedidos/${r.id}`}
                className="block rounded-xl border border-zinc-200 p-3 active:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm text-zinc-800">{r.description}</p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${REQUEST_STATUS_STYLE[r.status]}`}
                  >
                    {REQUEST_STATUS_LABEL[r.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-zinc-500">
                  {formatRelative(r.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          Orçamentos
        </h2>
        {quotes.length === 0 && (
          <p className="mt-1 text-sm text-zinc-600">Ainda sem orçamentos.</p>
        )}
        <ul className="mt-2 flex flex-col gap-2">
          {quotes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/orcamentos/${q.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 active:bg-zinc-50"
              >
                <span className="font-semibold text-zinc-900">
                  {q.reference} · {formatEUR(quoteTotal(q))}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${QUOTE_STATUS_STYLE[q.status]}`}
                >
                  {QUOTE_STATUS_LABEL[q.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
