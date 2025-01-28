"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QuestionCard } from "../../components/QuestionCard";

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

interface Answer {
  questionId: number;
  answerId: string;
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

export default function GameRoom() {
  const router = useRouter();
  const { roomId } = router.query as { roomId: string };
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [gameComplete, setGameComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!roomId) return;

    const gameSession = localStorage.getItem("gameSession");
    if (!gameSession) {
      router.push("/");
      return;
    }

    if (currentQuestionIndex >= QUESTIONS.length) {
      setGameComplete(true);
      localStorage.removeItem("gameSession");
      setTimeout(() => router.push("/"), 3000);
    }
  }, [roomId, currentQuestionIndex, router]);

  const handleAnswer = (optionId: string) => {
    setAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        questionId: QUESTIONS[currentQuestionIndex].id,
        answerId: optionId,
      },
    ]);

    setTimeout(() => {
      setCurrentQuestionIndex((prev) => prev + 1);
    }, 1000);
  };

  if (gameComplete) {
    return (
      <div className="text-center mt-8">
        <h2>Game Complete!</h2>
        <p>Redirecting to home...</p>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="text-center mb-4">
        Question {currentQuestionIndex + 1} of {QUESTIONS.length}
      </div>
      <QuestionCard
        question={currentQuestion.text}
        options={currentQuestion.options}
        onSubmit={handleAnswer}
      />
    </div>
  );
}
