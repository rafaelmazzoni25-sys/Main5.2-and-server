# Etapa 4 — Combate e Habilidades Fundamentais

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P4 — Alta |
| **Dependências Diretas** | Etapas 0, 1, 2 e 3 |
| **Desbloqueia** | Etapas 5, 6, 7, 8 e 9 |
| **Foco UE5+** | Blueprint com Gameplay Ability System (GAS) |
| **Linha do Tempo Indicativa** | Semana 2 — Sessões 3 e 4 |

## Marco Principal
Construir o loop de combate base usando o Gameplay Ability System em Blueprint, incluindo habilidades leves/pesadas, cooldowns e aplicação de efeitos de status replicados.

## Pré-requisitos Organizacionais
- `BP_RemakeCharacter` com `GameplayAbilitySystemComponent` ativo (Etapa 1).
- Inputs de combate mapeados (Etapa 2).
- Movimentação avançada operante (Etapa 3).

## Sequência Cronológica em Blueprint
1. **Setup do GAS**
   - Criar `BP_RemakeAbilitySystem` (Blueprint Function Library) para registrar tags globais (`GameplayTag` DataTable).
   - Criar `GA_LightAttack`, `GA_HeavyAttack`, `GA_DashAttack` com `AbilityTask_PlayMontageAndWait`.
   - Configurar `GE_BaseDamage`, `GE_StaminaCost` como Gameplay Effects.
2. **Grant Default Abilities**
   - No `BP_RemakeCharacter`, chamar `GrantDefaultAbilities` após carregar DataTable de habilidades.
   - Controlar disponibilidade via `Ability Tags` (`Ability.Combat.Light`, etc.).
3. **Cooldowns e Recursos**
   - Adicionar `Gameplay Effect` de cooldown com `Duration Policy = Has Duration`.
   - Atualizar HUD (Etapa 8) via `Event Dispatcher` disparado ao iniciar/encerrar cooldown.
4. **Feedback Visual e Audio**
   - Integrar `Niagara` placeholders e `Sound Cue` via `Spawn System at Location` ao confirmar hits.
   - Reusar `BP_RemakeLogger` para warnings de habilidades sem DataTable.
5. **Integração com AI e Multiplayer**
   - Garantir execução no servidor para validar hits (`Apply Gameplay Effect to Target`).
   - Configurar `Ability Tasks` com `Replication Policy = Server Only` quando necessário.

## Checklist de Saída
- Habilidades principais funcionando com tags, cooldowns e custos.
- Gameplay Effects registrados e replicando valores de dano/recursos.

## Verificações de Dependência
- Testar combate em sessão multiplayer (`Listen Server + 1 Client`) observando replicação.
- Validar logs sem erros de tag ausente ou ability não concedida.

## Referências do Código Original
- **Regras de ataque**: `CAttack::Attack` (GameServer) confere conexão, mapa, flags de PvP e integra sistemas como Duel, Siege e eventos PvP, indicando as verificações obrigatórias para `Gameplay Abilities` e `Authority Only` no remake. 【F:Source MuServer Update 15/GameServer/GameServer/Attack.cpp†L1-L74】
