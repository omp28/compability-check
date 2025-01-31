// export interface Option {
//   id: string;
//   text: string;
// }

// export interface Question {
//   id?: number;
//   text: string;
//   options: Option[];
// }

// export interface PlayerAnswer {
//   gender: 'male' | 'female';
//   answer: string;
//   answerText: string;
// }

// export interface MatchResult {
//   questionId: number;
//   question: string;
//   options: Option[];
//   matched: boolean;
//   playerAnswers: {
//     [playerId: string]: PlayerAnswer;
//   };
// }

// export interface GameState {
//   currentQuestion: number;
//   totalQuestions: number;
//   timeRemaining: number;
//   partnerSubmitted: boolean;
//   gameStatus: "waiting" | "in_progress" | "completed";
//   score?: number;
//   question?: {
//     text: string;
//     options: Option[];
//   };
//   matchResults?: MatchResult[];
//   compatibility?: Compatibility;
//   summary?: GameSummary;
// }

// export interface GameSession {
//   roomId: string;
//   expiryTime: number;
//   gender: 'male' | 'female';
//   isHost: boolean;
//   partnerGender?: 'male' | 'female';
// }

// export interface RoomValidationResponse {
//   valid: boolean;
//   canJoin: boolean;
//   hostGender?: 'male' | 'female';
// }

// export interface Compatibility {
//   level: "Low" | "Medium" | "High";
//   message: string;
// }

// export interface GameSummary {
//   totalQuestions: number;
//   matchedAnswers: number;
//   unmatchedQuestions?: MatchResult[];
// }

// export interface GameCompleteState {
//   score: number;
//   matchResults: MatchResult[];
//   compatibility: Compatibility;
//   summary: GameSummary;
// }

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id?: number;
  text: string;
  options: Option[];
}

export interface PlayerAnswer {
  gender: 'male' | 'female';
  answer: string;
  answerText: string;
}

export interface MatchResult {
  questionId: number;
  question: string;
  options: Option[];
  matched: boolean;
  playerAnswers: Record<string, PlayerAnswer>;
}

export interface Compatibility {
  level: "Low" | "Medium" | "High";
  message: string;
}

export interface GameSummary {
  totalQuestions: number;
  matchedAnswers: number;
  unmatchedQuestions?: MatchResult[];
}

export interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  partnerSubmitted: boolean;
  gameStatus: "waiting" | "in_progress" | "completed";
  score?: number;
  question?: {
    text: string;
    options: Option[];
  };
  matchResults?: MatchResult[];
  compatibility?: Compatibility;
  summary?: GameSummary;
}

export interface GameSession {
  roomId: string;
  expiryTime: number;
  gender: 'male' | 'female';
  isHost: boolean;
  partnerGender?: 'male' | 'female';
}

export interface RoomValidationResponse {
  valid: boolean;
  canJoin: boolean;
  hostGender?: 'male' | 'female';
}

export interface GameCompleteState {
  score: number;
  matchResults: MatchResult[];
  compatibility: Compatibility;
  summary: GameSummary;
}