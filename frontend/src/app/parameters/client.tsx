'use client';

import React from "react"; 
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,  } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { RecordModel } from "pocketbase";
import { GoTrash } from "react-icons/go";
import { CreateCategory, CreateProduct, CreateCheckoutType } from './serveractions';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ParameterDeleteAsync } from "@/lib/types";

export function LoginText() {
  const router = useRouter();
  return (
    <div className="bg-red-100 p-4 mb-8 text-center rounded-lg">
      <Button className="text-base" variant={'link'} onClick={() => router.push('/login')}>Log in to have the full functionality</Button>
    </div>
  )
}

export function CreateCategoryForm({ ...props }) {
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(1, "Category name is required"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const isValid = await form.trigger();
    if (isValid) {
      await CreateCategory(data.name);
      form.reset();
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form {...props} onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4 max-w-xl mt-8 mx-auto p-4 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold">Create New Category</h2>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter category name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Category
        </Button>
      </form>
    </Form>
  );
}
export function DeleteButton({id, callback, inactive=false, ...props}: {id: string, callback: ParameterDeleteAsync, inactive?: boolean}) {
  if (inactive) return <GoTrash size={20} className='text-gray-300' />

  const router = useRouter();
  return(
    <GoTrash
      className='cursor-pointer hover:text-red-400'
      size={20}
      onClick={() => {
        callback(id);
        router.refresh();
      }}/>
  )
}

export function CreateProductForm({ categories }: { categories: RecordModel[] }) {
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.number().min(0, "Price must be a positive number"),
    categoryId: z.string().min(1, "Category is required"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      categoryId: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const isValid = await form.trigger();
    if (isValid) {
      await CreateProduct(data.categoryId, data.name, data.price);
      form.reset();
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4 max-w-xl mt-8 mx-auto p-4 border border-gray-200 rounded-lg shadow-sm"
      >
        <h2 className="text-lg font-semibold">Create New Product</h2>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter product name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} placeholder="Enter price" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Product
        </Button>
      </form>
    </Form>
  );
}

export function CreateCheckoutForm({...props}) {
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(1, "Checkout name is required"),
    capacity: z.number().min(1, "Capacity must be a positive number").multipleOf(1, "Capacity must be an integer"),
    humanCost: z.number().min(1, "Human cost must be a positive number").multipleOf(1, "Human cost must be an integer"),
    technicalCost: z.number().min(1, "Technical cost must be a positive number").multipleOf(1, "Technical cost must be an integer"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      capacity: 1,
      humanCost: 1,
      technicalCost: 1,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const isValid = await form.trigger();
    if (isValid) {
      await CreateCheckoutType(data);
      form.reset();
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4 max-w-xl mt-8 mx-auto p-4 border border-gray-200 rounded-lg shadow-sm"
      >
        <h2 className="text-lg font-semibold">Create checkout type</h2>
        <FormField 
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checkout name</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="Checkout name"/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField 
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Capacity"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField 
          control={form.control}
          name="humanCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Human cost</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Human cost"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField 
          control={form.control}
          name="technicalCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical cost</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Technical cost"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-4">Create checkout type</Button>
      </form>
    </Form>
  )
}
