# Etapa 7 — Mundo, Spawns e Eventos Dinâmicos
**Prioridade:** Média  
**Depende de:** Etapas 0, 1, 2, 3, 4 e 6

## Objetivo
Organizar o mundo, gerenciadores de spawn e eventos dinâmicos via Blueprints, permitindo que o conteúdo responda às missões e progressão do jogador.

## Pré-requisitos
- Sistemas de combate, missões e economia funcionando (Etapas 4 e 6).
- Níveis protótipos configurados com `Level Streaming` básico.

## Fluxo de Trabalho em Blueprint
1. **Gerenciador de Mundo**
   - Crie `BP_WorldDirector` (Actor colocado no nível persistente) com referências para Data Assets de spawn (`DA_SpawnTables`).
   - Em `BeginPlay`, carregue subníveis (`Load Stream Level`) conforme região e estado da campanha.

2. **Spawners**
   - Desenhe `BP_SpawnVolume` com `Box Collision` e função `SpawnEntity` que consulta `DA_SpawnTables`.
   - Integre com missões via `Event Dispatchers` (`OnQuestStageChanged` do QuestComponent) para ativar/desativar spawns.
   - Para bosses, use `Sequencer` (Level Sequence) disparado após completar objetivos críticos.

3. **Eventos Dinâmicos**
   - Configure `BP_WorldEvent` com estados `Pending`, `Active`, `Completed`.
   - Eventos podem disparar `Gameplay Cue` global (ex.: tempestade) e alterar tabelas de spawn.
   - Utilize `Environment Query System (EQS)` simples para posicionar eventos no mapa.

4. **Gerenciamento Dia/Noite**
   - Implemente `BP_TimeOfDayManager` controlando `Directional Light` e `SkyAtmosphere` via `Timeline`.
   - Exponha `Event Dispatchers` para HUD exibir relógio (Etapa 8) e para NPCs ajustarem comportamento.

5. **Streaming e Performance**
   - Habilite `World Partition` se o projeto exigir mapas grandes, configurando `Data Layers` por região.
   - Crie `Blueprint Function Library` `BFL_LevelHelpers` com utilitários para carregar/unload subníveis com callbacks.

## Entregáveis
- Blueprints `BP_WorldDirector`, `BP_SpawnVolume`, `BP_WorldEvent`, `BP_TimeOfDayManager`.
- Data Assets `DA_SpawnTables` com listas de inimigos/NPCs.

## Verificações
- Usar `Play In Editor` com modo `New Editor Window` e confirmar carregamento correto de subníveis.
- Monitorar spawns respondendo a progresso de missões.
- Validar que eventos dinâmicos ativam/param efeitos visuais e ajustes de spawn conforme esperado.
