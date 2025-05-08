// components/BrandFormPopup.tsx
"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

interface BrandFormPopupProps {
  setShowPopup: (show: boolean) => void;
  onBrandAdded: () => void;
}

const BrandFormPopup: React.FC<BrandFormPopupProps> = ({ setShowPopup, onBrandAdded }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !logo.trim() || !password.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    // Only allow the name to be 1-50 characters & only contain letters
    if (name.length < 1 || name.length > 30 || !/^[a-zA-Z]+$/.test(name)) {
      toast.error("Invalid name.");
      return;
    }

    // Check if the email is valid
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      toast.error("Invalid email.");
      return;
    }

    const localPart = email.split("@")[0];
    const hasLetter = /[a-zA-Z]/.test(localPart); // Must contain at least one letter
    const startsWithLetter = /^[a-zA-Z]/.test(localPart); // Must NOT start with a letter

    if (!hasLetter || !startsWithLetter) {
      toast.error("Invalid email.");
      return;
    }

    const localPart2 = email.split("@")[1];
    const hasLetter2 = /[a-zA-Z]/.test(localPart2); // Must contain at least one letter
    const startsWithLetter2 = /^[a-zA-Z]/.test(localPart2); // Must NOT start with a letter

    if (!hasLetter2 || !startsWithLetter2) {
      toast.error("Invalid email.");
      return;
    }

    // Check if the password is strong
    if (password.length < 8 || password.length > 20 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      toast.error("Invalid password.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/brands/auth/signup", { name, email, logo, password });
      toast.success("Brand added successfully!");
      onBrandAdded();
      setShowPopup(false);
    } catch (error: unknown) {
      console.error(error);
      // toast.error(error.response?.data?.message || "Failed to add brand.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Brand</h2>

        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Brand Name" required value={name} onChange={(e) => setName(e.target.value)} className="border p-3 rounded-lg" />
          <input type="email" placeholder="Brand Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="border p-3 rounded-lg" />
          <input type="text" placeholder="Logo URL" required value={logo} onChange={(e) => setLogo(e.target.value)} className="border p-3 rounded-lg" />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="border p-3 rounded-lg" />

          <div className="flex justify-between mt-6">
            <button onClick={() => setShowPopup(false)} className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white">
              {loading ? "Adding..." : "Add Brand"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandFormPopup;
