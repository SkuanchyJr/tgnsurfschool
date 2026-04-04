import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TGN Surf School | La Primera Escuela de Surf de Tarragona",
  description:
    "Aprende a surfear en Tarragona con TGN Surf School. Clases de surf, surfskate, extraescolares y escuela de verano en Platja de la Pineda, Platja del Miracle y más. Fundada por Eric Faura.",
  keywords:
    "escuela de surf Tarragona, surf Tarragona, clases de surf, surfskate Tarragona, escuela de verano surf, La Pineda surf, Eric Faura, TGN Surf School",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.variable} ${sora.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />

        {/* Floating WhatsApp CTA */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
