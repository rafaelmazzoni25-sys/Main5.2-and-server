#!/usr/bin/env python3
"""Converte MonsterSetBase.txt em DataTables compatíveis com UE5."""
from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

from common import map_display_name

SPAWN_KIND = {
    0: "single_point",
    1: "box",
    2: "random_box",
    3: "event_box",
    4: "script_box",
}


@dataclass
class SpawnEntry:
    section: int
    spawn_kind: str
    monster_class: int
    map_id: int
    range_value: int
    x: int
    y: int
    tx: int | None
    ty: int | None
    direction: int
    spawn_count: int
    value: int | None
    comment: str | None


def split_comment(line: str) -> tuple[str, str | None]:
    if "//" in line:
        data, comment = line.split("//", 1)
        return data.strip(), comment.strip()
    return line.strip(), None


def parse_section_line(line: str) -> int | None:
    line = line.strip()
    if not line or line.startswith("//"):
        return None
    try:
        return int(line)
    except ValueError:
        return None


def parse_monster_set_base(
    path: Path,
    *,
    encoding: str = "latin-1",
    allowed_maps: set[int] | None = None,
    allowed_types: set[int] | None = None,
) -> List[SpawnEntry]:
    entries: List[SpawnEntry] = []
    section: int | None = None
    with path.open("r", encoding=encoding, errors="ignore") as handle:
        for raw_line in handle:
            data, comment = split_comment(raw_line)
            if not data:
                continue
            if data.lower() == "end":
                section = None
                continue
            if section is None:
                new_section = parse_section_line(data)
                if new_section is not None:
                    section = new_section
                continue
            if data.startswith("//"):
                continue
            tokens = data.split()
            if not tokens:
                continue
            try:
                numbers = [int(token) for token in tokens]
            except ValueError as exc:  # pragma: no cover - diagnostics
                raise ValueError(f"Linha inválida em {path}: {raw_line.rstrip()}" ) from exc
            spawn_kind = SPAWN_KIND.get(section, "unknown")
            if section in (0, 2):
                if len(numbers) < 6:
                    raise ValueError(f"Esperados 6 números na seção {section}, obtidos {numbers}")
                entry = SpawnEntry(
                    section=section,
                    spawn_kind=spawn_kind,
                    monster_class=numbers[0],
                    map_id=numbers[1],
                    range_value=numbers[2],
                    x=numbers[3],
                    y=numbers[4],
                    tx=None,
                    ty=None,
                    direction=numbers[5],
                    spawn_count=1,
                    value=numbers[6] if len(numbers) > 6 else None,
                    comment=comment,
                )
            elif section in (1, 4):
                if len(numbers) >= 9:
                    entry = SpawnEntry(
                        section=section,
                        spawn_kind=spawn_kind,
                        monster_class=numbers[0],
                        map_id=numbers[1],
                        range_value=numbers[2],
                        x=numbers[3],
                        y=numbers[4],
                        tx=numbers[5],
                        ty=numbers[6],
                        direction=numbers[7],
                        spawn_count=numbers[8],
                        value=numbers[9] if len(numbers) > 9 else None,
                        comment=comment,
                    )
                elif section == 4:
                    entry = SpawnEntry(
                        section=section,
                        spawn_kind=spawn_kind,
                        monster_class=numbers[0],
                        map_id=numbers[1],
                        range_value=numbers[2],
                        x=numbers[3],
                        y=numbers[4],
                        tx=None,
                        ty=None,
                        direction=numbers[5],
                        spawn_count=1,
                        value=numbers[6] if len(numbers) > 6 else None,
                        comment=comment,
                    )
                else:
                    raise ValueError(f"Esperados 9 números na seção {section}, obtidos {numbers}")
            elif section == 3:
                if len(numbers) < 10:
                    raise ValueError(f"Esperados 10 números na seção 3, obtidos {numbers}")
                entry = SpawnEntry(
                    section=section,
                    spawn_kind=spawn_kind,
                    monster_class=numbers[0],
                    map_id=numbers[1],
                    range_value=numbers[2],
                    x=numbers[3],
                    y=numbers[4],
                    tx=numbers[5],
                    ty=numbers[6],
                    direction=numbers[7],
                    spawn_count=numbers[8],
                    value=numbers[9],
                    comment=comment,
                )
            else:
                raise ValueError(f"Seção não suportada: {section}")
            if allowed_types and entry.section not in allowed_types:
                continue
            if allowed_maps and entry.map_id not in allowed_maps:
                continue
            entries.append(entry)
    return entries


def to_cm(value: int | None, tile_size: float) -> float | None:
    if value is None:
        return None
    return float(value) * tile_size


def entry_to_payload(entry: SpawnEntry, *, tile_size: float, uid: str) -> dict:
    payload = {
        "uid": uid,
        "type_id": entry.section,
        "spawn_kind": entry.spawn_kind,
        "monster_class": entry.monster_class,
        "map_id": entry.map_id,
        "map_name": map_display_name(entry.map_id),
        "range": entry.range_value,
        "direction": entry.direction,
        "spawn_count": entry.spawn_count,
        "value": entry.value,
        "comment": entry.comment,
        "position_tiles": {"x": entry.x, "y": entry.y},
        "position_cm": {
            "x": to_cm(entry.x, tile_size),
            "y": to_cm(entry.y, tile_size),
        },
    }
    if entry.tx is not None and entry.ty is not None:
        payload["area_tiles"] = {"x": entry.tx, "y": entry.ty}
        payload["area_cm"] = {
            "x": to_cm(entry.tx, tile_size),
            "y": to_cm(entry.ty, tile_size),
        }
    return payload


