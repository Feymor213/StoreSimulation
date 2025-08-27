'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingBag } from "lucide-react";
import { AuthRecord } from "pocketbase";
import { useState } from "react";
import { DialogHeader } from "./ui/dialog";
import { LoginForm, RegisterForm } from "./auth";
import { Logout } from "@/serveractions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const Header = ({loggedIn}: {loggedIn: boolean}) => {

  const router = useRouter();

  const handleLogout = async () => {
    const data = await Logout();
    if (data.success) {
      router.refresh();
    } else {
      toast("Logout failed. Please try again later");
      router.refresh();
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/#" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">StoreSim</span>
          </Link>
          
          { loggedIn && 
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/simulation" className="text-muted-foreground hover:text-foreground transition-colors">
                Simulations
              </a>
              <a href="/create" className="text-muted-foreground hover:text-foreground transition-colors">
                Create new
              </a>
            </nav>
          }

          {!loggedIn && 
            <div className="flex items-center space-x-4">
              <Dialog>
                <DialogTrigger asChild><Button variant='outline'>Sign In</Button></DialogTrigger>
                <DialogTrigger asChild><Button variant='default'>Get Started</Button></DialogTrigger>
                <LoginDialogContent />
              </Dialog>
            </div>
          }
          {loggedIn &&
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => handleLogout()}>Sign Out</Button>
            </div>
          }
        </div>
      </div>
    </header>
  );
};

function LoginDialogContent() {

  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  
  return (
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
  )
}

export default Header;