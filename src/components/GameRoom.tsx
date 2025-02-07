import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QuestionCard } from "./QuestionCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  GameState,
  GameSession,
  GameCompleteState,
  PlayerAnswer,
} from "@/types/game";
import { io, Socket } from "socket.io-client";
import ShareLinkButton from "./ShareLink";
import { TimeLoader } from "./TimeLoader";
import { Heart, RefreshCw, Sparkles } from "lucide-react";
import CubeCarousel from "./CubeCarousel";

let socket: Socket;

export const GameRoom = () => {
  // const [currentBg, setCurrentBg] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    totalQuestions: 10,
    timeRemaining: 40,
    partnerSubmitted: false,
    gameStatus: "waiting",
    matchResults: [],
  });
  const [session, setSession] = useState<GameSession | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [error, setError] = useState("");

  const texts = [
    "Deepen Connection",
    "Have Fun Together",
    "Learn About Each Other",
    "Create Lasting Memories",
    "Laugh Together",
    "Grow Closer",
    "Share Joy",
    "Discover New Things",
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts.length]);

  useEffect(() => {
    const storedSession = localStorage.getItem("gameSession");
    if (!storedSession) {
      router.push("/");
      return;
    }

    const sessionData = JSON.parse(storedSession) as GameSession;
    if (Date.now() > sessionData.expiryTime) {
      localStorage.removeItem("gameSession");
      router.push("/");
      return;
    }

    setSession(sessionData);
    initializeSocket(sessionData);

    return () => {
      socket?.disconnect();
    };
  }, [router]);

  const handleCleaGameSession = () => {
    localStorage.removeItem("gameSession");
    router.push("/");
  };

  const initializeSocket = (sessionData: GameSession) => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      query: {
        roomId: sessionData.roomId,
        gender: sessionData.gender,
      },
    });

    socket.on("connect", () => {
      socket.emit("join_game", {
        roomCode: sessionData.roomId,
        gender: sessionData.gender,
      });
      setDisconnected(false);
    });

    socket.on("disconnect", () => {
      setDisconnected(true);
    });

    socket.on("game_state", (newState: GameState) => {
      setGameState(newState);
      setHasAnswered(false);
    });

    socket.on("partner_connected", () => {
      setError("");
      setGameState((prev) => ({
        ...prev,
        gameStatus: "in_progress",
      }));
    });

    socket.on("question", (questionData) => {
      setHasAnswered(false);
      setGameState((prev) => ({
        ...prev,
        currentQuestion: questionData.currentQuestion,
        timeRemaining: 40,
        question: {
          text: questionData.question.text,
          options: questionData.question.options,
        },
        partnerSubmitted: false,
      }));
    });

    socket.on("answer_submitted", ({ answeredBy, gameState }) => {
      setGameState((prev) => ({
        ...prev,
        partnerSubmitted: answeredBy !== socket.id,
        timeRemaining: gameState.timeRemaining,
      }));
    });

    socket.on("both_answered", () => {
      setGameState((prev) => ({
        ...prev,
        partnerSubmitted: false,
        timeRemaining: 40,
      }));
    });

    socket.on("timer_update", ({ timeRemaining }) => {
      setGameState((prev) => ({
        ...prev,
        timeRemaining,
      }));
    });

    socket.on("question_timeout", () => {
      console.log("Question timed out");
      setHasAnswered(false);
      setGameState((prev) => ({
        ...prev,
        partnerSubmitted: false,
        timeRemaining: 40,
      }));
    });

    socket.on("game_complete", (finalState: GameCompleteState) => {
      // Retrieve user session
      const storedSessionString = localStorage.getItem("gameSession");
      const userSession = storedSessionString
        ? JSON.parse(storedSessionString)
        : null;

      if (!userSession) {
        console.error("No game session found");
        return;
      }

      if (finalState.summary && finalState.summary.matchedAnswers === 0) {
        setError("No matches found. Please try again.");
        return;
      }

      const transformedMatchResults = finalState.matchResults?.map((result) => {
        const playerIds = Object.keys(result.playerAnswers);

        // Determine player answers based on available socket IDs
        const playerAnswers = playerIds.reduce(
          (acc: Record<string, PlayerAnswer>, playerId) => {
            const playerData = result.playerAnswers[playerId];
            acc[playerId] = {
              gender: playerData.gender,
              answer: playerData.answer,
              answerText: playerData.answerText,
            };
            return acc;
          },
          {}
        );

        return {
          ...result,
          question: result.question,
          playerAnswers: playerAnswers,
        };
      });

      setGameState((prev) => ({
        ...prev,
        gameStatus: "completed",
        score: finalState.score,
        matchResults: transformedMatchResults,
        compatibility: finalState.compatibility,
        summary: {
          ...finalState.summary,
          unmatchedQuestions: (finalState.summary.unmatchedQuestions ?? []).map(
            (unmatchedQ) => ({
              ...unmatchedQ,
              playerAnswers: unmatchedQ.playerAnswers,
            })
          ),
        },
      }));
    });

    socket.on("partner_disconnected", () => {
      setError("Your partner has disconnected. Please wait...");
    });
  };

  const handleAnswer = (optionId: string) => {
    if (!hasAnswered) {
      setHasAnswered(true);
      if (!socket) return;
      socket.emit("submit_answer", {
        roomCode: session?.roomId,
        answer: optionId,
      });
    }
  };

  if (!session) return null;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          // backgroundImage: `url(/langin-bg/3.jpg)`,
          backgroundImage: `url(/date-night/7.jpg)`,
          opacity: 0.3,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 " />

      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 "
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <Heart className="w-24 h-24 text-white" fill="white" />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0"
              >
                <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300" />
                <Sparkles className="absolute -bottom-4 -left-4 w-8 h-8 text-yellow-300" />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="relative min-h-screen flex flex-col items-center justify-center">
            {/* Error and Disconnect Notifications */}
            <AnimatePresence>
              {disconnected && (
                <motion.div
                  {...fadeInUp}
                  className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-30 shadow-lg"
                >
                  <p className="font-semibold flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Reconnecting to your love story...
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  {...fadeInUp}
                  className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-4 text-center z-30 shadow-lg"
                >
                  <p className="font-semibold">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {gameState.gameStatus === "waiting" && (
                <motion.div
                  key="waiting"
                  className="flex items-center justify-center w-full max-w-md mx-auto"
                  {...fadeInUp}
                >
                  <div className="w-full bg-black/5 backdrop-blur-sm rounded-3xl shadow-2xl p-8  border border-pink-800/20">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative mb-8"
                    >
                      <Heart
                        className="w-20 h-20 mx-auto text-pink-500"
                        fill="currentColor"
                      />
                      <motion.div
                        animate={{
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-600" />
                      </motion.div>
                    </motion.div>

                    <div className="h-16 mb-6">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentTextIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <h2 className="text-xl font-bold text-white">
                            {texts[currentTextIndex]}
                          </h2>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="space-y-6">
                      <ShareLinkButton roomId={session.roomId} />
                      <div className="bg-pink-50 rounded-2xl p-4">
                        <p className="text-lg text-gray-700">
                          Your Room Code:{" "}
                          <span className="font-bold text-pink-600 text-xl">
                            {session.roomId}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {gameState.gameStatus === "in_progress" && (
                <motion.div
                  key="in-progress"
                  {...fadeInUp}
                  className="w-full max-w-2xl mx-auto"
                >
                  <TimeLoader seconds={gameState.timeRemaining} />

                  <AnimatePresence>
                    <QuestionCard
                      question={
                        gameState.question?.text || "Loading question..."
                      }
                      options={gameState.question?.options || []}
                      onSubmit={handleAnswer}
                      isLoading={hasAnswered}
                      hasAnswered={hasAnswered}
                      partnerSubmitted={gameState.partnerSubmitted}
                    />
                  </AnimatePresence>
                </motion.div>
              )}

              {gameState.gameStatus === "completed" && (
                <motion.div
                  key="completed"
                  {...fadeInUp}
                  className="w-full max-w-2xl mx-auto "
                >
                  <CubeCarousel
                    score={gameState.score || 0}
                    compatibility={
                      gameState.compatibility || {
                        level: "Low",
                        message: "Keep learning!",
                      }
                    }
                    matchResults={gameState.matchResults || []}
                    summary={{
                      totalQuestions: gameState.totalQuestions,
                      matchedAnswers: gameState.matchResults?.length || 0,
                    }}
                    socket={socket}
                    roomCode={session.roomId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCleaGameSession}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-4 rounded-t-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Start New Game
      </motion.button>
    </div>
  );
};

export default GameRoom;
