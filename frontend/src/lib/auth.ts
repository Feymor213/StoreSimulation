import { cookies } from "next/headers";
import PocketBase from "pocketbase";

export async function getAuthenticatedUser() {
    const pb = new PocketBase("http://127.0.0.1:8090");
    const cookieStore = await cookies(); // Get auth token from cookies
    const authCookie = cookieStore.get("pb_auth")?.value;

    if (!authCookie) return null; // No token, user is not authenticated

    try {
        pb.authStore.save(authCookie, null);
        await pb.collection("users").authRefresh();

        return pb.authStore.record; // Returns the user object
    } catch (error) {
        return null; // Invalid token, user is not authenticated
    }
}
