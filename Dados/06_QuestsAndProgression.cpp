/*
================================================================================
Etapa 6 — Missões, Progressão e Economia
================================================================================
Objetivo
    Implementar sistema de quests, experiência, níveis e recompensas econômicas
    alinhado ao remake, preparando integrações com UI e salvamento.

Pré-requisitos
    • Sistema de itens (Etapa 5) para recompensas.
    • Estrutura de UI básica para exibir progresso de missão.
    • DataTables de quests e NPCs populadas.

Checklist de Implementação
    1. Criar DataTable com quests (objetivos, pré-requisitos, recompensas).
    2. Implementar componente de progressão com XP/Nível/Reset.
    3. Criar gerenciador de quests por jogador com replicação e delegates.
    4. Integrar com HUD para mostrar objetivos ativos.
    5. Preparar hooks para NPCs/Triggers adicionarem progresso.
    6. Salvar/Carregar progresso (integração com Etapa 9).

Testes Essenciais
    • Aceitar, completar e entregar quests garantindo recompensas corretas.
    • Testar múltiplas quests ativas simultaneamente e progresso independente.
    • Validar sincronização em multiplayer (servidor controla estados oficiais).
*/

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "GameplayTagContainer.h"
#include "Components/ActorComponent.h"
#include "Net/UnrealNetwork.h"

class URemakeInventoryComponent;

DEFINE_LOG_CATEGORY_STATIC(LogRemakeQuests, Log, All);

// -----------------------------------------------------------------------------
//  Estruturas de dados de missão
// -----------------------------------------------------------------------------
USTRUCT(BlueprintType)
struct FQuestObjective
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadOnly) FName ObjectiveId;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) FText Description;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) int32 RequiredAmount = 1;
};

USTRUCT(BlueprintType)
struct FQuestRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadOnly) FName QuestId;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) FText Title;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) FText Description;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TArray<FQuestObjective> Objectives;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) FGameplayTagContainer RequiredTags;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) int32 RewardExperience = 100;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) int32 RewardZen = 0;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TArray<FName> RewardItemIds;
};

USTRUCT(BlueprintType)
struct FQuestProgress
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly) FName QuestId;
    UPROPERTY(BlueprintReadOnly) TMap<FName, int32> ObjectiveProgress;
    UPROPERTY(BlueprintReadOnly) bool bCompleted = false;
};

// -----------------------------------------------------------------------------
//  Componente de progressão (XP/Nível)
// -----------------------------------------------------------------------------
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnLevelChanged, int32, NewLevel, int32, NewXP);

UCLASS(ClassGroup=(Progression), meta=(BlueprintSpawnableComponent))
class URemakeProgressionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    URemakeProgressionComponent();

    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    void AddExperience(int32 Amount);
    int32 GetCurrentLevel() const { return CurrentLevel; }
    int32 GetCurrentXP() const { return CurrentXP; }

    UPROPERTY(BlueprintAssignable)
    FOnLevelChanged OnLevelChanged;

private:
    void CheckLevelUp();

private:
    UPROPERTY(Replicated)
    int32 CurrentLevel = 1;

    UPROPERTY(Replicated)
    int32 CurrentXP = 0;

    UPROPERTY(EditDefaultsOnly)
    TArray<int32> ExperienceThresholds = {0, 200, 500, 900, 1400};
};

URemakeProgressionComponent::URemakeProgressionComponent()
{
    SetIsReplicatedByDefault(true);
}

void URemakeProgressionComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME(URemakeProgressionComponent, CurrentLevel);
    DOREPLIFETIME(URemakeProgressionComponent, CurrentXP);
}

void URemakeProgressionComponent::AddExperience(int32 Amount)
{
    if (Amount <= 0)
    {
        return;
    }

    CurrentXP += Amount;
    CheckLevelUp();
}

void URemakeProgressionComponent::CheckLevelUp()
{
    while (ExperienceThresholds.IsValidIndex(CurrentLevel) && CurrentXP >= ExperienceThresholds[CurrentLevel])
    {
        ++CurrentLevel;
        OnLevelChanged.Broadcast(CurrentLevel, CurrentXP);
    }
}

// -----------------------------------------------------------------------------
//  Componente de Quest Manager por jogador
// -----------------------------------------------------------------------------
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnQuestUpdated, const FQuestProgress&, Quest);

UCLASS(ClassGroup=(Quests), meta=(BlueprintSpawnableComponent))
class URemakeQuestComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    URemakeQuestComponent();

    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    void InitializeQuestData(UDataTable* QuestTable);

    bool AcceptQuest(FName QuestId);
    bool AddObjectiveProgress(FName QuestId, FName ObjectiveId, int32 Amount);
    bool CompleteQuest(FName QuestId);

    const TArray<FQuestProgress>& GetActiveQuests() const { return ActiveQuests; }

    UPROPERTY(BlueprintAssignable)
    FOnQuestUpdated OnQuestUpdated;

private:
    const FQuestRow* FindQuestRow(FName QuestId) const;
    FQuestProgress* FindActiveQuest(FName QuestId);

    void GrantRewards(const FQuestRow& QuestRow);

