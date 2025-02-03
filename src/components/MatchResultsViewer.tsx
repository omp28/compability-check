import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Socket } from "socket.io-client";
import { useEffect } from "react";

interface PlayerAnswer {
  answerText: string;
}

interface MatchResultItem {
  question: string;
  matched: boolean;
  playerAnswers: {
    male: PlayerAnswer;
    female: PlayerAnswer;
  };
}

interface MatchResultsData {
  matchResults: MatchResultItem[];
}

interface GameState {
  matchResults: Array<{
    questionId: number;
    question: string;
    matched: boolean;
    playerAnswers: {
      [key: string]: {
        gender: string;
        answer: string;
        answerText: string;
      };
    };
  }>;
}

interface MatchResultsViewerProps {
  gameState: GameState;
  socket: Socket;
  roomCode: string;
}

const questionEmojis: { [key: string]: string } = {
  "What's your ideal date night?": "💑",
  "How do you prefer to spend a weekend?": "🌞",
  "What type of vacation excites you most?": "✈️",
  "What's your favorite type of cuisine?": "🍽️",
  "What's your go-to movie genre?": "🎬",
};

// Transform the game state for GIf backend
const transformMatchData = (gameState: GameState): MatchResultsData => {
  return {
    matchResults: gameState.matchResults.map((result) => {
      const maleAnswer = Object.values(result.playerAnswers).find(
        (answer) => answer.gender === "male"
      );
      const femaleAnswer = Object.values(result.playerAnswers).find(
        (answer) => answer.gender === "female"
      );

      const emoji = questionEmojis[result.question] || "❓";
      const questionWithEmoji = `${result.question} ${emoji}`;

      return {
        question: questionWithEmoji,
        matched: result.matched,
        playerAnswers: {
          male: { answerText: maleAnswer?.answerText || "" },
          female: { answerText: femaleAnswer?.answerText || "" },
        },
      };
    }),
  };
};

const MatchResultsViewer = ({
  gameState,
  socket,
  roomCode,
}: MatchResultsViewerProps) => {
  const [gifUrl, setGifUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const matchData = transformMatchData(gameState);

  // Set up socket listeners when component mounts
  useEffect(() => {
    socket.on("gif_generation_started", () => {
      setIsLoading(true);
      setError("");
    });

    socket.on("gif_generated", (response) => {
      setIsLoading(false);
      if (response.success) {
        setGifUrl(response.url);
      } else {
        setError("Failed to generate GIF");
      }
    });

    socket.on("gif_error", (errorMessage) => {
      setIsLoading(false);
      setError(errorMessage);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("gif_generation_started");
      socket.off("gif_generated");
      socket.off("gif_error");
    };
  }, [socket]);

  const generateMatchGif = () => {
    setIsLoading(true);
    setError("");
    socket.emit("request_gif", { roomCode, matchData });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={generateMatchGif}
            disabled={isLoading}
            className="w-64"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Match Results...
              </>
            ) : (
              "Generate Match Results GIF"
            )}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {isLoading && (
            <div className="text-center p-4">
              <p className="text-sm text-gray-600 mt-2">
                Creating your beautiful match results animation...
              </p>
            </div>
          )}
          {gifUrl && (
            <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
              <img
                src={gifUrl}
                alt="Match Results Animation"
                className="w-full h-auto"
              />
              <div className="text-center p-2 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Your match results animation is ready!
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchResultsViewer;
