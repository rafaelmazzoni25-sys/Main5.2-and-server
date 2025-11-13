# Etapa 6 — Missões, Progressão e Economia
**Prioridade:** Alta  
**Depende de:** Etapas 0, 1, 2, 4 e 5

## Objetivo
Desenhar o sistema de missões, experiência, níveis e economia em Blueprints, conectando-o ao inventário e às habilidades.

## Pré-requisitos
- Inventário funcional e atributos integrados (Etapa 5).
- Ability System emitindo eventos de combate (Etapa 4).

## Fluxo de Trabalho em Blueprint
1. **Sistema de Missões**
   - Crie `DataTable` `DT_Quests` com campos `QuestID`, `Objectives` (array de `FQuestObjective`), `Rewards`.
   - Desenvolva `BP_QuestComponent` (ActorComponent) para o PlayerState com funções `AcceptQuest`, `UpdateObjective`, `CompleteQuest`.
   - Utilize `Event Dispatchers` para notificar HUD (`OnQuestUpdated`).

2. **Progressão de Nível**
   - Crie `CurveFloat` `Curve_XPToLevel` e `CurveFloat` `Curve_LevelStats`.
   - No `BP_RemakePlayerState`, mantenha variáveis `CurrentXP`, `CurrentLevel`; em `AddExperience`, consulte `Curve_XPToLevel`.
   - Ao subir de nível, acione `GrantLevelUpRewards` que usa `BP_InventoryComponent` para dar itens e `AbilitySystem` para liberar habilidades.

3. **Economia**
   - Estruture `Struct FCurrencyBalance` (gold, gems, tokens).
   - Crie `BP_CurrencyComponent` no PlayerState e `BP_Vendor` para interação.
   - Use `DataTable` `DT_VendorStock` e menus `WBP_Vendor` para compra/venda.

4. **Eventos e Mundo**
   - Integre missões com mundo via `BP_QuestTrigger` (Actor com `Box Collision`).
   - Quando um inimigo morre (evento da Etapa 4), dispare `UpdateObjective` no componente de missão.

5. **Sincronização e Salvamento**
   - Utilize `SaveGame` `SG_PlayerProgression` armazenando missões aceitas/completas, nível e moedas.
   - Na Etapa 9, estes dados serão enviados ao servidor.

## Entregáveis
- Componentes `BP_QuestComponent`, `BP_CurrencyComponent` no PlayerState.
- DataTables e Curves configurados em `/Game/Data`.
- Widgets de missão e vendedor esboçados (`WBP_QuestLog`, `WBP_Vendor`).

## Verificações
- Testar aceitar/completar missão durante gameplay e verificar atualização de objetivos em HUD.
- Garantir que recompensas adicionem itens e XP corretamente.
- Validar persistência local via `SaveGame`.
