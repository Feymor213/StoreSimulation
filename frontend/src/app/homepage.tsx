'use client';
import { Button } from "@/components/ui/button"

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
    <Button variant="outline" onClick={() => RunSim()}>Run Sim</Button>
  </main>
  )
}