"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const clients = [
  { name: "Client A", role: "Startup Founder" },
  { name: "Client B", role: "Business Owner" },
  { name: "Client C", role: "Entrepreneur" },
  { name: "Client D", role: "NGO Head" },
  { name: "Client E", role: "CEO" },
  { name: "Client F", role: "CEO" },
  { name: "Client G", role: "CEO" },
  { name: "Client H", role: "CEO" },
  { name: "Client I", role: "CEO" },
];

export default function MyClients() {
  const [active, setActive] = useState(2); // center index

  // auto shift center
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % clients.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-28 bg-[#f5e6c8] overflow-hidden text-center">

      {/* HEADING */}
      <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-16">
        Inspiring Client Journeys ✨
      </h2>

      {/* CARDS */}
      <div className="relative flex justify-center items-center h-[420px] w-[420px] mx-auto">

        {clients.map((client, index) => {
          const offset = index - active;

          return (
            <motion.div
              key={index}
              animate={{
                x: offset * 270, // spacing
                scale: offset === 0 ? 1.2 : 0.85,
                opacity: Math.abs(offset) > 2 ? 0 : 1,
                zIndex: offset === 0 ? 10 : 5,
              }}
              transition={{ duration: 0.5 }}
              className="absolute"
            >
              <div
                className={`w-[240px] h-[340px] rounded-[30px] overflow-hidden shadow-xl transition-all
                  ${
                    offset === 0
                      ? "bg-white"
                      : "bg-white/60 grayscale opacity-70"
                  }
                `}
              >
                {/* IMAGE */}
                <div className="h-[70%] bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Image</span>
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {client.role}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

      </div>
    </section>
  );
}