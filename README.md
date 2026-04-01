# SaaS Blueprint & Validator

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.1-blue?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6.2.0-purple?style=flat&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/AI-Gemini-orange?style=flat" alt="AI">
</p>

An AI-powered co-founder dashboard that validates business ideas, generates technical blueprints, roadmaps, and provides an intelligent consultant chat interface.

---

## Overview

**SaaS Blueprint & Validator** is an intelligent platform that helps entrepreneurs and developers validate their SaaS ideas through comprehensive market analysis, technical architecture design, and strategic planning. The application leverages Google Gemini AI to generate:

- Market viability scores and SWOT analysis
- Technical architecture diagrams (system, database, user flows)
- Project roadmaps with Kanban boards
- Tech stack recommendations
- Deep market and competitor analysis
- 30-day action plans
- Product Requirements Documents (PRD)
- Real-time AI consultant chat

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Vite)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │  Landing    │   │   App       │   │   Login     │   │  Components │     │
│  │   Page      │   │   (Main)    │   │   Page      │   │   (Tabs)    │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│         │                 │                 │                 │              │
│         └─────────────────┴────────┬────────┴─────────────────┘          │
│                                    │                                        │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐  │
│  │                         Contexts & Hooks                               │  │
│  │  • NotificationContext    • useNavigate    • useLocation             │  │
│  └─────────────────────────────────┬─────────────────────────────────────┘  │
│                                    │                                        │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐  │
│  │                            Services Layer                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  AI Service  │  │Project Service│  │Supabase Client│                │  │
│  │  │  (Gemini)    │  │  (CRUD)       │  │  (Auth/DB)   │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └─────────────────────────────────┬─────────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │        EXTERNAL         │
                        │      SERVICES           │
                        ├─────────────────────────┤
                        │  • Google Gemini AI    │
                        │  • Supabase Backend   │
                        │  • Groq (Optional)    │
                        └─────────────────────────┘
```

---

## Features

### 1. Idea Validation & Market Analysis
- **Viability Score**: AI-generated 0-100 score
- **SWOT Analysis**: Strengths, Weaknesses, Opportunities, Threats
- **Market Stats**: TAM, SAM, SOM calculations
- **Competitor Analysis**: Comparison table with pricing and gaps
- **Radar Chart**: Visual representation of 6 key metrics

### 2. Deep Market Insights
- **Trend Data**: 12-month simulated market trends
- **Keyword Analysis**: High-volume search terms
- **Audience Segments**: Target user personas with pain points
- **Feature Matrix**: Competitive comparison

### 3. Technical Blueprints
Three interactive diagrams powered by ReactFlow:
- **System Architecture**: Service-oriented architecture visualization
- **Database Schema**: ERD-style table relationships
- **User Flow**: Sequence diagrams for key workflows

### 4. Project Roadmap
- **Kanban Board**: Drag-and-drop task management
- **Task Categories**: Frontend, Backend, Design, Marketing
- **5 Columns**: Backlog → To Do → In Progress → Review → Done

### 5. Tech Stack Recommendations
- **8-12 Technologies**: Curated recommendations with rationale
- **Interactive Diagram**: Visual architecture representation
- **Documentation Links**: Direct links to official docs

### 6. 30-Day Action Plan
- **4 Phases**: Validation Week, MVP Building, Beta Launch, First Customers
- **Daily Tasks**: Specific actionable items with time estimates
- **Category Tags**: Research, Development, Marketing, Design, Testing, Launch

### 7. AI Consultant Chat
- **Context-Aware**: Uses project data for relevant responses
- **Real-time**: WebSocket-style updates via Supabase
- **Strategy Focus**: Business and technical guidance

### 8. Additional Features
- **Dark/Light Theme**: System preference support
- **PDF Export**: Download project reports
- **Project History**: Sidebar with saved projects
- **Prompt Enhancement**: AI-powered idea refinement
- **Multi-Model Support**: Gemini & Groq integration

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS, Lucide Icons |
| **State** | React Context, useState |
| **Routing** | React Router DOM v7 |
| **AI** | Google Gemini SDK |
| **Database** | Supabase (PostgreSQL) |
| **Charts** | Recharts |
| **Diagrams** | ReactFlow |
| **Animations** | Framer Motion |
| **PDF** | jsPDF |
| **Smooth Scroll** | Lenis |

---

## File Structure

```
final-saas-app/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx          # Supabase authentication
│   │   ├── landing/
│   │   │   └── LandingPage.tsx        # Marketing landing page
│   │   ├── menus/
│   │   │   └── UserMenu.tsx           # User dropdown menu
│   │   ├── modals/
│   │   │   ├── SettingsModal.tsx      # Theme & preferences
│   │   │   └── ComparisonModal.tsx    # Project comparison
│   │   ├── tabs/
│   │   │   ├── ValidationTab.tsx      # Market analysis display
│   │   │   ├── BlueprintTab.tsx       # Technical diagrams
│   │   │   ├── RoadmapTab.tsx         # Kanban board
│   │   │   ├── TechStackTab.tsx       # Technology recommendations
│   │   │   ├── PRDTab.tsx             # Product requirements
│   │   │   ├── DeepAnalysisTab.tsx   # Market insights
│   │   │   ├── ActionPlanTab.tsx     # 30-day plan
│   │   │   └── BuilderTab.tsx         # Code generation prompt
│   │   └── ui/
│   │       ├── DottedSurface.tsx      # Background pattern
│   │       ├── ShinyButton.tsx        # Animated button
│   │       ├── TextReveal.tsx         # Text animation
│   │       ├── PageTransition.tsx     # Route transitions
│   │       ├── GenerationVisuals.tsx  # Loading animations
│   │       ├── NotificationToast.tsx  # Toast notifications
│   │       ├── AnimatedCard.tsx       # Card animations
│   │       ├── WebGLShader.tsx        # 3D backgrounds
│   │       ├── ParticleBackground.tsx # Particle effects
│   │       ├── StarBackground.tsx     # Star field
│   │       ├── CelestialBloomShader.tsx # Space theme
│   │       ├── UnicornBackground.tsx  # Custom theme
│   │       └── DotMapBackground.tsx   # Grid pattern
│   ├── contexts/
│   │   └── NotificationContext.tsx     # Global notifications
│   ├── services/
│   │   ├── aiService.ts               # Gemini API integration
│   │   ├── projectService.ts          # Supabase CRUD operations
│   │   └── supabaseClient.ts          # Supabase configuration
│   ├── App.tsx                        # Main application component
│   ├── index.tsx                      # Entry point
│   ├── types.ts                       # TypeScript interfaces
│   ├── constants.ts                   # Kanban columns & config
│   └── db_schema.sql                  # Database schema
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## How It Works

