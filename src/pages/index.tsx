"use client";

import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/router";

interface GameSession {
  roomId: string;
  isActive: boolean;
  isHost: boolean;
}

// Hardcoded room codes for testing
const VALID_ROOM_CODES: string[] = ["ABCDEF", "TEST12"];

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState<string>("");

  useEffect(() => {
    const existingGame = localStorage.getItem("gameSession");
    if (existingGame) {
      const { roomId, isActive }: GameSession = JSON.parse(existingGame);
      if (isActive) {
        router.push(`/game/${roomId}`);
      }
    }
  }, [router]);

  const createRoom = (): void => {
    const roomId = VALID_ROOM_CODES[0];

    const gameSession: GameSession = {
      roomId,
      isActive: true,
      isHost: true,
    };

    localStorage.setItem("gameSession", JSON.stringify(gameSession));

    router.push(`/game/${roomId}`);
  };

  const joinRoom = (): void => {
    if (VALID_ROOM_CODES.includes(roomCode)) {
      const gameSession: GameSession = {
        roomId: roomCode,
        isActive: true,
        isHost: false,
      };

      localStorage.setItem("gameSession", JSON.stringify(gameSession));

      router.push(`/game/${roomCode}`);
    } else {
      alert("Invalid room code!");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setRoomCode(e.target.value.toUpperCase());
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>): void => {
    if ((e.target as HTMLInputElement).value.length === 6) {
      joinRoom();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1>Multiplayer Quiz Game</h1>
      <div className="flex flex-col gap-4">
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={createRoom}
        >
          Generate New Room
        </button>
        <div>
          <input
            type="text"
            maxLength={6}
            value={roomCode}
            onChange={handleInputChange}
            onKeyUp={handleKeyUp}
            placeholder="Enter 6-character room code"
            className="border p-2 rounded"
          />
        </div>
      </div>
    </div>
  );
}

// Hardcoded questions
interface Option {
  id: string;
  text: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
  correct: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    options: [
      { id: "paris", text: "Paris" },
      { id: "london", text: "London" },
      { id: "berlin", text: "Berlin" },
      { id: "madrid", text: "Madrid" },
    ],
    correct: "paris",
  },
  {
    id: 2,
    text: "Which planet is known as the Red Planet?",
    options: [
      { id: "venus", text: "Venus" },
      { id: "mars", text: "Mars" },
      { id: "jupiter", text: "Jupiter" },
      { id: "saturn", text: "Saturn" },
    ],
    correct: "mars",
  },
];
