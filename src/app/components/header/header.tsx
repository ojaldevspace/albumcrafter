"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/api/utils/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      }
      setUser(session?.user as User ?? null);
    };
  
    getUser();
  }, []);
  

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section - Navigation Links */}
          <nav className="flex space-x-4">
            <Link href="/" className="text-lg font-semibold hover:text-gray-300">
              Home
            </Link>
            <Link href="/about" className="text-lg font-semibold hover:text-gray-300">
              About Us
            </Link>
            <Link href="/contact" className="text-lg font-semibold hover:text-gray-300">
              Contact
            </Link>
          </nav>

          {/* Right Section - Action Buttons */}
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="bg-blue-500 px-4 py-2 rounded-lg text-white hover:bg-blue-600">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-green-500 px-4 py-2 rounded-lg text-white hover:bg-green-600">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
