"use client";

import Lottie from "lottie-react";
import speakingAnim from "@/assets/avatar-speaking.json";
import idleAnim from "@/assets/avatar-idle.json";

type Props = {
  speaking: boolean;
  visible: boolean;
};

export default function AIAvatar({ speaking, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="w-full flex justify-center items-center mb-6">
      <div className="w-40 h-40">
        <Lottie
          animationData={speaking ? speakingAnim : idleAnim}
          loop
        />
      </div>
    </div>
  );
}