# 🌌 SkyGPT — Production Multi-Agent AI Platform

SkyGPT is a production-grade, enterprise-ready multi-agent AI platform built with **TypeScript**, **Express**, **Better Auth**, **Redis**, and **LangGraph**. It replaces simple single-prompt chatbot architectures with an autonomous multi-agent system where specialized AI agents collaborate under a centralized supervisor.

---

## 🏗️ Architecture Overview

The backend is architected as high-performance microservices orchestrated via an API Gateway using npm workspaces:

```
                              [ Client Browser / Frontend ]
                                            │
                                            ▼
                     ┌─────────────────────────────────────────────┐
                     │          API Gateway (Port 4000)            │
                     │  - Reverse Proxy (express-http-proxy)       │
                     │  - Edge Auth & Token Verification           │
                     │  - Redis Session Cache (<1ms lookup)        │
                     │  - Header Enrichment (x-user-id, role)      │
                     └──────┬──────────────┬──────────────┬────────┘
                            │              │              │
             ┌──────────────┘              │              └──────────────┐
             ▼                             ▼                             ▼
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│  Auth Service (:4001)    │  │  Chat Service (:4002)    │  │  Agents Service (:4003)  │
│  - Better Auth Engine    │  │  - 3-Tier Architecture   │  │  - LangGraph StateGraph  │
│  - MongoDB Atlas Adapter │  │  - Conversation Threads  │  │  - Supervisor Router     │
│  - Google/GitHub/FB OAuth│  │  - Message Persistence   │  │  - 6 Specialized Agents  │
│  - RBAC (user, admin)    │  │  - Auto-Title Generation │  │  - Vector Embeddings     │
│  - Redis Secondary Store │  │  - Context Window Memory │  │  - Tavily Search Tool    │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
```

---

## 🤖 The 6 Specialized LangGraph Agents + Supervisor

SkyGPT implements a complete multi-agent system built on top of `@langchain/langgraph` and `@langchain/google-genai`:

| Agent | Technology / Model | Description |
| :--- | :--- | :--- |
| **`auto` (Supervisor)** | Gemini 3.1 Flash Lite (`temp: 0.1`) | **Autonomous Orchestrator**: Inspects user intent & conversation history, dynamically routing to the best agent. |
| **`chat`** | Gemini 3.1 Flash Lite (`temp: 0.7`) | **Conversational Specialist**: Handles broad Q&A, brainstorming, explanations, and general knowledge. |
| **`search`** | Gemini + Tavily API (`temp: 0.2`) | **Real-Time Research Agent**: Cyclic LangGraph loop with tool calling to search the live web and provide citations. |
| **`coding`** | Gemini 3.1 Flash Lite (`temp: 0.1`) | **Software Engineering Specialist**: Strict TypeScript/arrow-function coding, complexity analysis, and unit testing advice. |
| **`pdf`** | `text-embedding-004` + Vector Store | **Document & RAG Agent**: Indexes document chunks with cosine similarity to answer strictly grounded questions. |
| **`ppt`** | Gemini 3.1 Flash Lite (`temp: 0.3`) | **Presentation Designer**: Generates complete slide outlines with structured JSON metadata for rendering. |
| **`image`** | FLUX / SDXL Prompt Engineer | **Visual Creator**: Refines prompts and produces high-resolution image rendering links. |

---

## 🚀 Prerequisites

