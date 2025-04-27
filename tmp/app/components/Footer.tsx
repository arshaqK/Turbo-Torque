"use client";

// React
import React from "react";

// Icons
import { FaGithub, FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import { BiLogoGmail } from "react-icons/bi";

const Footer = () => {
  return (
    <footer className="mt-[10rem] py-[5rem] px-[7rem] w-full h-fit bg-[#1a1a1a] text-white flex flex-row justify-between">
      <section className="flex flex-col gap-[1rem]">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold">Company</h1>
          <div className="h-[1px] bg-[#2acea5] w-[3rem]"></div>
        </div>

        <ul className="flex flex-col gap-[0.75rem] text-xs text-neutral-400">
          <li>About Us</li>
          <li>Our Services</li>
          <li>Privacy Policy</li>
          <li>Affiliate Program</li>
        </ul>
      </section>

      <section className="flex flex-col gap-[1rem]">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold">Help</h1>
          <div className="h-[1px] bg-[#2acea5] w-[1.5rem]"></div>
        </div>

        <ul className="flex flex-col gap-[0.75rem] text-xs text-neutral-400">
          <li>FAQ</li>
          <li>Contact Us</li>
          <li>Terms of Service</li>
          <li>Payment Options</li>
        </ul>
      </section>

      <section className="flex flex-col gap-[1rem]">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold">Resources</h1>
          <div className="h-[1px] bg-[#2acea5] w-[3rem]"></div>
        </div>

        <ul className="flex flex-col gap-[0.75rem] text-xs text-neutral-400">
          <li>Documentation</li>
          <li>Tutorial Videos</li>
          <li>Community</li>
          <li>Blog</li>
        </ul>
      </section>

      <section className="flex flex-col gap-[1rem]">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold">Follow Us</h1>
          <div className="h-[1px] bg-[#2acea5] w-[3rem]"></div>
        </div>

        <ul className="flex flex-row gap-[1rem] text-neutral-400">
          <li className="bg-neutral-600 rounded-full p-2">
            <FaGithub />
          </li>

          <li className="bg-neutral-600 rounded-full p-2">
            <BiLogoGmail />
          </li>

          <li className="bg-neutral-600 rounded-full p-2">
            <FaLinkedinIn />
          </li>

          <li className="bg-neutral-600 rounded-full p-2">
            <FaInstagram />
          </li>
        </ul>
      </section>
    </footer>
  );
};

export default Footer;
