import { getAuthenticatedUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import SimulationResults from "./client";

type Props = Promise<{
  id: string
}>

const SimulationResultsDisplay = async ({ params }: { params: Props }) => {
  const { id } = await params;

  const user = await getAuthenticatedUser();
  if (!user) {
    return notFound();
  }

  return (
    <SimulationResults id={id} user={user} />
  )
}

export default SimulationResultsDisplay;