"""
Noodles – Server Constants
"""

class _PuzzleTypes(dict):
    SUDOKU = "sudoku"
    TANGO = "tango"
    LIGHTS_OUT = "lights_out"
    QUEENS = "queens"
    SLITHERLINK = "slitherlink"

    def __init__(self):
        super().__init__(
            SUDOKU=self.SUDOKU,
            TANGO=self.TANGO,
            LIGHTS_OUT=self.LIGHTS_OUT,
            QUEENS=self.QUEENS,
            SLITHERLINK=self.SLITHERLINK,
        )

    def __getattr__(self, name: str) -> str:
        try:
            return self[name]
        except KeyError:
            raise AttributeError(f"'PUZZLE_TYPES' has no attribute '{name}'")


PUZZLE_TYPES = _PuzzleTypes()

PUZZLES_LIST = [
    PUZZLE_TYPES.SUDOKU,
    PUZZLE_TYPES.TANGO,
    PUZZLE_TYPES.LIGHTS_OUT,
    PUZZLE_TYPES.QUEENS,
    PUZZLE_TYPES.SLITHERLINK,
]
