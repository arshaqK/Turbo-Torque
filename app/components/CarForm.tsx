// components/CarForm.tsx

"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

import { useAuth } from "@/context/AuthContext";

interface Props {
  setShowPopup: (value: boolean) => void;
  onCarAdded: () => void;
}

const CarForm = ({ setShowPopup, onCarAdded }: Props) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [availability, setAvailability] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) {
        toast.error("User not found.");
        return;
      }

      const newCar = { ownerId: user._id, title, location, price: price === "" ? null : price, availability, images: ["/haval.png", "/haval2.png"] };
      await axios.post("/api/cars", newCar);

      toast.success("New car added successfully!");
      onCarAdded(); // refetch cars
      setShowPopup(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add new car.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button onClick={() => setShowPopup(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-2xl">
          <IoClose />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Add New Car</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="text" placeholder="Car Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-3 rounded-lg" required />
          <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="border p-3 rounded-lg" required />
          <input type="number" placeholder="Price" value={price === "" ? "" : price} onChange={(e) => setPrice(Number(e.target.value))} className="border p-3 rounded-lg" />

          {/* Image */}
          <input type="file" accept="image/*" className="border p-3 rounded-lg" />

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={availability} onChange={(e) => setAvailability(e.target.checked)} />
            <span>Available</span>
          </label>

          <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold">
            Add Car
          </button>
        </form>
      </div>
    </div>
  );
};

export default CarForm;
