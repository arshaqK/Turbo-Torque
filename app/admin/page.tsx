"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import WarningPopUp from "../components/WarningPopup";
import Table from "../components/Table";

import { UserType, BrandType, targetItemType, CarType } from "@/types"; // <- Added CarType
import BrandForm from "../components/BrandForm"; // Import this
import CarForm from "../components/CarForm";

// Icons
import { IoTrash } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";

const Page = () => {
  const [showCarForm, setShowCarForm] = useState(false); // <- Add this
  const [users, setUsers] = useState<Array<UserType>>([]);
  const [brands, setBrands] = useState<Array<BrandType>>([]);
  const [cars, setCars] = useState<Array<CarType>>([]); // <- Added cars state

  const [showPopUp, setShowPopUp] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [targetItem, setTargetItem] = useState<null | targetItemType>(null);

  const [carSearchTerm, setCarSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchBrands();
    fetchCars(); // <--- Fetch cars too
  }, []);

  const filteredCars = cars.filter((car) => car.title.toLowerCase().includes(carSearchTerm.toLowerCase()) || car.location.toLowerCase().includes(carSearchTerm.toLowerCase()));

  useEffect(() => {
    fetchUsers();
    fetchBrands();
    fetchCars(); // <- Fetch cars too
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      setUsers(res.data.users);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching users.");
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get("/api/brands");
      setBrands(res.data.brands);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching brands.");
    }
  };

  const fetchCars = async () => {
    try {
      const res = await axios.get("/api/cars");
      setCars(res.data.cars);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching cars.");
    }
  };

  const deleteItem = async (item: targetItemType) => {
    try {
      const endpoint = `/api/${item.type.toLowerCase()}/${item.id}`;
      const res = await axios.delete(endpoint);

      toast.warning(res.data.message);

      // Refetch everything after delete
      fetchUsers();
      fetchBrands();
      fetchCars();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during deletion.");
    }
  };

  const handleYesOrNo = (yes: boolean) => {
    if (yes && targetItem) {
      if (targetItem.type === "Users") deleteItem(targetItem);
      if (targetItem.type === "Brands") deleteItem(targetItem);
      if (targetItem.type === "Cars") deleteItem(targetItem); // <- Added cars deletion
    }
    setShowPopUp(false);
  };

  const handleDeleteClick = (item: targetItemType) => {
    setTargetItem(item);
    setShowPopUp(true);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-teal-50 to-gray-100 px-6 py-10">
      <div className="mt-[7rem] max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-900 to-cyan-800">Dashboard</h1>
        <p className="text-lg text-gray-700 mb-16">Manage your users, brands and cars in one clean, professional space.</p>
      </div>

      <div className="flex flex-col gap-16 items-center max-w-6xl mx-auto">
        {/* Users Table */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-6">
          <Table handleDeleteClick={handleDeleteClick} items={users} type="Users" columns={["Name", "Email", "Phone Number", "Actions"]} />
        </div>

        {/* Brands Table */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-6">
          {/* Add Brand Button */}
          <div className="flex justify-end mb-6">
            <button onClick={() => setShowBrandForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg">
              Add New Brand
            </button>
          </div>

          <Table handleDeleteClick={handleDeleteClick} items={brands} type="Brands" columns={["Name", "Email", "Logo", "Verify", "Actions"]} />
        </div>

        {/* Cars Table */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6 items-center">
          {/* Add Car Button */}
          <div className="flex justify-end w-full">
            <button onClick={() => setShowCarForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg">
              Add New Car
            </button>
          </div>

          <h1 className="text-4xl text-gray-800">Cars</h1>

          {/* Search Bar */}
          <div className="relative w-[80%]">
            <input type="text" placeholder="Search cars..." className="w-full p-3 pl-6 pr-10 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400" value={carSearchTerm} onChange={(e) => setCarSearchTerm(e.target.value)} />
            <FiSearch className="absolute right-4 top-3.5 text-gray-500 text-xl" />
          </div>

          {filteredCars.length > 0 ? (
            <div className="overflow-x-auto bg-white w-[80%] rounded-2xl shadow-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gradient-to-r from-teal-900 to-cyan-700">
                  <tr>
                    <th className="py-3 px-5 border-b text-center text-white font-semibold">Title</th>
                    <th className="py-3 px-5 border-b text-center text-white font-semibold">Location</th>
                    <th className="py-3 px-5 border-b text-center text-white font-semibold">Price</th>
                    <th className="py-3 px-5 border-b text-center text-white font-semibold">Availability</th>
                    <th className="py-3 px-5 border-b text-center text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.map((car) => (
                    <tr key={car._id} className="hover:bg-teal-50 transition duration-300">
                      <td className="py-3 px-4 border-b text-center">{car.title}</td>
                      <td className="py-3 px-4 border-b text-center">{car.location}</td>
                      <td className="py-3 px-4 border-b text-center">{car.price ? `Rs. ${car.price}` : "-"}</td>
                      <td className="py-3 px-4 border-b text-center">{car.availability ? "Available" : "Unavailable"}</td>
                      <td className="py-3 px-4 border-b text-center">
                        <button onClick={() => handleDeleteClick({ id: car._id, type: "Cars" })} className="text-red-600 hover:text-red-700 text-xl transition duration-300">
                          <IoTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl text-gray-600 shadow p-6 text-center max-w-md mx-auto border border-gray-200">No cars found.</div>
          )}
        </div>
      </div>

      {showPopUp && <WarningPopUp handleYesOrNo={handleYesOrNo} setShowPopUp={setShowPopUp} description="This action cannot be reversed. Are you sure that you want to continue?" redIcon={true} />}
      {showCarForm && <CarForm setShowPopup={setShowCarForm} onCarAdded={fetchCars} />}
      {showBrandForm && <BrandForm setShowPopup={setShowBrandForm} onBrandAdded={fetchBrands} />}
    </main>
  );
};

export default Page;
