export const DB_NAME = 'nuri_teacher.db';

export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age_group TEXT NOT NULL,
    schedule TEXT,
    current_unit TEXT,
    notes TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    name TEXT NOT NULL,
    notes TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );`,
  `CREATE TABLE IF NOT EXISTS content_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    phrases_json TEXT NOT NULL,
    unit TEXT,
    theme TEXT,
    difficulty INTEGER,
    audio_url TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS lesson_plans (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    blocks_json TEXT NOT NULL,
    checklist_json TEXT NOT NULL,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );`,
  `CREATE TABLE IF NOT EXISTS progress_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    content_item_id TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    note TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(content_item_id) REFERENCES content_items(id)
  );`,
  `CREATE TABLE IF NOT EXISTS ruhi_books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    level TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS ruhi_sections (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    title TEXT NOT NULL,
    section_order INTEGER NOT NULL,
    text TEXT NOT NULL,
    prompts_json TEXT NOT NULL,
    FOREIGN KEY(book_id) REFERENCES ruhi_books(id)
  );`,
  `CREATE TABLE IF NOT EXISTS ruhi_notes (
    id TEXT PRIMARY KEY,
    section_id TEXT NOT NULL,
    body TEXT NOT NULL,
    apply_this_week TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(section_id) REFERENCES ruhi_sections(id)
  );`,
  `CREATE TABLE IF NOT EXISTS class_sessions (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    date TEXT NOT NULL,
    title TEXT,
    notes TEXT,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );`,
  `CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(session_id) REFERENCES class_sessions(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
  );`,
];
