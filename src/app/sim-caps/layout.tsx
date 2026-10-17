import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sim-Cap Studio | 3D Dual-Color Sim Racing Button Cap Designer",
  description:
    "Design and export custom 3D-printable, dual-color (multi-material/AMS) sim racing steering wheel button caps for Fanatec, Moza, Simucube, and Logitech.",
};

export default function SimCapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
