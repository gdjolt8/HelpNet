"use client";

import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      
      const token = Cookie.get("authorization");
      if (!token) router.push("/");
      Cookie.remove("authorization");
      router.push("/");
      setIsLoading(false);
    };

    checkToken(); // Call the token check on component mount
  }, [router]);

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <main className="flex items-center justify-center h-screen">
        <h1>Logging out...</h1>
    </main>
  );
}
