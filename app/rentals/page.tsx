"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { MapPin, Calendar, DollarSign, Car, X } from "lucide-react";

interface RentalCar {
  _id: string;
  title: string;
  location: string;
  pricePerDay: number;
  images: string[];
  availability: boolean;
}

interface RentalRequest {
  startDate: string;
  endDate: string;
  totalPrice: number;
}

const RentalsPage = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState<RentalCar[]>([]);
  const [selectedCar, setSelectedCar] = useState<RentalCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentalForm, setRentalForm] = useState<RentalRequest>({
    startDate: "",
    endDate: "",
    totalPrice: 0,
  });

  useEffect(() => {
    fetchRentalCars();
  }, []);

  const fetchRentalCars = async () => {
    try {
      const response = await axios.get("/api/rentals");
      setCars(response.data.car || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch rental cars");
      setLoading(false);
    }
  };

  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCar) return;

    try {
      const response = await axios.post("/api/rentals", {
        renterId: user._id,
        carId: selectedCar._id,
        startDate: rentalForm.startDate,
        endDate: rentalForm.endDate,
        totalPrice: rentalForm.totalPrice,
      });

      toast.success("Rental request submitted successfully!");
      setSelectedCar(null);
      setRentalForm({
        startDate: "",
        endDate: "",
        totalPrice: 0,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit rental request");
    }
  };

  const calculateTotalPrice = (start: string, end: string) => {
    if (!selectedCar || !start || !end) return 0;
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return days * selectedCar.pricePerDay;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRentalForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const totalPrice = calculateTotalPrice(newForm.startDate, newForm.endDate);
      return { ...newForm, totalPrice };
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 px-6 py-10">
      <div className="mt-[7rem] max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-900 to-cyan-800">Rent a Car</h1>
        <p className="text-lg text-gray-700 mb-8">Find and rent the perfect car for your needs</p>

        {cars.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No cars available at this point</h2>
            <p className="text-gray-600">Please check back later for available rental cars.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48">
                  <Image src={/*car.images[0] ||*/ "/haval.png"} alt={car.title} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{car.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{car.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <DollarSign className="w-4 h-4" />
                    <span>Rs. {car.pricePerDay}/day</span>
                  </div>
                  <button onClick={() => setSelectedCar(car)} disabled={!car.availability} className={`w-full py-2 px-4 rounded-lg ${car.availability ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-gray-300 cursor-not-allowed"} transition-colors duration-300`}>
                    {car.availability ? "Rent Now" : "Not Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rental Form Modal */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button onClick={() => setSelectedCar(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-semibold mb-4">Rent {selectedCar.title}</h2>

            <form onSubmit={handleRentalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" name="startDate" value={rentalForm.startDate} onChange={handleDateChange} min={new Date().toISOString().split("T")[0]} className="w-full p-2 border rounded-lg" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" name="endDate" value={rentalForm.endDate} onChange={handleDateChange} min={rentalForm.startDate || new Date().toISOString().split("T")[0]} className="w-full p-2 border rounded-lg" required />
              </div>

              {rentalForm.totalPrice > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold">Total Price: Rs. {rentalForm.totalPrice}</p>
                </div>
              )}

              <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors duration-300">
                Submit Rental Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalsPage;
