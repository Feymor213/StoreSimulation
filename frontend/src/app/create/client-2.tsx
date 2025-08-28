'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Edit } from "lucide-react";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { RunSimulation } from "@/serveractions/simulations";
import { useRouter } from "next/navigation";

const simulationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  days: z.number().min(1, "Must be at least 1 day").max(365, "Maximum 365 days"),
  customersPerHour: z.number().min(1, "Must be at least 1 customer per hour").max(1000, "Maximum 1000 customers per hour"),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  category: z.string(),
});

const customerTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  impulsivity:  z.number().min(0).max(1),
  patience: z.number().min(0).max(100).int(),
  categoryInterests: z.record(z.number().min(0).max(1)).optional(),
  productInterests: z.record(z.number().min(0).max(1)).optional(),
});

export interface Template {
  id: string,
  name: string,
  description: string,
  products: Product[],
  categories: ProductCategory[],
  customerTypes: CustomerType[],
  checkoutTypes: Checkout[]
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
}

export interface CustomerType {
  id: string;
  name: string;
  description?: string;
  impulsivity: number;
  patience: number;
  categoryInterests?: Record<string, number>;
  productInterests?: Record<string, number>;
}

export interface Checkout {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  humanCost: number;
  technicalCost: number
}

// const defaultCategories: ProductCategory[] = [
//   { id: "1", name: "Beverages", description: "Hot and cold drinks" },
//   { id: "2", name: "Food", description: "Sandwiches and meals" },
//   { id: "3", name: "Snacks", description: "Quick snacks and treats" },
// ];

// const defaultProducts: Product[] = [
//   { id: "1", name: "Coffee", price: 2.50, description: "Hot coffee", categoryId: "1" },
//   { id: "2", name: "Sandwich", price: 5.99, description: "Fresh sandwich", categoryId: "2" },
//   { id: "3", name: "Pastry", price: 3.25, description: "Sweet pastry", categoryId: "3" },
// ];

// const defaultCustomerTypes: CustomerType[] = [
//   { 
//     id: "1", 
//     name: "Regular", 
//     description: "Average customer",
//     categoryInterests: { "1": 50, "2": 60, "3": 40 },
//     productInterests: {}
//   },
//   { 
//     id: "2", 
//     name: "Premium", 
//     description: "High-spending customer",
//     categoryInterests: { "1": 80, "2": 90, "3": 70 },
//     productInterests: {}
//   },
//   { 
//     id: "3", 
//     name: "Budget", 
//     description: "Price-conscious customer",
//     categoryInterests: { "1": 30, "2": 40, "3": 60 },
//     productInterests: {}
//   },
// ];

// const defaultCheckouts: Checkout[] = [
//   { id: "1", name: "Self-Service", description: "Automated checkout" },
//   { id: "2", name: "Cashier 1", description: "Main cashier station" },
//   { id: "3", name: "Express Lane", description: "Quick checkout for small orders" },
// ];

