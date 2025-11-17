"""Utilidades compartilhadas pelas ferramentas de exportação."""
from __future__ import annotations

MAP_NAME_HINTS = {
    0: "Lorencia",
    1: "Dungeon",
    2: "Devias",
    3: "Noria",
    4: "Lost Tower",
    6: "Stadium/Arena",
    7: "Atlans",
    8: "Tarkan",
    9: "Devil Square",
    10: "Icarus",
    11: "Blood Castle 1",
    12: "Blood Castle 2",
    13: "Blood Castle 3",
    14: "Blood Castle 4",
    15: "Blood Castle 5",
    16: "Blood Castle 6",
    17: "Blood Castle 7",
    18: "Chaos Castle 1",
    19: "Chaos Castle 2",
    20: "Chaos Castle 3",
    21: "Chaos Castle 4",
    22: "Chaos Castle 5",
    23: "Chaos Castle 6",
    24: "Kalima 1",
    25: "Kalima 2",
    26: "Kalima 3",
    27: "Kalima 4",
    28: "Kalima 5",
    29: "Kalima 6",
    30: "Loren Valley",
    31: "Land of Trials",
    33: "Aida",
    34: "Crywolf Fortress",
    36: "Lost Kalima",
    37: "Kanturu 1",
    38: "Kanturu 2",
    39: "Kanturu 3",
    41: "Balgas Barrack",
    42: "Balgas Refuge",
    45: "Illusion Temple 1",
    46: "Illusion Temple 2",
    47: "Illusion Temple 3",
    48: "Illusion Temple 4",
    49: "Illusion Temple 5",
    50: "Illusion Temple 6",
    51: "Elbeland",
    52: "Blood Castle (Master)",
    53: "Chaos Castle (Master)",
    56: "Swamp of Calmness",
    57: "Raklion",
    58: "Raklion Boss",
    62: "Santa Village",
    63: "PK Field",
    64: "Duel Arena",
    65: "Doppelganger 1",
    66: "Doppelganger 2",
    67: "Doppelganger 3",
    68: "Doppelganger 4",
    69: "Empire Guardian 1",
    70: "Empire Guardian 2",
    71: "Empire Guardian 3",
    72: "Empire Guardian 4",
    79: "Loren Market",
    80: "Karutan 1",
    81: "Karutan 2",
}


def map_display_name(world_id: int) -> str:
    """Retorna um nome amigável para o ID do mapa."""
    return MAP_NAME_HINTS.get(world_id, f"World{world_id}")


def parse_optional_int(token: str | None) -> int | None:
    """Converte strings numéricas ou '*' para inteiros/None."""
    if token is None:
        return None
    token = token.strip()
    if not token or token == "*":
        return None
    return int(token)
