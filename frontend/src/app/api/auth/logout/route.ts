import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: "Logged out successfully" });

    // ✅ Properly clear the `pb_auth` cookie by setting maxAge to 0 and path to "/"
    response.cookies.set("pb_auth", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        expires: new Date(0), // Expire immediately
        path: "/", // Ensure it applies to the entire app
    });

    return response;
}
