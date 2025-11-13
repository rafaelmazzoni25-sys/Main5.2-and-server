// Etapa 7: Mundo Aberto, Spawns e Bosses
// Configura geração de monstros, gerenciador de instâncias e eventos de mundo.

#include "GameFramework/Actor.h"
#include "Engine/World.h"
#include "TimerManager.h"
#include "Components/BoxComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetMathLibrary.h"

USTRUCT(BlueprintType)
struct FSpawnEntry
{
GENERATED_BODY()

UPROPERTY(EditAnywhere, BlueprintReadWrite) TSubclassOf<AActor> MonsterClass;
UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 3;
UPROPERTY(EditAnywhere, BlueprintReadWrite) float RespawnTime = 30.f;
};

UCLASS()
class ASpawnVolume : public AActor
{
GENERATED_BODY()

public:
ASpawnVolume()
{
Volume = CreateDefaultSubobject<UBoxComponent>(TEXT("Volume"));
SetRootComponent(Volume);
}

virtual void BeginPlay() override
{
Super::BeginPlay();
ScheduleRespawn();
}

void SpawnMonsters()
{
for (const FSpawnEntry& Entry : SpawnList)
{
for (int32 i = 0; i < Entry.Quantity; ++i)
{
const FVector Location = UKismetMathLibrary::RandomPointInBoundingBox(Volume->Bounds.Origin, Volume->Bounds.BoxExtent);
GetWorld()->SpawnActor<AActor>(Entry.MonsterClass, Location, FRotator::ZeroRotator);
}
}
ScheduleRespawn();
}

private:
void ScheduleRespawn()
{
GetWorldTimerManager().SetTimer(RespawnTimer, this, &ASpawnVolume::SpawnMonsters, GlobalRespawnTime, false);
}

public:
UPROPERTY(EditAnywhere, BlueprintReadWrite)
TArray<FSpawnEntry> SpawnList;

UPROPERTY(EditAnywhere, BlueprintReadWrite)
float GlobalRespawnTime = 30.f;

private:
UPROPERTY()
UBoxComponent* Volume;

FTimerHandle RespawnTimer;
};

// Eventos de mundo e bosses
UCLASS()
class AWorldEventManager : public AActor
{
GENERATED_BODY()

public:
void StartBossEvent()
{
// Ativar cutscene, spawnar boss, bloquear portais
OnBossEventStarted.Broadcast();
}

void FinishBossEvent(bool bSuccess)
{
if (bSuccess)
{
OnBossEventSucceeded.Broadcast();
}
else
{
OnBossEventFailed.Broadcast();
}
}

public:
DECLARE_MULTICAST_DELEGATE(FOnBossEventStarted);
DECLARE_MULTICAST_DELEGATE(FOnBossEventSucceeded);
DECLARE_MULTICAST_DELEGATE(FOnBossEventFailed);

FOnBossEventStarted OnBossEventStarted;
FOnBossEventSucceeded OnBossEventSucceeded;
FOnBossEventFailed OnBossEventFailed;
};

// Notas:
// - Combine com DataAssets de monstros e drop tables (arquivo 06).
// - Integrar com sistemas de matchmaking para bosses instanciados.
