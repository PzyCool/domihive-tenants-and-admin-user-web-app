import React from "react";
import heroImage from "../../assets/hero-image.png";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div>
      {/* Hero section */}
      <section
        id="home"
        className="w-full mx-auto flex flex-col gap-8 md:gap-20 md:flex-row mt-6 md:mt-12 pt-16 md:py-20 px-4 md:px-8 items-center justify-center min-h-[90vh] bg-[linear-gradient(135deg,#0E1F42_0%,#1a2d5f_100%)] overflow-hidden"
      >
        {/* Left part of the hero section - text*/}
        <div className="flex items-center text-center md:items-start md:text-left flex-col gap-4 md:gap-5">
          <h1 className="text-white text-3xl/10 md:text-5xl/15 font-black md:max-w-lg w-full">
            Your Peace of Mind, Our Professional Promise
          </h1>
          <p className="text-[#9F7539] text-base md:text-xl font-semibold">
            Rent with Confidence on a Trusted Property Platform
          </p>
          <p className="text-white/90 text-sm md:text-lg/7 max-w-xl">
            No agents. No stress. No palava. DomiHive gives you
            verified listings, smooth applications, secure payments, and
            professional property management — all in one seamless experience.
          </p>

          {/* CTAs */}
          <div className="flex flex-col w-full md:flex-row gap-3 md:gap-4 py-4 md:py-6">
            <button
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("properties");
                if (element) {
                  const offsetTop = element.offsetTop - 80;
                  window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth",
                  });
                }
              }}
              className="w-full md:w-auto bg-[#9F7539] border-2 border-[#9F7539] hover:border-[#b58a4a] text-white py-3.5 md:py-3 px-6 md:px-8 rounded-xl font-bold cursor-pointer flex items-center justify-center gap-2 text-base shadow-2xl shadow-[rgba(159,117,57,0.3)] hover:bg-[#b58a4a] hover:-translate-y-0.5 hover:shadow-[rgba(159,117,57,0.4)] transition duration-300"
            >
              Browse Properties
              <i className="fas fa-arrow-right"></i>
            </button>

            <button className="w-full md:w-auto bg-transparent text-white border-2 border-white py-3.5 md:py-3 px-6 md:px-8 rounded-xl font-bold cursor-pointer flex items-center justify-center gap-2 text-base hover:bg-white hover:text-[#0E1F42] hover:-translate-y-0.5 transition duration-300">
              <i className="fas fa-download"></i>
              Download App
            </button>
          </div>
          {/* Features */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-5 text-white text-xs md:text-sm font-medium">
            <p>Secure Escrow Payments</p>
            <p>Verified Properties</p>
            <p>Tenant-Friendly</p>
          </div>
        </div>

        {/* Right part of the hero section - image */}
        <div className="relative hidden md:block md:w-auto">
          <img
            src={heroImage}
            alt="DomiHive Homes"
            className="w-full md:w-auto h-64 md:h-120 rounded-2xl object-cover object-bottom-left shadow-2xl shadow-black/40 hover:shadow-black/60 hover:-translate-y-1 transition duration-500"
          />

        </div>
      </section>
    </div>
  );
}
