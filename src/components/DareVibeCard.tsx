import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export interface DatePlannerResult {
  dateVibe: string;
  aesthetic: string;
  emoji: string;
  coupleHashtag: string;
  generatedAt: string;
}

const DateVibeCard = ({
  datePlan,
  isLoading,
}: {
  datePlan: DatePlannerResult | null;
  isLoading: boolean;
}) => {
  // Generate a random number once when the component mounts
  const [randomImageNumber] = useState<number>(
    () => Math.floor(Math.random() * 4) + 1
  );

  if (!datePlan && !isLoading) return null;

  return (
    <Card className="relative w-full max-w-md h-[600px] overflow-hidden rounded-xl">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(/date-night/${1}.jpg)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

      {isLoading ? (
        <div className="relative h-full flex items-center justify-center p-6">
          <div className="space-y-4 animate-pulse w-full">
            <div className="h-24 bg-white/20 rounded-lg" />
            <div className="h-12 bg-white/20 rounded-lg" />
            <div className="h-8 bg-white/20 rounded-lg w-2/3 mx-auto" />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full flex flex-col justify-end p-6 text-white"
        >
          {/* Emoji Spotlight */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-7xl mb-6 text-center absolute top-28 left-0 right-0"
          >
            {datePlan?.emoji}
          </motion.div>

          {/* Date Vibe */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h3 className="text-sm uppercase tracking-wider mb-2 text-white/70">
              Your Date Vibe
            </h3>
            <p className="text-2xl font-bold leading-tight">
              {datePlan?.dateVibe}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-white rounded-full" />
              <span className="text-lg font-medium">{datePlan?.aesthetic}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-white rounded-full" />
              <span className="text-lg font-medium">
                {datePlan?.coupleHashtag}
              </span>
            </div>
          </motion.div>

          {/* Generated Time */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-[8px] text-white/50"
          >
            Generated {datePlan?.generatedAt}
          </motion.div>
        </motion.div>
      )}
    </Card>
  );
};

export default DateVibeCard;
