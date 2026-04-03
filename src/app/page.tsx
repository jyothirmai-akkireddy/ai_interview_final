"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
return ( <main className="relative overflow-hidden min-h-screen">

```
  {/* Floating Glow Effects */}
  <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full" />
  <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-violet-500/20 blur-[120px] rounded-full" />

  {/* HERO */}
  <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28">

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl"
    >
      Master Interviews with
      <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
        {" "}AI Intelligence
      </span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="mt-6 text-gray-600 max-w-xl text-lg"
    >
      Adaptive mock interviews, real-time feedback, voice interaction,
      and deep performance analytics — all powered by AI.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mt-10 flex gap-4"
    >
      <Link
        href="/register"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium shadow-lg hover:shadow-xl transition"
      >
        Get Started Free
      </Link>

      <Link
        href="/login"
        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
      >
        Login
      </Link>
    </motion.div>
  </section>

  {/* FEATURES */}
  <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28 grid md:grid-cols-3 gap-8">

    {[
      {
        title: "Adaptive Interview Engine",
        desc: "Questions evolve based on your answers, difficulty, and tone.",
      },
      {
        title: "Real-Time AI Feedback",
        desc: "Live hints, strict evaluation, and performance insights.",
      },
      {
        title: "Performance Analytics",
        desc: "Track improvement over time with AI-generated summaries.",
      },
    ].map((feature, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        viewport={{ once: true }}
        className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.08)] border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {feature.title}
        </h3>
        <p className="mt-3 text-sm text-gray-600">
          {feature.desc}
        </p>
      </motion.div>
    ))}
  </section>

  {/* FINAL CTA */}
  <section className="relative z-10 text-center pb-24 px-6">
    <h2 className="text-3xl font-bold">
      Ready to level up your interview game?
    </h2>

    <p className="mt-4 text-gray-600">
      Start practicing with AI and build real confidence.
    </p>

    <Link
      href="/register"
      className="inline-block mt-8 px-8 py-3 rounded-xl bg-primary text-white font-medium shadow-lg hover:opacity-90 transition"
    >
      Start Free Today
    </Link>
  </section>
</main>


);
}
