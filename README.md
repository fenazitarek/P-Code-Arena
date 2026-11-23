# Loopcraft

Loopcraft is an original, local-first C programming learning app. It combines short lessons, editable C workspaces, auto-graded practice, harder challenges, solo timed sessions, XP tracking, and a clearly labeled demo leaderboard.

The project uses original wording, lessons, problems, code samples, visual assets, and implementation. It does not include the reference site's source code, branding, images, or proprietary content.

## Stack

- React + Vite
- TypeScript
- Tailwind CSS
- React Router
- Express for the local C execution API
- Browser `localStorage` for profiles, drafts, and progress
- GCC for real C11 compilation and execution
- npm as the package manager

No cloud account, database, API key, or paid service is required.

## Requirements

- Node.js 20.19+ or 22.12+ (Node.js 24 was used for verification)
- npm 10+
- GCC available on your PATH as `gcc`

The UI can run without GCC, but code compilation and grading require a working compiler. The app returns a clear setup message when GCC is unavailable.

### Install GCC

**Windows**

Install a MinGW-w64 toolchain that includes GCC, then add its `bin` directory to PATH. Open a new terminal and verify:

```powershell
gcc --version
```

If GCC is installed somewhere else, set `CC_PATH` in `.env` to the full executable path instead of changing PATH.

**macOS**

```bash
xcode-select --install
gcc --version
```

**Debian / Ubuntu**

```bash
sudo apt update
sudo apt install build-essential
gcc --version
```

## Install and run

From the project directory:

```bash
npm install
npm run dev
```

Vite prints the local address, normally:

```text
http://127.0.0.1:5173
```

The development command starts both Vite and the Express compiler API. Keep the terminal open while using the workspace.

## Environment variables

All values have safe local defaults. For optional overrides:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Production API and built-site port. Vite's development proxy expects the API on port 3001. |
| `HOST` | `127.0.0.1` | Server bind address. Keep loopback for local use. |
| `CC_PATH` | `gcc` | GCC executable name or full path. This must be an executable path, not a shell command. |
| `MAX_RUN_TIMEOUT_MS` | `2000` | Per-program runtime limit in milliseconds. The server clamps this to a safe range. |
| `MAX_OUTPUT_BYTES` | `65536` | Maximum captured program output. |
| `VITE_API_URL` | `/api` | Frontend API base. The default works with Vite's proxy and the production server. |

No real secrets belong in this project. Do not put passwords, tokens, or private credentials in `.env`, source code, program input, or code drafts.

## Production-style local run

```bash
npm run build
npm start
```

Then open:

```text
http://127.0.0.1:3001
```

Express serves the built frontend and `/api` from the same origin. A production deployment would need a process manager, HTTPS, a hardened execution boundary, and a deliberate hosting configuration; those are outside this local project.

## Pages and features

| Route | Purpose |
| --- | --- |
| `/` | Original landing page, learning path, and featured practice. |
| `/learn` | Ten-lesson C curriculum grouped into modules. |
| `/learn/:lessonId` | Lesson explanation, objectives, editable workspace, expected output, completion tracking, and previous/next navigation. |
| `/practice` | Searchable, difficulty-filtered, topic-filtered practice library. |
| `/practice/:problemId` | Problem statement, examples, hints, constraints, local compilation, test grading, and one-time XP. |
| `/challenges` | Longer challenge library with the same filtering tools. |
| `/challenges/:problemId` | Challenge workspace and grading. |
| `/arena` | Solo timed practice with selectable challenges and 5-, 10-, or 15-minute sessions. |
| `/rankings` | Local demo leaderboard using fictional sample learners plus the browser profile. |
| `/guide` | Plain-language explanation of XP, levels, local storage, rankings, and runner limits. |
| `/dashboard` | Saved progress, current level, recent activity, completion breakdown, recommendations, and arena best times. |
| `*` | Original 404 page. |

Additional behavior:

- Responsive desktop, tablet, and mobile navigation
- Accessible labels, landmarks, focus states, skip link, dialogs, and status messages
- Per-page titles, descriptions, canonical URLs, and Open Graph metadata
- Browser-saved display name and one-click progress reset
- Browser-saved code drafts per lesson, problem, and arena session
- Real GCC C11 compilation with compiler diagnostics
- Multi-test grading with normalized trailing whitespace and line endings
- One-time XP awards for completed activities
- Original SVG favicon and social card; no remote fonts, images, or trackers

## Local API

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Reports whether the configured compiler is available. |
| `/api/run` | POST | Compiles and runs `{ code, stdin }`. |
| `/api/check` | POST | Compiles once and grades `{ code, tests }`. |
| `/api` unknown routes | GET/POST | JSON 404 response. |

The server uses direct process spawning rather than shell commands, unique temporary directories, request and source-size limits, execution timeouts, output caps, in-memory throttling, and cleanup after every run.

This is a local educational runner, not a hardened multi-user sandbox. It intentionally binds to `127.0.0.1`. Do not expose it publicly or use it to execute untrusted code from multiple users.

## Verification

```bash
npm run build
```

With the development server running in another terminal:

```bash
npm run check:api
```

The smoke test checks health, a real run with standard input, and a small auto-graded solution. If GCC is missing, the health check reports that prerequisite instead of hiding the failure.

## Local data and reset

Progress is stored under the `loopcraft-progress-v1` localStorage key. Drafts use `loopcraft-drafts-v1`. Data belongs to the current browser profile and does not sync across browsers or devices.

Open the avatar in the header to edit the display name or reset all saved learning progress. Clearing browser site data has the same effect. Resetting progress does not delete saved code drafts.

## Project structure

```text
src/
  components/   Reusable navigation, cards, dialogs, metadata, and workspace UI
  context/      Browser-persisted learning progress
  data/         Original curriculum, problems, tests, types, and sample leaderboard
  lib/          Progress and draft storage helpers
  pages/        Route-level pages
server/
  index.mjs     Express API, GCC runner, limits, and production static serving
scripts/
  dev.mjs       Starts Vite and the API together
  check-api.mjs Dependency-free API smoke test
public/
  favicon.svg   Original app icon
  og-card.svg   Original social sharing card
```

## Deliberate limitations

- C is the only implemented language track.
- The timed arena is solo practice, not live multiplayer.
- Rankings are a local demonstration, not real student or global data.
- There is no authentication, cloud sync, or shared database.
- GCC must be installed separately.
- Program execution is suitable for local learning, not public multi-tenant use.
