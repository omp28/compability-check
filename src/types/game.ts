export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  partnerSubmitted: boolean;
  gameStatus: 'waiting' | 'in_progress' | 'completed';
  score?: number;
  question?: {  // Add these fields
    text: string;
    options: Option[];
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