import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nardy Vision",
    template: "%s | Nardy Vision",
  },
  description:
    "Платформа для анализа позиций в длинных нардах: загрузка позиции, рекомендации, метрики и личная история разборов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
