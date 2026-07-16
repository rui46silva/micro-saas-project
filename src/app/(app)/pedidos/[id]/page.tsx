"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_STYLE,
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_STYLE,
  type RequestStatus,
  formatEUR,
  formatRelative,
  quoteTotal,
  waLink,
} from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";

const STATUS_FLOW: RequestStatus[] = [
  "novo",
  "orcamentado",
  "aceite",
  "em_curso",
  "concluido",
];

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, demo, data, update } = useDemo();

  if (!ready) return null;

  const request = data?.requests.find((r) => r.id === id);

  if (!demo || !request) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Link href="/pedidos" className="text-blue-700">
          ← Pedidos
        </Link>
        <p className="mt-8 text-center text-zinc-500">
          Pedido não encontrado.
        </p>
      </div>
    );
  }

  const quotes = data!.quotes.filter((q) => q.requestId === request.id);

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link href="/pedidos" className="text-blue-700">
        ← Pedidos
      </Link>

      <div className="mt-2 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold">{request.clientName}</h1>
        <span
          className={`mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${REQUEST_STATUS_STYLE[request.status]}`}
        >
          {REQUEST_STATUS_LABEL[request.status]}
        </span>
      </div>
      <p className="text-sm text-zinc-400">
        Pedido {formatRelative(request.createdAt)}
      </p>

      {request.clientPhone && (
        <div className="mt-4 flex gap-2">
          <a
            href={`tel:${request.clientPhone.replace(/\s/g, "")}`}
            className="flex-1 rounded-xl border border-zinc-300 bg-white p-3 text-center font-medium active:bg-zinc-50"
          >
            📞 Ligar
          </a>
          <a
            href={waLink(
              request.clientPhone,
              `Bom dia! Recebi o seu pedido: "${request.description}". Entro em contacto em breve.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl border border-green-600 bg-green-50 p-3 text-center font-medium text-green-800 active:bg-green-100"
          >
            💬 WhatsApp
          </a>
        </div>
      )}

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">O TRABALHO</h2>
        <p className="mt-1">{request.description}</p>
        {request.photoCount > 0 && (
          <div className="mt-3 flex gap-2">
            {Array.from({ length: request.photoCount }).map((_, i) => (
              <span
                key={i}
                className="flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-100 text-2xl"
                aria-label="Foto da obra (exemplo)"
              >
                📷
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">ESTADO</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                update((d) => {
                  const r = d.requests.find((x) => x.id === request.id);
                  if (r) r.status = s;
                  return d;
                })
              }
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                request.status === s
                  ? "bg-blue-700 text-white"
                  : "border border-zinc-300 bg-white text-zinc-600"
              }`}
            >
              {REQUEST_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">ORÇAMENTOS</h2>
        {quotes.length === 0 && (
          <p className="mt-1 text-sm text-zinc-500">
            Ainda sem orçamento para este pedido.
          </p>
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
        <Link
          href={`/orcamentos/novo?pedido=${request.id}`}
          className="mt-3 block rounded-xl bg-blue-700 p-4 text-center text-lg font-semibold text-white active:bg-blue-800"
        >
          + Criar orçamento
        </Link>
      </section>
    </div>
  );
}
