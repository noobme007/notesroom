# StudyRoom AI

A collaborative notes sharing platform where users join rooms using a code, access organized notes, preview files, and interact with an AI chatbot that searches the notes.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js, React, TailwindCSS, TypeScript |
| Backend        | Node.js, Express.js, TypeScript     |
| Database       | MongoDB                             |
| Authentication | Firebase Authentication (Google OAuth) |
| File Storage   | Firebase Storage                    |
| AI Model       | Llama 3 via Groq API                |
| Vector Search  | In-memory cosine similarity + MongoDB |

## Project Structure

```
notesroom/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Firebase, env config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/       # Auth, permissions, error handling
│   │   ├── models/          # MongoDB/Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic (AI, storage, etc.)
│   │   ├── utils/           # Helper functions
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable React components
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Firebase config, utilities
│   ├── services/            # API service layer
│   ├── types/               # TypeScript type definitions
│   ├── package.json
│   └── tailwind.config.ts
└── README.md
```

## Prerequisites

- **Node.js** >= 18
- **MongoDB** (local or Atlas)
- **Firebase Project** with Authentication & Storage enabled
- **Groq API Key** (free at https://console.groq.com)

## Setup Instructions

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in method → **Google**
4. Enable **Storage**
5. Go to Project Settings → General → Your apps → Add Web App
6. Copy the Firebase config values
7. Go to Project Settings → Service accounts → Generate new private key
8. Save the service account JSON for the backend

### 3. Groq API Setup

1. Go to [Groq Console](https://console.groq.com)
2. Create a free account
3. Generate an API key

### 4. Environment Variables

#### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studyroom
JWT_SECRET=your-jwt-secret-here

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

GROQ_API_KEY=your-groq-api-key
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 5. Run the Application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Features

1. **Google Authentication** — Login with Google, auto-registration
2. **Room Creation** — Create rooms with unique 6-char codes
3. **Join Room** — Enter room code to join as viewer
4. **Role-Based Permissions** — Admin / Editor / Viewer
5. **Folder Organization** — Create folder structures within rooms
6. **File Upload** — PDF, Images, DOC, PPT via Firebase Storage
7. **File Preview** — In-browser preview without downloading
8. **AI Chatbot** — Per-room chatbot that searches uploaded notes
9. **Document Processing** — Text extraction, chunking, embeddings
10. **Semantic Search** — Vector similarity search for relevant content

## API Endpoints

| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| POST   | /api/auth/google                  | Google sign-in          |
| GET    | /api/auth/me                      | Get current user        |
| POST   | /api/rooms                        | Create room             |
| POST   | /api/rooms/join                   | Join room by code       |
| GET    | /api/rooms                        | List user's rooms       |
| GET    | /api/rooms/:id                    | Get room details        |
| GET    | /api/rooms/:id/members            | List room members       |
| PUT    | /api/rooms/:id/members/:userId    | Update member role      |
| DELETE | /api/rooms/:id/members/:userId    | Remove member           |
| POST   | /api/rooms/:roomId/folders        | Create folder           |
| GET    | /api/rooms/:roomId/folders        | List folders            |
| DELETE | /api/folders/:id                  | Delete folder           |
| POST   | /api/folders/:folderId/files      | Upload file             |
| GET    | /api/folders/:folderId/files      | List files in folder    |
| DELETE | /api/files/:id                    | Delete file             |
| GET    | /api/files/:id/preview            | Get file preview URL    |
| POST   | /api/rooms/:roomId/chat           | Send chat message       |
| GET    | /api/rooms/:roomId/chat/history   | Get chat history        |

## License

MIT
