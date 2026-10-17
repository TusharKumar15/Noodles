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
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import sudoku
import tango

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
# {puzzle_id: {puzzle_type, puzzle, solution_hash, solution, seed, served_at}}
# Replace with Redis/DB in production.
# ---------------------------------------------------------------------------
_puzzle_store: dict[str, dict[str, Any]] = {}


def _solution_hash(solution: Any) -> str:
    """SHA-256 of the canonical JSON representation of a solution grid."""
    canonical = json.dumps(solution, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(canonical.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class PuzzleResponse(BaseModel):
    puzzle_id: str
    puzzle_type: str
    puzzle: Any
    served_at: str   # ISO-8601 UTC


class SubmitRequest(BaseModel):
    solution: Any


class SubmitResponse(BaseModel):
    correct: bool
    elapsed_seconds: float
    message: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/puzzle/new", response_model=PuzzleResponse)
def new_puzzle(type: Optional[str] = Query(default=None)) -> PuzzleResponse:
    """
    Generate a new puzzle (randomly sudoku6x6 or tango, or specified via ?type=).

    The seed is created server-side and never exposed to the client.
    """
    if type in ("sudoku", "sudoku6x6", "sudoku_6x6"):
        puzzle_type = "sudoku6x6"
    elif type in ("tango", "tango6x6", "tango_6x6"):
        puzzle_type = "tango"
    else:
        puzzle_type = random.choice(["sudoku6x6", "tango"])

    seed = random.randint(0, 2**31 - 1)

    if puzzle_type == "sudoku6x6":
        puzzle, solution = sudoku.generate(seed)
    else:
        puzzle, solution = tango.generate(seed)

    puzzle_id = str(uuid.uuid4())
    served_at = datetime.now(timezone.utc).isoformat()

    _puzzle_store[puzzle_id] = {
        "puzzle_type": puzzle_type,
        "puzzle": puzzle,
        "solution": solution,
        "solution_hash": _solution_hash(solution),
        "seed": seed,           # stored for auditability/debugging
        "served_at": served_at,
    }

    return PuzzleResponse(
        puzzle_id=puzzle_id,
        puzzle_type=puzzle_type,
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
    puzzle_type = record.get("puzzle_type", "sudoku6x6")

    # Basic shape check (both Sudoku and Tango are 6x6 grids)
    if not isinstance(attempt, list) or len(attempt) != 6 or any(not isinstance(row, list) or len(row) != 6 for row in attempt):
        raise HTTPException(status_code=422, detail="Solution must be a 6×6 grid.")

    if puzzle_type in ("sudoku", "sudoku6x6", "sudoku_6x6"):
        correct = sudoku.is_valid_solution(record["puzzle"], attempt, record["solution"])
    elif puzzle_type in ("tango", "tango6x6", "tango_6x6"):
        correct = tango.is_valid_solution(record["puzzle"], attempt, record["solution"])
    else:
        raise HTTPException(status_code=400, detail=f"Unknown puzzle type: {puzzle_type}")

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
