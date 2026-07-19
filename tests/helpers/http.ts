import { baseUrl, testHeaders } from "./fixtures.ts";
import type { Order, OrderStatus, PaymentMethod } from "../../src/lib/types.ts";

let adminCookie = "";

export function getAdminCookie(): string {
  return adminCookie;
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit & { admin?: boolean },
): Promise<{ status: number; body: T; headers: Headers }> {
  const headers: Record<string, string> = {
    ...testHeaders(),
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (init?.admin && adminCookie) {
    headers.Cookie = adminCookie;
  }

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers,
  });
  const body = (await res.json()) as T;
  return { status: res.status, body, headers: res.headers };
}

export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch(`${baseUrl()}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  const legacy = res.headers.get("set-cookie");
  const raw = setCookie.length > 0 ? setCookie : legacy ? [legacy] : [];
  const session = raw.find((c) => c.includes("chatkara_admin_session="));
  if (session) {
    adminCookie = session.split(";")[0];
  }
  const body = (await res.json()) as { success?: boolean };
  return res.ok && Boolean(body.success) && Boolean(adminCookie);
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
  payload: {
    markPaid?: boolean;
    status?: OrderStatus;
    clearKitchenAck?: boolean;
  },
  opts?: { admin?: boolean },
) {
  return apiJson<{ order?: Order; error?: string }>(`/api/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    admin: opts?.admin !== false,
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
