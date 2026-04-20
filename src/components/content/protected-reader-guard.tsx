"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";

type ProtectedReaderGuardProps = {
  ownerLabel: string;
  children: ReactNode;
};

const BLOCKED_SHORTCUTS = new Set(["a", "c", "p", "s", "u", "x"]);

export function ProtectedReaderGuard({
  ownerLabel,
  children,
}: ProtectedReaderGuardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return undefined;
    }

    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      if (BLOCKED_SHORTCUTS.has(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };

    const events = ["copy", "cut", "contextmenu", "dragstart", "selectstart"];

    for (const eventName of events) {
      node.addEventListener(eventName, preventDefault);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      for (const eventName of events) {
        node.removeEventListener(eventName, preventDefault);
      }

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const watermarks = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        text: `${ownerLabel} • личный доступ`,
      })),
    [ownerLabel],
  );

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-line/80 bg-white/85 shadow-[0_26px_60px_rgba(24,35,28,0.10)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-10 overflow-hidden px-6 py-10 opacity-[0.08] sm:grid-cols-3"
      >
        {watermarks.map((watermark) => (
          <span
            key={watermark.id}
            className="flex items-center justify-center text-center text-xs font-semibold uppercase tracking-[0.34em] text-accent"
            style={{ transform: "rotate(-18deg)" }}
          >
            {watermark.text}
          </span>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative z-10 select-none touch-pan-y print:hidden"
      >
        {children}
      </div>

      <div className="hidden p-10 text-sm text-muted print:block">
        Печать содержимого отключена. Материал доступен только в защищенном
        reader внутри личного кабинета.
      </div>
    </div>
  );
}
