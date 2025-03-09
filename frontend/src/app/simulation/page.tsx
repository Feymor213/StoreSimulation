import PocketBase, { RecordModel } from 'pocketbase';
import { getAuthenticatedUser } from '@/lib/auth';
import Link from 'next/link';
import { NoSimScreen } from './client';

export default async function SimulationsDisplay() {
  const pb = new PocketBase("http://127.0.0.1:8090");
  await pb.collection("_superusers").authWithPassword("admin@admin.com", "adminadmin");

  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User authentication failed");

  const simulations = await pb.collection("SimData").getFullList({
    filter: `user = "${user.id}"`
  });

  if (simulations.length === 0) {
    return (
      <NoSimScreen />
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {simulations.map((data, key) => SimulationRecord(data, key))}
    </div>
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