/*
================================================================================
Etapa 9 — Rede, Persistência e Serviços Online
================================================================================
Objetivo
    Configurar replicação autoritativa, sessões online, persistência de dados do
    jogador e integrações com backend (auth, inventário, progressão).

Pré-requisitos
    • Etapas anteriores implementadas (inventário, quests, progresso, HUD).
    • Backend de autenticação/serviços definido (REST, gRPC ou PlayFab/AWS).

Checklist de Implementação
    1. Configurar subsystem online (EOS, Steam ou serviço próprio).
    2. Criar GameSession personalizado com controle de slots e filas.
    3. Implementar PlayerState replicado com inventário, XP e estatísticas.
    4. Configurar SaveGame/Cloud save com serialização de inventário/quests.
    5. Criar DataReplicationSubsystem para broadcast de eventos customizados.
    6. Implementar camada de rede para chat, guilds e trading.

Testes Essenciais
    • Executar testes dedicados (servidor + 2 clientes) e validar replicação.
    • Simular perda de pacotes (NetPktLoss) e confirmar reenvio de RPCs críticos.
    • Salvar/Carregar jogador e garantir integridade dos dados (checksums).
*/

#include "CoreMinimal.h"
#include "GameFramework/GameSession.h"
#include "GameFramework/PlayerState.h"
#include "GameFramework/GameModeBase.h"
#include "OnlineSubsystem.h"
#include "Interfaces/OnlineSessionInterface.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/World.h"
#include "Engine/Engine.h"
#include "GameFramework/SaveGame.h"
#include "Net/UnrealNetwork.h"
#include "Misc/FileHelper.h"
#include "Misc/Guid.h"
#include "Misc/Paths.h"
#include "Serialization/JsonSerializer.h"
#include "Serialization/JsonWriter.h"
#include "Serialization/JsonReader.h"
#include "Subsystems/GameInstanceSubsystem.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeNetworking, Log, All);

class URemakeInventoryComponent;
class URemakeQuestComponent;
class URemakeProgressionComponent;

// -----------------------------------------------------------------------------
//  GameSession personalizado
// -----------------------------------------------------------------------------
UCLASS()
class ARemakeGameSession : public AGameSession
{
    GENERATED_BODY()

public:
    ARemakeGameSession();

    virtual void RegisterServer() override;
    virtual void UnregisterServer() override;

    void SetMaxPlayers(int32 InMaxPlayers) { MaxPlayersOverride = InMaxPlayers; }

private:
    int32 MaxPlayersOverride = 100;
};

ARemakeGameSession::ARemakeGameSession()
{
    MaxPlayers = MaxPlayersOverride;
}

void ARemakeGameSession::RegisterServer()
{
    Super::RegisterServer();

    if (IOnlineSubsystem* Subsystem = IOnlineSubsystem::Get())
    {
        IOnlineSessionPtr SessionInterface = Subsystem->GetSessionInterface();
        if (SessionInterface.IsValid())
        {
            FOnlineSessionSettings SessionSettings;
            SessionSettings.NumPublicConnections = MaxPlayersOverride;
            SessionSettings.bShouldAdvertise = true;
            SessionSettings.bIsDedicated = true;
            SessionSettings.bUsesPresence = true;

            SessionInterface->CreateSession(0, NAME_GameSession, SessionSettings);
        }
    }
}

void ARemakeGameSession::UnregisterServer()
{
    Super::UnregisterServer();

    if (IOnlineSubsystem* Subsystem = IOnlineSubsystem::Get())
    {
        if (IOnlineSessionPtr SessionInterface = Subsystem->GetSessionInterface())
        {
            SessionInterface->DestroySession(NAME_GameSession);
        }
    }
}

// -----------------------------------------------------------------------------
//  PlayerState com persistência
// -----------------------------------------------------------------------------
UCLASS()
class ARemakePlayerState : public APlayerState
{
    GENERATED_BODY()

public:
    ARemakePlayerState();

    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    void InitializeComponents();
    void SerializeToJson(TSharedPtr<FJsonObject>& OutObject) const;
    void DeserializeFromJson(const TSharedPtr<FJsonObject>& InObject);

    UFUNCTION(Server, Reliable)
    void ServerRequestSave();

private:
    UPROPERTY(Replicated)
    TObjectPtr<URemakeInventoryComponent> InventoryComponent;

