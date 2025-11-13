# Etapa 7 — Mundo, Spawns e Eventos Dinâmicos

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P7 — Média |
| **Dependências Diretas** | Etapas 0, 1, 2, 3, 4 e 6 |
| **Desbloqueia** | Etapas 8, 9 e 10 |
| **Foco UE5+** | Blueprint com Level Streaming, Spawners e World Partition |
| **Linha do Tempo Indicativa** | Semana 4 — Sessões 1 e 2 |

## Marco Principal
Estruturar mapas modulares, sistemas de spawn de inimigos/NPCs e eventos dinâmicos que reagem a quests e progressão.

## Pré-requisitos Organizacionais
- Quests emitindo eventos `OnQuestUpdated` (Etapa 6).
- Companion/Navegação configurados (Etapa 3).

## Sequência Cronológica em Blueprint
1. **Gerenciamento de Mundo**
   - Habilitar `World Partition` e definir células críticas.
   - Criar `BP_WorldLayerController` para carregar/unload níveis via `Load Stream Level`/`Unload Stream Level`.
2. **Spawners Data-Driven**
   - Criar `DT_SpawnTables` contendo referência a `BP_SpawnRegion`, inimigos e condições.
   - Construir `BP_SpawnManager` (Actor) responsável por ler DataTable e instanciar inimigos com `Spawn Actor Deferred`.
3. **Eventos Dinâmicos**
   - Implementar `BP_WorldEvent` com estados `Active`, `CoolingDown` e gatilhos baseados em quests ou tempo.
   - Integrar com `BP_QuestSubsystem` para ativar eventos quando steps específicos forem atingidos.
4. **NPCs e Interações**
   - Criar `BP_NPCInteractable` com interface `BPI_Interactable` (usada pelo Input da Etapa 2).
   - Configurar diálogo básico via `DataTable` e `WBP_Dialogue` (ligado ao HUD da Etapa 8).
5. **Otimização e Rede**
   - Usar `Net Cull Distance` e `Replication Graph` Blueprint-friendly (via plugins) para limitar replicação de spawns distantes.
   - Validar despawn de atores ao descarregar níveis.

## Checklist de Saída
- Mundo segmentado com carregamento/descarga controlados.
- Spawners e eventos integrados a progressão.

## Verificações de Dependência
- Ativar evento de mundo ao completar quest de teste e observar spawn esperado.
- Checar logs para garantir que níveis são descarregados sem referências pendentes.
