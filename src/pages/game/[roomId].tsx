"use client";
import { useRouter } from "next/router";
import { GameRoom } from "@/components/GameRoom";
import { useEffect, useState } from "react";

export default function GamePage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      if (!roomId) return;

      const gameSession = localStorage.getItem("gameSession");

      if (!gameSession) {
        // Check if this is a shared link join attempt
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/validate-room`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ roomId }),
            }
          );

          if (response.ok) {
            // Room exists and is joinable
            router.push(`/?join=${roomId}`);
            return;
          }
        } catch (err) {
          console.error("Failed to validate room:", err);
        }
        router.push("/");
        return;
      }

      const session = JSON.parse(gameSession);

      // Check if session is expired
      if (Date.now() > session.expiryTime) {
        localStorage.removeItem("gameSession");
        router.push("/");
        return;
      }

      // Validate if the room ID matches
      if (session.roomId !== roomId) {
        router.push("/");
        return;
      }

      setIsValid(true);
      setIsLoading(false);
    };

    validateSession();
  }, [router, roomId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your game...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return null;
  }

  return <GameRoom />;
}
