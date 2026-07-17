"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, FileText, TrendingUp, Users } from "lucide-react";

const TABS = [
  { href: "/pedidos", label: "Pedidos", Icon: ClipboardList },
  { href: "/orcamentos", label: "Orçamentos", Icon: FileText },
  { href: "/clientes", label: "Clientes", Icon: Users },
  { href: "/negocio", label: "Negócio", Icon: TrendingUp },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-zinc-100 via-zinc-100/90 to-transparent pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-8">
      <div className="relative mx-auto flex max-w-sm items-start justify-between px-6">
        {/* Barra a meio dos círculos, a ligá-los */}
        <span
          aria-hidden
          className="absolute inset-x-12 top-[26px] h-2 -translate-y-1/2 rounded-full bg-zinc-900/85"
        />
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="pointer-events-auto relative flex flex-col items-center gap-1"
            >
              <span
                className={`flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-colors ${
                  active
                    ? "bg-blue-600 text-white ring-2 ring-blue-600"
                    : "bg-white text-zinc-700 ring-1 ring-zinc-200"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  active ? "text-blue-700" : "text-zinc-600"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
