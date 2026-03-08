import { ClassEntity } from '../types/entities';

const BACKEND_BASE_URL = 'https://liquid-spirit-backend-prod-34ac4484898d.herokuapp.com';
const COMMUNITY_CHILDRENS_CLASSES_PATH = '/api/community/childrens-classes';
const ENABLE_LIVE_CLASSES_API = false;

const fakeCommunityChildrensClasses: ClassEntity[] = [
  {
    id: 'community-class-1',
    name: "Sunrise Children's Class",
    ageGroup: 'Ages 5-7',
    schedule: 'Sundays - 10:00 AM',
    currentUnit: 'Kindness and service',
    notes: 'Hosted at the community hall.',
  },
  {
    id: 'community-class-2',
    name: "Garden Children's Class",
    ageGroup: 'Ages 8-10',
    schedule: 'Wednesdays - 4:30 PM',
    currentUnit: 'Truthfulness',
    notes: 'Outdoor activities when weather permits.',
  },
];

type ClassesApiResponse = {
  classes?: Array<{
    id?: string;
    name?: string;
    ageGroup?: string;
    age_group?: string;
    schedule?: string | null;
    currentUnit?: string | null;
    current_unit?: string | null;
    notes?: string | null;
  }>;
};

function mapClassEntity(item: NonNullable<ClassesApiResponse['classes']>[number]): ClassEntity {
  return {
    id: item.id ?? `class-${Math.random().toString(36).slice(2, 10)}`,
    name: item.name ?? 'Untitled class',
    ageGroup: item.ageGroup ?? item.age_group ?? 'Children',
    schedule: item.schedule ?? undefined,
    currentUnit: item.currentUnit ?? item.current_unit ?? undefined,
    notes: item.notes ?? undefined,
  };
}

export async function getCommunityChildrensClasses(): Promise<ClassEntity[]> {
  if (!ENABLE_LIVE_CLASSES_API) {
    return fakeCommunityChildrensClasses;
  }

  const response = await fetch(`${BACKEND_BASE_URL}${COMMUNITY_CHILDRENS_CLASSES_PATH}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = (await response.json()) as ClassesApiResponse;

  if (!response.ok) {
    throw new Error("Unable to load community children's classes.");
  }

  return (payload.classes ?? []).map(mapClassEntity);
}
