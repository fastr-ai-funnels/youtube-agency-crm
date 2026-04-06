import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { password } = await req.json();
  const correct = process.env.DEMO_PASSWORD ?? "DEMO";

  if (password === correct) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("demo_auth", "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });
    return res;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
