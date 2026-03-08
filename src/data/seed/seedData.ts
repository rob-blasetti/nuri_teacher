import {
  ClassEntity,
  ContentItemEntity,
  StudentEntity,
  RuhiBookEntity,
  RuhiSectionEntity,
} from '../../types/entities';

export const seedClasses: ClassEntity[] = [
  {
    id: 'class-junior-a',
    name: 'Junior A',
    ageGroup: '8-10',
    schedule: 'Sunday 10:00',
    currentUnit: 'Truthfulness',
    notes: 'Focus on warm encouragement and repetition.',
  },
];

export const seedStudents: StudentEntity[] = [
  { id: 'stu-sara', classId: 'class-junior-a', name: 'Sara', active: true },
  { id: 'stu-yusuf', classId: 'class-junior-a', name: 'Yusuf', active: true },
  { id: 'stu-lina', classId: 'class-junior-a', name: 'Lina', active: true },
  { id: 'stu-omar', classId: 'class-junior-a', name: 'Omar', active: true },
  { id: 'stu-noah', classId: 'class-junior-a', name: 'Noah', active: true },
];

export const seedContentItems: ContentItemEntity[] = [
  {
    id: 'content-1',
    type: 'quote',
    title: 'Truthfulness',
    text: 'Truthfulness is the foundation of all human virtues.',
    phrases: ['Truthfulness', 'is the foundation', 'of all human virtues'],
    unit: 'Virtues',
    theme: 'Truthfulness',
    difficulty: 1,
  },
  {
    id: 'content-2',
    type: 'prayer',
    title: 'Morning Prayer',
    text: 'O God, guide me, protect me, illumine the lamp of my heart.',
    phrases: ['O God, guide me', 'protect me', 'illumine the lamp of my heart'],
    unit: 'Prayers',
    theme: 'Guidance',
    difficulty: 2,
  },
];

export const seedRuhiBooks: RuhiBookEntity[] = [
  { id: 'ruhi-1', title: 'Ruhi Book 3', level: 'Children Class Teacher Prep' },
];

export const seedRuhiSections: RuhiSectionEntity[] = [
  {
    id: 'ruhi-1-sec-1',
    bookId: 'ruhi-1',
    title: 'Purpose of Children Classes',
    order: 1,
    text: 'Children classes develop spiritual qualities through love, knowledge, and service.',
    prompts: ['How can I model joy in class?', 'Which quality should I emphasize this week?'],
  },
];
