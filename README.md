# ⚡ MeetMind AI — Turn Meetings into Action, Instantly

> Microsoft Build AI Hackathon 2026 | Theme: AI at Work: Productivity & Teamwork Reimagined

## 🔗 Live Demo

**[https://meetmind-ai-cexa.onrender.com/](https://meetmind-ai-cexa.onrender.com/)**

## 📌 Problem Statement

Professionals waste hours every week manually writing meeting summaries, tracking action items, and drafting follow-up emails. Distributed teams lose context, miss deadlines, and spend cognitive energy on tasks that AI can handle instantly.

## 💡 Solution

MeetMind AI is an intelligent meeting assistant that transforms raw meeting transcripts into structured, actionable insights in seconds — powered by GitHub Models (GPT-4o) via the Microsoft AI ecosystem.

## ✨ Features

-   📝 **Smart Summary** — Concise 3-5 sentence meeting recap
-   ✅ **Action Items** — Auto-extracted tasks with owner names
-   📧 **Follow-up Email Draft** — Professional email ready to send
-   😊 **Sentiment Analysis** — Overall mood + per-speaker breakdown
-   📊 **Meeting Stats** — Speaker count, duration, meeting type
-   📅 **Calendar Event Generator** — Auto-generates `.ics` file to add follow-up directly to calendar

## 🛠️ Tech Stack

-   **Frontend:** React.js
-   **AI Model:** GPT-4o via GitHub Models (Microsoft AI Stack)
-   **Deployment:** Render
-   **Tools Used:** GitHub Copilot (assisted development)

## 🏗️ Architecture

User Transcript Input
↓
React Frontend
↓
GitHub Models API (GPT-4o)
↓
Structured JSON Response
↓
Summary | Actions | Email | Sentiment | Stats | Calendar

## 🚀 Setup Instructions

### Prerequisites

-   Node.js v16+
-   GitHub Personal Access Token

### Installation

```bash
git clone https://github.com/Poonam1216/meetmind-ai.git
cd meetmind-ai
npm install
```

### Environment Setup

Create a `.env` file in root:
REACT_APP_GITHUB_TOKEN=your_github_token_here

### Run Locally

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Evaluation Criteria Mapping

| Criteria                                | How MeetMind AI Addresses It                                      |
| --------------------------------------- | ----------------------------------------------------------------- |
| AI Integration & Intelligence (25%)     | GPT-4o via GitHub Models for 6 distinct AI outputs                |
| System Architecture & Engineering (25%) | Clean React architecture, structured JSON parsing, error handling |
| Communication & UX (15%)                | Dark theme UI, tabbed navigation, copy/download features          |
| Prototype Readiness (15%)               | Fully deployed, accessible live URL                               |
| Problem Depth (10%)                     | Solves real productivity pain point for distributed teams         |
| Market Understanding (10%)              | Targets 300M+ Microsoft Teams users globally                      |

## 👥 Team

| Name        | Role                                  |
| ----------- | ------------------------------------- |
| Poonam Rani | Full Stack Developer & AI Integration |

## 🤖 AI Tools Used

-   GitHub Copilot — assisted with code development
-   GPT-4o (GitHub Models) — core AI engine for transcript analysis

## 📄 License

MIT License — see LICENSE file
