'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LogoutPage() {
  const router = useRouter();
  const [loggedOut, setLoggedOut] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    document.cookie = "pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"; // Manually remove the cookie on the client side

    router.refresh()
    setLoggedOut(true);
  };

  // Logout the user immediately when the page is opened
  useEffect(() => {
    handleLogout();
  }, [])

  if (!loggedOut) {
    return (
      <main className="w-full h-screen flex justify-center">
        Logging you out
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-4 items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">You have been logged out</h1>
      <Button onClick={() => {router.push("/")}} className="text-base px-12">Home</Button>
      <Button onClick={() => {router.push("/login")}} className="text-base px-12">Login</Button>
    </main>
  );
}
