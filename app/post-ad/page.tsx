"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const StartSellingPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    mileage: 0,
    modelYear: 0,
    city: "",
    sellerName: "",
    sellerPhone: "",
    sellerComments: "",
    images: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "images" && files) {
      setFormData({ ...formData, images: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all the fields are present
    if (!formData.name || !formData.price || !formData.mileage || !formData.modelYear || !formData.city || !formData.sellerName || !formData.sellerPhone || !formData.sellerComments || formData.images.length === 0) {
      toast.error("Please fill all fields");
      return;
    }

    // Check if the phone number is valid
    if (formData.sellerPhone && (formData.sellerPhone?.lastIndexOf("+") > 0 || formData.sellerPhone.length < 10 || formData.sellerPhone.length > 12 || /[^0-9+]/.test(formData.sellerPhone))) {
      toast.error("Invalid phone number.");
      return;
    }

    if (formData.price < 100000 || formData.price > 100000000) {
      toast.error("Invalid price.");
      return;
    }

    if (formData.mileage < 0 || formData.mileage > 400000) {
      toast.error("Invalid mileage.");
      return;
    }

    if (formData.modelYear < 1886 || formData.modelYear > 2025) {
      toast.error("Invalid year.");
      return;
    }

    // Only allow the location to be 1-50 characters & start with a letter
    if (formData.city.length < 1 || formData.city.length > 30 || !/^[a-zA-Z]/.test(formData.city)) {
      toast.error("Invalid city.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");

    try {
      // For now, we'll just simulate image URLs (you can later integrate real image uploads like Cloudinary)
      const fakeImageUrls = formData.images.map((file) => `/uploads/${file.name}`);

      const res = await fetch("/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: formData.price,
          mileage: formData.mileage,
          modelYear: formData.modelYear,
          city: formData.city,
          sellerName: formData.sellerName,
          sellerPhone: formData.sellerPhone,
          sellerComments: formData.sellerComments,
          images: fakeImageUrls,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Car ad created successfully!");
        setFormData({
          name: "",
          price: 0,
          mileage: 0,
          modelYear: 0,
          city: "",
          sellerName: "",
          sellerPhone: "",
          sellerComments: "",
          images: [],
        });
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to post car ad.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while posting the car ad.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-10 pb-[20rem] bg-gradient-to-r from-teal-50 to-gray-100">
      <h1 className="mt-28 text-4xl font-bold text-center text-teal-700 mb-8">Sell Your Car</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
        <input type="text" name="name" placeholder="Car Name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="number" name="mileage" placeholder="Mileage" value={formData.mileage} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="number" name="modelYear" placeholder="Model Year" value={formData.modelYear} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />

        <input type="text" name="sellerName" placeholder="Your Name" value={formData.sellerName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <input type="text" name="sellerPhone" placeholder="Phone Number" value={formData.sellerPhone} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
        <textarea name="sellerComments" placeholder="Additional Comments" value={formData.sellerComments} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" rows={3}></textarea>

        <input type="file" name="images" accept="image/*" multiple onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />

        <button type="submit" disabled={loading} className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
          {loading ? "Submitting..." : "Submit"}
        </button>

        {successMsg && <p className="text-green-600 text-center mt-4">{successMsg}</p>}
      </form>
    </div>
  );
};

export default StartSellingPage;