### Generation Pipeline

```
User Input Idea
      │
      ▼
┌─────────────────┐
│  1. Validation │
│  (20% progress) │
└────────┬────────┘
         │ Viability Score, SWOT, Market Stats, Competitors
         ▼
┌─────────────────┐
│ 2. Deep Analysis│
│ (40% progress)  │
└────────┬────────┘
         │ Market Demand, Feature Matrix, Feasibility, Monetization
         ▼
┌─────────────────┐
│  3. Blueprint   │
│ (60% progress)  │
└────────┬────────┘
         │ System Architecture, DB Schema, User Flows
         ▼
┌─────────────────┐
│  4. Roadmap     │
│ (80% progress)  │
└────────┬────────┘
         │ Kanban Tasks
         ▼
┌─────────────────┐
│ 5. Tech + PRD   │
│(100% progress)  │
└────────┬────────┘
         │ Tech Stack, Product Requirements
         ▼
    Project Saved
         │
         ▼
   Chat Interface
```

### Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   User       │───▶│   AI Model   │───▶│   Parse &    │
│   Input      │    │   (Gemini)    │    │   Validate   │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   UI         │◀───│   Store in    │◀───│   Save to    │
│   Display    │    │   State       │    │   Supabase   │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Google AI API Key
- Supabase account (optional for local mode)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required for AI generation
VITE_API_KEY=your_google_gemini_api_key

# Optional - for cloud storage & authentication
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - alternative AI provider
VITE_GROQ_API_KEY=your_groq_api_key
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd final-saas-app

# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev
```

### Build for Production

```bash
pnpm build
# Output: dist/
```

---

## Database Schema (Supabase)

```sql
-- Users table (extends Supabase auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  role TEXT CHECK (role IN ('user', 'model')),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  settings JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Available Models

| Model | Provider | Status |
|-------|----------|--------|
| Gemini 2.5 Flash | Google | ✅ Active |
| Gemini 2.5 Pro | Google | ✅ Active |
| Groq Llama 3.3 70B | Groq | ✅ Active |
| Groq Llama 3.1 8B | Groq | ⏳ Coming Soon |

---

## Key Components

### ValidationTab
Displays market analysis with:
- Viability score gauge
- Radar chart (6 dimensions)
- Revenue projection chart
- SWOT analysis cards
- Competitor comparison table

### BlueprintTab
Interactive ReactFlow diagrams:
- Drag & drop node positioning
- Zoom & pan controls
- Node type switching
- Edge connections

### RoadmapTab
Kanban board with:
- @hello-pangea/dnd for drag-and-drop
- Column management
- Task filtering by tag

### ChatInterface
Real-time messaging:
- Supabase subscriptions
- Message history
- Typing indicators
- Context injection

---

## Performance Optimizations

- **Lazy Loading**: ParticleBackground, DotMapBackground
- **Code Splitting**: Route-based chunks
- **Memoization**: useMemo for expensive computations
- **Virtual Scrolling**: Large list handling
- **Debouncing**: Input handlers
- **Lenis Smooth Scroll**: Smooth scrolling experience

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues and feature requests, please open a GitHub issue.

<p align="center">Built with 💜 using React & Gemini AI</p>