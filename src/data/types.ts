export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemKind = 'practice' | 'challenge';

export interface LessonSection {
  heading: string;
  body: string;
}

export interface Lesson {
  id: string;
  order: number;
  module: string;
  title: string;
  duration: number;
  summary: string;
  objectives: string[];
  sections: LessonSection[];
  code: string;
  expectedOutput: string;
  takeaway: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  note: string;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface Problem {
  id: string;
  kind: ProblemKind;
  title: string;
  difficulty: Difficulty;
  topic: string;
  xp: number;
  summary: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: ProblemExample[];
  tests: TestCase[];
  starterCode: string;
  hints: string[];
}

export interface Activity {
  id: string;
  type: 'lesson' | 'problem';
  title: string;
  xp: number;
  completedAt: string;
}

export interface ProgressState {
  displayName: string;
  completedLessons: string[];
  completedProblems: string[];
  arenaBest: Record<string, number>;
  activity: Activity[];
}
