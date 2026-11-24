# Quizora REST API contract

The Express backend is the only application path to Supabase. It handles auth,
profile photos, and quiz data; the frontend only calls the Express API. All
successful API responses use
`{ "success": true, "message": "...", "data": ... }`; list responses may also
include `meta` with `limit`, `offset`, and `total`.
Errors use `{ "success": false, "message": "...", "data": null }`, except an
expired submission may include the expiration result in `data`.

The operational health endpoint is `GET /health`. Application endpoints use
the `/api` prefix.

## Authentication

Users register and sign in with a username and password through the backend.
The backend maps each lowercase username to an internal address at
`users.quizora.invalid` and confirms the account directly, so users do not need
a real email address or email-confirmation settings. Usernames are 3-30
characters and may contain letters, numbers, and underscores.

| Method and path | Behavior |
|---|---|
| `POST /api/auth/register` | Creates a username/password account and returns its session (`201`) |
| `POST /api/auth/login` | Signs in and returns its session |
| `POST /api/auth/refresh` | Refreshes a session using `refresh_token` |
| `PATCH /api/profile` | Updates the authenticated user's display name and, optionally, username |
| `POST /api/profile/avatar` | Uploads a JPG, PNG, or WebP avatar (maximum 5 MB) |

Protected API requests include the Supabase access token as
`Authorization: Bearer <access-token>`. The backend validates the token with
Supabase Auth and uses its verified user ID to scope attempt data. The former
`POST /api/guest` endpoint is no longer available.

The profile update accepts `display_name` (1-60 characters) and an optional
`username` (3-30 letters, numbers, or underscores). A username change also
updates the account's internal sign-in address; duplicate usernames return
`409`. Users continue signing in with their current username.

## Public reads

| Method and path | Behavior |
|---|---|
| `GET /api/categories` | Lists categories |
| `GET /api/categories/:id` | Gets a category by UUID |
| `GET /api/categories/:id/quizzes` | Lists published quizzes in a category |
| `GET /api/quizzes` | Lists published quizzes; supports `category_id`, `difficulty`, `limit` (1–50), and `offset` (0–5000) |
| `GET /api/quizzes/daily` | Ensures and gets the published five-question daily quiz for the current Asia/Jakarta date |
| `GET /api/quizzes/:id` | Gets published quiz details and question count |
| `GET /api/quizzes/:id/questions` | Gets questions and options without answer keys or explanations |

Paginated quiz and attempt-list endpoints default to `limit=20` and `offset=0`.
An absent or ineligible daily quiz returns `404`; an invalid UUID or query
filter returns `400`. Daily quiz data includes its `scheduled_date` and a
`question_count` of five. The frontend refreshes this resource at midnight WIB.

## Attempt operations

All attempt endpoints require a valid Supabase user access token.

| Method and path | Behavior |
|---|---|
| `POST /api/quizzes/:id/attempts` | Starts an attempt (`201`) or returns the user's existing active attempt (`200`) |
| `POST /api/attempts/:id/submit` | Submits answers and asks PostgreSQL to validate and score them |
| `GET /api/attempts` | Lists this user's submitted history; supports `limit` and `offset` |
| `GET /api/attempts/:id` | Gets a submitted result, explanations, and correct options for the owning user |

Submit body:

```json
{
  "answers": [
    {
      "question_id": "uuid",
      "selected_option_id": "uuid"
    },
    {
      "question_id": "uuid",
      "selected_option_id": null
    }
  ]
}
```

Omitted questions count as unanswered. The browser must not send a score or
correctness value; extra fields are ignored. Duplicate question IDs, malformed
UUIDs, foreign quiz questions, and options belonging to a different question
are rejected. An expired or already-completed attempt returns `409`.

## Status codes and configuration

- `200` - read or submit succeeded.
- `201` - attempt created.
- `400` - invalid request data.
- `401` - missing or invalid user access token.
- `404` - category, quiz, or submitted result not found.
- `409` - attempt is expired/completed, the quiz has no questions, or the
  requested username is already in use.
- `502` - Supabase returned a database error.
- `503` - Supabase configuration is unavailable, including
  database access denied because the backend key lacks service-role privileges.

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`. The
frontend only needs `VITE_API_BASE_URL` (default: `http://localhost:3000`).
Never put the service-role key in the frontend or in a `VITE_` variable.

Import [`Quizora_API.postman_collection.json`](../postman/Quizora_API.postman_collection.json)
to exercise these routes. Authenticate in the frontend and provide a valid
Supabase access token when testing protected routes. The main quiz flow requires
the migrations and development seed to be applied to Supabase.
