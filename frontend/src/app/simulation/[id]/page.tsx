import { getAuthenticatedUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import SimulationResults from "./client";
import { PocketbaseGetOne } from "@/lib/pocketbase";
import { SimulationOutputData } from "@/lib/types/simulation";

type Props = Promise<{
  id: string
}>

const SimulationResultsDisplay = async ({ params }: { params: Props }) => {
  const { id } = await params;

  const user = await getAuthenticatedUser();
  if (!user) {
    return notFound();
  }

  const simulation = await PocketbaseGetOne('Simulations', id, {});

  if (!simulation.outputData) {
    return notFound();
  }

  return (
    <SimulationResults id={id} user={user} simulation={simulation} />
  )
}

export default SimulationResultsDisplay;