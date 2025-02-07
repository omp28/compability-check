import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Heart } from "lucide-react";
import type { Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCallback } from "react";

interface PlayerAnswer {
  answerText: string;
}

interface MatchResultItem {
  question: string;
  matched: boolean;
  playerAnswers: {
    male: PlayerAnswer;
    female: PlayerAnswer;
  };
}

interface MatchResultsData {
  matchResults: MatchResultItem[];
}

interface GameState {
  matchResults: Array<{
    questionId: number;
    question: string;
    matched: boolean;
    playerAnswers: {
      [key: string]: {
        gender: string;
        answer: string;
        answerText: string;
      };
    };
  }>;
}

interface MatchResultsViewerProps {
  gameState: GameState;
  socket: Socket;
  roomCode: string;
}

export interface DatePlannerResult {
  dateVibe: string;
  aesthetic: string;
  emoji: string;
  coupleHashtag: string;
  generatedAt: string;
}

const questionEmojis: { [key: string]: string } = {
  "What's your ideal date night?": "💑",
  "How do you prefer to spend a weekend?": "🌞",
  "What type of vacation excites you most?": "✈️",
  "What's your favorite type of cuisine?": "🍽️",
  "What's your go-to movie genre?": "🎬",
};

const transformMatchData = (gameState: GameState): MatchResultsData => {
  return {
    matchResults: gameState.matchResults.map((result) => {
      const maleAnswer = Object.values(result.playerAnswers).find(
        (answer) => answer.gender === "male"
      );
      const femaleAnswer = Object.values(result.playerAnswers).find(
        (answer) => answer.gender === "female"
      );

      const emoji = questionEmojis[result.question] || "❓";
      const questionWithEmoji = `${result.question} ${emoji}`;

      return {
        question: questionWithEmoji,
        matched: result.matched,
        playerAnswers: {
          male: { answerText: maleAnswer?.answerText || "" },
          female: { answerText: femaleAnswer?.answerText || "" },
        },
      };
    }),
  };
};

const MatchResultsViewer = ({
  gameState,
  socket,
  roomCode,
  onDatePlanGenerated,
}: MatchResultsViewerProps & {
  onDatePlanGenerated: (plan: DatePlannerResult | null) => void;
}) => {
  const [gifUrl, setGifUrl] = useState<string>("");
  // const [datePlan, setDatePlan] = useState<DatePlannerResult | null>(null);
  const [isGifLoading, setIsGifLoading] = useState<boolean>(false);
  const [isDatePlanLoading, setIsDatePlanLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isInfiniteLoop, setIsInfiniteLoop] = useState(false);

  const matchData = transformMatchData(gameState);

  useEffect(() => {
    socket.on("gif_generation_started", () => setIsGifLoading(true));
    socket.on("date_planning_started", () => setIsDatePlanLoading(true));

    socket.on("gif_generated", (response) => {
      setIsGifLoading(false);
      if (response.success) {
        setGifUrl(response.url);
        startQuestionAnimation();
      }
    });

    socket.on("date_plan_generated", (response) => {
      setIsDatePlanLoading(false);
      if (response.success) {
        onDatePlanGenerated(response.plan);
      }
    });

    socket.on("gif_error", (errorMessage) => {
      setIsGifLoading(false);
      setError((prev) => `${prev} GIF Error: ${errorMessage}`);
    });

    socket.on("date_plan_error", (errorMessage) => {
      setIsDatePlanLoading(false);
      setError((prev) => `${prev} Date Plan Error: ${errorMessage}`);
      onDatePlanGenerated(null);
    });

    return () => {
      socket.off("gif_generation_started");
      socket.off("date_planning_started");
      socket.off("gif_generated");
      socket.off("date_plan_generated");
      socket.off("gif_error");
      socket.off("date_plan_error");
    };
  }, [socket, onDatePlanGenerated]);

  const startQuestionAnimation = () => {
    setCurrentQuestion(0);
    setShowAnswers(true);
  };

  useEffect(() => {
    if (showAnswers && isInfiniteLoop) {
      const timer = setTimeout(() => {
        setShowAnswers(false);
        setTimeout(() => {
          setCurrentQuestion(
            (prev) => (prev + 1) % matchData.matchResults.length
          );
          setShowAnswers(true);
        }, 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [
    currentQuestion,
    showAnswers,
    isInfiniteLoop,
    matchData.matchResults.length,
  ]);

  const generateResults = useCallback(() => {
    setError("");
    socket.emit("request_match_results", { roomCode, matchData });
  }, [roomCode]);

  const toggleInfiniteLoop = useCallback(() => {
    setIsInfiniteLoop(!isInfiniteLoop);
    if (!isInfiniteLoop) {
      // Start the animation from the beginning
      setCurrentQuestion(0);
      setShowAnswers(true);
    }
  }, [isInfiniteLoop]);

  useEffect(() => {
    generateResults();
    toggleInfiniteLoop();
  }, [generateResults, toggleInfiniteLoop]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-pink-100 to-red-200 overflow-hidden">
      <div className="h-full w-full flex flex-col">
        {error && (
          <p className="text-red-500 text-sm text-center bg-white/80 rounded-lg p-2 m-4">
            {error}
          </p>
        )}

        <Card className="flex-1 bg-white/90 shadow-lg rounded-none border-0">
          <CardContent className="p-0 h-full">
            {gifUrl ? (
              <div className="relative h-full">
                <Image
                  src={gifUrl || "/placeholder.svg"}
                  alt="Match Results Animation"
                  layout="fill"
                  objectFit="cover"
                  className="w-full h-full"
                />
                <AnimatePresence>
                  {showAnswers && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-b from-pink-500/50 to-red-500/5 p-6 flex flex-col items-center justify-center"
                    >
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="text-3xl text-white text-center font-bold mb-8 shadow-text"
                      >
                        {matchData.matchResults[currentQuestion].question}
                      </motion.div>
                      <div className="flex flex-col w-full max-w-2xl space-y-6">
                        <motion.div
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -50, opacity: 0 }}
                          className="bg-blue-600/90 p-4 rounded-lg"
                        >
                          <div className="text-white text-lg">His Answer:</div>
                          <div className="text-white font-bold text-xl">
                            {
                              matchData.matchResults[currentQuestion]
                                .playerAnswers.male.answerText
                            }
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 50, opacity: 0 }}
                          className="bg-pink-600/90 p-4 rounded-lg"
                        >
                          <div className="text-white text-lg">Her Answer:</div>
                          <div className="text-white font-bold text-xl">
                            {
                              matchData.matchResults[currentQuestion]
                                .playerAnswers.female.answerText
                            }
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Heart className="w-24 h-24 text-red-500 animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="p-4 flex space-x-2">
          {!gifUrl && !isGifLoading && (
            <Button
              onClick={generateResults}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Generate Results
            </Button>
          )}

          {(isGifLoading || isDatePlanLoading) && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              <p className="text-red-500 font-medium">
                {isGifLoading
                  ? "Generating your love story..."
                  : "Planning your perfect date..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchResultsViewer;
