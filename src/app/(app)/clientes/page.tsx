export default function ClientesPage() {
  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <span className="text-5xl" aria-hidden>
          👥
        </span>
        <p className="text-lg text-zinc-600">
          O seu &ldquo;caderninho&rdquo; digital.
          <br />
          Cada cliente com o histórico de trabalhos e orçamentos.
        </p>
      </div>
    </div>
  );
}
