// React
import React, { useState } from "react";

// Next Js
import Image from "next/image";

// Icons
import { IoTrash } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";

// Types
import { BrandType, UserType, targetItemType } from "@/types";

interface Props {
  handleDeleteClick: (item: targetItemType) => void;
  items: Array<UserType | BrandType>;
  type: string;
  columns: Array<string>;
}

const Table = ({ handleDeleteClick, items, type, columns }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-4xl text-gray-800">{type}</h1>

      <div className="relative w-[80%]">
        <input type="text" placeholder={`Search ${type.toLowerCase()}...`} className="w-full p-3 pl-6 pr-10 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <FiSearch className="absolute right-4 top-3.5 text-gray-500 text-xl" />
      </div>

      {filteredItems.length > 0 ? (
        <div className="overflow-x-auto bg-white w-[80%] rounded-2xl shadow-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gradient-to-r from-teal-900 to-cyan-700">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="py-3 px-5 border-b text-center text-white font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-teal-50 transition duration-300">
                  <td className="py-3 px-4 border-b text-center">{item.name}</td>
                  <td className="py-3 px-4 border-b text-center">{item.email}</td>
                  <td className="py-3 px-4 border-b flex flex-row justify-center">
                    {type === "Users" ? (
                      (item as UserType).phoneNumber
                    ) : (
                      <div className="relative w-10 h-10">
                        <Image src={(item as BrandType).logo} alt="brand-logo" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain" />
                      </div>
                    )}
                  </td>

                  {type === "Brands" && (
                    <td className="py-3 px-4 border-b text-center">
                      <label className="relative flex justify-center items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-300 peer-checked:bg-teal-500 rounded-full relative">
                          <div className={`absolute h-4 w-4 rounded-full bg-white top-0.5 ${(item as BrandType).isVerified ? "left-0.5" : "right-0.5"} transition-all duration-300 transform peer-checked:translate-x-5 border border-gray-300`}></div>
                        </div>
                      </label>
                    </td>
                  )}

                  <td className="py-3 px-4 border-b text-center">
                    <button onClick={() => handleDeleteClick({ id: item._id, type })} className="text-red-600 hover:text-red-700 text-xl transition duration-300">
                      <IoTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl text-gray-600 shadow p-6 text-center max-w-md mx-auto border border-gray-200">No {type.toLowerCase()} found.</div>
      )}
    </div>
  );
};

export default Table;
