<img src="https://socialify.git.ci/Bongeka-Bhungane/ChatBot/image?description=1&font=Raleway&language=1&name=1&owner=1&pattern=Circuit+Board&theme=Light" alt="ChatBot" width="640" height="320" />

# CodeTribe AI ChatBot Project

This project is a **full-stack AI ChatBot web application** built using **React (TypeScript)** for the frontend and **Node.js (Express + TypeScript)** for the backend.
The chatbot integrates with **AI Model** and supports document upload for AI-assisted responses.

---

## :rocket: Live Deployment

### Frontend (React)

:link: [https://chatbot-nbhu.onrender.com](https://chatbot-nbhu.onrender.com)

### Backend (API)

:link: [https://chatbot-w3ue.onrender.com/](https://chatbot-w3ue.onrender.com/)

---
## :hammer_and_wrench: Installation & Setup

### :one: Clone Repository

```bash
git clone https://github.com/Bongeka-Bhungane/ChatBot.git
cd ChatBot
```

---

## :wrench: Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Run Backend Server

```bash
npm run dev
```

Backend will run on:

```bash
http://localhost:3000
```

---

## :art: Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Run Frontend App

```bash
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## :closed_lock_with_key: Environment Variables

Create a `.env` file in backend folder:

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FIREBASE_API_KEY=your_firebase_api_key
GEMINI_API_KEY=your_gemini_api_key
```
---



## :pushpin: Project Features

### :white_check_mark: User Features

* Chat with AI chatbot
* View chatbot responses instantly
* User-friendly chat interface

### :white_check_mark: Admin Features

* Admin login & authentication
* Manage admin accounts
* Upload PDF/Documents
* View uploaded document metadata
* Retrieve secure file download links
* Monitor chat logs

---

## :building_construction: System Architecture

```bash
User
 ↓
Frontend (React + TypeScript)
 ↓
Backend API (Node.js + Express)
 ↓
AI Services (Gemini)
 ↓
Database (Supabase / Firebase)
```

---

## :open_file_folder: Project Structure

```bash
ChatBot/
│
├── backend/
│   ├── src/
│   │   ├── Services/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── static/
│   │   ├── types/
│   │   ├── uploads/
│   │   ├── utils/
│   │   ├── index.ts
│   │   └── test.html
│   ├── package.json
│   ├── tsconfig.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── css/
│   │   ├── redux/
│   │   ├── screens/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## :gear: Backend API Documentation

### :male-technologist: Admin Management (`/api/admins`)

| Method | Endpoint    | Description          |
| ------ | ----------- | -------------------- |
| GET    | `/`         | Get all admins       |
| GET    | `/:id`      | Get admin by ID      |
| POST   | `/register` | Register a new admin |
| POST   | `/login`    | Admin authentication |
| PUT    | `/:id`      | Update admin details |
| DELETE | `/:id`      | Remove admin         |

---

### :page_facing_up: Documents (`/api/documents`)

| Method | Endpoint          | Description                       |
| ------ | ----------------- | --------------------------------- |
| POST   | `/upload`         | Upload PDF/Documents using Multer |
| GET    | `/all`            | List all document metadata        |
| GET    | `/file/:filePath` | Get secure download URL           |

---

### :robot_face: AI Chat (`/api/chat`)

| Method | Endpoint | Description               |
| ------ | -------- | ------------------------- |
| POST   | `/`      | Chat with Gemini AI model |

---

## :file_cabinet: Database Integration

This project integrates with:

### Supabase

Used for:

* Document storage
* Knowledge base document metadata

### Firebase

Used for:

* Authentication
* Chat logs storage
* Realtime database features

---

## :brain: AI Integration (Gemini Model)

The chatbot uses **Gemini AI** to generate responses based on:

* user input
* uploaded documents
* stored knowledge

---



---

## :test_tube: Testing

To test the chatbot:

1. Open the frontend
2. Type a message
3. Ensure chatbot responds correctly
4. Upload documents as admin and test AI response improvement

---

## :crystal_ball: Future Improvements

* Add voice assistant support
* Improve AI response accuracy using embeddings
* Add user authentication
* Add chatbot analytics dashboard
* Add multi-language support
