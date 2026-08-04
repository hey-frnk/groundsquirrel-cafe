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
      className={`relative w-9 h-9 rounded-full border border-ink/20 hover:bg-cream/60 transition-colors flex items-center justify-center ${className}`}
    >
      <span aria-hidden className="text-base leading-none">
        🧺
      </span>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-rose text-ink text-[0.65rem] leading-[1.15rem] text-center tabular-nums">
          {itemCount}
        </span>
      )}
    </button>
  );
}
