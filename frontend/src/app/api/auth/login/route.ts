import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(req: NextRequest) {
  const pb = new PocketBase("http://127.0.0.1:8090");

  try {
    const json = await req.json();
    const { email, password } = json;
    const authData = await pb.collection("users").authWithPassword(email, password);

    const token = authData.token;

    const response = NextResponse.json(
      { user: authData.record, message: "Login successful" },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set("pb_auth", token, {
      httpOnly: true, // Prevent client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "strict", // Prevent CSRF
      path: "/", // Available across all routes
      maxAge: 60 * 60 * 24 * 7 // 7 days expiry
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Invalid credentials" }, { status: 403 });
  }
}
