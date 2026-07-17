"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  MessageCircle,
  Phone,
  Plus,
  Star,
} from "lucide-react";
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
import { useAppData } from "@/lib/app-data";

const STATUS_FLOW: RequestStatus[] = [
  "novo",
  "orcamentado",
  "aceite",
  "em_curso",
  "concluido",
];

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, data, setRequestStatus, setRequestRating } = useAppData();

  if (!ready) return null;

  const request = data?.requests.find((r) => r.id === id);

  if (!request) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Link
          href="/pedidos"
          className="flex items-center gap-1 font-medium text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Pedidos
        </Link>
        <p className="mt-8 text-center text-zinc-600">Pedido não encontrado.</p>
      </div>
    );
  }

  const quotes = data!.quotes.filter((q) => q.requestId === request.id);

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link
        href="/pedidos"
        className="flex items-center gap-1 font-medium text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Pedidos
      </Link>

      <div className="mt-2 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-zinc-900">
          {request.clientName}
        </h1>
        <span
          className={`mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${REQUEST_STATUS_STYLE[request.status]}`}
        >
          {REQUEST_STATUS_LABEL[request.status]}
        </span>
      </div>
      <p className="text-sm font-medium text-zinc-500">
        Pedido {formatRelative(request.createdAt)}
      </p>

      {request.clientPhone && (
        <div className="mt-4 flex gap-2">
          <a
            href={`tel:${request.clientPhone.replace(/\s/g, "")}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white p-3 font-semibold text-zinc-800 shadow-sm active:bg-zinc-50"
          >
            <Phone className="h-5 w-5" />
            Ligar
          </a>
          <a
            href={waLink(
              request.clientPhone,
              `Bom dia! Recebi o seu pedido: "${request.description}". Entro em contacto em breve.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-3 font-semibold text-white shadow-sm active:bg-emerald-700"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </a>
        </div>
      )}

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          O trabalho
        </h2>
        <p className="mt-1 text-zinc-800">{request.description}</p>
        {request.photoCount > 0 && (
          <div className="mt-3 flex gap-2">
            {Array.from({ length: request.photoCount }).map((_, i) => (
              <span
                key={i}
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100"
                aria-label="Foto da obra (exemplo)"
              >
                <Camera className="h-6 w-6 text-zinc-400" />
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          Estado
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRequestStatus(request.id, s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                request.status === s
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-zinc-300 bg-white text-zinc-700"
              }`}
            >
              {REQUEST_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </section>

      {request.status === "concluido" && (
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            O cliente ficou satisfeito?
          </h2>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRequestRating(request.id, n)}
                aria-label={`${n} estrelas`}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 ${
                    (request.rating ?? 0) >= n
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          Orçamentos
        </h2>
        {quotes.length === 0 && (
          <p className="mt-1 text-sm text-zinc-600">
            Ainda sem orçamento para este pedido.
          </p>
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
        <Link
          href={`/orcamentos/novo?pedido=${request.id}`}
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 p-4 text-lg font-semibold text-white shadow-sm active:bg-blue-700"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Criar orçamento
        </Link>
      </section>
    </div>
  );
}
