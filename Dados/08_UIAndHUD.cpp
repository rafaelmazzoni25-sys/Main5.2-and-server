/*
================================================================================
Etapa 8 — Interface de Usuário e HUD 3D
================================================================================
Objetivo
    Implementar HUD completo com barras, minimapa, indicadores de missão e
    integração com inventário 3D/preview.

Pré-requisitos
    • Sistemas de atributos, inventário e quests funcionando.
    • Widgets base (UMG) criados para barras e menus.

Checklist de Implementação
    1. Criar HUD principal com barras de HP/MP/SD/EXP e slots rápidos.
    2. Conectar com delegates (OnPrimaryAttributeChanged, OnInventoryChanged, OnQuestUpdated).
    3. Adicionar minimapa com captura de cena (SceneCapture2D) e ícones de NPCs.
    4. Integrar preview 3D no inventário e rotações (Etapa 5).
    5. Exibir notificações de eventos globais (boss, eventos especiais).
    6. Implementar sistema de mensagens do chat/log.

Testes Essenciais
    • Garantir atualização de barras sem jitter ou valores incorretos.
    • Abrir/fechar menus sem conflito de input (Etapa 2).
    • Validar responsividade em resoluções 16:9 e ultrawide.
*/

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Blueprint/WidgetTree.h"
#include "Components/ProgressBar.h"
#include "Components/TextBlock.h"
#include "Components/Image.h"
#include "Components/Overlay.h"
#include "Components/ListView.h"
#include "Components/Button.h"
#include "Components/CanvasPanel.h"
#include "Engine/TextureRenderTarget2D.h"
#include "Engine/World.h"
#include "GameFramework/HUD.h"
#include "NiagaraFunctionLibrary.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeHUD, Log, All);

class URemakeInventoryComponent;
class URemakeQuestComponent;
class URemakeProgressionComponent;
class URemakeAttributeSet;
struct FRemakeInventorySlot;
struct FQuestProgress;
class AInventoryPreviewActor;

// -----------------------------------------------------------------------------
//  Widget de barras de status
// -----------------------------------------------------------------------------
UCLASS()
class URemakeStatusWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    void InitializeStatusBars(URemakeProgressionComponent* ProgressionComponent);
    void HandleAttributeUpdate(const URemakeAttributeSet* Attributes);

private:
    void BindProgression(URemakeProgressionComponent* ProgressionComponent);

    UFUNCTION()
    void HandleLevelChanged(int32 NewLevel, int32 NewXP);

private:
    UPROPERTY(meta=(BindWidget))
    TObjectPtr<UProgressBar> HealthBar;

    UPROPERTY(meta=(BindWidget))
    TObjectPtr<UProgressBar> ManaBar;

    UPROPERTY(meta=(BindWidget))
    TObjectPtr<UProgressBar> StaminaBar;

    UPROPERTY(meta=(BindWidget))
    TObjectPtr<UProgressBar> ExperienceBar;

    UPROPERTY(meta=(BindWidget))
    TObjectPtr<UTextBlock> LevelText;
};

void URemakeStatusWidget::InitializeStatusBars(URemakeProgressionComponent* ProgressionComponent)
{
    BindProgression(ProgressionComponent);
}

void URemakeStatusWidget::BindProgression(URemakeProgressionComponent* ProgressionComponent)
{
    if (!ProgressionComponent)
    {
        return;
    }

    ProgressionComponent->OnLevelChanged.AddDynamic(this, &URemakeStatusWidget::HandleLevelChanged);
}

void URemakeStatusWidget::HandleLevelChanged(int32 NewLevel, int32 NewXP)
{
    if (LevelText)
    {
        LevelText->SetText(FText::AsNumber(NewLevel));
    }
    if (ExperienceBar && NewLevel > 0)
    {
        // Normalizar XP (depende da curva, ajustar conforme Etapa 6)
        ExperienceBar->SetPercent(0.0f);
    }
}

void URemakeStatusWidget::HandleAttributeUpdate(const URemakeAttributeSet* Attributes)
{
    if (!Attributes)
    {
        return;
    }

    if (HealthBar)
    {
        HealthBar->SetPercent(Attributes->Health / Attributes->MaxHealth);
    }
    if (ManaBar)
    {
        ManaBar->SetPercent(Attributes->Mana / Attributes->MaxMana);
    }
    if (StaminaBar)
    {
        StaminaBar->SetPercent(Attributes->Stamina / Attributes->MaxStamina);
    }
}

// -----------------------------------------------------------------------------
//  Widget de inventário
// -----------------------------------------------------------------------------
UCLASS()
class URemakeInventoryWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    void InitializeInventory(URemakeInventoryComponent* InventoryComponent, AInventoryPreviewActor* PreviewActor);
    void RefreshInventory();

    UFUNCTION()
    void OnInventoryChanged();

private:
    UPROPERTY(meta=(BindWidget))
    TObjectPtr<UListView> InventoryList;

    UPROPERTY(meta=(BindWidget))
    TObjectPtr<UOverlay> PreviewOverlay;

    UPROPERTY(meta=(BindWidget))
    TObjectPtr<UButton> RotateButton;

    UPROPERTY()
    TObjectPtr<URemakeInventoryComponent> BoundInventory;

    UPROPERTY()
    TObjectPtr<AInventoryPreviewActor> PreviewActorReference;
};

