"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
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
  const [tableNumber, setTableNumber] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [filter, setFilter] = useState<"all" | VegFlag>("all");
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

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
  }

  async function placeOrder() {
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      // AbortSignal.timeout is missing on older browsers — hand-roll it.
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
        // Session expired mid-shift — bounce to the AdminGuard login.
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
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col pb-28">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/waiter"
              className="rounded-full border border-line p-2 text-muted hover:border-gold hover:text-gold"
              aria-label="Back to today’s orders"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <BrandMark size="sm" href="/admin/waiter" />
          </div>
          <div className="text-right">
            <p className="font-display text-lg text-gold">New order</p>
            <p className="text-xs text-muted">
              Table or pickup · until QR codes are ready
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <TableChip
            label="Pickup"
            active={tableNumber === 0}
            onClick={() => setTableNumber(0)}
          />
          {Array.from({ length: RESTAURANT.tableCount }, (_, i) => i + 1).map(
            (n) => (
              <TableChip
                key={n}
                label={`T${n}`}
                active={tableNumber === n}
                onClick={() => setTableNumber(n)}
              />
            ),
          )}
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            aria-label="Search dishes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className="w-full rounded-xl border border-line bg-bg-elevated py-2.5 pl-10 pr-10 text-sm text-ink outline-none placeholder:text-muted focus:border-gold"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted hover:bg-bg-soft hover:text-ink"
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
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === f
                  ? "flame-bg text-white"
                  : "border border-line bg-bg-soft text-muted"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "veg"
                  ? "Veg"
                  : f === "nonveg"
                    ? "Non-veg"
                    : "Egg"}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <CategoryChip
            label="All"
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
        <section className="mb-6 rounded-2xl border border-gold/30 bg-gold/5 p-4">
          <h2 className="font-display text-lg text-gold">Add missing item</h2>
          <p className="mt-1 text-xs text-muted">
            Off-menu dish — name and price only. Kitchen will see it on the ticket.
          </p>
          <div className="mt-3 grid gap-2">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Dish name"
              className="w-full rounded-xl border border-line bg-bg-elevated px-3 py-2.5 text-base outline-none focus:border-gold"
            />
            <div className="flex gap-2">
              <input
                inputMode="numeric"
                value={customPrice}
                onChange={(e) =>
                  setCustomPrice(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="Price ₹"
                className="w-28 rounded-xl border border-line bg-bg-elevated px-3 py-2.5 text-base outline-none focus:border-gold"
              />
              <select
                value={customVeg}
                onChange={(e) => setCustomVeg(e.target.value as VegFlag)}
                className="flex-1 rounded-xl border border-line bg-bg-elevated px-3 py-2.5 text-base outline-none focus:border-gold"
              >
                <option value="veg">Veg</option>
                <option value="nonveg">Non-veg</option>
                <option value="egg">Egg</option>
              </select>
              <button
                type="button"
                onClick={addCustomItem}
                className="shrink-0 rounded-xl border border-gold/50 px-4 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
              >
                Add
              </button>
            </div>
            {customError && (
              <p className="text-sm text-nonveg">{customError}</p>
            )}
          </div>
        </section>

        {[...grouped.entries()].map(([cat, list], idx) => (
          <section
            key={cat}
            className="mb-6 animate-fade-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <h2 className="font-display mb-3 text-xl text-gold">{cat}</h2>
            <ul className="space-y-2">
              {list.map((item) => {
                const inCart = items.find((i) => i.itemId === item.id);
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-bg-elevated/80 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <VegBadge veg={item.veg} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {item.name}
                          </p>
                          {item.subcategory && (
                            <p className="text-xs text-muted">
                              {item.subcategory}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 pl-5 text-sm font-semibold text-gold">
                        {formatINR(item.price)}
                      </p>
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-bg-soft px-1.5 py-1">
                        <button
                          type="button"
                          aria-label="Decrease"
                          className="rounded-full p-1 text-gold hover:bg-gold-dim"
                          onClick={() =>
                            setQuantity(item.id, inCart.quantity - 1)
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase"
                          className="rounded-full p-1 text-gold hover:bg-gold-dim"
                          onClick={() =>
                            setQuantity(item.id, inCart.quantity + 1)
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addMenuItem(item)}
                        className="shrink-0 rounded-full border border-gold/50 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold-dim"
                      >
                        Add
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-muted">
            No menu match — use “Add missing item” above.
          </p>
        )}
      </main>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-4">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flame-bg flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-white shadow-lg shadow-black/40 transition hover:brightness-110"
          >
            <span className="flex items-center gap-2 font-semibold">
              <ShoppingBag className="h-5 w-5" />
              {count} item{count === 1 ? "" : "s"}
            </span>
            <span className="font-semibold">
              {formatINR(total)} · Review
            </span>
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="max-h-[85dvh] w-full max-w-lg overflow-hidden rounded-t-3xl border border-line bg-bg-elevated animate-fade-up">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="font-display text-xl text-gold">
                {tableNumber === 0 ? "Pickup order" : `Table ${tableNumber}`}
              </h3>
              <button
                type="button"
                aria-label="Close cart"
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-muted hover:bg-bg-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[50dvh] overflow-y-auto px-4 py-3 scrollbar-thin">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className="flex items-center gap-3 border-b border-line/50 py-3 last:border-0"
                >
                  <VegBadge veg={item.veg} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-sm text-gold">
                      {formatINR(item.price * item.quantity)}
                      {item.itemId.startsWith("custom:") && (
                        <span className="ml-2 text-[10px] uppercase text-muted">
                          custom
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-line px-1.5 py-1">
                    <button
                      type="button"
                      className="p-1 text-gold hover:bg-gold-dim rounded-full"
                      onClick={() =>
                        setQuantity(item.itemId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="p-1 text-gold hover:bg-gold-dim rounded-full"
                      onClick={() =>
                        setQuantity(item.itemId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-4 py-4">
              <div className="mb-1 flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {RESTAURANT.gstPercent > 0 && (
                <div className="mb-1 flex justify-between text-sm text-muted">
                  <span>GST</span>
                  <span>{formatINR(gst)}</span>
                </div>
              )}
              <div className="mb-3 flex justify-between text-sm font-semibold text-gold">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="flame-bg w-full rounded-xl py-3 font-semibold text-white"
              >
                Place order
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-bg-elevated p-5 sm:rounded-3xl animate-fade-up">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-2xl text-gold">Confirm</h3>
                <p className="text-sm text-muted">
                  {tableNumber === 0 ? "Pickup" : `Table ${tableNumber}`} ·{" "}
                  {formatINR(total)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCheckoutOpen(false)}
                className="rounded-full p-2 hover:bg-bg-soft"
              >
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 ${
                  method === "cash"
                    ? "border-gold bg-gold/10"
                    : "border-line bg-bg-soft"
                }`}
              >
                <Banknote className="h-6 w-6 text-gold" />
                <span className="text-sm font-semibold">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("upi")}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 ${
                  method === "upi"
                    ? "border-gold bg-gold/10"
                    : "border-line bg-bg-soft"
                }`}
              >
                <Smartphone className="h-6 w-6 text-gold" />
                <span className="text-sm font-semibold">UPI</span>
              </button>
            </div>

            <div className="mb-3 space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Customer name (optional)"
                className="w-full rounded-xl border border-line bg-bg-soft px-3 py-2.5 text-base outline-none focus:border-gold"
              />
              <input
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="Phone (optional)"
                className="w-full rounded-xl border border-line bg-bg-soft px-3 py-2.5 text-base outline-none focus:border-gold"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Kitchen notes (optional)"
                rows={2}
                className="w-full resize-none rounded-xl border border-line bg-bg-soft px-3 py-2.5 text-base outline-none focus:border-gold"
              />
            </div>

            {error && <p className="mb-3 text-sm text-nonveg">{error}</p>}

            <button
              type="button"
              disabled={loading || items.length === 0}
              onClick={placeOrder}
              className="flame-bg w-full rounded-xl py-3.5 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? "Sending to kitchen…"
                : `Send order · ${formatINR(total)} ${method === "cash" ? "cash" : "UPI"}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TableChip({
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
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
        active
          ? "bg-gold text-bg font-semibold"
          : "border border-line text-muted hover:border-gold/50 hover:text-ink"
      }`}
    >
      {label}
    </button>
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
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
        active
          ? "bg-gold text-bg font-semibold"
          : "border border-line text-muted hover:border-gold/50 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
