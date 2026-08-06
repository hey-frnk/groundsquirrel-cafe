"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/shop";
import { COUNTRY_GROUPS, DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Set NEXT_PUBLIC_CHECKOUT_URL to the deployed Cloudflare Worker to switch the
 * shop from "browsing" to "selling". Until then the basket works, but says so.
 */
const CHECKOUT_URL = process.env.NEXT_PUBLIC_CHECKOUT_URL;

export default function CartDrawer() {
  const { lines, subtotal, isOpen, closeCart, setQuantity, removeLine } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  async function checkout() {
    if (!CHECKOUT_URL) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Only identifiers and quantities travel to the server. Prices are
          // read from Stripe there, so a tampered basket cannot set its price.
          items: lines.map((l) => ({
            price: l.stripePriceId,
            quantity: l.quantity,
          })),
          // Decides the shipping zone; the Worker locks Stripe's address form
          // to this country so the rate and the address cannot disagree.
          country,
        }),
      });
      if (!response.ok) throw new Error(`Checkout failed (${response.status})`);
      const { url } = await response.json();
      if (!url) throw new Error("Checkout did not return a URL");
      window.location.href = url;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
      setBusy(false);
    }
  }

  const unpriced = lines.some((l) => !l.stripePriceId);
  const canCheckout = Boolean(CHECKOUT_URL) && !unpriced && lines.length > 0;

  return (
    <>
      <div
        onClick={closeCart}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-ink/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your basket"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-[61] flex h-full w-full max-w-sm flex-col border-l border-ink/10 bg-cream shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="eyebrow">Your basket</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close basket"
            className="flex h-8 w-8 items-center justify-center text-graphite transition-colors hover:text-rose"
          >
            <svg aria-hidden width="15" height="15" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.3">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 text-center">
            <span aria-hidden className="rule" />
            <p className="text-sm leading-relaxed text-graphite/80">
              Nothing here yet. The squirrels are waiting.
            </p>
          </div>
        ) : (
          <ul className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-ivory/25">
                  <Image
                    src={line.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base leading-snug text-ink">{line.productTitle}</p>
                  <p className="mt-1 text-xs text-graphite/70">{line.variantLabel}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center rounded-full border border-ink/20">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                        aria-label={`Decrease quantity of ${line.variantLabel}`}
                        className="h-7 w-7 transition-colors hover:bg-ivory"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                        aria-label={`Increase quantity of ${line.variantLabel}`}
                        className="h-7 w-7 transition-colors hover:bg-ivory"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm ml-auto">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  aria-label={`Remove ${line.variantLabel}`}
                  className="self-start p-1 text-graphite/45 transition-colors hover:text-rose"
                >
                  <svg aria-hidden width="12" height="12" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.4">
                    <path d="M2 2l12 12M14 2L2 14" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <footer className="space-y-4 border-t border-ink/10 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Subtotal</span>
              <span className="font-display text-xl text-ink">{formatPrice(subtotal)}</span>
            </div>

            <div>
              <label
                htmlFor="cart-country"
                className="mb-2 block text-[0.7rem] uppercase tracking-[0.14em] text-graphite/65"
              >
                Delivering to
              </label>
              <select
                id="cart-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-ink/20 bg-paper px-3 py-2.5 text-sm focus:border-rose focus:outline-none"
              >
                {COUNTRY_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-2 text-xs text-graphite/65">
                Shipping is added at checkout.
              </p>
            </div>

            {error && <p className="text-xs text-rose">{error}</p>}

            {canCheckout ? (
              <button
                type="button"
                onClick={checkout}
                disabled={busy}
                className="btn btn-primary w-full disabled:opacity-60"
              >
                {busy ? "Taking you to checkout…" : "Checkout"}
              </button>
            ) : (
              <div className="rounded-xl border border-ink/10 bg-ivory/25 px-4 py-4 text-center">
                <p className="text-sm text-ink">Checkout opens soon</p>
                <p className="mt-1.5 text-xs text-graphite/70">
                  Your basket is saved — it will still be here.
                </p>
              </div>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}
