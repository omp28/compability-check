"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HeartCrack, SendHorizontal, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Option } from "@/types/game";

interface QuestionProps {
  question: string;
  options: Option[];
  onSubmit: (optionId: string) => void;
  isLoading?: boolean;
}

export function QuestionCard({ question, options, onSubmit }: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(question);

  useEffect(() => {
    if (currentQuestion !== question) {
      setSelectedOption(null);
      setIsSubmitting(false);
      setIsAnswerSubmitted(false);
      setCurrentQuestion(question);
    }
  }, [question, currentQuestion]);

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting || isAnswerSubmitted) return;

    setIsSubmitting(true);
    await onSubmit(selectedOption);
    setIsSubmitting(false);
    setIsAnswerSubmitted(true);
  };

  const handleOptionSelect = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionId);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-red-100 to-purple-100 p-4">
      <motion.div
        key={question}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="relative bg-white rounded-3xl shadow-xl p-8 border-2 border-pink-200">
          <motion.div
            className="absolute -top-4 -left-4 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Heart className="w-5 h-5 text-white" fill="white" />
          </motion.div>
          <motion.div
            className="absolute -bottom-4 -right-4 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center"
            animate={{ rotate: -360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Heart className="w-5 h-5 text-white" fill="white" />
          </motion.div>

          <motion.div
            className="mb-8 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 leading-tight">
              {question}
            </h2>
          </motion.div>

          <AnimatePresence>
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!isAnswerSubmitted ? { scale: 1.03 } : {}}
                whileTap={!isAnswerSubmitted ? { scale: 0.98 } : {}}
                onClick={() => handleOptionSelect(option.id)}
                disabled={isAnswerSubmitted}
                className={cn(
                  "w-full p-4 rounded-2xl text-left transition-all duration-200 mb-3",
                  "border-2",
                  isAnswerSubmitted
                    ? "cursor-not-allowed opacity-75"
                    : "hover:border-pink-400 hover:bg-pink-50",
                  selectedOption === option.id
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 text-gray-700"
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      selectedOption === option.id
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option.text}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={!isAnswerSubmitted ? { scale: 1.05 } : {}}
            whileTap={!isAnswerSubmitted ? { scale: 0.95 } : {}}
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting || isAnswerSubmitted}
            className={cn(
              "mt-8 w-full py-4 px-6 rounded-2xl font-medium",
              "transition-all duration-200 flex items-center justify-center gap-2",
              isAnswerSubmitted
                ? "bg-green-500 text-white cursor-not-allowed"
                : selectedOption
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <HeartCrack className="w-5 h-5 animate-pulse" />
                Sending...
              </>
            ) : isAnswerSubmitted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Answer Submitted
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
