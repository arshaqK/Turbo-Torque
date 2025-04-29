// Admin Dashboard Page (Styled like Pak Wheels Landing Page)
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import WarningPopUp from "../components/WarningPopup";
import Table from "../components/Table";

import { UserType, BrandType, targetItemType } from "@/types";

import BrandForm from "../components/BrandForm"; // Import this

const Page = () => {
  const [users, setUsers] = useState<Array<UserType>>([]);
  const [brands, setBrands] = useState<Array<BrandType>>([]);
  const [showPopUp, setShowPopUp] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false); // <-- new state
  const [targetItem, setTargetItem] = useState<null | targetItemType>(null);

  useEffect(() => {
    fetchUsers();
    fetchBrands();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await axios.get("/api/users");
      setUsers(data.data.users);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await axios.get("/api/brands");
      setBrands(data.data.brands);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const deleteItem = async (item: targetItemType) => {
    try {
      const endpoint = `/api/${item.type.toLowerCase()}/${item.id}`;
      const res = await axios.delete(endpoint);

      toast.warning(res.data.message);
      fetchUsers();
      fetchBrands(); // <- important
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    }
  };

  const handleYesOrNo = (yes: boolean) => {
    if (yes) {
      if ((targetItem as targetItemType).type === "Users") deleteItem(targetItem as targetItemType);
      if ((targetItem as targetItemType).type === "Brands") deleteItem(targetItem as targetItemType);
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
        <p className="text-lg text-gray-700 mb-16">Manage your users and brands in one clean, professional space.</p>
      </div>

      <div className="flex flex-col gap-16 items-center max-w-6xl mx-auto">
        <div className="w-full bg-white rounded-2xl shadow-lg p-6">
          <Table handleDeleteClick={handleDeleteClick} items={users} type="Users" columns={["Name", "Email", "Phone Number", "Actions"]} />
        </div>

        <div className="w-full bg-white rounded-2xl shadow-lg p-6">
          {/* Add Brand Button */}
          <div className="flex justify-end mb-6">
            <button onClick={() => setShowBrandForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg">
              Add New Brand
            </button>
          </div>

          <Table handleDeleteClick={handleDeleteClick} items={brands} type="Brands" columns={["Name", "Email", "Logo", "Verify", "Actions"]} />
        </div>
      </div>

      {showPopUp && <WarningPopUp handleYesOrNo={handleYesOrNo} setShowPopUp={setShowPopUp} description="This action cannot be reversed. Are you sure that you want to continue?" redIcon={true} />}

      {showBrandForm && <BrandForm setShowPopup={setShowBrandForm} onBrandAdded={fetchBrands} />}
    </main>
  );
};

export default Page;
