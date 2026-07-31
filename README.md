# EduConnect

## What Is EduConnect?

EduConnect is a small online learning platform — a place where one person can publish a course about something they know, and another person can find it, sign up for it, and say afterwards whether it was any good. There is no application process and no separation between the two sides: the same account that browses the catalog on Tuesday can publish a course on Wednesday. Courses have a title, a description, a price (which may be nothing at all), a category, and a list of modules. Learners enrol, work through them at whatever pace their week allows, and leave a star rating and a few sentences that help the next person decide. That is the whole idea, and everything in this repository exists to serve it.

## Who This Is For

This project is likely to be read by three different kinds of people, so it is worth saying up front which parts matter to whom.

**If you are here to run it and look at it**, you only need the Getting Started section below. You will need Node.js and MongoDB installed; everything else is two `npm install`s and a seed script that fills the database with instructors, students, courses and reviews so there is something to look at from the first page load.

**If you are here to work on the code**, the Project Structure and API Overview sections are where the reasoning lives. The backend is organised around three domains rather than around technical layers, and that decision shapes almost every file — it is worth understanding before you add anything.

**If you are here to evaluate the design**, the Design System Notes and Design Philosophy sections document the choices and where the tokens that enforce them live.

## Getting Started

You will need **Node.js 18 or newer** and a **MongoDB** instance. A local install is fine; so is a free MongoDB Atlas cluster, in which case you will paste its connection string into the environment file below.

### 1. The API

```bash
cd backend
npm install
cp .env.example .env      # then open it and adjust anything you need
npm run seed              # fills the database with demo content
npm run dev               # starts on http://localhost:4100
```

The `.env` file is short and every line is commented. The two you might actually change are `MONGODB_CONNECTION_URI` (if your database is not local) and `JSON_WEB_TOKEN_SECRET` (which you must change if this ever leaves your machine).

A note on two defaults that look unusual: the API listens on **port 4100** rather than the more common 4000, and the database is called **`educonnect_platform`** rather than `educonnect`. Both are deliberate — 4000 is very often already taken on a development machine, and a distinctive database name means the seed script (which clears its collections before it runs) cannot wipe something unrelated that happened to pick a shorter name.

### 2. The web app

In a second terminal:

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

Open the address it prints. The Vite dev server proxies everything under `/api` to the Express server, so the browser only ever talks to one origin and there is no CORS to think about while developing.

### 3. Signing in

The seed script creates five accounts, all with the password **`educonnect123`**:

| Email | Who they are |
| --- | --- |
| `amara@educonnect.dev` | Instructor — backend and data courses |
| `theo@educonnect.dev` | Instructor — design courses |
| `priya@educonnect.dev` | Instructor — marketing and business courses |
| `sam@educonnect.dev` | Student, enrolled in several courses |
| `nadia@educonnect.dev` | Student, has written a few reviews |

Signing in as an instructor is the quickest way to see the whole application: you get a populated catalog, a dashboard with both a Learning and a Teaching tab, and courses you are allowed to edit.

### Other commands

| Command | Where | What it does |
| --- | --- | --- |
| `npm run typecheck` | either | Type-checks without emitting anything |
| `npm run build` | `backend` | Compiles TypeScript to `dist/` |
| `npm run build` | `frontend` | Type-checks, then produces a production bundle |
| `npm run seed` | `backend` | Resets the database to the demo content |

## Project Structure

The repository has two halves — `backend/` and `frontend/` — and they are organised the same way on purpose, so that a change which touches both is a change in two places with the same name rather than two places you have to go looking for.

### The backend, in prose

Most Express applications are filed by technical role: all the controllers together, all the models together, all the routes together. This one is filed by **subject matter** instead. There are three domains under `backend/src/domains/`, and each owns a coherent piece of the product.

**`identity`** owns the answer to "who is this person". It holds user accounts, hashes passwords, issues JSON Web Tokens, and manages the profile someone presents to everyone else. Nothing outside this folder knows how a password is stored.

**`catalog`** owns the courses — what is on offer, what it costs, who wrote it, and the rules about who is allowed to change it. The ownership check that stops one instructor editing another's course lives in this domain's service, not in a controller, so it cannot be forgotten at a new call site.

