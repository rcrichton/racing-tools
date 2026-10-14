import type { Metadata } from "next";
import { Orbitron, Chakra_Petch, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sim-Cap Studio | 3D Dual-Color Sim Racing Button Cap Designer",
  description:
    "Design and export custom 3D-printable, dual-color (multi-material/AMS) sim racing steering wheel button caps for Fanatec, Moza, Simucube, and Logitech.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${chakraPetch.variable} ${jetbrainsMono.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#090A0F] text-[#E2E8F0] font-sans flex flex-col selection:bg-orange-500/30 selection:text-orange-300">
        {children}
      </body>
    </html>
  );
}
