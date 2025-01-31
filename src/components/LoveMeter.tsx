"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Share2, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

interface MatchResult {
  questionId: number;
  matched: boolean;
  playerAnswers: [string, string];
  question: Question;
}

interface GameResultsProps {
  score: number;
  matchResults: MatchResult[];
  compatibility: {
    level: "Low" | "Medium" | "High";
    message: string;
  };
  summary: {
    totalQuestions: number;
    matchedAnswers: number;
  };
}

const LoveMeter: React.FC<GameResultsProps> = ({
  score,
  matchResults,
  compatibility,
  summary,
}) => {
  const [showResults, setShowResults] = useState(false);
  const [lovePotion, setLovePotion] = useState(score);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);

  const mismatchedQuestions = matchResults.filter((result) => !result.matched);

  useEffect(() => {
    if (showResults && score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [showResults, score]);

  const shareResults = () => {
    const text = `We scored ${Math.round(score)}% on our Love Meter! ${
      compatibility.message
    }`;
    if (navigator.share) {
      navigator.share({
        title: "Our Love Meter Results",
        text: text,
        url: window.location.href,
      });
    } else {
      alert(
        "Sharing is not supported on this browser. Here's your result to copy:\n\n" +
          text
      );
    }
  };

  const getOptionText = (questionId: number, optionId: string) => {
    const question = matchResults.find(
      (r) => r.questionId === questionId
    )?.question;
    return question?.options.find((o) => o.id === optionId)?.text || "Unknown";
  };

  const flipCard = (cardId: string) => {
    setFlippedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  return (
    <div className="max-w-md mx-auto bg-pink-50 p-8 rounded-3xl shadow-xl">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
        Love Meter
      </h1>

      <motion.div
        className="relative w-64 h-64 mx-auto mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M10,30 A20,20,0,0,1,50,30 A20,20,0,0,1,90,30 Q90,60,50,90 Q10,60,10,30 Z"
            fill="none"
            stroke="#FFC0CB"
            strokeWidth="3"
          />
          <motion.path
            d="M10,30 A20,20,0,0,1,50,30 A20,20,0,0,1,90,30 Q90,60,50,90 Q10,60,10,30 Z"
            fill="#FF69B4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: score / 100 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {Math.round(score)}%
        </motion.div>
      </motion.div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Love Potion</h2>
        <p className="mb-4">{compatibility.message}</p>
        <Button onClick={shareResults} className="mb-4">
          <Share2 className="mr-2 h-4 w-4" /> Share Results
        </Button>
      </div>

      <div className="space-y-4">
        {mismatchedQuestions.map((result) => (
          <div
            key={result.questionId}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <h3 className="text-lg font-semibold mb-2 p-4 bg-pink-100">
              {result.question.text}
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4">
              {[0, 1].map((index) => (
                <div key={index} className="perspective">
                  <motion.div
                    className="w-full h-32 relative preserve-3d cursor-pointer"
                    initial={false}
                    animate={{
                      rotateY: flippedCards.includes(
                        `${result.questionId}-${index}`
                      )
                        ? 180
                        : 0,
                    }}
                    transition={{ duration: 0.6 }}
                    onClick={() => flipCard(`${result.questionId}-${index}`)}
                  >
                    <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow p-4 flex flex-col justify-between">
                      <p className="text-gray-600">Partner {index + 1}</p>
                      <p className="text-sm">Click to reveal answer</p>
                      <RotateCw className="mt-2 mx-auto text-gray-400" />
                    </div>
                    <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow p-4 flex flex-col justify-between rotate-y-180">
                      <p className="text-sm text-gray-600">
                        Partner {index + 1}
                      </p>
                      <p className="font-medium">
                        {getOptionText(
                          result.questionId,
                          result.playerAnswers[index]
                        )}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Love Potion Meter</h3>
        <div className="relative pt-1">
          <Progress value={lovePotion} className="h-4" />
          <motion.div
            className="absolute left-0 top-0 mt-1"
            style={{ left: `${lovePotion}%` }}
            animate={{ x: -10, y: -10 }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              duration: 0.5,
            }}
          >
            <Heart className="text-red-500 fill-current" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoveMeter;
