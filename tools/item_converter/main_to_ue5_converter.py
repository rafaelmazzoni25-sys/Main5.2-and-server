#!/usr/bin/env python3
"""Convert legacy Main project item tables to Unreal Engine 5 friendly CSV/JSON.

The legacy client stores items inside MuServer_Season_5_Update_15/Data/Item/Item.txt
using a whitespace separated table with quoted names. This script understands the
multiple column layouts present in that file (armas, escudos, asas, capas,
itens consumíveis e pergaminhos) and exports a normalized dataset ready for
Unreal Engine 5 DataTables.
"""
from __future__ import annotations

import argparse
import csv
import json
import shlex
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Sequence

# Output template: fields expected by the UE5 DataTable row struct.
OUTPUT_FIELDS: Sequence[str] = (
    "RowName",
    "Section",
    "Index",
    "Slot",
    "Skill",
    "SizeX",
    "SizeY",
    "bHasSerial",
    "OptionLevel",
    "bCanDrop",
    "Name",
    "Level",
    "DmgMin",
    "DmgMax",
    "AttackSpeed",
    "Defense",
    "DefenseRate",
    "Durability",
    "MagicDurability",
    "MagicPower",
    "RequiredLevel",
    "ReqStrength",
    "ReqAgility",
    "ReqEnergy",
    "ReqVitality",
    "ReqCommand",
    "ZenCost",
    "ResIce",
    "ResPoison",
    "ResLight",
    "ResFire",
    "ResEarth",
    "ResWind",
    "ResWater",
    "ItemType",
    "AllowedDW_SM_GM",
    "AllowedDK_BK_BM",
    "AllowedFE_ME_HE",
    "AllowedMG_DM",
    "AllowedDL_LE",
    "AllowedSU_BS_DiM",
)

# Mapping from token count to legacy-specific column order.
TOKEN_LAYOUTS: Dict[int, Dict[str, int]] = {
    # Weapons, staffs, scepters, bows, etc. (sections 0-5)
    29: {
        "DmgMin": 10,
        "DmgMax": 11,
        "AttackSpeed": 12,
        "Durability": 13,
        "MagicDurability": 14,
        "MagicPower": 15,
        "RequiredLevel": 16,
        "ReqStrength": 17,
        "ReqAgility": 18,
        "ReqEnergy": 19,
        "ReqVitality": 20,
        "ReqCommand": 21,
        "ItemType": 22,
        "AllowedDW_SM_GM": 23,
        "AllowedDK_BK_BM": 24,
        "AllowedFE_ME_HE": 25,
        "AllowedMG_DM": 26,
        "AllowedDL_LE": 27,
        "AllowedSU_BS_DiM": 28,
    },
    # Shields, helmets, armors, gloves, pants, boots (sections 6-11)
    26: {
        "Defense": 10,
        "DefenseRate": 11,
        "Durability": 12,
        "RequiredLevel": 13,
        "ReqStrength": 14,
        "ReqAgility": 15,
        "ReqEnergy": 16,
        "ReqVitality": 17,
        "ReqCommand": 18,
        "ItemType": 19,
        "AllowedDW_SM_GM": 20,
        "AllowedDK_BK_BM": 21,
        "AllowedFE_ME_HE": 22,
        "AllowedMG_DM": 23,
        "AllowedDL_LE": 24,
        "AllowedSU_BS_DiM": 25,
    },
    # Wings (section 12)
    24: {
        "Defense": 10,
        "Durability": 11,
        "RequiredLevel": 12,
        "ReqEnergy": 13,
        "ReqStrength": 14,
        "ReqAgility": 15,
        "ReqCommand": 16,
        "ZenCost": 17,
        "AllowedDW_SM_GM": 18,
        "AllowedDK_BK_BM": 19,
        "AllowedFE_ME_HE": 20,
        "AllowedMG_DM": 21,
        "AllowedDL_LE": 22,
        "AllowedSU_BS_DiM": 23,
    },
    # Capas/Pets com resistências (section 13)
    25: {
        "Durability": 10,
        "ResIce": 11,
        "ResPoison": 12,
        "ResLight": 13,
        "ResFire": 14,
        "ResEarth": 15,
        "ResWind": 16,
        "ResWater": 17,
        "ItemType": 18,
        "AllowedDW_SM_GM": 19,
        "AllowedDK_BK_BM": 20,
        "AllowedFE_ME_HE": 21,
        "AllowedMG_DM": 22,
        "AllowedDL_LE": 23,
        "AllowedSU_BS_DiM": 24,
    },
    # Consumíveis simples (section 14)
    11: {
        "Durability": 10,
    },
    # Pergaminhos/skills (section 15)
    19: {
        "RequiredLevel": 10,
        "ReqEnergy": 11,
        "ZenCost": 12,
        "AllowedDW_SM_GM": 13,
        "AllowedDK_BK_BM": 14,
        "AllowedFE_ME_HE": 15,
        "AllowedMG_DM": 16,
        "AllowedDL_LE": 17,
        "AllowedSU_BS_DiM": 18,
    },
}


def safe_int(token: str) -> int:
    try:
        return int(token)
    except ValueError:
        return 0


