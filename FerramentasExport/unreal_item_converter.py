#!/usr/bin/env python3
"""Conversor de Item.txt para formatos compatíveis com DataTables da UE5."""
from __future__ import annotations

import argparse
import csv
import json
import shlex
from pathlib import Path
from typing import Iterable, List, Sequence

FIELD_NAMES: Sequence[str] = (
    "index",
    "slot",
    "skill",
    "size_x",
    "size_y",
    "serial",
    "option",
    "drop",
    "name",
    "level",
    "damage_min",
    "damage_max",
    "attack_speed",
    "durability",
    "magic_durability",
    "magic_power",
    "req_level",
    "req_strength",
    "req_agility",
    "req_energy",
    "req_vitality",
    "req_command",
    "type",
    "class_dw",
    "class_dk",
    "class_elf",
    "class_mg",
    "class_dl",
    "class_summoner",
)

INT_FIELDS = {name for name in FIELD_NAMES if name != "name"}


def strip_inline_comment(line: str) -> str:
    result: List[str] = []
    in_quotes = False
    i = 0
    while i < len(line):
        ch = line[i]
        if ch == '"':
            in_quotes = not in_quotes
            result.append(ch)
            i += 1
            continue
        if not in_quotes and ch == '/' and i + 1 < len(line) and line[i + 1] == '/':
            break
        result.append(ch)
        i += 1
    return ''.join(result).strip()


def parse_item_txt(path: Path, *, encoding: str = "latin-1", groups: Sequence[int] | None = None) -> List[dict]:
    allowed_groups = {int(g) for g in groups} if groups else None
    records: List[dict] = []
    current_group: int | None = None
    with path.open("r", encoding=encoding, errors="ignore") as handle:
        for raw_line in handle:
            line = strip_inline_comment(raw_line).strip()
            if not line:
                continue
            if line.lower() == "end":
                current_group = None
                continue
            if current_group is None and line.isdigit():
                current_group = int(line)
                continue
            if current_group is None:
                continue
            if allowed_groups and current_group not in allowed_groups:
                continue
            tokens = shlex.split(line)
            if not tokens:
                continue
            if len(tokens) != len(FIELD_NAMES):
                raise ValueError(
                    f"Linha inválida em {path} (grupo {current_group}): esperados {len(FIELD_NAMES)} campos, recebido {len(tokens)}"
                )
            entry: dict[str, int | str] = {"group": current_group}
            for name, token in zip(FIELD_NAMES, tokens):
                if name in INT_FIELDS:
                    entry[name] = int(token)
                else:
                    entry[name] = token
            entry["uid"] = f"{current_group:02d}_{int(entry['index']):03d}"
            records.append(entry)
    return records


def write_json(records: Sequence[dict], *, source: Path, output: Path, pretty: bool) -> None:
    payload = {
        "meta": {
            "source_file": str(source),
            "item_count": len(records),
            "groups": sorted({rec["group"] for rec in records}),
            "columns": ["uid", "group", *FIELD_NAMES],
            "ue5_hint": "Crie uma USTRUCT com esses campos e importe como DataTable (JSON).",
        },
        "items": [
            {key: record.get(key) for key in ["uid", "group", *FIELD_NAMES]}
            for record in records
        ],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2 if pretty else None)
        if not pretty:
            handle.write("\n")


def write_csv(records: Sequence[dict], *, output: Path) -> None:
    columns = ["uid", "group", *FIELD_NAMES]
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for record in records:
            writer.writerow({key: record.get(key, "") for key in columns})


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Converte arquivos item.txt do servidor em DataTables compatíveis com UE5."
    )
    parser.add_argument("input", help="Caminho para o arquivo item.txt que será convertido.")
    parser.add_argument(
        "--formats",
        nargs="+",
        choices=("json", "csv"),
        default=["json"],
        help="Formatos desejados (padrão: json).",
    )
    parser.add_argument(
        "--output-dir",
        help="Pasta onde os arquivos convertidos serão salvos (padrão: mesma pasta do item.txt).",
    )
    parser.add_argument(
        "--base-name",
        help="Nome base dos arquivos exportados (padrão: nome do arquivo de entrada sem extensão).",
    )
    parser.add_argument(
        "--encoding",
        default="latin-1",
        help="Codificação utilizada para ler o item.txt (padrão: latin-1).",
    )
    parser.add_argument(
        "--groups",
        type=int,
        nargs="+",
        help="Filtra apenas os grupos informados (ex.: 0 1 2).",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Gera JSON com indentação legível (padrão: compacto).",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    input_path = Path(args.input).expanduser().resolve()
    if not input_path.exists():
        parser.error(f"Arquivo não encontrado: {input_path}")

    records = parse_item_txt(input_path, encoding=args.encoding, groups=args.groups)
    if not records:
        parser.error("Nenhum item encontrado com os filtros informados.")

    output_dir = Path(args.output_dir).expanduser() if args.output_dir else input_path.parent
    output_dir.mkdir(parents=True, exist_ok=True)
    base_name = args.base_name or input_path.stem

    for fmt in args.formats:
        if fmt == "json":
            destination = output_dir / f"{base_name}.ue5.json"
            write_json(records, source=input_path, output=destination, pretty=args.pretty)
            print(f"JSON salvo em {destination}")
        elif fmt == "csv":
            destination = output_dir / f"{base_name}.ue5.csv"
            write_csv(records, output=destination)
            print(f"CSV salvo em {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
