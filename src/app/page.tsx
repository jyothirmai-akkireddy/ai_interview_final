"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
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
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute right-[-120px] bottom-[-120px] h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-[120px]" />

      <section className="relative z-10 flex flex-col items-center px-6 pt-20 pb-28 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl"
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
          className="mt-6 max-w-xl text-lg text-gray-600"
        >
          Adaptive mock interviews, real-time feedback, voice interaction, and
          deep performance analytics - all powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex gap-4"
        >
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-medium text-white shadow-lg transition hover:shadow-xl"
          >
            Get Started Free
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Login
          </Link>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-8 px-6 pb-28 md:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gray-100 bg-white/70 p-8 shadow-[0_10px_40px_rgba(37,99,235,0.08)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="relative z-10 px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold">
          Ready to level up your interview game?
        </h2>

        <p className="mt-4 text-gray-600">
          Start practicing with AI and build real confidence.
        </p>

        <Link
          href="/register"
          className="mt-8 inline-block rounded-xl bg-primary px-8 py-3 font-medium text-white shadow-lg transition hover:opacity-90"
        >
          Start Free Today
        </Link>
      </section>
    </main>
  );
}
