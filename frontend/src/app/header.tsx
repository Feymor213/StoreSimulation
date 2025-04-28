'use client';

import React from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AuthRecord } from "pocketbase";

export default function Header({user}: {user: AuthRecord}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 bg-white shadow-md py-4 px-6 flex justify-between items-center">
    <div className="flex gap-8">
      <Link href="/" className="text-2xl font-bold text-gray-800">
        SimApp
      </Link>
      <nav className="flex gap-6 justify-start items-center">
        <Link href="/parameters" className="text-gray-600 hover:text-gray-900">
          Parameters
        </Link>
        <Link href="/create" className="text-gray-600 hover:text-gray-900">
          New Simulation
        </Link>
        <Link href="/simulation" className="text-gray-600 hover:text-gray-900">
          My Simulations
        </Link>
      </nav>
    </div>

    <div className="flex gap-4">
      {user && <h3>Welcome, {user.name}</h3>}
      <Button variant="outline" onClick={() => router.push(user ? '/logout' : '/login')}>{user ? 'Log out' : 'Log in'}</Button>
    </div>
  </header>
  )
} 