private:
    UPROPERTY()
    TObjectPtr<UDataTable> QuestDataTable;

    UPROPERTY(Replicated)
    TArray<FQuestProgress> ActiveQuests;

    UPROPERTY()
    TObjectPtr<URemakeProgressionComponent> ProgressionComponent;

    UPROPERTY()
    TObjectPtr<URemakeInventoryComponent> InventoryComponent;
};

URemakeQuestComponent::URemakeQuestComponent()
{
    SetIsReplicatedByDefault(true);
}

void URemakeQuestComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME(URemakeQuestComponent, ActiveQuests);
}

void URemakeQuestComponent::InitializeQuestData(UDataTable* QuestTable)
{
    QuestDataTable = QuestTable;
    ProgressionComponent = GetOwner()->FindComponentByClass<URemakeProgressionComponent>();
    InventoryComponent = GetOwner()->FindComponentByClass<URemakeInventoryComponent>();
}

bool URemakeQuestComponent::AcceptQuest(FName QuestId)
{
    if (!QuestDataTable)
    {
        return false;
    }

    if (FindActiveQuest(QuestId))
    {
        return false;
    }

    const FQuestRow* QuestRow = QuestDataTable->FindRow<FQuestRow>(QuestId, TEXT("AcceptQuest"));
    if (!QuestRow)
    {
        return false;
    }

    FQuestProgress NewProgress;
    NewProgress.QuestId = QuestId;

    for (const FQuestObjective& Objective : QuestRow->Objectives)
    {
        NewProgress.ObjectiveProgress.Add(Objective.ObjectiveId, 0);
    }

    ActiveQuests.Add(NewProgress);
    OnQuestUpdated.Broadcast(NewProgress);
    return true;
}

bool URemakeQuestComponent::AddObjectiveProgress(FName QuestId, FName ObjectiveId, int32 Amount)
{
    if (Amount <= 0)
    {
        return false;
    }

    FQuestProgress* Quest = FindActiveQuest(QuestId);
    if (!Quest)
    {
        return false;
    }

    int32* CurrentValue = Quest->ObjectiveProgress.Find(ObjectiveId);
    if (!CurrentValue)
    {
        return false;
    }

    const FQuestRow* QuestRow = FindQuestRow(QuestId);
    if (!QuestRow)
    {
        return false;
    }

    const FQuestObjective* ObjectiveRow = QuestRow->Objectives.FindByPredicate([ObjectiveId](const FQuestObjective& Obj)
    {
        return Obj.ObjectiveId == ObjectiveId;
    });

    if (!ObjectiveRow)
    {
        return false;
    }

    *CurrentValue = FMath::Clamp(*CurrentValue + Amount, 0, ObjectiveRow->RequiredAmount);

    bool bAllCompleted = true;
    for (const TPair<FName, int32>& Pair : Quest->ObjectiveProgress)
    {
        const FQuestObjective* ObjData = QuestRow->Objectives.FindByPredicate([&Pair](const FQuestObjective& Obj)
        {
            return Obj.ObjectiveId == Pair.Key;
        });

        if (!ObjData || Pair.Value < ObjData->RequiredAmount)
        {
            bAllCompleted = false;
            break;
        }
    }

    Quest->bCompleted = bAllCompleted;
    OnQuestUpdated.Broadcast(*Quest);
    return true;
}

bool URemakeQuestComponent::CompleteQuest(FName QuestId)
{
    FQuestProgress* Quest = FindActiveQuest(QuestId);
    if (!Quest || !Quest->bCompleted)
    {
        return false;
    }

    const FQuestRow* QuestRow = FindQuestRow(QuestId);
    if (!QuestRow)
    {
        return false;
    }

    GrantRewards(*QuestRow);

    ActiveQuests.RemoveAll([QuestId](const FQuestProgress& Progress)
    {
        return Progress.QuestId == QuestId;
    });

    return true;
}

const FQuestRow* URemakeQuestComponent::FindQuestRow(FName QuestId) const
{
    return QuestDataTable ? QuestDataTable->FindRow<FQuestRow>(QuestId, TEXT("FindQuestRow")) : nullptr;
}

FQuestProgress* URemakeQuestComponent::FindActiveQuest(FName QuestId)
{
    return ActiveQuests.FindByPredicate([QuestId](const FQuestProgress& Progress)
    {
        return Progress.QuestId == QuestId;
    });
}

void URemakeQuestComponent::GrantRewards(const FQuestRow& QuestRow)
{
    if (ProgressionComponent)
    {
        ProgressionComponent->AddExperience(QuestRow.RewardExperience);
    }

    if (InventoryComponent)
    {
        for (const FName& RewardId : QuestRow.RewardItemIds)
        {
            // Lookup real item via sistema de dados (DataSubsystem - Etapa 0/5)
            // Aqui chamamos stub AddItem(nullptr) para lembrar de integrar
        }
    }

    // Zen creditado via persistência (Etapa 9)
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Blueprints/UI:
    • Criar widget de log de missões que assina OnQuestUpdated.
    • Mostrar objetivos e quantidades usando dados de FQuestProgress.

NPCs/Triggers:
    • Ao falar com NPC, chamar AcceptQuest.
    • Eventos de kill/collect devem chamar AddObjectiveProgress.

Persistência:
    • Salvar ActiveQuests (IDs + progresso) e CurrentLevel/XP.
    • Restaurar no login e disparar OnQuestUpdated para atualizar UI.
*/
