"use client";

import { FlaskConical } from "lucide-react";
import { exitDemo, resetDemo, useDemo } from "@/lib/demo/store";

export function DemoBanner() {
  const { ready, demo } = useDemo();

  if (!ready || !demo) return null;

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-amber-200 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
      <span className="flex items-center gap-1.5">
        <FlaskConical className="h-4 w-4" />
        Demonstração — dados fictícios
      </span>
      <span className="flex gap-4">
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
