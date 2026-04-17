"use client";

import { motion } from "framer-motion";

export default function Accounting() {
  const features = [
    {
      title: "Bookkeeping",
      desc: "Accurate daily financial tracking for your business.",
      icon: "📒",
    },
    {
      title: "Financial Reports",
      desc: "Clear insights with balance sheets & profit analysis.",
      icon: "📊",
    },
    {
      title: "Tax Planning",
      desc: "Optimize your taxes and maximize savings legally.",
      icon: "💡",
    },
    {
      title: "Audit Support",
      desc: "End-to-end assistance for audits and compliance.",
      icon: "🛡️",
    },
  ];

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
            ACCOUNTING SERVICES
          </span>

          <h1 className="text-4xl md:text-5xl font-bold mt-6 text-[#2c2416]">
            Smart{" "}
            <span className="text-yellow-600">
              Accounting Solutions 💼
            </span>
          </h1>

          <p className="text-[#5a5040] mt-4 max-w-xl mx-auto">
            Manage your finances with clarity, compliance, and confidence.
            We help you track, plan, and grow your business efficiently.
          </p>
        </motion.div>

        {/* 💎 FEATURE GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">

          {features.map((item, index) => (
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

        {/* 📊 STATS */}
        <div className="flex flex-wrap justify-center gap-10 text-center mb-16">

          {[
            { value: "500+", label: "Clients Served" },
            { value: "99%", label: "Accuracy Rate" },
            { value: "24/7", label: "Support" },
          ].map((stat, i) => (
            <motion.div key={i}>
              <h2 className="text-3xl font-bold text-yellow-600">
                {stat.value}
              </h2>
              <p className="text-[#5a5040]">{stat.label}</p>
            </motion.div>
          ))}

        </div>

        {/* 🚀 CTA */}
        <div className="text-center">

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold text-lg shadow-lg"
          >
            Get Started with Accounting ✨
          </motion.button>

          <p className="text-[#5a5040] mt-4">
            Let us handle your finances while you focus on growth.
          </p>

        </div>

      </div>
    </section>
  );
}