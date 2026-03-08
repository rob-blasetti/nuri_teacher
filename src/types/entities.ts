export type ProgressStatus = 'not_started' | 'learning' | 'partial' | 'confident';

export type ClassEntity = {
  id: string;
  name: string;
  ageGroup: string;
  schedule?: string;
  currentUnit?: string;
  notes?: string;
};

export type StudentEntity = {
  id: string;
  classId: string;
  name: string;
  notes?: string;
  active: boolean;
};

export type ContentItemEntity = {
  id: string;
  type: 'quote' | 'prayer';
  title: string;
  text: string;
  phrases: string[];
  unit?: string;
  theme?: string;
  difficulty?: number;
  audioUrl?: string;
};

export type LessonPlanEntity = {
  id: string;
  classId: string;
  date: string;
  title: string;
  blocks: Array<{ type: string; title: string; minutes: number }>;
  checklist: string[];
};

export type ProgressRecordEntity = {
  id: string;
  studentId: string;
  contentItemId: string;
  status: ProgressStatus;
  updatedAt: string;
  note?: string;
};

export type RuhiBookEntity = {
  id: string;
  title: string;
  level?: string;
};

export type RuhiSectionEntity = {
  id: string;
  bookId: string;
  title: string;
  order: number;
  text: string;
  prompts: string[];
};

export type RuhiNoteEntity = {
  id: string;
  sectionId: string;
  body: string;
  applyThisWeek?: string;
  createdAt: string;
};
