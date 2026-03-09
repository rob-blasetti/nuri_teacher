export type RootStackParamList = {
  Tabs: undefined;
  LessonEditor: { lessonId?: string } | undefined;
  InClassMode: { classId: string; lessonId?: string };
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
  LessonList: { grade: string };
  LessonDetail: { lessonId: string; grade?: string };
};

export type RuhiStackParamList = {
  RuhiBookList: undefined;
  RuhiSection: { sectionId: string };
  RuhiJournal: undefined;
};
