"""
6x6 Tango generator and validator (similar to LinkedIn Tango).

Rules:
1. Every row and column must contain an equal number of Suns ('S') and Moons ('M') (3 each for a 6x6 grid).
2. No more than two identical symbols can be adjacent horizontally or vertically (no 3-in-a-row).
3. Relational edge constraints between adjacent cells:
   - '=' indicates the two adjacent cells must have the same symbol.
   - 'x' indicates the two adjacent cells must have opposite symbols.
4. Each row must be unique, and each column must be unique.
"""

import copy
import itertools
import random
from typing import Any

SIZE = 6
HALF = SIZE // 2
SUN = "S"
MOON = "M"
EMPTY = ""
SYMBOLS = {SUN, MOON}

# Map 1 -> 'S', 2 -> 'M' for internal generation representation
INT_TO_SYM = {1: SUN, 2: MOON}
SYM_TO_INT = {SUN: 1, MOON: 2}


def _get_valid_lines() -> list[tuple[int, ...]]:
    """Return all distinct 6-element lines with 3 ones, 3 twos, and no 3 identical in a row."""
    valid: set[tuple[int, ...]] = set()
    for p in itertools.permutations([1, 1, 1, 2, 2, 2]):
        if any(p[i] == p[i + 1] == p[i + 2] for i in range(len(p) - 2)):
            continue
        valid.add(p)
    return list(valid)


VALID_LINES = _get_valid_lines()


def _generate_full_solution(rng: random.Random) -> list[list[int]]:
    """Generate a valid, fully filled 6x6 grid adhering to all Tango rules."""
    lines = list(VALID_LINES)
    rng.shuffle(lines)
    grid: list[tuple[int, ...]] = []

    def can_add_row(current_rows: list[tuple[int, ...]], new_row: tuple[int, ...]) -> bool:
        if new_row in current_rows:
            return False
        curr_len = len(current_rows) + 1
        for c in range(SIZE):
            val = new_row[c]
            col_vals = [current_rows[r][c] for r in range(len(current_rows))] + [val]
            if col_vals.count(1) > HALF or col_vals.count(2) > HALF:
                return False
            if curr_len >= 3 and col_vals[-1] == col_vals[-2] == col_vals[-3]:
                return False
        if curr_len == SIZE:
            cols = []
            for c in range(SIZE):
                col = tuple([current_rows[r][c] for r in range(len(current_rows))] + [new_row[c]])
                if col.count(1) != HALF:
                    return False
                cols.append(col)
            if len(set(cols)) != SIZE:
                return False
        return True

    def backtrack(row_idx: int) -> bool:
        if row_idx == SIZE:
            return True
        cands = list(lines)
        rng.shuffle(cands)
        for line in cands:
            if can_add_row(grid, line):
                grid.append(line)
                if backtrack(row_idx + 1):
                    return True
                grid.pop()
        return False

    backtrack(0)
    return [list(row) for row in grid]


def _count_solutions(
    grid_givens: list[list[int]],
    edges: list[dict[str, Any]],
    enforce_uniqueness: bool = True,
    limit: int = 2,
) -> int:
    """
    Count valid solutions satisfying balance + no-3-in-a-row + givens + edge constraints.

    `enforce_uniqueness` controls whether the row/col uniqueness rule is also
    enforced:
      - False (used during generation): counts solutions a player could reach
        using only balance, adjacency, and edge-clue deductions -- i.e. without
        relying on "rows/cols must be unique" as a solving technique. This is
        what determines whether a puzzle is genuinely solvable from its givens.
      - True (used for validation/debugging): enforces every rule, matching
        what a fully-correct solution must satisfy.
    """
    h_edges: dict[int, list[tuple[int, int, str]]] = {}
    v_edges: dict[int, list[tuple[int, str]]] = {}

    for e in edges:
        r1, c1, r2, c2, rel = e["r1"], e["c1"], e["r2"], e["c2"], e["type"]
        if r1 == r2:
            h_edges.setdefault(r1, []).append((c1, c2, rel))
        elif r2 == r1 + 1 and c1 == c2:
            v_edges.setdefault(r2, []).append((c1, rel))

    row_cands: list[list[tuple[int, ...]]] = []
    for r in range(SIZE):
        givens = grid_givens[r]
        hedg = h_edges.get(r, [])
        cands: list[tuple[int, ...]] = []
        for line in VALID_LINES:
            match = True
            for c in range(SIZE):
                if givens[c] != 0 and givens[c] != line[c]:
                    match = False
                    break
            if not match:
                continue
            for c1, c2, rel in hedg:
                if rel == "=" and line[c1] != line[c2]:
                    match = False
                    break
                if rel == "x" and line[c1] == line[c2]:
                    match = False
                    break
            if match:
                cands.append(line)
        row_cands.append(cands)

    sol_count = 0
    current_grid: list[tuple[int, ...]] = []

    def search(r: int) -> None:
        nonlocal sol_count
        if r == SIZE:
            cols = []
            for c in range(SIZE):
                col = tuple(current_grid[rr][c] for rr in range(SIZE))
                if col.count(1) != HALF:
                    return
                cols.append(col)
            if enforce_uniqueness and len(set(cols)) != SIZE:
                return
            sol_count += 1
            return

        vedg = v_edges.get(r, [])
        for line in row_cands[r]:
            if enforce_uniqueness and line in current_grid:
                continue

            if vedg:
                prev_row = current_grid[r - 1]
                v_ok = True
                for c, rel in vedg:
                    if rel == "=" and prev_row[c] != line[c]:
                        v_ok = False
                        break
                    if rel == "x" and prev_row[c] == line[c]:
                        v_ok = False
                        break
                if not v_ok:
                    continue

            col_ok = True
            curr_len = r + 1
            for c in range(SIZE):
                val = line[c]
                col_vals = [current_grid[rr][c] for rr in range(r)] + [val]
                if col_vals.count(1) > HALF or col_vals.count(2) > HALF:
                    col_ok = False
                    break
                if curr_len >= 3 and col_vals[-1] == col_vals[-2] == col_vals[-3]:
                    col_ok = False
                    break
            if not col_ok:
                continue

            current_grid.append(line)
            search(r + 1)
            current_grid.pop()
            if sol_count >= limit:
                return

    search(0)
    return sol_count