void URemakeInventoryWidget::InitializeInventory(URemakeInventoryComponent* InventoryComponent, AInventoryPreviewActor* PreviewActor)
{
    BoundInventory = InventoryComponent;
    PreviewActorReference = PreviewActor;

    if (BoundInventory)
    {
        BoundInventory->OnInventoryChanged.AddDynamic(this, &URemakeInventoryWidget::OnInventoryChanged);
    }

    if (RotateButton)
    {
        RotateButton->OnClicked.AddDynamic(this, &URemakeInventoryWidget::OnInventoryChanged);
    }

    RefreshInventory();
}

void URemakeInventoryWidget::RefreshInventory()
{
    if (!InventoryList || !BoundInventory)
    {
        return;
    }

    InventoryList->ClearListItems();
    const TArray<FRemakeInventorySlot>& Slots = BoundInventory->GetSlots();
    for (const FRemakeInventorySlot& Slot : Slots)
    {
        InventoryList->AddItem(Slot.Item);
    }
}

void URemakeInventoryWidget::OnInventoryChanged()
{
    RefreshInventory();

    if (PreviewActorReference)
    {
        PreviewActorReference->SetRotationActive(true);
    }
}

// -----------------------------------------------------------------------------
//  HUD principal
// -----------------------------------------------------------------------------
UCLASS()
class ARemakeHUD : public AHUD
{
    GENERATED_BODY()

public:
    virtual void BeginPlay() override;

    void InitializeHUD(URemakeProgressionComponent* Progression, URemakeInventoryComponent* Inventory, URemakeQuestComponent* Quests);
    void HandleAttributeSnapshot(const URemakeAttributeSet* Attributes);

private:
    UPROPERTY(EditDefaultsOnly)
    TSubclassOf<URemakeStatusWidget> StatusWidgetClass;

    UPROPERTY(EditDefaultsOnly)
    TSubclassOf<URemakeInventoryWidget> InventoryWidgetClass;

    UPROPERTY(EditDefaultsOnly)
    TObjectPtr<UTextureRenderTarget2D> MinimapRenderTarget;

    UPROPERTY()
    TObjectPtr<URemakeStatusWidget> StatusWidget;

    UPROPERTY()
    TObjectPtr<URemakeInventoryWidget> InventoryWidget;

    UPROPERTY()
    TObjectPtr<AInventoryPreviewActor> PreviewActorInstance;

    UFUNCTION()
    void HandleQuestUpdate(const FQuestProgress& Quest);
};

void ARemakeHUD::BeginPlay()
{
    Super::BeginPlay();

    if (StatusWidgetClass)
    {
        StatusWidget = CreateWidget<URemakeStatusWidget>(GetWorld(), StatusWidgetClass);
        if (StatusWidget)
        {
            StatusWidget->AddToViewport();
        }
    }

    if (InventoryWidgetClass)
    {
        InventoryWidget = CreateWidget<URemakeInventoryWidget>(GetWorld(), InventoryWidgetClass);
        if (InventoryWidget)
        {
            InventoryWidget->AddToViewport();
            InventoryWidget->SetVisibility(ESlateVisibility::Collapsed);
        }
    }
}

void ARemakeHUD::InitializeHUD(URemakeProgressionComponent* Progression, URemakeInventoryComponent* Inventory, URemakeQuestComponent* Quests)
{
    if (StatusWidget)
    {
        StatusWidget->InitializeStatusBars(Progression);
    }

    if (!PreviewActorInstance)
    {
        PreviewActorInstance = GetWorld()->SpawnActor<AInventoryPreviewActor>();
    }

    if (InventoryWidget && Inventory)
    {
        InventoryWidget->InitializeInventory(Inventory, PreviewActorInstance);
    }

    if (Quests)
    {
        Quests->OnQuestUpdated.AddDynamic(this, &ARemakeHUD::HandleQuestUpdate);
    }
}

void ARemakeHUD::HandleAttributeSnapshot(const URemakeAttributeSet* Attributes)
{
    if (StatusWidget)
    {
        StatusWidget->HandleAttributeUpdate(Attributes);
    }
}

void ARemakeHUD::HandleQuestUpdate(const FQuestProgress& Quest)
{
    // Atualizar lista de objetivos ativos (implementação no widget de log)
    UE_LOG(LogRemakeHUD, Verbose, TEXT("Quest %s atualizada"), *Quest.QuestId.ToString());
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Widgets:
    • Criar BP_StatusWidget e BP_InventoryWidget herdando das classes acima.
    • Configurar binding de barras e listas via UMG.

Minimapa:
    • Utilizar SceneCapture2D apontado para render target referenciado por MinimapRenderTarget.
    • Atualizar ícones via material dinâmico (representar NPCs/bosses).

Eventos Globais:
    • Assinar OnBossEventStarted (Etapa 7) para mostrar banner no topo.
    • Implementar log de chat com replicação (integração Etapa 9).
*/
