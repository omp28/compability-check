import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Socket } from "socket.io-client";
import DateVibeCard from "./DareVibeCard";
import { motion, AnimatePresence } from "framer-motion";

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
}: MatchResultsViewerProps) => {
  const [gifUrl, setGifUrl] = useState<string>("");
  const [datePlan, setDatePlan] = useState<DatePlannerResult | null>(null);
  const [isGifLoading, setIsGifLoading] = useState<boolean>(false);
  const [isDatePlanLoading, setIsDatePlanLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

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
      if (response.success) setDatePlan(response.plan);
    });

    socket.on("gif_error", (errorMessage) => {
      setIsGifLoading(false);
      setError((prev) => `${prev} GIF Error: ${errorMessage}`);
    });

    socket.on("date_plan_error", (errorMessage) => {
      setIsDatePlanLoading(false);
      setError((prev) => `${prev} Date Plan Error: ${errorMessage}`);
    });

    return () => {
      socket.off("gif_generation_started");
      socket.off("date_planning_started");
      socket.off("gif_generated");
      socket.off("date_plan_generated");
      socket.off("gif_error");
      socket.off("date_plan_error");
    };
  }, [socket]);

  const startQuestionAnimation = () => {
    setCurrentQuestion(0);
    setShowAnswers(true);
  };

  useEffect(() => {
    if (showAnswers && currentQuestion < matchData.matchResults.length - 1) {
      const timer = setTimeout(() => {
        setShowAnswers(false);
        setTimeout(() => {
          setCurrentQuestion((prev) => prev + 1);
          setShowAnswers(true);
        }, 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, showAnswers, matchData.matchResults.length]);

  const generateResults = () => {
    setError("");
    socket.emit("request_match_results", { roomCode, matchData });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      <Button
        onClick={generateResults}
        disabled={isGifLoading || isDatePlanLoading}
        className="w-64 mx-auto block"
      >
        {isGifLoading || isDatePlanLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Results...
          </>
        ) : (
          "Generate Results"
        )}
      </Button>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {gifUrl && (
          <Card className="relative overflow-hidden">
            <img
              src={gifUrl}
              alt="Match Results Animation"
              className="w-full h-auto"
            />
            <AnimatePresence>
              {showAnswers && (
                <div className="absolute inset-0 bg-black/30 p-6 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="text-2xl text-white text-center font-bold mb-8"
                  >
                    {matchData.matchResults[currentQuestion].question}
                  </motion.div>
                  <div className="flex justify-between w-full px-8">
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -100, opacity: 0 }}
                      className="bg-blue-500/80 p-4 rounded-lg"
                    >
                      <div className="text-white text-lg">His Answer:</div>
                      <div className="text-white font-bold text-xl">
                        {
                          matchData.matchResults[currentQuestion].playerAnswers
                            .male.answerText
                        }
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 100, opacity: 0 }}
                      className="bg-pink-500/80 p-4 rounded-lg"
                    >
                      <div className="text-white text-lg">Her Answer:</div>
                      <div className="text-white font-bold text-xl">
                        {
                          matchData.matchResults[currentQuestion].playerAnswers
                            .female.answerText
                        }
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </Card>
        )}

        <DateVibeCard datePlan={datePlan} isLoading={isDatePlanLoading} />
      </div>
    </div>
  );
};

export default MatchResultsViewer;
