"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeEuro,
  Hammer,
  LogOut,
  Pencil,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatEUR, quoteTotal } from "@/lib/demo/data";
import { useAppData } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/client";

const MONTH_LABEL = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

const TRADE_LABEL: Record<string, string> = {
  carpintaria: "Carpintaria",
  canalizacao: "Canalização",
  eletricidade: "Eletricidade",
  pintura: "Pintura",
  construcao_geral: "Construção geral",
  outro: "Outro",
};

function monthKey(iso: string): string {
  return iso.slice(0, 7); // AAAA-MM
}

export default function NegocioPage() {
  const { ready, demo, data, profile, updateProfile } = useAppData();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    phone: "",
    address: "",
    nif: "",
  });

  if (!ready || !data) return null;

  const now = new Date();
  const thisMonth = monthKey(now.toISOString());
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const lastMonth = monthKey(lastMonthDate.toISOString());

  // Dinheiro real: orçamentos marcados como recebidos.
  const paid = data.quotes.filter((q) => q.paidAt);
  const receivedThisMonth = paid
    .filter((q) => monthKey(q.paidAt!) === thisMonth)
    .reduce((s, q) => s + quoteTotal(q), 0);
  const receivedLastMonth = paid
    .filter((q) => monthKey(q.paidAt!) === lastMonth)
    .reduce((s, q) => s + quoteTotal(q), 0);
  const delta = receivedThisMonth - receivedLastMonth;

  // Por receber: trabalho ganho mas ainda não pago.
  const toReceive = data.quotes
    .filter((q) => q.status === "aceite" && !q.paidAt)
    .reduce((s, q) => s + quoteTotal(q), 0);

  // Em aberto: orçamentos enviados à espera de resposta.
  const open = data.quotes.filter((q) => q.status === "enviado");
  const openValue = open.reduce((s, q) => s + quoteTotal(q), 0);

  // Taxa de aceitação: de todos os orçamentos respondidos.
  const accepted = data.quotes.filter((q) => q.status === "aceite").length;
  const refused = data.quotes.filter((q) => q.status === "recusado").length;
  const acceptRate =
    accepted + refused > 0
      ? Math.round((accepted / (accepted + refused)) * 100)
      : null;

  // Clientes.
  const totalClients = data.clients.length;
  const newClients = data.clients.filter(
    (c) => c.createdAt && monthKey(c.createdAt) === thisMonth
  ).length;

  // Satisfação (trabalhos concluídos avaliados).
  const ratings = data.requests
    .map((r) => r.rating)
    .filter((r): r is number => !!r);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : null;

  // Trabalhos.
  const inProgress = data.requests.filter(
    (r) => r.status === "em_curso"
  ).length;
  const doneThisMonth = data.requests.filter(
    (r) => r.status === "concluido" && monthKey(r.createdAt) === thisMonth
  ).length;

  // Últimos 6 meses de dinheiro recebido (s/ IVA).
  const months: { key: string; label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const key = monthKey(d.toISOString());
    months.push({
      key,
      label: MONTH_LABEL[d.getMonth()],
      value: paid
        .filter((q) => monthKey(q.paidAt!) === key)
        .reduce((s, q) => s + quoteTotal(q), 0),
    });
  }
  const maxMonth = Math.max(...months.map((m) => m.value), 1);
  const bestIdx = months.reduce(
    (best, m, i) => (m.value > months[best].value ? i : best),
    0
  );

  function startEditing() {
    setForm({
      businessName: profile?.businessName ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
      nif: profile?.nif ?? "",
    });
    setEditing(true);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile(form);
    setEditing(false);
  }

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  const inputClass =
    "rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-600";

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-bold text-zinc-900">Negócio</h1>

      {/* Dinheiro recebido este mês — o número que interessa */}
      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
          <BadgeEuro className="h-4 w-4" />
          Recebido este mês (s/ IVA)
        </p>
        <p className="mt-1 text-4xl font-bold text-zinc-900">
          {formatEUR(receivedThisMonth)}
        </p>
        {receivedLastMonth > 0 && (
          <p
            className={`mt-1 flex items-center gap-1 text-sm font-semibold ${
              delta >= 0 ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {formatEUR(Math.abs(delta))} vs. mês passado
          </p>
        )}

        {/* Últimos 6 meses */}
        <div className="mt-5" role="img" aria-label="Recebido nos últimos 6 meses">
          <div className="flex h-28 items-end gap-1.5">
            {months.map((m, i) => (
              <div
                key={m.key}
                className="flex flex-1 flex-col items-center gap-1"
                title={`${m.label}: ${formatEUR(m.value)}`}
              >
                {(i === bestIdx || i === months.length - 1) && (
                  <span className="text-[10px] font-semibold text-zinc-600">
                    {Math.round(m.value)} €
                  </span>
                )}
                <div
                  className="w-full rounded-t bg-blue-600"
                  style={{
                    height: `${Math.max((m.value / maxMonth) * 88, 2)}px`,
                  }}
                />
                <span
                  className={`text-[11px] ${
                    i === months.length - 1
                      ? "font-bold text-zinc-900"
                      : "font-medium text-zinc-500"
                  }`}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <table className="sr-only">
          <caption>Recebido por mês (euros, sem IVA)</caption>
          <tbody>
            {months.map((m) => (
              <tr key={m.key}>
                <th scope="row">{m.label}</th>
                <td>{Math.round(m.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Indicadores */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Por receber
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {formatEUR(toReceive)}
          </p>
          <p className="text-xs font-medium text-zinc-500">
            trabalhos ganhos, ainda não pagos
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Em aberto
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {formatEUR(openValue)}
          </p>
          <p className="text-xs font-medium text-zinc-500">
            {open.length}{" "}
            {open.length === 1 ? "orçamento enviado" : "orçamentos enviados"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
            <TrendingUp className="h-3.5 w-3.5" />
            Taxa de aceitação
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {acceptRate === null ? "—" : `${acceptRate}%`}
          </p>
          <p className="text-xs font-medium text-zinc-500">
            dos orçamentos respondidos
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
            <Star className="h-3.5 w-3.5" />
            Satisfação
          </p>
          <p className="mt-1 flex items-baseline gap-1 text-2xl font-bold text-zinc-900">
            {avgRating === null ? "—" : avgRating.toFixed(1)}
            {avgRating !== null && (
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            )}
          </p>
          <p className="text-xs font-medium text-zinc-500">
            {ratings.length}{" "}
            {ratings.length === 1 ? "trabalho avaliado" : "trabalhos avaliados"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
            <Users className="h-3.5 w-3.5" />
            Clientes
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {totalClients}
          </p>
          <p className="text-xs font-medium text-zinc-500">
            {newClients > 0
              ? `+${newClients} este mês`
              : "sem novos este mês"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
            <Hammer className="h-3.5 w-3.5" />
            Trabalhos
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{inProgress}</p>
          <p className="text-xs font-medium text-zinc-500">
            em curso · {doneThisMonth}{" "}
            {doneThisMonth === 1 ? "concluído" : "concluídos"} este mês
          </p>
        </div>
      </div>

      {/* A minha empresa */}
      <section className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            A minha empresa
          </h2>
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center gap-1 text-sm font-semibold text-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={saveProfile} className="mt-3 flex flex-col gap-3">
            <input
              required
              value={form.businessName}
              onChange={(e) =>
                setForm({ ...form, businessName: e.target.value })
              }
              placeholder="Nome da empresa"
              className={inputClass}
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Telemóvel"
              className={inputClass}
            />
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Morada (aparece no PDF)"
              className={inputClass}
            />
            <input
              value={form.nif}
              onChange={(e) => setForm({ ...form, nif: e.target.value })}
              placeholder="NIF (aparece no PDF)"
              className={inputClass}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-600 p-3 font-semibold text-white active:bg-blue-700"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border border-zinc-300 bg-white p-3 font-semibold text-zinc-700 active:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-2">
            <p className="text-lg font-bold text-zinc-900">
              {profile?.businessName ?? "—"}
            </p>
            <p className="text-sm font-medium text-zinc-600">
              {TRADE_LABEL[profile?.trade ?? "outro"] ?? profile?.trade}
              {profile?.phone && ` · ${profile.phone}`}
            </p>
            {profile?.address && (
              <p className="text-sm text-zinc-500">{profile.address}</p>
            )}
          </div>
        )}
      </section>

      {profile?.isAdmin && (
        <Link
          href="/admin"
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white p-4 font-semibold text-zinc-800 shadow-sm active:bg-zinc-50"
        >
          <ShieldCheck className="h-5 w-5" />
          Administração
        </Link>
      )}

      {!demo && (
        <button
          type="button"
          onClick={signOut}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white p-4 font-semibold text-zinc-600 shadow-sm active:bg-zinc-50"
        >
          <LogOut className="h-5 w-5" />
          Sair da conta
        </button>
      )}
    </div>
  );
}
