'use server';

import { Calendar, CheckoutTypeFull, CustomerTypeFull, NewSimDataFull, NewSimDataShort, ProductFull, SimulationOutputData } from "@/lib/types/simulation"
import { getAuthenticatedUser } from "@/lib/auth";
import { FormatSimulationInput } from "@/lib/simulationUtils";
import PocketBase, { RecordModel } from 'pocketbase'
import path, { parse } from "path";

import { spawn } from "child_process";
import { promisify } from "util";
import { Simulation } from "@/lib/types/pocketbase";
import { PocketbaseCreate, PocketbaseUpdate } from "@/lib/pocketbase";

type SimulationCreateInput = Omit<Simulation, 'id' | 'collectionId' | 'created' | 'updated'>;

const mockInputData: NewSimDataFull = {
  days: 2,
  customersPerHour: 10,
  products: [
    {id: "1", name: "apple",  price:  90},
    {id: "2", name: "orange", price: 100},
    {id: "3", name: "milk",   price: 150},
    {id: "4", name: "pork",   price: 250},
    {id: "5", name: "beef",   price: 300},
    {id: "6", name: "tea",    price: 120},
    {id: "7", name: "coffee", price: 140}
  ],
  customers: [
    {
      id: "1",
      name: "man",
      frequency: 0.4,
      impulsivity: 0.3,
      patience: 40,
      interests: {
        "1": 0.1,
        "2": 0.2,
        "3": 0.7,
        "4": 0.5,
        "5": 0.6,
        "6": 0.3,
        "7": 0.2
      }
    },
    {
      id: "2",
      name: "woman",
      frequency: 0.6,
      impulsivity: 0.1,
      patience: 100,
      interests: {
        "1": 0.3,
        "2": 0.5,
        "3": 0.5,
        "4": 0.7,
        "5": 0.5,
        "6": 0.4,
        "7": 0.4
      }
    }
  ],
  checkouts: [
    {id: "1", capacity: 10, humanCost: 100, technicalCost: 100},
    {id: "2", capacity: 10, humanCost: 100, technicalCost: 100},
    {id: "3", capacity: 10, humanCost: 100, technicalCost: 100}
  ],
  calendar: {
    "deviations": { "0": {"1": 0}, "1": {"1": 0, "4": 0.9, "6": 0.6} }
  }
}


export async function RunSimulation(data: NewSimDataShort) {
  try {
  const pb = new PocketBase(process.env.POCKETBASE_URL!);
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User authentication failed");

  // const simulationInputData = await FormatSimulationInput(data, pb);

  let simulationRecord: Simulation = await PocketbaseCreate('Simulations', {
    user: user.id,
    name: "Test Simulation",
    description: "This is a test simulation",
    inputData: JSON.stringify(mockInputData),
    state: 'running',
  });

  const simulationOutputData = await RunSimulationExecutable(mockInputData);

  simulationRecord = await PocketbaseUpdate('Simulations', simulationRecord.id, {
    outputData: simulationOutputData,
    state: 'running',
    name: "Bodya"
  })

  console.log( "Output: ", simulationOutputData);

  // const savedRecord = await pb.collection("SimData").create({
  //   user: user.id,
  //   data: simulationOutputData
  // })

  return {success: true, created: simulationRecord.id};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
}

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