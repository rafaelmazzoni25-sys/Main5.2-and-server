/*
================================================================================
Etapa 0 — Configuração de Módulos e Inicialização do Projeto
================================================================================
Objetivo
    Garantir que o projeto UE5+ inicia com módulo principal carregado, GameInstance
    dedicado, GameModeBase, subsistemas de dados e registradores de serviços que
    serão usados nas etapas seguintes.

Pré-requisitos
    • Projeto Unreal Engine 5.2 ou superior criado com C++.
    • Plugins GAS (GameplayAbilities), Enhanced Input e Niagara ativados.
    • Estrutura de pastas /Game/Data com as tabelas de itens, monstros e skills.

Checklist de Implementação
    1. Declarar o módulo principal (Primary Game Module) com logging padronizado.
    2. Criar GameInstance personalizado responsável por bootstrapping de sistemas
       assíncronos, carregamento de DataTables e registro de Singletons.
    3. Registrar EngineSubsystem com acesso rápido ao StreamableManager global.
    4. Configurar GameModeBase inicial (lobby/mundo) e PlayerState padrão.
    5. Definir rotinas de sanity-check (asserts, ensures) para assets essenciais.
    6. Preparar um serviço de configuração que leia valores de arquivo INI para
       alternar características do servidor/cliente.

Testes Essenciais
    • Rodar o jogo no editor e validar logs de inicialização sem warnings.
    • Confirmar que as DataTables críticas são carregadas (Itens, Skills, Monsters).
    • Abrir o mapa padrão e verificar que HUD base e input funcionam (depois da
      Etapa 1 e 2).
*/

#include "Modules/ModuleManager.h"
#include "Engine/GameInstance.h"
#include "Engine/Engine.h"
#include "Engine/DataTable.h"
#include "Engine/StreamableManager.h"
#include "Subsystems/EngineSubsystem.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Misc/ConfigCacheIni.h"
#include "GameFramework/GameModeBase.h"
#include "GameFramework/PlayerState.h"
#include "UObject/ConstructorHelpers.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeStartup, Log, All);

IMPLEMENT_PRIMARY_GAME_MODULE(FDefaultGameModuleImpl, ProjectRemake, "ProjectRemake");

// -----------------------------------------------------------------------------
//  Subsystema de dados global: mantém StreamableManager e verifica DataTables
// -----------------------------------------------------------------------------
class URemakeDataSubsystem : public UEngineSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override
    {
        UE_LOG(LogRemakeStartup, Log, TEXT("URemakeDataSubsystem::Initialize"));
        StreamableManager = MakeShared<FStreamableManager>();
        LoadCoreDataTables();
    }

    virtual void Deinitialize() override
    {
        StreamableManager.Reset();
    }

    TSharedPtr<FStreamableManager> GetStreamableManager() const
    {
        return StreamableManager;
    }

    const TMap<FName, TObjectPtr<UDataTable>>& GetLoadedTables() const
    {
        return LoadedTables;
    }

private:
    void LoadCoreDataTables()
    {
        const TPair<FName, FString> TablesToLoad[] = {
            {TEXT("Items"), TEXT("/Game/Data/DT_Items.DT_Items")},
            {TEXT("Skills"), TEXT("/Game/Data/DT_Skills.DT_Skills")},
            {TEXT("Monsters"), TEXT("/Game/Data/DT_Monsters.DT_Monsters")}
        };

        for (const TPair<FName, FString>& Entry : TablesToLoad)
        {
            UDataTable* Table = LoadObject<UDataTable>(nullptr, *Entry.Value);
            if (!ensureAlwaysMsgf(Table, TEXT("Falha ao carregar DataTable %s"), *Entry.Value))
            {
                continue;
            }

            LoadedTables.Add(Entry.Key, Table);
            UE_LOG(LogRemakeStartup, Log, TEXT("Carregada DataTable %s"), *Entry.Value);
        }
    }

private:
    TSharedPtr<FStreamableManager> StreamableManager;
    TMap<FName, TObjectPtr<UDataTable>> LoadedTables;
};

