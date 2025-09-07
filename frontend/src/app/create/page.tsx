import React from 'react';
import Create, { CustomerType, Product, ProductCategory, Template, Checkout } from './client';
import PocketBase, { AuthModel, RecordModel } from 'pocketbase';
import { getAuthenticatedUser } from "@/lib/auth";
import { notFound } from 'next/navigation';

interface TemplateRaw {
  id: string,
  name: string,
  description: string,
  products: string[],
  categories: string[],
  customerTypes: string[],
  checkoutTypes: string[]
}

export default async function CreateSim({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {

  const { id } = await searchParams;

  let Fulltemplate = {};

  const user = await getAuthenticatedUser();
  if (!user) {
    return notFound();
  };

  const template = await GetFullTemplate(user, id)

  

  return (
    <div className="">
      <Create template={template} />

    </div>
  )
}

const GetFullTemplate = async (user: AuthModel, templateId: string | undefined): Promise<Template> => {

  if (!templateId) {
    return {
      id: "",
      name: "",
      description: "",
      products: [],
      categories: [],
      customerTypes: [],
      checkoutTypes: []
    }
  }

  const pb = new PocketBase(process.env.POCKETBASE_URL!);
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

  let templateRaw: TemplateRaw = {
      id: "",
      name: "",
      description: "",
      products: [],
      categories: [],
      customerTypes: [],
      checkoutTypes: []
    };

  try {
    // Fetch the raw template
    templateRaw = await pb.collection("Templates").getOne(templateId) as TemplateRaw;
  } catch {
    return {
      id: "",
      name: "",
      description: "",
      products: [],
      categories: [],
      customerTypes: [],
      checkoutTypes: []
    }
  }

  // Helper to fetch objects by IDs
  async function fetchObjects(collection: string, ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    // PocketBase doesn't support batch get by IDs, so fetch all and filter
    const all = await pb.collection(collection).getFullList({ filter: `user = "${user!.id}" || default = true` });
    return all.filter((obj: any) => ids.includes(obj.id)) as RecordModel[];
  }

  const products = await fetchObjects("Products", templateRaw.products) as Product[];
  const categories = await fetchObjects("Categories", templateRaw.categories) as ProductCategory[];
  const customerTypes = await fetchObjects("CustomerTypes", templateRaw.customerTypes) as CustomerType[];
  const checkoutTypes = await fetchObjects("CheckoutTypes", templateRaw.checkoutTypes) as Checkout[];

  return {
    id: templateId,
    name: templateRaw.name,
    description: templateRaw.description,
    products,
    categories,
    customerTypes,
    checkoutTypes
  };
}