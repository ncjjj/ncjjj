"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useCardSpacing() {
  const [spacing, setSpacing] = useState(270);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setSpacing(140);
      else if (w < 768) setSpacing(180);
      else if (w < 1024) setSpacing(220);
      else setSpacing(270);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return spacing;
}

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
  const cardSpacing = useCardSpacing();

  // auto shift center
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % clients.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="home-clients-section bg-[#f5e6c8] overflow-hidden text-center">

      {/* HEADING */}
      <h2 className="font-bold text-gray-800">
        Inspiring Client Journeys ✨
      </h2>

      {/* CARDS */}
      <div className="home-clients-stage">

        {clients.map((client, index) => {
          const offset = index - active;

          return (
            <motion.div
              key={index}
              animate={{
                x: offset * cardSpacing,
                scale: offset === 0 ? 1.2 : 0.85,
                opacity: Math.abs(offset) > 2 ? 0 : 1,
                zIndex: offset === 0 ? 10 : 5,
              }}
              transition={{ duration: 0.5 }}
              className="absolute client-card-wrap"
            >
              <div
                className={`w-full h-full rounded-[30px] overflow-hidden shadow-xl transition-all
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