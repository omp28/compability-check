"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Copy, Heart } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [roomLink, setRoomLink] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const existingGame = localStorage.getItem("gameSession");
    if (existingGame) {
      const session = JSON.parse(existingGame);
      if (Date.now() < session.expiryTime) {
        router.push(`/game/${session.roomId}`);
      } else {
        localStorage.removeItem("gameSession");
      }
    }
  }, [router]);

  useEffect(() => {
    const joinCode = router.query.join;
    if (joinCode && typeof joinCode === "string") {
      setRoomCode(joinCode);
    }
  }, [router.query]);

  const createRoom = async () => {
    if (!gender) {
      setError("Please select your gender first!");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gender }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Generate shareable link first
        const shareLink = `${window.location.origin}/game/${data.roomCode}`;
        setRoomLink(shareLink);

        // Store session data
        const gameSession = {
          roomId: data.roomCode,
          expiryTime: Date.now() + 10 * 60 * 1000, // 10 minutes
          gender,
          isHost: true,
        };

        localStorage.setItem("gameSession", JSON.stringify(gameSession));

        // Only redirect after storing session
        router.push(`/game/${data.roomCode}`);
      } else {
        setError(data.message || "Failed to create room");
      }
    } catch (err) {
      setError("Failed to create room. Please try again.");
      console.log(err);
    }
  };

  // In Home component (index.tsx)
  const joinRoom = async () => {
    if (!gender) {
      setError("Please select your gender first!");
      return;
    }

    const codeToJoin = roomCode || (router.query.join as string); // Get code from input or URL

    if (!codeToJoin || codeToJoin.length !== 6) {
      setError("Please enter a valid room code");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/join-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roomCode: codeToJoin, gender }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const gameSession = {
          roomId: codeToJoin, // Use the existing room code
          expiryTime: Date.now() + 10 * 60 * 1000,
          gender,
          isHost: false,
        };

        localStorage.setItem("gameSession", JSON.stringify(gameSession));
        router.push(`/game/${codeToJoin}`);
      } else {
        setError(data.message || "Invalid room code");
      }
    } catch (err) {
      setError("Failed to join room. Please try again.");
      console.log(err);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError("Failed to copy link");
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-red-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6 mt-10"
      >
        <div className="text-center mb-8">
          <Heart
            className="w-12 h-12 text-pink-500 mx-auto mb-4"
            fill="currentColor"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Valentine&apos;s Day Game
          </h1>
          <p className="text-gray-600 mt-2">
            Connect with your partner and test your compatibility!
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="mb-6">
          <p className="text-gray-700 mb-3">Select your gender:</p>
          <div className="flex gap-4">
            <button
              onClick={() => setGender("male")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all justify-around flex items-center text-black  ${
                gender === "male"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              Male
              <FaMale className="w-6 h-6 text-blue-500" />
            </button>

            <button
              onClick={() => setGender("female")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all justify-around flex items-center text-black ${
                gender === "female"
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200"
              }`}
            >
              Female
              <FaFemale className="w-6 h-6 text-pink-500" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={createRoom}
            className="w-full bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-600 transition-all"
          >
            Create New Game
          </button>

          {roomLink && (
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
              <input
                type="text"
                value={roomLink}
                readOnly
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
              />
              <button
                onClick={copyLink}
                className={`p-2 rounded-lg transition-all ${
                  copySuccess
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 outline-none text-black"
            />
            <button
              onClick={joinRoom}
              className="bg-pink-500 text-white px-6 rounded-xl hover:bg-pink-600 transition-all"
            >
              Join
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
