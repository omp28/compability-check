import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import { GameState, Response } from "@/types/game";
let socket: any;

const Room: React.FC = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [roomLink, setRoomLink] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [responses, setResponses] = useState<Record<string, Response[]>>({});
  const [error, setError] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    Array<{
      message: string;
      userId: string;
      timestamp: string;
    }>
  >([]);
  const [partnerConnected, setPartnerConnected] = useState<boolean>(false);

  useEffect(() => {
    // Initialize or get userId
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("userId", newUserId);
      setUserId(newUserId);
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    socket = io(socketUrl);

    return () => {
      if (socket) {
        socket.emit("disconnect_user", { roomCode, userId });
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.on("error", (msg: string) => setError(msg));

    socket.on(
      "room_created",
      (data: { roomCode: string; roomLink: string }) => {
        setRoomCode(data.roomCode);
        setRoomLink(data.roomLink);
        setJoined(true);
      }
    );

    socket.on("room_joined", (code: string) => {
      setRoomCode(code);
      setJoined(true);
      setError("");
    });

    socket.on("room_ready", () => {
      setPartnerConnected(true);
    });

    socket.on(
      "receive_message",
      (msg: { message: string; userId: string; timestamp: string }) => {
        setMessages((prev) => [...prev, msg]);
      }
    );

    socket.on(
      "game_state_sync",
      (data: {
        state: string;
        gameData: GameState;
        responses: Record<string, Response[]>;
      }) => {
        setGameState(data.gameData);
        setResponses(data.responses);
        setGameStarted(data.state === "in_game");
        setGameCompleted(data.state === "completed");
      }
    );

    socket.on("game_started", (gameData: GameState) => {
      setGameState(gameData);
      setGameStarted(true);
    });

    socket.on(
      "game_ended",
      (data: { finalResponses: Record<string, Response[]>; endTime: Date }) => {
        setResponses(data.finalResponses);
        setGameCompleted(true);
        setGameStarted(false);
      }
    );

    socket.on("game_reset", () => {
      setGameState(null);
      setResponses({});
      setGameStarted(false);
      setGameCompleted(false);
    });

    socket.on("user_disconnected", (disconnectedUserId: string) => {
      setMessages((prev) => [
        ...prev,
        {
          message: "Partner disconnected",
          userId: "system",
          timestamp: new Date().toISOString(),
        },
      ]);
      setPartnerConnected(false);
    });

    // Check URL for room code
    const { roomCode: urlRoomCode } = router.query;
    if (urlRoomCode && typeof urlRoomCode === "string") {
      handleJoinRoom(urlRoomCode);
    }
  }, [socket, userId, router.query]);

  const createRoom = () => {
    if (userId) {
      socket.emit("create_room", userId);
    }
  };

  const handleJoinRoom = (code: string) => {
    if (userId) {
      socket.emit("join_room", { roomCode: code, userId });
    }
  };

  const startGame = () => {
    socket.emit("start_game", { roomCode, userId });
  };

  const submitResponse = () => {
    if (currentResponse && gameState) {
      const response = {
        questionId: gameState.currentQuestion,
        answer: currentResponse,
      };
      socket.emit("submit_response", { roomCode, userId, response });
      setCurrentResponse("");
    }
  };

  const sendMessage = () => {
    if (message && roomCode) {
      const msgData = {
        room: roomCode,
        message,
        userId,
      };
      socket.emit("send_message", msgData);
      setMessage("");
    }
  };

  const endGame = () => {
    socket.emit("end_game", { roomCode, userId });
  };

  const resetGame = () => {
    socket.emit("reset_game", { roomCode, userId });
  };

  const startFreshGame = () => {
    localStorage.removeItem("userId");
    const newUserId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem("userId", newUserId);
    setUserId(newUserId);
    resetGame();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {!joined ? (
        <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold">Couple's Game Room</h1>
          <button
            onClick={createRoom}
            className="w-full bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Create New Room
          </button>
          <div className="text-center w-full">
            <p className="text-gray-600 my-2">- or -</p>
            <p className="mb-2">Join with code:</p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => handleJoinRoom(roomCode)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Join
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Room: {roomCode}</h2>
            {roomLink && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={roomLink}
                  readOnly
                  className="bg-gray-100 p-2 rounded"
                />
                <button
                  onClick={copyLink}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>

          {!gameStarted && !gameCompleted && (
            <div className="text-center my-8">
              {!partnerConnected ? (
                <p className="text-lg text-gray-600">
                  Waiting for partner to join...
                </p>
              ) : (
                <button
                  onClick={startGame}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600 transition-colors"
                >
                  Start Game
                </button>
              )}
            </div>
          )}

          {gameStarted && gameState && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">
                Question {gameState.currentQuestion + 1}
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder="Your answer..."
                  className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button
                  onClick={submitResponse}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          <div className="h-96 p-2 border border-gray-300 rounded overflow-y-auto mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 mb-2 rounded ${
                  msg.userId === userId
                    ? "bg-blue-100 ml-auto max-w-[80%]"
                    : msg.userId === "system"
                    ? "bg-gray-100 text-center"
                    : "bg-green-100 mr-auto max-w-[80%]"
                }`}
              >
                <div className="text-sm">{msg.message}</div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </div>

          {gameStarted && (
            <button
              onClick={endGame}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              End Game
            </button>
          )}

          {gameCompleted && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Game Complete!</h3>
              <div className="flex space-x-4">
                <button
                  onClick={resetGame}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Play Again (Same Users)
                </button>
                <button
                  onClick={startFreshGame}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Start Fresh Game
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Room;
