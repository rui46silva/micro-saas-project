"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { newId, useDemo } from "@/lib/demo/store";

export default function NovoPedidoPage() {
  const router = useRouter();
  const { ready, demo, update } = useDemo();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [photoCount, setPhotoCount] = useState(0);

  if (!ready) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!demo) return;
    const id = newId();
    update((d) => {
      d.requests.unshift({
        id,
        clientName: name,
        clientPhone: phone || undefined,
        description,
        status: "novo",
        photoCount,
        createdAt: new Date().toISOString(),
      });
      return d;
    });
    router.push(`/pedidos/${id}`);
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link href="/pedidos" className="text-blue-700">
        ← Pedidos
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Novo pedido</h1>

      {!demo && (
        <p className="mt-8 text-center text-zinc-500">
          Disponível quando ligarmos a base de dados. Experimente no modo
          demonstração.
        </p>
      )}

      {demo && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Nome do cliente</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sr. Manuel"
              className="rounded-xl border border-zinc-300 bg-white p-4 text-lg outline-none focus:border-blue-600"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium">Telemóvel</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="912 345 678"
              className="rounded-xl border border-zinc-300 bg-white p-4 text-lg outline-none focus:border-blue-600"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium">O que é preciso fazer?</span>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: substituir 3 janelas de alumínio e colocar rodapé em 2 quartos"
              className="rounded-xl border border-zinc-300 bg-white p-4 text-lg outline-none focus:border-blue-600"
            />
          </label>

          <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-white p-4">
            <span className="text-zinc-600">
              📷 Fotos da obra{photoCount > 0 ? ` (${photoCount})` : ""}
            </span>
            <button
              type="button"
              onClick={() => setPhotoCount((n) => n + 1)}
              className="rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-700 active:bg-zinc-200"
            >
              Tirar foto
            </button>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-blue-700 p-4 text-lg font-semibold text-white active:bg-blue-800"
          >
            Guardar pedido
          </button>
        </form>
      )}
    </div>
  );
}
