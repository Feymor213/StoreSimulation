import React, { useEffect } from 'react';
import PocketBase, { RecordModel } from 'pocketbase';
import { getAuthenticatedUser } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SimulationsGrid from '@/components/SimulationsGrid';
import { notFound } from 'next/navigation';
import { PocketbaseGetAll } from '@/lib/pocketbase';
import { Simulation } from '@/lib/types/pocketbase';

export default async function SimulationsDisplay() {
  const pb = new PocketBase(process.env.POCKETBASE_URL!);
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

  const user = await getAuthenticatedUser();
  if (!user) {
    return notFound();
  }

  const loggedIn = !!user;

  let simulations: Simulation[] = [];

  if (user) {
    simulations = await PocketbaseGetAll('Simulations', {
      filter: `user = "${user.id}"`
    });
  }

  if (simulations.length === 0 && user) {
    return (
      <NoSimScreen />
    )
  }

  return (
    // <div className="grid grid-cols-4 gap-2">
    //   {simulations.map((data, key) => SimulationRecord(data, key))}
    // </div>
    <SimulationsGrid loggedIn={loggedIn} simulations={simulations} limit={Infinity} />
  )
}

function NoSimScreen() {

  return (
    <section id="simulations" className="py-20 bg-background min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Your Store Simulations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            You do not have any simulations yet. Go on and create a new one!
          </p>
        </div>
      </div>
    </section>
  )
}

function SimulationRecord(simulation: RecordModel, key: number) {
  return (
    <Link href={`/simulation/${simulation.id}`} key={key}>
    <div className="bg-white flex justify-between items-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-gray-700">{simulation.id}</h3>
    </div>
    </Link>
  )
}