import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QuestionCard } from "./QuestionCard";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-red-50">
      {disconnected && (
        <div className="fixed top-0 w-full bg-red-500 text-white p-2 text-center z-30">
          Disconnected. Trying to reconnect...
        </div>
      )}

      {error && (
        <div className="fixed top-0 w-full bg-yellow-500 text-white p-2 text-center z-30">
          {error}
        </div>
      )}

      {gameState.gameStatus === "waiting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen "
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-black">
              Waiting for your partner...
            </h2>
            <div className="animate-pulse">❤️</div>

            <div className="mt-4">
              <p className="text-lg text-gray-700">
                Room Code: <span className="font-bold">{session.roomId}</span>
              </p>
            </div>

            <ShareLinkButton roomId={session.roomId} />

            <button
              onClick={handleCleaGameSession}
              className="mt-4 bg-red-500 text-white px-6 py-3 rounded-t-xl hover:bg-red-600 transition-all absolute bottom-0 left-0 right-0 mx-auto"
            >
              Start New Game
            </button>
          </div>
        </motion.div>
      )}

      {gameState.gameStatus === "in_progress" && (
        <div className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <TimeLoader seconds={gameState.timeRemaining} />
            <div className="text-sm">
              Question {gameState.currentQuestion + 1}/
              {gameState.totalQuestions}
            </div>
          </div>

          {hasAnswered && !gameState.partnerSubmitted && (
            <div className="text-center text-green-600 mb-4">
              Waiting for partner&apos;s answer...
            </div>
          )}

          {!hasAnswered && gameState.partnerSubmitted && (
            <div className="text-center text-green-600 mb-4">
              Partner has submitted their answer!
            </div>
          )}

          <QuestionCard
            question={gameState.question?.text || "Loading question..."}
            options={gameState.question?.options || []}
            onSubmit={handleAnswer}
            isLoading={hasAnswered}
          />
        </div>
      )}

      {gameState.gameStatus === "completed" && (
        <div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center min-h-screen"
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
          </motion.div>
          {gameState.matchResults ? (
            <MatchResultsViewer
              gameState={gameState}
              socket={socket}
              roomCode={session.roomId}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};
