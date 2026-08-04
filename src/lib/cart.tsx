"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "gsc-cart-v1";

export interface CartLine {
  /** productSlug + variant label, unique per orderable thing. */
  id: string;
  productSlug: string;
  productTitle: string;
  variantLabel: string;
  price: number;
  image: string;
  sku?: string;
  stripePriceId?: string;
  quantity: number;
}

/* -------------------------------------------------------------------------- */
/* External store                                                             */
/*                                                                            */
/* The basket lives outside React so it can be read synchronously during       */
/* render (no hydration mismatch, no setState-in-effect) and so a second open   */
/* tab stays in step via the `storage` event.                                  */
/* -------------------------------------------------------------------------- */

/** Stable reference — returning a fresh [] would loop useSyncExternalStore. */
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
const listeners = new Set<() => void>();

function isValidLine(line: unknown): line is CartLine {
  const l = line as CartLine;
  return (
    typeof l?.id === "string" &&
    typeof l?.price === "number" &&
    Number.isFinite(l.price) &&
    l.price >= 0 &&
    Number.isInteger(l?.quantity) &&
    l.quantity > 0
  );
}

function readStored(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    // Anything hand-edited or left from an older shape is dropped rather than
    // trusted — a malformed price must not reach the basket total.
    const valid = parsed.filter(isValidLine);
    return valid.length > 0 ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function setLines(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // A full or blocked storage quota must not break checkout.
  }
  emit();
}

if (typeof window !== "undefined") {
  lines = readStored();
  // Another tab changed the basket — adopt it.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    lines = readStored();
    emit();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => lines;
const getServerSnapshot = () => EMPTY;

/* -------------------------------------------------------------------------- */
/* React binding                                                              */
/* -------------------------------------------------------------------------- */

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const currentLines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      const existing = lines.find((l) => l.id === line.id);
      setLines(
        existing
          ? lines.map((l) =>
              l.id === line.id ? { ...l, quantity: l.quantity + quantity } : l
            )
          : [...lines, { ...line, quantity }]
      );
      setIsOpen(true);
    },
    []
  );

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines(
      quantity <= 0
        ? lines.filter((l) => l.id !== id)
        : lines.map((l) => (l.id === id ? { ...l, quantity } : l))
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines(EMPTY), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: currentLines,
      itemCount: currentLines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: currentLines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      isOpen,
      addLine,
      setQuantity,
      removeLine,
      clear,
      openCart,
      closeCart,
    }),
    [currentLines, isOpen, addLine, setQuantity, removeLine, clear, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}
