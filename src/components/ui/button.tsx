import { type ButtonHTMLAttributes } from "react";

const base =
  "transition disabled:cursor-not-allowed disabled:opacity-60";

const styles = {
  primary:
    `${base} rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-accent-strong`,
  ghost:
    `${base} rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground hover:bg-surface-strong`,
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof styles;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button className={`${styles[variant]} ${className}`} {...props} />
  );
}
