import React from 'react';
import CreateSimForm from "./client";
import PocketBase from 'pocketbase';
import { getAuthenticatedUser } from "@/lib/auth";

export default async function CreateSim() {

  const pb = new PocketBase("http://127.0.0.1:8090");
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

  const user = await getAuthenticatedUser();

  const categories = await pb.collection("Categories").getFullList({
    filter: user ? `user = "${user.id}" || default = true` : `default = true`,
  });

  const products = await pb.collection("Products").getFullList({
    filter: user ? `user = "${user.id}" || default = true` : `default = true`,
  });

  const customers = await pb.collection("CustomerTypes").getFullList({
    filter: user ? `user = "${user.id}" || default = true` : `default = true`,
  });

  const checkouts = await pb.collection("CheckoutTypes").getFullList({
    filter: user ? `user = "${user.id}" || default = true` : `default = true`,
  });

  return (
    <div className="w-full h-full">
      <CreateSimForm products={products} customers={customers} checkouts={checkouts} />
    </div>
  )
}