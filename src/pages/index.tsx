"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Heart, ArrowRight } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [roomLink, setRoomLink] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"gender" | "action">("gender");

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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-purple-100 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
      >
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Heart
              className="w-16 h-16 text-pink-500 mx-auto mb-4"
              fill="currentColor"
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Love Connection
          </h1>
          <p className="text-gray-600">
            Discover your compatibility this Valentine&apos;s Day!
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-center font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === "gender" ? (
            <motion.div
              key="gender"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Choose Your Role
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setGender("male");
                    setStep("action");
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
                    gender === "male"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <FaMale className="w-12 h-12 text-blue-500 mb-2" />
                  <span className="font-medium text-gray-700">Romeo</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setGender("female");
                    setStep("action");
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
                    gender === "female"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200"
                  }`}
                >
                  <FaFemale className="w-12 h-12 text-pink-500 mb-2" />
                  <span className="font-medium text-gray-700">Juliet</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="action"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={createRoom}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-xl hover:from-pink-600 hover:to-red-600 transition-all font-semibold text-lg shadow-lg"
              >
                Start a Love Story
              </motion.button>

              {roomLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200"
                >
                  <input
                    type="text"
                    value={roomLink}
                    readOnly
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-600"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyLink}
                    className={`p-2 rounded-lg transition-all ${
                      copySuccess
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <Copy className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}

              <div className="relative flex items-center gap-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="text-gray-500 font-medium">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter love code"
                  className="flex-1 p-4 rounded-xl border-2 border-gray-200 focus:border-pink-500 outline-none text-gray-700 text-lg placeholder-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={joinRoom}
                  className="bg-pink-500 text-white px-6 rounded-xl hover:bg-pink-600 transition-all flex items-center justify-center"
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
