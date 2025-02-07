"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Heart, ArrowRight } from "lucide-react";
import { IoIosMale, IoIosFemale } from "react-icons/io";

export default function Home() {
  const router = useRouter();
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [roomLink, setRoomLink] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"gender" | "action">("gender");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [isStartDisabled, setIsStartDisabled] = useState<boolean>(false);

  useEffect(() => {
    // Randomly select an image from the public/date-night/ folder (1 to 8)
    // const randomImage = Math.floor(Math.random() * 3) + 1;
    // setBackgroundImage(`/langin-bg/${randomImage}.jpg`);
    setBackgroundImage(`/langin-bg/3.jpg`);
  }, []);

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
      setIsStartDisabled(true);
    } else {
      setIsStartDisabled(false);
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
    <div
      className="min-h-screen px-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto pt-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <Heart className="w-20 h-20 text-red-500" fill="currentColor" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Love Match Quiz
          </h1>
          <p className="text-gray-600">
            Discover your compatibility this Valentine's Day!
          </p>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-pink-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-6">
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGender("male")}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all text-black ${
                  gender === "male"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <div className="text-center">
                  <span className="block text-2xl mb-1">
                    <IoIosMale />
                  </span>
                  <span className="font-medium">Romeo</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGender("female")}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all text-black ${
                  gender === "female"
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 hover:border-pink-200"
                }`}
              >
                <div className="text-center">
                  <span className="block text-2xl mb-1 ">
                    <IoIosFemale />
                  </span>
                  <span className="font-medium">Juliet</span>
                </div>
              </motion.button>
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createRoom}
                disabled={!gender || isStartDisabled}
                className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all ${
                  gender && !isStartDisabled
                    ? "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Start New Game
              </motion.button>

              <AnimatePresence>
                {copySuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-10 left-0 right-0 text-center text-green-600 bg-green-100 rounded-lg py-1"
                  >
                    Link copied! 💕
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-gray-500">or</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 outline-none text-gray-700 placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={joinRoom}
                disabled={!gender || !roomCode}
                className={`px-6 rounded-xl flex items-center justify-center ${
                  gender && roomCode
                    ? "bg-pink-500 hover:bg-pink-600 text-white"
                    : "bg-gray-300 cursor-not-allowed text-gray-500"
                }`}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className=" flex justify-center items-center mt-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm py-1 px-2 rounded-xl  text-white bg-[#08080846]"
          >
            Made with 💝 for Valentine's Day 2025
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
