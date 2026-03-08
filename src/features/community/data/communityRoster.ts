export const communityTeacherRoster: Record<string, string[]> = {
  'class-preschool': ['Layla', 'Mariam'],
  'class-grade-1': ['Daniel', 'Amina'],
  'class-grade-2': ['Farid', 'Huda'],
  'class-junior-a': ['Nadia', 'Yusuf'],
};

export function getTeachersForClass(classId: string): string[] {
  return communityTeacherRoster[classId] ?? ['Teacher needed'];
}
