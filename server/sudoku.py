"""
6×6 Sudoku generator and validator.

A 6×6 grid uses digits 1-6, divided into six 2x3 boxes:
  +-------+-------+-------+
  | 2x3   | 2x3   | 2x3   |
  +-------+-------+-------+
  | 2x3   | 2x3   | 2x3   |
  +-------+-------+-------+

Row / col constraints: digits 1-6 exactly once.
Box  constraints: digits 1-6 exactly once in each 2x3 region.
"""

import copy
import random
from typing import Optional

SIZE = 6          # grid dimension
BOX_ROWS = 2      # rows per box
BOX_COLS = 3      # cols per box
DIGITS = set(range(1, SIZE + 1))

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _box_origin(r: int, c: int) -> tuple[int, int]:
    """Return the top-left cell of the 2x3 box that (r, c) belongs to."""
    return (r // BOX_ROWS) * BOX_ROWS, (c // BOX_COLS) * BOX_COLS


def _used_in_box(grid: list[list[int]], r: int, c: int) -> set[int]:
    br, bc = _box_origin(r, c)
    return {
        grid[br + dr][bc + dc]
        for dr in range(BOX_ROWS)
        for dc in range(BOX_COLS)
        if grid[br + dr][bc + dc] != 0
    }


def _candidates(grid: list[list[int]], r: int, c: int) -> set[int]:
    row_used = {v for v in grid[r] if v != 0}
    col_used = {grid[rr][c] for rr in range(SIZE) if grid[rr][c] != 0}
    box_used = _used_in_box(grid, r, c)
    return DIGITS - row_used - col_used - box_used


def _next_empty(grid: list[list[int]]) -> Optional[tuple[int, int]]:
    """Return the first empty cell (row-major) or None if the grid is full."""
    for r in range(SIZE):
        for c in range(SIZE):
            if grid[r][c] == 0:
                return r, c
    return None


# ---------------------------------------------------------------------------
# Solvers
# ---------------------------------------------------------------------------

def _fill(grid: list[list[int]], rng: random.Random) -> bool:
    """
    Fill *grid* with a valid solution in-place using randomised backtracking.

    Returns True when the grid is fully and validly filled.
    Keeps the filled state on success — used only for generation.
    """
    cell = _next_empty(grid)
    if cell is None:
        return True  # grid is full

    r, c = cell
    cands = list(_candidates(grid, r, c))
    rng.shuffle(cands)

    for digit in cands:
        grid[r][c] = digit
        if _fill(grid, rng):
            return True
        grid[r][c] = 0  # backtrack

    return False  # no digit worked


def _count_solutions(grid: list[list[int]], limit: int = 2) -> int:
    """
    Count solutions up to *limit* without keeping any placed state.
    Used for uniqueness checking during cell-removal.
    """
    cell = _next_empty(grid)
    if cell is None:
        return 1  # full grid counts as one solution

    r, c = cell
    found = 0
    for digit in _candidates(grid, r, c):
        grid[r][c] = digit
        found += _count_solutions(grid, limit)
        grid[r][c] = 0  # always revert - we are counting, not keeping
        if found >= limit:
            break

    return found


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate(seed: int) -> tuple[list[list[int]], list[list[int]]]:
    """
    Generate a 6x6 Sudoku puzzle and its unique solution from *seed*.

    Returns
    -------
    puzzle   : 6x6 grid, 0 = empty cell
    solution : 6x6 grid, fully filled
    """
    rng = random.Random(seed)

    # 1. Build a complete valid solution via randomised backtracking
    solution: list[list[int]] = [[0] * SIZE for _ in range(SIZE)]
    _fill(solution, rng)

    # 2. Remove cells while preserving a unique solution
    # Aim to reveal ~50% of cells (roughly 18 givens out of 36).
    puzzle: list[list[int]] = copy.deepcopy(solution)

    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    rng.shuffle(cells)

    for r, c in cells:
        backup = puzzle[r][c]
        puzzle[r][c] = 0

        test = copy.deepcopy(puzzle)
        if _count_solutions(test, limit=2) != 1:
            puzzle[r][c] = backup  # revert - uniqueness violated

    return puzzle, solution


def is_valid_solution(
    puzzle: list[list[int]],
    attempt: list[list[int]],
    solution: list[list[int]],
) -> bool:
    """
    Validate that *attempt* is the correct solution for *puzzle*.

    Checks:
      - All given (non-zero) cells in puzzle match attempt.
      - attempt equals solution (authoritative server-side check).
    """
    for r in range(SIZE):
        for c in range(SIZE):
            if puzzle[r][c] != 0 and attempt[r][c] != puzzle[r][c]:
                return False
    return attempt == solution
