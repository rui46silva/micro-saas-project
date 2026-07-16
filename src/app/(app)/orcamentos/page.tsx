export default function OrcamentosPage() {
  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-bold">Orçamentos</h1>

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <span className="text-5xl" aria-hidden>
          📄
        </span>
        <p className="text-lg text-zinc-600">
          Os seus orçamentos vão aparecer aqui.
          <br />
          Crie o primeiro a partir de um pedido.
        </p>
      </div>
    </div>
  );
}
