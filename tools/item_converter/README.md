# Legacy Main Item Converter → Unreal Engine 5

Esta pequena ferramenta converte a tabela `Item.txt` utilizada pelo cliente clássico do projeto **Main** em um formato compatível com DataTables do Unreal Engine 5.

## O que ela faz

- Lê o arquivo legado (`MuServer_Season_5_Update_15/Data/Item/Item.txt`).
- Mantém a informação de **seção** (cada bloco numerado do arquivo original).
- Normaliza os campos para tipos inteiros e converte flags em booleanos (`bHasSerial`, `bCanDrop`).
- Reconhece automaticamente os diferentes layouts do `Item.txt` (armas, armaduras, asas, capas, consumíveis e pergaminhos).
- Gera um arquivo **CSV** (ou **JSON**) pronto para ser importado em um `UDataTable` baseado em um `UStruct` equivalente (`FMainItemRow`).

## Pré-requisitos

- Python 3.9+

## Como usar

```bash
python tools/item_converter/main_to_ue5_converter.py \
  MuServer_Season_5_Update_15/Data/Item/Item.txt \
  /tmp/MainItems.csv
```

Ou, para gerar JSON:

```bash
python tools/item_converter/main_to_ue5_converter.py \
  MuServer_Season_5_Update_15/Data/Item/Item.txt \
  /tmp/MainItems.json
```

## Importando no UE5

1. Dentro do Content Browser, crie um `UStruct` Blueprint ou C++ (`FMainItemRow`) com os mesmos campos do CSV.
2. Clique com o botão direito no Content Browser → **Import to...** e selecione o CSV exportado.
3. Na janela de importação, escolha `Data Table` como tipo de ativo e selecione o `UStruct` criado no passo anterior.
4. Ajuste os enums/flags conforme necessário no editor para casar com o gameplay do seu projeto.

## Estrutura sugerida do `FMainItemRow`

| Campo               | Tipo UE5   | Origem no legado |
|---------------------|-----------|------------------|
| RowName             | `FName`   | Gerado pela ferramenta |
| Section             | `int32`   | Número do bloco  |
| Index               | `int32`   | `Index`          |
| Slot                | `int32`   | `Slot`           |
| Skill               | `int32`   | `Skill`          |
| SizeX / SizeY       | `int32`   | `X`, `Y`         |
| bHasSerial          | `bool`    | `Serial`         |
| OptionLevel         | `int32`   | `Opt`            |
| bCanDrop            | `bool`    | `Drop`           |
| Name                | `FText`   | `Nombre`         |
| Level               | `int32`   | `Lvl`            |
| DamageMin/Max       | `int32`   | `DmgMin`, `DmgMax` (quando disponível) |
| AttackSpeed         | `int32`   | `Speed` (armas)  |
| Defense/DefenseRate | `int32`   | `Def`, `DefRate` (escudos/armaduras) |
| Durability          | `int32`   | `Dur`            |
| MagicDurability     | `int32`   | `MagiDur`        |
| MagicPower          | `int32`   | `MagiPwr`        |
| RequiredLevel       | `int32`   | `ReqLvl`         |
| ReqStrength/Agi/... | `int32`   | `Str`, `Agi`, `Ene`, `Vit`, `Com`, `Zen` |
| Resistências        | `int32`   | `Ice`, `Poison`, `Light`, `Fire`, `Earth`, `Wind`, `Water` |
| ItemType            | `int32`   | `Tipo`           |
| Allowed*            | `int32`   | Flags de classe  |

## Tratamento de seções

Cada bloco do arquivo legado começa com um número isolado (`0`, `1`, ...). Este valor indica a categoria de item (ex.: armas, armaduras, etc.). A ferramenta preserva esse número no campo `Section`, permitindo que você crie `DataAssets` específicos por categoria ou aplique regras condicionais na UI/inventário.

## Personalizações adicionais

- O parâmetro `--encoding` permite ajustar a codificação (por padrão `latin-1`).
- Você pode pós-processar o CSV gerado em Python/Blueprints para agrupar itens, criar enums, etc.

Com isso você tem uma base automatizada para importar os dados legados e acelerar a migração do inventário para a Unreal Engine 5.
