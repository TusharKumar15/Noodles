"""
Slitherlink (Loops) puzzle generator and validator.

Rules (fetched from official Nikoli / Slitherlink / Loops specifications):
1. Grid & Dots:
   The puzzle is played on a grid of cells bounded by a lattice of dots (vertices).
   Some cells contain clue numbers (0, 1, 2, or 3), while other cells are blank.
2. Single Closed Loop:
   Connect horizontally or vertically adjacent dots with line segments to form
   exactly ONE continuous, non-intersecting closed loop.
3. No Branching or Crossing:
   The loop cannot cross itself, branch, or leave loose dead ends. Every dot on the
   lattice must have either degree 2 (if the loop visits it) or degree 0 (if unvisited).
4. Clue Numbers:
   A number in a cell specifies exactly how many of its 4 surrounding boundary edges
   (top, bottom, left, right) must be part of the loop:
   - '0': None of the 4 edges can be part of the loop.
   - '1': Exactly 1 edge is part of the loop.
   - '2': Exactly 2 edges are part of the loop.
   - '3': Exactly 3 edges are part of the loop.
   - Blank (null): Any number of edges (0 to 3) can be part of the loop.

Algorithm:
- Loop Synthesis: Constructs an organic, simply connected region boundary over an N×N grid.
- Clue Derivation: Counts boundary edges bordering each cell.
- Reduction with Uniqueness Guarantee: Prunes clues one by one, using a constraint-propagation
  and DFS backtracking solver to guarantee strictly ONE unique solution for every generated puzzle.
"""

from collections import deque
import copy
import random
from typing import Any, Optional

DEFAULT_GRID_SIZE = 5

RULES = [
    "Connect adjacent dots horizontally or vertically to form a single continuous closed loop.",
    "Lines cannot branch, cross, or overlap (every dot has degree 0 or 2).",
    "A number indicates exactly how many of its 4 surrounding edges are part of the loop.",
    "Cells without numbers can have any number of edges as part of the loop.",
]


