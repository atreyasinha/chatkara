import { redirect } from "next/navigation";

/** @deprecated Prefer /admin/waiter */
export default function LegacyOrderRedirect() {
  redirect("/admin/waiter");
}
