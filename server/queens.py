"""
Queens puzzle generator and validator for 8×8 (and arbitrary N×N) grids.

Rules (fetched from classic Queens / LinkedIn Queens specifications):
1. Grid Division:
   The N×N grid is partitioned into N distinct, contiguous colored regions.
2. Row & Column Uniqueness:
   Exactly one Queen ('Q') must be placed in each horizontal row and each vertical column.
3. Region Uniqueness:
   Exactly one Queen ('Q') must be placed in each colored region.
4. No Adjacency (No Touching):
   No two queens may touch each other horizontally, vertically, or diagonally.
   (i.e. For any two queens at (r1, c1) and (r2, c2), max(|r1 - r2|, |c1 - c2|) > 1).
5. Elimination:
   Players mark cells where queens cannot be placed with 'X', and place crowns ('Q')
   on deduced queen squares until all N queens are placed according to the rules.

Algorithm:
- Non-attacking seed placement: Places N queens such that no two share row, column,
  or touch diagonally.
- Multi-source region expansion: Partitions the grid into N contiguous regions
  seeded by the queen positions.
- CEGAR (Counter-Example Guided) Refinement: Iteratively eliminates alternative
  solutions by adjusting region boundaries while preserving region contiguity,
  guaranteeing a strictly unique solution in milliseconds.
"""

from collections import deque
import copy
import random
from typing import Any, Optional

DEFAULT_QUEENS_SIZE = 8


def find_valid_queens_placement(n: int, rng: random.Random) -> list[tuple[int, int]]:
    """
    Find a valid non-touching placement of N queens on an N×N board.
    - Exactly 1 queen per row and column.
    - No two queens touch horizontally, vertically, or diagonally.
    """
    used_cols = [False] * n
    Q = [0] * n

    def backtrack(r: int) -> bool:
        if r == n:
            return True
        cands = list(range(n))
        rng.shuffle(cands)
        for c in cands:
            if not used_cols[c]:
                # Diagonal & orthogonal adjacency check with previous row
                if r > 0 and abs(c - Q[r - 1]) <= 1:
                    continue
                used_cols[c] = True
                Q[r] = c
                if backtrack(r + 1):
                    return True
                used_cols[c] = False
        return False

    backtrack(0)
    return [(r, Q[r]) for r in range(n)]


def solve_queens(
    grid_regions: list[list[int]],
    n: int,
    limit: int = 2,
) -> list[list[int]]:
    """
    Backtracking constraint solver to find valid queen placements for a given region board.
    Returns a list of solutions, where each solution is a list Q of column indices (row r has queen at col Q[r]).
    Stops searching once `limit` solutions are found.
    """
    used_cols = [False] * n
    used_regions = [False] * n
    Q = [0] * n
    solutions: list[list[int]] = []

    def backtrack(r: int) -> None:
        if r == n:
            solutions.append(list(Q))
            return

        for c in range(n):
            if not used_cols[c]:
                if r > 0 and abs(c - Q[r - 1]) <= 1:
                    continue
                reg = grid_regions[r][c]
                if reg != -1 and not used_regions[reg]:
                    used_cols[c] = True
                    used_regions[reg] = True
                    Q[r] = c
                    backtrack(r + 1)
                    used_cols[c] = False
                    used_regions[reg] = False
                    if len(solutions) >= limit:
                        return

    backtrack(0)
    return solutions


def is_region_contiguous(grid: list[list[int]], reg_id: int, n: int) -> bool:
    """Check if all cells belonging to `reg_id` form a single 4-connected component."""
    cells = [(r, c) for r in range(n) for c in range(n) if grid[r][c] == reg_id]
    if not cells:
        return False
    visited = set()
    queue = deque([cells[0]])
    visited.add(cells[0])
    cell_set = set(cells)
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if (nr, nc) in cell_set and (nr, nc) not in visited:
                visited.add((nr, nc))
                queue.append((nr, nc))
    return len(visited) == len(cells)


def _grow_initial_regions(
    queens: list[tuple[int, int]],
    n: int,
    rng: random.Random,
) -> list[list[int]]:
    """Partition the N×N grid into N organic, contiguous regions around the queen seeds."""
    grid = [[-1] * n for _ in range(n)]
    for reg_id, (r, c) in enumerate(queens):
        grid[r][c] = reg_id

    frontier: list[tuple[int, int, int]] = []
    for reg_id, (r, c) in enumerate(queens):
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == -1:
                frontier.append((nr, nc, reg_id))

    while frontier:
        idx = rng.randrange(len(frontier))
        nr, nc, reg_id = frontier.pop(idx)
        if grid[nr][nc] != -1:
            continue
        grid[nr][nc] = reg_id
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nnr, nnc = nr + dr, nc + dc
            if 0 <= nnr < n and 0 <= nnc < n and grid[nnr][nnc] == -1:
                frontier.append((nnr, nnc, reg_id))

    return grid


