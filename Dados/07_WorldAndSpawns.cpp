/*
================================================================================
Etapa 7 — Mundo, Spawns e Eventos Dinâmicos
================================================================================
Objetivo
    Construir sistemas de spawn de monstros, bosses e eventos dinâmicos do mundo,
    com suporte a ciclo dia/noite e integração com progressão.

Pré-requisitos
    • Sistemas de combate e quests (Etapas 4 e 6).
    • Tabelas de monstros e bosses definidas.
    • Mapas com volumes de spawn configurados.

Checklist de Implementação
    1. Criar DataTable de monstros com atributos, drop tables e FX.
    2. Implementar SpawnManager que instancia e recicla monstros por região.
    3. Adicionar eventos de boss com timers e broadcasts globais (UI/HUD).
    4. Configurar ciclo de tempo e luz dinâmica (dia/noite) com impacto em spawns.
    5. Integrar com quests (kill counts) e drops (Etapa 5).
    6. Preparar hooks para eventos especiais (Blood Castle, Devil Square etc.).

Testes Essenciais
    • Validar respawn após morte do monstro com timers configuráveis.
    • Garantir que bosses avisam jogadores via HUD e log de sistema.
    • Checar carga de desempenho com `stat fps` e `stat memory` em zonas populosas.
*/

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "GameFramework/Actor.h"
#include "Engine/World.h"
#include "TimerManager.h"
#include "Net/UnrealNetwork.h"
#include "Components/BoxComponent.h"
#include "Kismet/KismetMathLibrary.h"
#include "NiagaraFunctionLibrary.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeWorld, Log, All);

// -----------------------------------------------------------------------------
//  Estruturas de dados
// -----------------------------------------------------------------------------
USTRUCT(BlueprintType)
struct FMonsterSpawnRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadOnly) FName MonsterId;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TSubclassOf<AActor> MonsterClass;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) float RespawnTime = 10.f;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TObjectPtr<UNiagaraSystem> SpawnFX;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) int32 MinLevel = 1;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) int32 MaxLevel = 400;
};

// -----------------------------------------------------------------------------
//  Volume de spawn que referencia DataTable
// -----------------------------------------------------------------------------
UCLASS()
class ARemakeSpawnVolume : public AActor
{
    GENERATED_BODY()

public:
    ARemakeSpawnVolume();

    virtual void BeginPlay() override;

    void InitializeSpawnTable(UDataTable* SpawnTable);

private:
    void SpawnMonster();
    UFUNCTION()
    void HandleMonsterDeath(AActor* DeadMonster);

private:
    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UBoxComponent> SpawnArea;

    UPROPERTY()
    TObjectPtr<UDataTable> SpawnDataTable;

    FMonsterSpawnRow CachedRow;
    FTimerHandle RespawnHandle;

    UPROPERTY()
    TObjectPtr<AActor> CurrentMonster;

    TArray<FMonsterSpawnRow*> SpawnRowsCache;
};

ARemakeSpawnVolume::ARemakeSpawnVolume()
{
    PrimaryActorTick.bCanEverTick = false;

    SpawnArea = CreateDefaultSubobject<UBoxComponent>(TEXT("SpawnArea"));
    SpawnArea->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    SetRootComponent(SpawnArea);
}

void ARemakeSpawnVolume::BeginPlay()
{
    Super::BeginPlay();
    SpawnMonster();
}

void ARemakeSpawnVolume::InitializeSpawnTable(UDataTable* SpawnTable)
{
    SpawnDataTable = SpawnTable;
}

