import React from "react";
import HomePage from "./homepage";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SimulationsGrid from "@/components/SimulationsGrid";
import QuickActions from "@/components/QuickActions";
import Footer from "@/components/Footer";
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