**`learning`** owns the *relationship* between a learner and a course: enrolments, progress, and reviews. This is the domain that most clearly is not about a single "thing" — an enrolment is a fact about two things at once — and separating it is what keeps the other two domains simple.

Inside each domain the files are named `<domain>.<role>.ts`, so `catalog.router.ts`, `catalog.controller.ts`, `catalog.service.ts`, `catalog.repository.ts`, `catalog.model.ts`. The roles run in a straight line and each may only call the next one down:

- The **router** declares URLs and attaches middleware. It contains no logic.
- The **controller** reads an already-validated request, calls exactly one service method, and maps the result onto a status code. If a controller starts making decisions, that decision belongs in the service.
- The **service** is the business logic and the only thing a controller is allowed to call. Enrolment rules, ownership checks, rating recalculation — all here.
- The **repository** is the only module in the entire application permitted to touch a Mongoose model. Everything above it is database-agnostic.
- The **model** is the Mongoose schema.

The interesting rule is the one *between* domains. A domain may never import another domain's service, repository or model. It may only import that domain's **interface** — a small file (`catalog.interface.ts`, `identity.interface.ts`) that publishes a deliberately narrow contract.

This is easiest to see in the rating logic. Reviews belong to `learning`; the average rating displayed on a course card belongs to `catalog`. When someone posts a review, the learning service recalculates the average from its own data and then hands the result over by calling `catalogDomainInterface.replaceCourseRatingSnapshot(...)`. It does not reach into the course document and write the number itself. The catalog interface exposes exactly four capabilities and nothing else; if learning ever needs a fifth, adding it is a considered edit to one small file rather than an import that quietly couples the two.

Shared machinery that belongs to no domain lives in `backend/src/shared/`: environment configuration, the database connection, the error hierarchy, the JWT guard, and the request validation middleware. The last two are worth a sentence each. **Validation** parses each request section with a Zod schema and writes the parsed result back over the raw input, so controllers downstream receive trimmed, coerced, correctly typed data with unknown keys stripped — that is the payload sanitation step. **Error handling** is centralised: services throw typed errors (`PermissionDeniedError`, `ResourceNotFoundError`, and so on) and exactly one middleware knows how to turn each into an HTTP status code. No controller in this codebase writes a status code for a failure.

`backend/src/app.ts` is the composition root — the one file that knows all three domains exist and decides where each is mounted. The domains themselves know nothing about each other's URLs.

The whole backend is TypeScript in **strict mode**, with `noUncheckedIndexedAccess` on. That last flag is stricter than most projects bother with: it means indexing an array gives you `T | undefined` and you have to say what happens when it is missing. It is mildly annoying to write and it removes a whole category of runtime error.

### The frontend, in prose

`frontend/src/domains/` mirrors the backend exactly — `identity`, `catalog`, `learning` — and each contains `api/` (thin functions that call endpoints), `hooks/` (React Query hooks and, for identity, the session context), `components/` (pieces used within that domain), and `pages/` (whole screens).

State is split along a single clear line. **Anything the server owns** — courses, enrolments, reviews — lives in React Query, which handles caching, loading and error states, and refetching. **The session alone** lives in a React Context, because it is the one piece of state the whole tree needs and no single query owns it. There is exactly one Context in the application, and this is it.

### Two fetching patterns, and when each is used

Most screens use React Query, because they genuinely benefit from it: the catalog has debounced filters and pagination, and enrolling or reviewing has to invalidate the course card's enrolment count and star rating from a different screen.

Two places instead use plain `useEffect` + `useState`, through the shared hook `shared/hooks/useFetchOnMount.ts`:

- **The session restore** in `AuthenticationContext.tsx`, which asks the API who a stored token belongs to when the app first mounts.
- **The My Courses page** (`/my-courses`), which loads a personal list once when it opens and that nothing else needs to invalidate.

