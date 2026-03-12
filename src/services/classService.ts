import { postJson } from './apiClient';

export type CreateChildrenClassInput = {
  token: string;
  createdBy: string;
  community: string;
  title: string;
  description?: string;
  day: string;
  time: string;
  frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'One-Off';
  sessionDate: string;
  grade: string;
  curriculumLesson?: string;
};

export async function createChildrenClass(input: CreateChildrenClassInput): Promise<void> {
  await postJson('/api/activity/create', input.token, {
    title: input.title,
    description: input.description,
    activityType: "Children's Class",
    community: input.community,
    createdBy: input.createdBy,
    groupDetails: {
      day: input.day,
      time: input.time,
      frequency: input.frequency,
    },
    sessionDate: input.sessionDate,
    facilitators: [input.createdBy],
    participants: [],
    grade: input.grade,
    curriculumLesson: input.curriculumLesson?.trim() || undefined,
  });
}
