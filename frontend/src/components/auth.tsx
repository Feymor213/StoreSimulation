'use client';

import React, { useState, useEffect, HTMLProps, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Register, Logout, Login } from "@/serveractions/auth";
import Link from "next/link";
import z from 'zod'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3, "Username must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 8 characters"),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

function LoginForm({formSwitchHandler, ...props}: 
  {formSwitchHandler: Dispatch<SetStateAction<"login" | "register">>} 
  & HTMLProps<HTMLDivElement>
) {
  
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {

    const res = await Login(values.email, values.password);

    if (res.success) setSuccess(true);
    else setFailure(true);
  };

  if (success) {
    // router.refresh();
    toast("Successfully logged in!");
  }

  if (failure) {
    toast("Wrong credentials!");
    // router.refresh();
  }

  return (
    <div {...props}>
      <Card className="w-full h-full flex flex-col justify-center items-center">
      <CardHeader>
        <CardTitle>Log into your account</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col space-y-4 w-full">

            <FormField 
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" onChange={(e) => field.onChange(e.target.value)} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField 
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" onChange={(e) => field.onChange(e.target.value)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <span className="text-sm">
          Don't have an account yet?
          <Button className="px-1" variant={'link'} onClick={() => {formSwitchHandler('register')}}>Sign up</Button>
        </span>
      </CardFooter>
      </Card>
    </div>
  );  
}

function RegisterForm({formSwitchHandler, ...props}: 
  {formSwitchHandler: Dispatch<SetStateAction<"login" | "register">>} 
  & HTMLProps<HTMLDivElement>
) {

  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirm: ""
    },
  });

  const handleSubmit = async (values: z.infer<typeof registerSchema>) => {

    console.log(values);

    const res = await Register(values.email, values.username, values.password, values.passwordConfirm);
    
    router.refresh();
    if (res.success) setSuccess(true);
    else setFailure(true);
  };

  useEffect(() => {
    if (success) {
      console.log("Registered successfully");
      router.refresh();
      toast("Registered successfully.");
    }
    if (failure) {
      console.log("Registration failed! Try another email.")
      toast("Registration failed! Try another email.");
      router.refresh();
    }
  }, [success]);
  
  return (
    <div {...props}>
      <Card className="w-full h-full flex flex-col justify-center items-center"> 
        <CardHeader>
          <CardTitle>Create a new account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col space-y-4 w-full">
              <FormField 
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">Register</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
        <span className="text-sm">
          Already have an account?
          <Button className="px-1" variant={'link'} onClick={() => {formSwitchHandler('login')}}>Log in</Button>
        </span>
        </CardFooter>
      </Card>
    </div>
  );
}

export { RegisterForm, LoginForm };