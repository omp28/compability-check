"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Share2, RotateCw } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";

interface Option {
  id: string;
  text: string;
}

interface MatchResult {
  questionId: number;
  question: string;
  options: Option[];
  matched: boolean;
  playerAnswers: {
    [playerId: string]: {
      gender: string;
      answer: string;
      answerText: string;
    };
  };
}

interface Compatibility {
  level: string;
  message: string;
}

interface Summary {
  totalQuestions: number;
  matchedAnswers: number;
  unmatchedQuestions?: MatchResult[];
}

interface GameResultsProps {
  score: number;
  matchResults: MatchResult[];
  compatibility: Compatibility;
  summary: Summary;
}

const LoveMeter: React.FC<GameResultsProps> = ({
  score,
  matchResults,
  compatibility,
  summary,
}) => {
  const [showResults] = useState(false);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const router = useRouter();

  const mismatchedQuestions =
    summary.unmatchedQuestions ||
    matchResults.filter((result) => !result.matched);

  useEffect(() => {
    if (showResults && score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [showResults, score]);

  useEffect(() => {
    localStorage.removeItem("gameSession");
  }, []);

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

  const handleCleaGameSession = () => {
    localStorage.removeItem("gameSession");
    router.push("/");
  };

  const flipCard = (cardId: string) => {
    setFlippedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const renderGenderIcon = (gender: string) => {
    switch (gender.toLowerCase()) {
      case "male":
        return <FaMale className="w-5 h-5 text-blue-500" />;
      case "female":
        return <FaFemale className="w-5 h-5 text-pink-500" />;
      default:
        return null;
    }
  };

  const getPlayerDetails = (result: MatchResult) => {
    const playerIds = Object.keys(result.playerAnswers);
    return playerIds.map((playerId) => ({
      answer: result.playerAnswers[playerId].answerText,
      gender: result.playerAnswers[playerId].gender,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-pink-50 p-8 rounded-3xl shadow-xl pb-16">
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
        <h2 className="text-2xl font-bold mb-2 text-black">Your Love Potion</h2>
        <p className="mb-4 text-black">{compatibility.message}</p>
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
            <h3 className="text-lg font-semibold mb-2 p-4 bg-pink-100 text-black">
              {result.question}
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4">
              {getPlayerDetails(result).map((playerDetail, index) => (
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
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600 ">Partner {index + 1}</p>
                        {renderGenderIcon(playerDetail.gender)}
                      </div>
                      <p className=" text-[10px] text-center text-gray-600">
                        Click to reveal answer
                      </p>
                      <RotateCw className="mt-2 mx-auto text-gray-400" />
                    </div>
                    <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow p-4 flex flex-col justify-between rotate-y-180">
                      <div className="flex justify-between items-center">
                        <p className=" text-gray-600">Partner {index + 1}</p>
                        {renderGenderIcon(playerDetail.gender)}
                      </div>
                      <p className="font-medium text-black">
                        {playerDetail.answer}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleCleaGameSession}
        className="bg-red-500 text-white px-6 py-3 rounded-t-xl hover:bg-red-600 transition-all fixed bottom-0 left-0 right-0 mx-auto"
      >
        Start New Game
      </button>
    </div>
  );
};

export default LoveMeter;
