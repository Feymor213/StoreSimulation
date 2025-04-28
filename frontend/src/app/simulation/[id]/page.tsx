import React from 'react';
import PocketBase from 'pocketbase'
import { getAuthenticatedUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { CheckoutOutputData, CustomerOutputData, ProductOutputData, SimOutputData } from '@/lib/types';


interface Props {
  id: string
}

export default async function SimulationPage({ params }: {params: Promise<Props>}) {

  const { id } = await params;
  
  const pb = new PocketBase("http://127.0.0.1:8090");
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

  const user = await getAuthenticatedUser();
  if (!user) throw new Error("User authentication failed");

  try {
    const simulationData = await pb.collection('SimData').getOne(id)

    return (
      <div>
        <SimResults simulationData={simulationData.data} />
      </div>
    )
  } catch (error) {
    return notFound();
  }
}

function SimResults({ simulationData, ...props }: {simulationData: SimOutputData}) {

  return (
    <div>
      <div>
        <h2 className='font-bold text-2xl'>Main Data</h2>
        <p><span className='font-bold '>Total visits:</span> {simulationData.timesVisited}</p>
        <p><span className='font-bold '>Total transactions:</span> {simulationData.transactions}</p>
        <p><span className='font-bold '>Total products purchased:</span> {simulationData.productsPurchased}</p>
        <p><span className='font-bold '>Average time in store:</span> {simulationData.totalTimeInStore / simulationData.timesVisited} minutes</p>
        <p><span className='font-bold '>Total profits:</span> {simulationData.profits}</p>
        <p><span className='font-bold '>Total costs:</span> {simulationData.opCosts}</p>
        <div>{Object.entries(simulationData.checkoutOutput).map(([key, record]) => <CheckoutResults id={key} checkoutData={record} key={key} />)}</div>
        <div>{Object.entries(simulationData.customerTypeOutput).map(([key, record]) => <CustomerResults id={key} customerData={record} key={key} />)}</div>
        <div>{Object.entries(simulationData.productOutput).map(([key, record]) => <ProductResults id={key} productData={record} key={key} />)}</div>
      </div>
    </div>
  )
}

function CheckoutResults({ id, checkoutData, ...props}: {id: string, checkoutData: CheckoutOutputData}) {

  return (
    <div {...props} className='my-2'>
      <h1 className='font-semibold text-lg'>Checkout {id}</h1>
      <div className='ml-2'>
        <p><span className='font-bold '>Profits:</span> {checkoutData.profits}</p>
        <p><span className='font-bold '>Technical costs:</span> {checkoutData.technicalCost}</p>
        <p><span className='font-bold '>Labor costs:</span> {checkoutData.humanCost}</p>
        <p><span className='font-bold '>Customers served:</span> {checkoutData.transactions}</p>
      </div>
    </div>
  )
}

function CustomerResults({ id, customerData, ...props}: {id: string, customerData: CustomerOutputData}) {

  return (
    <div {...props} className='my-2'>
      <h1 className='font-semibold text-lg'>Customer {id}</h1>
      <div className='ml-2'>
        <p><span className='font-bold '>Total visits:</span> {customerData.visits}</p>
        <p><span className='font-bold '>Totsl transactions:</span> {customerData.transactions}</p>
        <p><span className='font-bold '>Total purchased products:</span> {customerData.totalProductsPurchased}</p>
        <p><span className='font-bold '>Total time in store:</span> {customerData.totalTimeInStore} minutes</p>
      </div>
    </div>
  )
}

function ProductResults({id, productData, ...props}: {id: string, productData: ProductOutputData}) {

  return (
    <div {...props} className='my-2'>
      <h1 className='font-semibold text-lg'>Product {productData.name}</h1>
      <div className='ml-2'>
        <p><span className='font-bold '>Amount sold:</span> {productData.amountSold}</p>
        <p><span className='font-bold '>Amount sold by impulse:</span> {productData.soldByImpulse}</p>
        <p><span className='font-bold '>Sold from shopping list:</span> {productData.soldByShoppingList}</p>
      </div>
    </div>
  )
}