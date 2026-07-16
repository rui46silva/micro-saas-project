"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Hammer, Printer } from "lucide-react";
import {
  ITEM_KIND_LABEL,
  type ItemKind,
  formatDate,
  formatEUR,
  quoteTotal,
} from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";

const IVA = 0.23;

export default function OrcamentoPdfPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, demo, data } = useDemo();

  if (!ready) return null;

  const quote = data?.quotes.find((q) => q.id === id);

  if (!demo || !quote) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Link
          href="/orcamentos"
          className="flex items-center gap-1 font-medium text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Orçamentos
        </Link>
        <p className="mt-8 text-center text-zinc-600">
          Orçamento não encontrado.
        </p>
      </div>
    );
  }

  const client = data!.clients.find((c) => c.id === quote.clientId);
  const subtotal = quoteTotal(quote);
  const kinds: ItemKind[] = ["mao_de_obra", "material", "outro"];

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/orcamentos/${quote.id}`}
          className="flex items-center gap-1 font-medium text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm active:bg-blue-700"
        >
          <Printer className="h-5 w-5" />
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm print:mt-0 print:rounded-none print:border-0 print:shadow-none">
        <header className="flex items-start justify-between border-b border-zinc-200 pb-6">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Hammer className="h-7 w-7" strokeWidth={2.2} />
            </div>
            <h1 className="mt-2 text-xl font-bold">Carpintaria Exemplo</h1>
            <p className="text-sm text-zinc-500">
              Rua da Oficina 8, Braga · 910 000 000
              <br />
              NIF 123 456 789
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">ORÇAMENTO</p>
            <p className="mt-1 font-medium">{quote.reference}</p>
            <p className="text-sm text-zinc-500">
              {formatDate(quote.createdAt)}
            </p>
          </div>
        </header>

        <section className="mt-6">
          <p className="text-sm font-semibold text-zinc-500">CLIENTE</p>
          <p className="font-medium">{quote.clientName}</p>
          {client?.address && (
            <p className="text-sm text-zinc-500">{client.address}</p>
          )}
        </section>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-left text-zinc-500">
              <th className="py-2 font-semibold">Descrição</th>
              <th className="py-2 text-right font-semibold">Qtd.</th>
              <th className="py-2 text-right font-semibold">Preço un.</th>
              <th className="py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {kinds.map((kind) => {
              const items = quote.items.filter((i) => i.kind === kind);
              if (items.length === 0) return null;
              return [
                <tr key={kind}>
                  <td
                    colSpan={4}
                    className="pt-4 pb-1 text-xs font-semibold text-zinc-400"
                  >
                    {ITEM_KIND_LABEL[kind].toUpperCase()}
                  </td>
                </tr>,
                ...items.map((i) => (
                  <tr key={i.id} className="border-b border-zinc-100">
                    <td className="py-2">{i.description}</td>
                    <td className="py-2 text-right">
                      {i.quantity} {i.unit}
                    </td>
                    <td className="py-2 text-right">
                      {formatEUR(i.unitPrice)}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {formatEUR(i.quantity * i.unitPrice)}
                    </td>
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>

        <div className="mt-6 ml-auto w-56">
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Subtotal</span>
            <span>{formatEUR(subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-zinc-600">
            <span>IVA (23%)</span>
            <span>{formatEUR(subtotal * IVA)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-zinc-300 pt-2 font-bold">
            <span>Total</span>
            <span>{formatEUR(subtotal * (1 + IVA))}</span>
          </div>
        </div>

        <footer className="mt-8 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
          Orçamento válido por 30 dias. Valores com IVA à taxa legal em vigor.
          <br />
          Este documento não serve de fatura.
        </footer>
      </div>
    </div>
  );
}
