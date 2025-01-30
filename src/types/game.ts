export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

// export interface GameState {
//   currentQuestion: number;
//   totalQuestions: number;
//   timeRemaining: number;
//   partnerSubmitted: boolean;
//   gameStatus: 'waiting' | 'in_progress' | 'completed';
//   score?: number;
//   question?: {  
//     text: string;
//     options: Option[];
//   };
// }

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
  matchResults?: {
    questionId: number;
    matched: boolean;
    playerAnswers: [string, string];
  }[];
  compatibility?: {
    level: "Low" | "Medium" | "High";
    message: string;
  };
  summary?: {
    totalQuestions: number;
    matchedAnswers: number;
  };
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