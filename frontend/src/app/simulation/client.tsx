'use client'

import React from "react";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function NoSimScreen() {
  const router = useRouter();

  return (
    <div>
      <h1>No simulations to show</h1>
      <Button onClick={() => router.push('/create')}>Create new</Button>
    </div>
  )
}