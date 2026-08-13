import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_PATH || "./data/dashboards.db";

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      file_id     TEXT PRIMARY KEY,
      filename    TEXT NOT NULL,
      file_type   TEXT NOT NULL,
      file_path   TEXT NOT NULL,
      headers     TEXT NOT NULL,
      row_count   INTEGER NOT NULL,
      file_size   INTEGER NOT NULL,
      preview     TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dashboards (
      dashboard_id  TEXT PRIMARY KEY,
      file_id       TEXT NOT NULL,
      domain        TEXT NOT NULL,
      business_goal TEXT NOT NULL,
      theme         TEXT NOT NULL DEFAULT 'modern',
      spec          TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      error         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (file_id) REFERENCES uploaded_files(file_id)
    );

    CREATE INDEX IF NOT EXISTS idx_dashboards_file_id ON dashboards(file_id);
    CREATE INDEX IF NOT EXISTS idx_dashboards_created ON dashboards(created_at DESC);
  `);
}

export const fileQueries = {
  insert: db.prepare(`
    INSERT INTO uploaded_files (file_id, filename, file_type, file_path, headers, row_count, file_size, preview)
    VALUES (@file_id, @filename, @file_type, @file_path, @headers, @row_count, @file_size, @preview)
  `),
  findById: db.prepare(`SELECT * FROM uploaded_files WHERE file_id = ?`),
};

export const dashboardQueries = {
  insert: db.prepare(`
    INSERT INTO dashboards (dashboard_id, file_id, domain, business_goal, theme, spec, status)
    VALUES (@dashboard_id, @file_id, @domain, @business_goal, @theme, @spec, @status)
  `),
  updateSpec: db.prepare(`
    UPDATE dashboards SET spec = @spec, status = @status, updated_at = datetime('now')
    WHERE dashboard_id = @dashboard_id
  `),
  updateError: db.prepare(`
    UPDATE dashboards SET error = @error, status = 'error', updated_at = datetime('now')
    WHERE dashboard_id = @dashboard_id
  `),
  findById: db.prepare(`
    SELECT d.*, f.headers, f.row_count, f.filename
    FROM dashboards d JOIN uploaded_files f ON d.file_id = f.file_id
    WHERE d.dashboard_id = ?
  `),
  listAll: db.prepare(`
    SELECT dashboard_id, domain, business_goal, theme, status, created_at
    FROM dashboards ORDER BY created_at DESC LIMIT 50
  `),
};
