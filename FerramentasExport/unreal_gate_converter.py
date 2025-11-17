#!/usr/bin/env python3
"""Converte Gate.txt e Move.txt em tabelas prontas para UE5."""
from __future__ import annotations

import argparse
import csv
import json
import shlex
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

from common import map_display_name, parse_optional_int


@dataclass
class GateEntry:
    gate_id: int
    flag: int
    map_id: int
    x1: int
    y1: int
    x2: int
    y2: int
    target_gate: int
    target_dir: int
    min_level: int | None
    max_level: int | None
    min_reset: int | None
    max_reset: int | None
    account_level: int | None
    comment: str | None


@dataclass
class MoveEntry:
    move_id: int
    name: str
    cost: int
    min_level: int | None
    max_level: int | None
    min_reset: int | None
    max_reset: int | None
    account_level: int | None
    gate_id: int


def split_comment(line: str) -> tuple[str, str | None]:
    if "//" in line:
        data, comment = line.split("//", 1)
        return data.strip(), comment.strip()
    return line.strip(), None


def parse_gate_file(path: Path, *, encoding: str = "latin-1") -> List[GateEntry]:
    gates: List[GateEntry] = []
    with path.open("r", encoding=encoding, errors="ignore") as handle:
        for raw_line in handle:
            data, comment = split_comment(raw_line)
            if not data or data.startswith("//"):
                continue
            tokens = data.split()
            if not tokens:
                continue
            try:
                gate_id = int(tokens[0])
            except ValueError:
                continue
            if len(tokens) < 14:
                raise ValueError(f"Linha incompleta em {path}: {raw_line.rstrip()}")
            gate = GateEntry(
                gate_id=gate_id,
                flag=int(tokens[1]),
                map_id=int(tokens[2]),
                x1=int(tokens[3]),
                y1=int(tokens[4]),
                x2=int(tokens[5]),
                y2=int(tokens[6]),
                target_gate=int(tokens[7]),
                target_dir=int(tokens[8]),
                min_level=parse_optional_int(tokens[9]),
                max_level=parse_optional_int(tokens[10]),
                min_reset=parse_optional_int(tokens[11]),
                max_reset=parse_optional_int(tokens[12]),
                account_level=parse_optional_int(tokens[13]),
                comment=comment,
            )
            gates.append(gate)
    return gates


def parse_move_file(path: Path, *, encoding: str = "latin-1") -> List[MoveEntry]:
    moves: List[MoveEntry] = []
    with path.open("r", encoding=encoding, errors="ignore") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("//"):
                continue
            if line.lower() == "end":
                break
            tokens = shlex.split(line)
            if len(tokens) < 9:
                raise ValueError(f"Linha incompleta em {path}: {raw_line.rstrip()}")
            move = MoveEntry(
                move_id=int(tokens[0]),
                name=tokens[1],
                cost=int(tokens[2]),
                min_level=parse_optional_int(tokens[3]),
                max_level=parse_optional_int(tokens[4]),
                min_reset=parse_optional_int(tokens[5]),
                max_reset=parse_optional_int(tokens[6]),
                account_level=parse_optional_int(tokens[7]),
                gate_id=int(tokens[8]),
            )
            moves.append(move)
    return moves


def to_cm(value: int | None, tile_size: float) -> float | None:
    if value is None:
        return None
    return float(value) * tile_size


def gate_payload(gate: GateEntry, *, tile_size: float) -> dict:
    payload = {
        "gate_id": gate.gate_id,
        "flag": gate.flag,
        "map_id": gate.map_id,
        "map_name": map_display_name(gate.map_id),
        "x1": gate.x1,
        "y1": gate.y1,
        "x2": gate.x2,
        "y2": gate.y2,
        "x1_cm": to_cm(gate.x1, tile_size),
        "y1_cm": to_cm(gate.y1, tile_size),
        "x2_cm": to_cm(gate.x2, tile_size),
        "y2_cm": to_cm(gate.y2, tile_size),
        "target_gate": gate.target_gate,
        "target_dir": gate.target_dir,
        "min_level": gate.min_level,
        "max_level": gate.max_level,
        "min_reset": gate.min_reset,
        "max_reset": gate.max_reset,
        "account_level": gate.account_level,
        "comment": gate.comment,
    }
    payload["width_tiles"] = abs(gate.x2 - gate.x1) + 1
    payload["height_tiles"] = abs(gate.y2 - gate.y1) + 1
    payload["width_cm"] = payload["width_tiles"] * tile_size
    payload["height_cm"] = payload["height_tiles"] * tile_size
    return payload


def move_payload(move: MoveEntry, gate_lookup: dict[int, GateEntry], *, tile_size: float) -> dict:
    gate = gate_lookup.get(move.gate_id)
    payload = {
        "move_id": move.move_id,
        "name": move.name,
        "cost": move.cost,
        "min_level": move.min_level,
        "max_level": move.max_level,
        "min_reset": move.min_reset,
        "max_reset": move.max_reset,
        "account_level": move.account_level,
        "gate_id": move.gate_id,
        "resolved_gate": gate_payload(gate, tile_size=tile_size) if gate else None,
    }
    return payload


