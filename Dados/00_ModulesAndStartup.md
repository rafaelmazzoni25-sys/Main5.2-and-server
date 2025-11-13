# Etapa 0 — Fundamentos do Projeto e Subsystems
**Prioridade:** Crítica  
**Depende de:** Nenhuma

## Objetivo
Iniciar o remake na Unreal Engine 5+ com uma base Blueprint estável: módulos habilitados, GameInstance e GameMode configurados, tabelas de dados centralizadas e serviços de configuração acessíveis às etapas posteriores.

## Pré-requisitos
- Projeto criado em Unreal Engine 5.2 ou superior com suporte a Blueprints e C++ (somente para hotfixes quando indispensável).
- Plugins habilitados: **Gameplay Ability System**, **Enhanced Input**, **Niagara**, **Level Sequence**, **UMG**.
- Pastas organizadas como `/Game/Core`, `/Game/Data`, `/Game/Blueprints`, `/Game/UI`.

## Fluxo de Trabalho em Blueprint
1. **GameInstance Blueprint**
   - Crie `BP_RemakeGameInstance` derivado de `GameInstance`.
   - No evento `Init`, carregue DataTables usando o nó `Load Data Table` para `DT_Items`, `DT_Skills`, `DT_Monsters`.
   - Armazene referências em variáveis `DT_Items`, `DT_Skills`, `DT_Monsters` marcadas como `Instance Editable` e `Expose on Spawn` para acesso rápido.
   - Implemente um `Async Load Asset` (usando `Primary Asset Label` ou `Streamable Manager` via Blueprint) para conjuntos essenciais (HUD, personagens base).

2. **Subsystems**
   - Crie `BP_RemakeEngineSubsystem` derivado de `EngineSubsystem` (Blueprintable em editor via `Editor Utility Blueprint` se necessário).
   - Exponha função `GetStreamableManager` que retorna um `Streamable Handle` global (`Make Streamable Manager`).
   - Configure um `GameInstanceSubsystem` Blueprint `BP_ConfigSubsystem` com evento `On Game Instance Init`. Nele, use `Get Game User Settings` + `Load Settings` e leia parâmetros de `Config/Data/RemakeSettings.ini` usando `Get Platform Config` (via Blueprint Function Library customizada se preciso).

3. **GameMode e PlayerState**
   - Crie `BP_RemakeGameMode` definindo `Default Pawn Class` como placeholder e `HUD Class` vazio (será preenchido na Etapa 8).
   - Configure `BP_RemakePlayerState` com variáveis replicadas: `AccountID`, `CharacterID`, `ProgressionLevel`.
   - Em `Project Settings > Maps & Modes`, defina `BP_RemakeGameMode` e `BP_RemakeGameInstance` como padrão.

4. **Serviço de Logging e Assertivas**
   - Crie `BP_RemakeLogger` em `Blueprint Function Library` com funções `Log Info`, `Log Warning`, `Ensure Data Table Loaded`.
   - Chame `Ensure Data Table Loaded` no final do `Init` da GameInstance para validar ativos essenciais.

5. **Configurações Compartilhadas**
   - Centralize Data Assets `DA_RemakeSettings` (PrimaryDataAsset) com switches (`bEnableDedicatedServer`, `bUseMultithreadedLoading`).
   - Em `BP_ConfigSubsystem`, leia o Data Asset via `Get Primary Asset Data` e exponha eventos `OnSettingsUpdated`.

## Entregáveis
- `BP_RemakeGameInstance`, `BP_RemakeGameMode`, `BP_RemakePlayerState` salvos em `/Game/Core`.
- Subsystems configurados na pasta `/Game/Core/Subsystems`.
- DataTables referenciadas e verificadas.

## Verificações
- Executar o editor e confirmar logs de inicialização sem warnings.
- Validar, via `Blueprint Debug`, que variáveis de DataTables estão preenchidas.
- Realizar `Play In Editor` no mapa padrão para confirmar carregamento de HUD base (após Etapa 8).