def generate(seed: int) -> tuple[dict[str, Any], list[list[str]]]:
    """
    Generate a 6x6 Tango puzzle and its unique solution from `seed`.

    Returns:
    --------
    puzzle : dict
        {
            "size": 6,
            "grid": list[list[str]],  # 6x6 with "S", "M", or "" for empty
            "edges": list[dict]        # [{"r1": int, "c1": int, "r2": int, "c2": int, "type": "=" | "x"}]
        }
    solution : list[list[str]]
        6x6 grid of "S" and "M"
    """
    rng = random.Random(seed)
    solution_int = _generate_full_solution(rng)

    # Collect candidate edge constraints
    candidate_edges: list[dict[str, Any]] = []
    for r in range(SIZE):
        for c in range(SIZE - 1):
            rel = "=" if solution_int[r][c] == solution_int[r][c + 1] else "x"
            candidate_edges.append({"r1": r, "c1": c, "r2": r, "c2": c + 1, "type": rel})
    for r in range(SIZE - 1):
        for c in range(SIZE):
            rel = "=" if solution_int[r][c] == solution_int[r + 1][c] else "x"
            candidate_edges.append({"r1": r, "c1": c, "r2": r + 1, "c2": c, "type": rel})

    rng.shuffle(candidate_edges)

    # Build edge set incrementally: keep adding edges until they alone
    # (against an EMPTY grid, i.e. no cell givens at all) pin down a unique
    # solution without relying on the row/col uniqueness deduction.
    # Using an empty grid here (rather than the full solution) is what makes
    # this check meaningful -- against a fully-given grid, any single edge
    # already trivially "succeeds" since each row only has one candidate
    # line left regardless of the edges, so the loop would always stop
    # after one edge and the clues would end up carrying almost no
    # information.
    selected_edges: list[dict[str, Any]] = []
    max_edges = min(8, len(candidate_edges))
    empty_givens = [[0] * SIZE for _ in range(SIZE)]
    for edge_idx in range(max_edges):
        selected_edges.append(candidate_edges[edge_idx])
        if _count_solutions(empty_givens, selected_edges, enforce_uniqueness=False, limit=2) == 1:
            break

    # Start with all cells given, then remove cells while preserving a
    # unique solution (using the no-uniqueness-rule counter, so the puzzle
    # stays solvable without a player needing the uniqueness deduction).
    givens_int = copy.deepcopy(solution_int)
    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    rng.shuffle(cells)

    for r, c in cells:
        backup = givens_int[r][c]
        givens_int[r][c] = 0
        if _count_solutions(givens_int, selected_edges, enforce_uniqueness=False, limit=2) != 1:
            givens_int[r][c] = backup  # Keep cell to maintain uniqueness

    puzzle_grid = [
        [INT_TO_SYM.get(givens_int[r][c], EMPTY) for c in range(SIZE)]
        for r in range(SIZE)
    ]
    solution_grid = [
        [INT_TO_SYM[solution_int[r][c]] for c in range(SIZE)]
        for r in range(SIZE)
    ]

    puzzle = {
        "size": SIZE,
        "grid": puzzle_grid,
        "edges": selected_edges,
    }

    return puzzle, solution_grid


def is_valid_solution(
    puzzle: dict[str, Any],
    attempt: list[list[str]],
    solution: list[list[str]],
) -> bool:
    """
    Validate that `attempt` is a valid, correct solution for `puzzle`.

    The generator guarantees `puzzle` has exactly one solution, and that
    solution is `solution`. So once `attempt` is confirmed to be a
    well-formed 6x6 grid of 'S'/'M' values, comparing it directly against
    `solution` is sufficient -- it implies every rule (given cells, edge
    clues, row/col balance, no-3-in-a-row, row/col uniqueness) is already
    satisfied, since `solution` itself satisfies all of them. Re-checking
    each rule separately against `attempt` would be redundant work that
    can never change the outcome.
    """
    if len(attempt) != SIZE or any(len(row) != SIZE for row in attempt):
        return False
    if any(val not in SYMBOLS for row in attempt for val in row):
        return False

    return attempt == solution