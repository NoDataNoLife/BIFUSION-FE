import type { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardCard({
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <div
      className={`bg-white/95 dark:bg-card/85 backdrop-blur-sm border border-border dark:border-border/70 shadow-sm shadow-black/5 dark:shadow-none rounded-2xl transition-colors ${className}`}
    >
      {children}
    </div>
  );
}
