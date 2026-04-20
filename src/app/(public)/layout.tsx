import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(155,107,47,0.18),_transparent_66%)] blur-3xl" />
        <div className="absolute right-[-120px] top-[220px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(112,70,26,0.12),_transparent_72%)] blur-3xl" />
      </div>
      <SiteHeader />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
