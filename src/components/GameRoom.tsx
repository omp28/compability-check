import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QuestionCard } from "./QuestionCard";
import { motion } from "framer-motion";
import { Timer } from "./Timer";
import { GameState, GameSession } from "@/types/game";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const GameRoom = () => {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    totalQuestions: 10,
    timeRemaining: 40,
    partnerSubmitted: false,
    gameStatus: "waiting",
  });
  const [session, setSession] = useState<GameSession | null>(null);
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

  // In GameRoom component
  const initializeSocket = (sessionData: GameSession) => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      query: {
        roomId: sessionData.roomId,
        gender: sessionData.gender,
      },
    });

    // Emit join_game event after connection
    socket.on("connect", () => {
      socket.emit("join_game", {
        roomCode: sessionData.roomId,
        gender: sessionData.gender,
      });
      setDisconnected(false);
    });

    socket.on("game_state", (newState: GameState) => {
      setGameState(newState);
    });

    socket.on("partner_connected", () => {
      setError(""); // Clear any existing error
      setGameState((prev) => ({
        ...prev,
        gameStatus: "in_progress",
      }));
    });

    // In GameRoom component's initializeSocket function
    socket.on("answer_submitted", ({ answeredBy, gameState }) => {
      setGameState((prev) => ({
        ...prev,
        partnerSubmitted: answeredBy !== socket.id,
        timeRemaining: gameState.timeRemaining,
      }));
    });

    // Add a new event handler for when both players have answered
    socket.on("both_answered", () => {
      setGameState((prev) => ({
        ...prev,
        partnerSubmitted: false, // Reset partner submitted state
      }));
    });

    // Add question event listener
    socket.on("question", (questionData) => {
      setGameState((prev) => ({
        ...prev,
        currentQuestion: questionData.currentQuestion,
        question: {
          text: questionData.question.text,
          options: questionData.question.options,
        },
        timeRemaining: questionData.timeRemaining,
      }));
    });
  };

  const handleAnswer = (optionId: string) => {
    socket.emit("submit_answer", {
      roomId: session?.roomId,
      answer: optionId,
    });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-red-50">
      {disconnected && (
        <div className="fixed top-0 w-full bg-red-500 text-white p-2 text-center">
          Disconnected. Trying to reconnect...
        </div>
      )}

      {error && (
        <div className="fixed top-0 w-full bg-yellow-500 text-white p-2 text-center">
          {error}
        </div>
      )}

      {gameState.gameStatus === "waiting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Waiting for your partner...
            </h2>
            <div className="animate-pulse">❤️</div>
          </div>
        </motion.div>
      )}

      {gameState.gameStatus === "in_progress" && (
        <div className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <Timer seconds={gameState.timeRemaining} />
            <div className="text-sm">
              Question {gameState.currentQuestion + 1}/
              {gameState.totalQuestions}
            </div>
          </div>

          {gameState.partnerSubmitted && (
            <div className="text-center text-green-600 mb-4">
              Partner has submitted their answer!
            </div>
          )}

          <QuestionCard
            question={gameState.question?.text || "Loading question..."}
            options={gameState.question?.options || []}
            onSubmit={handleAnswer}
          />
        </div>
      )}

      {gameState.gameStatus === "completed" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center min-h-screen"
        >
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Game Complete!</h2>
            <div className="text-6xl mb-6">❤️</div>
            <p className="text-2xl mb-6">
              Your Couple Score: {gameState.score}%
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-all"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
