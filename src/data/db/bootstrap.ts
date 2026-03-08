import { getDb } from './client';
import {
  seedClasses,
  seedContentItems,
  seedRuhiBooks,
  seedRuhiSections,
  seedStudents,
} from '../seed/seedData';

export async function bootstrapSeedData() {
  const db = await getDb();
  const [countResult] = await db.executeSql('SELECT COUNT(*) as count FROM classes');
  const count = countResult.rows.item(0).count as number;

  if (count > 0) {
    return;
  }

  for (const item of seedClasses) {
    await db.executeSql(
      'INSERT INTO classes (id, name, age_group, schedule, current_unit, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [item.id, item.name, item.ageGroup, item.schedule ?? null, item.currentUnit ?? null, item.notes ?? null],
    );
  }

  for (const item of seedStudents) {
    await db.executeSql(
      'INSERT INTO students (id, class_id, name, notes, active) VALUES (?, ?, ?, ?, ?)',
      [item.id, item.classId, item.name, item.notes ?? null, item.active ? 1 : 0],
    );
  }

  for (const item of seedContentItems) {
    await db.executeSql(
      'INSERT INTO content_items (id, type, title, text, phrases_json, unit, theme, difficulty, audio_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        item.id,
        item.type,
        item.title,
        item.text,
        JSON.stringify(item.phrases),
        item.unit ?? null,
        item.theme ?? null,
        item.difficulty ?? null,
        item.audioUrl ?? null,
      ],
    );
  }

  for (const item of seedRuhiBooks) {
    await db.executeSql('INSERT INTO ruhi_books (id, title, level) VALUES (?, ?, ?)', [
      item.id,
      item.title,
      item.level ?? null,
    ]);
  }

  for (const item of seedRuhiSections) {
    await db.executeSql(
      'INSERT INTO ruhi_sections (id, book_id, title, section_order, text, prompts_json) VALUES (?, ?, ?, ?, ?, ?)',
      [item.id, item.bookId, item.title, item.order, item.text, JSON.stringify(item.prompts)],
    );
  }
}
