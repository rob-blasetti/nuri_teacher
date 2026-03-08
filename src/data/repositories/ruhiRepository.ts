import { getDb } from '../db/client';
import { RuhiBookEntity, RuhiNoteEntity, RuhiSectionEntity } from '../../types/entities';

type RuhiBookRow = { id: string; title: string; level: string | null };
type RuhiSectionRow = {
  id: string;
  book_id: string;
  title: string;
  section_order: number;
  text: string;
  prompts_json: string;
};
type RuhiNoteRow = {
  id: string;
  section_id: string;
  body: string;
  apply_this_week: string | null;
  created_at: string;
};

function mapBook(row: RuhiBookRow): RuhiBookEntity {
  return { id: row.id, title: row.title, level: row.level ?? undefined };
}

function mapSection(row: RuhiSectionRow): RuhiSectionEntity {
  return {
    id: row.id,
    bookId: row.book_id,
    title: row.title,
    order: row.section_order,
    text: row.text,
    prompts: JSON.parse(row.prompts_json) as string[],
  };
}

function mapNote(row: RuhiNoteRow): RuhiNoteEntity {
  return {
    id: row.id,
    sectionId: row.section_id,
    body: row.body,
    applyThisWeek: row.apply_this_week ?? undefined,
    createdAt: row.created_at,
  };
}

export async function listRuhiBooks(): Promise<RuhiBookEntity[]> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM ruhi_books ORDER BY title ASC');
  const rows: RuhiBookEntity[] = [];
  for (let i = 0; i < result.rows.length; i += 1) rows.push(mapBook(result.rows.item(i) as RuhiBookRow));
  return rows;
}

export async function listRuhiSections(bookId: string): Promise<RuhiSectionEntity[]> {
  const db = await getDb();
  const [result] = await db.executeSql(
    'SELECT * FROM ruhi_sections WHERE book_id = ? ORDER BY section_order ASC',
    [bookId],
  );
  const rows: RuhiSectionEntity[] = [];
  for (let i = 0; i < result.rows.length; i += 1) rows.push(mapSection(result.rows.item(i) as RuhiSectionRow));
  return rows;
}

export async function getRuhiSectionById(sectionId: string): Promise<RuhiSectionEntity | null> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM ruhi_sections WHERE id = ? LIMIT 1', [sectionId]);
  if (result.rows.length === 0) return null;
  return mapSection(result.rows.item(0) as RuhiSectionRow);
}

export async function listRuhiNotes(): Promise<RuhiNoteEntity[]> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM ruhi_notes ORDER BY created_at DESC');
  const rows: RuhiNoteEntity[] = [];
  for (let i = 0; i < result.rows.length; i += 1) rows.push(mapNote(result.rows.item(i) as RuhiNoteRow));
  return rows;
}

export async function saveRuhiNote(input: {
  sectionId: string;
  body: string;
  applyThisWeek?: string;
}): Promise<void> {
  const db = await getDb();
  const id = `${input.sectionId}__${Date.now()}`;
  await db.executeSql(
    'INSERT INTO ruhi_notes (id, section_id, body, apply_this_week, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, input.sectionId, input.body, input.applyThisWeek ?? null, new Date().toISOString()],
  );
}
