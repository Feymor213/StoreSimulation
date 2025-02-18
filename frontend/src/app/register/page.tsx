'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <RegisterForm />
      <p className="text-sm">
        Already have an account? 
        <Button className="px-1" variant="link" onClick={() => router.push('/login')}>
          Sign in
        </Button>
      </p>
    </div>
  );
}

function RegisterForm() {
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

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, passwordConfirm }),
    });

    if (res.status === 201) {
      setSuccess(true);
    } else {
      setFailure(true);
    }

    const data = await res.json();
    setMessage(data.message);
  };

  if (success) {
    return (
      <div className="bg-green-100 flex flex-col gap-8 px-32 py-16 rounded-sm">
        <h3 className="text-xl"><strong>Registration successful!</strong></h3>
        <Button onClick={() => { router.push('/login'); }}>Go to Login</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-[30%]" action="/register">
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
  );
}
