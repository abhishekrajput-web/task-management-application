# Smart Task Manager (AI-Powered)

A full‑stack task management app with AI features built-in:
- Create, update, delete, and filter tasks
- Search tasks by title/description
- AI Productivity Assistant: suggests what to work on next
- AI Improve Task: improves title + recommends priority + estimates time
- AI Task Breakdown: splits a large task into subtasks

## Demo
- **Video walkthrough:** https://your-video-link-here (YouTube/Drive)
- **Live demo (optional):** https://your-live-link-here

---

## Screenshots

> Put screenshots in `client/public/screenshots/` (recommended), then link them here.

### 1) Dashboard (Tasks + Filters + AI Advisor)
![Dashboard](client/public/screenshots/dashboard.png)

### 2) AI Productivity Suggestion
![AI Suggestion](client/public/screenshots/ai-suggestion.png)

### 3) AI Improve Task
![AI Improve](client/public/screenshots/ai-improve.png)

### 4) AI Task Breakdown
![AI Breakdown](client/public/screenshots/ai-breakdown.png)

### 5) Search + Filters
![Search Filters](client/public/screenshots/search-filters.png)

---

## Features

### Task Management
- Add task: title, description, priority, due date
- Update task + mark completed/pending
- Delete task
- Filters: status + priority + sort
- Search: `title` and `description`

### AI (RapidAPI Grok-3)
- **AI Productivity Assistant:** recommends the next best task to do
- **AI Improve Task:** suggests improved title, priority, and time estimate
- **AI Breakdown:** generates actionable subtasks with estimates

---

## Tech Stack
### Frontend
- React + Redux Toolkit
- Tailwind CSS
- Lucide icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Auth
- RapidAPI (Grok-3 endpoint)

---

## Folder Structure

```text
task management app - ai inbuilt/
├─ client/
│  ├─ public/
│  │  └─ screenshots/                # add screenshots here
│  └─ src/
│     ├─ components/
│     │  ├─ AIAdvisor.jsx
│     │  ├─ Navbar.jsx
│     │  ├─ TaskCard.jsx
│     │  ├─ TaskFilters.jsx
│     │  └─ TaskForm.jsx
│     ├─ features/
│     │  ├─ ai/
│     │  │  └─ aiSlice.js
│     │  └─ tasks/
│     │     └─ taskSlice.js
│     ├─ pages/
│     │  └─ Dashboard.jsx
│     └─ services/
│        └─ api.js
│
└─ server/
   ├─ controllers/
   │  ├─ aiController.js
   │  └─ taskController.js
   ├─ middleware/
   │  └─ authMiddleware.js
   ├─ models/
   │  └─ Task.js
   ├─ routes/
   │  ├─ aiRoutes.js
   │  └─ taskRoutes.js
   ├─ services/
   │  └─ geminiServices.js           # Grok RapidAPI integration
   ├─ .env.example                   # committed
   └─ server.js / app.js             # entry (your project file)
```

---

## Setup (Local Development)

### Prerequisites
- Node.js 18+ (recommended)
- MongoDB running locally **OR** a MongoDB Atlas connection string
- RapidAPI key for Grok-3 endpoint

---

## Environment Variables

### 1) Server env
Create: `server/.env` (DO NOT commit)

Example: copy `server/.env.example` → `server/.env`

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-task-manager

JWT_SECRET=change_me
JWT_EXPIRE=30d

CLIENT_URL=http://localhost:3000

# RapidAPI Grok-3
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=grok-3-0-ai.p.rapidapi.com
RAPIDAPI_GROK_URL=https://grok-3-0-ai.p.rapidapi.com/
```

> Security:
> - Never commit API keys, JWT secrets, or DB credentials.
> - Add `server/.env` to `.gitignore`.

### 2) Client env (if your client uses env)
If needed, create: `client/.env`
```env
VITE_API_URL=http://localhost:5000
```

---

## Install & Run

### Backend
```bash
cd server
npm install
npm run dev
```

Backend will run on:
- `http://localhost:5000`

### Frontend
```bash
cd client
npm install
npm run dev
```

Frontend will run on:
- `http://localhost:3000` (or Vite default `5173` depending on your setup)

---

## API Endpoints (Summary)

### Tasks
- `GET /api/tasks?status=&priority=&sortBy=&search=`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/toggle` *(if enabled in your backend)*

### AI
- `POST /api/ai/suggestion` → Productivity assistant
- `POST /api/ai/improve` `{ taskId }` → Improve task
- `POST /api/ai/breakdown` `{ taskId }` → Break down into subtasks

All routes are protected using JWT (Authorization header).

---

## How to Add Screenshots
1. Create folder: `client/public/screenshots/`
2. Add images:
   - `dashboard.png`
   - `ai-suggestion.png`
   - `ai-improve.png`
   - `ai-breakdown.png`
   - `search-filters.png`
3. Update links in README.

---

## How to Record Video Demo (Quick)
- Windows: Xbox Game Bar (`Win + G`) OR OBS Studio
- Record:
  - Login/Register
  - Create tasks
  - Search + filters
  - “Get Suggestion”
  - “Improve” + “Breakdown”
- Upload to YouTube/Drive and paste link in README.

---

## Deployment Notes (Optional)
- Use MongoDB Atlas for production DB
- Store env variables in the hosting dashboard
- Set `CLIENT_URL` to your deployed frontend domain
- Enable CORS accordingly

---

## Contributing
Pull requests are welcome. For major changes, open an issue first to discuss.

---

## License
MIT