import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Socket } from "socket.io-client";
import DateVibeCard from "./DareVibeCard";

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

export interface DatePlannerResult {
  dateVibe: string;
  aesthetic: string;
  emoji: string;
  coupleHashtag: string;
  generatedAt: string;
}

const questionEmojis: { [key: string]: string } = {
  "What's your ideal date night?": "💑",
  "How do you prefer to spend a weekend?": "🌞",
  "What type of vacation excites you most?": "✈️",
  "What's your favorite type of cuisine?": "🍽️",
  "What's your go-to movie genre?": "🎬",
};

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
  const [datePlan, setDatePlan] = useState<DatePlannerResult | null>(null);
  const [isGifLoading, setIsGifLoading] = useState<boolean>(false);
  const [isDatePlanLoading, setIsDatePlanLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const matchData = transformMatchData(gameState);

  useEffect(() => {
    socket.on("gif_generation_started", () => setIsGifLoading(true));
    socket.on("date_planning_started", () => setIsDatePlanLoading(true));

    socket.on("gif_generated", (response) => {
      setIsGifLoading(false);
      if (response.success) setGifUrl(response.url);
    });

    socket.on("date_plan_generated", (response) => {
      setIsDatePlanLoading(false);
      console.log(response);
      if (response.success) setDatePlan(response.plan);
    });

    socket.on("gif_error", (errorMessage) => {
      setIsGifLoading(false);
      setError((prev) => `${prev} GIF Error: ${errorMessage}`);
    });

    socket.on("date_plan_error", (errorMessage) => {
      setIsDatePlanLoading(false);
      setError((prev) => `${prev} Date Plan Error: ${errorMessage}`);
    });

    return () => {
      socket.off("gif_generation_started");
      socket.off("date_planning_started");
      socket.off("gif_generated");
      socket.off("date_plan_generated");
      socket.off("gif_error");
      socket.off("date_plan_error");
    };
  }, [socket]);

  const generateResults = () => {
    setError("");
    socket.emit("request_match_results", { roomCode, matchData });
  };

  console.log("dateplan", datePlan);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      <Button
        onClick={() =>
          socket.emit("request_match_results", { roomCode, matchData })
        }
        disabled={isGifLoading || isDatePlanLoading}
        className="w-64 mx-auto block"
      >
        {isGifLoading || isDatePlanLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Results...
          </>
        ) : (
          "Generate Results"
        )}
      </Button>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* GIF Display */}
        {gifUrl && (
          <Card className="overflow-hidden">
            <img
              src={gifUrl}
              alt="Match Results Animation"
              className="w-full h-auto"
            />
          </Card>
        )}

        {/* Date Vibe Display */}
        <DateVibeCard datePlan={datePlan} isLoading={isDatePlanLoading} />
      </div>
    </div>
  );
};

export default MatchResultsViewer;