    UPROPERTY(Replicated)
    TObjectPtr<URemakeProgressionComponent> ProgressionComponent;

    UPROPERTY(Replicated)
    TObjectPtr<URemakeQuestComponent> QuestComponent;
};

ARemakePlayerState::ARemakePlayerState()
{
    NetUpdateFrequency = 30.f;
}

void ARemakePlayerState::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);

    DOREPLIFETIME(ARemakePlayerState, InventoryComponent);
    DOREPLIFETIME(ARemakePlayerState, ProgressionComponent);
    DOREPLIFETIME(ARemakePlayerState, QuestComponent);
}

void ARemakePlayerState::InitializeComponents()
{
    InventoryComponent = GetOwner()->FindComponentByClass<URemakeInventoryComponent>();
    ProgressionComponent = GetOwner()->FindComponentByClass<URemakeProgressionComponent>();
    QuestComponent = GetOwner()->FindComponentByClass<URemakeQuestComponent>();
}

void ARemakePlayerState::SerializeToJson(TSharedPtr<FJsonObject>& OutObject) const
{
    OutObject = MakeShared<FJsonObject>();
    OutObject->SetNumberField(TEXT("Level"), ProgressionComponent ? ProgressionComponent->GetCurrentLevel() : 1);
    OutObject->SetNumberField(TEXT("XP"), ProgressionComponent ? ProgressionComponent->GetCurrentXP() : 0);
    // Serializar inventário e quests (ver Etapas 5 e 6)
}

void ARemakePlayerState::DeserializeFromJson(const TSharedPtr<FJsonObject>& InObject)
{
    // Restaurar dados em componentes correspondentes
}

void ARemakePlayerState::ServerRequestSave_Implementation()
{
    TSharedPtr<FJsonObject> SaveObject;
    SerializeToJson(SaveObject);

    FString OutputString;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&OutputString);
    FJsonSerializer::Serialize(SaveObject.ToSharedRef(), Writer);

    const FString SavePath = FPaths::ProjectSavedDir() / TEXT("PlayerSaves") / GetPlayerName() + TEXT(".json");
    FFileHelper::SaveStringToFile(OutputString, *SavePath);
}

// -----------------------------------------------------------------------------
//  Subsystem para requisições backend
// -----------------------------------------------------------------------------
UCLASS()
class URemakeBackendSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    void Initialize(FSubsystemCollectionBase& Collection) override;

    void AuthenticatePlayer(const FString& Ticket);
    void SubmitTelemetry(const FString& EventName, const TSharedPtr<FJsonObject>& Payload);

private:
    void HandleAuthResponse(bool bSuccess, const FString& PlayerId);

private:
    FString ActivePlayerId;
};

void URemakeBackendSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogRemakeNetworking, Log, TEXT("Backend subsystem inicializado"));
}

void URemakeBackendSubsystem::AuthenticatePlayer(const FString& Ticket)
{
    // Enviar requisição HTTP/REST para backend e obter PlayerId
    HandleAuthResponse(true, TEXT("Player123"));
}

void URemakeBackendSubsystem::SubmitTelemetry(const FString& EventName, const TSharedPtr<FJsonObject>& Payload)
{
    UE_LOG(LogRemakeNetworking, Verbose, TEXT("Telemetry: %s"), *EventName);
}

void URemakeBackendSubsystem::HandleAuthResponse(bool bSuccess, const FString& PlayerId)
{
    if (bSuccess)
    {
        ActivePlayerId = PlayerId;
        UE_LOG(LogRemakeNetworking, Log, TEXT("Player autenticado: %s"), *PlayerId);
    }
    else
    {
        UE_LOG(LogRemakeNetworking, Error, TEXT("Falha de autenticação"));
    }
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Servidores Dedicados:
    • Configurar DefaultEngine.ini com seção [OnlineSubsystem] apontando para provider.
    • Utilizar scripts de automação para subir múltiplas instâncias e monitorar logs.

Persistência:
    • Expandir SerializeToJson/DeserializeFromJson com inventário (Etapa 5) e quests (Etapa 6).
    • Integrar com serviço cloud (S3, Firebase, PlayFab) para backup.

Rede/Chat:
    • Implementar canal de chat replicado (RPC multicast) com flood control.
    • Testar NAT traversal ou uso de relay/turn caso necessário.
*/
