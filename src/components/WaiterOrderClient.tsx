"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  ChevronDown,
  ChevronUp,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { VegBadge } from "@/components/VegBadge";
import { CATEGORIES, MENU, searchMenu } from "@/lib/menu";
import { computeOrderTotals } from "@/lib/order-math";
import { formatINR, RESTAURANT } from "@/lib/restaurant";
import type { CartItem, MenuItem, PaymentMethod, VegFlag } from "@/lib/types";

function newCustomId(): string {
  return `custom:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function WaiterOrderClient() {
  const router = useRouter();
  const [tableNumber, setTableNumber] = useState<number>(0);
  const [tableModalOpen, setTableModalOpen] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [filter, setFilter] = useState<"all" | VegFlag>("all");
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customVeg, setCustomVeg] = useState<VegFlag>("veg");

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customError, setCustomError] = useState("");
  // Idempotency key: a retry after a client-side timeout returns the same order.
  const [requestId] = useState(() => crypto.randomUUID());

  const filtered = useMemo(() => {
    let list = query ? searchMenu(query) : MENU;
    if (category !== "All") list = list.filter((m) => m.category === category);
    if (filter !== "all") list = list.filter((m) => m.veg === filter);
    return list;
  }, [query, category, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [filtered]);

  const { subtotal, gst, total } = computeOrderTotals(items);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  function addMenuItem(item: MenuItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id
            ? { ...i, quantity: Math.min(20, i.quantity + 1) }
            : i,
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          veg: item.veg,
        },
      ];
    });
  }

  function setQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.itemId !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.itemId === itemId
          ? { ...i, quantity: Math.min(20, quantity) }
          : i,
      ),
    );
  }

  function addCustomItem() {
    const price = Math.round(Number(customPrice));
    const trimmed = customName.trim();
    if (!trimmed || !Number.isFinite(price) || price < 1) {
      setCustomError("Enter a dish name and price (₹1+)");
      return;
    }
    setCustomError("");
    setItems((prev) => [
      ...prev,
      {
        itemId: newCustomId(),
        name: trimmed.slice(0, 80),
        price,
        quantity: 1,
        veg: customVeg,
      },
    ]);
    setCustomName("");
    setCustomPrice("");
    setCustomVeg("veg");
    setCustomOpen(false);
  }

  async function placeOrder() {
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25_000);
      let res: Response;
      try {
        res = await fetch("/api/orders", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber,
            items,
            paymentMethod: method,
            customerName: name.trim() || undefined,
            customerPhone: /^[6-9]\d{9}$/.test(phone.trim())
              ? phone.trim()
              : undefined,
            notes: notes.trim() || undefined,
            requestId,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      const data = (await res.json().catch(() => ({}))) as {
        order?: { id: string };
        error?: string;
      };
      if (res.status === 401) {
        window.location.reload();
        return;
      }
      if (!res.ok || !data.order) {
        throw new Error(data.error || `Failed to place order (${res.status})`);
      }
      setItems([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      router.push("/admin/waiter");
    } catch (e) {
      setError(
        e instanceof DOMException &&
          (e.name === "TimeoutError" || e.name === "AbortError")
          ? "Order timed out — check today’s list before retrying"
          : e instanceof Error
            ? e.message
            : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col pb-safe-dock">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-md pt-safe">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/waiter"
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-line p-2 text-muted hover:border-gold hover:text-gold active:scale-95 transition"
              aria-label="Back to today’s orders"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <BrandMark size="sm" href="/admin/waiter" />
          </div>

          {/* Active Table Selector Banner */}
          <button
            type="button"
            onClick={() => setTableModalOpen(true)}
            className="flex min-h-[38px] items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-3.5 py-1.5 text-xs font-bold text-gold transition hover:bg-gold/25 active:scale-95 shadow-sm"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {tableNumber === 0 ? "🛍️ Pickup / Takeaway" : `🪑 Table #${tableNumber}`}
            </span>
            <span className="ml-1 text-[10px] text-muted underline">Change</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            aria-label="Search dishes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes (e.g. Paneer, Naan, Biryani)…"
            className="w-full rounded-2xl border border-line bg-bg-elevated py-3 pl-10 pr-12 text-base text-ink outline-none placeholder:text-muted focus:border-gold transition-colors"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted hover:bg-bg-soft hover:text-ink active:scale-90 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters & Categories */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {(["all", "veg", "nonveg", "egg"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`shrink-0 min-h-[32px] rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                filter === f
                  ? "flame-bg text-white shadow-sm"
                  : "border border-line bg-bg-soft text-muted hover:text-ink"
              }`}
            >
              {f === "all"
                ? "All Types"
                : f === "veg"
                  ? "Veg 🟢"
                  : f === "nonveg"
                    ? "Non-veg 🔴"
                    : "Egg 🟡"}
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

      {/* Main Content */}
      <main className="flex-1 px-4 py-4">
        {/* Collapsible Off-Menu Custom Item Box */}
        <section className="mb-5 rounded-2xl border border-gold/30 bg-gold/5 overflow-hidden transition-all shadow-sm">
          <button
            type="button"
            onClick={() => setCustomOpen((prev) => !prev)}
            className="flex min-h-[48px] w-full items-center justify-between p-3.5 text-left text-sm font-bold text-gold active:bg-gold/10 transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Add Off-Menu Custom Item
            </span>
            <span className="flex items-center gap-1 text-xs text-muted">
              {customOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </button>

          {customOpen && (
            <div className="border-t border-gold/20 p-4 pt-3 space-y-2.5 animate-fade-up">
              <p className="text-xs text-muted">
                Need to add a dish not in the main menu? Enter dish name and custom price:
              </p>
              <div className="grid gap-2.5">
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Dish name (e.g. Special Chai, Extra Raita)"
                  className="w-full rounded-xl border border-line bg-bg-elevated px-3.5 py-2.5 text-base text-ink outline-none placeholder:text-muted focus:border-gold"
                />
                <div className="flex gap-2">
                  <div className="relative w-32">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gold">₹</span>
                    <input
                      inputMode="numeric"
                      value={customPrice}
                      onChange={(e) =>
                        setCustomPrice(e.target.value.replace(/[^\d]/g, ""))
                      }
                      placeholder="Price"
                      className="w-full rounded-xl border border-line bg-bg-elevated py-2.5 pl-7 pr-2.5 text-base text-ink outline-none placeholder:text-muted focus:border-gold"
                    />
                  </div>
                  <select
                    value={customVeg}
                    onChange={(e) => setCustomVeg(e.target.value as VegFlag)}
                    className="flex-1 rounded-xl border border-line bg-bg-elevated px-3 py-2.5 text-base text-ink outline-none focus:border-gold"
                  >
                    <option value="veg">Veg 🟢</option>
                    <option value="nonveg">Non-veg 🔴</option>
                    <option value="egg">Egg 🟡</option>
                  </select>
                  <button
                    type="button"
                    onClick={addCustomItem}
                    className="shrink-0 min-h-[44px] flame-bg rounded-xl px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 active:scale-95 transition"
                  >
                    + Add
                  </button>
                </div>
                {customError && (
                  <p className="text-xs font-semibold text-nonveg mt-1">{customError}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Menu Items Grouped by Category */}
        {[...grouped.entries()].map(([cat, list], idx) => (
          <section
            key={cat}
            className="mb-6 animate-fade-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <h2 className="font-display mb-3 text-lg font-bold text-gold">{cat}</h2>
            <ul className="space-y-2.5">
              {list.map((item) => {
                const inCart = items.find((i) => i.itemId === item.id);
                return (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                      inCart
                        ? "border-gold/60 bg-gold/5 shadow-sm"
                        : "border-line bg-bg-elevated/80"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <VegBadge veg={item.veg} />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-base">
                            {item.name}
                          </p>
                          {item.subcategory && (
                            <p className="text-xs text-muted mt-0.5">
                              {item.subcategory}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 pl-5 text-sm font-bold text-gold">
                        {formatINR(item.price)}
                      </p>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-bg-soft px-2 py-1.5">
                        <button
                          type="button"
                          aria-label="Decrease"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold transition active:scale-90"
                          onClick={() =>
                            setQuantity(item.id, inCart.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-sans font-bold text-sm text-ink">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase"
                          className="flex h-8 w-8 items-center justify-center rounded-full flame-bg text-white transition active:scale-90"
                          onClick={() =>
                            setQuantity(item.id, inCart.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addMenuItem(item)}
                        className="shrink-0 min-h-[38px] rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-xs font-bold text-gold transition hover:bg-gold hover:text-bg active:scale-95"
                      >
                        + ADD
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted animate-fade-up">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-muted/50 mb-2" />
            <p className="text-sm font-medium">No dishes match your search.</p>
            <p className="text-xs mt-1">Try another dish name or use “Add Off-Menu Custom Item” above.</p>
          </div>
        )}
      </main>

      {/* Sticky Bottom Review Cart Bar */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-safe pointer-events-none">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto flame-bg flex min-h-[56px] w-full items-center justify-between rounded-2xl px-5 py-4 text-white shadow-xl shadow-black/60 transition hover:brightness-110 active:scale-[0.98] animate-fade-up"
          >
            <span className="flex items-center gap-2 font-bold text-base">
              <ShoppingBag className="h-5 w-5" />
              {count} {count === 1 ? "Item" : "Items"}
            </span>
            <span className="font-bold text-base">
              {formatINR(total)} · Review Cart →
            </span>
          </button>
        </div>
      )}

      {/* STEP 1: Select Table Modal */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-bg-elevated p-5 sm:rounded-3xl animate-fade-up pb-safe flex flex-col">
            <div className="drag-handle sm:hidden" />
            <div className="mb-4 flex items-start justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">
                  Step 1 of 3
                </span>
                <h3 className="font-display text-2xl font-bold text-gold">Select Table</h3>
                <p className="text-xs text-muted mt-0.5">
                  Which table is ordering right now?
                </p>
              </div>
              <button
                type="button"
                aria-label="Close table selector"
                onClick={() => setTableModalOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-muted hover:bg-bg-soft active:scale-90 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Takeaway / Pickup Option */}
            <button
              type="button"
              onClick={() => {
                setTableNumber(0);
                setTableModalOpen(false);
              }}
              className={`mb-4 flex min-h-[64px] w-full items-center justify-between rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
                tableNumber === 0
                  ? "border-gold bg-gold/20 shadow-md ring-2 ring-gold/40"
                  : "border-line bg-bg-soft hover:border-gold/50"
              }`}
            >
              <div>
                <p className="font-display text-lg font-bold text-gold">🛍️ Pickup / Takeaway</p>
                <p className="text-xs text-muted">Customer collecting at counter</p>
              </div>
              <span className="rounded-full bg-gold/20 px-3.5 py-1.5 text-xs font-bold text-gold">
                Select
              </span>
            </button>

            {/* Table Cards Grid */}
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
              Dine-In Tables:
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: RESTAURANT.tableCount }, (_, i) => i + 1).map(
                (n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setTableNumber(n);
                      setTableModalOpen(false);
                    }}
                    className={`flex min-h-[76px] flex-col items-center justify-center rounded-2xl border p-3.5 transition active:scale-95 ${
                      tableNumber === n
                        ? "border-gold bg-gold/25 shadow-md ring-2 ring-gold/50 text-gold"
                        : "border-line bg-bg-soft hover:border-gold/50"
                    }`}
                  >
                    <span className="text-2xl mb-1">🪑</span>
                    <span className="font-display text-base font-bold text-ink">
                      Table {n}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Cart Review Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
          <div className="max-h-[88dvh] w-full max-w-lg overflow-hidden rounded-t-3xl border border-line bg-bg-elevated animate-fade-up pb-safe flex flex-col">
            <div className="drag-handle sm:hidden" />
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold block">
                  Step 2 of 3
                </span>
                <h3 className="font-display text-xl font-bold text-gold">
                  Review Order · {tableNumber === 0 ? "Pickup" : `Table ${tableNumber}`}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close cart"
                onClick={() => setCartOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-muted hover:bg-bg-soft active:scale-90 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[48dvh] overflow-y-auto px-5 py-3 scrollbar-thin divide-y divide-line/40">
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
                      {item.itemId.startsWith("custom:") && (
                        <span className="ml-2 text-[10px] uppercase text-muted">
                          (custom)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-line bg-bg-soft px-2 py-1">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gold hover:bg-gold-dim active:scale-90 transition"
                      onClick={() =>
                        setQuantity(item.itemId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gold hover:bg-gold-dim active:scale-90 transition"
                      onClick={() =>
                        setQuantity(item.itemId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-5 py-4 bg-bg-elevated/90 space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">{formatINR(subtotal)}</span>
              </div>
              {RESTAURANT.gstPercent > 0 && (
                <div className="flex justify-between text-sm text-muted">
                  <span>GST ({RESTAURANT.gstPercent}%)</span>
                  <span className="font-semibold text-ink">{formatINR(gst)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gold border-t border-line/60 pt-2">
                <span>Total Amount</span>
                <span>{formatINR(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="flame-bg flex min-h-[52px] w-full items-center justify-center rounded-2xl py-3.5 text-base font-bold text-white shadow-lg active:scale-[0.98] transition hover:brightness-110 mt-2"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Confirm & Send to Kitchen Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-bg-elevated p-5 sm:rounded-3xl animate-fade-up pb-safe flex flex-col">
            <div className="drag-handle sm:hidden" />
            <div className="mb-4 flex items-start justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold block">
                  Step 3 of 3
                </span>
                <h3 className="font-display text-2xl font-bold text-gold">Confirm & Place Order</h3>
                <p className="text-xs text-muted mt-0.5">
                  {tableNumber === 0 ? "Pickup" : `Table ${tableNumber}`} ·{" "}
                  <strong className="text-gold font-semibold">{formatINR(total)}</strong>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCheckoutOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 hover:bg-bg-soft text-muted active:scale-90 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Select Payment Method:
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition active:scale-95 ${
                  method === "cash"
                    ? "border-gold bg-gold/20 shadow-sm ring-1 ring-gold/40"
                    : "border-line bg-bg-soft hover:border-gold/40"
                }`}
              >
                <Banknote className="h-7 w-7 text-gold" />
                <span className="text-sm font-bold text-ink">Cash Collection</span>
                <span className="text-[10px] text-muted">Collect at table</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("upi")}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition active:scale-95 ${
                  method === "upi"
                    ? "border-gold bg-gold/20 shadow-sm ring-1 ring-gold/40"
                    : "border-line bg-bg-soft hover:border-gold/40"
                }`}
              >
                <Smartphone className="h-7 w-7 text-gold" />
                <span className="text-sm font-bold text-ink">UPI / Digital</span>
                <span className="text-[10px] text-muted">QR payment</span>
              </button>
            </div>

            <div className="mb-4 space-y-2.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Customer name (optional)"
                className="w-full rounded-2xl border border-line bg-bg-soft px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-gold"
              />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="Customer Phone (optional)"
                className="w-full rounded-2xl border border-line bg-bg-soft px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-gold"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special order notes (e.g. Less spicy, Extra gravy)"
                rows={2}
                className="w-full resize-none rounded-2xl border border-line bg-bg-soft px-4 py-2.5 text-base text-ink outline-none placeholder:text-muted focus:border-gold"
              />
            </div>

            {error && <p className="mb-3 text-sm text-nonveg font-semibold">{error}</p>}

            <button
              type="button"
              disabled={loading || items.length === 0}
              onClick={placeOrder}
              className="flame-bg flex min-h-[54px] w-full items-center justify-center rounded-2xl py-4 text-base font-bold text-white shadow-lg disabled:opacity-50 transition hover:brightness-110 active:scale-[0.98]"
            >
              {loading
                ? "Submitting order…"
                : `✅ Submit & Save Order (${formatINR(total)})`}
            </button>
          </div>
        </div>
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
      className={`shrink-0 min-h-[34px] rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
        active
          ? "bg-gold text-bg font-bold shadow-sm"
          : "border border-line text-muted hover:border-gold/50 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
