# StudyRoom AI — Deployment Guide

Deploy the **frontend** on **Vercel** and the **backend** on **Render**.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| GitHub / GitLab repo | Push this project to a Git remote first |
| MongoDB Atlas cluster | Free tier works — [atlas.mongodb.com](https://cloud.mongodb.com/) |
| Firebase project | Auth (Google) + Storage enabled |
| Groq API key | [console.groq.com](https://console.groq.com/) |

---

## 1 — Deploy Backend on Render

### Option A: Blueprint (recommended)

1. Push code to GitHub.
2. Go to **[dashboard.render.com](https://dashboard.render.com/)** → **New** → **Blueprint**.
3. Connect your repo. Render will detect `render.yaml` and auto-configure the service.
4. Fill in the env vars it prompts you for (see table below).

### Option B: Manual

1. **New** → **Web Service**.
2. Connect repo, set **Root Directory** to `backend`.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Environment**: Node
6. Add the environment variables listed below.

### Backend Environment Variables

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (or Render's default) |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | A long random string |
| `FIREBASE_PROJECT_ID` | From Firebase console |
| `FIREBASE_CLIENT_EMAIL` | From Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY` | From Firebase service account JSON (keep the `\n` newlines) |
| `FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `GROQ_API_KEY` | From Groq console |
| `FRONTEND_URL` | `https://your-app.vercel.app` ← set after Vercel deploy |

> **Tip:** After deploying, note the Render URL (e.g. `https://studyroom-ai-backend.onrender.com`). You'll need it for the frontend.

---

## 2 — Deploy Frontend on Vercel

1. Go to **[vercel.com](https://vercel.com/)** → **New Project**.
2. Import the same repo.
3. Set **Root Directory** to `frontend`.
4. Vercel auto-detects Next.js — build & output are pre-configured.
5. Add the environment variables listed below.
6. Click **Deploy**.

### Frontend Environment Variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://studyroom-ai-backend.onrender.com/api` ← your Render URL |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase console → Project settings → Web app |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase console |

---

## 3 — Post-Deploy Steps

### Update CORS on Render

After Vercel gives you a URL (e.g. `https://studyroom-ai.vercel.app`):

1. Go to Render dashboard → your service → **Environment**.
2. Set `FRONTEND_URL` = `https://studyroom-ai.vercel.app`.
3. Redeploy.

The backend CORS config also allows **any `*.vercel.app`** origin automatically, so Vercel Preview Deploys work out of the box.

### Update Firebase Auth Domains

In the Firebase Console → **Authentication** → **Settings** → **Authorized domains**, add:
- `studyroom-ai.vercel.app` (your Vercel production domain)
- `*.vercel.app` (for preview deploys)

### MongoDB Atlas Network Access

Make sure **0.0.0.0/0** (allow from anywhere) is in your Atlas Network Access list, or add Render's outbound IPs specifically.

---

## 4 — Local Development

```bash
# Backend
cd backend
cp .env.example .env   # Fill in real values
npm run dev

# Frontend (separate terminal)
cd frontend
cp .env.local.example .env.local   # Fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `auth/invalid-api-key` | Check `NEXT_PUBLIC_FIREBASE_*` env vars are set in Vercel |
| CORS errors | Set `FRONTEND_URL` on Render to your exact Vercel URL |
| Build fails on Vercel | Make sure Root Directory is `frontend` |
| Backend 502 on Render | Check logs — likely missing env vars or MongoDB connection issue |
| Firebase `signInWithPopup` blocked | Add your Vercel domain to Firebase Authorized Domains |
