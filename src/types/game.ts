// Core game interfaces
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
  correct: string;
}

export interface Answer {
  questionId: number;
  answerId: string;
}

export interface GameSession {
  roomId: string;
  isActive: boolean;
  isHost: boolean;
}

export interface GameState {
  startTime: Date;
  currentQuestion: number;
}

export interface Response {
  questionId: number;
  answer: string;
}

export interface Message {
  message: string;
  userId: string;
  timestamp: string;
}