import type { Metadata } from "next";
import { Literata, Source_Sans_3 } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic';

const displayFont = Literata({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GuiasAI",
  description: "Generador editorial de guias pedagogicas asistidas por IA para docentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV = { API_BASE_URL: '${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || ""}' }`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
