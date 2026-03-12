const BACKEND_BASE_URL = 'https://liquid-spirit-backend-prod-34ac4484898d.herokuapp.com';

export function getBackendBaseUrl() {
  return BACKEND_BASE_URL;
}

export async function getJson<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await readJson<T>(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, `Request failed (${response.status}).`));
  }

  return payload;
}

export async function postJson<T>(path: string, token: string, body: unknown): Promise<T> {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await readJson<T>(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, `Request failed (${response.status}).`));
  }

  return payload;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}
