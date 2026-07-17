"use client";

// Painel de administração: lista todas as contas, permite personalizar os
// dados de cada empresa e pausar/reativar contas (ex.: falta de pagamento).
// Só acessível a perfis com is_admin = true (ver migração para ativar).

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pause,
  Pencil,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/client";

interface AccountRow {
  id: string;
  email: string | null;
  business_name: string | null;
  full_name: string | null;
  phone: string | null;
  trade: string;
  account_status: string;
  paused_reason: string | null;
  created_at: string;
}

const TRADES = [
  "carpintaria",
  "canalizacao",
  "eletricidade",
  "pintura",
  "construcao_geral",
  "outro",
];

export default function AdminPage() {
  const { ready, demo, profile } = useAppData();
  const [accounts, setAccounts] = useState<AccountRow[] | null>(null);
  const [pausing, setPausing] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({
    business_name: "",
    full_name: "",
    phone: "",
    trade: "carpintaria",
  });

  const isAdmin = !demo && !!profile?.isAdmin;

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    createClient()
      .from("profiles")
      .select(
        "id, email, business_name, full_name, phone, trade, account_status, paused_reason, created_at"
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setAccounts((data as AccountRow[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (!ready) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Link
          href="/negocio"
          className="flex items-center gap-1 font-medium text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <p className="mt-8 text-center text-zinc-600">
          {demo
            ? "A administração só está disponível na versão real."
            : "Sem acesso: esta área é reservada à administração."}
        </p>
      </div>
    );
  }

  async function refresh() {
    const { data } = await createClient()
      .from("profiles")
      .select(
        "id, email, business_name, full_name, phone, trade, account_status, paused_reason, created_at"
      )
      .order("created_at", { ascending: false });
    setAccounts((data as AccountRow[]) ?? []);
  }

  async function setStatus(id: string, status: "ativa" | "pausada") {
    const { error } = await createClient().rpc("admin_set_account_status", {
      target_id: id,
      new_status: status,
      reason: status === "pausada" ? reason || null : null,
    });
    if (error) {
      window.alert("Não foi possível alterar o estado da conta.");
      return;
    }
    setPausing(null);
    setReason("");
    await refresh();
  }

  async function saveEdit(id: string) {
    const { error } = await createClient()
      .from("profiles")
      .update(edit)
      .eq("id", id);
    if (error) {
      window.alert("Não foi possível guardar as alterações.");
      return;
    }
    setEditingId(null);
    await refresh();
  }

  const inputClass =
    "rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-600";

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link
        href="/negocio"
        className="flex items-center gap-1 font-medium text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Negócio
      </Link>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-zinc-900">
        <ShieldCheck className="h-6 w-6 text-blue-700" />
        Administração
      </h1>
      <p className="text-sm font-medium text-zinc-600">
        {accounts ? `${accounts.length} contas` : "A carregar…"}
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {(accounts ?? []).map((a) => (
          <li
            key={a.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-bold text-zinc-900">
                  {a.business_name || "(sem nome de empresa)"}
                </p>
                <p className="truncate text-sm font-medium text-zinc-600">
                  {a.email}
                </p>
                <p className="text-xs font-medium text-zinc-500">
                  {a.trade} · desde{" "}
                  {new Date(a.created_at).toLocaleDateString("pt-PT")}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  a.account_status === "ativa"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {a.account_status === "ativa" ? "Ativa" : "Pausada"}
              </span>
            </div>

            {a.account_status === "pausada" && a.paused_reason && (
              <p className="mt-2 rounded-xl bg-red-50 p-2 text-sm font-medium text-red-800">
                {a.paused_reason}
              </p>
            )}

            {editingId === a.id ? (
              <div className="mt-3 flex flex-col gap-2">
                <input
                  value={edit.business_name}
                  onChange={(e) =>
                    setEdit({ ...edit, business_name: e.target.value })
                  }
                  placeholder="Nome da empresa"
                  className={inputClass}
                />
                <input
                  value={edit.full_name}
                  onChange={(e) =>
                    setEdit({ ...edit, full_name: e.target.value })
                  }
                  placeholder="Nome do responsável"
                  className={inputClass}
                />
                <input
                  value={edit.phone}
                  onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                  placeholder="Telemóvel"
                  className={inputClass}
                />
                <select
                  value={edit.trade}
                  onChange={(e) => setEdit({ ...edit, trade: e.target.value })}
                  className={inputClass}
                >
                  {TRADES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveEdit(a.id)}
                    className="flex-1 rounded-xl bg-blue-600 p-2.5 font-semibold text-white active:bg-blue-700"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded-xl border border-zinc-300 bg-white p-2.5 font-semibold text-zinc-700 active:bg-zinc-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : pausing === a.id ? (
              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Motivo (o cliente vai ver esta mensagem) — ex.: Pagamento da subscrição em falta desde julho."
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(a.id, "pausada")}
                    className="flex-1 rounded-xl bg-red-600 p-2.5 font-semibold text-white active:bg-red-700"
                  >
                    Confirmar pausa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPausing(null);
                      setReason("");
                    }}
                    className="flex-1 rounded-xl border border-zinc-300 bg-white p-2.5 font-semibold text-zinc-700 active:bg-zinc-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(a.id);
                    setEdit({
                      business_name: a.business_name ?? "",
                      full_name: a.full_name ?? "",
                      phone: a.phone ?? "",
                      trade: a.trade,
                    });
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white p-2.5 text-sm font-semibold text-zinc-700 active:bg-zinc-50"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                {a.account_status === "ativa" ? (
                  <button
                    type="button"
                    onClick={() => setPausing(a.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white p-2.5 text-sm font-semibold text-red-700 active:bg-red-50"
                  >
                    <Pause className="h-4 w-4" />
                    Pausar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStatus(a.id, "ativa")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 p-2.5 text-sm font-semibold text-white active:bg-emerald-700"
                  >
                    <Play className="h-4 w-4" />
                    Reativar
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
