import React from "react";
import Hero from "@/components/Hero";
import SimulationsGrid from "@/components/SimulationsGrid";
import QuickActions from "@/components/QuickActions";
import { getAuthenticatedUser } from "@/lib/auth";
import { PocketbaseGetAll } from "@/lib/pocketbase";
import { Simulation, Template } from "@/lib/types/pocketbase";

export default async function Home() {

  const user = await getAuthenticatedUser();
  const loggedIn = !!user;

  let templates: Template[] = [];
  let simulations: Simulation[] = [];

  if (loggedIn)
  {
    templates = await PocketbaseGetAll('Templates', {});
    simulations = await PocketbaseGetAll('Simulations', {
      filter: `user = "${user.id}"`
    });
  }

  return (
    <div className="min-h-screen">
      
      <Hero loggedIn={loggedIn} />
      <SimulationsGrid loggedIn={loggedIn} simulations={simulations} limit={4} />
      <QuickActions loggedIn={loggedIn} templates={templates} />
    </div>
  );
}
