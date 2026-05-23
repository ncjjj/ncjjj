"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function StartupHero() {
  const images = [
    "/awards/award1.png",
    "/awards/award2.png",
    "/awards/award3.png",
    "/awards/award4.png",
  ];

  const [index, setIndex] = useState(0);

  // 🔄 Auto change images
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000); // change every 3 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black ">

      {/* 🖼️ BACKGROUND IMAGE SLIDER */}
      <AnimatePresence>
        <motion.img
          key={images[index]}
          src={images[index]}
          alt="background"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute w-full h-full object-cover z-0"
         style={{zIndex:99}}
        />
      </AnimatePresence>

      {/* 🌑 DARK OVERLAY (IMPORTANT) */}
      <div className="absolute inset-0 bg-black/100 z-10" />

      {/* ✨ CONTENT */}
      <div className="relative z-20 text-center px-6 max-w-4xl">

        {/* BADGE */}
        <span className="inline-block px-4 py-2 rounded-full border border-yellow-500/40 text-yellow-400 text-lg mb-6">
          🚀 BUILD YOUR STARTUP
        </span>

        {/* HEADING */}
        <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
          Got an Idea!{" "}
          <span className="text-yellow-400">Let’s Launch It 🚀</span>
        </h1>

        {/* SUBTEXT */}
        <p className="text-gray-300 mb-8 text-lg">
          Turn your startup idea into a real business with legal, tax & compliance support.
        </p>

        {/* FEATURES */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {["Startup Registration", "Legal Documentation", "Business Setup", "Compliance"].map((item, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-xl border border-yellow-500/20 text-gray-200 text-sm"
            >
              {item}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/login">
          <button className="px-10 py-4 rounded-full bg-yellow-400 text-black font-semibold text-lg 
            shadow-[0_0_20px_rgba(250,204,21,0.7)] 
            hover:shadow-[0_0_40px_rgba(250,204,21,1)] 
            hover:scale-110 transition-all duration-300">
            Run With Startup ✨
          </button>
        </Link>

      </div>
    </section>
  );
}