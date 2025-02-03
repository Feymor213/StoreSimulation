'use client';

import { Button } from "@/components/ui/button"
import { useState } from "react";

export default function Home() {

  const [text, setText] = useState('Preview ');

  async function RunSim() {
    const response = await fetch('/api/sim/run', { // ✅ Corrected API path
        method: 'POST',
    });

    const json = await response.json();
    console.log(json);
    setText(JSON.stringify(json.output));
  }

  return (
    <>
      <Button variant="outline" onClick={() => RunSim()}>Run Sim</Button>
      <p>{text}</p>
    </>
  );
}
