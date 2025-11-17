#!/usr/bin/env python3
"""Converte tabelas de opções especiais (wing/excellent) para DataTables UE5."""
from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

from common import parse_optional_int
from unreal_item_converter import parse_item_txt


@dataclass
class OptionEntry:
    uid: str
    table: str
    category: int
    option_index: int
    option_value: int
    item_min: int
    item_max: int
    option_flag1: int | None
    option_flag2: int | None
    option_flag3: int | None
    new_option: int | None
    comment: str | None


@dataclass
class ItemHint:
    global_id: int
    group: int
    index: int
    name: str | None


def split_comment(line: str) -> tuple[str, str | None]:
    if "//" in line:
        data, comment = line.split("//", 1)
        return data.strip(), comment.strip()
    return line.strip(), None


def decode_item_code(code: int) -> tuple[int, int]:
    group = code // 512
    index = code % 512
    return group, index


def build_item_dictionary(path: Path | None, *, encoding: str = "latin-1") -> dict[tuple[int, int], str]:
    if not path:
        return {}
    try:
        items = parse_item_txt(path, encoding=encoding)
    except Exception as exc:  # pragma: no cover - apenas aviso
        print(f"Aviso: não foi possível ler {path} ({exc}). Prosseguindo sem dicionário.")
        return {}
    dictionary: dict[tuple[int, int], str] = {}
    for item in items:
        key = (int(item["group"]), int(item["index"]))
        dictionary[key] = str(item.get("name"))
    return dictionary


def parse_option_file(
    path: Path,
    *,
    table_name: str,
    encoding: str = "latin-1",
    dictionary: dict[tuple[int, int], str] | None = None,
    start_index: int = 0,
) -> tuple[List[OptionEntry], int]:
    entries: List[OptionEntry] = []
    count = start_index
    with path.open("r", encoding=encoding, errors="ignore") as handle:
        for raw_line in handle:
            data, comment = split_comment(raw_line)
            if not data or data.startswith("//"):
                continue
            if data.lower() == "end":
                break
            tokens = data.split()
            if len(tokens) < 9:
                continue
            try:
                category = int(tokens[0])
                option_index = int(tokens[1])
                option_value = int(tokens[2])
                item_min = int(tokens[3])
                item_max = int(tokens[4])
            except ValueError:
                continue
            entry = OptionEntry(
                uid=f"{table_name}_{count:04d}",
                table=table_name,
                category=category,
                option_index=option_index,
                option_value=option_value,
                item_min=item_min,
                item_max=item_max,
                option_flag1=parse_optional_int(tokens[5]) if len(tokens) > 5 else None,
                option_flag2=parse_optional_int(tokens[6]) if len(tokens) > 6 else None,
                option_flag3=parse_optional_int(tokens[7]) if len(tokens) > 7 else None,
                new_option=parse_optional_int(tokens[8]) if len(tokens) > 8 else None,
                comment=comment,
            )
            entries.append(entry)
            count += 1
    return entries, count


def item_hint(value: int, dictionary: dict[tuple[int, int], str]) -> ItemHint:
    group, index = decode_item_code(value)
    return ItemHint(
        global_id=value,
        group=group,
        index=index,
        name=dictionary.get((group, index)),
    )


def entry_payload(entry: OptionEntry, dictionary: dict[tuple[int, int], str]) -> dict:
    payload = {
        "uid": entry.uid,
        "table": entry.table,
        "category": entry.category,
        "option_index": entry.option_index,
        "option_value": entry.option_value,
        "option_flag1": entry.option_flag1,
        "option_flag2": entry.option_flag2,
        "option_flag3": entry.option_flag3,
        "item_new_option": entry.new_option,
        "comment": entry.comment,
    }
    min_hint = item_hint(entry.item_min, dictionary)
    max_hint = item_hint(entry.item_max, dictionary)
    payload["item_range"] = {
        "min": min_hint.__dict__,
        "max": max_hint.__dict__,
        "count": entry.item_max - entry.item_min + 1,
    }
    return payload


def write_json(
    entries: Sequence[OptionEntry],
    *,
    tables: list[dict],
    output: Path,
    dictionary: dict[tuple[int, int], str],
    pretty: bool,
    item_source: Path | None,
) -> None:
    payload = {
        "meta": {
            "tables": tables,
            "option_count": len(entries),
            "item_dictionary": str(item_source) if item_source else None,
            "ue5_hint": "Use estas linhas para popular DataTables de efeitos especiais.",
        },
        "options": [entry_payload(entry, dictionary) for entry in entries],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2 if pretty else None)
        if not pretty:
            handle.write("\n")


