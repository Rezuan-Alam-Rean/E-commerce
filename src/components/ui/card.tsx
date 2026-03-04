import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)] ${className}`}>
      {children}
    </div>
  );
}
