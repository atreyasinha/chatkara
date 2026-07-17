import { baseUrl, testHeaders } from "./fixtures.ts";
import type { Order, OrderStatus, PaymentMethod } from "../../src/lib/types.ts";

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: T }> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      ...testHeaders(),
      ...(init?.headers || {}),
    },
  });
  const body = (await res.json()) as T;
  return { status: res.status, body };
}

export async function createTestOrder(input: {
  tableNumber: number;
  paymentMethod: PaymentMethod;
  items: Array<Record<string, unknown> & { itemId: string; quantity: number }>;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  parentOrderId?: string;
}): Promise<{ status: number; order?: Order; error?: string }> {
  const { status, body } = await apiJson<{ order?: Order; error?: string }>(
    "/api/orders",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return { status, order: body.order, error: body.error };
}

export async function getOrder(id: string) {
  return apiJson<{ order?: Order; error?: string }>(`/api/orders/${id}`);
}

export async function patchOrder(
  id: string,
  payload: { markPaid?: boolean; status?: OrderStatus },
) {
  return apiJson<{ order?: Order; error?: string }>(`/api/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function waitForServer(timeoutMs = 90_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl()}/api/config`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server not reachable at ${baseUrl()} within ${timeoutMs}ms`);
}
