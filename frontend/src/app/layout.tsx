import "./globals.css";
import Header from "./header";
import { getAuthenticatedUser } from "@/lib/auth";

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

export async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  return (
    <>
      <Header user={user} />
      <main className="p-6 flex-1">{children}</main>
    </>
  );
}
