"use client";

import { useEffect, useMemo, useState, memo, useDeferredValue } from "react";
import { Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/BrandMark";
import { CheckoutSheet } from "@/components/CheckoutSheet";
import { VegBadge } from "@/components/VegBadge";
import { useCart } from "@/lib/cart";
import { CATEGORIES, MENU, searchMenu } from "@/lib/menu";
import { formatINR, RESTAURANT } from "@/lib/restaurant";
import type { MenuItem, VegFlag } from "@/lib/types";

export function TableOrderClient({
  tableNumber,
  parentOrderId,
}: {
  tableNumber: number;
  parentOrderId?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [filter, setFilter] = useState<"all" | VegFlag>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [verifiedToken, setVerifiedToken] = useState<string | undefined>(undefined);

  // ⚡ Bolt: Defer search query updates to keep typing instantly responsive
  // while the large list filters in the background
  const deferredQuery = useDeferredValue(query);

  const { setTable, addItem, items, itemCount, subtotal, setQuantity, removeItem } =
    useCart();

  // Handle table token verification and silent URL cleanup
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Swap the cart to this table before revealing the UI so a rehydrated
      // cart from another table never flashes or takes a stray write.
      setTable(tableNumber);

      if (tableNumber === 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVerified(true);
        return;
      }

      const url = new URL(window.location.href);
      const urlToken = url.searchParams.get("token");
      const expectedToken = RESTAURANT.tableTokens[tableNumber];
      const savedToken = sessionStorage.getItem(`chatkara_table_${tableNumber}_token`);

      if (urlToken === expectedToken) {
        sessionStorage.setItem(`chatkara_table_${tableNumber}_token`, urlToken);
        setVerifiedToken(urlToken);
        setIsVerified(true);

        // Remove token from address bar silently
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.pathname + url.search);
      } else if (savedToken === expectedToken) {
        setVerifiedToken(savedToken);
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
    }
  }, [tableNumber, setTable]);

  const filtered = useMemo(() => {
    let list = deferredQuery ? searchMenu(deferredQuery) : MENU;
    if (category !== "All") {
      list = list.filter((m) => m.category === category);
    }
    if (filter !== "all") {
      list = list.filter((m) => m.veg === filter);
    }
    return list;
  }, [deferredQuery, category, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of filtered) {
      const key = item.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [filtered]);

  // Optimize cart item lookups: create a map of cart items keyed by itemId for O(1) lookup
  const itemsMap = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      map.set(item.itemId, item);
    }
    return map;
  }, [items]);

  const count = itemCount();
  const total = subtotal();

  if (isVerified === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-gold/20 blur-xl animate-pulse" />
          <div className="h-16 w-16 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
          <div className="absolute h-10 w-10 overflow-hidden rounded-full border border-line bg-bg shadow-md animate-pulse-soft">
            <Image
              src="/logo.png"
              alt="ChatKara Emblem"
              width={40}
              height={40}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  if (isVerified === false) {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-4 py-8 text-center">
        {/* Premium ambient backdrop gradients */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(212,175,55,0.15), transparent 45%), radial-gradient(circle at 90% 70%, rgba(185,28,28,0.18), transparent 45%)",
          }}
        />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-line bg-bg-elevated/60 p-8 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-fade-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nonveg/10 text-nonveg ring-8 ring-nonveg/5">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="font-display mt-5 text-2xl text-gold">Invalid Table Access</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Dine-in table ordering is restricted. To browse the menu and order, 
            please **scan the physical QR code** placed on your table.
          </p>

          <div className="mt-8 border-t border-line/45 pt-6">
            <Link 
              href="/"
              className="flame-bg block w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col pb-safe-dock">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-md pt-safe">
        <div className="flex items-center justify-between gap-3">
          <BrandMark size="sm" href="/" />
          <div className="text-right">
            <p className="font-display text-lg font-bold text-gold">
              {tableNumber === 0 ? "🛍️ Online Pickup" : `🪑 Table ${tableNumber}`}
            </p>
            <p className="text-xs text-muted">{RESTAURANT.tagline}</p>
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            aria-label="Search dishes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes (e.g. Tikka, Biryani)…"
            className="w-full rounded-2xl border border-line bg-bg-elevated py-3 pl-10 pr-12 text-base text-ink outline-none placeholder:text-muted focus:border-gold transition-colors"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted hover:bg-bg-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold active:scale-90 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {(["all", "veg", "nonveg", "egg"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`shrink-0 min-h-[32px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                filter === f
                  ? "flame-bg text-white shadow-sm"
                  : "border border-line bg-bg-soft text-muted hover:text-ink"
              }`}
            >
              {f === "all" ? "All Types" : f === "veg" ? "Veg 🟢" : f === "nonveg" ? "Non-veg 🔴" : "Egg 🟡"}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <CategoryChip
            label="All Categories"
            active={category === "All"}
            onClick={() => setCategory("All")}
          />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        {[...grouped.entries()].map(([cat, list], idx) => (
          <section
            key={cat}
            className="mb-6 animate-fade-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <h2 className="font-display mb-3 text-xl font-bold text-gold">{cat}</h2>
            <ul className="space-y-2.5">
              {list.map((item) => {
                const inCart = itemsMap.get(item.id);
                return (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    inCart={inCart}
                    setQuantity={setQuantity}
                    addItem={addItem}
                  />
                );
              })}
            </ul>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
            <p className="mb-4 text-muted text-sm">No dishes match your search.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("all");
                setCategory("All");
              }}
              className="min-h-[44px] rounded-full border border-line px-5 py-2.5 text-xs font-semibold text-gold hover:border-gold hover:bg-gold-dim transition focus-visible:ring-2 focus-visible:outline-none active:scale-95"
            >
              Clear search & filters
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-md pb-24 pt-8 text-center text-xs text-muted/60">
        <p>Website built by {RESTAURANT.developer}</p>
      </footer>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-safe pointer-events-none">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto flame-bg flex min-h-[56px] w-full items-center justify-between rounded-2xl px-5 py-3.5 text-white shadow-xl shadow-black/60 transition hover:brightness-110 active:scale-[0.98] animate-fade-up"
          >
            <span className="flex items-center gap-2.5 font-bold text-base">
              <ShoppingBag className="h-5 w-5" />
              {count} {count === 1 ? "item" : "items"}
            </span>
            <span className="font-bold text-base">{formatINR(total)} · View Cart →</span>
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
          <div className="max-h-[88dvh] w-full max-w-lg overflow-hidden rounded-t-3xl border border-line bg-bg-elevated shadow-2xl animate-fade-up flex flex-col">
            <div className="drag-handle" />
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="font-display text-xl font-bold text-gold">Your Order</h3>
              <button
                type="button"
                aria-label="Close cart"
                onClick={() => setCartOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-muted hover:bg-bg-soft hover:text-ink focus-visible:ring-2 active:scale-90 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted/30" />
                <p className="mb-6 text-muted">Your cart is empty.</p>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="min-h-[44px] rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-gold hover:border-gold hover:bg-gold-dim transition focus-visible:outline-none focus-visible:ring-2 active:scale-95"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="max-h-[50dvh] overflow-y-auto px-5 py-3 scrollbar-thin divide-y divide-line/40">
                  {items.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex items-center gap-3 py-3.5"
                    >
                      <VegBadge veg={item.veg} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink text-sm">{item.name}</p>
                        <p className="text-xs font-bold text-gold mt-0.5">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full border border-line bg-bg-soft px-1.5 py-1">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gold hover:bg-gold-dim active:scale-90 transition focus-visible:ring-2"
                          onClick={() => setQuantity(item.itemId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gold hover:bg-gold-dim active:scale-90 transition focus-visible:ring-2"
                          onClick={() => setQuantity(item.itemId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        className="min-h-[44px] min-w-[36px] flex items-center justify-center text-xs font-medium text-muted hover:text-nonveg focus-visible:ring-2 rounded active:scale-95 transition"
                        onClick={() => removeItem(item.itemId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-line px-5 py-4 pb-safe bg-bg-elevated/90">
                  <div className="mb-3.5 flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-bold text-ink text-base">{formatINR(total)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                    }}
                    className="flame-bg flex min-h-[52px] w-full items-center justify-center rounded-2xl py-3.5 text-base font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                  >
                    Proceed to Pay →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {checkoutOpen && (
        <CheckoutSheet
          tableNumber={tableNumber}
          tableToken={verifiedToken}
          parentOrderId={parentOrderId}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 min-h-[34px] rounded-full px-3.5 py-1.5 text-xs font-medium transition active:scale-95 ${
        active
          ? "bg-gold text-bg font-bold shadow-sm"
          : "border border-line text-muted hover:border-gold/50 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

// ⚡ Bolt: Memoized component prevents the entire menu list (~150 items)
// from re-rendering whenever the cart state changes (e.g. quantity updates).
const MenuItemRow = memo(function MenuItemRow({
  item,
  inCart,
  setQuantity,
  addItem,
}: {
  item: MenuItem;
  inCart: { quantity: number } | undefined;
  setQuantity: (itemId: string, quantity: number) => void;
  addItem: (item: MenuItem) => void;
}) {
  return (
    <li className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${
      inCart ? "border-gold/50 bg-gold/5 shadow-sm" : "border-line bg-bg-elevated/80"
    }`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <VegBadge veg={item.veg} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink text-sm sm:text-base">
              {item.name}
              {item.popular && (
                <span className="ml-2 rounded-full border border-flame-from/30 bg-flame-from/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-flame-from">
                  Popular
                </span>
              )}
            </p>
            {item.subcategory && (
              <p className="text-xs text-muted mt-0.5">{item.subcategory}</p>
            )}
          </div>
        </div>
        <p className="mt-1 pl-5 text-sm font-bold text-gold">
          {formatINR(item.price)}
        </p>
      </div>

      {inCart ? (
        <div className="flex items-center gap-1 rounded-full border border-gold/40 bg-bg-soft px-1.5 py-1">
          <button
            type="button"
            aria-label="Decrease"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gold hover:bg-gold-dim active:scale-90 transition"
            onClick={() => setQuantity(item.id, inCart.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-5 text-center text-sm font-bold text-ink">
            {inCart.quantity}
          </span>
          <button
            type="button"
            aria-label="Increase"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gold hover:bg-gold-dim active:scale-90 transition"
            onClick={() => setQuantity(item.id, inCart.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => addItem(item)}
          className="shrink-0 min-h-[38px] rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-xs font-bold text-gold transition hover:bg-gold hover:text-bg active:scale-95"
        >
          + ADD
        </button>
      )}
    </li>
  );
});
