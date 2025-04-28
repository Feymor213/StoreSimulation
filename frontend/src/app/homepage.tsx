'use client';

import React from "react";

export default function HomePage() {

  async function RunSim() {
      const response = await fetch('/api/sim/run', {
        method: 'POST',
    });
  
      const json = await response.json();
      console.log(json);
    }

  return (
  <main className="flex h-screen flex-col gap-4 justify-center items-center">
    <h1 className="text-center text-4xl font-bold">Nothing's here yet.<br></br>Check out the header menu.</h1>
  </main>
  )
}