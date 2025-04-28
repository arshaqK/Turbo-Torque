import React from "react";
import Protected from "../components/Protected";

const page = () => {
  return (
    <Protected>
      <h1 className="mt-[10rem]">Super Secret Profile Page.</h1>
    </Protected>
  );
};

export default page;