class SlitherlinkSolver:
    """
    Constraint-propagation and backtracking solver for Slitherlink puzzles.
    Used for verifying puzzle solvability and strictly unique solutions.
    """

    def __init__(self, R: int, C: int, clues: list[list[Optional[int]]]):
        self.R = R
        self.C = C
        self.clues = clues
        self.num_h = (R + 1) * C
        self.num_v = R * (C + 1)
        self.total_edges = self.num_h + self.num_v
        self.num_vertices = (R + 1) * (C + 1)

        # Map edge index to type ('H' or 'V') and coordinates (r, c)
        self.edge_info: list[tuple[str, int, int]] = []
        for e in range(self.total_edges):
            if e < self.num_h:
                r, c = divmod(e, C)
                self.edge_info.append(("H", r, c))
            else:
                idx = e - self.num_h
                r, c = divmod(idx, C + 1)
                self.edge_info.append(("V", r, c))

        # Cell to 4 edge indices (top, bottom, left, right)
        self.cell_edges: list[list[tuple[int, int, int, int]]] = []
        for r in range(R):
            row = []
            for c in range(C):
                top = self.h_idx(r, c)
                bottom = self.h_idx(r + 1, c)
                left = self.v_idx(r, c)
                right = self.v_idx(r, c + 1)
                row.append((top, bottom, left, right))
            self.cell_edges.append(row)

        # Vertices and incident edges
        self.vertex_edges: list[list[int]] = [[] for _ in range(self.num_vertices)]
        self.edge_endpoints: list[tuple[int, int]] = []

        for e in range(self.total_edges):
            kind, r, c = self.edge_info[e]
            if kind == "H":
                u = self.v_coord_to_idx(r, c)
                v = self.v_coord_to_idx(r, c + 1)
            else:
                u = self.v_coord_to_idx(r, c)
                v = self.v_coord_to_idx(r + 1, c)
            self.edge_endpoints.append((u, v))
            self.vertex_edges[u].append(e)
            self.vertex_edges[v].append(e)

    def h_idx(self, r: int, c: int) -> int:
        return r * self.C + c

    def v_idx(self, r: int, c: int) -> int:
        return self.num_h + r * (self.C + 1) + c

    def v_coord_to_idx(self, vr: int, vc: int) -> int:
        return vr * (self.C + 1) + vc

    def solve(self, max_solutions: int = 2) -> list[list[int]]:
        """Find up to max_solutions solutions. Returns list of edge assignments (0 or 1)."""
        edge_state = [-1] * self.total_edges
        solutions: list[list[int]] = []

        if not self._propagate(edge_state):
            return []

        self._backtrack(edge_state, solutions, max_solutions)
        return solutions

    def _propagate(self, edge_state: list[int]) -> bool:
        changed = True
        while changed:
            changed = False

            # 1. Clue propagation
            for r in range(self.R):
                for c in range(self.C):
                    clue = self.clues[r][c]
                    if clue is None or clue < 0:
                        continue
                    edges = self.cell_edges[r][c]
                    lines = 0
                    unset = []
                    for e in edges:
                        s = edge_state[e]
                        if s == 1:
                            lines += 1
                        elif s == -1:
                            unset.append(e)

                    if lines > clue or lines + len(unset) < clue:
                        return False
                    if lines == clue and unset:
                        for e in unset:
                            edge_state[e] = 0
                            changed = True
                    elif lines + len(unset) == clue and unset:
                        for e in unset:
                            edge_state[e] = 1
                            changed = True

            # 2. Vertex degree propagation
            for v in range(self.num_vertices):
                incident = self.vertex_edges[v]
                lines = 0
                unset = []
                for e in incident:
                    s = edge_state[e]
                    if s == 1:
                        lines += 1
                    elif s == -1:
                        unset.append(e)

                if lines > 2:
                    return False
                if lines == 2 and unset:
                    for e in unset:
                        edge_state[e] = 0
                        changed = True
                elif lines == 1:
                    if len(unset) == 0:
                        return False
                    elif len(unset) == 1:
                        edge_state[unset[0]] = 1
                        changed = True
                elif lines == 0:
                    if len(unset) == 1:
                        edge_state[unset[0]] = 0
                        changed = True

            # 3. Sub-loop prevention
            components, degrees, loops = self._get_line_graph(edge_state)
            if loops:
                total_lines = sum(1 for s in edge_state if s == 1)
                loop_edges_count = sum(len(comp) for comp in loops)
                if len(loops) > 1 or total_lines > loop_edges_count:
                    return False
                if not self._all_clues_satisfied(edge_state):
                    return False

        return True

    def _get_line_graph(self, edge_state: list[int]):
        adj: list[list[int]] = [[] for _ in range(self.num_vertices)]
        degrees = [0] * self.num_vertices
        for e in range(self.total_edges):
            if edge_state[e] == 1:
                u, v = self.edge_endpoints[e]
                adj[u].append(v)
                adj[v].append(u)
                degrees[u] += 1
                degrees[v] += 1

        visited = set()
        components = []
        loops = []
        for i in range(self.num_vertices):
            if degrees[i] > 0 and i not in visited:
                comp = []
                q = deque([i])
                visited.add(i)
                is_cycle = True
                while q:
                    u = q.popleft()
                    comp.append(u)
                    if degrees[u] != 2:
                        is_cycle = False
                    for nxt in adj[u]:
                        if nxt not in visited:
                            visited.add(nxt)
                            q.append(nxt)
                components.append(comp)
                if is_cycle and len(comp) >= 4:
                    loops.append(comp)
        return components, degrees, loops

    def _all_clues_satisfied(self, edge_state: list[int]) -> bool:
        for r in range(self.R):
            for c in range(self.C):
                clue = self.clues[r][c]
                if clue is not None and clue >= 0:
                    cnt = sum(1 for e in self.cell_edges[r][c] if edge_state[e] == 1)
                    if cnt != clue:
                        return False
        return True

    def _is_complete_solution(self, edge_state: list[int]) -> bool:
        if any(s == -1 for s in edge_state):
            return False
        deg = [0] * self.num_vertices
        total_lines = 0
        for e in range(self.total_edges):
            if edge_state[e] == 1:
                total_lines += 1
                u, v = self.edge_endpoints[e]
                deg[u] += 1
                deg[v] += 1

        if total_lines == 0 or any(d not in (0, 2) for d in deg):
            return False

        components, _, loops = self._get_line_graph(edge_state)
        if len(components) != 1 or len(loops) != 1:
            return False

        return self._all_clues_satisfied(edge_state)

    def _backtrack(self, edge_state: list[int], solutions: list[list[int]], max_solutions: int):
        if len(solutions) >= max_solutions:
            return

        best_edge = -1
        min_score = 999
        for e in range(self.total_edges):
            if edge_state[e] == -1:
                u, v = self.edge_endpoints[e]
                u_deg = sum(1 for ie in self.vertex_edges[u] if edge_state[ie] == 1)
                v_deg = sum(1 for ie in self.vertex_edges[v] if edge_state[ie] == 1)
                score = 0
                if u_deg == 1:
                    score += 10
                if v_deg == 1:
                    score += 10
                if score > min_score or best_edge == -1:
                    min_score = score
                    best_edge = e
                    if score >= 10:
                        break

        if best_edge == -1:
            if self._is_complete_solution(edge_state):
                solutions.append(list(edge_state))
            return

        for choice in (1, 0):
            st = list(edge_state)
            st[best_edge] = choice
            if self._propagate(st):
                self._backtrack(st, solutions, max_solutions)
                if len(solutions) >= max_solutions:
                    return


