"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/**
 * Stripe sends the customer back here after paying. The basket lives in
 * localStorage, so without this the paid-for items would still be sitting in it.
 */
export default function ClearCartOnMount() {
  const { clear, closeCart } = useCart();

  useEffect(() => {
    clear();
    closeCart();
  }, [clear, closeCart]);

  return null;
}
