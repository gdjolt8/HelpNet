"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar({ type }: {type: number}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white font-sans w-full">
      <div className="container mx-4 px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold">
          HelpNet
        </Link>

        {/* Desktop Links */}
        <div className="hidden absolute right-4 md:flex space-x-6">
          {type == 1 ? 
          <>
          <Link href="/register" className="hover:bg-gray-400 rounded-md p-4">
            Signup
          </Link>
          <Link href="/login" className="hover:bg-gray-400 rounded-md p-4">
            Login
          </Link>
          </>
          : 
          <>
          <Link href="/home" className="hover:bg-gray-400 rounded-md p-4">
            Home
            </Link>
          <Link href="/logout" className="hover:bg-gray-400 rounded-md p-4">
            Logout
          </Link>
          </>
          }
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden bg-gray-700 space-y-2 p-4">
          {type == 1 ? 
          <>
          <Link href="/register" className="hover:bg-gray-400 rounded-md p-4">
            Signup
          </Link>
          <Link href="/login" className="hover:bg-gray-400 rounded-md p-4">
            Login
          </Link>
          </>
          : 
          <>
          <Link href="/home" className="hover:bg-gray-400 rounded-md p-4">
            Home
            </Link>
          <Link href="/logout" className="hover:bg-gray-400 rounded-md p-4">
            Logout
          </Link>
          </>
          }
        </div>
      )}
    </nav>
  );
}
