// Etapa 6: Missões, Progressão e Economia
// Define estrutura de quests, experiência, drop tables e economia básica.

#include "Engine/DataAsset.h"
#include "Components/ActorComponent.h"
#include "GameplayTagContainer.h"

USTRUCT(BlueprintType)
struct FQuestObjective
{
GENERATED_BODY()

UPROPERTY(EditAnywhere, BlueprintReadWrite)
FGameplayTag ObjectiveTag;

UPROPERTY(EditAnywhere, BlueprintReadWrite)
int32 RequiredCount = 1;
};

UCLASS(BlueprintType)
class UQuestDefinition : public UPrimaryDataAsset
{
GENERATED_BODY()

public:
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
FName QuestId;

UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
FText Title;

UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
TArray<FQuestObjective> Objectives;

UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
int32 ExperienceReward;

UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
TMap<FName, int32> ItemRewards;
};

USTRUCT(BlueprintType)
struct FQuestState
{
GENERATED_BODY()

UPROPERTY(BlueprintReadOnly)
UQuestDefinition* Quest = nullptr;

UPROPERTY(BlueprintReadOnly)
TMap<FGameplayTag, int32> Progress;

UPROPERTY(BlueprintReadOnly)
bool bCompleted = false;
};

UCLASS(ClassGroup=(Progression), meta=(BlueprintSpawnableComponent))
class UQuestLogComponent : public UActorComponent
{
GENERATED_BODY()

public:
void AcceptQuest(UQuestDefinition* Quest)
{
FQuestState& State = ActiveQuests.AddDefaulted_GetRef();
State.Quest = Quest;
for (const FQuestObjective& Objective : Quest->Objectives)
{
State.Progress.Add(Objective.ObjectiveTag, 0);
}
OnQuestAccepted.Broadcast(Quest);
}

void RegisterEvent(const FGameplayTag& EventTag)
{
for (FQuestState& State : ActiveQuests)
{
if (!State.Progress.Contains(EventTag) || State.bCompleted)
{
continue;
}

int32& Current = State.Progress.FindChecked(EventTag);
Current++;

CheckCompletion(State);
}
}

private:
void CheckCompletion(FQuestState& State)
{
bool bAllComplete = true;
for (const FQuestObjective& Objective : State.Quest->Objectives)
{
const int32* Current = State.Progress.Find(Objective.ObjectiveTag);
if (!Current || *Current < Objective.RequiredCount)
{
bAllComplete = false;
break;
}
}

if (bAllComplete)
{
State.bCompleted = true;
OnQuestCompleted.Broadcast(State.Quest);
}
}

public:
DECLARE_MULTICAST_DELEGATE_OneParam(FOnQuestAccepted, UQuestDefinition* /*Quest*/);
DECLARE_MULTICAST_DELEGATE_OneParam(FOnQuestCompleted, UQuestDefinition* /*Quest*/);

FOnQuestAccepted OnQuestAccepted;
FOnQuestCompleted OnQuestCompleted;

private:
UPROPERTY()
TArray<FQuestState> ActiveQuests;
};

// Economia e drops
USTRUCT(BlueprintType)
struct FDropEntry
{
GENERATED_BODY()

UPROPERTY(EditAnywhere, BlueprintReadWrite) FName ItemId;
UPROPERTY(EditAnywhere, BlueprintReadWrite) float Probability;
UPROPERTY(EditAnywhere, BlueprintReadWrite) FIntPoint QuantityRange;
};

UCLASS(BlueprintType)
class UDropTable : public UPrimaryDataAsset
{
GENERATED_BODY()

public:
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
TArray<FDropEntry> Entries;

UItemDefinition* RollDrop() const
{
float Random = FMath::FRand();
float Accum = 0.f;
for (const FDropEntry& Entry : Entries)
{
Accum += Entry.Probability;
if (Random <= Accum)
{
return LoadItem(Entry.ItemId);
}
}
return nullptr;
}

private:
UItemDefinition* LoadItem(const FName& ItemId) const
{
FString Path = FString::Printf(TEXT("/Game/Data/Items/%s.%s"), *ItemId.ToString(), *ItemId.ToString());
return LoadObject<UItemDefinition>(nullptr, *Path);
}
};

// Notas:
// - Conecte RegisterEvent a eventos de gameplay via GameplayTag Event Manager.
// - Use OnQuestCompleted para recompensar experiência e itens.
