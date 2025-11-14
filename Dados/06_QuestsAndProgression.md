# Etapa 6 — Missões, Progressão e Economia

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P6 — Média-Alta |
| **Dependências Diretas** | Etapas 0, 1, 2, 4 e 5 |
| **Desbloqueia** | Etapas 7, 8, 9 e 10 |
| **Foco UE5+** | Blueprint com DataTables, GAS e sistemas de economia |
| **Linha do Tempo Indicativa** | Semana 3 — Sessões 3 e 4 |

## Marco Principal
Construir sistemas de quests lineares/modulares, progressão de personagem e economia base para habilitar conteúdo de mundo, UI dinâmica e backend.

## Pré-requisitos Organizacionais
- Inventário e eventos `OnInventoryUpdated` operacionais (Etapa 5).
- Abilities de combate fornecendo XP/drops (Etapa 4).

## Sequência Cronológica em Blueprint
1. **Estruturas de Dados**
   - Criar `DT_Quests`, `DT_QuestSteps`, `DT_Currencies` com identificadores únicos.
   - Definir `FQuestState` (struct Blueprint) contendo `CurrentStep`, `Progress`, `Rewards`.
2. **Sistema de Quests**
   - Desenvolver `BP_QuestSubsystem` (GameInstanceSubsystem) com funções `AcceptQuest`, `AdvanceQuest`, `CompleteQuest`.
   - Ligar eventos de combate (`OnEnemyDefeated`) e inventário (`OnItemCollected`) para atualizar progresso.
   - Expor `Event Dispatcher` `OnQuestUpdated` para HUD (Etapa 8) e mundo (Etapa 7).
3. **Progressão de Personagem**
   - Criar `BP_ProgressionComponent` no PlayerState para controlar XP, nível e pontos de atributo.
   - Utilizar `Gameplay Effect` para aplicar bônus de nível.
   - Atualizar DataTables para escalar XP necessário por nível.
4. **Economia Básica**
   - Implementar `BP_WalletComponent` no PlayerState com `Currencies` e métodos `AddCurrency`, `SpendCurrency`.
   - Integrar recompensas de quests e drops.
5. **Sincronização e Salvamento**
   - Salvar estado de quests/progressão em `SaveGame` e expor eventos para replicação (suportará Etapa 9).

## Checklist de Saída
- Quests aceitas, atualizadas e completadas via Blueprint.
- Progressão de nível e economia integradas ao inventário e combate.

## Verificações de Dependência
- Completar quest de teste conferindo atualização imediata na HUD.
- Validar ganhos de moeda e XP persistindo após reload do `SaveGame`.
