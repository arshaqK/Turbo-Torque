"use client";
import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar, Gauge, Car } from "lucide-react";

interface UsedCarType {
  id: string;
  name: string;
  image: string;
  price: string;
  mileage: string;
  modelYear: number;
  city: string;
}

const dummyUsedCars: UsedCarType[] = [
  {
    id: "1",
    name: "Haval H6 HEV",
    image: "/haval.png",
    price: "Rs. 10,200,000",
    mileage: "40,000 km",
    modelYear: 2024,
    city: "Islamabad",
  },
  {
    id: "2",
    name: "Haval H6 HEV",
    image: "/haval.png",
    price: "Rs. 11,500,000",
    mileage: "16,500 km",
    modelYear: 2025,
    city: "Lahore",
  },
  {
    id: "3",
    name: "Haval H6 HEV",
    image: "/haval.png",
    price: "Rs. 12,250,000",
    mileage: "6,800 km",
    modelYear: 2025,
    city: "Rawalpindi",
  },
  {
    id: "4",
    name: "Haval H6 HEV",
    image: "/haval.png",
    price: "Rs. 11,800,000",
    mileage: "25,000 km",
    modelYear: 2024,
    city: "Peshawar",
  },
  {
    id: "5",
    name: "Haval H6 HEV",
    image: "/haval.png",
    price: "Rs. 12,250,000",
    mileage: "17,400 km",
    modelYear: 2023,
    city: "Multan",
  },
];

const parseNumber = (str: string) => parseInt(str.replace(/[^0-9]/g, "")) || 0;

const UsedCarsPage = () => {
  const [filters, setFilters] = useState({
    city: "",
    modelYear: "",
    mileage: "",
    name: "",
  });
  const [sortKey, setSortKey] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredCars = dummyUsedCars.filter((car) => {
    return (filters.city === "" || car.city.toLowerCase().includes(filters.city.toLowerCase())) && (filters.modelYear === "" || car.modelYear === parseInt(filters.modelYear)) && (filters.name === "" || car.name.toLowerCase().includes(filters.name.toLowerCase()));
  });

  if (sortKey === "price") {
    filteredCars.sort((a, b) => parseNumber(a.price) - parseNumber(b.price));
  } else if (sortKey === "mileage") {
    filteredCars.sort((a, b) => parseNumber(a.mileage) - parseNumber(b.mileage));
  } else if (sortKey === "modelYear") {
    filteredCars.sort((a, b) => a.modelYear - b.modelYear);
  }

  return (
    <div className="p-10 min-h-screen bg-gradient-to-b from-white to-gray-100">
      <h1 className="mt-[7rem] text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-cyan-600 mb-10">Used Cars</h1>

      <p className="font-light text-sm mb-4 ml-1 text-gray-600">
        Showing {filteredCars.length} results out of {dummyUsedCars.length}.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" name="name" placeholder="Search by name" value={filters.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto" />
        <input type="text" name="city" placeholder="Search by city" value={filters.city} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto" />
        <input type="number" name="modelYear" placeholder="Model Year" value={filters.modelYear} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto" />
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => setSortKey("price")} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm shadow">
          Sort by Price
        </button>
        <button onClick={() => setSortKey("mileage")} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm shadow">
          Sort by Mileage
        </button>
        <button onClick={() => setSortKey("modelYear")} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm shadow">
          Sort by Model Year
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {filteredCars.map((car) => (
          <div key={car.id} className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <Image src={car.image} alt={car.name} width={400} height={250} className="object-cover rounded-xl" />
            <div className="flex flex-col justify-between gap-2 text-gray-800">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-teal-700">
                <Car className="w-6 h-6" /> {car.name}
              </h2>
              <p className="text-lg font-medium text-cyan-700">{car.price}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Gauge className="w-4 h-4 text-gray-500" /> {car.mileage}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-500" /> {car.modelYear}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" /> {car.city}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsedCarsPage;
