'use client';

import React, { useState } from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AuthRecord } from "pocketbase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginForm, RegisterForm } from "@/components/auth";

export default function Header({user}: {user: AuthRecord | null}) {

  const loggedIn = !!user;

  const avatarImage: string = loggedIn ? user.avatar : '/public/images/defaultAvatar.svg';
  const avatarName: string = loggedIn ? user.name : 'Guest';

  return (
    <header className="sticky top-0 bg-white shadow-md py-4 px-6 flex justify-between items-center">
    <div className="flex gap-8">
      <Link href="/" className="text-2xl font-bold text-gray-800">
        SimApp
      </Link>
      <nav className="flex gap-6 justify-start items-center">
        <Link href="/parameters" className="text-gray-600 hover:text-gray-900">
          Parameters
        </Link>
        <Link href="/create" className="text-gray-600 hover:text-gray-900">
          New Simulation
        </Link>
        <Link href="/simulation" className="text-gray-600 hover:text-gray-900">
          My Simulations
        </Link>
      </nav>
    </div>

    <div className="flex gap-4">
      {/* {loggedIn && <h3>Welcome, {user.name}</h3>}
      <Button variant="outline" onClick={() => router.push(loggedIn ? '/logout' : '/login')}>{loggedIn ? 'Log out' : 'Log in'}</Button> */}
      <Popover>
        <PopoverTrigger asChild>
          <Avatar className="w-10 h-10 cursor-pointer">
            <AvatarImage src={avatarImage} />
            <AvatarFallback>{avatarName[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className="w-auto flex flex-col gap-2 mr-4 p-4">
          <div>
            {!loggedIn && <h3 className="text-center text-md font-bold">{avatarName}</h3>}
            {loggedIn && <Link href="/profile"><Button variant='outline'>{avatarName}</Button></Link>}
            {/* <p className="text-center text-sm text-gray-500">{user?.email}</p> */}
          </div>
          <Separator />
          {!loggedIn && <LoginDialog />}
          {loggedIn && <Link href="/logout"><Button variant='outline'>Logout</Button></Link>}

        </PopoverContent>
      </Popover>
    </div>
  </header>
  )
}

function LoginDialog() {

  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  
  return (
    <Dialog>
      <DialogTrigger>Login</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign up or create a new account</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden w-full relative">
          <div
            className="flex transition-transform duration-500 ease-in-out w-[200%]"
            style={{
              transform: activeForm === 'login' ? 'translateX(0%)' : 'translateX(-50%)',
            }}
          >
            <LoginForm formSwitchHandler={setActiveForm} className="w-full" />
            <RegisterForm formSwitchHandler={setActiveForm} className="w-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}