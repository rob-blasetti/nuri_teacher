export type RootStackParamList = {
  Tabs: undefined;
  LessonEditor: { lessonId?: string } | undefined;
  InClassMode: { classId: string; lessonId?: string; sessionId?: string };
  CreateClass: undefined;
  ClassSessions: { classId: string };
};

export type TabParamList = {
  Home: undefined;
  Community: undefined;
  StudentsStack: undefined;
  LessonsStack: undefined;
  RuhiStack: undefined;
  Settings: undefined;
};

export type StudentsStackParamList = {
  StudentList: { classId?: string } | undefined;
  StudentDetail: { studentId: string };
};

export type LessonsStackParamList = {
  Grades: undefined;
  LessonSets: { grade: string };
  LessonList: { grade: string; set?: string };
  LessonDetail: { lessonId: string; grade?: string; set?: string };
};

export type RuhiStackParamList = {
  RuhiBookList: undefined;
  RuhiSection: { sectionId: string };
  RuhiJournal: undefined;
};
