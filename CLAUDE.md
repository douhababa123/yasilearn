# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IELTS Prep Master - A full-stack IELTS learning application with vocabulary management, speaking/writing practice with AI feedback, and spaced repetition learning.

## Commands

```bash
# Development (runs both client and server)
npm run dev

# Client only (Vite dev server on port 5173)
npm run client

# Server only (Express API on port 3001)
npm run server

# Build for production
npm run build

# Start production server
npm run start
```

## Architecture

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite
- Backend: Express.js (Node.js)
- Database: PostgreSQL (with in-memory fallback)
- AI: Alibaba DashScope API (Qwen model) via OpenAI-compatible interface
- Styling: Tailwind CSS + Recharts + Lucide React icons
- Routing: React Router v6 with HashRouter

**Key Files:**
- `server.js` - Express backend with PostgreSQL schema and API endpoints
- `services/ai.ts` - AI service wrapping DashScope/Qwen API
- `services/config.ts` - AI configuration (API key, model settings)
- `App.tsx` - Route definitions using HashRouter
- `components/Layout.tsx` - Main layout with sidebar navigation

**Database Schema (auto-created on startup):**
- `vocabulary` - Words with definitions, phonetics, examples
- `examples` - Example sentences linked to vocabulary
- `study_progress` - Spaced repetition tracking (status, intervals, review counts)

**Spaced Repetition System:**
The app implements SM-2 style intervals in `server.js:193-208`:
- Quality 1: Reset to 10 minutes
- Quality 2-3: Increase interval (1.1x - 1.6x)
- Quality 5: Double interval, increment review count

**AI Services (services/ai.ts):**
- `evaluateEssay()` - IELTS writing assessment with Band 9 feedback
- `parseVocabularyData()` - Extract structured vocab from raw text
- `getWordInsights()` - Word roots, memory hooks, similar words
- `evaluatePronunciation()` - Speaking pronunciation assessment

**Route Structure:**
- Layout routes (with sidebar): `/`, `/vocabulary`, `/error-bank`, `/community`, `/settings`
- Full-screen routes (no sidebar): `/speaking`, `/speaking/result`, `/writing`, `/writing/result`, `/listening`, `/mock-tests/4/result`

## Configuration

Required environment variables in `.env.local`:
- `DASHSCOPE_API_KEY` - Alibaba DashScope API key
- `DATABASE_URL` - PostgreSQL connection string (optional, defaults to local postgres)
- `DASHSCOPE_MODEL` - AI model name (optional, defaults to `qwen3-max`)

The app falls back to in-memory storage if PostgreSQL connection fails.

## Deployment

See `DEPLOY_ALIYUN.md` for Aliyun ECS deployment instructions. The server binds to `0.0.0.0:3001` for external access.
