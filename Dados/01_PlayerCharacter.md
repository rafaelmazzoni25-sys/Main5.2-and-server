# Etapa 1 — Personagem Jogador e Estado Básico
**Prioridade:** Crítica  
**Depende de:** Etapa 0

## Objetivo
Construir o personagem jogável principal com Blueprint, definindo malha, componentes vitais, barras de vida/recursos e integrações iniciais com o Ability System para suportar etapas futuras.

## Pré-requisitos
- `BP_RemakeGameMode` configurado para usar `Default Pawn Class` personalizado.
- DataTables carregadas via `BP_RemakeGameInstance` (Etapa 0).

## Fluxo de Trabalho em Blueprint
1. **Blueprint do Personagem**
   - Crie `BP_RemakeCharacter` derivado de `Character`.
   - Configure `SkeletalMesh` padrão, `Animation Blueprint` placeholder e `Capsule Component` com dimensões corretas.
   - Adicione componentes `SpringArm` + `Camera` (serão ajustados na Etapa 2).

2. **Componentes Essenciais**
   - Adicione `BP_AttributeSetComponent` (ActorComponent) para encapsular atributos base (`Health`, `Mana`, `Stamina`).
   - Anexe `GameplayAbilitySystemComponent` (GAS) e marque como replicado.
   - Crie variáveis `CurrentWeapon`, `EquippedItems` (map `Slot` -> `ItemID`).

3. **Blueprints de Setup**
   - No evento `BeginPlay`, chame `Initialize Attributes` (função custom) para preencher atributos a partir de DataTable (`Get Data Table Row`).
   - Vincule `OnAttributeChanged` -> atualize UI via `Event Dispatchers` (usados pela Etapa 8).
   - Crie função `GrantDefaultAbilities` chamando `Give Ability` para habilidades de movimento/combate básicas definidas na Etapa 4.

4. **Estados e Replicação**
   - Defina `PlayerState` como `BP_RemakePlayerState` e no `BeginPlay` sincronize `CharacterID`, `ClassID` com `PlayerState`.
   - Use `OnRep_CurrentWeapon` para atualizar malhas anexadas e efeitos visuais (Niagara placeholder).

5. **Interações Futuras**
   - Exponha interfaces Blueprint: `BPI_InventoryCarrier` (para Etapa 5) com funções `GetEquippedItems`, `CanEquipItem`.
   - Prepare `Event Dispatchers` `OnCharacterDowned`, `OnCharacterRevived` para lógica de combate e missões.

## Entregáveis
- `BP_RemakeCharacter` em `/Game/Characters` com componentes configurados e Ability System conectado.
- Interfaces Blueprint `BPI_InventoryCarrier` e `BPI_AttributeListener` (separada) na pasta `/Game/Interfaces`.

## Verificações
- `Play In Editor` com `Spawn Player at Player Start` e validar movimentação básica (mesmo antes da Etapa 2, usando controles default).
- Testar replicação abrindo uma sessão `Play As Listen Server` + `1 Client`; confirmar que atributos replicam.
