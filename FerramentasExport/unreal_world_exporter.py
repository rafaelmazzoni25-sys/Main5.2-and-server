#!/usr/bin/env python3
"""Ferramenta de exportação dos mundos do cliente para DataTables da UE5."""
from __future__ import annotations

import argparse
import csv
import json
import re
import struct
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple

TERRAIN_SCALE_DEFAULT = 100.0  # definido em Source Main 5.2/source/_define.h
MAP_FOLDER_PATTERN = re.compile(r"World(\d+)", re.IGNORECASE)

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


@dataclass
class WorldInfo:
    world_id: int
    display_name: str
    folder: Path
    obj_files: List[Path]


@dataclass
class ObjectPlacement:
    type_id: int
    position: Tuple[float, float, float]
    rotation: Tuple[float, float, float]
    scale: float


def map_display_name(world_id: int) -> str:
    return MAP_NAME_HINTS.get(world_id, f"World{world_id}")


def detect_data_root(root_arg: Optional[str]) -> Path:
    candidates: List[Path]
    if root_arg:
        base = Path(root_arg).expanduser().resolve()
        candidates = [base, base / "Data"]
    else:
        base = Path.cwd()
        candidates = [base, base / "Data"]

    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    raise FileNotFoundError(
        "Não foi possível localizar a pasta Data. Utilize --root para apontar para o cliente." 
    )


def discover_worlds(data_root: Path) -> List[WorldInfo]:
    worlds: List[WorldInfo] = []
    if not data_root.exists():
        return worlds

    for entry in sorted(data_root.iterdir()):
        if not entry.is_dir():
            continue
        match = MAP_FOLDER_PATTERN.match(entry.name)
        if not match:
            continue
        world_id = int(match.group(1))
        obj_candidates = sorted(
            p for p in entry.glob("*.obj") if "terrain" in p.name.lower()
        )
        worlds.append(
            WorldInfo(
                world_id=world_id,
                display_name=map_display_name(world_id),
                folder=entry,
                obj_files=obj_candidates,
            )
        )
    return sorted(worlds, key=lambda w: w.world_id)


def choose_default_obj(world: WorldInfo) -> Optional[Path]:
    preferred = world.folder / f"EncTerrain{world.world_id}.obj"
    if preferred.exists():
        return preferred
    for candidate in world.obj_files:
        if candidate.exists():
            return candidate
    return None


def map_file_decrypt(data: bytes) -> bytes:
    key = [0xD1, 0x73, 0x52, 0xF6, 0xD2, 0x9A, 0xCB, 0x27, 0x3E, 0xAF, 0x59, 0x31, 0x37, 0xB3, 0xE7, 0xA2]
    result = bytearray(len(data))
    w_map_key = 0x5E
    for idx, byte in enumerate(data):
        result[idx] = ((byte ^ key[idx % 16]) - w_map_key) & 0xFF
        w_map_key = (byte + 0x3D) & 0xFF
    return bytes(result)


def parse_objects(payload: bytes) -> Tuple[int, List[ObjectPlacement]]:
    if len(payload) < 4:
        raise ValueError("Arquivo .obj muito pequeno para conter cabeçalho válido.")
    version = payload[0]
    map_id = payload[1]
    count = int.from_bytes(payload[2:4], "little", signed=False)
    offset = 4
    size_per_object = struct.calcsize("<h7f")
    objects: List[ObjectPlacement] = []
    for _ in range(count):
        if offset + size_per_object > len(payload):
            raise ValueError("Dados truncados: não há bytes suficientes para todos os objetos.")
        type_id, px, py, pz, ax, ay, az, scale = struct.unpack_from("<h7f", payload, offset)
        offset += size_per_object
        objects.append(
            ObjectPlacement(
                type_id=type_id,
                position=(px, py, pz),
                rotation=(ax, ay, az),
                scale=scale,
            )
        )
    return map_id, objects


def convert_position(mu_position: Tuple[float, float, float], *, tile_size_cm: float, terrain_scale: float) -> Tuple[float, float, float]:
    return tuple((coord / terrain_scale) * tile_size_cm for coord in mu_position)


def placement_to_dict(
    placement: ObjectPlacement,
    *,
    tile_size_cm: float,
    terrain_scale: float,
) -> dict:
    px, py, pz = convert_position(placement.position, tile_size_cm=tile_size_cm, terrain_scale=terrain_scale)
    rx, ry, rz = placement.rotation
    return {
        "type_id": placement.type_id,
        "position_cm": {"x": px, "y": py, "z": pz},
        "rotation_deg": {"pitch": rx, "yaw": ry, "roll": rz},
        "scale": placement.scale,
    }


