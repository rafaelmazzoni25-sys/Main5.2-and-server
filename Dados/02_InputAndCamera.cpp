/*
================================================================================
Etapa 2 — Input, Câmera e Controladores
================================================================================
Objetivo
    Criar camada de controle do jogador utilizando Enhanced Input, configurar
    câmeras orbitais/seguimento e alinhar o HUD para receber eventos de seleção.

Pré-requisitos
    • Etapa 1 concluída com personagem funcional.
    • Plugin Enhanced Input habilitado.
    • Ações de input preparadas no Content Browser (IA_Move, IA_Attack...).

Checklist de Implementação
    1. Criar mapeamento de inputs (Input Mapping Context) com bindings para mouse,
       teclado e controle.
    2. Implementar PlayerController que injeta contextos de input na posse.
    3. Configurar componente de câmera com transições (idle, combate, inventário).
    4. Garantir bloqueio de rotação durante UI (inventário/hud 3D) e liberar após.
    5. Integrar trace de seleção para objetos 3D apresentados no HUD.
    6. Expor delegates para UI reagir a foco de alvo e rotação do item.

Testes Essenciais
    • Navegar pelo mundo sem jitter e validar rotação do personagem.
    • Abrir o inventário e confirmar que câmera troca para modo de visualização.
    • Verificar, em multiplayer, se cada jogador possui input independente.
*/

#include "Engine/DataAsset.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "InputAction.h"
#include "InputMappingContext.h"
#include "Engine/LocalPlayer.h"
#include "DrawDebugHelpers.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeInput, Log, All);

// -----------------------------------------------------------------------------
//  Estrutura para guardar referências de ações de input
// -----------------------------------------------------------------------------
UCLASS(BlueprintType)
class URemakeInputConfig : public UDataAsset
{
    GENERATED_BODY()

public:
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UInputMappingContext> DefaultMappingContext;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UInputAction> MoveAction;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UInputAction> LookAction;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UInputAction> AttackAction;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UInputAction> JumpAction;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UInputAction> InteractAction;
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly) TObjectPtr<UInputAction> OpenInventoryAction;
};

DECLARE_MULTICAST_DELEGATE_OneParam(FOnInventoryPreviewFocus, AActor* /*FocusedActor*/);

// -----------------------------------------------------------------------------
//  Componente de câmera que alterna entre modos (exploração, inventário)
// -----------------------------------------------------------------------------
UCLASS(ClassGroup=(Camera), meta=(BlueprintSpawnableComponent))
class URemakeCameraComponent : public USpringArmComponent
{
    GENERATED_BODY()

public:
    URemakeCameraComponent()
    {
        TargetArmLength = 450.f;
        bUsePawnControlRotation = true;
        bEnableCameraLag = true;
        CameraLagSpeed = 12.f;
    }

    void ApplyCombatPreset()
    {
        TargetArmLength = FMath::FInterpTo(TargetArmLength, 380.f, GetWorld()->GetDeltaSeconds(), 6.f);
        SocketOffset = FVector(0.f, 60.f, 80.f);
    }

    void ApplyExplorationPreset()
    {
        TargetArmLength = FMath::FInterpTo(TargetArmLength, 450.f, GetWorld()->GetDeltaSeconds(), 6.f);
        SocketOffset = FVector(0.f, 40.f, 60.f);
    }

    void ApplyInventoryPreset()
    {
        TargetArmLength = 280.f;
        SocketOffset = FVector(0.f, 30.f, 40.f);
        bUsePawnControlRotation = false;
    }

    void RestoreControlRotation()
    {
        bUsePawnControlRotation = true;
    }
};

// -----------------------------------------------------------------------------
//  PlayerController com Enhanced Input e foco de inventário 3D
// -----------------------------------------------------------------------------
UCLASS()
class ARemakePlayerController : public APlayerController
{
    GENERATED_BODY()

public:
    ARemakePlayerController();

    virtual void BeginPlay() override;
    virtual void OnPossess(APawn* InPawn) override;
    virtual void SetupInputComponent() override;
    virtual void Tick(float DeltaSeconds) override;

    void EnableInventoryMode(bool bInventoryOpen);

    FOnInventoryPreviewFocus OnInventoryPreviewFocus;

private:
    void HandleMove(const FInputActionValue& Value);
    void HandleLook(const FInputActionValue& Value);
    void HandleAttack(const FInputActionValue& Value);
    void HandleOpenInventory(const FInputActionValue& Value);
    void UpdateInventoryPreviewTrace();

private:
    UPROPERTY(EditDefaultsOnly, Category="Input")
    TObjectPtr<URemakeInputConfig> InputConfig;

    UPROPERTY()
    TObjectPtr<UEnhancedInputLocalPlayerSubsystem> InputSubsystem;

    UPROPERTY()
    TObjectPtr<UEnhancedInputComponent> EnhancedComponent;

    UPROPERTY()
    TObjectPtr<URemakeCameraComponent> CameraBoom;

    UPROPERTY()
    TObjectPtr<UCameraComponent> FollowCamera;

    bool bIsInventoryOpen = false;
    float LookYawRate = 240.f;
    float LookPitchRate = 120.f;
};

ARemakePlayerController::ARemakePlayerController()
{
    PrimaryActorTick.bCanEverTick = true;
}

