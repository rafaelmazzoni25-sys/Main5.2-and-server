# Etapa 5 — Itens, Inventário e Visualização 3D
**Prioridade:** Alta  
**Depende de:** Etapas 0, 1, 2 e 4

## Objetivo
Implementar o sistema de itens, inventário e renderização 3D em Blueprint, garantindo compatibilidade com HUD, atributos e lógica de rotação quando um item é selecionado.

## Pré-requisitos
- DataTables `DT_Items`, `DT_ItemModels`, `DT_ItemEffects` carregadas na Etapa 0.
- Interface `BPI_InventoryCarrier` implementada no personagem (Etapa 1).

## Fluxo de Trabalho em Blueprint
1. **Estruturas e Data Assets**
   - Defina `Struct FInventorySlot` (Blueprint Struct) com campos `SlotType`, `ItemID`, `Quantity`, `Durability`.
   - Crie `PrimaryDataAsset` `DA_ItemFamilies` com referências para meshes (`StaticMesh`/`SkeletalMesh`) e efeitos (`Niagara`) por raridade.

2. **Inventário do Personagem**
   - No `BP_RemakeCharacter`, adicione componente `BP_InventoryComponent` (ActorComponent).
   - Component blueprint mantém `Array` de `FInventorySlot`, eventos `OnInventoryUpdated`, e funções `AddItem`, `RemoveItem`, `EquipItem`.
   - Utilize `GameplayTag` `Inventory.Equipped.*` para sincronizar com Ability System (buffs e habilidades passivas).

3. **UI e HUD 3D**
   - Crie `Widget` `WBP_InventoryGrid` com `UniformGridPanel` populado dinamicamente.
   - Para renderização 3D, instancie `BP_ItemPreviewActor` (Actor com `SceneCaptureComponent2D`, `StaticMeshComponent`).
   - Configure material `M_ItemPreview` para suportar rotação suave e highlight.
   - Quando um item é selecionado, use `Timeline` `TL_ItemRotate` no `BP_ItemPreviewActor` girando `Yaw` continuamente.

4. **Interação e Controle**
   - Mapear input `IA_OpenInventory` no PlayerController; ao abrir, mude `CameraMode` para `InventoryPreview` (Etapa 2) e mostre `WBP_Inventory`.
   - Dentro do widget, ao clicar em um slot, chame `ShowItemPreview(ItemID)` no PlayerController. Esta função spawna/atualiza `BP_ItemPreviewActor` em um `PreviewScene` (subnível ou componente `Widget Interaction`).
   - Para itens excelentes/nível, aplique overlays Niagara conforme `DT_ItemEffects` (usando `Spawn System Attached`).

5. **Persistência Temporária**
   - Salve inventário local usando `SaveGame` Blueprint `SG_PlayerInventory` até a Etapa 9 lidar com persistência completa.

## Entregáveis
- `BP_InventoryComponent`, `BP_ItemPreviewActor`, `WBP_Inventory`, `WBP_InventoryGrid`.
- Timelines e rotinas de rotação/iluminação configuradas para itens selecionados.

## Verificações
- Adicionar itens via `Cheat` ou `Pickup` e validar atualização imediata do HUD.
- Confirmar que o item selecionado gira suavemente e troca de efeito conforme raridade.
- Testar replicação básica: em modo multiplayer, os itens equipados devem atualizar atributos (mesmo que inventário completo sincronize na Etapa 9).
