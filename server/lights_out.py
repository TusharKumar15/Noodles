"""
Lights Out generator and validator for 5×5 (and arbitrary N×N) grids.

Rules (fetched from classic puzzle specifications):
1. The game is played on an N×N grid of lights (default 5×5).
2. Each cell is either ON (1, lit) or OFF (0, unlit).
3. Pressing or tapping any light toggles its own state and the states of its
   orthogonal adjacent neighbors (up, down, left, right). Diagonal neighbors
   are not affected. Cells on borders or corners only toggle their valid in-grid neighbors.
4. Objective: Turn OFF all lights on the grid (reach the state where every cell is 0).

Generator Algorithm (Reverse-Play + GF(2) Linear Algebra Verification):
- Because button toggling is commutative and self-inverse in GF(2), any board
  created by simulating random button presses from an all-zero (all lights off)
  board is guaranteed to be 100% solvable.
- We simulate random presses using a seeded PRNG (`random.Random(seed)`).
- We use Gaussian elimination over GF(2) to verify solvability, identify the
  null space quiet patterns, and extract the minimal-moves solution.
"""

import copy
import random
from typing import Any, Optional

LIGHTS_OUT_GRID_SIZE = 5


def toggle_cell(grid: list[list[int]], r: int, c: int, n: int = LIGHTS_OUT_GRID_SIZE) -> None:
    """Toggle cell (r, c) and its orthogonal neighbors in-place."""
    for dr, dc in ((0, 0), (-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < n and 0 <= nc < n:
            grid[nr][nc] ^= 1


def solve(grid: list[list[int]], n: int = LIGHTS_OUT_GRID_SIZE) -> Optional[list[list[int]]]:
    """
    Solve an N×N Lights Out puzzle using Gaussian elimination over GF(2).

    Returns the solution matrix (N×N binary grid of button presses) that requires
    the minimum total number of presses, or None if the board state is unsolvable.
    """
    size = n * n
    # Augmented matrix [A | b] where A is size x size transition matrix and b is board state
    A = [[0] * (size + 1) for _ in range(size)]
    for r in range(n):
        for c in range(n):
            idx = r * n + c
            A[idx][idx] = 1
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n:
                    nidx = nr * n + nc
                    A[idx][nidx] = 1
            A[idx][size] = grid[r][c]

    # Row echelon form over GF(2)
    pivot_cols: list[tuple[int, int]] = []
    lead = 0
    for col in range(size):
        pivot = None
        for row in range(lead, size):
            if A[row][col] == 1:
                pivot = row
                break
        if pivot is not None:
            A[lead], A[pivot] = A[pivot], A[lead]
            for row in range(size):
                if row != lead and A[row][col] == 1:
                    A[row] = [(A[row][k] + A[lead][k]) % 2 for k in range(size + 1)]
            pivot_cols.append((lead, col))
            lead += 1

    # Check for consistency (no row of the form [0 0 ... 0 | 1])
    for row in range(lead, size):
        if A[row][size] == 1:
            return None  # Unsolvable

    # Free variables for the null space
    pivot_col_set = {col for _, col in pivot_cols}
    free_cols = [c for c in range(size) if c not in pivot_col_set]

    # Generate all candidate solutions from the null space combinations
    solutions = []
    num_combinations = 1 << len(free_cols)
    for mask in range(num_combinations):
        x = [0] * size
        for i, fc in enumerate(free_cols):
            if (mask >> i) & 1:
                x[fc] = 1
        for row, col in reversed(pivot_cols):
            val = A[row][size]
            for c in range(col + 1, size):
                val = (val + A[row][c] * x[c]) % 2
            x[col] = val
        solutions.append(x)

    if not solutions:
        return None

    # Pick the solution with the minimum number of button presses
    best_solution = min(solutions, key=lambda s: sum(s))
    return [[best_solution[r * n + c] for c in range(n)] for r in range(n)]


def generate(seed: int, grid_size: int = LIGHTS_OUT_GRID_SIZE) -> tuple[dict[str, Any], list[list[int]]]:
    """
    Generate a guaranteed-solvable N×N Lights Out puzzle.

    Returns:
    --------
    puzzle   : dict containing grid, grid_size, LIGHTS_OUT_GRID_SIZE, min_moves, and rules
    solution : N×N binary grid representing the optimal buttons to press to turn all lights off
    """
    rng = random.Random(seed)
    n = grid_size

    # Loop until we produce a non-trivial, interesting puzzle
    while True:
        board = [[0] * n for _ in range(n)]
        # Pick a randomized number of distinct cell toggles (between 5 and 15 for 5x5)
        num_presses = rng.randint(max(3, n), min(15, n * n // 2))
        pressed_cells = rng.sample([(r, c) for r in range(n) for c in range(n)], num_presses)
        for r, c in pressed_cells:
            toggle_cell(board, r, c, n)

        # Ensure board is not already completely off
        if any(cell == 1 for row in board for cell in row):
            sol = solve(board, n)
            if sol is not None:
                min_moves = sum(sum(row) for row in sol)
                # Keep puzzles that require at least 3 moves
                if min_moves >= 3:
                    puzzle = {
                        "grid": board,
                        "min_moves": min_moves,
                        "rules": [
                            "Tap any light to toggle its state and its 4 orthogonal neighbors (up, down, left, right).",
                            "Turn off all lights on the grid to solve the puzzle."
                        ],
                    }
                    return puzzle, sol


def is_valid_solution(
    puzzle: dict[str, Any],
    attempt: Any,
    solution: Optional[list[list[int]]] = None,
) -> bool:
    """
    Validate that `attempt` solves `puzzle`.

    Accepts:
    - An N×N grid of 0/1 indicating which cells were pressed (mod 2).
    - A dictionary containing a `"presses"` key.
    - A list of coordinate pairs `[[r, c], ...]`.

    The validation simulates applying the moves to `puzzle["grid"]` and checks
    that all lights are OFF (0). It also succeeds if `attempt` matches the server's `solution`.
    """
    grid = puzzle.get("grid")
    if not grid or not isinstance(grid, list):
        return False
    n = len(grid)
    if any(not isinstance(row, list) or len(row) != n for row in grid):
        return False

    # Extract presses matrix if wrapped
    if isinstance(attempt, dict) and "presses" in attempt:
        attempt = attempt["presses"]

    # If coordinate list was sent [[r, c], ...]
    if isinstance(attempt, list) and attempt and isinstance(attempt[0], (list, tuple)) and len(attempt[0]) == 2 and isinstance(attempt[0][0], int) and isinstance(attempt[0][1], int) and not (len(attempt) == n and all(isinstance(row, list) and len(row) == n for row in attempt)):
        press_grid = [[0] * n for _ in range(n)]
        for item in attempt:
            r, c = item[0], item[1]
            if 0 <= r < n and 0 <= c < n:
                press_grid[r][c] ^= 1
            else:
                return False
        attempt = press_grid

    # Direct match with precomputed solution
    if solution is not None and attempt == solution:
        return True

    # Validate shape as N×N grid
    if not isinstance(attempt, list) or len(attempt) != n:
        return False
    if any(not isinstance(row, list) or len(row) != n for row in attempt):
        return False

    # Verify that values are 0/1 or booleans
    for row in attempt:
        for val in row:
            if val not in (0, 1, True, False):
                return False

    # Check if applying the press matrix turns off all lights
    for r in range(n):
        for c in range(n):
            toggles = int(attempt[r][c])
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n:
                    toggles += int(attempt[nr][nc])
            if (grid[r][c] + toggles) % 2 != 0:
                return False

    return True
