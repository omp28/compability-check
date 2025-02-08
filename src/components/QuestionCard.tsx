"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  HeartCrack,
  SendHorizontal,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Option } from "@/types/game";
import coupleQuotes from "../helpers/quotes";

interface QuestionProps {
  question: string;
  options: Option[];
  onSubmit: (optionId: string) => void;
  isLoading?: boolean;
  hasAnswered?: boolean;
  partnerSubmitted?: boolean;
}

export function QuestionCard({
  question,
  options,
  onSubmit,
  hasAnswered,
  partnerSubmitted,
}: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(question);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (currentQuestion !== question) {
      setSelectedOption(null);
      setIsSubmitting(false);
      setIsAnswerSubmitted(false);
      setCurrentQuestion(question);
    }
  }, [question, currentQuestion]);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % coupleQuotes.length);
    }, 10000);

    return () => clearInterval(quoteInterval);
  }, []);

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
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-8   ">
      <motion.div
        key={question}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <AnimatePresence>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                opacity: 0.8,
                scale: 0.5,
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100,
              }}
              animate={{
                opacity: 0,
                scale: 0,
                x: Math.random() * 400 - 200,
                y: -200,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut",
              }}
            >
              <Heart className="text-pink-400" fill="currentColor" size={26} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Question header */}
        <motion.div
          className="m-4 text-center relative text-white "
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sparkles
            className="absolute -top-2 -left-2 text-pink-400"
            size={20}
          />
          <h2 className="text-xl font-medium text-white leading-tight ">
            {question}
          </h2>
          <Sparkles
            className="absolute -bottom-2 -right-2 text-pink-400"
            size={20}
          />
        </motion.div>

        {/* options */}

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
                  : "hover:border-pink-400 hover:bg-pink-50 hover:text-black",
                selectedOption === option.id
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 text-gray-700"
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-3 ",
                  selectedOption === option.id ? " text-black" : " text-white"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ",
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

        {hasAnswered && !partnerSubmitted && (
          <span className="text-sm text-gray-500 ml-2 ">
            You’ve answered—now waiting for your fave to respond! ✨🌙
          </span>
        )}
        {!hasAnswered && partnerSubmitted && (
          <span className="text-sm text-gray-500 ml-2 ">
            They’ve answered—now it’s your turn to respond! ✨🌙
          </span>
        )}

        <motion.button
          whileHover={!isAnswerSubmitted ? { scale: 1.05 } : {}}
          whileTap={!isAnswerSubmitted ? { scale: 0.95 } : {}}
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting || isAnswerSubmitted}
          className={cn(
            "mt-4 w-full py-4 px-6 rounded-2xl font-medium",
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

        {/* Display the quote */}
        <motion.div
          className="text-center text-pink-600 italic mt-6 text-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          key={quoteIndex}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
            >
              {coupleQuotes[quoteIndex]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
