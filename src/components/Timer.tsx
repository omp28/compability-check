import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  seconds: number;
}

export const Timer = ({ seconds }: TimerProps) => {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 1 / seconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div className="relative w-20 h-20">
      <motion.div
        className="absolute inset-0 border-4 rounded-full"
        style={{
          borderColor: `rgb(${255 * (1 - progress)}, ${255 * progress}, 0)`,
          rotate: -90,
        }}
        animate={{
          pathLength: progress,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {Math.ceil(seconds * progress)}
      </div>
    </div>
  );
};
