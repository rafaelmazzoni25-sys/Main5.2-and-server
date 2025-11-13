# Etapa 3 — Movimentação Avançada e Navegação
**Prioridade:** Alta  
**Depende de:** Etapas 0, 1 e 2

## Objetivo
Expandir a movimentação do personagem para incluir sistemas de locomoção avançados, navegação com AI (para companion ou testes) e detecção de terreno usando Blueprints.

## Pré-requisitos
- `BP_RemakeCharacter` com input configurado.
- Mapas com `NavMeshBoundsVolume` básico posicionado.

## Fluxo de Trabalho em Blueprint
1. **Estados de Locomoção**
   - Adicione `Enum ELocomotionState` com estados `Idle`, `Jog`, `Sprint`, `Walk`, `Air`.
   - Use `Event Tick` minimizado (melhor via `Ability System`/`AnimBP`): crie função `UpdateMovementState` chamada em `OnMovementModeChanged` e `OnSpeedChanged`.
   - Ajuste `Character Movement Component` com `Max Walk Speed` dinâmico conforme estado.

2. **Dash e Esquiva**
   - Implemente `Ability_BP_Dash` (Gameplay Ability Blueprint). Configure `Ability Input` ligado a `IA_Dash` (Etapa 2).
   - Use `Launch Character` ou `Root Motion` do AnimMontage, com `Gameplay Effect` reduzindo stamina.

3. **Interação com Terreno**
   - Detecte `Physical Surface` via `Get Material` -> `Get Physical Material` -> `Switch on Physical Surface` para ajustar sons/FX.
   - Atualize `MovementMode` para `Falling` e `Swimming` ativando habilidades correspondentes.

4. **Navegação e Companion**
   - Crie `BP_RemakeCompanion` derivado de `Character` com `AIController`.
   - Configure `AI MoveTo` em `Behavior Tree` simples (BT_RemakeFollow) para seguir jogador ou pontos de interesse.
   - Exponha função `RequestPathToLocation` usada por sistemas de missões (Etapa 6).

5. **Escalada/Interações Verticais (Opcional Prioridade Alta)**
   - Configure `Ability_BP_Climb` usando `Trace` para detectar superfícies escaláveis.
   - Integre com `State Machine` do `Animation Blueprint`.

## Entregáveis
- Ability Blueprints `Ability_BP_Dash`, `Ability_BP_Climb` (se aplicável) em `/Game/Abilities/Movement`.
- Atualizações no `BP_RemakeCharacter` e `AnimBP_RemakeCharacter` com estados de locomoção.
- Companion AI funcional com Behavior Tree simples.

## Verificações
- Testar `Sprint`/`Dash` em `Play In Editor` e validar consumo de stamina (ligado ao AttributeSet).
- Usar `NavMesh` visualization (`P` no editor) e confirmar que companion segue jogador sem bloqueios.
