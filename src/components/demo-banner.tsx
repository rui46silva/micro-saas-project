"use client";

import { exitDemo, resetDemo, useDemo } from "@/lib/demo/store";

export function DemoBanner() {
  const { ready, demo } = useDemo();

  if (!ready || !demo) return null;

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950">
      <span>🧪 Demonstração — dados fictícios</span>
      <span className="flex gap-3">
        <button type="button" className="underline" onClick={() => resetDemo()}>
          Repor
        </button>
        <button
          type="button"
          className="underline"
          onClick={() => {
            exitDemo();
            window.location.href = "/login";
          }}
        >
          Sair
        </button>
      </span>
    </div>
  );
}
