'use server';
import PocketBase from 'pocketbase';
import { getAuthenticatedUser } from '@/lib/auth';
import { CustomerData, NewCheckoutData, ParameterDeleteAsync } from '@/lib/types';

export async function CreateCategory(name: string) {
  try {
    const pb = new PocketBase("http://127.0.0.1:8090");
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);
    const user = await getAuthenticatedUser();

    if (!user) throw new Error("User authentication failed");

    const newCategoryData = {
        user: user.id,
        Name: name,
        default: false
    }
    const newCategory = await pb.collection('Categories').create(newCategoryData);

    return {success: true, category: newCategory}
  } catch (error) {
    console.log(error);
    return {success: false, message: error}
  }
}
export const DeleteCategory: ParameterDeleteAsync = async (id: string) => {
  try {
    const pb = new PocketBase("http://127.0.0.1:8090");
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User authentication failed");

    const category = await pb.collection("Categories").getOne(id)
    if ((category.user !== user.id) || category.default) throw new Error("No permissions to delete this record")

    await pb.collection('Categories').delete(id);
    return {success: true};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
}

export async function CreateProduct(categoryId: string, name: string, price: number) {
  try {
    const pb = new PocketBase("http://127.0.0.1:8090");
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);
    const user = await getAuthenticatedUser();

    if (!user) throw new Error("User authentication failed");

    const newProductData = {
        user: user.id,
        category: categoryId,
        Name: name,
        Price: price,
        default: false
    }
    const newProduct = await pb.collection('Products').create(newProductData);

    return {success: true, product: newProduct}
  } catch (error) {
    console.log(error);
    return {success: false}
  }
}
export async function DeleteProduct(id: string) {
  try {
    const pb = new PocketBase("http://127.0.0.1:8090");
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User authentication failed");

    const product = await pb.collection("Products").getOne(id)
    if ((product.user !== user.id) || product.default) throw new Error("No permissions to delete this record")

    await pb.collection('Products').delete(id);
    return {success: true};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
}

export async function CreateCustomer(customerData: CustomerData) {
  try {
    const pb = new PocketBase("http://127.0.0.1:8090");
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);
    const user = await getAuthenticatedUser();

    if (!user) throw new Error("User authentication failed");

    const newCustomerData = {
      user: user.id,
      Name: customerData.customer.name,
      impulsivity: customerData.customer.impulsivity,
      patience: customerData.customer.patience,
      default: false
    }
    const newCustomer = await pb.collection('CustomerTypes').create(newCustomerData);

    // Create interest records
    const categoryPromises = customerData.interestsCategory.map(async (interest) => {
      const newInterestCategoryData = {
        category: interest.categoryID,
        customer: newCustomer.id,
        interest: interest.interest
      };
      await pb.collection('interestsCategory').create(newInterestCategoryData, { requestKey: null })
    });

    const productPromises = customerData.interestsProduct.map(async (interest) => {
      const newInterestCategoryData = {
        category: interest.productID,
        customer: newCustomer.id,
        interest: interest.interest
      };
      await pb.collection('interestsProduct').create(newInterestCategoryData, { requestKey: null })
    });

    // Wait until all records are created
    await Promise.all([...categoryPromises, ...productPromises]);

    return {success: true, customer: newCustomer};

  } catch (error) {
    console.log(error);
    return {success: false}
  }
}
export async function DeleteCustomer(id: string) {
  try {
    const pb = new PocketBase("http://127.0.0.1:8090");
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User authentication failed");

    const customer = await pb.collection("CustomerTypes").getOne(id)
    if ((customer.user !== user.id) || customer.default) throw new Error("No permissions to delete this record")

    await pb.collection('CustomerTypes').delete(id);
    return {success: true};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
}

export async function CreateCheckoutType(data: NewCheckoutData) {
  try {
      const pb = new PocketBase("http://127.0.0.1:8090");
      await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);
      const user = await getAuthenticatedUser();

      if (!user) throw new Error("User authentication failed");

      const newCheckoutData = {
          ...data,
          user: user.id,
          default: false
      }
      const newCheckout = await pb.collection('CheckoutTypes').create(newCheckoutData);

      return {success: true, checkout: newCheckout};

  } catch (error) {
      console.log(error);
      return {success: false}
  }
}
export async function DeleteCheckoutType(id: string) {
  try {
    const pb = new PocketBase("http://127.0.0.1:8090");
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User authentication failed");

    const checkout = await pb.collection("CheckoutTypes").getOne(id)
    if ((checkout.user !== user.id) || checkout.default) throw new Error("No permissions to delete this record")

    await pb.collection('CheckoutTypes').delete(id);
    return {success: true};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
}