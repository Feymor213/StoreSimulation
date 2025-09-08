'use server'

import { getAuthenticatedUser } from '@/lib/auth';
import { StandardAPIResponse } from '@/lib/types/types';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import PocketBase from "pocketbase";

async function Register(email: string, name: string, password: string, passwordConfirm: string): Promise<StandardAPIResponse> {
  const pb = new PocketBase("http://127.0.0.1:8090/");
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

  const data = {
    "password": password,
    "passwordConfirm": passwordConfirm,
    "email": email,
    "emailVisibility": true,
    "name": name
  };

  try {
    const newUser = await pb.collection("users").create(data);

    return {success: true, message: "Registration successful", user: newUser }
  } catch (error: any) {
    console.error(error);
    return {success: false, message: "Registration failed" }
  }
}

async function Login(email: string, password: string): Promise<StandardAPIResponse> {
  const pb = new PocketBase(process.env.POCKETBASE_URL!);
  const cookieStorage = await cookies();

  try {
    const authData = await pb.collection("users").authWithPassword(email, password);

    const token = authData.token;

    SetCookies(cookieStorage, token);

    return {success: true, message: "Login successful"};
  }
  catch (error) {
    console.error(error);
    return {success: false, message: "Invalid credentials"};
  }
}

async function Logout(): Promise<StandardAPIResponse> {

  const cookieStorage = await cookies();

  try {
    cookieStorage.delete("pb_auth");
    return {success: true, message: "Logout successful"};
  }
  catch (error) {
    console.error(error);
    return {success: false, message: "Logout failed"};
  }
}

async function UpdateUser(email: string, name: string): Promise<StandardAPIResponse> {
  
  const user = await getAuthenticatedUser();
  if (!user) {
    return {success: false, message: "User not authenticated"};
  }

  const pb = new PocketBase(process.env.POCKETBASE_URL!);
  try{
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

    await pb.collection("users").update(user.id, {
      email: email,
      name: name
    });

    return {success: true, message: "User updated successfully"};
  }
  catch (error) {
    console.error(error);
    return {success: false, message: "User update failed"};
  }  
}

async function UpdateUserPassword(password: string, passwordConfirm: string): Promise<StandardAPIResponse> {

  if (password !== passwordConfirm) {
    return {success: false, message: "Passwords do not match"};
  }
  
  const user = await getAuthenticatedUser();
  if (!user) {
    return {success: false, message: "User not authenticated"};
  }

  const pb = new PocketBase(process.env.POCKETBASE_URL!);
  try{
    await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);

    await pb.collection("users").update(user.id, {
      password: password,
      passwordConfirm: passwordConfirm
    });

    return {success: true, message: "Password updated successfully"};
  }
  catch (error) {
    console.error(error);
    return {success: false, message: "Password update failed"};
  }  
}

function SetCookies(cookieStorage: ReadonlyRequestCookies, token: string) {
  // Set secure HTTP-only cookie
    cookieStorage.set("pb_auth", token, {
      httpOnly: true, // Prevent client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "strict", // Prevent CSRF
      maxAge: 60 * 60 * 24, // 1 day expiry
    });
}

export { Register, Login, Logout, UpdateUser, UpdateUserPassword };
