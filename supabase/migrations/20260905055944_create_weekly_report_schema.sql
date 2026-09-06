/*
# Weekly Report Generator & Team Dashboard — Schema

## Overview
Creates the full data model for a weekly report management application with
role-based views (Team Member vs Manager), report versioning, and review workflows.

## Tables

### users
- Stores team members and managers (no real auth — persona-based demo).
- `id` uuid PK, `name`, `email`, `role` ('team_member' | 'manager'),
  `department`, `avatar_url`, `created_at`.

### projects
- Project / category tags that reports are filed against.
- `id` uuid PK, `name`, `description`, `color` (hex), `archived` bool, `created_at`.

### reports
- The core weekly report. Structured sub-sections stored as JSONB columns
  because the form structure is fixed but complex (tasks table, blockers list,
  achievements list, hours breakdown).
- `id` uuid PK
- `user_id` → users.id (who wrote the report)
- `project_id` → projects.id (primary project for the week)
- `week_start`, `week_end` (date range)
- `status` enum: 'draft', 'submitted', 'needs_correction', 'approved'
- `tasks` jsonb — array of task objects {name, priority, planned_pct, actual_pct, status, time_planned, time_spent, output}
- `next_week_tasks` jsonb — array of {text, done}
- `blockers` jsonb — array of {text, is_key_issue}
- `achievements` jsonb — array of {text, is_key_achievement}
- `hours_breakdown` jsonb — {development, testing, meetings, documentation, other}
- `notes` text, `links` jsonb — array of {label, url}
- `review_comment` text — latest manager feedback
- `submitted_at`, `approved_at` timestamptz
- `created_at`, `updated_at`

### report_versions
- Snapshots of report content each time it's resubmitted after "needs correction".
- `id` uuid PK, `report_id` → reports.id, `version_number` int,
  `content` jsonb (full snapshot of the report's editable fields),
  `review_comment` text (the comment that triggered this version),
  `created_at`.

### review_comments
- Audit trail of all manager review actions.
- `id` uuid PK, `report_id` → reports.id, `reviewer_id` → users.id,
  `comment` text, `action` ('approve' | 'request_changes'), `created_at`.

## Security
- This is a single-tenant demo app with no real sign-in — a persona selector
  switches the "current user" client-side. All tables use
  `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because the data is intentionally shared across all demo personas.
- RLS enabled on every table.
*/

-- ── users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text UNIQUE NOT NULL,
  role        text NOT NULL DEFAULT 'team_member' CHECK (role IN ('team_member', 'manager')),
  department  text DEFAULT 'General',
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE TO anon, authenticated USING (true);

-- ── projects ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text DEFAULT '',
  color       text DEFAULT '#3b82f6',
  archived    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE TO anon, authenticated USING (true);

-- ── reports ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  project_id      uuid REFERENCES projects(id) ON DELETE SET NULL,
  week_start      date NOT NULL,
  week_end        date NOT NULL,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','needs_correction','approved')),
  tasks           jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_week_tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  blockers        jsonb NOT NULL DEFAULT '[]'::jsonb,
  achievements    jsonb NOT NULL DEFAULT '[]'::jsonb,
  hours_breakdown jsonb NOT NULL DEFAULT '{"development":0,"testing":0,"meetings":0,"documentation":0,"other":0}'::jsonb,
  notes           text DEFAULT '',
  links           jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_comment  text DEFAULT '',
  submitted_at    timestamptz,
  approved_at     timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE TO anon, authenticated USING (true);

-- ── report_versions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS report_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id      uuid REFERENCES reports(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  content        jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_comment text DEFAULT '',
  created_at     timestamptz DEFAULT now()
);
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_versions" ON report_versions;
CREATE POLICY "anon_select_versions" ON report_versions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_versions" ON report_versions;
CREATE POLICY "anon_insert_versions" ON report_versions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_versions" ON report_versions;
CREATE POLICY "anon_update_versions" ON report_versions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_versions" ON report_versions;
CREATE POLICY "anon_delete_versions" ON report_versions FOR DELETE TO anon, authenticated USING (true);

-- ── review_comments ───────────────────────────────────
CREATE TABLE IF NOT EXISTS review_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   uuid REFERENCES reports(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  comment     text NOT NULL DEFAULT '',
  action      text NOT NULL CHECK (action IN ('approve','request_changes')),
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_review_comments" ON review_comments;
CREATE POLICY "anon_select_review_comments" ON review_comments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_review_comments" ON review_comments;
CREATE POLICY "anon_insert_review_comments" ON review_comments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_review_comments" ON review_comments;
CREATE POLICY "anon_delete_review_comments" ON review_comments FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_report_versions_report_id ON report_versions(report_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_report_id ON review_comments(report_id);