`useFetchOnMount` is a proper implementation of the pattern rather than a token one. It keeps `data`, `isLoading` and `errorMessage` as real state; it aborts the in-flight request in the effect's cleanup function, so a slow response cannot set state on an unmounted component (React 18's StrictMode double-mounts every component in development precisely to catch a missing cleanup); and it holds the fetcher in a ref so that passing an inline arrow function — a new value on every render — does not restart the effect forever.

Every request goes through `frontend/src/shared/api/apiClient.ts`. That module is the only place that knows the API base URL, and it is where the JWT is attached to outgoing requests — the "global interceptor" in one function rather than scattered across call sites. It also unwraps the `{ success, data }` envelope, converts error responses into a typed `ApiRequestError` carrying per-field messages, and — when the server rejects a token mid-session — clears the dead token and notifies the auth context so the UI drops to the signed-out state immediately.

Route guards live in `frontend/src/app/ProtectedRoute.tsx`, and there are two subtleties worth knowing about.

First, on a hard refresh the session is restored asynchronously, so for a moment the app is neither signed in nor signed out. Redirecting during that moment would bounce a perfectly valid user to the login page, so the guard waits for the restore to settle first.

Second, when it does redirect it carries the intended destination in router state — and *both* guards read it. The moment a sign-in succeeds, `isAuthenticated` flips and `GuestOnlyRoute` re-renders, racing the sign-in page's own `navigate(redirectTo)`. While `GuestOnlyRoute` sent everyone to the dashboard unconditionally, it won that race and silently discarded the destination. Having both read the same `readRedirectDestination()` helper means they agree, so it no longer matters which runs first. That helper also rejects anything that is not a same-site path, so router state cannot be used to bounce someone off the platform after signing in.

`frontend/src/shared/components/` holds the pieces every domain uses: the button, the form primitives, the star rating, the category and price pills, and `AsyncStates.tsx`, which contains the loading, empty and error components described below.

## API Overview

Everything is under `/api`. Responses are always either `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "details" } }`, so the client never has to guess at a shape.

### Identity

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | Creates an account, returns a token and the user |
| `POST` | `/api/auth/login` | — | Returns a token and the user |
| `GET` | `/api/auth/me` | Required | The signed-in user's own account |
| `PUT` | `/api/profile` | Required | Updates name, bio, profile picture |
| `PUT` | `/api/profile/password` | Required | Changes password, verifying the current one first |

### Catalog

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| `GET` | `/api/courses` | — | Public catalog; supports `searchTerm`, `category`, `difficultyLevel`, `minimumPrice`, `maximumPrice`, `sortBy`, `page`, `pageSize` |
| `GET` | `/api/courses/:courseId` | — | One course |
| `GET` | `/api/courses/mine` | Required | Courses the signed-in user created — backs the My Courses page |
| `POST` | `/api/courses` | Required | Publishes a course |
| `PUT` | `/api/courses/:courseId` | Owner | Updates a course |
| `DELETE` | `/api/courses/:courseId` | Owner | Removes a course |

### Learning

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| `POST` | `/api/courses/:courseId/enrollment` | Required | Enrols the signed-in user |
| `DELETE` | `/api/courses/:courseId/enrollment` | Required | Withdraws, and retracts their review |
| `PUT` | `/api/courses/:courseId/enrollment/progress` | Required | Updates percentage complete |
| `GET` | `/api/courses/:courseId/my-relationship` | Required | Enrolled? Own review? Can review? — in one call |
| `GET` | `/api/courses/:courseId/reviews` | — | All reviews plus the live average |
| `POST` | `/api/courses/:courseId/reviews` | Enrolled | Writes or edits the user's review |
| `DELETE` | `/api/courses/:courseId/reviews/mine` | Required | Deletes the user's own review |
| `GET` | `/api/enrollments` | Required | Everything the user is enrolled in |

### Status codes

`200` for a successful read or update, `201` for something created, `400` when the input does not validate, `401` when there is no valid token, `403` when there is a valid token belonging to someone who is not allowed, `404` when the resource does not exist, and `409` for a conflict — enrolling twice, or registering an email that is already taken.

The distinction between `401` and `403` is enforced rather than approximate: editing someone else's course with a perfectly good token returns `403`, not `404` or `401`.

## Design System Notes

