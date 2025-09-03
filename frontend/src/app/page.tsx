import React from "react";
import Hero from "@/components/Hero";
import SimulationsGrid from "@/components/SimulationsGrid";
import QuickActions from "@/components/QuickActions";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function Home() {

  const user = await getAuthenticatedUser();
  const loggedIn = !!user;

  return (
    <div className="min-h-screen">
      
      <Hero loggedIn={loggedIn} />
      <SimulationsGrid loggedIn={loggedIn} />
      <QuickActions loggedIn={loggedIn} />
    </div>
  );
}