void ARemakeSpawnVolume::SpawnMonster()
{
    if (!SpawnDataTable)
    {
        return;
    }

    SpawnRowsCache.Reset();
    if (!SpawnDataTable->GetAllRows<FMonsterSpawnRow>(TEXT("Spawn"), SpawnRowsCache) || SpawnRowsCache.Num() == 0)
    {
        return;
    }

    const int32 Index = FMath::RandHelper(SpawnRowsCache.Num());
    CachedRow = *SpawnRowsCache[Index];

    if (!CachedRow.MonsterClass)
    {
        return;
    }

    const FVector SpawnOrigin = SpawnArea->Bounds.Origin;
    const FVector Extent = SpawnArea->Bounds.BoxExtent;
    const FVector RandomPoint = UKismetMathLibrary::RandomPointInBoundingBox(SpawnOrigin, Extent);

    FActorSpawnParameters Params;
    Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

    CurrentMonster = GetWorld()->SpawnActor<AActor>(CachedRow.MonsterClass, RandomPoint, FRotator::ZeroRotator, Params);
    if (CurrentMonster)
    {
        CurrentMonster->OnDestroyed.AddDynamic(this, &ARemakeSpawnVolume::HandleMonsterDeath);

        if (CachedRow.SpawnFX)
        {
            UNiagaraFunctionLibrary::SpawnSystemAtLocation(GetWorld(), CachedRow.SpawnFX, RandomPoint);
        }
    }
}

void ARemakeSpawnVolume::HandleMonsterDeath(AActor* DeadMonster)
{
    if (DeadMonster != CurrentMonster)
    {
        return;
    }

    CurrentMonster = nullptr;

    if (CachedRow.RespawnTime > 0.f)
    {
        GetWorldTimerManager().SetTimer(RespawnHandle, this, &ARemakeSpawnVolume::SpawnMonster, CachedRow.RespawnTime, false);
    }
}

// -----------------------------------------------------------------------------
//  Gerenciador de eventos/bosses
// -----------------------------------------------------------------------------
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBossEventStarted, FName, BossId, float, Countdown);

UCLASS(Blueprintable)
class URemakeWorldEventManager : public UObject
{
    GENERATED_BODY()

public:
    void Initialize(UWorld* WorldContext, const TArray<FName>& BossRotation);

    void Tick(float DeltaSeconds);

    UPROPERTY(BlueprintAssignable)
    FOnBossEventStarted OnBossEventStarted;

private:
    void ScheduleNextBoss();
    void StartBossEvent(FName BossId);

private:
    UPROPERTY()
    TObjectPtr<UWorld> WorldReference;

    TArray<FName> BossOrder;
    int32 CurrentBossIndex = INDEX_NONE;
    float CountdownTimer = 0.f;
    float EventInterval = 900.f; // 15 minutos
};

void URemakeWorldEventManager::Initialize(UWorld* WorldContext, const TArray<FName>& BossRotation)
{
    WorldReference = WorldContext;
    BossOrder = BossRotation;
    ScheduleNextBoss();
}

void URemakeWorldEventManager::Tick(float DeltaSeconds)
{
    if (CountdownTimer > 0.f)
    {
        CountdownTimer -= DeltaSeconds;
        if (CountdownTimer <= 0.f)
        {
            const FName BossId = BossOrder.IsValidIndex(CurrentBossIndex) ? BossOrder[CurrentBossIndex] : NAME_None;
            StartBossEvent(BossId);
        }
    }
}

void URemakeWorldEventManager::ScheduleNextBoss()
{
    if (BossOrder.Num() == 0)
    {
        return;
    }

    CurrentBossIndex = (CurrentBossIndex + 1) % BossOrder.Num();
    CountdownTimer = EventInterval;
    OnBossEventStarted.Broadcast(BossOrder[CurrentBossIndex], CountdownTimer);
}

void URemakeWorldEventManager::StartBossEvent(FName BossId)
{
    UE_LOG(LogRemakeWorld, Log, TEXT("Evento de Boss iniciado: %s"), *BossId.ToString());
    ScheduleNextBoss();
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Blueprints:
    • Criar BP_SpawnVolume herdando de ARemakeSpawnVolume e definir BoxExtent.
    • DataTable `DT_MonsterSpawns` deve conter entradas para cada área.

Eventos Mundiais:
    • UI principal deve assinar OnBossEventStarted para mostrar contagem regressiva.
    • Integrar com sistema de notificações e chat global.

Testes:
    • Usar automação para simular 100 spawns e medir tempo médio de respawn.
    • Ajustar EventInterval conforme feedback de design.
*/
