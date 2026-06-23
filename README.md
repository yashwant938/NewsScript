# NewsScript AI 🎥📰

NewsScript AI is a full-stack, production-ready web application designed for content creators, YouTubers, Reels/Shorts creators, and digital journalists. It automatically aggregates trending news across multiple categories, ranks them using a custom trending score engine, and utilizes Large Language Models (LLMs) to write structured, high-engagement video transcripts and scripts.

---

## 📷 Screenshots

### 1. Dashboard Top View
![Dashboard Overview](/public/dashboard.png)

### 2. Category Trending News Feed
![News Feed](/public/news_feed.png)

### 3. Global AI Assistant Chatbot
![AI Chatbot Assistant](/public/chatbot.png)

---

## 🚀 Core Features

- **Automated News Aggregation:** Pulls stories from Google News RSS and other APIs in the background.
- **Custom Trending Score Engine:** Calculates real-time popularity scores using the formula:
  `Trending Score = (Recency * 30%) + (Source Credibility * 25%) + (Mentions * 25%) + (Social Signals * 20%)`
- **Jaccard Similarity Deduplication:** Removes duplicate/similar articles across different feeds.
- **AI Content Script Generator:** Generates video hooks, chronological timelines, expert analysis, 60s Reel scripts, 3-minute YouTube scripts, and SEO metadata suggestions.
- **Multi-Format Exports:** Copy script directly to clipboard, download as Plain Text, or export to multi-page PDF documents.
- **Live AI Assistant Chatbot:** Global floating chatbot referencing live database news context to help creators brainstorm ideas.
- **Admin Analytics Console:** Monitor external API statuses, latencies, and category logs.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, React Query, jsPDF (PDF export)
- **Database / ORM:** SQLite (development), Prisma ORM
- **Authentication:** NextAuth (Credentials provider)
- **AI Integration:** Google Gemini API (via `@google/generative-ai`) and OpenAI GPT-4o API

---

## 🏃 Local Setup & Running

Follow these steps to run the application locally on your machine:

### 1. Configure Keys
Create a `.env` file in the root folder with the following variables:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="e9a2631528b8df283efcf37de9f6c0bc62bbbc7da65bce8dc629dfbc62b7cfd5"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Add your API keys to query live AI models (Mock fallbacks run if left empty)
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"
```

### 2. Run Database Migrations & Seeds
Prepare the SQLite tables and insert default login accounts:
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Launch Server
Start the development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Default Accounts (Pre-Seeded)

| Account Type | Email | Password |
| :--- | :--- | :--- |
| **Standard Creator** | `user@newsscript.ai` | `userpassword` |
| **Admin Monitor** | `admin@newsscript.ai` | `adminpassword` |

*(You can also click the single-click **Quick Dev Login** buttons on the Sign In page to log in instantly).*

