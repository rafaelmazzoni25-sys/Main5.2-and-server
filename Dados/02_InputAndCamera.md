# Etapa 2 — Input Avançado e Sistemas de Câmera

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P2 — Alta |
| **Dependências Diretas** | Etapas 0 e 1 |
| **Desbloqueia** | Etapas 3, 4, 5, 7 e 8 |
| **Foco UE5+** | Blueprint com Enhanced Input e Camera Managers |
| **Linha do Tempo Indicativa** | Semana 1 — Sessões 5 e 6 |

## Marco Principal
Configurar Enhanced Input, PlayerController, modos de câmera e ações contextuais para que movimentos, combate e interação possam evoluir nas próximas etapas.

## Pré-requisitos Organizacionais
- `BP_RemakeCharacter` com componentes de câmera anexados (Etapa 1).
- Tabelas de ações de input definidas em `/Game/Data/Input/` (pode iniciar com placeholders).

## Sequência Cronológica em Blueprint
1. **Enhanced Input Setup**
   - Criar `BP_RemakeInputConfig` (Data Asset) listando `Input Actions` para movimento, câmera, combate leve, interação.
   - Configurar `BP_RemakePlayerController` derivado de `PlayerController` para usar `Enhanced Input Local Player Subsystem` no evento `BeginPlay`.
   - Mapear `Input Mapping Context` principal e definir prioridade 0.
2. **Bindings do Personagem**
   - No `BP_RemakeCharacter`, criar função `SetupInputContext` chamada pelo PlayerController via `Interface`.
   - Associar `Input Action Move` ao evento `Enhanced Input Action` -> `Add Movement Input`.
   - Associar `Input Action Look` ao `Add Controller Yaw/Pitch Input` e limitar pitch com `Clamp`.
3. **Modos de Câmera**
   - Criar `BP_RemakeCameraManager` derivado de `PlayerCameraManager` com `Blend` entre câmera de exploração e combate.
   - Utilizar `Set View Target with Blend` ao alternar estado `bIsInCombat` (variável do personagem atualizada na Etapa 4).
   - Implementar curva de distância de câmera (Timeline em Blueprint) para zoom dinâmico.
4. **Ações Contextuais**
   - Configurar `Input Action Interact` que chama `TryInteract` em `BP_RemakeCharacter` (usará interface com objetos interativos).
   - Criar `Input Action QuickSlot` com enum `EQuickSlot` para itens rápidos (será consumido na Etapa 5).
   - Registrar `Input Action ToggleInventory` abrindo HUD da Etapa 8.
5. **Testes Multiplayer**
   - Marcar `BP_RemakePlayerController` e `BP_RemakeCameraManager` como replicáveis onde necessário e verificar instâncias separadas.

## Checklist de Saída
- `BP_RemakePlayerController`, `BP_RemakeCameraManager` e Data Assets de input configurados em `/Game/Core`.
- Blueprint do personagem respondendo a ações de movimento, câmera e interação.

## Verificações de Dependência
- `Play In Editor` com dois clientes para garantir que cada PlayerController possui sua câmera independente.
- Validar que alternar `Input Mapping Context` não afeta instâncias remotas.
