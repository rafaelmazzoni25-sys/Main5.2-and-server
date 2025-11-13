# Etapa 5 — Itens, Inventário e Preview 3D

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P5 — Alta |
| **Dependências Diretas** | Etapas 0, 1, 2 e 4 |
| **Desbloqueia** | Etapas 6, 8 e 9 |
| **Foco UE5+** | Blueprint com DataTables, componentes de inventário e HUD 3D |
| **Linha do Tempo Indicativa** | Semana 3 — Sessões 1 e 2 |

## Marco Principal
Implementar inventário data-driven, slots equipáveis, renderização 3D dentro do HUD e rotação animada de itens selecionados totalmente em Blueprint.

## Pré-requisitos Organizacionais
- `DT_Items` preenchida com metadados base (Etapa 0).
- `BP_RemakeCharacter` expondo interface `BPI_InventoryCarrier` (Etapa 1).
- Habilidades de combate configuradas para ler atributos de item (Etapa 4).

## Sequência Cronológica em Blueprint
1. **Componentes de Inventário**
   - Criar `BP_InventoryComponent` (ActorComponent) com arrays `BackpackSlots`, `EquipmentSlots`.
   - Implementar funções `AddItem`, `RemoveItem`, `CanEquipItem` usando `Switch on EItemType`.
   - Integrar persistência temporária via `SaveGame` (será extendido na Etapa 9).
2. **Data Binding**
   - Construir `BP_ItemDataLibrary` para acessar `DT_Items` e retornar `FItemDefinition` com estáticos.
   - Converter estatísticas de item para `GameplayEffectSpec` quando equipados.
3. **HUD de Inventário 3D**
   - Criar `WBP_InventoryRoot` (UMG) com `Widget Switcher` entre visualizações (grid/backpack vs. equipamento).
   - Adicionar `Viewport` 3D interno renderizando `BP_ItemPreviewActor`.
   - Sincronizar seleção com `On Item Hovered` -> `Event Dispatcher` para spawn/rotacionar preview.
4. **Preview e Rotação**
   - Criar `BP_ItemPreviewActor` derivado de `Actor` com `StaticMesh`/`SkeletalMesh` dinâmico.
   - Aplicar `Timeline` para rotação contínua quando item estiver selecionado.
   - Usar `Render Target` opcional para aplicar pós-processo (Glow para excelentes/nível elevado).
5. **Integração com Gameplay**
   - Ao equipar item, aplicar `Gameplay Effect` de bônus e atualizar tags.
   - Emitir eventos `OnInventoryUpdated` para HUD e sistemas de progressão (Etapa 6).

## Checklist de Saída
- Inventário funcional com dados vindos de DataTables e preview 3D integrado ao HUD.
- Componentes replicáveis prontos para persistência e rede (será concluído na Etapa 9).

## Verificações de Dependência
- Testar abertura do inventário (`ToggleInventory`) e rotacionar item selecionado.
- Verificar replicação de itens equipados em sessão multiplayer.