def generate(
    seed: int,
    grid_size: int = DEFAULT_QUEENS_SIZE,
) -> tuple[dict[str, Any], list[list[str]]]:
    """
    Generate a guaranteed-unique Queens puzzle and its precomputed solution.

    Returns:
    --------
    puzzle : dict
        {
            "size": 8,
            "regions": list[list[int]],  # N×N grid of region IDs (0 to N-1)
            "rules": list[str]
        }
    solution : list[list[str]]
        N×N grid with "Q" on queen squares and "" on empty squares.
    """
    rng = random.Random(seed)
    n = grid_size

    rules = [
        "Place exactly one queen (👑) in each row, column, and colored region.",
        "No two queens can touch each other, even diagonally.",
        "Tap a cell to cycle: ✖ (empty) ➜ 👑 (queen) ➜ clear.",
    ]

    while True:
        queens = find_valid_queens_placement(n, rng)
        queen_set = set(queens)
        target_sol = [c for _, c in queens]

        grid = _grow_initial_regions(queens, n, rng)

        # Refine boundary cells using CEGAR to eliminate extraneous solutions
        unique = False
        for _ in range(150):
            sols = solve_queens(grid, n, limit=2)
            if len(sols) == 1:
                unique = True
                break

            # Pick alternative solution
            alt_sol = sols[0] if sols[0] != target_sol else sols[1]
            diff_cells = [(r, alt_sol[r]) for r in range(n) if alt_sol[r] != target_sol[r]]
            rng.shuffle(diff_cells)

            reassigned = False
            for r, c in diff_cells:
                if (r, c) in queen_set:
                    continue
                old_reg = grid[r][c]
                adj_regs = set()
                for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] != old_reg:
                        adj_regs.add(grid[nr][nc])
                for new_reg in adj_regs:
                    grid[r][c] = new_reg
                    if is_region_contiguous(grid, old_reg, n) and is_region_contiguous(grid, new_reg, n):
                        new_sols = solve_queens(grid, n, limit=2)
                        if alt_sol not in new_sols:
                            reassigned = True
                            break
                    grid[r][c] = old_reg
                if reassigned:
                    break

            if not reassigned:
                # Random boundary mutation
                boundary_cells = []
                for r in range(n):
                    for c in range(n):
                        if (r, c) not in queen_set:
                            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                                nr, nc = r + dr, c + dc
                                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] != grid[r][c]:
                                    boundary_cells.append((r, c, grid[nr][nc]))
                if boundary_cells:
                    rng.shuffle(boundary_cells)
                    for r, c, new_reg in boundary_cells[:5]:
                        old_reg = grid[r][c]
                        grid[r][c] = new_reg
                        if is_region_contiguous(grid, old_reg, n) and is_region_contiguous(grid, new_reg, n):
                            break
                        grid[r][c] = old_reg

        if unique:
            # Check all regions 0..N-1 are present and contiguous
            present_regs = {grid[r][c] for r in range(n) for c in range(n)}
            if len(present_regs) == n and all(is_region_contiguous(grid, r_id, n) for r_id in range(n)):
                solution_grid = [["" for _ in range(n)] for _ in range(n)]
                for r, c in queens:
                    solution_grid[r][c] = "Q"

                puzzle = {
                    "size": n,
                    "regions": grid,
                    "rules": rules,
                }
                return puzzle, solution_grid


def is_valid_solution(
    puzzle: dict[str, Any],
    attempt: Any,
    solution: Optional[list[list[str]]] = None,
) -> bool:
    """
    Validate that `attempt` solves `puzzle`.

    Accepts:
    - An N×N grid of strings ("Q", "", "X") or booleans/ints (1 for Queen, 0 for empty).
    - A dictionary containing a `"queens"` list of `[r, c]` coordinates.
    - A list of coordinate pairs `[[r, c], ...]`.
    """
    regions = puzzle.get("regions")
    if not regions or not isinstance(regions, list):
        return False
    n = len(regions)
    if any(not isinstance(row, list) or len(row) != n for row in regions):
        return False

    # Extract queen coordinates from attempt
    queen_coords: list[tuple[int, int]] = []

    if isinstance(attempt, dict) and "queens" in attempt:
        attempt = attempt["queens"]

    # If coordinates list [[r, c], ...]
    if isinstance(attempt, list) and attempt and isinstance(attempt[0], (list, tuple)) and len(attempt[0]) == 2 and isinstance(attempt[0][0], int):
        for item in attempt:
            r, c = item[0], item[1]
            if 0 <= r < n and 0 <= c < n:
                queen_coords.append((r, c))
            else:
                return False
    # If N×N grid representation
    elif isinstance(attempt, list) and len(attempt) == n and all(isinstance(row, list) and len(row) == n for row in attempt):
        for r in range(n):
            for c in range(n):
                val = attempt[r][c]
                if val == "Q" or val is True or val == 1:
                    queen_coords.append((r, c))
    else:
        return False

    # Verify exactly N queens
    if len(queen_coords) != n:
        return False

    # Check exactly 1 queen per row, column, and region
    rows_seen = set()
    cols_seen = set()
    regs_seen = set()

    for r, c in queen_coords:
        if r in rows_seen or c in cols_seen:
            return False
        reg = regions[r][c]
        if reg in regs_seen:
            return False
        rows_seen.add(r)
        cols_seen.add(c)
        regs_seen.add(reg)

    # Check non-touching rule (no two queens touch horizontally, vertically, or diagonally)
    for i in range(n):
        r1, c1 = queen_coords[i]
        for j in range(i + 1, n):
            r2, c2 = queen_coords[j]
            if abs(r1 - r2) <= 1 and abs(c1 - c2) <= 1:
                return False

    return True
