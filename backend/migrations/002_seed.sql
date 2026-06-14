-- Seed data for local development/testing
-- Test user: email=demo@example.com password=demo123 (bcrypt hash below)

INSERT INTO users (id, email, password, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo@example.com', '$2a$10$IOaQ9WV2YD05104DaFWTfuuKMMsudu8NbI2S5XeSYdA1nPHjBYAOa', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Set up project repository', 'Initialize Git repo and push initial commit', 'done', 'high', '2026-06-10T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Design database schema', 'Define tables for users and tasks', 'done', 'high', '2026-06-11T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Build authentication API', 'Signup and login with JWT', 'done', 'high', '2026-06-12T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Implement task CRUD endpoints', 'Create, read, update, delete for tasks', 'in_progress', 'high', '2026-06-15T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Add filtering and pagination', 'Support status filter and page/limit query params', 'in_progress', 'medium', '2026-06-16T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Add search by title', 'Implement ILIKE search on task title', 'todo', 'medium', '2026-06-17T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Add sort by due date and priority', 'Support sort_by and order query params', 'todo', 'medium', '2026-06-18T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Write backend tests', 'Unit tests for service layer validation', 'todo', 'high', '2026-06-19T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Set up Docker for local Postgres', 'docker-compose with healthcheck and seed', 'done', 'low', '2026-06-13T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Build frontend task list view', 'Next.js page with status filter and pagination', 'todo', 'high', '2026-06-20T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Build task create/edit form', 'Client-side validation for title and dates', 'todo', 'medium', '2026-06-21T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Add dark mode toggle', 'Persist theme preference', 'todo', 'low', '2026-06-25T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Write README with setup instructions', 'Document env vars, setup, assumptions', 'todo', 'medium', '2026-06-22T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Deploy backend to Render', 'Set root directory and env vars', 'todo', 'medium', '2026-06-23T00:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'Deploy frontend to Vercel', 'Set root directory and NEXT_PUBLIC_API_URL', 'todo', 'medium', '2026-06-24T00:00:00Z')
ON CONFLICT DO NOTHING;