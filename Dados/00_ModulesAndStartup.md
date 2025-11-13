# Etapa 0 — Fundamentos do Projeto e Subsystems

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P0 — Crítica |
| **Dependências Diretas** | Nenhuma |
| **Desbloqueia** | Etapas 1 a 11 |
| **Foco UE5+** | Blueprint-first (C++ somente para hotfixes imprescindíveis) |
| **Linha do Tempo Indicativa** | Semana 1 — Sessões 1 e 2 |

## Marco Principal
Iniciar o remake na Unreal Engine 5+ com uma base Blueprint estável: módulos habilitados, GameInstance e GameMode configurados, tabelas de dados centralizadas e serviços de configuração acessíveis às etapas posteriores.

## Pré-requisitos Organizacionais
- Projeto criado em Unreal Engine 5.2 ou superior com suporte a Blueprints e C++ (apenas para hotfixes quando indispensável).
- Plugins habilitados: **Gameplay Ability System**, **Enhanced Input**, **Niagara**, **Level Sequence**, **UMG**.
- Pastas organizadas como `/Game/Core`, `/Game/Data`, `/Game/Blueprints`, `/Game/UI`.

## Sequência Cronológica em Blueprint
1. **Preparar GameInstance**
   - Criar `BP_RemakeGameInstance` derivado de `GameInstance`.
   - No evento `Init`, carregar DataTables usando `Load Data Table` para `DT_Items`, `DT_Skills`, `DT_Monsters`.
   - Armazenar referências em variáveis `DT_Items`, `DT_Skills`, `DT_Monsters` marcadas como `Instance Editable` e `Expose on Spawn`.
   - Implementar `Async Load Asset` (via `Primary Asset Label` ou `Streamable Manager`) para conjuntos essenciais (HUD, personagens base).
2. **Configurar Subsystems**
   - Criar `BP_RemakeEngineSubsystem` derivado de `EngineSubsystem` (Blueprintable via `Editor Utility Blueprint` se necessário).
   - Expor função `GetStreamableManager` que retorna um `Streamable Handle` global (`Make Streamable Manager`).
   - Configurar `BP_ConfigSubsystem` (GameInstanceSubsystem) com evento `On Game Instance Init`. Nele, usar `Get Game User Settings` + `Load Settings` e ler parâmetros de `Config/Data/RemakeSettings.ini` por meio de uma `Blueprint Function Library`.
3. **Definir GameMode e PlayerState**
   - Criar `BP_RemakeGameMode` definindo `Default Pawn Class` placeholder e `HUD Class` vazio (completado na Etapa 8).
   - Configurar `BP_RemakePlayerState` com variáveis replicadas: `AccountID`, `CharacterID`, `ProgressionLevel`.
   - Em `Project Settings > Maps & Modes`, definir `BP_RemakeGameMode` e `BP_RemakeGameInstance` como padrão.
4. **Implementar Serviço de Logging e Assertivas**
   - Criar `BP_RemakeLogger` (Blueprint Function Library) com funções `Log Info`, `Log Warning`, `Ensure Data Table Loaded`.
   - Chamar `Ensure Data Table Loaded` no final do `Init` da GameInstance para validar ativos essenciais.
5. **Consolidar Configurações Compartilhadas**
   - Centralizar Data Assets `DA_RemakeSettings` (PrimaryDataAsset) com switches (`bEnableDedicatedServer`, `bUseMultithreadedLoading`).
   - Em `BP_ConfigSubsystem`, ler o Data Asset via `Get Primary Asset Data` e expor eventos `OnSettingsUpdated`.

## Checklist de Saída
- `BP_RemakeGameInstance`, `BP_RemakeGameMode`, `BP_RemakePlayerState` salvos em `/Game/Core`.
- Subsystems configurados na pasta `/Game/Core/Subsystems`.
- DataTables referenciadas e verificadas no log de inicialização.

## Verificações de Dependência
- Executar o editor e confirmar logs de inicialização sem warnings.
- Validar, via `Blueprint Debug`, que variáveis de DataTables estão preenchidas.
- Realizar `Play In Editor` no mapa padrão para confirmar carregamento de HUD base (será completado na Etapa 8).
