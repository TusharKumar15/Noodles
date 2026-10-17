"""
Noodles – FastAPI server (MVP: 6×6 Sudoku only)

Endpoints
---------
GET  /puzzle/new          → generate a fresh puzzle (seeded internally)
POST /puzzle/{puzzle_id}/submit  → validate a user solution

Design follows the spec in context/about.md §3:
  - Seed never leaves the server.
  - Server stamps `served_at` with its own clock.
  - Validation is hash-comparison against the server's precomputed solution.
  - Elapsed time is computed exclusively from the server clock.
"""

import hashlib
import json
import random
import time
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sudoku import generate, is_valid_solution

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="Noodles API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory puzzle store
# {puzzle_id: {puzzle, solution_hash, solution, seed, served_at}}
# Replace with Redis/DB in production.
# ---------------------------------------------------------------------------
_puzzle_store: dict[str, dict[str, Any]] = {}


def _solution_hash(solution: list[list[int]]) -> str:
    """SHA-256 of the canonical JSON representation of a solution grid."""
    canonical = json.dumps(solution, separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class PuzzleResponse(BaseModel):
    puzzle_id: str
    puzzle_type: str
    puzzle: list[list[int]]
    served_at: str   # ISO-8601 UTC


class SubmitRequest(BaseModel):
    solution: list[list[int]]


class SubmitResponse(BaseModel):
    correct: bool
    elapsed_seconds: float
    message: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/puzzle/new", response_model=PuzzleResponse)
def new_puzzle() -> PuzzleResponse:
    """
    Generate a new 6×6 Sudoku puzzle.

    The seed is created server-side and never exposed to the client.
    """
    seed = random.randint(0, 2**31 - 1)
    puzzle, solution = generate(seed)

    puzzle_id = str(uuid.uuid4())
    served_at = datetime.now(timezone.utc).isoformat()

    _puzzle_store[puzzle_id] = {
        "puzzle": puzzle,
        "solution": solution,
        "solution_hash": _solution_hash(solution),
        "seed": seed,           # stored for auditability/debugging
        "served_at": served_at,
    }

    return PuzzleResponse(
        puzzle_id=puzzle_id,
        puzzle_type="sudoku_6x6",
        puzzle=puzzle,
        served_at=served_at,
    )


@app.post("/puzzle/{puzzle_id}/submit", response_model=SubmitResponse)
def submit_solution(puzzle_id: str, body: SubmitRequest) -> SubmitResponse:
    """
    Validate a client-submitted solution.

    - Elapsed time is computed server-side from `served_at`.
    - Correctness is checked by hash-comparing the submitted grid against
      the server's precomputed solution (never re-solves on the fly).
    """
    record = _puzzle_store.get(puzzle_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Puzzle not found or expired.")

    # Server-side elapsed time (never trust client-reported time)
    served_at_dt = datetime.fromisoformat(record["served_at"])
    elapsed = (datetime.now(timezone.utc) - served_at_dt).total_seconds()

    attempt = body.solution

    # Basic shape check
    if len(attempt) != 6 or any(len(row) != 6 for row in attempt):
        raise HTTPException(status_code=422, detail="Solution must be a 6×6 grid.")

    correct = is_valid_solution(record["puzzle"], attempt, record["solution"])

    if correct:
        message = f"Correct! Solved in {elapsed:.1f}s."
        # In production: persist result to DB, update Elo ratings, etc.
        del _puzzle_store[puzzle_id]   # free memory after successful solve
    else:
        message = "Incorrect solution. Keep trying!"

    return SubmitResponse(correct=correct, elapsed_seconds=elapsed, message=message)


# ---------------------------------------------------------------------------
# Dev entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