Every colour, space, radius, shadow and font size in the application comes from one file: `frontend/src/theme/educonnect.theme.ts`. It is provided through styled-components' `ThemeProvider` and typed through `styled.d.ts`, so `theme.colors.primary` autocompletes in the editor and a typo fails the build. Nothing in the codebase hard-codes a hex value.

**Colour.** The page is cream (`#FBF7F0`), not white — the single change that does the most to make the platform feel unclinical. Terracotta (`#C25A3C`) is the primary voice and is reserved for the one main action on any screen. Muted teal (`#3E7C76`) is the secondary, used for supporting actions and progress. Mustard (`#D9A441`) is the accent and appears in only two places: star ratings and price badges. Text is a warm charcoal rather than black. Each course category also has its own quiet background/foreground pair under `theme.categoryColors`, which is what lets the catalog be read at a glance.

**Spacing** is a 4px scale from `xxs` (4px) to `xxxl` (72px). **Radii** run from 8px to a full pill, with cards at 16px — generous rounding is the second-biggest contributor to the friendly feel after the cream background.

**Shadows** are warm-tinted rather than grey (`rgba(70, 52, 38, …)`), which matters more than it sounds: a neutral grey shadow over a cream background reads as dirt. There are two that do most of the work — `raised` is a card at rest and `lifted` is where it travels on hover, and that pair is the hover-lift animation.

**Type** pairs Fraunces (a warm serif) for headings with Nunito (a rounded sans) for body text. The base size is **17px** rather than the usual 16, with a 1.65 line height — a small nudge that makes long course descriptions noticeably easier to read.

**Async states** get first-class treatment in `shared/components/AsyncStates.tsx`. Loading a course grid shows skeleton cards in the shape of the cards that are about to arrive, so the layout does not jump. Smaller loads show three bouncing warm dots rather than a spinner. Empty and error states each get a hand-drawn SVG illustration — an open book with a sprout for an empty shelf, a magnifying glass over a blank card for no search results, a tipped-over mug for an error — drawn from theme colours so they always match, and paired with a sentence of plain English and, where it makes sense, one obvious thing to do next.

## Design Philosophy

Most learning platforms look like software for buying things: dense grids, urgency badges, five competing calls to action. That framing is wrong for the moment it actually serves, which is usually someone at the end of a long day deciding whether to spend an evening learning something. The warm palette, the generous rounding, the larger type and the deliberately unhurried copy are all aimed at making that moment feel welcoming rather than transactional. The clearest expression of it is the empty states: where most applications shrug at you, this one draws you a small picture and suggests something encouraging to do next.

## Contributing

The conventions here are strict on purpose, and following them keeps the codebase readable as it grows.

**Names are fully spelled out.** `enrollStudentInCourse`, not `enroll`. `priceInUnitedStatesDollars`, not `price`. `readBearerTokenFromRequest`, not `getToken`. Multi-word descriptive names are the house style throughout, on both sides of the stack.

**Backend files are named `<domain>.<role>.ts`** and live in the domain they belong to. A new backend feature should be a new method on an existing domain service, or — if it genuinely does not fit any of the three — a conversation about whether it needs a fourth domain.

**Never cross a domain boundary except through an interface.** If you find yourself importing `catalog.model` from inside `learning`, stop: either the capability belongs on `catalogDomainInterface`, or the logic belongs in the catalog domain. This is the one rule that, if it erodes, takes the whole structure with it.

**Business rules go in services.** Controllers read a request, call one service method, and pick a status code. If a controller contains an `if` about the domain, it is in the wrong file.

**Server state goes in React Query, and only the session goes in Context.** Adding a second Context should feel like a decision worth explaining.

**Every effect that subscribes to something cleans up after itself.** Timers, document event listeners, and in-flight requests are all cancelled on unmount — there are worked examples in `AuthenticationContext.tsx`, `TopNavigation.tsx` and `useCatalogFiltersFromUrl.ts`.

Before opening a pull request:

```bash
cd backend && npm run typecheck
cd frontend && npm run build
```

Both must pass clean. The frontend `build` script runs the type-checker first, so a type error fails the build rather than shipping.