export default function Create({template}: {template: Template}) {
  const [categories, setCategories] = useState<ProductCategory[]>(template.categories);
  const [products, setProducts] = useState<Product[]>(template.products);
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>(template.customerTypes);
  const [checkouts, setCheckouts] = useState<Checkout[]>(template.checkoutTypes);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<"category" | "product" | "customer" | "checkout" | null>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof simulationSchema>>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      days: 7,
      customersPerHour: 10,
    },
  });

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  const customerForm = useForm<z.infer<typeof customerTypeSchema>>({
    resolver: zodResolver(customerTypeSchema),
  });

  const onSubmit = async (values: z.infer<typeof simulationSchema>) => {
    const simulationData = {
      name: values.name,
      description: values.description,
      days: values.days,
      customersPerHour: values.customersPerHour,
      products: products.map(p => p.id),
      customers: customerTypes.map(c => ({
        customerID: c.id,
        frequency: 1 / customerTypes.length // Auto assign frequency
      })),
      checkouts: checkouts.map(c => c.id)
    };

    const result = await RunSimulation(simulationData);
    if (result.success) {
      toast("Simulation created successfully!");
      router.push(`/simulation`);
    } else {
      toast("Simulation creation failed");
    }
  };

  const handleAddItem = (type: "category" | "product" | "customer" | "checkout") => {
    setDialogType(type);
    setEditingItem(null);
    if (type === "customer") {
      customerForm.reset({
        name: "",
        description: "",
        categoryInterests: Object.fromEntries(categories.map(c => [c.id, 0.5])),
        productInterests: Object.fromEntries(products.map(p => [p.id, 0.5])),
      });
    } else {
      productForm.reset();
    }
  };

  const handleEditItem = (item: any, type: "category" | "product" | "customer" | "checkout") => {
    setDialogType(type);
    setEditingItem(item);
    if (type === "customer") {
      customerForm.reset({
        ...item,
        categoryInterests: item.categoryInterests || Object.fromEntries(categories.map(c => [c.id, 0.5])),
        productInterests: item.productInterests || Object.fromEntries(products.map(p => [p.id, 0.5])),
      });
    } else {
      productForm.reset(item);
    }
  };

  const handleDeleteItem = (id: string, type: "category" | "product" | "customer" | "checkout") => {
    if (type === "category") {
      setCategories(categories.filter(c => c.id !== id));
      // Remove category from products
      setProducts(products.map(p => ({ ...p, categoryId: p.category === id ? undefined : p.category })));
    } else if (type === "product") {
      setProducts(products.filter(p => p.id !== id));
    } else if (type === "customer") {
      setCustomerTypes(customerTypes.filter(c => c.id !== id));
    } else {
      setCheckouts(checkouts.filter(c => c.id !== id));
    }
    toast("Item deleted successfully");
  };

  const onItemSubmit = (values: z.infer<typeof productSchema>) => {
    const newItem = {
      ...values,
      id: editingItem?.id || Date.now().toString(),
    };

    if (dialogType === "category") {
      if (editingItem) {
        setCategories(categories.map(c => c.id === editingItem.id ? newItem as ProductCategory : c));
      } else {
        setCategories([...categories, newItem as ProductCategory]);
      }
    } else if (dialogType === "product") {
      if (editingItem) {
        setProducts(products.map(p => p.id === editingItem.id ? newItem as Product : p));
      } else {
        setProducts([...products, { ...newItem, price: values.price || 0 } as Product]);
      }
    } else if (dialogType === "checkout") {
      if (editingItem) {
        setCheckouts(checkouts.map(c => c.id === editingItem.id ? newItem as any : c));
      } else {
        setCheckouts([...checkouts, newItem as any]);
      }
    }

    setDialogType(null);
    setEditingItem(null);
    toast(`${editingItem ? "Updated" : "Added"} successfully`);
  };

  const onCustomerSubmit = (values: z.infer<typeof customerTypeSchema>) => {
    const newCustomer = {
      ...values,
      id: editingItem?.id || Date.now().toString(),
    };

    if (editingItem) {
      setCustomerTypes(customerTypes.map(c => c.id === editingItem.id ? newCustomer as CustomerType : c));
    } else {
      setCustomerTypes([...customerTypes, newCustomer as CustomerType]);
    }

    setDialogType(null);
    setEditingItem(null);
    toast(`${editingItem ? "Updated" : "Added"} successfully`);
  };

  const renderItemsList = (items: any[], type: "category" | "product" | "customer" | "checkout", title: string) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Manage your {title.toLowerCase()}</CardDescription>
          </div>
          <Button onClick={() => handleAddItem(type)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  {item.price && <Badge variant="secondary">${item.price}</Badge>}
                  {type === "product" && item.categoryId && (
                    <Badge variant="outline">
                      {categories.find(c => c.id === item.categoryId)?.name || "Unknown"}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditItem(item, type)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id, type)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Simulation</h1>
            <p className="text-muted-foreground mt-2">
              Set up your store simulation with custom parameters and templates
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Simulation Parameters</CardTitle>
              <CardDescription>Configure the basic settings for your simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Simulation name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short description</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Simulation Duration (Days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customersPerHour"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customers per Hour</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {renderItemsList(categories, "category", "Product Categories")}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderItemsList(products, "product", "Products")}
            {renderItemsList(customerTypes, "customer", "Customer Types")}
          </div>

          {renderItemsList(checkouts, "checkout", "Checkouts")}

          <div className="flex justify-end">
            <Button onClick={form.handleSubmit(onSubmit)} size="lg">
              Create Simulation
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={dialogType !== null} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"} {
                dialogType === "category" ? "Category" :
                dialogType === "product" ? "Product" : 
                dialogType === "customer" ? "Customer Type" : 
                "Checkout"
              }
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Update" : "Create a new"} {dialogType} for your simulation
            </DialogDescription>
          </DialogHeader>
          
          {dialogType === "customer" ? (
            <Form {...customerForm}>
              <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                <FormField
                  control={customerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {categories.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Category Interest Levels (0-100%)</h4>
                    {categories.map((category) => (
                      <FormField
                        key={category.id}
                        control={customerForm.control}
                        name={`categoryInterests.${category.id}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex justify-between">
                              {category.name}
                              <span className="text-sm text-muted-foreground">
                                {Math.floor(field.value*100) || 0}%
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={1}
                                step={0.01}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                )}

                {products.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Individual Product Interest Levels (0-100%)</h4>
                    <div className="max-h-48 overflow-y-auto space-y-3">
                      {products.map((product) => (
                        <FormField
                          key={product.id}
                          control={customerForm.control}
                          name={`productInterests.${product.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex justify-between">
                                {product.name}
                                <span className="text-sm text-muted-foreground">
                                  {Math.floor(field.value*100) || 0}%
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={1}
                                  step={0.01}
                                  value={[field.value]}
                                  onValueChange={(values) => field.onChange(values[0])}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogType(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onItemSubmit)} className="space-y-4">
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {dialogType === "product" && (
                  <>
                    <FormField
                      control={productForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogType(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}