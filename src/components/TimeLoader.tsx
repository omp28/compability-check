"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimeLoader {
  seconds: number;
  totalDuration?: number;
}

export const TimeLoader = ({ seconds, totalDuration = 40 }: TimeLoader) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const progress = timeLeft / totalDuration;

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-pink-200 overflow-hidden  ">
      <motion.div
        className="h-full relative "
        style={{
          background: `linear-gradient(to right, 
            hsl(0, ${100 * progress}%, 50%), 
            hsl(340, ${100 * progress}%, 70%))`,
        }}
        initial={{ x: "0%" }}
        animate={{ x: `${(progress - 1) * 100}%` }}
        transition={{ duration: 1, ease: "linear" }}
      >
        <motion.div
          className="absolute right-0 top-1 -translate-y-1/2 -translate-x-1/2 "
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.25, 0.75, 1],
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <motion.div
            className="w-8 h-8 relative flex items-center justify-center  "
            style={{
              background: `linear-gradient(135deg, 
                hsl(0, ${100 * progress}%, 50%), 
                hsl(340, ${100 * progress}%, 70%))`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <motion.div
              className="w-6 h-6 absolute"
              style={{
                clipPath:
                  "path('M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z')",
                background: "white",
              }}
            />
            <span className="text-sm font-bold z-10 text-black">
              {timeLeft}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
