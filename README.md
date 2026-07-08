# AI Public Grievance Analyzer

An AI-powered complaint management platform that automatically classifies, prioritizes, detects duplicate complaints, predicts escalation risk, and routes public grievances to the correct government department.

## Purpose

The purpose of this project is to make public complaint handling faster, more transparent, and more data-driven.

Government bodies receive large numbers of complaints from portals, emails, mobile apps, social media, and local offices. Many of these complaints are repeated, sent to the wrong department, or left unattended until they become urgent. This platform uses AI to assist the complaint workflow so that officers can focus on resolving issues instead of manually sorting them.

## Real-World Problem It Solves

Public grievance systems often face these problems:

- Duplicate complaints about the same issue are handled separately.
- Citizens select the wrong department while submitting complaints.
- Officers spend time manually reading and routing every complaint.
- Urgent issues are not detected early.
- Negative or politically sensitive complaints may escalate before action is taken.
- Administrators do not get clear analytics on department performance or complaint trends.

AI Public Grievance Analyzer solves these problems by analyzing every complaint at submission time and generating useful metadata such as category, urgency, sentiment, department, duplicate similarity, and escalation risk.

## How It Works

1. A citizen submits a complaint with title, description, location, and optional attachments.
2. The backend cleans and normalizes the complaint text.
3. The system generates an embedding for duplicate detection.
4. Similar complaints are compared using cosine similarity.
5. AI classifies the complaint category.
6. Sentiment and urgency are detected.
7. The complaint is routed to the most suitable department.
8. Escalation risk is calculated.
9. The complaint is stored in MongoDB.
10. Officers and admins track the complaint through dashboards.

## User Roles

### Citizen

- Register and login.
- Submit complaints.
- Upload supporting files.
- Track complaint status.
- View AI-generated complaint summary and priority details.

### Officer

- View complaints assigned to their department.
- Update complaint status.
- Add remarks.
- Resolve or reject complaints.
- Focus on high-priority and high-risk issues.

### Admin

- Manage departments.
- View all complaints.
- Monitor dashboard analytics.
- Track complaint trends, urgency, sentiment, and department performance.

## AI Pipeline

The project uses a hybrid AI strategy instead of sending everything to one LLM.

Pipeline steps:

- Complaint text cleaning
- Embedding generation
- Duplicate complaint detection
- Category classification
- Sentiment analysis
- Urgency detection
- Department recommendation
- Escalation risk prediction
- Complaint summary generation

Groq can be used for language-heavy tasks, while deterministic local fallback logic keeps the demo working even without an API key.

Main AI file:

```text
server/src/services/aiService.js
```

Duplicate detection logic:

```text
server/src/services/complaintService.js
```

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query
- Recharts
- Lucide Icons

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Socket.io

### AI

- Groq API support
- Local deterministic fallback
- Text embeddings
- Cosine similarity duplicate detection

## Project Structure

```text
ai-public-grievance-analyzer/
  client/
    src/
      api/
      components/
      contexts/
      pages/
      styles/
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
```

## Main API Routes

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Complaints

- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `PUT /api/complaints/:id/status`

### AI

- `POST /api/ai/classify`
- `POST /api/ai/summarize`
- `POST /api/ai/similarity`

### Departments

- `POST /api/departments`
- `GET /api/departments`

### Dashboard

- `GET /api/dashboard`

## Quick Start

Install dependencies:

```bash
cd ai-public-grievance-analyzer
npm install
```

Create environment files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

Start both frontend and backend:

```bash
npm run dev
```

Client:

```text
http://localhost:5173
```

Server:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

## Environment Variables

Server variables live in `server/.env`.

```env
PORT=5000
MONGO_URI=mongodb+srv://<db_user>:<db_password>@<cluster-host>/grievance_ai?retryWrites=true&w=majority
JWT_SECRET=<generate_a_long_random_secret>
CLIENT_URL=http://localhost:5173,https://your-frontend-domain.com
GROQ_API_KEY=<your_groq_api_key>
```

Client variables live in `client/.env`.

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

## Deployment Environment Guide

Use the same variable names in production, but replace localhost with your deployed domains:

- `CLIENT_URL`: your frontend domain, plus `http://localhost:5173` for local development if you still run it locally
- `VITE_API_URL`: your backend API base URL
- `VITE_SOCKET_URL`: your backend base URL used by Socket.IO
- `MONGO_URI`: your MongoDB Atlas connection string
- `JWT_SECRET`: a long random secret generated once and kept private
- `GROQ_API_KEY`: your Groq API key

## Demo Notes

You can register directly from the app and choose a role: Citizen, Officer, or Admin.

For a production system, role assignment should not be open to all users. Admin and officer creation should be restricted to verified administrators.

## Future Enhancements

- MongoDB Atlas Vector Search for scalable duplicate detection.
- OCR for extracting text from uploaded complaint images.
- Real-time notifications for department officers.
- Complaint heatmap by location.
- SLA tracking and automatic overdue escalation.
- Officer workload balancing.
- Public transparency dashboard for resolved complaints.

## Interview Talking Points

- The project solves a real public administration problem.
- It uses AI as a decision-support system, not just a chatbot.
- The AI pipeline is hybrid, cheaper, and more scalable than using only an LLM.
- Duplicate detection uses embeddings and similarity instead of exact keyword matching.
- Escalation risk combines urgency, sentiment, duplicate count, and complaint context.
- The architecture separates frontend, backend, database models, routes, controllers, and AI services cleanly.
