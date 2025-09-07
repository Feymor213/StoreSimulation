'use server';

import { Calendar, CheckoutTypeFull, CustomerTypeFull, NewSimDataFull, NewSimDataShort, ProductFull } from "@/lib/types"
import { getAuthenticatedUser } from "@/lib/auth";
import { FormatSimulationInput } from "@/lib/simulationUtils";
import PocketBase, { RecordModel } from 'pocketbase'
import path from "path";

import { spawn } from "child_process";
import { promisify } from "util";


export async function RunSimulation(data: NewSimDataShort) {
  try {
  const pb = new PocketBase("http://127.0.0.1:8090");
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User authentication failed");

  const simulationInputData = await FormatSimulationInput(data, pb);

  const simulationOutputData = await RunSimulationExecutable(simulationInputData);

  console.log(simulationOutputData);

  const savedRecord = await pb.collection("SimData").create({
    user: user.id,
    data: simulationOutputData
  })

  return {success: true, created: savedRecord.id};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
}

async function RunSimulationExecutable(data: NewSimDataFull) {

  const inputJson = JSON.stringify(data);

  const binaryPath = path.resolve(process.cwd(), "./src/lib/SimulationEngine");
  const args: string[] = [inputJson];

  try {
    const child = spawn(binaryPath, args);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", async (code) => {
      console.log(stdout);
    });


    return stdout;
  } catch(error) {
    console.log(error);
    throw new Error("Execution failed");
  }
}