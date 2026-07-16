"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
        <Link href="/clientes" className="text-blue-700">
          ← Clientes
        </Link>
        <p className="mt-8 text-center text-zinc-500">
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
      <Link href="/clientes" className="text-blue-700">
        ← Clientes
      </Link>

      <h1 className="mt-2 text-2xl font-bold">{client.name}</h1>
      {client.address && <p className="text-zinc-500">{client.address}</p>}

      <div className="mt-4 flex gap-2">
        <a
          href={`tel:${client.phone.replace(/\s/g, "")}`}
          className="flex-1 rounded-xl border border-zinc-300 bg-white p-3 text-center font-medium active:bg-zinc-50"
        >
          📞 Ligar
        </a>
        <a
          href={waLink(client.phone, "Bom dia!")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl border border-green-600 bg-green-50 p-3 text-center font-medium text-green-800 active:bg-green-100"
        >
          💬 WhatsApp
        </a>
      </div>

      {client.notes && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          📝 {client.notes}
        </div>
      )}

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">TRABALHOS</h2>
        {requests.length === 0 && (
          <p className="mt-1 text-sm text-zinc-500">Ainda sem trabalhos.</p>
        )}
        <ul className="mt-2 flex flex-col gap-2">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/pedidos/${r.id}`}
                className="block rounded-lg border border-zinc-200 p-3 active:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm">{r.description}</p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${REQUEST_STATUS_STYLE[r.status]}`}
                  >
                    {REQUEST_STATUS_LABEL[r.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {formatRelative(r.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">ORÇAMENTOS</h2>
        {quotes.length === 0 && (
          <p className="mt-1 text-sm text-zinc-500">Ainda sem orçamentos.</p>
        )}
        <ul className="mt-2 flex flex-col gap-2">
          {quotes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/orcamentos/${q.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 active:bg-zinc-50"
              >
                <span className="font-medium">
                  {q.reference} · {formatEUR(quoteTotal(q))}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${QUOTE_STATUS_STYLE[q.status]}`}
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
