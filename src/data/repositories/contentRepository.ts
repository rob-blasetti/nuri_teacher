import { getDb } from '../db/client';
import { ContentItemEntity } from '../../types/entities';

type ContentRow = {
  id: string;
  type: 'quote' | 'prayer';
  title: string;
  text: string;
  phrases_json: string;
  unit: string | null;
  theme: string | null;
  difficulty: number | null;
  audio_url: string | null;
};

function mapContent(row: ContentRow): ContentItemEntity {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    text: row.text,
    phrases: JSON.parse(row.phrases_json) as string[],
    unit: row.unit ?? undefined,
    theme: row.theme ?? undefined,
    difficulty: row.difficulty ?? undefined,
    audioUrl: row.audio_url ?? undefined,
  };
}

export async function listContentItems(filter?: {
  type?: 'quote' | 'prayer';
  query?: string;
}): Promise<ContentItemEntity[]> {
  const db = await getDb();

  const conditions: string[] = [];
  const params: Array<string> = [];

  if (filter?.type) {
    conditions.push('type = ?');
    params.push(filter.type);
  }

  if (filter?.query?.trim()) {
    conditions.push('(title LIKE ? OR text LIKE ? OR theme LIKE ?)');
    const q = `%${filter.query.trim()}%`;
    params.push(q, q, q);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const [result] = await db.executeSql(
    `SELECT * FROM content_items ${where} ORDER BY title ASC`,
    params,
  );

  const rows: ContentItemEntity[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    rows.push(mapContent(result.rows.item(i) as ContentRow));
  }

  return rows;
}

export async function getContentById(contentId: string): Promise<ContentItemEntity | null> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM content_items WHERE id = ? LIMIT 1', [
    contentId,
  ]);
  if (result.rows.length === 0) {
    return null;
  }
  return mapContent(result.rows.item(0) as ContentRow);
}