def write_json(
    gates: Sequence[GateEntry],
    moves: Sequence[MoveEntry],
    *,
    gate_source: Path,
    move_source: Path | None,
    output: Path,
    tile_size: float,
    pretty: bool,
) -> None:
    gate_lookup = {gate.gate_id: gate for gate in gates}
    payload = {
        "meta": {
            "gate_source": str(gate_source),
            "move_source": str(move_source) if move_source else None,
            "gate_count": len(gates),
            "move_count": len(moves),
            "tile_size_cm": tile_size,
            "ue5_hint": "Use Gate para volumes e Move para fast-travel widgets.",
        },
        "gates": [gate_payload(gate, tile_size=tile_size) for gate in gates],
        "moves": [
            move_payload(move, gate_lookup, tile_size=tile_size) for move in moves
        ],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2 if pretty else None)
        if not pretty:
            handle.write("\n")


def write_csv(
    gates: Sequence[GateEntry],
    moves: Sequence[MoveEntry],
    *,
    output_dir: Path,
    base_name: str,
    tile_size: float,
) -> None:
    gate_path = output_dir / f"{base_name}-gates.ue5.csv"
    move_path = output_dir / f"{base_name}-moves.ue5.csv"
    gate_columns = [
        "gate_id",
        "flag",
        "map_id",
        "map_name",
        "x1",
        "y1",
        "x2",
        "y2",
        "x1_cm",
        "y1_cm",
        "x2_cm",
        "y2_cm",
        "width_tiles",
        "height_tiles",
        "width_cm",
        "height_cm",
        "target_gate",
        "target_dir",
        "min_level",
        "max_level",
        "min_reset",
        "max_reset",
        "account_level",
        "comment",
    ]
    move_columns = [
        "move_id",
        "name",
        "cost",
        "min_level",
        "max_level",
        "min_reset",
        "max_reset",
        "account_level",
        "gate_id",
        "gate_map",
        "gate_x1",
        "gate_y1",
        "gate_x2",
        "gate_y2",
    ]
    gate_path.parent.mkdir(parents=True, exist_ok=True)
    with gate_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=gate_columns)
        writer.writeheader()
        for gate in gates:
            payload = gate_payload(gate, tile_size=tile_size)
            writer.writerow(payload)
    if moves:
        gate_lookup = {gate.gate_id: gate for gate in gates}
        with move_path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=move_columns)
            writer.writeheader()
            for move in moves:
                gate = gate_lookup.get(move.gate_id)
                writer.writerow(
                    {
                        "move_id": move.move_id,
                        "name": move.name,
                        "cost": move.cost,
                        "min_level": move.min_level,
                        "max_level": move.max_level,
                        "min_reset": move.min_reset,
                        "max_reset": move.max_reset,
                        "account_level": move.account_level,
                        "gate_id": move.gate_id,
                        "gate_map": map_display_name(gate.map_id) if gate else None,
                        "gate_x1": gate.x1 if gate else None,
                        "gate_y1": gate.y1 if gate else None,
                        "gate_x2": gate.x2 if gate else None,
                        "gate_y2": gate.y2 if gate else None,
                    }
                )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Unifica Gate.txt e Move.txt em DataTables para zonas/portais no UE5."
    )
    parser.add_argument("gate", help="Caminho para o Gate.txt oficial do servidor.")
    parser.add_argument(
        "--move",
        help="Caminho para o Move.txt (ou MoveReq) correspondente. Opcional, mas recomendado.",
    )
    parser.add_argument(
        "--formats",
        nargs="+",
        choices=("json", "csv"),
        default=["json"],
        help="Formatos desejados (padrão: json).",
    )
    parser.add_argument(
        "--output-dir",
        help="Pasta de saída (padrão: mesma pasta do Gate.txt).",
    )
    parser.add_argument(
        "--base-name",
        help="Nome base dos arquivos exportados (padrão: gates).",
    )
    parser.add_argument(
        "--encoding",
        default="latin-1",
        help="Codificação utilizada para ler os arquivos (padrão: latin-1).",
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
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    gate_path = Path(args.gate).expanduser().resolve()
    if not gate_path.exists():
        parser.error(f"Gate.txt não encontrado: {gate_path}")
    move_path = Path(args.move).expanduser().resolve() if args.move else None
    if move_path and not move_path.exists():
        parser.error(f"Move.txt não encontrado: {move_path}")
    gates = parse_gate_file(gate_path, encoding=args.encoding)
    moves = (
        parse_move_file(move_path, encoding=args.encoding)
        if move_path is not None
        else []
    )
    if not gates:
        parser.error("Nenhum gate encontrado.")
    output_dir = (
        Path(args.output_dir).expanduser() if args.output_dir else gate_path.parent
    )
    output_dir.mkdir(parents=True, exist_ok=True)
    base_name = args.base_name or "gates"
    for fmt in args.formats:
        if fmt == "json":
            destination = output_dir / f"{base_name}.ue5.json"
            write_json(
                gates,
                moves,
                gate_source=gate_path,
                move_source=move_path,
                output=destination,
                tile_size=args.tile_size,
                pretty=args.pretty,
            )
            print(f"JSON salvo em {destination}")
        elif fmt == "csv":
            write_csv(
                gates,
                moves,
                output_dir=output_dir,
                base_name=base_name,
                tile_size=args.tile_size,
            )
            print(f"CSV salvo em {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
