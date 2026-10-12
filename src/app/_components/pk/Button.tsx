import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "dark" | "night-primary" | "night-secondary";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-pk-accent text-pk-on-accent hover:bg-pk-accent-deep",
  secondary: "border-[1.5px] border-pk-ink text-pk-ink hover:bg-pk-ink hover:text-pk-on-ink",
  dark: "bg-pk-ink text-pk-on-ink hover:bg-pk-night",
  "night-primary": "bg-pk-g1 text-pk-night hover:bg-pk-night-ink",
  "night-secondary": "border-[1.5px] border-pk-night-ink-2 text-pk-night-ink hover:border-pk-night-ink",
};

export function buttonClass(variant: ButtonVariant = "primary", size: "md" | "sm" = "md") {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full font-bold no-underline whitespace-nowrap",
    "transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pk-accent",
    size === "md" ? "min-h-12 px-6 text-[15px]" : "min-h-11 px-5 text-[14px]",
    VARIANT[variant],
  ].join(" ");
}

type LinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: "md" | "sm" };

export function ButtonLink({ variant, size, className = "", ...props }: LinkProps) {
  return <Link {...props} className={`${buttonClass(variant, size)} ${className}`} />;
}
