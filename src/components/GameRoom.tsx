import { useState, useEffect } from "react";
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
import LoveMeter from "./LoveMeter";
import MatchResultsViewer from "./MatchResultsViewer";
import { Heart, Clock, RefreshCw } from "lucide-react";

let socket: Socket;

export const GameRoom = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-purple-100 p-4">
      <AnimatePresence>
        {disconnected && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-30"
          >
            <p className="font-semibold">
              Disconnected. Trying to reconnect...
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-4 text-center z-30"
          >
            <p className="font-semibold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {gameState.gameStatus === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center min-h-screen"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              >
                <Heart
                  className="w-16 h-16 text-pink-500 mx-auto mb-6"
                  fill="currentColor"
                />
              </motion.div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Waiting for your soulmate...
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Room Code:{" "}
                <span className="font-bold text-pink-600">
                  {session.roomId}
                </span>
              </p>
              <ShareLinkButton roomId={session.roomId} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCleaGameSession}
                className="mt-8 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all font-semibold"
              >
                Start New Love Story
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameState.gameStatus === "in_progress" && (
          <motion.div
            key="in-progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 mt-10"
          >
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-pink-500 mr-2" />
                <TimeLoader seconds={gameState.timeRemaining} />
              </div>
              <div className="text-lg font-semibold text-gray-700">
                Q{gameState.currentQuestion + 1}/{gameState.totalQuestions}
              </div>
            </div>

            <AnimatePresence>
              {hasAnswered && !gameState.partnerSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-green-600 mb-4 font-medium"
                >
                  Waiting for your partner&apos;s answer...
                </motion.div>
              )}

              {!hasAnswered && gameState.partnerSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-green-600 mb-4 font-medium"
                >
                  Your partner has answered! Your turn now.
                </motion.div>
              )}
            </AnimatePresence>

            <QuestionCard
              question={gameState.question?.text || "Loading question..."}
              options={gameState.question?.options || []}
              onSubmit={handleAnswer}
              isLoading={hasAnswered}
            />
          </motion.div>
        )}

        {gameState.gameStatus === "completed" && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl mx-auto mt-10"
          >
            <LoveMeter
              score={gameState.score || 0}
              compatibility={
                gameState.compatibility || {
                  level: "Low",
                  message: "Keep learning!",
                }
              }
              matchResults={gameState.matchResults || []}
              summary={
                gameState.summary || {
                  totalQuestions: gameState.totalQuestions,
                  matchedAnswers: 0,
                }
              }
            />
            {gameState.matchResults && (
              <MatchResultsViewer
                gameState={gameState}
                socket={socket}
                roomCode={session.roomId}
              />
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCleaGameSession}
              className="mt-8 bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-all font-semibold flex items-center justify-center mx-auto"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
