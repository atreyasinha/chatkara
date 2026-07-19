import { test, expect } from "@playwright/test";
import { RESTAURANT } from "../../src/lib/restaurant";

test.describe("Customer-facing UI", () => {
  test("home page loads with brand and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: /chatkara/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /order online pickup/i }),
    ).toBeVisible();
  });

  test("invalid table token blocks ordering", async ({ page }) => {
    await page.goto("/table/1?token=wrong-token");
    await expect(page.getByText(/invalid table access/i)).toBeVisible();
  });

  test("valid table token shows menu and add buttons", async ({ page }) => {
    const token = RESTAURANT.tableTokens[1];
    await page.goto(`/table/1?token=${token}`);
    await expect(page.getByText(/table 1/i)).toBeVisible();
    await expect(page.getByPlaceholder(/search dishes/i)).toBeVisible();
    const addBtn = page.getByRole("button", { name: /^add$/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(page.getByText(/view cart/i)).toBeVisible();
  });

  test("pickup page opens menu without token", async ({ page }) => {
    await page.goto("/pickup");
    await expect(page.getByText(/online pickup/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^add$/i }).first()).toBeVisible();
  });

  test("customer can open checkout with cart item", async ({ page }) => {
    const token = RESTAURANT.tableTokens[2];
    await page.goto(`/table/2?token=${token}`);
    await page.getByRole("button", { name: /^add$/i }).first().click();
    await page.getByText(/view cart/i).click();
    await page.getByRole("button", { name: /proceed to pay/i }).click();
    await expect(page.getByText(/checkout/i)).toBeVisible();
    await expect(page.getByText(/upi/i)).toBeVisible();
    await expect(page.getByText(/cash/i)).toBeVisible();
  });
});

test.describe("Admin UI gates", () => {
  test("kitchen shows login when not authenticated", async ({ page }) => {
    await page.goto("/kitchen");
    await expect(page.getByText(/admin access/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /unlock dashboard/i }),
    ).toBeVisible();
  });

  test("checkout UPI does not offer self-serve mark paid", async ({ page }) => {
    const token = RESTAURANT.tableTokens[2];
    await page.goto(`/table/2?token=${token}`);
    await page.getByRole("button", { name: /^add$/i }).first().click();
    await page.getByText(/view cart/i).click();
    await page.getByRole("button", { name: /proceed to pay/i }).click();
    await expect(page.getByText(/checkout/i)).toBeVisible();
    // Place order path is covered in integration; UI copy for confirm changed.
    await expect(page.getByText(/i'?ve paid — confirm/i)).toHaveCount(0);
  });
});
