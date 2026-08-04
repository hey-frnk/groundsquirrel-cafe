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
        className={`fixed right-0 top-0 z-[61] h-full w-full max-w-sm bg-cream border-l border-ink/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
          <h2 className="text-lg">Your basket</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close basket"
            className="w-9 h-9 rounded-full border border-ink/20 hover:bg-ivory transition-colors"
          >
            ✕
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="text-4xl">🐿️</span>
            <p className="text-sm text-ink/60">
              Nothing here yet. The squirrels are waiting.
            </p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3">
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-ivory/40 border border-ink/10">
                  <Image
                    src={line.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{line.productTitle}</p>
                  <p className="text-xs text-ink/55 mt-0.5">{line.variantLabel}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center border border-ink/20 rounded-full">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                        aria-label={`Decrease quantity of ${line.variantLabel}`}
                        className="w-7 h-7 rounded-full hover:bg-ivory transition-colors"
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
                        className="w-7 h-7 rounded-full hover:bg-ivory transition-colors"
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
                  className="self-start text-ink/35 hover:text-rose transition-colors text-sm"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <footer className="border-t border-ink/10 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-ink/60">Subtotal</span>
              <span className="text-lg">{formatPrice(subtotal)}</span>
            </div>

            <div>
              <label
                htmlFor="cart-country"
                className="block text-xs text-ink/55 mb-1.5"
              >
                Delivering to
              </label>
              <select
                id="cart-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-ink/20 bg-white/70 px-3 py-2.5 text-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/30"
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
              <p className="mt-1.5 text-xs text-ink/50">
                Shipping is added at checkout.
              </p>
            </div>

            {error && <p className="text-xs text-rose">{error}</p>}

            {canCheckout ? (
              <button
                type="button"
                onClick={checkout}
                disabled={busy}
                className="w-full rounded-full bg-rose px-6 py-3 text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-60"
              >
                {busy ? "Taking you to checkout…" : "Checkout"}
              </button>
            ) : (
              <div className="rounded-xl bg-ivory/50 border border-ink/10 px-4 py-3 text-center">
                <p className="text-sm">Checkout opens soon</p>
                <p className="text-xs text-ink/55 mt-1">
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
