# Ferramenta de Exportação para Unreal Engine 5+

Esta pasta contém utilitários de linha de comando pensados para converter os dados legados dos clientes/servidores MuOnline (mundos, itens, spawns, portais e tabelas especiais) em representações diretamente utilizáveis dentro da Unreal Engine 5+. As ferramentas atuais são:

- `unreal_world_exporter.py`: exporta os objetos de cada mundo do cliente.
- `unreal_item_converter.py`: transforma o `item.txt` do servidor em DataTables JSON/CSV.
- `unreal_monster_spawn_converter.py`: lê o `MonsterSetBase.txt` e gera spawns/NPCs prontos para Blueprints.
- `unreal_gate_converter.py`: unifica `Gate.txt` + `Move.txt` em volumes de portal + comandos de teleporte.
- `unreal_special_option_converter.py`: converte tabelas como `wing_option`/`ItemOption.txt` em DataTables com vínculos para o `item.txt`.

## Funcionalidades (mundos)

- Seleção flexível da pasta raiz (`--root`). O script aceita tanto o diretório que contém `Data/` quanto o próprio `Data/`.
- Descoberta automática dos mundos disponíveis (pastas `WorldX`). O comando `list` mostra o identificador, o nome amigável (usando a mesma convenção de `UIMapName.cpp`) e os arquivos `.obj` encontrados.
- Leitura dos arquivos `EncTerrain*.obj` usando o mesmo algoritmo de descriptografia (`MapFileDecrypt`) e layout binário empregados pelo cliente original (`OpenObjectsEnc`).
- Exportação dos objetos para formatos compatíveis com DataTables da UE5 (JSON ou CSV), já com conversão de coordenadas para centímetros e campos claros de localização, rotação e escala.
- Ajustes configuráveis de escala (`--tile-size`) e seleção explícita do arquivo `.obj` quando existem variações específicas (e.g. eventos).

## Funcionalidades (itens)

- Aceita qualquer arquivo `item.txt` legado via argumento obrigatório `input` (pode ser apontado para um servidor limpo ou customizado).
- Interpreta automaticamente os blocos/grupos (`0`, `1`, `2`, …) e replica todos os campos do arquivo original (slots, requisitos, flags por classe etc.).
- Exporta para JSON e/ou CSV já estruturados como linhas de DataTable (`uid`, `group`, `index`, `slot`, ...).
- Permite filtrar grupos específicos (`--groups 0 1`), escolher pasta/base de saída e definir se o JSON deve ser indentado (`--pretty`).

## Funcionalidades (NPCs/monstros)

- Usa o mesmo layout do `MonsterSetBase` oficial (seções 0–4), respeitando coordenadas, caixas e contagens de spawn.
- Normaliza as posições em tiles e centímetros (`--tile-size`), inclui o nome do mapa (`UIMapName.cpp`) e preserva comentários.
- Permite filtrar mapas (`--maps`) e tipos de seção (`--types`) antes de exportar.
- Gera JSON/CSV com campos prontos para uma `USTRUCT` contendo localização, direção, quantidade e metadados.

## Funcionalidades (portais/zonas)

- Faz o parsing completo do `Gate.txt` (flags, bounding boxes, requisitos de nível/reset/conta).
- Opcionalmente relaciona cada gate com o `Move.txt`/`MoveReq.txt`, criando linhas de “fast travel” com o custo de zen.
- Calcula largura/altura dos volumes e converte os limites para centímetros para facilitar o desenho de `BoxComponents` no UE5.
- Exporta JSON único ou dois CSV (`*-gates` e `*-moves`) para DataTables/Curve Tables em Blueprints.

## Funcionalidades (opções especiais)

- Aceita múltiplas tabelas (`--table wing=... --table exc=...`) no mesmo comando, identificando cada linha por um `uid` único.
- Entende o layout clássico (`categoria`, `OptionIndex`, `OptionValue`, `ItemMin/Max`, `ItemOption*`, `ItemNewOption`).
- Opcionalmente cruza com o `item.txt` (`--item-dictionary`) para resolver nomes amigáveis dos itens envolvidos.
- Gera metadados com spans de itens, flags ativados e comentários originais, úteis para DataTables de FX/buffs no UE5.

## Requisitos

