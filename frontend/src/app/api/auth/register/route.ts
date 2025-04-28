import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(req: NextRequest) {
    const pb = new PocketBase("http://127.0.0.1:8090/");
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

    const { email, password, passwordConfirm, username } = await req.json();

    const data = {
        "password": password,
        "passwordConfirm": passwordConfirm,
        "email": email,
        "emailVisibility": true,
        "name": username
    };

    try {
        const newUser = await pb.collection("users").create(data);

        return NextResponse.json({ message: "Registration successful", user: newUser }, {status: 201});
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: error.message }, {status: 400});
    }
}