def _orthogonal_neighbors(cell: tuple[int, int], R: int, C: int):
    r, c = cell
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < R and 0 <= nc < C:
            yield (nr, nc)


def _is_well_composed(S: set[tuple[int, int]], R: int, C: int) -> bool:
    for r in range(R - 1):
        for c in range(C - 1):
            tl = (r, c) in S
            tr = (r, c + 1) in S
            bl = (r + 1, c) in S
            br = (r + 1, c + 1) in S
            if (tl and br and not tr and not bl) or (tr and bl and not tl and not br):
                return False
    return True


def _complement_connected(S: set[tuple[int, int]], R: int, C: int) -> bool:
    visited = set()
    start = (-1, -1)
    q = deque([start])
    visited.add(start)

    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if -1 <= nr <= R and -1 <= nc <= C:
                if (nr, nc) not in visited:
                    if 0 <= nr < R and 0 <= nc < C and (nr, nc) in S:
                        continue
                    visited.add((nr, nc))
                    q.append((nr, nc))

    for r in range(R):
        for c in range(C):
            if (r, c) not in S and (r, c) not in visited:
                return False
    return True


def generate_organic_loop(R: int, C: int, rng: random.Random):
    """
    Generate an organic simply-connected region boundary forming a single closed loop.
    """
    total_cells = R * C
    target_size = rng.randint(total_cells // 3, total_cells * 2 // 3)

    for _ in range(300):
        start = (rng.randint(0, R - 1), rng.randint(0, C - 1))
        S = {start}
        frontier = list(_orthogonal_neighbors(start, R, C))

        while len(S) < target_size and frontier:
            idx = rng.randint(0, len(frontier) - 1)
            candidate = frontier.pop(idx)
            if candidate in S:
                continue

            test_S = S | {candidate}
            if not _is_well_composed(test_S, R, C):
                continue
            if not _complement_connected(test_S, R, C):
                continue

            S = test_S
            for nbr in _orthogonal_neighbors(candidate, R, C):
                if nbr not in S and nbr not in frontier:
                    frontier.append(nbr)

        if len(S) >= 5 and _is_well_composed(S, R, C) and _complement_connected(S, R, C):
            H = [[0] * C for _ in range(R + 1)]
            V = [[0] * (C + 1) for _ in range(R)]

            for r in range(R + 1):
                for c in range(C):
                    cell_above = (r - 1, c) if r > 0 else None
                    cell_below = (r, c) if r < R else None
                    in_above = cell_above in S if cell_above else False
                    in_below = cell_below in S if cell_below else False
                    if in_above != in_below:
                        H[r][c] = 1

            for r in range(R):
                for c in range(C + 1):
                    cell_left = (r, c - 1) if c > 0 else None
                    cell_right = (r, c) if c < C else None
                    in_left = cell_left in S if cell_left else False
                    in_right = cell_right in S if cell_right else False
                    if in_left != in_right:
                        V[r][c] = 1

            # Verify active vertices
            active_vertices = set()
            valid = True
            for vr in range(R + 1):
                for vc in range(C + 1):
                    deg = 0
                    if vr > 0 and V[vr - 1][vc]: deg += 1
                    if vr < R and V[vr][vc]: deg += 1
                    if vc > 0 and H[vr][vc - 1]: deg += 1
                    if vc < C and H[vr][vc]: deg += 1
                    if deg not in (0, 2):
                        valid = False
                        break
                    if deg == 2:
                        active_vertices.add((vr, vc))
                if not valid:
                    break

            if valid and len(active_vertices) >= 8:
                # Check connected component
                start_v = next(iter(active_vertices))
                visited = set()
                q = deque([start_v])
                visited.add(start_v)
                while q:
                    vr, vc = q.popleft()
                    nbrs = []
                    if vr > 0 and V[vr - 1][vc]: nbrs.append((vr - 1, vc))
                    if vr < R and V[vr][vc]: nbrs.append((vr + 1, vc))
                    if vc > 0 and H[vr][vc - 1]: nbrs.append((vr, vc - 1))
                    if vc < C and H[vr][vc]: nbrs.append((vr, vc + 1))
                    for nbr in nbrs:
                        if nbr not in visited:
                            visited.add(nbr)
                            q.append(nbr)

                if visited == active_vertices:
                    return H, V, S

    raise RuntimeError("Failed to generate organic Slitherlink loop")


def generate(seed: int = 0, size: int = DEFAULT_GRID_SIZE) -> tuple[dict[str, Any], dict[str, Any]]:
    """
    Generate a Slitherlink puzzle and its unique solution.

    Returns:
    (puzzle, solution)
    puzzle = {
        "size": size,
        "rows": size,
        "cols": size,
        "clues": [[int or None, ...], ...],
        "rules": RULES,
    }
    solution = {
        "horizontal": H,  # (size + 1) × size list of 0/1
        "vertical": V,    # size × (size + 1) list of 0/1
    }
    """
    rng = random.Random(seed)
    R, C = size, size

    H, V, _ = generate_organic_loop(R, C, rng)

    # Initial clues from the full loop
    clues: list[list[Optional[int]]] = []
    for r in range(R):
        row: list[Optional[int]] = []
        for c in range(C):
            cnt = H[r][c] + H[r + 1][c] + V[r][c] + V[r][c + 1]
            row.append(cnt)
        clues.append(row)

    # Reduction phase: remove clues while strictly preserving uniqueness
    coords = [(r, c) for r in range(R) for c in range(C)]
    rng.shuffle(coords)

    for r, c in coords:
        orig = clues[r][c]
        clues[r][c] = None

        solver = SlitherlinkSolver(R, C, clues)
        sols = solver.solve(max_solutions=2)
        if len(sols) != 1:
            # Revert removal if uniqueness lost
            clues[r][c] = orig

    puzzle = {
        "size": size,
        "rows": R,
        "cols": C,
        "clues": clues,
        "rules": RULES,
    }

    solution = {
        "horizontal": H,
        "vertical": V,
    }

    return puzzle, solution


def is_valid_solution(
    puzzle: dict[str, Any],
    attempt: Any,
    solution: Optional[dict[str, Any]] = None,
) -> bool:
    """
    Validate that `attempt` solves `puzzle`.

    Checks:
    1. Edge matrix shape and type.
    2. Exact match with precomputed solution (if available).
    3. Structural validity:
       - Every vertex degree is either 0 or 2.
       - The active edges form a single connected cycle.
       - Every cell clue is satisfied.
    """
    if not isinstance(puzzle, dict):
        return False

    R = puzzle.get("rows", puzzle.get("size", DEFAULT_GRID_SIZE))
    C = puzzle.get("cols", puzzle.get("size", DEFAULT_GRID_SIZE))
    clues = puzzle.get("clues")

    if not clues or not isinstance(clues, list):
        return False

    # Extract horizontal and vertical edge grids
    H_attempt: Optional[list[list[int]]] = None
    V_attempt: Optional[list[list[int]]] = None

    if isinstance(attempt, dict):
        h = attempt.get("horizontal")
        v = attempt.get("vertical")
        if isinstance(h, list) and isinstance(v, list):
            try:
                H_attempt = [[1 if cell else 0 for cell in row] for row in h]
                V_attempt = [[1 if cell else 0 for cell in row] for row in v]
            except Exception:
                return False

    if H_attempt is None or V_attempt is None:
        return False

    # Check dimensions
    if len(H_attempt) != R + 1 or any(len(row) != C for row in H_attempt):
        return False
    if len(V_attempt) != R or any(len(row) != C + 1 for row in V_attempt):
        return False

    # Quick check if exact match to precomputed solution
    if solution and isinstance(solution, dict):
        sol_h = solution.get("horizontal")
        sol_v = solution.get("vertical")
        if sol_h == H_attempt and sol_v == V_attempt:
            return True

    # Validate cell clues
    for r in range(R):
        for c in range(C):
            clue = clues[r][c]
            if clue is not None and clue >= 0:
                cnt = H_attempt[r][c] + H_attempt[r + 1][c] + V_attempt[r][c] + V_attempt[r][c + 1]
                if cnt != clue:
                    return False

    # Validate vertex degrees
    num_vertices = (R + 1) * (C + 1)
    active_vertices = set()
    total_lines = 0

    for vr in range(R + 1):
        for vc in range(C + 1):
            deg = 0
            if vr > 0 and V_attempt[vr - 1][vc]: deg += 1
            if vr < R and V_attempt[vr][vc]: deg += 1
            if vc > 0 and H_attempt[vr][vc - 1]: deg += 1
            if vc < C and H_attempt[vr][vc]: deg += 1

            if deg not in (0, 2):
                return False
            if deg == 2:
                active_vertices.add((vr, vc))

    total_lines = sum(sum(row) for row in H_attempt) + sum(sum(row) for row in V_attempt)
    if total_lines == 0 or len(active_vertices) < 4:
        return False

    # Number of vertices in a simple cycle equals the number of edges
    if len(active_vertices) != total_lines:
        return False

    # Validate single connected loop
    start_v = next(iter(active_vertices))
    visited = set()
    q = deque([start_v])
    visited.add(start_v)

    while q:
        vr, vc = q.popleft()
        nbrs = []
        if vr > 0 and V_attempt[vr - 1][vc]: nbrs.append((vr - 1, vc))
        if vr < R and V_attempt[vr][vc]: nbrs.append((vr + 1, vc))
        if vc > 0 and H_attempt[vr][vc - 1]: nbrs.append((vr, vc - 1))
        if vc < C and H_attempt[vr][vc]: nbrs.append((vr, vc + 1))
        for nbr in nbrs:
            if nbr not in visited:
                visited.add(nbr)
                q.append(nbr)

    if visited != active_vertices:
        return False

    return True
