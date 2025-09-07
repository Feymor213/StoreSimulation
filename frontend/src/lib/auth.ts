import { cookies } from "next/headers";
import PocketBase, { AuthRecord, ClientResponseError } from "pocketbase";

export async function getAuthenticatedUser(): Promise<AuthRecord | null> {

    /**
     * This function retrieves the authenticated user from PocketBase.
     * It uses the auth token stored in cookies to authenticate the user.
     * 
     * If the token is valid, it returns the user object.
     * Otherwise, it returns null.
     * 
     * @throws {ClientResponseError}
     */

    const pb = new PocketBase(process.env.POCKETBASE_URL!);
    const cookieStore = await cookies(); // Get auth token from cookies
    const authCookie = cookieStore.get("pb_auth")?.value;

    if (!authCookie) return null; // No token, user is not authenticated

    // Retrieve the user using the auth token
    pb.authStore.save(authCookie, null);
    await pb.collection("users").authRefresh();

    return pb.authStore.record; // Returns the user object
}