// -----------------------------------------------------------------------------
//  Serviço de configuração: leitura de ini para habilitar features
// -----------------------------------------------------------------------------
class URemakeProjectSettingsSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override
    {
        ReloadFromConfig();
    }

    void ReloadFromConfig()
    {
        GConfig->GetBool(TEXT("Remake.Settings"), TEXT("bEnableDedicatedServer"), bEnableDedicatedServer, GGameIni);
        GConfig->GetString(TEXT("Remake.Settings"), TEXT("MatchmakingURL"), MatchmakingEndpoint, GGameIni);
    }

    bool IsDedicatedServer() const { return bEnableDedicatedServer; }
    const FString& GetMatchmakingEndpoint() const { return MatchmakingEndpoint; }

private:
    bool bEnableDedicatedServer = false;
    FString MatchmakingEndpoint;
};

// -----------------------------------------------------------------------------
//  GameInstance personalizado: orquestra inicialização
// -----------------------------------------------------------------------------
class URemakeGameInstance : public UGameInstance
{
    GENERATED_BODY()

public:
    virtual void Init() override
    {
        Super::Init();

        UE_LOG(LogRemakeStartup, Log, TEXT("URemakeGameInstance::Init"));

        DataSubsystem = GetSubsystem<URemakeDataSubsystem>();
        SettingsSubsystem = GetSubsystem<URemakeProjectSettingsSubsystem>();

        ensureAlwaysMsgf(DataSubsystem != nullptr, TEXT("Subsystem de dados não encontrado"));
        ensureAlwaysMsgf(SettingsSubsystem != nullptr, TEXT("Subsystem de config não encontrado"));

        BootstrapAsyncLoading();
    }

    URemakeDataSubsystem* GetDataSubsystem() const { return DataSubsystem; }
    URemakeProjectSettingsSubsystem* GetSettingsSubsystem() const { return SettingsSubsystem; }

private:
    void BootstrapAsyncLoading()
    {
        if (!DataSubsystem)
        {
            return;
        }

        TSharedPtr<FStreamableManager> Streamable = DataSubsystem->GetStreamableManager();
        if (!Streamable.IsValid())
        {
            return;
        }

        const FStringAssetReference CoreHUDRef(TEXT("/Game/UI/WBP_CoreHUD.WBP_CoreHUD"));
        Streamable->RequestAsyncLoad(CoreHUDRef, FStreamableDelegate::CreateLambda([]()
        {
            UE_LOG(LogRemakeStartup, Log, TEXT("HUD principal pré-carregado."));
        }));
    }

private:
    UPROPERTY()
    TObjectPtr<URemakeDataSubsystem> DataSubsystem = nullptr;

    UPROPERTY()
    TObjectPtr<URemakeProjectSettingsSubsystem> SettingsSubsystem = nullptr;
};

// -----------------------------------------------------------------------------
//  PlayerState padrão com ponte para GAS (detalhado na etapa 1/2)
// -----------------------------------------------------------------------------
class ARemakePlayerState : public APlayerState
{
    GENERATED_BODY()

public:
    ARemakePlayerState()
    {
        NetUpdateFrequency = 30.f;
    }
};

// -----------------------------------------------------------------------------
//  GameModeBase inicial e helpers para rotas de mapas
// -----------------------------------------------------------------------------
class ARemakeGameModeBase : public AGameModeBase
{
    GENERATED_BODY()

public:
    ARemakeGameModeBase()
    {
        PlayerStateClass = ARemakePlayerState::StaticClass();
    }

    virtual void StartPlay() override
    {
        Super::StartPlay();
        UE_LOG(LogRemakeStartup, Log, TEXT("GameModeBase ativo. Mapa: %s"), *GetWorld()->GetMapName());
    }
};

// -----------------------------------------------------------------------------
//  Guia rápido de integração (resumo)
// -----------------------------------------------------------------------------
/*
Configuração no Editor:
    • Edit → Project Settings → Maps & Modes → GameInstance Class = RemakeGameInstance.
    • Maps & Modes → Default GameMode = RemakeGameModeBase.
    • Adicionar os subsistemas aos módulos através do .uproject (dependências).

Blueprints & Conteúdo:
    • Criar Blueprint derivado de RemakeGameModeBase para definir HUD/Menu.
    • Criar BP_PlayerState herdando de RemakePlayerState para variáveis extras.

Validação:
    • Ativar stat startup no console para acompanhar tempo de inicialização.
    • Garantir que logs de carregamento de tabelas apareçam no Output Log.
*/
