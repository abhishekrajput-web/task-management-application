# Smart Task Manager (AI‑Powered) — Gemini 2.5 Flash

A full‑stack task management app with built‑in AI features using **Google Gemini 2.5 Flash**.

## What you can do
- Create, update, delete tasks
- Filter by status/priority + sort by newest or due date
- Search tasks by title/description
- AI Productivity Assistant: recommends what to work on next
- AI Improve Task: improves the title + suggests priority + estimates time
- AI Task Breakdown: generates subtasks with time estimates

---

## Demo (GitHub Video)
https://github.com/user-attachments/assets/fac08f99-a8fb-49ef-8197-6ad6a730c4a6
```md

```

---

## Screenshots

### Web App

- Register
![register](https://github.com/user-attachments/assets/5b51a80f-85d4-490f-ad80-ca816be4ae02)

- Login  
![login](https://github.com/user-attachments/assets/89c97f27-bce8-4f95-aa2a-bec883a242e7)

- Dashboard
![dashboard](https://github.com/user-attachments/assets/467531d2-5c18-4ff1-a546-47c4db0c2f25)

- Ai Task Improvement 
![ai](https://github.com/user-attachments/assets/874c751b-5689-42d2-99c2-22cb3832ec55)

### Mobile (Responsive)

- Mobile Register
<img src ="https://github.com/user-attachments/assets/7ffe8377-d890-47b1-9f82-207a2961483f">

- Mobile Login
<img src ="https://github.com/user-attachments/assets/eb0c42de-7125-4f04-ad5b-8dbfeaaa0e35">

---

## Tech Stack

### Frontend (client)
- React (Vite)
- Redux Toolkit
- Tailwind CSS
- Axios
- React Router Dom
- Lucide icons
- react-hot-toast notifications

### Backend (server)
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Google Gemini AI via `@google/genai` (**gemini-2.5-flash**)

---

## Project Structure 

```text
task management app - ai inbuilt/
├─ readme.md
├─ client/
│  ├─ .env
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ index.html
│  ├─ public/
│  │  └─ screenshots/
│  │     ├─ web/
│  │     └─ mobile/
│  └─ src/
│     ├─ app/
│     │  └─ store.js
│     ├─ components/
│     │  ├─ AIAdvisor.jsx
│     │  ├─ Navbar.jsx
│     │  ├─ ProtectedRoute.jsx
│     │  ├─ TaskCard.jsx
│     │  ├─ TaskFilters.jsx
│     │  └─ TaskForm.jsx
│     ├─ features/
│     │  ├─ ai/
│     │  │  └─ aiSlice.js
│     │  ├─ auth/
│     │  │  └─ authSlice.js
│     │  └─ tasks/
│     │     └─ taskSlice.js
│     ├─ pages/
│     │  ├─ Dashboard.jsx
│     │  ├─ Login.jsx
│     │  └─ Register.jsx
│     ├─ services/
│     │  ├─ api.js
│     │  └─ authSlice.js
│     ├─ index.css
│     ├─ main.jsx
│     └─ App.jsx
│
└─ server/
   ├─ .env                # DO NOT COMMIT
   ├─ .gitignore
   ├─ app.js
   ├─ package.json
   ├─ config/
   │  └─ db.js
   ├─ controllers/
   │  ├─ aiController.js
   │  ├─ authController.js
   │  └─ taskController.js
   ├─ helpers/
   │  ├─ jwtHelper.js
   │  └─ passwordHelper.js
   ├─ middleware/
   │  └─ authMiddleware.js
   ├─ models/
   │  ├─ Task.js
   │  └─ User.js
   ├─ routes/
   │  ├─ aiRoutes.js
   │  ├─ authRoutes.js
   │  └─ taskRoutes.js
   ├─ services/
   │  └─ geminiServices.js
   └─ utils/
      ├─ errorHandlers.js
      ├─ healthCheck.js
      └─ logger.js
```

---

## AI Features (Gemini 2.5 Flash)

The backend uses **Gemini 2.5 Flash** (`gemini-2.5-flash`) to:
- Generate productivity suggestions from your task list
- Improve a task (title/priority/time estimate)
- Break down a task into subtasks

Backend service file:
- `server/services/geminiServices.js`

---

## API Routes

Base URL (client env):
- `VITE_API_URL=http://localhost:5000/api`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)

### Tasks (protected)
- `GET /api/tasks?status=&priority=&sortBy=&search=`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/toggle`

### AI (protected)
- `POST /api/ai/suggestion`
- `POST /api/ai/improve` `{ "taskId": "..." }`
- `POST /api/ai/breakdown` `{ "taskId": "..." }`

---

## Environment Variables

### Server (`server/.env`) — do not commit
Create `server/.env` locally.

```env
NODE_ENV=development
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=change_this_secret
JWT_EXPIRE=30d

# Gemini
GOOGLE_GEMINI_API=your_gemini_api_key
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Run Locally (Windows)

### 1) Start MongoDB
Make sure MongoDB is running locally.

### 2) Start Server
```powershell
cd "server"
npm install
node app.js
```

Server runs on:
- `http://localhost:5000`

### 3) Start Client
Open a new terminal:
```powershell
cd "client"
npm install
npm run dev
```

Client runs on:
- `http://localhost:5173` (or Vite port shown in terminal)

## License
MIT
