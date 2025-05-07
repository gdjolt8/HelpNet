"use client";

import Cookie from "js-cookie";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/functions";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken(String(Cookie.get("authorization")));

      // Redirect if token verification succeeds
      if (token.ok === true) {
        router.push("/home"); // Redirect to home page
      } else {
        setIsLoading(false); // Stop loading if verification fails
      }
    };

    checkToken(); // Call the token check on component mount
  }, [router]);

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <main className="flex flex-col w-screen h-screen items-center bg-gradient-to-br from-blue-600 to-indigo-900 font-sans text-gray-100">
      <Navbar type={1}/>
      <section className="flex flex-col items-center justify-center w-full h-2/3 px-5">
        <h1 className="text-white font-extrabold text-5xl md:text-7xl text-center mt-5 tracking-tight">
          Welcome to HelpNet
        </h1>
        <h2 className="text-gray-200 text-xl md:text-2xl font-medium text-center mt-3 max-w-3xl">
          Empower your learning journey. Collaborate, ask questions, and share knowledge with the community!
        </h2>
        <Link
          className="bg-yellow-500 hover:bg-yellow-600 transition-all text-gray-900 font-bold text-lg rounded-full px-8 py-4 mt-10 shadow-md"
          href="/register"
        >
          Get Started for Free!
        </Link>
      </section>
      <footer className="w-full text-center text-sm text-gray-300 mt-auto py-5 border-t border-gray-500">
        © {new Date().getFullYear()} HelpNet. All rights reserved.
      </footer>
    </main>
  );
}