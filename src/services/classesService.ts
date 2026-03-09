const BACKEND_BASE_URL = 'https://liquid-spirit-backend-prod-34ac4484898d.herokuapp.com';
const COMMUNITY_CHILDRENS_CLASSES_PATH = '/api/nuri/community-childrens-classes';

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
  age_group?: string;
  schedule?: string | null;
  currentUnit?: string | null;
  current_unit?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  image?: string | null;
  groupDetails?: {
    day?: string | null;
    time?: string | null;
    frequency?: string | null;
  } | null;
  classFacilitators?: unknown;
  classParticipants?: unknown;
  teachers?: unknown;
  teacherNames?: unknown;
  students?: unknown;
  studentNames?: unknown;
};

type CommunityChildrenClassesResponse = {
  message?: string;
  classes?: CommunityChildrenClassItem[];
  communityChildrensClasses?: CommunityChildrenClassItem[];
  community_childrens_classes?: CommunityChildrenClassItem[];
  data?: {
    classes?: CommunityChildrenClassItem[];
    communityChildrensClasses?: CommunityChildrenClassItem[];
    community_childrens_classes?: CommunityChildrenClassItem[];
  };
};

export async function getCommunityChildrensClasses(token: string): Promise<CommunityChildrenClass[]> {
  const response = await fetch(`${BACKEND_BASE_URL}${COMMUNITY_CHILDRENS_CLASSES_PATH}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await readJson(response)) as CommunityChildrenClassesResponse | undefined;

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : "Unable to load community children's classes.";
    throw new Error(message);
  }

  const classes =
    payload?.classes ??
    payload?.communityChildrensClasses ??
    payload?.community_childrens_classes ??
    payload?.data?.classes ??
    payload?.data?.communityChildrensClasses ??
    payload?.data?.community_childrens_classes ??
    [];

  return classes.map(mapCommunityChildrenClass);
}

function mapCommunityChildrenClass(item: CommunityChildrenClassItem): CommunityChildrenClass {
  const schedule = [pickString(item.groupDetails?.day), pickString(item.groupDetails?.time)].filter(Boolean).join(' • ');

  return {
    id: item.id ?? item._id ?? `class-${Math.random().toString(36).slice(2, 10)}`,
    name: item.name ?? item.title ?? 'Untitled class',
    activityType: pickString(item.activityType),
    ageGroup: item.ageGroup ?? item.age_group ?? undefined,
    schedule: item.schedule ?? (schedule || undefined),
    frequency: pickString(item.groupDetails?.frequency),
    currentUnit: item.currentUnit ?? item.current_unit ?? undefined,
    notes: item.notes ?? undefined,
    imageUrl: normalizeImageUrl(pickString(item.imageUrl) ?? pickString(item.image_url) ?? pickString(item.image)),
    facilitatorIds: pickIds(item.classFacilitators ?? item.teachers ?? item.teacherNames),
    facilitators: pickNames(item.classFacilitators ?? item.teachers ?? item.teacherNames),
    participantIds: pickIds(item.classParticipants ?? item.students ?? item.studentNames),
    participants: pickNames(item.classParticipants ?? item.students ?? item.studentNames),
  };
}

function pickNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        const name = record.name ?? record.fullName ?? record.title;
        return typeof name === 'string' ? name.trim() : '';
      }

      return '';
    })
    .filter(Boolean);
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeImageUrl(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${BACKEND_BASE_URL}${value}`;
  }

  return `${BACKEND_BASE_URL}/${value.replace(/^\.?\//, '')}`;
}

function pickIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (!item || typeof item !== 'object') {
        return '';
      }

      const record = item as Record<string, unknown>;
      return pickString(record.id) ?? pickString(record._id) ?? '';
    })
    .filter(Boolean);
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