- Python 3.9+ (somente bibliotecas padrão).

## Exemplos rápidos (mundos)

Listar mundos a partir da raiz do cliente:

```bash
python FerramentasExport/unreal_world_exporter.py list --root /caminho/para/cliente
```

Exportar o mundo 0 (Lorencia) para JSON e CSV usando a raiz padrão do repositório:

```bash
python FerramentasExport/unreal_world_exporter.py export --world 0 --formats json csv \
  --root /caminho/para/cliente --output /tmp
```

Exportar um `.obj` específico para um DataTable JSON assumindo tiles de 100 cm:

```bash
python FerramentasExport/unreal_world_exporter.py export --obj /dados/Data/World34/EncTerrain34.obj \
  --tile-size 100 --output ~/World34.json
```

## Exemplos rápidos (itens)

Converter todo o `item.txt` do servidor base para JSON (mesmo diretório do arquivo original):

```bash
python FerramentasExport/unreal_item_converter.py MuServer_Season_5_Update_15/Data/Item/Item.txt
```

Gerar JSON + CSV apenas dos grupos 0 e 1, com nome base customizado e saída em `./Exports`:

```bash
python FerramentasExport/unreal_item_converter.py \
  MuServer_Season_5_Update_15/Data/Item/Item.txt \
  --groups 0 1 --formats json csv --output-dir ./Exports --base-name itens_basicos
```

## Exemplos rápidos (spawns)

Converter todo o `MonsterSetBase.txt` padrão para JSON/CSV:

```bash
python FerramentasExport/unreal_monster_spawn_converter.py \
  MuServer_Season_5_Update_15/Data/Monster/MonsterSetBase.txt \
  --formats json csv --output-dir ./Exports --base-name spawns
```

Gerar apenas os NPCs do mapa 0 (Lorencia) em JSON bonito:

```bash
python FerramentasExport/unreal_monster_spawn_converter.py \
  MuServer_Season_5_Update_15/Data/Monster/MonsterSetBase.txt \
  --maps 0 --pretty
```

## Exemplos rápidos (portais)

Exportar `Gate.txt` + `Move.txt` oficiais para JSON:

```bash
python FerramentasExport/unreal_gate_converter.py \
  MuServer_Season_5_Update_15/Data/Move/Gate.txt \
  --move MuServer_Season_5_Update_15/Data/Move/Move.txt \
  --output-dir ./Exports --base-name travel_data
```

Gerar apenas CSVs dos gates (sem Move.txt):

```bash
python FerramentasExport/unreal_gate_converter.py \
  MuServer_Season_5_Update_15/Data/Move/Gate.txt \
  --formats csv --output-dir ./Exports
```

## Exemplos rápidos (opções especiais)

Converter o `ItemOption.txt` (excellent/wing options) com dicionário de itens:

```bash
python FerramentasExport/unreal_special_option_converter.py \
  --table default=MuServer_Season_5_Update_15/Data/Item/ItemOption.txt \
  --item-dictionary MuServer_Season_5_Update_15/Data/Item/Item.txt \
  --formats json csv --output-dir ./Exports
```

Mesclar várias tabelas customizadas em um único JSON:

```bash
python FerramentasExport/unreal_special_option_converter.py \
  --table wings=Dados/wing_option.txt \
  --table exc=Dados/excellent_option.txt --pretty
```

## Estrutura do arquivo exportado (mundos)

Cada exportação gera metadados e uma lista de objetos com o seguinte layout (campos em centímetros e graus):

```json
{
  "meta": {
    "map_id": 34,
    "map_name": "Crywolf Fortress",
    "source_file": "/Data/World34/EncTerrain34.obj",
    "object_count": 512,
    "tile_size_cm": 100.0,
    "terrain_scale": 100.0
  },
  "objects": [
    {
      "type_id": 123,
      "position_cm": {"x": 1530.0, "y": 2040.0, "z": 0.0},
      "rotation_deg": {"pitch": 0.0, "yaw": 90.0, "roll": 0.0},
      "scale": 1.0
    }
  ]
}
```

## Estrutura do arquivo exportado (itens)

