
export enum ExamCategory {
  CAT_I = "Category I",
  CAT_II = "Category II",
  CAT_III = "Category III",
  CAT_IV = "Category IV",
}

export interface Question {
  id: string;
  category: ExamCategory;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  image?: string; // URL to an image/chart
  topic: string; // Specific topic from ISO 18436-2
}

export interface ExamConfig {
  questions: Question[];
  durationMinutes: number; // Duration in minutes
  passMarkPercent: number;
  isTrial?: boolean; // Added for trial exams
}

export interface UserAnswer {
  questionId: string;
  selectedOptionIndex: number | null;
}

export interface ExamResult {
  category: ExamCategory;
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  answers: UserAnswer[];
  passed: boolean;
  timeTakenMinutes?: number; // Optional: time taken by user
  isTrial?: boolean; // Added for trial exams
}

export interface CaseStudyData {
  topic: string;
  caseStudyText: string;
  assignment: string;
  gradingRubric: string;
  answerSheet: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface StandardLink {
  name: string;
  description: string;
  url: string;
}

// For Recharts
export interface ChartDataPoint {
  name: string;
  value: number;
}

// Authentication Types
export interface User {
  id: string;
  username: string;
  password?: string; // Stored as plain text for this demo
  name: string;
  lastName: string;
  email: string;
  country: string;
  registrationDate: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  userType: 'user' | 'admin';
}
