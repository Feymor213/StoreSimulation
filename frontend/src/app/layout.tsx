import React from 'react';
import "./globals.css";
import Header from "@/components/Header";
import { getAuthenticatedUser } from "@/lib/auth";
import Footer from '@/components/Footer';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  const loggedIn = !!user;

  return (
    <>
      <Header loggedIn={loggedIn} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