Before running the project, ensure you have:
- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- **Docker**: For running local Redis (or access to an external Redis instance)
- **MongoDB Atlas**: A free MongoDB Atlas cluster connection URI
- **Google Gemini API Key**: Free API key from Google AI Studio
- **Tavily API Key**: Free search API key from [tavily.com](https://tavily.com)

---

## ⚙️ Environment Variables Setup

Create a `.env` file inside each respective service folder:

### 1. Gateway: `backend/gateway/.env`
```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379

AUTH_SERVICE_URL=http://localhost:4001
CHAT_SERVICE_URL=http://localhost:4002
AGENTS_SERVICE_URL=http://localhost:4003
BILLING_SERVICE_URL=http://localhost:4004
```

### 2. Auth Service: `backend/services/auth/.env`
```env
PORT=4001
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/skygpt?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379

BETTER_AUTH_SECRET=your_super_secret_better_auth_key_minimum_32_characters_long
BETTER_AUTH_URL=http://localhost:4000/api/v1/auth

# Social OAuth (Optional for local testing)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

### 3. Chat Service: `backend/services/chat/.env`
```env
PORT=4002
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/skygpt?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
AGENTS_SERVICE_URL=http://localhost:4003
```

### 4. Agents Service: `backend/services/agents/.env`
```env
PORT=4003
NODE_ENV=development
GEMINI_API_KEY=AIzaSy...your_gemini_api_key
TAVILY_API_KEY=tvly-...your_tavily_api_key
```

---

## 📦 Installation & Starting Up

### 1. Start Docker Services (Redis)
In the project root:
```bash
docker compose up -d
```
*(Verify Redis is active with `docker ps` on port 6379).*

### 2. Install Root & Workspace Dependencies
```bash
cd backend
npm install
```

### 3. Seed the Admin Account
In `backend/services/auth`:
```bash
cd services/auth
npm run seed:admin
```
*Creates the default administrator:*
- **Email**: `admin@skygpt.com`
- **Password**: `AdminSecurePassword123!`
- **Role**: `admin`

### 4. Run the Microservices

You can run each service in a separate terminal:

**Terminal 1 — Gateway (Port 4000):**
```bash
cd backend/gateway
npm run dev
```

**Terminal 2 — Auth Service (Port 4001):**
```bash
cd backend/services/auth
npm run dev
```

**Terminal 3 — Chat Service (Port 4002):**
```bash
cd backend/services/chat
npm run dev
```

**Terminal 4 — Agents Service (Port 4003):**
```bash
cd backend/services/agents
npm run dev
```

---

## 🧪 Interactive Developer Sandbox & Tester

Once all services are running, open your browser and navigate to:

👉 **`http://localhost:4000/api/v1/auth/test`**

This self-contained control center allows you to test the complete architecture end-to-end:
1. **Admin & Social Login**: Sign in with `admin@skygpt.com` and inspect the `<1ms` Redis session token.
2. **Conversation Manager**: Create new conversation threads in MongoDB and list user conversation histories.
3. **RAG Vector Ingester**: Index sample documents or policies using Google `text-embedding-004`.
4. **LangGraph Agent Execution**:
   - Run in **`auto`** mode to let the Supervisor automatically classify your prompt.
   - Run specific agents (`search`, `coding`, `pdf`, `ppt`, `image`).
   - View formatted Markdown, code syntax highlighting, citations, and images rendered live via Marked.js.
5. **Full Chat Persistence**: Click **"Save via Chat Service"** to simulate the full production pipeline: User Prompt ➔ Chat Service ➔ MongoDB ➔ Agents Service ➔ Assistant Reply ➔ MongoDB.

---

## 🛡️ Microservice Security & Gateway Verification

All client requests must go through the API Gateway (`http://localhost:4000`):
- The Gateway checks session cookies in Redis cache `<1ms`.
- For authenticated requests, the Gateway enriches HTTP headers before forwarding:
  - `x-user-id`: Unique identifier of the authenticated user.
  - `x-user-role`: `user` or `admin`.
  - `x-user-email`: Email of the user.
- Downstream services (`services/chat`, `services/agents`) trust these headers for authorization and ownership verification.

---

## 📜 Key Scripts

From `backend/`:
- `npm run dev --workspace=gateway` — Start API Gateway
- `npm run dev --workspace=auth-service` — Start Auth Microservice
- `npm run dev --workspace=chat-service` — Start Chat Microservice
- `npm run dev --workspace=agents-service` — Start Agents Microservice
- `npx tsc --noEmit` — Type-check services
