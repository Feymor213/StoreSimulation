'use client';

import React, { useState, useEffect, HTMLProps, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Register, Logout, Login } from "@/serveractions/auth";
import Link from "next/link";

function LoginForm({formSwitchHandler, ...props}: 
  {formSwitchHandler: Dispatch<SetStateAction<"login" | "register">>} 
  & HTMLProps<HTMLDivElement>
) {
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await Login(email, password);

    router.refresh();
    if (res.success) setSuccess(true);
    else setFailure(true);
  };

  if (success) {
    return (
      <div className='bg-green-100 flex flex-col gap-8 px-32 py-16 rounded-sm'>
        <h3 className="text-xl"><strong>Login successful!</strong></h3>
        <Link href='/'><Button>To Home</Button></Link>
      </div>
    )
  }

  return (
    <div {...props}>
      <Card className="w-full h-full flex flex-col justify-center items-center">
      <CardHeader>
        <CardTitle>Log into your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full" action="/login">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`p-2 border ${failure ? "border border-red-500" : ""}`}
              autoComplete="email"
            />
            {failure && <p className='text-xs pl-1 text-red-500'>Invalid credentials</p>}
          </div>
          <div>
          <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`p-2 border ${failure ? "border border-red-500" : ""}`}
              autoComplete="current-password"
            />
            {failure && <p className='text-xs pl-1 text-red-500'>Invalid credentials</p>}
          </div>
          <Button type="submit" className="">
            Login
          </Button>
        </form>
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
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await Register(email, username, password, passwordConfirm);

    if (res.success) {
      setSuccess(true);
    } else {
      setFailure(true);
    }

    setMessage(res.message);
  };

  if (success) {
    return (
      <div className="bg-green-100 flex flex-col gap-8 px-32 py-16 rounded-sm">
        <h3 className="text-xl"><strong>Registration successful!</strong></h3>
        <Link href='/login'><Button>Go to Login</Button></Link>
      </div>
    );
  }

  return (
    <div {...props}>
      <Card className="w-full h-full flex flex-col justify-center items-center"> 
        <CardHeader>
          <CardTitle>Create a new account</CardTitle>
        </CardHeader>
        <CardContent> 
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full" action="/register">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`p-2 border ${failure ? "border-red-500" : ""}`}
                autoComplete="email"
                id="email"
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`p-2 border ${failure ? "border-red-500" : ""}`}
                autoComplete="off"
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`p-2 border ${failure ? "border-red-500" : ""}`}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Input
                type="password"
                name="confirm-password"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className={`p-2 border ${failure ? "border-red-500" : ""}`}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit">Register</Button>
            {failure && <p className="text-xs pl-1 text-red-500">{message || "Registration failed"}</p>}
          </form>
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

function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLogout = async () => {
    const res = await Logout();
    console.log(res.success)
    if (res.success) {
      document.cookie = "pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"; // Manually remove the cookie on the client side
    }
    else {
      setError(true);
    }
    
    router.refresh();
    setLoading(false);
  };

  // Logout the user immediately when the page is opened
  useEffect(() => {
    handleLogout();
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center">
        <span>Logging you out</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen flex justify-center items-start">
        <span className="p-3 bg-red-300 border border-red-500 rounded-md">An error occurred while logging out. Please try again.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">You have been logged out</h1>
      <Button onClick={() => {router.push("/")}} className="text-base px-12">Home</Button>
      <Button onClick={() => {router.push("/login")}} className="text-base px-12">Login</Button>
    </div>
  );
}

export { RegisterForm, LogoutPage, LoginForm };