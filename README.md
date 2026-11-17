# Issue Tracker – Frontend (React)

React 18 + Vite + Tailwind CSS + dnd-kit (drag & drop) + Axios + React Router. Pairs with the Spring Boot backend in the `issue-tracker-backend` project.

## Run locally
```bash
npm install
cp .env.example .env      # set VITE_API_URL to your backend (default http://localhost:8080)
npm run dev               # http://localhost:5173
```
Start the backend first (see its README). Demo logins: `admin@tracker.com / Admin@123`, `manager@tracker.com / Manager@123`, `dev@tracker.com / Dev@1234`.

## Screens
| Route | What it does |
|---|---|
| `/login`, `/register` | JWT authentication (new accounts are developers) |
| `/` | Dashboard: your open tickets, status counts, your projects |
| `/projects` | Project cards; admins and managers can create projects |
| `/projects/:id` | **Kanban board** (To do → In progress → Done) with drag & drop, search and filters, new ticket |
| `/projects/:id/settings` | Edit project, add/remove team members, delete project (owner/admin) |
| `/tickets` | All tickets: search, filter by project/status/priority/type/assignee, sort, pagination |
| `/tickets/:id` | Ticket details, edit/delete (permission-aware), assignee, status, screenshot upload, comments |
| `/users` | Admin only: change user roles |

Buttons for editing, deleting and managing appear only when the API says the current user is allowed (`canEdit`, `canDelete`, `canManage`); the backend enforces the same rules.

## Build & deploy (Day 12–13)
```bash
npm run build             # outputs dist/
```
- **Vercel / Netlify:** import the repo, set env `VITE_API_URL=https://<your-backend>`; `vercel.json` and `public/_redirects` already handle SPA routing.
- **Render static site:** build command `npm run build`, publish directory `dist`, add a rewrite rule `/*` → `/index.html`.
- After deploying, add the frontend URL to the backend's `CORS_ORIGINS` variable.

## Structure
```
src/
├── api/client.js          Axios instance (JWT interceptor) + API modules
├── context/               AuthContext, ToastContext
├── components/            Layout, KanbanBoard, TicketForm, TicketCard, CommentSection, Modal, Spinner…
├── pages/                 Login, Register, Dashboard, Projects, ProjectBoard, ProjectSettings, Tickets, TicketDetail, Users
└── utils/                 constants, helpers
```

## Notes
- Drag & drop is optimistic: the card moves instantly and rolls back with an error toast if the API rejects the move.
- Real-time updates over WebSocket are available on the backend (`/ws`, topic `/topic/projects/{id}`); this UI doesn't subscribe yet. Add `@stomp/stompjs` + `sockjs-client` and call `load()` in `ProjectBoard` when an event arrives.
