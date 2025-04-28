"use client";

// React
import React from "react";

// Next Js
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Contexts
import { useAuth } from "@/context/AuthContext";

// Dependencies
import axios from "axios";

// Icons
import { FaGithub } from "react-icons/fa6";
import { IoPower } from "react-icons/io5";

const NavBar = () => {
  // Hooks
  const { user, setUser } = useAuth();
  const router = useRouter();

  // Functions
  const handleLogout = async () => {
    try {
      const res = await axios.post("/api/users/auth/logout");

      // Success
      if (res.status === 200) {
        setUser(null);
        router.push("/login");
      }

      // Error
      else console.error("Error logging out:", res.data.error);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="flex flex-row justify-between p-[1rem] px-[2rem] items-center from-black to-neutral-800 bg-gradient-to-tl fixed w-full z-[9998] top-0 left-0">
      <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
        <Image src="/logo.webp" width={30} height={25.7} className="h-auto w-auto cursor-pointer" alt="logo" />
        <span className="self-center text-2xl font-semibold whitespace-nowrap text-white hover:text-neutral-200 transition duration-200 cursor-pointer">Pak Wheels</span>
      </Link>

      <div className="flex flex-col p-4 md:p-0 mt-4 font-medium rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0">
        <Link href="new-cars" className="block py-2 px-3 rounded hover:text-[#2acea5] md:p-0 text-white bg-transparent cursor-pointer transition duration-200">
          New
        </Link>

        <Link href="used-cars" className="block py-2 px-3 rounded hover:text-[#2acea5] md:p-0 text-white bg-transparent cursor-pointer transition duration-200">
          Used
        </Link>

        <Link href="new-cars" className="block py-2 px-3 bg-transparent rounded text-white hover:text-[#2acea5] md:p-0 cursor-pointer transition duration-200">
          Rent
        </Link>
      </div>

      <div className="flex flex-row gap-4">
        {!user ? (
          <Link href="/login" className="text-white bg-gradient-to-r from-[#10a37f] to-[#27826c] hover:bg-gradient-to-bl font-medium rounded-lg text-md px-4 py-2 text-center cursor-pointer">
            Get started
          </Link>
        ) : (
          <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="text-white bg-gradient-to-r from-[#10a37f] to-[#27826c] hover:bg-gradient-to-bl font-medium rounded-lg text-md px-4 py-2 text-center cursor-pointer">
            Dashboard
          </Link>
        )}

        <button onClick={() => window.open("https://github.com/aliasif78/pak-wheels", "_blank")} className="text-white bg-gradient-to-r from-[#10a37f] to-[#27826c] hover:bg-gradient-to-bl font-medium rounded-lg text-md px-4 py-2 text-center flex flex-row gap-2 items-center">
          <FaGithub className="text-xl cursor-pointer" />
          <span className="cursor-pointer">GitHub</span>
        </button>

        {user && (
          <button onClick={handleLogout} className="text-neutral-200 border-[1px] border-neutral-200 font-medium rounded-lg text-md px-4 py-2 text-center flex flex-row gap-2 items-center hover:bg-white hover:text-black transition duration-200">
            <IoPower className="text-xl cursor-pointer" />
            <span className="cursor-pointer">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