@dataclass
class LegacyItemRow:
    section: int
    tokens: List[str]

    def to_output_dict(self) -> Dict[str, int | str | bool]:
        length = len(self.tokens)
        if length not in TOKEN_LAYOUTS:
            raise ValueError(
                f"Layout de {length} colunas não suportado. Tokens: {self.tokens}"
            )
        token_map = TOKEN_LAYOUTS[length]

        data: Dict[str, int | str | bool] = {
            "Section": self.section,
            "Index": safe_int(self.tokens[0]),
            "Slot": safe_int(self.tokens[1]),
            "Skill": safe_int(self.tokens[2]),
            "SizeX": safe_int(self.tokens[3]),
            "SizeY": safe_int(self.tokens[4]),
            "bHasSerial": bool(safe_int(self.tokens[5])),
            "OptionLevel": safe_int(self.tokens[6]),
            "bCanDrop": bool(safe_int(self.tokens[7])),
            "Name": self.tokens[8],
            "Level": safe_int(self.tokens[9]),
            "DmgMin": 0,
            "DmgMax": 0,
            "AttackSpeed": 0,
            "Defense": 0,
            "DefenseRate": 0,
            "Durability": 0,
            "MagicDurability": 0,
            "MagicPower": 0,
            "RequiredLevel": 0,
            "ReqStrength": 0,
            "ReqAgility": 0,
            "ReqEnergy": 0,
            "ReqVitality": 0,
            "ReqCommand": 0,
            "ZenCost": 0,
            "ResIce": 0,
            "ResPoison": 0,
            "ResLight": 0,
            "ResFire": 0,
            "ResEarth": 0,
            "ResWind": 0,
            "ResWater": 0,
            "ItemType": 0,
            "AllowedDW_SM_GM": 0,
            "AllowedDK_BK_BM": 0,
            "AllowedFE_ME_HE": 0,
            "AllowedMG_DM": 0,
            "AllowedDL_LE": 0,
            "AllowedSU_BS_DiM": 0,
        }

        for field, idx in token_map.items():
            value = self.tokens[idx]
            if field == "Name":
                data[field] = value
            elif field.startswith("Res"):
                data[field] = safe_int(value)
            elif field in {"bHasSerial", "bCanDrop"}:
                data[field] = bool(safe_int(value))
            else:
                data[field] = safe_int(value)

        if length == 29:
            # Only weapons have speed/magic related fields.
            data.setdefault("AttackSpeed", safe_int(self.tokens[12]))
            data.setdefault("MagicDurability", safe_int(self.tokens[14]))
            data.setdefault("MagicPower", safe_int(self.tokens[15]))

        data["RowName"] = self.build_row_name(data)
        return data

    def build_row_name(self, data: Dict[str, int | str | bool]) -> str:
        name = str(data.get("Name", "Unknown")).replace(" ", "_").replace("'", "")
        index = data.get("Index", 0)
        if isinstance(index, bool):  # safeguard, should not happen
            index = int(index)
        return f"Section{self.section:02d}_{int(index):03d}_{name}"


def parse_legacy_items(lines: Sequence[str]) -> List[LegacyItemRow]:
    rows: List[LegacyItemRow] = []
    section = None
    idx = 0
    total = len(lines)
    while idx < total:
        raw = lines[idx]
        idx += 1
        line = raw.strip()
        if not line or line.startswith("//"):
            continue
        if line.lower() == "end":
            continue
        if '"' not in line:
            try:
                section = int(line)
            except ValueError:
                continue
            continue
        tokens = shlex.split(line)
        # Merge continuation lines until we hit a new entry/section/end.
        lookahead = idx
        while lookahead < total:
            nxt = lines[lookahead].strip()
            if not nxt or nxt.startswith("//"):
                lookahead += 1
                continue
            if nxt.lower() == "end" or nxt.isdigit() or '"' in nxt:
                break
            tokens.extend(shlex.split(nxt))
            lookahead += 1
        idx = lookahead
        if section is None:
            raise ValueError("Item encontrado antes de uma seção ser definida.")
        rows.append(LegacyItemRow(section, tokens))
    return rows


def export_csv(rows: Sequence[LegacyItemRow], path: Path) -> None:
    dict_rows = [row.to_output_dict() for row in rows]
    with path.open("w", newline="", encoding="utf-8") as fp:
        writer = csv.DictWriter(fp, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        for row in dict_rows:
            writer.writerow({field: row.get(field, "") for field in OUTPUT_FIELDS})


def export_json(rows: Sequence[LegacyItemRow], path: Path) -> None:
    payload = [row.to_output_dict() for row in rows]
    with path.open("w", encoding="utf-8") as fp:
        json.dump(payload, fp, ensure_ascii=False, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert legacy Main item tables to UE5 friendly data formats."
    )
    parser.add_argument(
        "input",
        type=Path,
        help="Path to the legacy Item.txt file (e.g. MuServer_Season_5_Update_15/Data/Item/Item.txt)",
    )
    parser.add_argument(
        "output",
        type=Path,
        help="Destination file. Extension determines format (.csv ou .json).",
    )
    parser.add_argument(
        "--encoding",
        default="latin-1",
        help="Character encoding used by the legacy file (default: latin-1).",
    )
    args = parser.parse_args()

    lines = args.input.read_text(encoding=args.encoding).splitlines()
    rows = parse_legacy_items(lines)

    if not rows:
        raise SystemExit("Nenhum item encontrado no arquivo legado.")

    suffix = args.output.suffix.lower()
    if suffix == ".csv":
        export_csv(rows, args.output)
    elif suffix == ".json":
        export_json(rows, args.output)
    else:
        raise SystemExit("Formato de saída não suportado. Utilize .csv ou .json.")

    print(
        f"Convertidos {len(rows)} itens do arquivo legado '{args.input}' para '{args.output}'."
    )


if __name__ == "__main__":
    main()
