import { RecordModel } from "pocketbase";
import { NewSimDataFull, SimulationOutputData } from "./simulation";

export type PocketbaseCollection = 'Categories' | 'Products'| "CustomerTypes" | "CheckoutTypes" | "interestsProduct" | "interestsCategory" | "Templates" | 'Simulations';

// Maps collection names to their types
// This is used to automatically determine the return type of functions in frontend/src/lib/pocketbase.ts
export type CollectionMap = {
  Categories: Category;
  Products: Product;
  CustomerTypes: CustomerType;
  CheckoutTypes: CheckoutType;
  interestsProduct: ProductInterest;
  interestsCategory: CategoryInterest;
  Templates: Template;
  Simulations: Simulation;
};

export interface Category extends RecordModel {
  id: string,
  name: string,
  description: string,
  user: string | null,
}

export interface Product extends RecordModel {
  id: string
  name: string,
  description: string,
  price: number,
  user: string | null,
  category: string,
}

export interface CustomerType extends RecordModel {
  id: string,
  name: string,
  description: string,
  impulsivity: number,
  patience: number,
  user: string | null,
}

export interface ProductInterest extends RecordModel {
  id: string,
  product: string,
  customer: string,
  interest: number,
}

export interface CategoryInterest extends RecordModel {
  id: string,
  category: string,
  customer: string,
  interest: number,
}

export interface CheckoutType extends RecordModel {
  id: string,
  name: string,
  description: string,
  capacity: number,
  humanCost: number,
  technicalCost: number,
  user: string | null,
}

export interface Template extends RecordModel {
  id: string,
  name: string,
  description: string,
  products: string[],
  categories: string[],
  customerTypes: string[],
  checkoutTypes: string[]
}

export interface Simulation extends RecordModel {
  id: string,
  name: string,
  description: string,
  user: string,
  inputData?: string | null,
  outputData?: string | null,
  state: 'running' | 'finished' | 'failed',
}
