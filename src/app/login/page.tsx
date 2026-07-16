"use client";

import { Eye, Hammer, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { enterDemo } from "@/lib/demo/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    setLoading(false);
    if (error) {
      setError("Não foi possível enviar o email. Tente novamente.");
    } else {
      setSent(true);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
          <Hammer className="h-8 w-8 text-white" strokeWidth={2.2} />
        </span>
        <h1 className="mt-3 text-3xl font-bold text-zinc-900">Apontado</h1>
        <p className="mt-2 text-zinc-600">
          Pedidos, orçamentos e clientes — tudo no telemóvel.
        </p>
      </div>

      {sent ? (
        <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <MailCheck className="h-8 w-8 text-emerald-700" />
          <p className="mt-2 text-lg font-semibold text-emerald-900">
            Email enviado
          </p>
          <p className="mt-1 text-emerald-800">
            Abra o email e toque no link para entrar.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-4"
        >
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-zinc-800">O seu email</span>
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@gmail.com"
              className="rounded-2xl border border-zinc-300 bg-white p-4 text-lg text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-600"
            />
          </label>

          {error && <p className="font-medium text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-600 p-4 text-lg font-semibold text-white shadow-sm active:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "A enviar…" : "Entrar"}
          </button>

          <p className="text-center text-sm text-zinc-600">
            Sem palavras-passe: enviamos um link para o seu email e basta tocar
            nele.
          </p>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          enterDemo();
          router.push("/pedidos");
        }}
        className="flex items-center gap-2 rounded-2xl border-2 border-blue-600 bg-white px-6 py-3 font-semibold text-blue-700 active:bg-blue-50"
      >
        <Eye className="h-5 w-5" />
        Ver demonstração
      </button>
    </main>
  );
}
