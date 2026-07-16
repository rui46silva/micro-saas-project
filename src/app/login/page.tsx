"use client";

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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-700">Apontado</h1>
        <p className="mt-2 text-zinc-600">
          Pedidos, orçamentos e clientes — tudo no telemóvel.
        </p>
      </div>

      {sent ? (
        <div className="w-full max-w-sm rounded-xl bg-green-50 p-6 text-center">
          <p className="text-lg font-semibold text-green-800">
            Email enviado ✅
          </p>
          <p className="mt-2 text-green-700">
            Abra o email e toque no link para entrar.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-4"
        >
          <label className="flex flex-col gap-2">
            <span className="font-medium">O seu email</span>
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@gmail.com"
              className="rounded-xl border border-zinc-300 bg-white p-4 text-lg outline-none focus:border-blue-600"
            />
          </label>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-700 p-4 text-lg font-semibold text-white active:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "A enviar…" : "Entrar"}
          </button>

          <p className="text-center text-sm text-zinc-500">
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
        className="rounded-xl border-2 border-blue-700 px-6 py-3 font-semibold text-blue-700 active:bg-blue-50"
      >
        👀 Ver demonstração
      </button>
    </main>
  );
}
