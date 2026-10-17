# Noodles — Project Context

> Background context for an AI coding agent working on this repo. Captures the product idea, decisions made so far, and the reasoning behind them, so the agent doesn't need to re-derive architecture choices from scratch.

## 1. Project idea

A mobile app presenting a TikTok/Reels-style vertical scroll feed of short logic puzzles — Queens, Tango, Sudoku variants, Zip, Lights Out, Slitherlink, etc. (renamed in-product to avoid trademark overlap with NYT Games, see §6). Puzzles are infinitely generated, each play contributes to a competitive skill rating (Elo/Glicko-style), with leaderboards and personal stats. Primary monetization: ads (rewarded video preferred over banners), with light IAP (remove ads, cosmetic themes, streak freezes) as a likely addition.

**App name: Noodles.** UI/branding should lean into the "noodle" theme (puzzle pieces, loading states, mascot, copy tone) rather than generic "puzzle app" language.

**Core differentiator:** the vertical-scroll, reel-style consumption pattern applied to logic puzzles isn't an established format yet, even though individual puzzle types and multi-puzzle hubs already exist (Puzzmo, NYT Games, standalone single-puzzle apps). Matiks (Indian competitive brain-training app) is an adjacent competitor but its mechanic is real-time math/arithmetic battles, not spatial logic grids.

## 2. Tech stack

- **Client:** React Native (single codebase, iOS + Android). `react-native-reanimated` for scroll/swipe physics, `react-native-skia` for custom puzzle board rendering (grids, edges, regions).
- **Server:** Python + **FastAPI**. Chosen because the hardest backend work is puzzle generation/solving/difficulty-scoring, where Python's ecosystem is strong: `OR-Tools` or `python-constraint` for constraint-satisfaction puzzle types (Queens, Tango, Sudoku-variants), `networkx` for connectivity-style puzzles (Zip, Slitherlink loops).
- **DB:** Postgres (users, ratings, puzzle metadata, solve logs). Redis for leaderboards (sorted sets) and session/caching.

## 3. Server responsibilities

1. **Authentication**

2. **Seed generation → puzzle generation**
   - Server generates a seed internally (for reproducible/debuggable generation), then produces the full **puzzle string/JSON** and the corresponding **solution string/JSON** from that seed, via the type-specific generator + logical solver.
   - The seed itself never leaves the server — client never sees it and never regenerates puzzles locally. This avoids having two independent implementations of the same generator (Python server vs RN/JS client) drift out of sync over time. Puzzle payloads are small enough (well under 1KB) that storage/bandwidth savings from seed-only client-side generation aren't worth that maintenance risk.

3. **Serve client + validate solution**
   - Serves `{puzzleType, puzzle, servedAt}` to the client. `servedAt` is stamped on the server's own clock (this is the start-of-timer reference — never trust a client-reported start time).
   - On submission, validates the client's solution against the server's own precomputed solution (hash comparison, not a re-solve), calculates elapsed time as `now() − servedAt` using only the server clock, and stores the result (pass/fail, elapsed time, puzzle, user) in the database.
   - This is the only authoritative check — exactly 2 calls per puzzle (serve + submit), no per-move network traffic. CORS/origin checks are not a valid defense here since there's no browser involved on mobile; the real defense is that the server independently recomputes/checks everything it cares about rather than trusting any client-reported outcome or timing.

4. **Difficulty + rating + leaderboard**
   - Calculates puzzle difficulty via a logical-only solver that applies deduction techniques in increasing tiers (forced placement → cascading elimination → pairs/subset reasoning → single-step lookahead → deeper backtracking). Difficulty score = weighted technique-tier usage + backtracking penalty. This is a cold-start estimate — recalibrate against real observed success rate / median solve time once a puzzle has real play data.
   - Calculates user rating via a two-sided Elo/Glicko-style system (same family as lichess/chess.com puzzle ratings):
     - `R_user` starts ~1200; `R_puzzle` seeded from the difficulty score.
     - Outcome score `S` (continuous, not binary) from solve time vs. the puzzle's `par_time`:
       `S = clamp(par_time / (par_time + max(0, actual_time − par_time)), 0, 1)`
     - `E = 1 / (1 + 10^((R_puzzle − R_user) / 400))`
     - `R_user += K_user * (S − E)`; `R_puzzle += K_puzzle * ((1−S) − (1−E))`, with larger `K` for new/uncertain users and puzzles, smaller once established.
   - Maintains the leaderboard (Redis sorted sets — O(log n) updates, instant rank queries).

## 4. Client responsibilities

- **Reel-style interactive UI (Noodles-themed)** — vertical scroll feed, one puzzle per "card," smooth swipe transitions between puzzles.
- Renders the puzzle on screen purely from the `puzzleType` + puzzle string/JSON served by the backend — no generator or solver logic on-device.
- On every user move, runs a **local win-check** against the current grid state. This is a pure UX concern (instant win animation, auto-advance to next puzzle) and is never trusted for scoring — the server re-validates independently regardless of what triggered the submit call.
- The instant the local win-check passes, **automatically** (no submit button) fires the background request to the backend with the final solution state, which the backend then validates and times as described in §3.

## 5. Anti-bot / anti-cheat (not required for MVP, add incrementally if it becomes a real problem)

- Floor-time rejection (reject submissions faster than physically plausible for that puzzle's size/difficulty)
- Statistical anomaly flagging on leaderboard times (review/shadow-ban outliers rather than blocking in real time)
- Rate limiting per account/IP on submit calls
- Device attestation (Play Integrity API / Apple App Attest) — treat as a later addition once cheating is an observed problem, not a day-one requirement

Mistake count / hints-used (if added to the UI later) should be self-reported by the client in the submit payload rather than validated server-side per action — acceptable since they only affect cosmetic stats/difficulty tuning, not the core pass/fail/time/rating.

## 6. Build sequence (current plan, roughly in order)

1. Lock initial puzzle lineup (3–4 types to start, not all of them) and their in-product names (per §6)
2. Build puzzle generators + logical solvers + difficulty scorer headless in Python (no UI) for first 1–2 types — highest technical risk, prove in isolation first
3. Single-puzzle-type MVP client (RN) — fetch puzzle → render → solve locally → auto-submit, to validate the reel/scroll feel before investing further
4. Backend spine: auth, serve/validate endpoints with server-side timing
5. Rating system + Redis leaderboard, once real solve data exists
6. Expand remaining puzzle types; closed beta (50–100 users) to recalibrate difficulty bands/par times against real human data
7. Monetization (ads SDK, light IAP) + store listing/ASO
8. Soft launch single market, iterate on retention (day-1/day-7) before wider marketing spend

**Status: pre-build, in architecture/planning phase. No code written yet.**