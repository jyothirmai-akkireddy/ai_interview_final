"use client";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      rounded-2xl
      p-6
      shadow-lg
      shadow-black/40
      hover:border-purple-500/40
      transition
      ${className}
      `}
    >
      {children}
    </div>
  );
}