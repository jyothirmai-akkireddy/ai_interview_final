"use client";

export default function TribalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">

      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg,#ffffff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* glow blob */}
      <div
        className="absolute w-[500px] h-[500px] bg-purple-600 rounded-full blur-[200px] opacity-20"
        style={{
          top: "20%",
          left: "10%",
        }}
      />

      <div
        className="absolute w-[400px] h-[400px] bg-cyan-400 rounded-full blur-[200px] opacity-20"
        style={{
          bottom: "10%",
          right: "15%",
        }}
      />

    </div>
  );
}