# Etapa 1 — Personagem Jogador e Estado Básico

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P1 — Crítica |
| **Dependências Diretas** | Etapa 0 |
| **Desbloqueia** | Etapas 2, 3, 4, 5 e progressão futura do personagem |
| **Foco UE5+** | Blueprint puro com componentes GAS expostos |
| **Linha do Tempo Indicativa** | Semana 1 — Sessões 3 e 4 |

## Marco Principal
Construir o personagem jogável principal com Blueprint, definindo malha, componentes vitais, barras de vida/recursos e integrações iniciais com o Ability System para suportar etapas futuras.

## Pré-requisitos Organizacionais
- `BP_RemakeGameMode` configurado para usar `Default Pawn Class` personalizado.
- DataTables carregadas via `BP_RemakeGameInstance` (Etapa 0).

## Sequência Cronológica em Blueprint
1. **Blueprint do Personagem**
   - Criar `BP_RemakeCharacter` derivado de `Character`.
   - Configurar `SkeletalMesh` padrão, `Animation Blueprint` placeholder e `Capsule Component` com dimensões corretas.
   - Adicionar componentes `SpringArm` + `Camera` (ajustes finos ocorrerão na Etapa 2).
2. **Instalar Componentes Essenciais**
   - Adicionar `BP_AttributeSetComponent` (ActorComponent) para encapsular atributos base (`Health`, `Mana`, `Stamina`).
   - Anexar `GameplayAbilitySystemComponent` (GAS) e marcar como replicado.
   - Criar variáveis `CurrentWeapon`, `EquippedItems` (map `Slot` -> `ItemID`).
3. **Preparar Setup Automático**
   - No evento `BeginPlay`, chamar `Initialize Attributes` (função custom) para preencher atributos a partir de DataTable (`Get Data Table Row`).
   - Vincular `OnAttributeChanged` para atualizar UI via `Event Dispatchers` (consumidos na Etapa 8).
   - Criar função `GrantDefaultAbilities` chamando `Give Ability` para habilidades de movimento/combate básicas definidas na Etapa 4.
4. **Configurar Estados e Replicação**
   - Definir `PlayerState` como `BP_RemakePlayerState` e, no `BeginPlay`, sincronizar `CharacterID`, `ClassID` com `PlayerState`.
   - Usar `OnRep_CurrentWeapon` para atualizar malhas anexadas e efeitos visuais (Niagara placeholder).
5. **Expor Interfaces Futuras**
   - Criar interfaces Blueprint `BPI_InventoryCarrier` (para Etapa 5) com funções `GetEquippedItems`, `CanEquipItem`.
   - Preparar `Event Dispatchers` `OnCharacterDowned`, `OnCharacterRevived` para lógica de combate e missões.

## Checklist de Saída
- `BP_RemakeCharacter` em `/Game/Characters` com componentes configurados e Ability System conectado.
- Interfaces Blueprint `BPI_InventoryCarrier` e `BPI_AttributeListener` (separada) na pasta `/Game/Interfaces`.

## Verificações de Dependência
- Executar `Play In Editor` com `Spawn Player at Player Start` e validar movimentação básica (mesmo antes da Etapa 2, usando controles default).
- Testar replicação abrindo sessão `Play As Listen Server` + `1 Client`; confirmar que atributos replicam.

## Referências do Código Original
- **Mapeamento de classes**: `CCharacterManager::GetCharacterClass` define o relacionamento entre identificadores do servidor e as classes jogáveis, base para montar `Enum`/`Data Table` usados pelos Blueprints de progressão. 【F:Source Main 5.2/source/CharacterManager.cpp†L1-L79】