def write_json(
    entries: Sequence[SpawnEntry],
    *,
    source: Path,
    output: Path,
    tile_size: float,
    maps: set[int] | None,
    types: set[int] | None,
    pretty: bool,
) -> None:
    spawns = [
        entry_to_payload(entry, tile_size=tile_size, uid=f"msb_{idx:05d}")
        for idx, entry in enumerate(entries)
    ]
    payload = {
        "meta": {
            "source_file": str(source),
            "spawn_count": len(spawns),
            "tile_size_cm": tile_size,
            "maps": sorted(maps) if maps else None,
            "types": sorted(types) if types else None,
            "ue5_hint": "Use a struct com Position/Rotation e gere spawners dinâmicos.",
        },
        "spawns": spawns,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2 if pretty else None)
        if not pretty:
            handle.write("\n")


def write_csv(entries: Sequence[SpawnEntry], *, output: Path, tile_size: float) -> None:
    columns = [
        "uid",
        "type_id",
        "spawn_kind",
        "monster_class",
        "map_id",
        "map_name",
        "range",
        "x",
        "y",
        "x_cm",
        "y_cm",
        "tx",
        "ty",
        "tx_cm",
        "ty_cm",
        "direction",
        "spawn_count",
        "value",
        "comment",
    ]
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for idx, entry in enumerate(entries):
            writer.writerow(
                {
                    "uid": f"msb_{idx:05d}",
                    "type_id": entry.section,
                    "spawn_kind": entry.spawn_kind,
                    "monster_class": entry.monster_class,
                    "map_id": entry.map_id,
                    "map_name": map_display_name(entry.map_id),
                    "range": entry.range_value,
                    "x": entry.x,
                    "y": entry.y,
                    "x_cm": to_cm(entry.x, tile_size),
                    "y_cm": to_cm(entry.y, tile_size),
                    "tx": entry.tx,
                    "ty": entry.ty,
                    "tx_cm": to_cm(entry.tx, tile_size),
                    "ty_cm": to_cm(entry.ty, tile_size),
                    "direction": entry.direction,
                    "spawn_count": entry.spawn_count,
                    "value": entry.value,
                    "comment": entry.comment,
                }
            )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Exporta NPCs/monstros do MonsterSetBase.txt para DataTables (JSON/CSV)."
    )
    parser.add_argument("input", help="Caminho para o MonsterSetBase.txt.")
    parser.add_argument(
        "--formats",
        nargs="+",
        choices=("json", "csv"),
        default=["json"],
        help="Formatos desejados (padrão: json).",
    )
    parser.add_argument(
        "--output-dir",
        help="Pasta onde os arquivos serão salvos (padrão: mesma pasta do arquivo).",
    )
    parser.add_argument(
        "--base-name",
        help="Nome base dos arquivos exportados (padrão: monster_spawns).",
    )
    parser.add_argument(
        "--encoding",
        default="latin-1",
        help="Codificação utilizada para ler o arquivo (padrão: latin-1).",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Gera JSON com indentação legível.",
    )
    parser.add_argument(
        "--tile-size",
        type=float,
        default=100.0,
        help="Tamanho de cada tile em centímetros (padrão: 100).",
    )
    parser.add_argument(
        "--maps",
        type=int,
        nargs="+",
        help="Filtra apenas os MapNumber informados.",
    )
    parser.add_argument(
        "--types",
        type=int,
        nargs="+",
        help="Filtra apenas os tipos de seção (0-4).",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    input_path = Path(args.input).expanduser().resolve()
    if not input_path.exists():
        parser.error(f"Arquivo não encontrado: {input_path}")
    allowed_maps = set(args.maps) if args.maps else None
    allowed_types = set(args.types) if args.types else None
    entries = parse_monster_set_base(
        input_path,
        encoding=args.encoding,
        allowed_maps=allowed_maps,
        allowed_types=allowed_types,
    )
    if not entries:
        parser.error("Nenhum registro encontrado com os filtros especificados.")
    output_dir = (
        Path(args.output_dir).expanduser() if args.output_dir else input_path.parent
    )
    output_dir.mkdir(parents=True, exist_ok=True)
    base_name = args.base_name or "monster_spawns"
    for fmt in args.formats:
        if fmt == "json":
            destination = output_dir / f"{base_name}.ue5.json"
            write_json(
                entries,
                source=input_path,
                output=destination,
                tile_size=args.tile_size,
                maps=allowed_maps,
                types=allowed_types,
                pretty=args.pretty,
            )
            print(f"JSON salvo em {destination}")
        elif fmt == "csv":
            destination = output_dir / f"{base_name}.ue5.csv"
            write_csv(entries, output=destination, tile_size=args.tile_size)
            print(f"CSV salvo em {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
