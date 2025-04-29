// React
import React from "react";

// Icons
import { IoWarning, IoClose } from "react-icons/io5";

// Types
interface Props {
  handleYesOrNo: (yes: boolean) => void;
  setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  description?: string;
  redIcon?: boolean;
}

const WarningPopUp = ({ handleYesOrNo, setShowPopUp, description = "You have unsaved changes. Would you like to save them?", redIcon = false }: Props) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[9999]">
      <div className="relative bg-white w-[25rem] shadow-2xl rounded-lg p-[2rem] flex flex-col justify-center items-center gap-[2rem]">
        <button onClick={() => setShowPopUp(false)} className="absolute top-[1rem] right-[1rem] text-2xl text-neutral-700 ">
          <IoClose />
        </button>

        <div className="flex flex-col gap-[1rem] justify-center items-center">
          <IoWarning className={`text-9xl ${redIcon ? "text-red-800" : "text-yellow-500"}`} />
          <h1 className="text-[#292B5B] font-chewy text-5xl">Warning</h1>
        </div>

        <p className="text-center -mt-[1rem] font-comfortaa">{description}</p>

        <div className="flex flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-red-700 to-red-900 hover:bg-gradient-to-bl text-white font-comfortaa py-2 px-4 rounded-md" onClick={() => handleYesOrNo(true)}>
            Yes
          </button>

          <button className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:bg-gradient-to-bl text-white font-comfortaa py-2 px-4 rounded-md" onClick={() => handleYesOrNo(false)}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningPopUp;
