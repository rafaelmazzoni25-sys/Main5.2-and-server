// Etapa 8: Interface, HUD e Visualização 3D
// Conecta o sistema de HUD com inventário, barras de status e janela 3D.

#include "GameFramework/HUD.h"
#include "Blueprint/UserWidget.h"
#include "Components/Overlay.h"
#include "Components/ProgressBar.h"
#include "Components/TextBlock.h"
#include "Components/WidgetSwitcher.h"

UCLASS()
class UStatusWidget : public UUserWidget
{
GENERATED_BODY()

public:
void UpdateFromAttributes(const URemakeAttributeSet* Attributes)
{
HealthBar->SetPercent(Attributes->Health / Attributes->MaxHealth);
ManaBar->SetPercent(Attributes->Mana / Attributes->MaxMana);
ShieldBar->SetPercent(Attributes->Shield / Attributes->MaxShield);
LevelText->SetText(FText::AsNumber(CurrentLevel));
}

public:
UPROPERTY(meta=(BindWidget)) UProgressBar* HealthBar;
UPROPERTY(meta=(BindWidget)) UProgressBar* ManaBar;
UPROPERTY(meta=(BindWidget)) UProgressBar* ShieldBar;
UPROPERTY(meta=(BindWidget)) UTextBlock* LevelText;

int32 CurrentLevel = 1;
};

UCLASS()
class UInventoryWidget : public UUserWidget
{
GENERATED_BODY()

public:
void InitializeWidget(URemakeInventoryComponent* InInventory, AInventoryPreviewActor* InPreviewActor)
{
Inventory = InInventory;
PreviewActor = InPreviewActor;
Inventory->OnInventoryChanged.AddUObject(this, &UInventoryWidget::RefreshInventory);
RefreshInventory();
}

void RefreshInventory()
{
const TArray<FInventorySlot>& Slots = Inventory->GetSlots();
// Preencher grid widgets
}

void OnItemHovered(UItemDefinition* Item)
{
PreviewActor->SetItem(Item);
PreviewActor->SetRotationActive(true);
}

void OnItemUnhovered()
{
PreviewActor->SetRotationActive(false);
}

private:
UPROPERTY()
URemakeInventoryComponent* Inventory;

UPROPERTY()
AInventoryPreviewActor* PreviewActor;
};

UCLASS()
class ARemakeHUD : public AHUD
{
GENERATED_BODY()

public:
virtual void BeginPlay() override
{
Super::BeginPlay();

StatusWidget = CreateWidget<UStatusWidget>(GetWorld(), StatusWidgetClass);
InventoryWidget = CreateWidget<UInventoryWidget>(GetWorld(), InventoryWidgetClass);

StatusWidget->AddToViewport();
InventoryWidget->AddToViewport();
InventoryWidget->SetVisibility(ESlateVisibility::Collapsed);
}

void BindCharacter(ARemakePlayerCharacter* Character)
{
BoundCharacter = Character;
Character->GetAbilitySystem()->GetGameplayAttributeValueChangeDelegate(URemakeAttributeSet::GetHealthAttribute()).AddUObject(this, &ARemakeHUD::OnAttributeChanged);
}

void ToggleInventory()
{
const bool bIsVisible = InventoryWidget->IsVisible();
InventoryWidget->SetVisibility(bIsVisible ? ESlateVisibility::Collapsed : ESlateVisibility::Visible);
InventoryPreviewActor->SetActorHiddenInGame(bIsVisible);
}

private:
void OnAttributeChanged(const FOnAttributeChangeData& Data)
{
if (StatusWidget)
{
StatusWidget->UpdateFromAttributes(BoundCharacter->Attributes);
}
}

public:
UPROPERTY(EditDefaultsOnly) TSubclassOf<UStatusWidget> StatusWidgetClass;
UPROPERTY(EditDefaultsOnly) TSubclassOf<UInventoryWidget> InventoryWidgetClass;
UPROPERTY(EditDefaultsOnly) TSubclassOf<AInventoryPreviewActor> InventoryPreviewActorClass;

private:
UPROPERTY()
UStatusWidget* StatusWidget;

UPROPERTY()
UInventoryWidget* InventoryWidget;

UPROPERTY()
AInventoryPreviewActor* InventoryPreviewActor;

UPROPERTY()
ARemakePlayerCharacter* BoundCharacter;
};

// Notas:
// - Use PlayerController::OnInventoryToggle para chamar ARemakeHUD::ToggleInventory.
// - InventoryPreviewActor deve ser spawnado e atribuído durante BeginPlay.
