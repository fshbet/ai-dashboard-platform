import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_PATH || "./data/dashboards.db";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const resolved = path.resolve(DB_PATH);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });

  db = new Database(resolved);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      row_count INTEGER,
      columns TEXT,
      dataset_context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dashboards (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL,
      domain TEXT,
      business_goal TEXT,
      theme TEXT DEFAULT 'modern',
      status TEXT DEFAULT 'pending',
      spec TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (file_id) REFERENCES uploaded_files(id)
    );
  `);

  return db;
}

export const dbQueries = {
  insertFile: (params: {
    id: string;
    filename: string;
    original_name: string;
    file_type: string;
    file_size: number;
    row_count: number;
    columns: string;
    dataset_context: string;
  }) => {
    const stmt = getDb().prepare(`
      INSERT INTO uploaded_files (id, filename, original_name, file_type, file_size, row_count, columns, dataset_context)
      VALUES (@id, @filename, @original_name, @file_type, @file_size, @row_count, @columns, @dataset_context)
    `);
    return stmt.run(params);
  },

  findFile: (id: string) => {
    return getDb()
      .prepare("SELECT * FROM uploaded_files WHERE id = ?")
      .get(id) as Record<string, unknown> | undefined;
  },

  insertDashboard: (params: {
    id: string;
    file_id: string;
    domain: string;
    business_goal: string;
    theme: string;
  }) => {
    const stmt = getDb().prepare(`
      INSERT INTO dashboards (id, file_id, domain, business_goal, theme)
      VALUES (@id, @file_id, @domain, @business_goal, @theme)
    `);
    return stmt.run(params);
  },

  updateDashboard: (params: {
    id: string;
    status: string;
    spec?: string;
    error_message?: string;
  }) => {
    const stmt = getDb().prepare(`
      UPDATE dashboards
      SET status = @status, spec = @spec, error_message = @error_message, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
    return stmt.run(params);
  },

  findDashboard: (id: string) => {
    return getDb()
      .prepare("SELECT * FROM dashboards WHERE id = ?")
      .get(id) as Record<string, unknown> | undefined;
  },
};
