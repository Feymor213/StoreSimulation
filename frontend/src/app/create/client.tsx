"use client";

import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm, useFormContext, FormProvider, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecordModel } from "pocketbase";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { RunSimulation } from "@/serveractions/simulations";
import { useRouter } from "next/navigation";

export default function CreateSimForm({products, customers, checkouts, ...props}: {products: RecordModel[], customers: RecordModel[], checkouts: RecordModel[]}) {
  const router = useRouter();

  const formSchema = z.object({
    days: z.number().min(1),
    customersPerHour: z.number().min(1),

    products: z.array(z.string().min(1)), // Array of product IDs

    customers: z.array(z.object({
      customerID: z.string().min(1),
      frequency: z.number().min(0).max(1),
    })),

    checkouts: z.array(z.string())
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: 1,
      customersPerHour: 1,
      products: [],
      customers: [],
      checkouts: []
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const isValid = await form.trigger();
    if (isValid) {
      const simData = await RunSimulation(data);
      console.log(simData);
      form.reset();
      if (simData.success) {
        router.push(`/simulation/${simData.created}`);
      }
      else {
        router.refresh();
      }
    }
  };

  const productsSelected = useWatch({
    control: form.control,
    name: "products",
  });

  const customersSelected = useWatch({
    control: form.control,
    name: "customers",
  });

  const checkoutsSelected = useWatch({
    control: form.control,
    name: "checkouts",
  });

  return (
    <FormProvider {...form}>
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-1/4 m-auto"
      >
        <h2 className="font-bold text-3xl mb-4">Create new simulation</h2>
        <FormField 
          control={form.control}
          name="days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount of days</FormLabel>
              <FormControl>
                <Input {...field} type="number" min="1" step="1" onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name="customersPerHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customers per hour</FormLabel>
              <FormControl>
                <Input {...field} type="number" min="1" step="1" onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
            </FormItem>
          )}
        />

        <AddProductForm products={products} />
        {JSON.stringify(productsSelected)}

        <AddCustomerTypeForm customers={customers} />
        {JSON.stringify(customersSelected)}

        <AddCheckoutTypeForm checkouts={checkouts} />
        {JSON.stringify(checkoutsSelected)}

        <Button type="submit" className="w-full mt-4">Run Simulation</Button>
      </form>
    </Form>
    </FormProvider>
  )
}

function AddProductForm({products, ...props}: {products: RecordModel[]}) {

  const { setValue, getValues } = useFormContext(); // Access parent form
    
  const formSchema = z.object({
    product: z.string().min(1), // Array of product IDs
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: ""
    },
  });

  const handleAddProduct = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const newProduct = form.getValues("product");
      const existingProducts = getValues("products");

      setValue("products", [...existingProducts, newProduct]);

      form.reset();
    }
  };


  return (
    <Form {...form}>
    <div className="flex gap-2 justify-between">
      <FormField
        control={form.control}
        name="product"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select product</FormLabel>
            <Select onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <Button type="button" onClick={handleAddProduct}>Add product</Button>
    </div>
    </Form>
  )
}

function AddCustomerTypeForm({customers, ...props}: {customers: RecordModel[]}) {
  const { setValue, getValues } = useFormContext(); // Access parent form
    
  const formSchema = z.object({
    customerID: z.string().min(1),
    frequency: z.number().min(0).max(1),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerID: "",
      frequency: 0
    },
  });

  const handleAddProduct = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const newCustomer = form.getValues();
      const existingCustomers = getValues("customers");

      setValue("customers", [...existingCustomers, newCustomer]);

      form.reset();
    }
  };

  return (
    <Form {...form}>
    <div className="flex gap-2 justify-between">
      <FormField
        control={form.control}
        name="customerID"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select customer</FormLabel>
            <Select onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <FormField 
        control={form.control}
        name="frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Set frequency</FormLabel>
            <FormControl>
              <Input {...field} type="number" min="0" max="1" step="0.1" onChange={(e) => field.onChange(Number(e.target.value))} />
            </FormControl>
          </FormItem>
        )}
      />
      <Button type="button" onClick={handleAddProduct}>Add customer</Button>
    </div>
    </Form>
  )
}

function AddCheckoutTypeForm({checkouts, ...props}: {checkouts: RecordModel[]}) {
  const { setValue, getValues } = useFormContext(); // Access parent form
    
  const formSchema = z.object({
    checkoutID: z.string().min(1),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkoutID: "",
    },
  });

  const handleAddCheckout = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const newCheckout = form.getValues("checkoutID");
      const existingCheckouts = getValues("checkouts");

      setValue("checkouts", [...existingCheckouts, newCheckout]);

      form.reset();
    }
  };

  return (
    <Form {...form}>
    <div className="flex gap-2 justify-between">
      <FormField
        control={form.control}
        name="checkoutID"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select checkout</FormLabel>
            <Select onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Checkout" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {checkouts.map((checkout) => (
                  <SelectItem key={checkout.id} value={checkout.id}>
                    {checkout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <Button type="button" onClick={handleAddCheckout}>Add checkout</Button>
    </div>
    </Form>
  )
}