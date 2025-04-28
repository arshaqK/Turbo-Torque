"use client";
import React, { useState } from "react";

const StartSellingPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    mileage: "",
    modelYear: "",
    city: "",
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "image" && files) {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen p-10 pb-[20rem] bg-gradient-to-r from-teal-50 to-gray-100">
      <h1 className="mt-28 text-4xl font-bold text-center text-teal-700 mb-8">Sell Your Car</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
        <input type="text" name="name" placeholder="Car Name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="text" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="text" name="mileage" placeholder="Mileage" value={formData.mileage} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="number" name="modelYear" placeholder="Model Year" value={formData.modelYear} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />

        <button type="submit" className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
          Submit
        </button>
      </form>
    </div>
  );
};

export default StartSellingPage;
