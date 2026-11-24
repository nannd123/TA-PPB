# Quizora database schema

The Supabase PostgreSQL schema is created by the initial migration
[`20261117000000_initial_schema.sql`](../supabase/migrations/20261117000000_initial_schema.sql)
and the additive Daily Quiz migration
[`20261122000000_daily_quiz_scheduling.sql`](../supabase/migrations/20261122000000_daily_quiz_scheduling.sql).
The cleanup migration
[`20261124000000_daily_quiz_schedule_only.sql`](../supabase/migrations/20261124000000_daily_quiz_schedule_only.sql)
removes the legacy quiz-level daily fields after validating that every legacy
assignment exists in `daily_quiz_schedule`.
The user-auth migration
[`20261123000000_user_auth_and_profile_avatars.sql`](../supabase/migrations/20261123000000_user_auth_and_profile_avatars.sql)
creates the profile avatar storage bucket and policies.
[`seed.sql`](../supabase/seed.sql) is the sole official, idempotent seed source
for development databases; the application must still read and write through
the Quizora Express API.

## Tables and relationships

| Table | Purpose | Important relationships |
|---|---|---|
| `categories` | Published quiz groupings | One category has many quizzes |
| `quizzes` | Quiz metadata and publication status | Belongs to one category |
| `questions` | Ordered, weighted quiz questions and explanations | Belongs to one quiz |
| `answer_options` | Four labelled choices and server-side answer key | Belongs to one question |
| `daily_quiz_schedule` | Immutable daily quiz assignment | One quiz per scheduled date |
| `quiz_attempts` | Authenticated user's quiz attempt and computed result | Belongs to one quiz |
| `quiz_attempt_answers` | Submitted choice and correctness per question | References an attempt, its quiz question, and an option from that question |

## Integrity and scoring rules

- Category slugs are unique and lowercase URL slugs.
- Quiz difficulty is `easy`, `medium`, or `hard`; duration must be positive.
- `daily_quiz_schedule` is the sole source of truth for Daily Quiz assignments
  and allows one quiz per scheduled date.
- Question order is unique within its quiz; points and order must be positive.
- Each question must have exactly four options labelled A–D and exactly one
  correct option. Deferred constraint triggers check the complete set at
  transaction commit, so the four rows can be inserted together.
- Composite foreign keys prevent an attempt answer from pairing a question
  with the wrong quiz or selecting an option belonging to another question.
- `(attempt_id, question_id)` prevents duplicate answer rows.
- Attempts can transition only once from `in_progress` to `submitted` or
  `expired`. A partial unique index permits only one active attempt per guest
  and quiz, while allowing retakes after completion.
- `submit_quiz_attempt` is a single database transaction. It validates question
  and option IDs, records unanswered questions as incorrect, computes the
  weighted score as `earned points / possible points * 100`, and rejects
  resubmission. If the server-side duration has elapsed, it marks the attempt
  expired instead of scoring a late submission.

## Access and security

Row-level security is enabled on every application table. There are no public
table policies, and direct `anon`/`authenticated` table privileges are revoked.
The backend's `service_role` is granted table access and permission to execute
the submit and daily-scheduler functions; its key must remain server-side and
must never be exposed to the frontend.

The existing `quiz_attempts.guest_id` UUID column stores the verified
Supabase Auth user ID for compatibility with the current schema and scoring
function. The API validates the Supabase access token and derives this ID from
the authenticated user; it never accepts an owner ID from the client.

The `quizora-avatars` bucket is public for reading profile images. Storage
policies allow authenticated users to write only under the folder named for
their own Supabase user ID; images are limited to JPEG, PNG, or WebP up to 5 MB.

Question reads before submission must omit `answer_options.is_correct`.
Correctness and score are derived by the database submit function, never
accepted from the browser.

The new migration adds `is_daily_quiz_eligible(uuid)` to validate published
packages: nonblank title/category, exactly five distinct questions ordered
1–5, and four distinct nonblank A–D options with one correct answer and a
nonblank explanation per question. `ensure_daily_quiz_scheduled(date)` uses a
transaction-scoped advisory lock to make scheduling atomic and idempotent.
Packages with the fewest uses are selected first, with oldest last-used date
breaking ties. Existing schedules are never reassigned. The migration safely
copies eligible legacy daily records into the new schedule table.

## Applying schema and sample data

1. Review and run all SQL migrations in timestamp order in the Supabase SQL
   Editor, or apply them with Supabase CLI migrations after initializing the
   project.
2. Run `supabase/seed.sql` in a development project to upsert three categories,
   nine quiz packages, 41 questions, and 164 answer options. Seven packages
   contain five questions and are eligible for Daily Quiz; two demo packages
   contain three questions each. The seed checks these counts and is safe to
   run repeatedly without duplicating its records.
3. Configure the backend with the Supabase URL and server-side service role
   key in `backend/.env`; never commit that file.

`GET /api/quizzes/daily` lazily ensures the current Asia/Jakarta date is
scheduled before reading the assigned quiz. The request invokes the atomic,
idempotent database function directly, so no persistent process, background
worker, or platform cron is required. This also works when API instances are
stateless or scale to zero.
