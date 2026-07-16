"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Users } from "lucide-react";
import { useDemo } from "@/lib/demo/store";

export default function ClientesPage() {
  const { ready, demo, data } = useDemo();
  const [search, setSearch] = useState("");

  if (!ready) return null;

  if (!demo || !data) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <h1 className="text-2xl font-bold text-zinc-900">Clientes</h1>
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-10 w-10 text-blue-700" />
          </span>
          <p className="text-lg text-zinc-700">
            O seu &ldquo;caderninho&rdquo; digital.
            <br />
            Cada cliente com o histórico de trabalhos e orçamentos.
          </p>
        </div>
      </div>
    );
  }

  const clients = data.clients
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "pt"));

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-bold text-zinc-900">Clientes</h1>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar cliente…"
          className="w-full rounded-2xl border border-zinc-300 bg-white p-4 pl-12 text-lg text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-600"
        />
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {clients.map((c) => {
          const works = data.requests.filter((r) => r.clientId === c.id).length;
          const initials = c.name
            .split(" ")
            .filter((w) => w[0] === w[0]?.toUpperCase())
            .slice(0, 2)
            .map((w) => w[0])
            .join("");
          return (
            <li key={c.id}>
              <Link
                href={`/clientes/${c.id}`}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm active:bg-zinc-50"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-zinc-900">{c.name}</span>
                  <span className="block text-sm font-medium text-zinc-600">
                    {c.phone}
                    {works > 0 &&
                      ` · ${works} ${works === 1 ? "trabalho" : "trabalhos"}`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        {clients.length === 0 && (
          <li className="py-12 text-center text-zinc-600">
            Nenhum cliente encontrado.
          </li>
        )}
      </ul>
    </div>
  );
}
