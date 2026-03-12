import { getJson } from './apiClient';

export type CommunityChildrenClass = {
  id: string;
  name: string;
  activityType?: string;
  ageGroup?: string;
  schedule?: string;
  frequency?: string;
  currentUnit?: string;
  notes?: string;
  imageUrl?: string;
  facilitatorIds: string[];
  facilitators: string[];
  participantIds: string[];
  participants: string[];
};

type CommunityChildrenClassItem = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  activityType?: string;
  ageGroup?: string;
  schedule?: string | null;
  currentUnit?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  groupDetails?: {
    day?: string | null;
    time?: string | null;
    frequency?: string | null;
  } | null;
  classFacilitators?: Array<{ id?: string; _id?: string; name?: string }>;
  classParticipants?: Array<{ id?: string; _id?: string; name?: string }>;
};

type CommunityChildrenClassesResponse = {
  classes?: CommunityChildrenClassItem[];
};

export async function getCommunityChildrenClasses(token: string): Promise<CommunityChildrenClass[]> {
  const payload = await getJson<CommunityChildrenClassesResponse>('/api/nuri/community-childrens-classes', token);
  return (payload.classes ?? []).map(mapCommunityChildrenClass);
}

function mapCommunityChildrenClass(item: CommunityChildrenClassItem): CommunityChildrenClass {
  const schedule = [item.groupDetails?.day, item.groupDetails?.time].filter(Boolean).join(' • ');
  return {
    id: item.id ?? item._id ?? `class-${Math.random().toString(36).slice(2, 10)}`,
    name: item.name ?? item.title ?? 'Untitled class',
    activityType: item.activityType ?? undefined,
    ageGroup: item.ageGroup ?? undefined,
    schedule: item.schedule ?? (schedule || undefined),
    frequency: item.groupDetails?.frequency ?? undefined,
    currentUnit: item.currentUnit ?? undefined,
    notes: item.notes ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    facilitatorIds: (item.classFacilitators ?? []).map(person => person.id ?? person._id ?? '').filter(Boolean),
    facilitators: (item.classFacilitators ?? []).map(person => person.name ?? '').filter(Boolean),
    participantIds: (item.classParticipants ?? []).map(person => person.id ?? person._id ?? '').filter(Boolean),
    participants: (item.classParticipants ?? []).map(person => person.name ?? '').filter(Boolean),
  };
}
