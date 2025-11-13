/*
================================================================================
Etapa 5 — Sistema de Itens, Inventário 3D e Crafting
================================================================================
Objetivo
    Implementar pipeline completo de itens, inventário persistente, renderização
    3D dos itens excelentes/nível no HUD e lógica de crafting/upgrade.

Pré-requisitos
    • DataTables de itens com atributos e efeitos (referência: item_excellent_level_effects.cpp).
    • Niagara Systems configurados para efeitos de excelente/level.
    • Etapas anteriores com personagem, input e combate funcional.

Checklist de Implementação
    1. Criar PrimaryDataAssets para itens e equipamentos (armas, armaduras, jóias).
    2. Implementar componente de inventário replicado com delegates para UI.
    3. Construir ator de preview 3D (inventory_hud_3d_rendering.cpp como referência).
    4. Integrar crafting/upgrade com requisitos de itens e custo em Zen.
    5. Persistir inventário no GameInstance/SaveGame (integração com Etapa 9).
    6. Garantir efeitos excelentes visuais quando item está equipado ou em preview.

Testes Essenciais
    • Adicionar/remover itens e verificar replicação em multiplayer.
    • Validar crafting: itens requeridos removidos, resultado adicionado, recursos consumidos.
    • Abrir inventário, selecionar item e conferir rotação/animação conforme HUD 3D.
*/

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "GameplayTagContainer.h"
#include "Components/ActorComponent.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Blueprint/UserWidget.h"
#include "NiagaraComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "Net/UnrealNetwork.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeInventory, Log, All);

// -----------------------------------------------------------------------------
//  Dados do item — PrimaryDataAsset
// -----------------------------------------------------------------------------
UCLASS(BlueprintType)
class URemakeItemDefinition : public UPrimaryDataAsset
{
    GENERATED_BODY()

public:
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) FName ItemId;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) FText DisplayName;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) FText Description;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UStaticMesh> Mesh;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UNiagaraSystem> ExcellentFX;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UNiagaraSystem> LevelFX;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) FGameplayTagContainer ItemTags;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TMap<FGameplayTag, int32> AttributeBonuses;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) int32 RequiredLevel = 1;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) int32 SellValueZen = 0;
};

USTRUCT(BlueprintType)
struct FRemakeInventorySlot
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly) TObjectPtr<URemakeItemDefinition> Item = nullptr;
    UPROPERTY(BlueprintReadOnly) int32 Quantity = 0;
};

// -----------------------------------------------------------------------------
//  Componente de inventário replicado
// -----------------------------------------------------------------------------
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnInventoryChanged);

UCLASS(ClassGroup=(Inventory), meta=(BlueprintSpawnableComponent))
class URemakeInventoryComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    URemakeInventoryComponent();

    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

    void InitializeInventory(int32 SlotCount);

    UFUNCTION(BlueprintCallable)
    bool AddItem(URemakeItemDefinition* Item, int32 Quantity);

    UFUNCTION(BlueprintCallable)
    bool RemoveItemById(FName ItemId, int32 Quantity);

    UFUNCTION(BlueprintCallable)
    bool CraftItem(const TArray<FName>& RequiredItems, URemakeItemDefinition* ResultItem, int32 ZenCost);

    const TArray<FRemakeInventorySlot>& GetSlots() const { return Slots; }

    UPROPERTY(BlueprintAssignable)
    FOnInventoryChanged OnInventoryChanged;

private:
    int32 FindSlotIndexByItem(const URemakeItemDefinition* Item) const;
    int32 FindSlotIndexById(FName ItemId) const;

    void RemoveFromSlot(int32 SlotIndex, int32 Quantity);

private:
    UPROPERTY(Replicated)
    TArray<FRemakeInventorySlot> Slots;

    int32 CurrentZen = 0;
};

URemakeInventoryComponent::URemakeInventoryComponent()
{
    SetIsReplicatedByDefault(true);
}

void URemakeInventoryComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME(URemakeInventoryComponent, Slots);
}

void URemakeInventoryComponent::InitializeInventory(int32 SlotCount)
{
    Slots.SetNum(SlotCount);
}

bool URemakeInventoryComponent::AddItem(URemakeItemDefinition* Item, int32 Quantity)
{
    if (!Item || Quantity <= 0)
    {
        return false;
    }

    const int32 ExistingIndex = FindSlotIndexByItem(Item);
    if (ExistingIndex != INDEX_NONE)
    {
        Slots[ExistingIndex].Quantity += Quantity;
        OnInventoryChanged.Broadcast();
        return true;
    }

    for (FRemakeInventorySlot& Slot : Slots)
    {
        if (Slot.Item == nullptr)
        {
            Slot.Item = Item;
            Slot.Quantity = Quantity;
            OnInventoryChanged.Broadcast();
            return true;
        }
    }

    UE_LOG(LogRemakeInventory, Warning, TEXT("Inventário cheio ao adicionar %s"), *Item->ItemId.ToString());
    return false;
}

bool URemakeInventoryComponent::RemoveItemById(FName ItemId, int32 Quantity)
{
    if (Quantity <= 0)
    {
        return false;
    }

    const int32 SlotIndex = FindSlotIndexById(ItemId);
    if (SlotIndex == INDEX_NONE)
    {
        return false;
    }

    RemoveFromSlot(SlotIndex, Quantity);
    OnInventoryChanged.Broadcast();
    return true;
}

