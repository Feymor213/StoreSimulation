import { NewSimDataFull } from "@/lib/types/simulation"
import path from "path";

import { spawn } from "child_process";

export async function RunSimulationExecutable(data: NewSimDataFull): Promise<string> {
  const inputJson = JSON.stringify(data);
  const binaryPath = path.resolve(process.cwd(), "./src/lib/SimulationEngine");
  const args: string[] = [inputJson];

  return new Promise((resolve, reject) => {
    try {
      const child = spawn(binaryPath, args);

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(stderr || `Process exited with code ${code}`));
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