void ARemakePlayerController::BeginPlay()
{
    Super::BeginPlay();

    if (ULocalPlayer* LocalPlayer = GetLocalPlayer())
    {
        InputSubsystem = LocalPlayer->GetSubsystem<UEnhancedInputLocalPlayerSubsystem>();
        if (InputSubsystem && InputConfig && InputConfig->DefaultMappingContext)
        {
            InputSubsystem->AddMappingContext(InputConfig->DefaultMappingContext, 0);
        }
    }
}

void ARemakePlayerController::OnPossess(APawn* InPawn)
{
    Super::OnPossess(InPawn);

    // Conecta câmera ao personagem
    CameraBoom = NewObject<URemakeCameraComponent>(InPawn, TEXT("CameraBoom"));
    CameraBoom->RegisterComponent();
    CameraBoom->AttachToComponent(InPawn->GetRootComponent(), FAttachmentTransformRules::KeepRelativeTransform);

    FollowCamera = NewObject<UCameraComponent>(InPawn, TEXT("FollowCamera"));
    FollowCamera->RegisterComponent();
    FollowCamera->AttachToComponent(CameraBoom, FAttachmentTransformRules::KeepRelativeTransform);
    FollowCamera->bUsePawnControlRotation = false;
}

void ARemakePlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();

    EnhancedComponent = Cast<UEnhancedInputComponent>(InputComponent);
    if (!ensureMsgf(EnhancedComponent, TEXT("Enhanced Input Component não encontrado")))
    {
        return;
    }

    if (!InputConfig)
    {
        UE_LOG(LogRemakeInput, Warning, TEXT("InputConfig não atribuído"));
        return;
    }

    EnhancedComponent->BindAction(InputConfig->MoveAction, ETriggerEvent::Triggered, this, &ARemakePlayerController::HandleMove);
    EnhancedComponent->BindAction(InputConfig->LookAction, ETriggerEvent::Triggered, this, &ARemakePlayerController::HandleLook);
    EnhancedComponent->BindAction(InputConfig->AttackAction, ETriggerEvent::Started, this, &ARemakePlayerController::HandleAttack);
    EnhancedComponent->BindAction(InputConfig->OpenInventoryAction, ETriggerEvent::Started, this, &ARemakePlayerController::HandleOpenInventory);
}

void ARemakePlayerController::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (bIsInventoryOpen)
    {
        UpdateInventoryPreviewTrace();
    }
}

void ARemakePlayerController::EnableInventoryMode(bool bInventoryOpen)
{
    bIsInventoryOpen = bInventoryOpen;

    if (bIsInventoryOpen)
    {
        SetShowMouseCursor(true);
        SetInputMode(FInputModeGameAndUI());
        if (CameraBoom)
        {
            CameraBoom->ApplyInventoryPreset();
        }
    }
    else
    {
        SetShowMouseCursor(false);
        SetInputMode(FInputModeGameOnly());
        if (CameraBoom)
        {
            CameraBoom->RestoreControlRotation();
        }
    }
}

void ARemakePlayerController::HandleMove(const FInputActionValue& Value)
{
    const FVector2D Direction = Value.Get<FVector2D>();
    if (APawn* ControlledPawn = GetPawn())
    {
        ControlledPawn->AddMovementInput(ControlledPawn->GetActorForwardVector(), Direction.Y);
        ControlledPawn->AddMovementInput(ControlledPawn->GetActorRightVector(), Direction.X);
    }
}

void ARemakePlayerController::HandleLook(const FInputActionValue& Value)
{
    const FVector2D LookValue = Value.Get<FVector2D>();
    AddYawInput(LookValue.X * GetWorld()->GetDeltaSeconds() * LookYawRate);
    AddPitchInput(LookValue.Y * GetWorld()->GetDeltaSeconds() * LookPitchRate);
}

void ARemakePlayerController::HandleAttack(const FInputActionValue& Value)
{
    // Encaminhar para AbilitySystem (Etapa 4)
}

void ARemakePlayerController::HandleOpenInventory(const FInputActionValue& Value)
{
    EnableInventoryMode(!bIsInventoryOpen);
}

void ARemakePlayerController::UpdateInventoryPreviewTrace()
{
    FVector Start;
    FVector Dir;
    DeprojectMousePositionToWorld(Start, Dir);
    FVector End = Start + Dir * 5000.f;

    FHitResult Hit;
    GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility);

    DrawDebugLine(GetWorld(), Start, End, FColor::Purple);

    OnInventoryPreviewFocus.Broadcast(Hit.GetActor());
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Blueprints:
    • Input Actions (IA_Move, IA_Look, IA_Attack, IA_OpenInventory) devem conter
      configurações para teclado/mouse e gamepad.
    • Criar Input Mapping Context principal (IMC_Player) e atribuir via PlayerController.

UI & Inventário:
    • OnInventoryPreviewFocus conectar com widget de inventário para exibir nome
      do item atualmente focado pelo traço.
    • Ao abrir inventário, usar `SetCustomDepthStencilValue` nos itens para feedback.

Validação:
    • Usar PIE com dois jogadores para garantir foco independente.
    • Ativar flag `ShowMouseCursor` e confirmar que rotação é travada no modo UI.
*/
