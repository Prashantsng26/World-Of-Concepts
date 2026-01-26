# 🌌 World of Concepts (WOC)

World of Concepts (WOC) is a premium, AI-powered educational platform designed to map the infinite atlas of human intelligence. It transforms complex queries into interactive, hierarchical mind maps, providing a structured and immersive learning experience using state-of-the-art Large Language Models.

![WOC Landing](public/assets/landing-visual.png)

## ✨ Features

- **🧠 Intelligent Concept Mapping**: Automatically generates structured outlines and deep-dive content for any topic.
- **🛸 Triple-Layer Depth**:
  - **Zap (Short)**: Quick summaries for rapid understanding.
  - **Book (Brief)**: Balanced overview with key points and examples.
  - **Detail (Graduation)**: Research-grade deep dives with comprehensive data.
- **🚀 Cinematic Experience**: Immersive UI with high-end animations, sound effects (rocket launches), and space-themed aesthetics.
- **🎯 Interactive Learning**:
  - **Sequential Delta**: Interactive flowcharts for process-based topics.
  - **Validation Pulse**: AI-generated quizzes to test your understanding.
  - **Visual Recon**: AI-generated image prompts for visual storytelling.
- **🛡️ Hybrid AI Engine**: Seamlessly switches between **Groq (Cloud)** and **Ollama (Local)** to ensure 100% uptime regardless of rate limits.
- **📑 Personal Atlas**: Bookmark concepts and revisit your learning history in a personalized dashboard.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & Framer Motion
- **Database**: Prisma ORM with PostgreSQL/SQLite
- **AI Integration**:
  - **Groq SDK** (Llama-3.3-70B, Mixtral)
  - **Ollama** (Local Llama-3 support)
  - **OpenAI** (Optional Fallback)
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query (React Query)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Prashantsng26/World-Of-Concepts.git
cd World-Of-Concepts
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key variables to configure:
- `DATABASE_URL`: Your database connection string.
- `GROQ_API_KEY`: Required for primary AI functionality.
- `NEXTAUTH_SECRET`: Secret for session encryption.
- `OLLAMA_BASE_URL`: (Optional) If running Ollama locally.

### 4. Database Initialization

```bash
npx prisma generate
npx prisma db push
```

### 5. Launch the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start exploring.

## 📡 AI Provider Logic

WOC implements a **Graceful Degradation Protocol**:
1. **Primary**: Attempts to use **Groq** for lightning-fast inference.
2. **Dynamic Switching**: If rate limits are hit, it cycles through multiple models (Llama-3.3, Mixtral, etc.).
3. **Local Fallback**: If the cloud is unreachable, it attempts to sync with a local **Ollama** instance.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ for the Curious Minds.
</p>
