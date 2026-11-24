# Quizora frontend

The frontend is a React and Vite application. It sends authentication, profile,
and quiz requests to the Quizora backend; it does not connect to Supabase
directly and does not require a Supabase key.

## Run locally

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` if the backend is not running at
`http://localhost:3000`. Supabase credentials belong only in the backend
environment.
