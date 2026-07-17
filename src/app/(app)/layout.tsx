import { AccountGate } from "@/components/account-gate";
import { BottomNav } from "@/components/bottom-nav";
import { DemoBanner } from "@/components/demo-banner";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AccountGate />
      <DemoBanner />
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