bool URemakeInventoryComponent::CraftItem(const TArray<FName>& RequiredItems, URemakeItemDefinition* ResultItem, int32 ZenCost)
{
    if (!ResultItem)
    {
        return false;
    }

    if (CurrentZen < ZenCost)
    {
        UE_LOG(LogRemakeInventory, Warning, TEXT("Zen insuficiente para craft"));
        return false;
    }

    TMap<int32, int32> SlotsToConsume;

    for (const FName& RequiredId : RequiredItems)
    {
        const int32 SlotIndex = FindSlotIndexById(RequiredId);
        if (SlotIndex == INDEX_NONE || Slots[SlotIndex].Quantity <= 0)
        {
            UE_LOG(LogRemakeInventory, Warning, TEXT("Item %s não encontrado para craft"), *RequiredId.ToString());
            return false;
        }

        SlotsToConsume.FindOrAdd(SlotIndex) += 1;
    }

    for (const TPair<int32, int32>& Entry : SlotsToConsume)
    {
        RemoveFromSlot(Entry.Key, Entry.Value);
    }

    CurrentZen -= ZenCost;
    AddItem(ResultItem, 1);

    OnInventoryChanged.Broadcast();
    return true;
}

int32 URemakeInventoryComponent::FindSlotIndexByItem(const URemakeItemDefinition* Item) const
{
    for (int32 Index = 0; Index < Slots.Num(); ++Index)
    {
        if (Slots[Index].Item == Item)
        {
            return Index;
        }
    }
    return INDEX_NONE;
}

int32 URemakeInventoryComponent::FindSlotIndexById(FName ItemId) const
{
    for (int32 Index = 0; Index < Slots.Num(); ++Index)
    {
        if (Slots[Index].Item && Slots[Index].Item->ItemId == ItemId)
        {
            return Index;
        }
    }
    return INDEX_NONE;
}

void URemakeInventoryComponent::RemoveFromSlot(int32 SlotIndex, int32 Quantity)
{
    if (!Slots.IsValidIndex(SlotIndex))
    {
        return;
    }

    FRemakeInventorySlot& Slot = Slots[SlotIndex];
    Slot.Quantity = FMath::Max(0, Slot.Quantity - Quantity);
    if (Slot.Quantity == 0)
    {
        Slot.Item = nullptr;
    }
}

// -----------------------------------------------------------------------------
//  Ator de preview 3D usado pelo inventário
// -----------------------------------------------------------------------------
UCLASS()
class AInventoryPreviewActor : public AActor
{
    GENERATED_BODY()

public:
    AInventoryPreviewActor();

    virtual void Tick(float DeltaSeconds) override;

    void SetItem(URemakeItemDefinition* ItemDef);
    void SetRotationActive(bool bActive);

private:
    UPROPERTY()
    TObjectPtr<USceneComponent> RootScene;

    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UStaticMeshComponent> MeshComponent;

    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UNiagaraComponent> ExcellentFXComponent;

    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UNiagaraComponent> LevelFXComponent;

    bool bRotate = false;
    float RotationSpeed = 45.f;
};

AInventoryPreviewActor::AInventoryPreviewActor()
{
    PrimaryActorTick.bCanEverTick = true;

    RootScene = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
    SetRootComponent(RootScene);

    MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PreviewMesh"));
    MeshComponent->SetupAttachment(RootScene);
    MeshComponent->SetCollisionEnabled(ECollisionEnabled::NoCollision);

    ExcellentFXComponent = CreateDefaultSubobject<UNiagaraComponent>(TEXT("ExcellentFX"));
    ExcellentFXComponent->SetupAttachment(MeshComponent);

    LevelFXComponent = CreateDefaultSubobject<UNiagaraComponent>(TEXT("LevelFX"));
    LevelFXComponent->SetupAttachment(MeshComponent);
}

void AInventoryPreviewActor::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (bRotate)
    {
        AddActorLocalRotation(FRotator(0.f, RotationSpeed * DeltaSeconds, 0.f));
    }
}

void AInventoryPreviewActor::SetItem(URemakeItemDefinition* ItemDef)
{
    if (!ItemDef)
    {
        MeshComponent->SetStaticMesh(nullptr);
        ExcellentFXComponent->Deactivate();
        LevelFXComponent->Deactivate();
        return;
    }

    MeshComponent->SetStaticMesh(ItemDef->Mesh);
    MeshComponent->SetRenderCustomDepth(true);

    if (ItemDef->ExcellentFX)
    {
        ExcellentFXComponent->SetAsset(ItemDef->ExcellentFX);
        ExcellentFXComponent->Activate(true);
    }

    if (ItemDef->LevelFX)
    {
        LevelFXComponent->SetAsset(ItemDef->LevelFX);
        LevelFXComponent->Activate(true);
    }
}

void AInventoryPreviewActor::SetRotationActive(bool bActive)
{
    bRotate = bActive;
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Blueprints/UI:
    • Widget de inventário deve ouvir OnInventoryChanged e atualizar grid.
    • Ao selecionar item, spawnar/posicionar AInventoryPreviewActor em cena UI
      (Widget Blueprint + componente `WidgetInteraction`) para renderização 3D.

Persistência (integração com Etapa 9):
    • Serializar Slots e CurrentZen no SaveGame/Cloud.
    • Restaurar inventário ao logar via PlayerState → InventoryComponent.

Testes:
    • Criar testes automatizados que adicionam itens, craftam e validam quantidades.
    • Em multiplayer, abrir inventário de cada jogador e confirmar que pré-visualização
      roda apenas para item selecionado localmente.
*/
