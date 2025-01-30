import { motion } from "framer-motion";

interface GameResultsProps {
  score: number;
  matchResults: {
    questionId: number;
    matched: boolean;
    playerAnswers: [string, string];
  }[];
  compatibility: {
    level: "Low" | "Medium" | "High";
    message: string;
  };
  summary: {
    totalQuestions: number;
    matchedAnswers: number;
  };
}

export const GameResults = ({
  score,
  matchResults,
  compatibility,
  summary,
}: GameResultsProps) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Game Complete!</h2>
        <div className="text-6xl my-4">
          {compatibility.level === "High"
            ? "❤️"
            : compatibility.level === "Medium"
            ? "💝"
            : "💌"}
        </div>
        <p className="text-2xl font-semibold mb-2">
          Your Couple Score: {Math.round(score)}%
        </p>
        <p className="text-gray-600">{compatibility.message}</p>
      </div>

      <div className="bg-pink-50 p-4 rounded-xl mb-6">
        <p className="text-center">
          You matched on {summary.matchedAnswers} out of{" "}
          {summary.totalQuestions} questions!
        </p>
      </div>

      <div className="space-y-4">
        {matchResults.map((result, index) => (
          <div
            key={result.questionId}
            className={`p-4 rounded-xl ${
              result.matched
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            } border`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Question {index + 1}</span>
              {result.matched ? (
                <span className="text-green-600">Match! ✓</span>
              ) : (
                <span className="text-gray-500">Different answers</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Partner 1</p>
                <p>{result.playerAnswers[0]}</p>
              </div>
              <div>
                <p className="text-gray-600">Partner 2</p>
                <p>{result.playerAnswers[1]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
