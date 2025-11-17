# Ferramenta de Exportação para Unreal Engine 5+

Esta pasta contém utilitários de linha de comando pensados para converter os dados legados dos clientes MuOnline (pastas `Data/WorldXX` e arquivos `Data/Item/item.txt`) em representações diretamente utilizáveis dentro da Unreal Engine 5+. As ferramentas atuais são:

- `unreal_world_exporter.py`: exporta os objetos de cada mundo do cliente.
- `unreal_item_converter.py`: transforma o `item.txt` do servidor em DataTables JSON/CSV.

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

No Unreal Editor basta criar um `DataTable` baseado em uma `UStruct` equivalente (por exemplo `FWorldObjectRow` com os campos acima) e importar o JSON/CSV gerado.

## Estrutura do arquivo exportado (itens)

O JSON contém um cabeçalho `meta` seguido da lista `items`, cada uma com os campos já tipados como inteiros (exceto `name`). Exemplo:

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

Para CSV os mesmos campos são gerados como colunas, prontos para importação direta em um DataTable baseado na `USTRUCT` equivalente.

## Dicas de uso no Unreal Engine 5+

1. **Criar a struct:** defina uma `USTRUCT(BlueprintType)` com `int32 TypeId`, `FVector Location`, `FRotator Rotation` e `float Scale`.
2. **Importar DataTable:** no Content Browser use *Import* → selecione o JSON/CSV exportado e escolha a struct criada.
3. **Spawners:** utilize `DataTable->GetAllRows` para instanciar `AActor`/`ISpawnable` convertendo os valores (já estão em centímetros, não é necessário multiplicar por `TERRAIN_SCALE`).
4. **Re-sincronização:** sempre que atualizar os arquivos `.obj` basta executar novamente o script; os formatos são determinísticos, facilitando diffs e revisão.

Consulte o cabeçalho `ZzzLodTerrain.h` para mais detalhes sobre `MapFileDecrypt`/`TERRAIN_SCALE` e `UIMapName.cpp` para entender como os nomes amigáveis foram mapeados.
