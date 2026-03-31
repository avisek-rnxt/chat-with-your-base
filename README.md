# Bamboo Base

Chat with your PostgreSQL database using natural language. Ask questions, get SQL queries auto-executed, and visualize results with charts — all powered by AI.

## Features

- **Natural language to SQL** — Ask questions in plain English, get results instantly
- **Auto-executed queries** — SQL runs automatically, no manual step needed
- **Chart visualization** — Generate bar, line, area, pie, and scatter charts from query results
- **Multi-model support** — Use any AI model via OpenRouter (300+ models, including free ones)
- **Chat history** — Conversations are saved and organized by date
- **Dark/Light/System theme** — Adapts to your system preference
- **Email + password auth** — Signup with first name, last name, email, and password via Supabase

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI**: [OpenRouter](https://openrouter.ai/) via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Font**: [DM Sans](https://fonts.google.com/specimen/DM+Sans) (Google Fonts)
- **Charts**: [Recharts](https://recharts.org/) via shadcn/ui chart components

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- An [OpenRouter](https://openrouter.ai/) API key
- A PostgreSQL database connection string (the database you want to chat with)

### 1. Clone the repository

```bash
git clone https://github.com/avisek-rnxt/chat-with-your-base.git
cd chat-with-your-base
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# PostgreSQL database to chat with
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OpenRouter
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=qwen/qwen3.6-plus-preview:free
OPENROUTER_MODEL_SMALL=qwen/qwen3.6-plus-preview:free
```

### 4. Configure Supabase

In your Supabase dashboard:

1. Go to **Authentication > Providers > Email**
2. Enable **Email Signup**
3. Optionally disable **Confirm email** for easier testing

Create the `chats` table:

```sql
create table public.chats (
  id uuid primary key,
  user_id uuid references auth.users(id) not null,
  name text,
  messages jsonb,
  created_at timestamp with time zone default now()
);

alter table public.chats enable row level security;

create policy "Users can view their own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chats"
  on public.chats for update
  using (auth.uid() = user_id);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Switching AI Models

Change the model by updating your `.env` file. Any OpenRouter-supported model works:

```bash
# Free models
OPENROUTER_MODEL=qwen/qwen3.6-plus-preview:free
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free

# Paid models
OPENROUTER_MODEL=openai/gpt-4o
OPENROUTER_MODEL=anthropic/claude-sonnet-4
OPENROUTER_MODEL=google/gemini-2.5-pro
```

`OPENROUTER_MODEL` is used for the main chat. `OPENROUTER_MODEL_SMALL` is used for generating chat names and chart configs.

## Project Structure

```
app/
  (auth-pages)/       # Login and signup pages
  api/chat/           # Chat API route with streaming + tools
  app/                # Main chat interface (protected)
components/
  chat.tsx            # Main chat component
  code-block.tsx      # SQL auto-execution + chart visualization
  greeting.tsx        # Time-based greeting (Good morning/evening...)
  profile-menu.tsx    # User profile dropdown
  navbar.tsx          # Top navigation bar
  form.tsx            # Chat input form
  app-sidebar.tsx     # Sidebar with chat history
actions/
  chart.ts            # AI-powered chart config generation
  run-sql.ts          # Server action for executing SQL queries
```

---

## Documentation

### What was built

This project is a fork of [NicolasMontone/chat-with-your-base](https://github.com/NicolasMontone/chat-with-your-base), significantly modified with the following changes:

#### OpenRouter Integration
- Replaced OpenAI API with OpenRouter, enabling support for 300+ AI models
- Model selection via environment variables (`OPENROUTER_MODEL`, `OPENROUTER_MODEL_SMALL`)
- Removed the `openai` npm package; using `@ai-sdk/openai` with OpenRouter's base URL
- Chart generation uses `generateText` with manual JSON parsing instead of `generateObject` (for compatibility with models that don't support `tool_choice`)

#### Environment-Based Configuration
- Moved database connection string (`DATABASE_URL`) and API keys to `.env`
- Removed the connection form UI — all config is server-side
- Removed `validate-openai-key.ts` and the `openai` package dependency
- Removed local storage hooks (`use-app-local-storage.ts`) that stored credentials client-side

#### Authentication Overhaul
- Replaced Supabase magic link (OTP) login with email + password authentication
- Added signup page with first name, last name, email, and password fields
- User profile data stored in Supabase `auth.users.raw_user_meta_data`
- Added password show/hide toggle component
- Added "Remember me" checkbox that persists email in an httpOnly cookie (30 days)

#### UI Revamp
- **Color system**: Deep obsidian dark theme with `#F17C1D` (warm orange) accent color
- **Font**: Switched from Geist Sans to DM Sans (Google Fonts)
- **Navbar**: Frosted glass header, profile dropdown replacing logout button
- **Chat**: Narrower max-width, refined message styling, time-based greeting on empty state
- **Input**: Card-style input with gradient focus glow and submit button
- **SQL results**: Queries auto-execute (no "Run SQL" button), SQL code hidden from users, results shown in bordered cards with row count
- **Code blocks**: Hover-reveal copy button, inline code as colored pills
- **Sidebar**: Clean branding ("Bamboo Base"), active chat highlight, message icons, uppercase section labels
- **Login/Signup**: Centered card layout with gradient border, consistent styling
- **Loading states**: Shimmer gradient animations, "Thinking..." with bouncing dots shown immediately after sending
- **Borders**: Increased contrast for visibility in both light and dark modes
- **Theme**: Defaults to system preference with manual toggle

#### Cleanup
- Removed landing page (hero, how-it-works, open-source sections) — root redirects to `/app`
- Removed Crisp chat widget
- Removed feedback button and associated email logic
- Removed dead components: `connection-form.tsx`, `hero.tsx`, `how-it-works.tsx`, `open-source-section.tsx`, `next-logo.tsx`, `use-app-local-storage.ts`, `validate-openai-key.ts`
- Removed favicon
- Fixed "audio name" typo in chat name toast
- Renamed app from "Chat With Your Database" to "Bamboo Base"
