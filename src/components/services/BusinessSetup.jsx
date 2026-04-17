"use client";

import { motion } from "framer-motion";

export default function BusinessSetup() {
  const services = [
    {
      title: "Startup India Registration",
      desc: "Get recognized under Startup India and unlock benefits.",
      icon: "🚀",
    },
    {
      title: "Private Limited Company",
      desc: "Register your company with full legal compliance.",
      icon: "🏢",
    },
    {
      title: "LLP Formation",
      desc: "Flexible and cost-effective partnership structure.",
      icon: "🤝",
    },
    {
      title: "Partnership Firm",
      desc: "Simple business setup with shared ownership.",
      icon: "📄",
    },
  ];

  const steps = ["Consultation", "Documentation", "Registration", "Launch"];

  return (
    <section className="min-h-screen px-6 py-20 bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0] relative overflow-hidden">

      {/* ✨ BACKGROUND GLOW */}
      <div className="absolute w-[400px] h-[400px] bg-yellow-500/20 blur-[120px] top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-yellow-400/20 blur-[120px] bottom-[-100px] right-[-100px]" />

      <div className="max-w-6xl mx-auto">

        {/* 🔥 HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="px-4 py-2 rounded-full bg-white/50 border border-yellow-600/30 text-[#2c2416] text-sm">
            BUSINESS SETUP
          </span>

          <h1 className="text-4xl md:text-5xl font-bold mt-6 text-[#2c2416]">
            Launch Your{" "}
            <span className="text-yellow-600">
              Business 🚀
            </span>
          </h1>

          <p className="text-[#5a5040] mt-4 max-w-xl mx-auto">
            Start your business with the right structure, compliance, and expert guidance.
          </p>
        </motion.div>

        {/* 💎 SERVICES GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">

          {services.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.03 }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-yellow-600/20 shadow-lg"
            >
              <div className="text-3xl mb-4">{item.icon}</div>

              <h3 className="text-lg font-semibold text-[#2c2416] mb-2">
                {item.title}
              </h3>

              <p className="text-[#5a5040] text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}

        </div>

        {/* ⚙️ PROCESS */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 rounded-full border border-yellow-600/20 bg-white/70"
            >
              <div className="w-7 h-7 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <span className="text-[#2c2416] text-sm">{step}</span>
            </div>
          ))}
        </motion.div>

        {/* 🚀 CTA */}
        <div className="text-center">

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold text-lg shadow-lg"
          >
            Start Your Business ✨
          </motion.button>

          <p className="text-[#5a5040] mt-4">
            Turn your idea into a legally registered business today.
          </p>

        </div>

      </div>
    </section>
  );
}