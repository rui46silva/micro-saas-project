"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { useAppData } from "@/lib/app-data";

export default function NovoPedidoPage() {
  const router = useRouter();
  const { ready, demo, createRequest } = useAppData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!ready) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const id = await createRequest({ name, phone, description, photoCount });
    setSaving(false);
    if (id) router.push(`/pedidos/${id}`);
  }

  const inputClass =
    "rounded-2xl border border-zinc-300 bg-white p-4 text-lg text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-600";

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link
        href="/pedidos"
        className="flex items-center gap-1 font-medium text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Pedidos
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900">Novo pedido</h1>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-zinc-800">Nome do cliente</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sr. Manuel"
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
          <span className="font-semibold text-zinc-800">
            O que é preciso fazer?
          </span>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: substituir 3 janelas de alumínio e colocar rodapé em 2 quartos"
            className={inputClass}
          />
        </label>

        {demo && (
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-zinc-300 bg-white p-4">
            <span className="flex items-center gap-2 font-medium text-zinc-700">
              <Camera className="h-5 w-5" />
              Fotos da obra{photoCount > 0 ? ` (${photoCount})` : ""}
            </span>
            <button
              type="button"
              onClick={() => setPhotoCount((n) => n + 1)}
              className="rounded-xl bg-zinc-100 px-4 py-2 font-semibold text-zinc-800 active:bg-zinc-200"
            >
              Tirar foto
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-blue-600 p-4 text-lg font-semibold text-white shadow-sm active:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "A guardar…" : "Guardar pedido"}
        </button>
      </form>
    </div>
  );
}
