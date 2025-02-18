'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <LoginForm />
      <p className="text-sm">Don't have an account yet?<Button className="px-1" variant={'link'} onClick={() => router.push('/register')}>Sign up</Button></p>
    </div>
  )
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });

    router.refresh();
    if (res.status === 200) setSuccess(true);
    else setFailure(true);

    const data = await res.json();
  };

  if (success) {
    return (
      <div className='bg-green-100 flex flex-col gap-8 px-32 py-16 rounded-sm'>
        <h3 className="text-xl"><strong>Login successful!</strong></h3>
        <Button onClick={() => {router.push('/')}}>To Home</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-[30%]" action="/login">
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
  );  
}
