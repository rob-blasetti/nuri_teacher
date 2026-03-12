import { getJson } from './apiClient';

type BackendStudentResponse = {
  student?: Record<string, unknown>;
  member?: Record<string, unknown>;
  data?: Record<string, unknown>;
  classes?: Array<Record<string, unknown>>;
};

export type BackendStudentDetail = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  classes: Array<{ id: string; name: string }>;
};

export async function getStudentDetail(token: string, studentId: string): Promise<BackendStudentDetail> {
  const payload = await getJson<BackendStudentResponse>(`/api/nuri/students/${studentId}`, token);
  const source = pickObject(payload.student) ?? pickObject(payload.member) ?? pickObject(payload.data) ?? {};
  const classes = Array.isArray(payload.classes)
    ? payload.classes.map(item => ({
        id: pickString(item.id) ?? pickString(item._id) ?? '',
        name: pickString(item.name) ?? pickString(item.title) ?? 'Untitled class',
      })).filter(item => item.id || item.name)
    : [];

  const firstName = pickString(source.firstName);
  const lastName = pickString(source.lastName);
  const name =
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    pickString(source.name) ||
    pickString(source.fullName) ||
    'Student';

  return {
    id: pickString(source.id) ?? pickString(source._id) ?? studentId,
    name,
    firstName,
    lastName,
    profilePicture: pickString(source.profilePicture),
    classes,
  };
}

function pickObject(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