def write_csv(
    entries: Sequence[OptionEntry],
    *,
    output: Path,
    dictionary: dict[tuple[int, int], str],
) -> None:
    columns = [
        "uid",
        "table",
        "category",
        "option_index",
        "option_value",
        "item_min",
        "item_min_group",
        "item_min_index",
        "item_min_name",
        "item_max",
        "item_max_group",
        "item_max_index",
        "item_max_name",
        "range_count",
        "option_flag1",
        "option_flag2",
        "option_flag3",
        "item_new_option",
        "comment",
    ]
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for entry in entries:
            min_hint = item_hint(entry.item_min, dictionary)
            max_hint = item_hint(entry.item_max, dictionary)
            writer.writerow(
                {
                    "uid": entry.uid,
                    "table": entry.table,
                    "category": entry.category,
                    "option_index": entry.option_index,
                    "option_value": entry.option_value,
                    "item_min": entry.item_min,
                    "item_min_group": min_hint.group,
                    "item_min_index": min_hint.index,
                    "item_min_name": min_hint.name,
                    "item_max": entry.item_max,
                    "item_max_group": max_hint.group,
                    "item_max_index": max_hint.index,
                    "item_max_name": max_hint.name,
                    "range_count": entry.item_max - entry.item_min + 1,
                    "option_flag1": entry.option_flag1,
                    "option_flag2": entry.option_flag2,
                    "option_flag3": entry.option_flag3,
                    "item_new_option": entry.new_option,
                    "comment": entry.comment,
                }
            )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Serializa wing_option/excellent_option (ou ItemOption.txt) para UE5."
    )
    parser.add_argument(
        "--table",
        action="append",
        metavar="nome=arquivo",
        required=True,
        help="Informe pares nome=arquivo para cada tabela (ex.: wing=wing_option.txt).",
    )
    parser.add_argument(
        "--item-dictionary",
        help="Opcional: caminho para o item.txt para resolver nomes de itens.",
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
        help="Pasta onde os arquivos serão salvos (padrão: pasta da primeira tabela).",
    )
    parser.add_argument(
        "--base-name",
        help="Nome base dos arquivos exportados (padrão: special_options).",
    )
    parser.add_argument(
        "--encoding",
        default="latin-1",
        help="Codificação utilizada para ler as tabelas (padrão: latin-1).",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Gera JSON com indentação legível.",
    )
    return parser


def parse_table_arg(raw: str) -> tuple[str, Path]:
    if "=" not in raw:
        raise argparse.ArgumentTypeError("Use o formato nome=arquivo para --table")
    name, file_path = raw.split("=", 1)
    if not name:
        raise argparse.ArgumentTypeError("Nome da tabela não pode ser vazio")
    return name, Path(file_path).expanduser().resolve()


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    tables: list[dict] = []
    entries: list[OptionEntry] = []
    next_index = 0
    table_paths = [parse_table_arg(raw) for raw in args.table]
    item_dict_path = Path(args.item_dictionary).expanduser().resolve() if args.item_dictionary else None
    item_dictionary = build_item_dictionary(item_dict_path)
    for name, file_path in table_paths:
        if not file_path.exists():
            parser.error(f"Tabela não encontrada: {file_path}")
        table_entries, next_index = parse_option_file(
            file_path,
            table_name=name,
            encoding=args.encoding,
            dictionary=item_dictionary,
            start_index=next_index,
        )
        tables.append({"name": name, "source": str(file_path), "rows": len(table_entries)})
        entries.extend(table_entries)
    if not entries:
        parser.error("Nenhum registro encontrado nas tabelas informadas.")
    output_dir = (
        Path(args.output_dir).expanduser()
        if args.output_dir
        else table_paths[0][1].parent
    )
    output_dir.mkdir(parents=True, exist_ok=True)
    base_name = args.base_name or "special_options"
    for fmt in args.formats:
        if fmt == "json":
            destination = output_dir / f"{base_name}.ue5.json"
            write_json(
                entries,
                tables=tables,
                output=destination,
                dictionary=item_dictionary,
                pretty=args.pretty,
                item_source=item_dict_path,
            )
            print(f"JSON salvo em {destination}")
        elif fmt == "csv":
            destination = output_dir / f"{base_name}.ue5.csv"
            write_csv(entries, output=destination, dictionary=item_dictionary)
            print(f"CSV salvo em {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
