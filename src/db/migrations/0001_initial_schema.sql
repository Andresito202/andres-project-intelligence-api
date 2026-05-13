PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  problem_solved TEXT,
  role TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('production', 'published', 'prototype', 'in_development', 'archived')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  year INTEGER NOT NULL,
  demo_url TEXT,
  repo_url TEXT,
  repo_visibility TEXT NOT NULL DEFAULT 'unpublished' CHECK (repo_visibility IN ('public', 'private', 'unpublished')),
  category TEXT NOT NULL,
  stack TEXT NOT NULL DEFAULT '[]',
  features TEXT NOT NULL DEFAULT '[]',
  screenshots TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_idx ON projects (slug);
CREATE INDEX IF NOT EXISTS projects_category_idx ON projects (category);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects (status);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects (featured);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS skills_name_idx ON skills (name);
CREATE INDEX IF NOT EXISTS skills_category_idx ON skills (category);

CREATE TABLE IF NOT EXISTS case_studies (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  architecture TEXT NOT NULL,
  results TEXT NOT NULL,
  lessons TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS case_studies_slug_idx ON case_studies (slug);
CREATE INDEX IF NOT EXISTS case_studies_project_id_idx ON case_studies (project_id);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'portfolio',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages (status);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages (created_at);

CREATE TABLE IF NOT EXISTS repo_status (
  id TEXT PRIMARY KEY NOT NULL,
  project_slug TEXT NOT NULL,
  repo_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'unpublished' CHECK (visibility IN ('public', 'private', 'unpublished')),
  is_available INTEGER NOT NULL DEFAULT 0 CHECK (is_available IN (0, 1)),
  last_checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_slug) REFERENCES projects (slug) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS repo_status_project_slug_idx ON repo_status (project_slug);
