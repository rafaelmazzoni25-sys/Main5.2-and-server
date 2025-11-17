# Ferramenta de Exportação para Unreal Engine 5+

Esta pasta contém utilitários de linha de comando pensados para converter os dados legados dos clientes MuOnline (pastas `Data/WorldXX`) em representações diretamente utilizáveis dentro da Unreal Engine 5+. A ferramenta principal é o script Python `unreal_world_exporter.py`.

## Funcionalidades

- Seleção flexível da pasta raiz (`--root`). O script aceita tanto o diretório que contém `Data/` quanto o próprio `Data/`.
- Descoberta automática dos mundos disponíveis (pastas `WorldX`). O comando `list` mostra o identificador, o nome amigável (usando a mesma convenção de `UIMapName.cpp`) e os arquivos `.obj` encontrados.
- Leitura dos arquivos `EncTerrain*.obj` usando o mesmo algoritmo de descriptografia (`MapFileDecrypt`) e layout binário empregados pelo cliente original (`OpenObjectsEnc`).
- Exportação dos objetos para formatos compatíveis com DataTables da UE5 (JSON ou CSV), já com conversão de coordenadas para centímetros e campos claros de localização, rotação e escala.
- Ajustes configuráveis de escala (`--tile-size`) e seleção explícita do arquivo `.obj` quando existem variações específicas (e.g. eventos).

## Requisitos

- Python 3.9+ (somente bibliotecas padrão).

## Exemplos rápidos

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

## Estrutura do arquivo exportado

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

## Dicas de uso no Unreal Engine 5+

1. **Criar a struct:** defina uma `USTRUCT(BlueprintType)` com `int32 TypeId`, `FVector Location`, `FRotator Rotation` e `float Scale`.
2. **Importar DataTable:** no Content Browser use *Import* → selecione o JSON/CSV exportado e escolha a struct criada.
3. **Spawners:** utilize `DataTable->GetAllRows` para instanciar `AActor`/`ISpawnable` convertendo os valores (já estão em centímetros, não é necessário multiplicar por `TERRAIN_SCALE`).
4. **Re-sincronização:** sempre que atualizar os arquivos `.obj` basta executar novamente o script; os formatos são determinísticos, facilitando diffs e revisão.

Consulte o cabeçalho `ZzzLodTerrain.h` para mais detalhes sobre `MapFileDecrypt`/`TERRAIN_SCALE` e `UIMapName.cpp` para entender como os nomes amigáveis foram mapeados.
