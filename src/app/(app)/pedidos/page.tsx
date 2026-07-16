"use client";

import Link from "next/link";
import { useState } from "react";
import {
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_STYLE,
  type RequestStatus,
  formatRelative,
} from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";

const FILTERS: Array<RequestStatus | "todos"> = [
  "todos",
  "novo",
  "orcamentado",
  "aceite",
  "em_curso",
  "concluido",
];

export default function PedidosPage() {
  const { ready, demo, data } = useDemo();
  const [filter, setFilter] = useState<RequestStatus | "todos">("todos");

  if (!ready) return null;

  if (!demo || !data) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="text-5xl" aria-hidden>
            📋
          </span>
          <p className="text-lg text-zinc-600">
            Ainda não tem pedidos.
            <br />
            Quando um cliente lhe pedir um trabalho, registe-o aqui.
          </p>
          <Link
            href="/pedidos/novo"
            className="rounded-xl bg-blue-700 px-8 py-4 text-lg font-semibold text-white active:bg-blue-800"
          >
            + Novo pedido
          </Link>
        </div>
      </div>
    );
  }

  const requests = [...data.requests]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((r) => filter === "todos" || r.status === filter);

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Link
          href="/pedidos/novo"
          className="rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white active:bg-blue-800"
        >
          + Novo
        </Link>
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              filter === f
                ? "bg-blue-700 text-white"
                : "bg-white text-zinc-600 border border-zinc-300"
            }`}
          >
            {f === "todos" ? "Todos" : REQUEST_STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {requests.map((r) => (
          <li key={r.id}>
            <Link
              href={`/pedidos/${r.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 active:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold">{r.clientName}</span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${REQUEST_STATUS_STYLE[r.status]}`}
                >
                  {REQUEST_STATUS_LABEL[r.status]}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                {r.description}
              </p>
              <div className="mt-2 flex gap-3 text-xs text-zinc-400">
                <span>{formatRelative(r.createdAt)}</span>
                {r.photoCount > 0 && <span>📷 {r.photoCount} fotos</span>}
              </div>
            </Link>
          </li>
        ))}
        {requests.length === 0 && (
          <li className="py-12 text-center text-zinc-500">
            Sem pedidos neste estado.
          </li>
        )}
      </ul>
    </div>
  );
}
