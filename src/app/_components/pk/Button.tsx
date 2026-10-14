import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "soft" | "dark" | "night-primary" | "night-secondary";
export type ButtonSize = "lg" | "md" | "sm";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-pk-accent font-bold text-pk-on-accent hover:bg-pk-accent-deep",
  secondary: "border-[1.5px] border-pk-ink font-medium text-pk-ink hover:bg-pk-ink hover:text-pk-on-ink",
  soft: "border border-pk-border-strong bg-pk-surface text-pk-ink hover:border-pk-ink",
  dark: "bg-pk-ink font-medium text-pk-on-ink hover:bg-pk-night",
  "night-primary": "bg-pk-g1 font-bold text-pk-night hover:bg-pk-night-ink",
  "night-secondary": "border-[1.5px] border-pk-night-ink-2 font-medium text-pk-night-ink hover:border-pk-night-ink",
};

const SIZE: Record<ButtonSize, string> = {
  lg: "min-h-[52px] px-7 text-[16px]",
  md: "min-h-11 px-[22px] text-[15px]",
  sm: "min-h-11 px-5 text-[14px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full no-underline whitespace-nowrap",
    "transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pk-accent",
    SIZE[size],
    VARIANT[variant],
  ].join(" ");
}

type LinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

export function ButtonLink({ variant, size, className = "", ...props }: LinkProps) {
  return <Link {...props} className={`${buttonClass(variant, size)} ${className}`} />;
}

/** 本文中のテキストリンク（「公開サンプルを見る →」など） */
export const TEXT_LINK =
  "inline-flex min-h-11 items-center gap-1.5 font-bold text-pk-link hover:text-pk-link-hover";
