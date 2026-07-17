"use client";

// Porteiro da conta: mostra o formulário de primeira configuração quando o
// perfil ainda não tem nome de empresa, e o aviso bloqueante quando a conta
// está pausada pela administração (ex.: falta de pagamento).

import { useState } from "react";
import { Hammer, PauseCircle } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/client";

const TRADES = [
  { value: "carpintaria", label: "Carpintaria" },
  { value: "canalizacao", label: "Canalização" },
  { value: "eletricidade", label: "Eletricidade" },
  { value: "pintura", label: "Pintura" },
  { value: "construcao_geral", label: "Construção geral" },
  { value: "outro", label: "Outro" },
];

export function AccountGate() {
  const { ready, demo, profile, updateProfile } = useAppData();
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [trade, setTrade] = useState("carpintaria");
  const [saving, setSaving] = useState(false);

  if (!ready || demo || !profile) return null;

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  // Conta pausada: aviso em ecrã inteiro, sem forma de fechar.
  if (profile.accountStatus === "pausada") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-zinc-900/95 p-6 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <PauseCircle className="h-10 w-10 text-amber-700" />
        </span>
        <h1 className="text-2xl font-bold text-white">Conta em pausa</h1>
        <p className="max-w-sm text-zinc-300">
          {profile.pausedReason ||
            "A sua conta foi colocada em pausa pela administração."}
        </p>
        <p className="max-w-sm text-sm text-zinc-400">
          Para regularizar a situação e voltar a usar a app, contacte-nos:
        </p>
        <a
          href="mailto:suporte@apontado.pt"
          className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white active:bg-blue-700"
        >
          Contactar suporte
        </a>
        <button
          type="button"
          onClick={signOut}
          className="mt-2 font-medium text-zinc-400 underline"
        >
          Sair da conta
        </button>
      </div>
    );
  }

  // Primeira entrada: configurar a empresa antes de usar a app.
  if (!profile.businessName) {
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setSaving(true);
      await updateProfile({ businessName, fullName, phone, trade });
      setSaving(false);
    }

    const inputClass =
      "rounded-2xl border border-zinc-300 bg-white p-4 text-lg text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-600";

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-100 p-6">
        <div className="mx-auto flex max-w-sm flex-col items-center pt-8">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <Hammer className="h-8 w-8 text-white" strokeWidth={2.2} />
          </span>
          <h1 className="mt-3 text-2xl font-bold text-zinc-900">
            Bem-vindo ao Apontado
          </h1>
          <p className="mt-1 text-center text-zinc-600">
            Só precisamos de 3 coisas para começar.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex w-full flex-col gap-4"
          >
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-zinc-800">
                Nome da empresa
              </span>
              <input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Carpintaria Silva"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-zinc-800">O seu nome</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="João Silva"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-zinc-800">Telemóvel</span>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="912 345 678"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-zinc-800">O seu ofício</span>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className={inputClass}
              >
                {TRADES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-blue-600 p-4 text-lg font-semibold text-white shadow-sm active:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "A guardar…" : "Começar a usar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
