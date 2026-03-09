const BACKEND_BASE_URL = 'https://liquid-spirit-backend-prod-34ac4484898d.herokuapp.com';
const CREATE_ACTIVITY_PATH = '/api/activity/create';

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
  const response = await fetch(`${BACKEND_BASE_URL}${CREATE_ACTIVITY_PATH}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({
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
    }),
  });

  const payload = await readJson(response);
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'Unable to create class.';
    throw new Error(message);
  }
}

type JsonLike = { message?: unknown } | undefined;
async function readJson(response: Response): Promise<JsonLike> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as JsonLike;
  } catch {
    return undefined;
  }
}
