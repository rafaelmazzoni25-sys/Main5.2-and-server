// Etapa 5: Sistema de Itens, Inventário 3D e Crafting
// Engrena DataAssets de itens, instâncias no personagem, inventário 3D com rotação
// (referência à animação no arquivo inventory_hud_3d_rendering.cpp) e crafting básico.

#include "Engine/DataAsset.h"
#include "GameplayTagContainer.h"
#include "Components/ActorComponent.h"
#include "Blueprint/UserWidget.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "NiagaraComponent.h"

UCLASS(BlueprintType)
class UItemDefinition : public UPrimaryDataAsset
{
GENERATED_BODY()

public:
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) FName ItemId;
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) FText DisplayName;
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) UStaticMesh* Mesh;
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) UNiagaraSystem* ExcellentFX;
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) FGameplayTagContainer ItemTags;
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TMap<FGameplayTag, int32> AttributeBonuses;
};

USTRUCT(BlueprintType)
struct FInventorySlot
{
GENERATED_BODY()

UPROPERTY(BlueprintReadOnly) UItemDefinition* Item = nullptr;
UPROPERTY(BlueprintReadOnly) int32 Quantity = 0;
};

UCLASS(ClassGroup=(Inventory), meta=(BlueprintSpawnableComponent))
class URemakeInventoryComponent : public UActorComponent
{
GENERATED_BODY()

public:
void InitializeInventory(int32 SlotCount)
{
Slots.SetNum(SlotCount);
}

bool AddItem(UItemDefinition* Item, int32 Quantity)
{
for (FInventorySlot& Slot : Slots)
{
if (Slot.Item == nullptr || Slot.Item == Item)
{
Slot.Item = Item;
Slot.Quantity += Quantity;
OnInventoryChanged.Broadcast();
return true;
}
}
return false;
}

bool CraftItem(const TArray<FName>& RequiredItems, UItemDefinition* ResultItem)
{
// Consome itens e adiciona o resultado
return true;
}

const TArray<FInventorySlot>& GetSlots() const { return Slots; }

public:
DECLARE_MULTICAST_DELEGATE(FOnInventoryChanged);
FOnInventoryChanged OnInventoryChanged;

private:
UPROPERTY()
TArray<FInventorySlot> Slots;
};

// Inventário 3D – ator spawnado no UI para renderização interativa
UCLASS()
class AInventoryPreviewActor : public AActor
{
GENERATED_BODY()

public:
AInventoryPreviewActor()
{
RootScene = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
SetRootComponent(RootScene);
MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PreviewMesh"));
MeshComponent->SetupAttachment(RootScene);
ExcellentFXComponent = CreateDefaultSubobject<UNiagaraComponent>(TEXT("ExcellentFX"));
ExcellentFXComponent->SetupAttachment(MeshComponent);
}

void SetItem(UItemDefinition* ItemDef)
{
MeshComponent->SetStaticMesh(ItemDef->Mesh);
ExcellentFXComponent->SetAsset(ItemDef->ExcellentFX);
}

virtual void Tick(float DeltaSeconds) override
{
Super::Tick(DeltaSeconds);
if (bRotate)
{
const float RotationSpeed = 45.f;
AddActorLocalRotation(FRotator(0.f, RotationSpeed * DeltaSeconds, 0.f));
}
}

void SetRotationActive(bool bActive)
{
bRotate = bActive;
}

private:
UPROPERTY()
USceneComponent* RootScene;

UPROPERTY()
UStaticMeshComponent* MeshComponent;

UPROPERTY()
UNiagaraComponent* ExcellentFXComponent;

bool bRotate = false;
};

// Notas:
// - Conecte OnInventoryChanged a widgets do HUD (ver arquivo 08).
// - Utilize AInventoryPreviewActor dentro de um widget usando SceneCaptureComponent2D.
