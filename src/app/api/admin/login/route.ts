import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD || "gardenia2026";

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
