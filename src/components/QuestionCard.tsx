"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, HeartCrack, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  text: string;
}

interface QuestionProps {
  question: string;
  options: Option[];
  onSubmit: (optionId: string) => void;
  isLoading?: boolean;
}

export function QuestionCard({
  question,
  options,
  onSubmit,
  isLoading = false,
}: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit(selectedOption);
    setIsSubmitting(false);
    setSelectedOption(null);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-b from-pink-50 to-red-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="relative bg-white rounded-3xl shadow-xl p-6 border border-pink-100">
          <div className="absolute -top-3 -left-3">
            <Heart className="w-6 h-6 text-pink-400" fill="currentColor" />
          </div>
          <div className="absolute -bottom-3 -right-3">
            <Heart className="w-6 h-6 text-pink-400" fill="currentColor" />
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 leading-tight">
              {question}
            </h2>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "w-full p-4 rounded-2xl text-left transition-all duration-200",
                  "border-2 hover:border-pink-400 hover:bg-pink-50",
                  selectedOption === option.id
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 text-gray-700"
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-sm",
                      selectedOption === option.id
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {String.fromCharCode(65 + options.indexOf(option))}
                  </span>
                  {option.text}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting}
            className={cn(
              "mt-8 w-full py-4 px-6 rounded-2xl font-medium",
              "transition-all duration-200 flex items-center justify-center gap-2",
              selectedOption
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <HeartCrack className="w-5 h-5 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <SendHorizontal className="w-5 h-5" />
                Submit Answer
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
