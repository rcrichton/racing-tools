import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const orbitron = localFont({
  src: "../../public/fonts/Orbitron-Bold.ttf",
  variable: "--font-orbitron",
  weight: "700",
  display: "swap",
});

const chakraPetch = localFont({
  src: "../../public/fonts/ChakraPetch-Bold.ttf",
  variable: "--font-chakra",
  weight: "700",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMono-Bold.ttf",
  variable: "--font-mono",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Racing Tools | Precision Web Utilities for Sim Racing",
  description:
    "Focused, free web utilities for sim racers and rig builders, featuring Sim-Cap Studio for 3D-printable dual-color steering wheel button caps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${chakraPetch.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#090A0F] text-[#E2E8F0] font-sans flex flex-col selection:bg-orange-500/30 selection:text-orange-300">
        {children}
      </body>
    </html>
  );
}

