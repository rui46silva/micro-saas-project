"use client";

import Link from "next/link";
import { Camera, ClipboardList, Plus } from "lucide-react";
import {
  REQUEST_STATUS_LABEL,
  type RequestStatus,
  formatRelative,
} from "@/lib/demo/data";
import { useAppData } from "@/lib/app-data";

const SECTION_ORDER: RequestStatus[] = [
  "novo",
  "orcamentado",
  "aceite",
  "em_curso",
  "concluido",
];

const SECTION_DOT: Record<RequestStatus, string> = {
  novo: "bg-blue-500",
  orcamentado: "bg-amber-500",
  aceite: "bg-emerald-500",
  em_curso: "bg-violet-500",
  concluido: "bg-zinc-400",
};

export default function PedidosPage() {
  const { ready, data } = useAppData();

  if (!ready || !data) return null;

  if (data.requests.length === 0) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <h1 className="text-2xl font-bold text-zinc-900">Pedidos</h1>
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <ClipboardList className="h-10 w-10 text-blue-700" />
          </span>
          <p className="text-lg text-zinc-700">
            Ainda não tem pedidos.
            <br />
            Quando um cliente lhe pedir um trabalho, registe-o aqui.
          </p>
          <Link
            href="/pedidos/novo"
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm active:bg-blue-700"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            Novo pedido
          </Link>
        </div>
      </div>
    );
  }

  const sorted = [...data.requests].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Pedidos</h1>
        <Link
          href="/pedidos/novo"
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm active:bg-blue-700"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Novo
        </Link>
      </div>

      {SECTION_ORDER.map((status) => {
        const items = sorted.filter((r) => r.status === status);
        if (items.length === 0) return null;
        return (
          <section key={status} className="mt-6 first-of-type:mt-4">
            <h2 className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
              <span
                className={`h-2 w-2 rounded-full ${SECTION_DOT[status]}`}
                aria-hidden
              />
              {REQUEST_STATUS_LABEL[status]}
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-zinc-700">
                {items.length}
              </span>
            </h2>
            <ul className="mt-2 flex flex-col gap-2.5">
              {items.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/pedidos/${r.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm active:bg-zinc-50"
                  >
                    <span className="font-semibold text-zinc-900">
                      {r.clientName}
                    </span>
                    <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600">
                      {r.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs font-medium text-zinc-500">
                      <span>{formatRelative(r.createdAt)}</span>
                      {r.photoCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5" />
                          {r.photoCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
