export default function PedidosPage() {
  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <span className="text-5xl" aria-hidden>
          📋
        </span>
        <p className="text-lg text-zinc-600">
          Ainda não tem pedidos.
          <br />
          Quando um cliente lhe pedir um trabalho, registe-o aqui.
        </p>
        <button
          type="button"
          className="rounded-xl bg-blue-700 px-8 py-4 text-lg font-semibold text-white active:bg-blue-800"
        >
          + Novo pedido
        </button>
      </div>
    </div>
  );
}
