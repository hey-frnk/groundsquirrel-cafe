"use client";

import { formatPrice } from "@/lib/shop";
import { SALE, saleLastDay, salePrice } from "@/lib/sale";
import { useSaleActive } from "@/lib/useSale";

/**
 * A price, with the regular one struck through while the sale runs. Checkout
 * charges the same: the Worker attaches the sale coupon until the same moment.
 */
export function Price({ amount, from = false }: { amount: number; from?: boolean }) {
  const onSale = useSaleActive();
  const prefix = from ? "from " : "";
  if (!onSale) return <>{prefix + formatPrice(amount)}</>;
  return (
    <>
      {prefix}
      <s className="opacity-55 decoration-1">
        <span className="sr-only">Regular price </span>
        {formatPrice(amount)}
      </s>{" "}
      <span className="sr-only">now </span>
      {formatPrice(salePrice(amount))}
    </>
  );
}

/** One line naming the sale and its end; nothing outside the sale. */
export function SaleNotice({ className = "" }: { className?: string }) {
  const onSale = useSaleActive();
  if (!onSale) return null;
  return (
    <p className={`font-stamp text-[0.7rem] uppercase tracking-[0.16em] text-rose ${className}`}>
      {SALE.name} · {SALE.percentOff}% off everything until {saleLastDay()}
    </p>
  );
}
