// Etapa 0: Configuração de Módulo e Inicialização do Projeto
// Este arquivo descreve o ponto de partida do remake UE5: definição do módulo,
// GameInstance, GameModeBase e subsistemas essenciais para carregar dados.

#include "Modules/ModuleManager.h"
#include "Engine/GameInstance.h"
#include "GameFramework/GameModeBase.h"
#include "Subsystems/EngineSubsystem.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Engine/DataTable.h"
#include "Engine/StreamableManager.h"

IMPLEMENT_PRIMARY_GAME_MODULE(FDefaultGameModuleImpl, ProjectRemake, "ProjectRemake");

class URemakeDataSubsystem : public UEngineSubsystem
{
GENERATED_BODY()

public:
virtual void Initialize(FSubsystemCollectionBase& Collection) override
{
StreamableManager = MakeShared<FStreamableManager>();
LoadDataTables();
}

TSharedPtr<FStreamableManager> GetStreamableManager() const { return StreamableManager; }

private:
void LoadDataTables()
{
UDataTable* ItemTable = LoadObject<UDataTable>(nullptr, TEXT("/Game/Data/DT_Items.DT_Items"));
UDataTable* SkillTable = LoadObject<UDataTable>(nullptr, TEXT("/Game/Data/DT_Skills.DT_Skills"));
UDataTable* MonsterTable = LoadObject<UDataTable>(nullptr, TEXT("/Game/Data/DT_Monsters.DT_Monsters"));
ensureMsgf(ItemTable && SkillTable && MonsterTable, TEXT("Tabelas base não carregadas"));
}

private:
TSharedPtr<FStreamableManager> StreamableManager;
};

UCLASS()
class URemakeGameInstance : public UGameInstance
{
GENERATED_BODY()

public:
virtual void Init() override
{
Super::Init();
InitializeServiceLocators();
}

URemakeDataSubsystem* GetDataSubsystem() const
{
return GetEngine()->GetEngineSubsystem<URemakeDataSubsystem>();
}

private:
void InitializeServiceLocators()
{
// Registrar singletons globais, conexões de servidor e filas de matchmaking
}
};

UCLASS()
class ARemakeGameMode : public AGameModeBase
{
GENERATED_BODY()

public:
ARemakeGameMode()
{
DefaultPawnClass = ARemakePlayerCharacter::StaticClass();
PlayerControllerClass = ARemakePlayerController::StaticClass();
HUDClass = ARemakeHUD::StaticClass();
}

virtual void StartPlay() override
{
Super::StartPlay();
SpawnInitialWorldActors();
}

private:
void SpawnInitialWorldActors()
{
// Instancia portais, NPCs de tutorial e gatilhos do mundo aberto
}
};

// Notas de Implementação:
// 1. Crie o projeto C++ em UE5, substitua o módulo padrão por este conteúdo.
// 2. Configure o mapa de inicialização para usar ARemakeGameMode e URemakeGameInstance.
// 3. Prepare as DataTables referenciadas antes das fases seguintes.
