# AfterFrame — Premium MERN Movie Discovery & Community Platform

> **Tagline:** *The film doesn't end at the credits.*

[![Live Website](https://img.shields.io/badge/Live%20Website-afterframe.onrender.com-00c7b7?style=for-the-badge&logo=render&logoColor=white)](https://afterframe.onrender.com)
[![Demo Video](https://img.shields.io/badge/Project%20Demo%20Video-Google%20Drive-E50914?style=for-the-badge&logo=googleplay&logoColor=white)](https://drive.google.com/file/d/1Oc43-OLu_oed7R4WrMEONFG02Z7jYxId/view?usp=drivesdk)

- 🌐 **Live Website:** [https://afterframe.onrender.com](https://afterframe.onrender.com)
- 🎬 **Project Demo Video:** [Watch Walkthrough on Google Drive](https://drive.google.com/file/d/1Oc43-OLu_oed7R4WrMEONFG02Z7jYxId/view?usp=drivesdk)

---

AfterFrame is a full-stack cinephile platform combining movie and TV discovery, trending people with persistent community upvotes, regional popularity charts (Top 10 & Top 100), detailed film pages with half-star ratings and subratings, a personal cinema diary and watchlist, deterministic explainable recommendations, and "Gather" movie outings.

---

## 1. Visual Composition & Architecture (Inspired by IMDb Reference)

AfterFrame reproduces the cinematic density and composition of the reference designs:

- **Section Headers:** Thin signature yellow/champagne vertical indicator (`| Trending people >`, `| What to watch`, `| Top 10 on AfterFrame this week >`, `| Popular interests >`, `| Explore what's streaming`).
- **Featured Hero:** Left showcase with high-res backdrop, title, year, aggregate rating, storyline overview, quick trailer and watchlist actions, accompanied by a right-hand **Up Next & Trending** vertical rail.
- **Trending People:** Circular celebrity portraits in a horizontal carousel featuring rank deltas (e.g. `1 (▲ 1,459)`, `2 (-)`, `3 (▲ 10)`), department info, and separate persistent **AfterFrame community upvote buttons** with live database counts.
- **What to Watch (Top 10 This Week):** Top-ranked cards (#1, #2, #3) with rank badges, poster bookmark, ratings, runtime, certificate, **Rate** button, **Mark as watched** action, and overview snippet, plus compact cards for #4–#10.
- **Popular Interests:** Wide category cards for Drama, Horror, Telugu, Hindi, Sci-Fi, and Action with quick discovery triggers.
- **Explore What's Streaming:** Regional provider tabs (*Prime Video*, *Apple TV*, *JioHotstar*, *SonyLIV*, *Netflix*, *Zee5*, *SunNXT*) displaying real titles with "Watch now" links and trailer modals.
- **Theme Support:** Dark mode (near-black `#0e0e10`, charcoal cards `#18181c`, warm champagne yellow `#f5c518`, rank blue `#5799ef`) and clean Light mode with persistent `<meta name="color-scheme">` state.
- **Data Attributions:** Full TMDB and JustWatch non-endorsement attributions prominently displayed in the footer and detail pages.

---

## 2. Directory Structure

```text
AfterFrame/
├── package.json               # Root scripts (dev:server, dev:client, build:client, test:server)
├── client/                    # React 18 + Vite frontend
│   ├── index.html             # HTML entrypoint with theme script & typography
│   ├── vite.config.js         # Vite config with API proxy to port 5002
│   ├── src/
│   │   ├── main.jsx           # App mounter
│   │   ├── App.jsx            # Router and context providers
│   │   ├── index.css          # Design system, CSS tokens, IMDb section markers
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Login, signup, guest mode, token management
│   │   │   ├── ThemeContext.jsx     # Dark/light mode persistence
│   │   │   ├── RegionContext.jsx    # Regional selector (defaults to India)
│   │   │   └── WatchlistContext.jsx # Watchlist & watched diary with guest sync
│   │   ├── components/
│   │   │   ├── Header.jsx           # Logo, search, region switcher, theme toggle
│   │   │   ├── Footer.jsx           # Branding & TMDB/JustWatch attributions
│   │   │   ├── HeroBanner.jsx       # Left cinematic panel + right trending rail
│   │   │   ├── TrendingPeopleCarousel.jsx # Circular portraits with upvote counts
│   │   │   ├── WhatToWatchSection.jsx     # #1-#3 large + #4-#10 compact ranked cards
│   │   │   ├── PopularInterestsSection.jsx# Wide backdrop category cards
│   │   │   ├── ExploreStreamingSection.jsx# Provider tabs & streaming availability
│   │   │   ├── PersonalizedRecommendations.jsx # Opening credits empty state
│   │   │   ├── HalfStarRating.jsx   # 0.5 - 5.0 rating & subratings drawer
│   │   │   ├── TrailerModal.jsx     # Responsive YouTube trailer player
│   │   │   └── AuthModal.jsx        # Sign In & Sign Up tabbed dialog
│   │   └── pages/
│   │       ├── HomePage.jsx         # Homepage assembling all cinematic sections
│   │       ├── ChartsPage.jsx       # Top 100 Rated & Trending This Week
│   │       ├── DetailPage.jsx       # Film/TV details, TMDB vs Community scores, Review Pulse
│   │       ├── PeoplePage.jsx       # Celebrity directory & community upvotes
│   │       ├── PersonDetailPage.jsx # Celebrity bio, birth details, filmography
│   │       ├── SearchPage.jsx       # Multi search with category filters
│   │       ├── MyCinemaPage.jsx     # Watchlist, Watched diary, Personal stats
│   │       └── GatherPage.jsx       # Watch parties & theatre outings with RSVPs
└── server/                    # Node.js + Express + Mongoose backend
    ├── package.json           # Dependencies and scripts
    ├── .env                   # Environment credentials file
    ├── .env.example           # Environment template
    ├── src/
    │   ├── server.js          # Express app, health checks, route registration
    │   ├── config/db.js       # MongoDB connection & status monitoring
    │   ├── middleware/auth.js # JWT verification & optional guest auth
    │   ├── models/            # Mongoose schemas (User, Watchlist, RatingReview, PersonVote, Event)
    │   ├── controllers/       # Business logic (auth, tmdb, community, watchlist, events)
    │   ├── routes/            # REST API endpoints
    │   └── services/          # TMDB client with caching & fallback catalogue
    └── test/
        └── api.test.js        # Automated API test suite using node:test
```

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+ recommended, tested on Node v24.21.0)
- npm (v9+)

### Installation
From the root workspace directory, install dependencies for both server and client:
```bash
npm run install:all
```

---

## 4. Environment Variables (`server/.env`)

Configure your credentials in `server/.env`:

```env
# Server Configuration
PORT=5002
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Atlas or local)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/afterframe?retryWrites=true&w=majority

# TMDB API Credentials (Get free from https://www.themoviedb.org/settings/api)
# Provide your v3 API Key OR your v4 Read Access Token (or both):
TMDB_API_KEY=your_tmdb_v3_api_key_here
TMDB_READ_ACCESS_TOKEN=your_tmdb_v4_read_access_token_here

# JWT Secret for session authentication
JWT_SECRET=afterframe_secure_jwt_secret_key_cinema_2026
```

> **Note on Offline / Pre-Configured State:**
> If `TMDB_API_KEY` is not yet populated, AfterFrame's backend automatically serves an offline curated cinematic catalogue mirroring the reference design (Clayface, Carrie, Drishyam, etc.). As soon as your TMDB key is added, the server seamlessly switches to live TMDB API endpoints with smart caching.

---

## 5. Running the Application

### Development Mode

Run the backend server:
```bash
npm run dev:server
# Server listens on http://localhost:5002
```

In another terminal, run the Vite frontend:
```bash
npm run dev:client
# Client runs on http://localhost:5173 (or 5174) with automated /api proxying
```

---

## 6. Testing & Build Verification

### Backend Automated Tests
Execute the automated test suite testing health diagnostics, catalogue queries, search, community upvoting, and route security:
```bash
npm run test:server
```
*Result: 8 passing tests in <500ms.*

### Frontend Production Build
Validate the client code and generate the production bundle:
```bash
npm run build:client
```
*Result: Clean bundle build in ~1.4s.*

---

## 7. Data & Legal Attributions

- **The Movie Database (TMDB):** This product uses the TMDB API but is not endorsed or certified by TMDB.
- **JustWatch:** Streaming availability data is powered by JustWatch.
- **AfterFrame:** All custom branding, layout logic, Gather event coordinating, and half-star community rating systems are original AfterFrame implementations.
