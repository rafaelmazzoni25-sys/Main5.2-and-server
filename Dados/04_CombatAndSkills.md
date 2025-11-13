# Etapa 4 — Combate, Habilidades e Efeitos
**Prioridade:** Alta  
**Depende de:** Etapas 0, 1, 2 e 3

## Objetivo
Construir o loop de combate usando Blueprints com o Gameplay Ability System (GAS), incluindo habilidades ativas/passivas, efeitos de dano e feedback visual auditivo.

## Pré-requisitos
- Gameplay Ability System configurado no personagem (Etapa 1).
- Input mapeado (`IA_Attack`, `IA_Skill1`, etc.) na Etapa 2.

## Fluxo de Trabalho em Blueprint
1. **Estrutura de Dados**
   - Crie `DataTable` `DT_Abilities` com colunas `AbilityClass`, `InputTag`, `Cooldown`, `Cost`.
   - Configure `GameplayTags` para tipos de dano (`Damage.Fire`, `Damage.Ice`) e estados (`State.Stunned`).

2. **Habilidades Básicas**
   - Crie `Ability_BP_BasicAttack` (Gameplay Ability Blueprint). Use `Event Activate Ability` -> `Play Montage And Wait` -> `Apply Gameplay Effect To Target`.
   - Desenvolva `Ability_BP_HeavyAttack`, `Ability_BP_Block`, `Ability_BP_SkillSlot` para slots adicionais.
   - Use `Target Data` com traços (Trace) ou `SphereOverlap` para coletar alvos.

3. **Efeitos e Cooldown**
   - Crie `GE_Damage_Base` (Gameplay Effect Blueprint) aplicando `Health` negativo e tags de evento.
   - Configure `GE_Cooldown_BasicAttack` com duração definida na DataTable.
   - Use `Make Gameplay Effect Spec Handle` em Blueprint para aplicar efeitos escaláveis com atributos.

4. **Feedback Visual**
   - Configure `Niagara` sistemas para impacto e `AnimNotifies` que disparam `Spawn Emitter Attached`.
   - Adicione `Camera Shake` (Blueprint) e `Force Feedback` para controle.

5. **IA Inimiga Básica**
   - Crie `BP_RemakeEnemy` com `AbilitySystemComponent` e Behavior Tree `BT_RemakeEnemyCombat`.
   - Configure percepção (`AIPerception`) e resposta a tags (ex.: se receber `State.Stunned`, interromper comportamento via `Gameplay Event`).

6. **Integração com UI**
   - Prepare `Event Dispatchers` em `BP_RemakeCharacter` para notificar HUD (Etapa 8) sobre cooldowns e disponibilidade.

## Entregáveis
- Abilities `Ability_BP_*` e Gameplay Effects na pasta `/Game/Abilities/Combat`.
- DataTable `DT_Abilities` populada com habilidades críticas.
- Sistema básico de inimigos com Behavior Tree e Perception.

## Verificações
- Usar `Ability System Debug HUD` (`ShowDebug AbilitySystem`) para validar cooldowns e custos.
- Testar combate contra `BP_RemakeEnemy` no editor garantindo aplicação de efeitos e feedback visual.
