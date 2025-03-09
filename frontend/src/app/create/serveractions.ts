'use server';

import { Calendar, CheckoutTypeFull, CustomerTypeFull, NewSimDataFull, NewSimDataShort, ProductFull } from "@/lib/types"
import { getAuthenticatedUser } from "@/lib/auth";
import PocketBase, { RecordModel } from 'pocketbase'
import path from "path";

import { execFile } from "child_process";
import { promisify } from "util";
const execute = promisify(execFile);


export async function RunSimulation(data: NewSimDataShort) {
  try {
  const pb = new PocketBase("http://127.0.0.1:8090");
  await pb.collection("_superusers").authWithPassword("admin@admin.com", "adminadmin");

  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User authentication failed");

  const simulationInputData = await FormatInput(data, pb);

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

async function FormatInput(data: NewSimDataShort, connection: PocketBase): Promise<NewSimDataFull> {

  const user = await getAuthenticatedUser();

  const allCategories = await connection.collection("Categories").getFullList({
    filter: user ? `user = "${user.id}" || default = true` : `default = true`,
  });

  const allProducts = await connection.collection("Products").getFullList({
    filter: user ? `user = "${user.id}" || default = true` : `default = true`,
  });

  const allCustomers = await connection.collection("CustomerTypes").getFullList({
    filter: user ? `user = "${user.id}" || default = true` : `default = true`,
  });

  const allCheckouts = await connection.collection("CheckoutTypes").getFullList({
    filter: user ? `user = "${user.id}" || default = true` : `default = true`,
  });

  const allInterestsCategory = await connection.collection("interestsCategory").getFullList();
  const allInterestsProduct = await connection.collection("interestsProduct").getFullList();

  const products: ProductFull[] = data.products.map(productID => {
    const productRecord = allProducts.find(productRecord => productRecord.id === productID)
    if (!productRecord) throw Error(`No product with id ${productID} exists or no permission to access`);
    return ({
      id: productRecord.id,
      name: productRecord.Name,
      price: productRecord.Price
    })
  })

  const customers: CustomerTypeFull[] = data.customers.map(customerData => {
    const CustomerRecord = allCustomers.find(customerRecord => customerRecord.id === customerData.customerID)
    if (!CustomerRecord) throw Error(`No customer with id ${customerData.customerID} exists or no permission to access`);
    
    const interests: Record<string, number> = CompileInterests(customerData.customerID, allProducts, allInterestsCategory, allInterestsProduct)

    return ({
      id: CustomerRecord.id,
      name: CustomerRecord.Name,
      impulsivity: CustomerRecord.impulsivity,
      patience: CustomerRecord.patience,
      frequency: customerData.frequency,
      interests: interests
    })
  })

  const checkouts: CheckoutTypeFull[] = data.checkouts.map(checkoutID => {
    const checkoutRecord = allCheckouts.find(checkoutRecord => checkoutRecord.id === checkoutID)
    if (!checkoutRecord) throw Error(`No checkout with id ${checkoutID} exists or no permission to access`);
    
    return ({
      id: checkoutRecord.id,
      capacity: checkoutRecord.capacity,
      humanCost: checkoutRecord.humanCost,
      technicalCost: checkoutRecord.technicalCost
    })
  })

  const calendar: Calendar = {deviations: {}}

  return ({
    days: data.days,
    customersPerHour: data.customersPerHour,
    products,
    customers,
    checkouts,
    calendar
  }) 
}

function CompileInterests(customerID: string, products: RecordModel[], allInterestsCategory: RecordModel[], allInterestsProduct: RecordModel[]): Record<string, number> {

  const output: Record<string, number> = products.map(product => {

    let interestValue: number;

    const interestProduct = allInterestsProduct.find(interest => (interest.customer === customerID && interest.product === product.id))
    const interestCategory = allInterestsCategory.find(interest => (interest.customer === customerID && interest.category === product.category));
    if (interestProduct) {
      interestValue = interestProduct.interest;
    }
    else if (interestCategory) {
      interestValue = interestCategory.interest
    }
    else {
      throw new Error("No interest value found")
    }
    
    return {[product.id]: interestValue}
  })
  .reduce((acc, entry) => ({ ...acc, ...entry }), {});

  return output;
}

async function RunSimulationExecutable(data: NewSimDataFull) {

  const inputJson = JSON.stringify(data);

  const binaryPath = path.resolve(process.cwd(), "./src/lib/SimulationEngine");
  const args: string[] = [inputJson];

  try {
    const { stdout } = await execute(binaryPath, args);

    return stdout;
  } catch(error) {
    console.log(error);
    throw new Error("Execution failed");
  }
}