import { type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-full border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-accent ${className}`}
      {...props}
    />
  );
}
