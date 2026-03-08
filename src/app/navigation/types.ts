export type RootStackParamList = {
  Tabs: undefined;
  LessonList: undefined;
  LessonEditor: { lessonId?: string } | undefined;
  InClassMode: { classId: string; lessonId?: string };
};

export type TabParamList = {
  Dashboard: undefined;
  ClassesStack: undefined;
  StudentsStack: undefined;
  LibraryStack: undefined;
  RuhiStack: undefined;
};

export type ClassesStackParamList = {
  ClassList: undefined;
  ClassDetail: { classId: string };
  Attendance: { classId: string };
};

export type StudentsStackParamList = {
  StudentList: { classId?: string } | undefined;
  StudentDetail: { studentId: string };
};

export type LibraryStackParamList = {
  ContentList: undefined;
  ContentDetail: { contentId: string };
};

export type RuhiStackParamList = {
  RuhiBookList: undefined;
  RuhiSection: { sectionId: string };
  RuhiJournal: undefined;
};
