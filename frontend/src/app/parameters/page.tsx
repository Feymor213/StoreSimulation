import PocketBase, { RecordModel } from 'pocketbase';
import { getAuthenticatedUser } from "@/lib/auth";
import { DeleteCategoryButton, LoginText, CreateCategoryForm, CreateProductForm, CreateCheckoutForm } from './client';
import { CreateCustomerForm } from './customersforms';
import { CustomerData, interestsCategory, interestsProduct } from "@/lib/types"

export default async function DashboardPage() {
  const pb = new PocketBase("http://127.0.0.1:8090");
  await pb.collection("_superusers").authWithPassword("admin@admin.com", "adminadmin");

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto flex flex-col gap-10">
        {!user && <LoginText />}
        <div>
          <h2 className='text-4xl font-bold pb-4'>Categories</h2>
          <Categories categories={categories} />
          {user && <CreateCategoryForm />}
        </div>
        <div>
          <h2 className='text-4xl font-bold pb-4'>Products</h2>
          <Products products={products} categories={categories} />
          {user && <CreateProductForm categories={categories} />}
        </div>
        <div>
          <h2 className='text-4xl font-bold pb-4'>Customer types</h2>
          <Customers customers={customers} pb={pb} />
          {user && <CreateCustomerForm categories={categories} products={products}/>}
        </div>
        <div>
          <h2 className='text-4xl font-bold pb-4'>Checkout types</h2>
          <Checkouts checkouts={checkouts} />
          {user && <CreateCheckoutForm />}
        </div>
      </div>
    </div>
  );
}

function Categories({categories}: {categories: RecordModel[]}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((category, key) => Category(category, key))}
    </div>
  )
}
function Category(category: RecordModel, key: number) {
  return (
    <div className="bg-white flex justify-between items-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" key={key}>
      <h3 className="text-xl font-semibold text-gray-700">{category.Name}</h3>
      <DeleteCategoryButton id={category.id} inactive={category.default} />
    </div>
  );
}

function Products({products, categories}: {products: RecordModel[], categories: RecordModel[]}) {
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product, key) => {
        const categoryName = categories.find(category => category.id === product.category)!.Name;
        return Product(product, categoryName, key)
      })}
    </div>
  )
}
function Product(product: RecordModel, categoryName: string, key: number) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" key={key}>
      <h3 className="text-xl font-semibold text-gray-700">{product.Name}</h3>
      <p>Category: {categoryName}</p>
      <p>Price: {product.Price}</p>
    </div>
  );
}

async function Customers({customers, pb, ...props}: {customers: RecordModel[], pb: PocketBase}) {

  // Amazing data processing
  async function fetchCustomerData(customers: RecordModel[]): Promise<CustomerData[]> {
    // Fetch interests category and product data
    const interestsCategoryAll = await pb.collection("interestsCategory").getFullList();
    const interestsProductsAll = await pb.collection("interestsProduct").getFullList();
    return await Promise.all(
      customers.map(async (customer) => {
        // Extract data from model into an object
        const customerData = {
          user: customer.user,
          name: customer.Name,
          impulsivity: customer.impulsivity,
          patience: customer.patience,
          default: customer.default
        } 

        // Filter interests for current customer
        const interestsCategoryRaw = interestsCategoryAll.filter(interest => interest.customer === customer.id)
        const interestsProductRaw = interestsProductsAll.filter(interest => interest.customer === customer.id)
  
        // Transform interestsCategoryRaw into a dictionary { categoryId: interest }
        const interestsCategory: interestsCategory[] = interestsCategoryRaw.map(record => ({
          categoryID: record.category,
          interest: record.interest
        }));
  
        // Transform interestsProductRaw into a dictionary { productId: interest }
        const interestsProduct: interestsProduct[] = interestsProductRaw.map(record => ({
          productID: record.product,
          interest: record.interest
        }));
  
        return {
          customer: customerData,
          interestsCategory,
          interestsProduct
        };
      })
    );
  }

  const customerData = await fetchCustomerData(customers);

  const renderedCustomers = customerData.map((data, key) => Customer(data, key));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {renderedCustomers}
    </div>
  )
}

function Customer(customerData: CustomerData, key: number) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" key={key}>
      <h3 className="text-xl font-semibold text-gray-700">{customerData.customer.name}</h3>
      <p>Impulsivity: {customerData.customer.impulsivity}</p>
      <p>Patience: {customerData.customer.patience}</p>
    </div>
  )
}

function Checkouts({checkouts, ...props}: {checkouts: RecordModel[]}) {
  return (
    <div className='grid grid-cols-4 gap-2'>
      {checkouts.map((checkout, key) => Checkout(checkout, key))}
    </div>
  )
}

function Checkout(checkout: RecordModel, key: number) {
  return (
    <div className='className="bg-white flex flex-col p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 mb-4' key={key}>
      <h4 className='font-semibold'>{checkout.name}</h4>
      <p>Capacity: {checkout.capacity}</p>
      <p>Human cost: {checkout.humanCost}</p>
      <p>Technical cost: {checkout.technicalCost}</p>
    </div>
  )
}