```json
{
  "meta": {
    "source_file": "MuServer_Season_5_Update_15/Data/Item/Item.txt",
    "item_count": 512,
    "groups": [0, 1],
    "columns": ["uid", "group", "index", "slot", ...],
    "ue5_hint": "Crie uma USTRUCT com esses campos e importe como DataTable (JSON)."
  },
  "items": [
    {
      "uid": "00_000",
      "group": 0,
      "index": 0,
      "slot": 0,
      "skill": 0,
      "size_x": 1,
      "size_y": 2,
      "serial": 1,
      "option": 1,
      "drop": 1,
      "name": "Kris",
      "level": 6,
      "damage_min": 6,
      "damage_max": 11,
      "attack_speed": 50,
      "durability": 20,
      "magic_durability": 0,
      "magic_power": 0,
      "req_level": 0,
      "req_strength": 40,
      "req_agility": 40,
      "req_energy": 0,
      "req_vitality": 0,
      "req_command": 0,
      "type": 0,
      "class_dw": 1,
      "class_dk": 1,
      "class_elf": 1,
      "class_mg": 1,
      "class_dl": 1,
      "class_summoner": 1
    }
  ]
}
```

## Estrutura do arquivo exportado (spawns)

```json
{
  "meta": {
    "source_file": "MonsterSetBase.txt",
    "spawn_count": 1024,
    "tile_size_cm": 100.0,
    "maps": [0, 3]
  },
  "spawns": [
    {
      "uid": "msb_00000",
      "type_id": 0,
      "spawn_kind": "single_point",
      "monster_class": 226,
      "map_id": 0,
      "map_name": "Lorencia",
      "range": 0,
      "direction": 3,
      "spawn_count": 1,
      "position_tiles": {"x": 122, "y": 110},
      "position_cm": {"x": 12200.0, "y": 11000.0}
    }
  ]
}
```

## Estrutura do arquivo exportado (portais)

```json
{
  "meta": {
    "gate_source": "Gate.txt",
    "move_source": "Move.txt",
    "gate_count": 300,
    "move_count": 60,
    "tile_size_cm": 100.0
  },
  "gates": [
    {
      "gate_id": 1,
      "map_name": "Lorencia",
      "x1": 121,
      "y1": 232,
      "x2": 123,
      "y2": 233,
      "target_gate": 2,
      "min_level": 20,
      "width_cm": 300.0,
      "height_cm": 200.0
    }
  ],
  "moves": [
    {
      "move_id": 2,
      "name": "Lorencia",
      "cost": 2000,
      "gate_id": 17,
      "resolved_gate": {"map_name": "Dungeon", "x1": 5, "y1": 38}
    }
  ]
}
```

## Estrutura do arquivo exportado (opções especiais)

```json
{
  "meta": {
    "tables": [{"name": "wings", "source": "wing_option.txt", "rows": 42}],
    "item_dictionary": "Item.txt",
    "option_count": 42
  },
  "options": [
    {
      "uid": "wings_0000",
      "table": "wings",
      "category": 1,
      "option_index": 84,
      "item_range": {
        "min": {"global_id": 6144, "group": 12, "index": 0, "name": "Wings of Fairy"},
        "max": {"global_id": 6145, "group": 12, "index": 1, "name": "Wings of Angel"}
      },
      "option_flag1": null,
      "item_new_option": 1
    }
  ]
}
```

## Dicas de uso no Unreal Engine 5+

1. **Criar a struct:** defina uma `USTRUCT(BlueprintType)` com campos equivalentes aos JSON/CSV (ex.: `FWorldObjectRow`, `FMonsterSpawnRow`, `FGateRow`).
2. **Importar DataTable:** no Content Browser use *Import* → selecione o JSON/CSV exportado e escolha a struct criada.
3. **Spawners e portais:** utilize `DataTable->GetAllRows` para instanciar `AActor`s convertendo as posições (já em centímetros) e ajustando rotações conforme necessário.
4. **Re-sincronização:** sempre que atualizar os arquivos de origem basta executar novamente o script; os formatos são determinísticos, facilitando diffs e revisão.

> Agora que mundos, itens, spawns, portais e tabelas especiais fazem parte do pacote, o pipeline cobre praticamente todos os dados estruturais necessários para recriar o mundo do Mu no UE5. Qualquer sugestão adicional (ex.: drops customizados, quests ou mensagens) pode seguir o mesmo padrão das ferramentas acima para manter a consistência.
