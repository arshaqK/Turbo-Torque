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
          <input type="text" placeholder="Brand Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-3 rounded-lg" />
          <input type="email" placeholder="Brand Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-3 rounded-lg" />
          <input type="text" placeholder="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} className="border p-3 rounded-lg" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-3 rounded-lg" />

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
