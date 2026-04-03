"use client";

import { motion } from "framer-motion";
import React from "react";

type Option = {
  label: string;
  value: string;
};

type SegmentedToggleProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export default function SegmentedToggle({
  options,
  value,
  onChange,
}: SegmentedToggleProps) {
  return (
    <div className="relative flex bg-gray-100 rounded-button p-1 w-fit">
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="relative px-6 py-2 rounded-button text-sm font-medium z-10"
          >
            {isActive && (
              <motion.div
                layoutId="toggle-bg"
                className="absolute inset-0 bg-white rounded-button shadow-soft"
                transition={{ duration: 0.2 }}
              />
            )}
            <span
              className={`relative ${
                isActive ? "text-primary" : "text-gray-600"
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}