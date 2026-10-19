import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LMU Stint Planner | Le Mans Ultimate Endurance Strategy & VE Tool",
  description:
    "Interactive endurance strategy, Virtual Energy (VE) calculator, tire allocation tracker, and multi-driver swap planner for Le Mans Ultimate.",
};

export default function LmuStintsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
