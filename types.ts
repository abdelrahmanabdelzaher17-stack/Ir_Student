
export enum UserRole {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  INDEPENDENT = 'INDEPENDENT'
}

export enum Rank {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  points: number;
  rank: Rank;
  linkedStudentId?: string; // For Parent
  parentId?: string; // For Student
  linkCode?: string; // Unique code for students to share with parents
  weekStartDate?: number; // timestamp
  theme?: string;
}

export interface Task {
  id: string;
  title: string;
  points: number;
  category: 'study' | 'worship' | 'habit';
  completed: boolean;
  studentId: string;
  weekId?: string;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  isRedeemed: boolean;
  studentId: string;
}

export interface DictionaryEntry {
  id: string;
  term: string;
  definition: string;
  studentId: string;
  mastered: boolean;
}

export interface Certificate {
  id: string;
  studentName: string;
  grade: number;
  date: number;
  studentId: string;
}
