"use client";

import { useCart } from "@/lib/cart";

export default function CartButton({ className = "" }: { className?: string }) {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={
        itemCount > 0 ? `Open basket, ${itemCount} item(s)` : "Open basket"
      }
      className={`relative flex h-9 w-9 items-center justify-center text-ink transition-colors hover:text-rose ${className}`}
    >
      {/* A drawn basket rather than an emoji — the emoji rendered as a different
          picture on every platform, and none of them matched the site. */}
      <svg
        aria-hidden
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 8h16l-1.4 10.2A2 2 0 0 1 16.6 20H7.4a2 2 0 0 1-2-1.8L4 8Z" />
        <path d="M8.5 8 12 3l3.5 5" />
        <path d="M9.5 12v4M14.5 12v4" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center bg-rose px-1 text-[0.62rem] leading-none text-cream tabular-nums">
          {itemCount}
        </span>
      )}
    </button>
  );
}