def export_json(
    *,
    output_path: Path,
    meta: dict,
    placements: Sequence[ObjectPlacement],
    tile_size_cm: float,
    terrain_scale: float,
) -> None:
    payload = {
        "meta": meta,
        "objects": [
            placement_to_dict(p, tile_size_cm=tile_size_cm, terrain_scale=terrain_scale)
            for p in placements
        ],
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def export_csv(
    *,
    output_path: Path,
    placements: Sequence[ObjectPlacement],
    tile_size_cm: float,
    terrain_scale: float,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow([
            "type_id",
            "pos_x_cm",
            "pos_y_cm",
            "pos_z_cm",
            "pitch_deg",
            "yaw_deg",
            "roll_deg",
            "scale",
        ])
        for placement in placements:
            px, py, pz = convert_position(placement.position, tile_size_cm=tile_size_cm, terrain_scale=terrain_scale)
            rx, ry, rz = placement.rotation
            writer.writerow([placement.type_id, px, py, pz, rx, ry, rz, placement.scale])


def handle_list(args: argparse.Namespace) -> None:
    data_root = detect_data_root(args.root)
    worlds = discover_worlds(data_root)
    if not worlds:
        print(f"Nenhum mundo encontrado em {data_root}")
        return
    print(f"Data root: {data_root}")
    print(f"{'ID':>4}  {'Mapa':<24}  {'Arquivo .obj':<28}  Pasta")
    for world in worlds:
        sample = world.obj_files[0].name if world.obj_files else "(nenhum .obj)"
        print(f"{world.world_id:>4}  {world.display_name:<24}  {sample:<28}  {world.folder}")


def build_meta(
    *,
    world_id: Optional[int],
    detected_map_id: int,
    map_name: str,
    obj_path: Path,
    count: int,
    tile_size_cm: float,
    terrain_scale: float,
) -> dict:
    return {
        "map_id": detected_map_id if detected_map_id >= 0 else world_id,
        "map_name": map_name,
        "source_file": str(obj_path),
        "object_count": count,
        "tile_size_cm": tile_size_cm,
        "terrain_scale": terrain_scale,
    }


def resolve_output_paths(base: Path, world_label: str, formats: Sequence[str]) -> dict:
    outputs = {}
    base = base.expanduser()
    if base.is_dir() or (not base.suffix):
        base.mkdir(parents=True, exist_ok=True)
        if "json" in formats:
            outputs["json"] = base / f"{world_label}.json"
        if "csv" in formats:
            outputs["csv"] = base / f"{world_label}.csv"
    else:
        if len(formats) > 1:
            raise ValueError("Quando vários formatos são solicitados, --output deve ser um diretório.")
        fmt = formats[0]
        outputs[fmt] = base
    return outputs


def handle_export(args: argparse.Namespace) -> None:
    data_root = detect_data_root(args.root)
    worlds = {world.world_id: world for world in discover_worlds(data_root)}
    obj_path: Optional[Path] = Path(args.obj).expanduser().resolve() if args.obj else None
    world_id: Optional[int] = args.world
    world_name = ""

    if world_id is not None and world_id in worlds:
        world = worlds[world_id]
        if obj_path is None:
            obj_path = choose_default_obj(world)
        world_name = world.display_name
    elif world_id is not None and world_id not in worlds and obj_path is None:
        raise SystemExit(f"World {world_id} não encontrado em {data_root}.")

    if obj_path is None:
        raise SystemExit("Informe --world ou --obj para selecionar o arquivo a exportar.")
    if not obj_path.exists():
        raise SystemExit(f"Arquivo {obj_path} não encontrado.")

    if not world_name:
        match = MAP_FOLDER_PATTERN.search(obj_path.as_posix())
        if match:
            world_name = map_display_name(int(match.group(1)))
        elif world_id is not None:
            world_name = map_display_name(world_id)
        else:
            world_name = obj_path.stem

    decrypted = map_file_decrypt(obj_path.read_bytes())
    detected_map_id, placements = parse_objects(decrypted)
    print(f"Arquivo {obj_path} carregado ({len(placements)} objetos, map_id={detected_map_id}).")

    tile_size_cm = args.tile_size
    terrain_scale = args.terrain_scale
    meta = build_meta(
        world_id=world_id,
        detected_map_id=detected_map_id,
        map_name=world_name,
        obj_path=obj_path,
        count=len(placements),
        tile_size_cm=tile_size_cm,
        terrain_scale=terrain_scale,
    )

    outputs = resolve_output_paths(Path(args.output), world_name.replace(" ", "_"), args.formats)
    if "json" in outputs:
        export_json(
            output_path=outputs["json"],
            meta=meta,
            placements=placements,
            tile_size_cm=tile_size_cm,
            terrain_scale=terrain_scale,
        )
        print(f"JSON salvo em {outputs['json']}")
    if "csv" in outputs:
        export_csv(
            output_path=outputs["csv"],
            placements=placements,
            tile_size_cm=tile_size_cm,
            terrain_scale=terrain_scale,
        )
        print(f"CSV salvo em {outputs['csv']}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Exporta objetos de WorldXX.obj para UE5 DataTables.")
    parser.add_argument("--root", help="Pasta raiz do cliente (ou diretamente a pasta Data).")

    subparsers = parser.add_subparsers(dest="command", required=True)

    list_parser = subparsers.add_parser("list", help="Lista os mundos disponíveis.")
    list_parser.set_defaults(func=handle_list)

    export_parser = subparsers.add_parser("export", help="Exporta um arquivo .obj para JSON/CSV.")
    export_parser.add_argument("--world", type=int, help="Identificador do mundo (WorldX).")
    export_parser.add_argument("--obj", help="Caminho direto para um arquivo .obj específico.")
    export_parser.add_argument(
        "--formats",
        nargs="+",
        default=["json"],
        choices=["json", "csv"],
        help="Formatos de saída desejados.",
    )
    export_parser.add_argument(
        "--output",
        default=Path.cwd(),
        help="Arquivo ou pasta onde os resultados serão gravados.",
    )
    export_parser.add_argument(
        "--tile-size",
        type=float,
        default=100.0,
        help="Tamanho de um tile em centímetros na UE5 (padrão 100).",
    )
    export_parser.add_argument(
        "--terrain-scale",
        type=float,
        default=TERRAIN_SCALE_DEFAULT,
        help="Valor original de TERRAIN_SCALE usado pelo cliente (padrão 100).",
    )
    export_parser.set_defaults(func=handle_export)

    return parser


def main(argv: Optional[Sequence[str]] = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
