# Etapa 2 — Input e Câmera
**Prioridade:** Crítica  
**Depende de:** Etapas 0 e 1

## Objetivo
Configurar o sistema de input aprimorado, contextos de controle e lógicas de câmera totalmente em Blueprint para garantir movimentação suave e base para combate e interação.

## Pré-requisitos
- `BP_RemakeCharacter` com componentes `SpringArm` e `Camera`.
- Plugin **Enhanced Input** ativo e mapeamentos a partir de `InputAction`/`InputMappingContext`.

## Fluxo de Trabalho em Blueprint
1. **Configuração do Enhanced Input**
   - Crie `IMC_RemakeGameplay` (Input Mapping Context) contendo ações `IA_Move`, `IA_Look`, `IA_Jump`, `IA_Attack`, `IA_Interact`.
   - Defina `Triggers` e `Modifiers` (ex.: `IA_Move` com `DeadZone`, `IA_Attack` com `Tap or Hold`).
   - Em `BP_RemakePlayerController`, no evento `BeginPlay`, use `Add Mapping Context` apontando para `IMC_RemakeGameplay` com prioridade 0.

2. **Processamento no Personagem**
   - Em `BP_RemakeCharacter`, implemente `Enhanced Input` via `Input Action` events (`IA_Move` -> `Input Action Event`).
   - `IA_Move`: use `Break Vector2D`, `Add Movement Input` com vetor `Forward` e `Right`.
   - `IA_Look`: utilize `Add Controller Yaw Input` e `Add Controller Pitch Input`, ajustando sensibilidade com variável `LookRate`.
   - `IA_Jump`: chame `Jump`/`Stop Jumping` (será refinado com habilidades na Etapa 4).

3. **Câmera e SpringArm**
   - Configure `SpringArm` com `Use Pawn Control Rotation` e `Target Arm Length` base.
   - Adicione interpolações: use `Timeline` `TL_CameraZoom` acionada por `Mouse Wheel` (`IA_Zoom`). A Timeline interpola `Target Arm Length` e `Socket Offset`.
   - Configure `Camera Lag` e `Enable Camera Lag` com valores calibráveis em Data Assets.

4. **Modos de Câmera**
   - Crie `Enum ECameraMode` com valores `Exploration`, `Combat`, `InventoryPreview`.
   - No personagem, mantenha variável `CurrentCameraMode`. Use `Switch on ECameraMode` para ajustar `Target Arm Length`, `Camera FOV` e ativar/desativar `PostProcess` volumes.
   - Exponha função `SetCameraMode` utilizada na Etapa 5 (preview de itens) e Etapa 8 (HUD).

5. **Depuradores**
   - Adicione comando `Cheat Manager` Blueprint `BP_RemakeCheatManager` com função `CycleCameraMode` para QA.

## Entregáveis
- `IMC_RemakeGameplay`, `IA_*` assets configurados na pasta `/Game/Input`.
- `BP_RemakePlayerController` Blueprint configurado e atribuído ao GameMode.
- Funções de modo de câmera acessíveis a outros sistemas.

## Verificações
- `Play In Editor` usando teclado/mouse e gamepad; validar que sensibilidade pode ser ajustada via `DA_RemakeSettings`.
- Testar troca de modos de câmera via comando debug e confirmar comportamento esperado.
