"use client";

import React from "react";
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,  } from "@/components/ui/form";
import { useForm, useFormContext, FormProvider, useWatch } from "react-hook-form";
import { RecordModel } from "pocketbase";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCustomer } from "./serveractions";
import * as z from "zod";


export function CreateCustomerForm({categories, products}: {categories: RecordModel[], products: RecordModel[]}) {
  const router = useRouter();

  const interestsCategorySchema = z.object({
    categoryID: z.string().min(15), // ID length validation
    interest: z.number()
  });

  const interestsProductSchema = z.object({
    productID: z.string().min(15), // ID length validation
    interest: z.number()
  })

  const formSchema = z.object({
    customer: z.object({
      name: z.string().min(1),
      impulsivity: z.number().min(0).max(1),
      patience: z.number().min(0).max(100),
      default: z.boolean(),
    }),
    interestsCategory: z.array(interestsCategorySchema),
    interestsProduct: z.array(interestsProductSchema),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: {
        name: "",
        impulsivity: 0,
        patience: 100,
        default: false,
      },
      interestsCategory: [],
      interestsProduct: [],
    },
  });
  const interestsCategorySelected = useWatch({
    control: form.control,
    name: "interestsCategory",
  });

  const interestsProductSelected = useWatch({
    control: form.control,
    name: "interestsProduct",
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const isValid = await form.trigger();
    if (isValid) {
      await CreateCustomer(data);
      form.reset();
      router.refresh();
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4 max-w-xl mt-8 mx-auto p-4 border border-gray-200 rounded-lg shadow-sm"
        >
          <h2 className="text-lg font-semibold">Customer Form</h2>
          <FormField
            control={form.control}
            name="customer.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter customer name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customer.impulsivity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impulsivity</FormLabel>
                <FormControl>
                  <Input
                      {...field}
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Enter impulsivity" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customer.patience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patience</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} placeholder="Enter patience" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hidden field */}
          <FormField
            control={form.control}
            name="customer.default"
            render={({ field }) => (
              <Input type="hidden"/>
            )}
          />

          <div>
            <h4 className="font-bold">Category interests</h4>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {interestsCategorySelected.map((interest, key) => {
                const category = categories.find((cat) => cat.id === interest.categoryID)!;
                return (
                  <div key={key} className="bg-white flex justify-between items-center p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h6>{category.Name}</h6>
                    <p>{interest.interest}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="font-bold">Product interests</h4>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {interestsProductSelected.map((interest, key) => {
                const product = products.find((prod) => prod.id === interest.productID)!;
                return (
                  <div key={key} className="bg-white flex justify-between items-center p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h6>{product.Name}</h6>
                    <p>{interest.interest}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <AddProductInterestForm products={products} />
          <AddCategoryInterestForm categories={categories} />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}
  
  function AddProductInterestForm({ products }: { products: RecordModel[] }) {
    const { setValue, getValues } = useFormContext(); // Access parent form
  
    const formSchema = z.object({
      productID: z.string().min(15),
      interest: z.number(),
    });
  
    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
        productID: "",
        interest: 0,
      },
    });
  
    const handleAddInterest = async () => {
      const isValid = await form.trigger();
      if (isValid) {
        const newInterest = form.getValues();
        const existingInterests = getValues("interestsProduct");
  
        setValue("interestsProduct", [...existingInterests, newInterest]);
  
        form.setValue("productID", "");
        form.reset();
      }
    };
  
    return (
      <Form {...form}>
        <div className="flex gap-2 justify-between">
          <FormField
            control={form.control}
            name="productID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
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
          <FormField
            control={form.control}
            name="interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="button" className="mt-2" onClick={handleAddInterest}>
          Add interest
        </Button>
      </Form>
    );
  }
  
  function AddCategoryInterestForm({ categories }: { categories: RecordModel[] }) {
    const { setValue, getValues } = useFormContext(); // Access parent form
  
    const formSchema = z.object({
      categoryID: z.string().min(15),
      interest: z.number(),
    });
  
    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
        categoryID: "",
        interest: 0,
      },
    });
  
    const handleAddInterest = async () => {
      const isValid = await form.trigger();
      if (isValid) {
        const newInterest = form.getValues();
        const existingInterests = getValues("interestsCategory");
  
        setValue("interestsCategory", [...existingInterests, newInterest]);
  
        form.setValue("categoryID", "");
        form.reset();
      }
    };
  
    return (
      <Form {...form}>
        <div className="flex gap-2 justify-between">
          <FormField
            control={form.control}
            name="categoryID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((categories) => (
                      <SelectItem key={categories.id} value={categories.id}>
                        {categories.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="button" className="mt-2" onClick={handleAddInterest}>
          Add interest
        </Button>
      </Form>
    );
  }