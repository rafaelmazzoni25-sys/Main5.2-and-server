// Etapa 2: Sistema de Input e Câmeras Orbitais
// Conecta Enhanced Input ao PlayerController, define layouts para teclado/gamepad
// e cria uma câmera orbit/zoom que será usada no inventário 3D e gameplay.

#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/SpringArmComponent.h"

UCLASS()
class ARemakePlayerController : public APlayerController
{
GENERATED_BODY()

public:
virtual void BeginPlay() override
{
Super::BeginPlay();
SetupInputContext();
}

virtual void SetupInputComponent() override
{
Super::SetupInputComponent();

if (UEnhancedInputComponent* EIC = Cast<UEnhancedInputComponent>(InputComponent))
{
EIC->BindAction(MoveAction, ETriggerEvent::Triggered, this, &ARemakePlayerController::HandleMove);
EIC->BindAction(LookAction, ETriggerEvent::Triggered, this, &ARemakePlayerController::HandleLook);
EIC->BindAction(JumpAction, ETriggerEvent::Triggered, this, &ARemakePlayerController::HandleJump);
EIC->BindAction(InteractAction, ETriggerEvent::Triggered, this, &ARemakePlayerController::HandleInteract);
EIC->BindAction(OpenInventoryAction, ETriggerEvent::Completed, this, &ARemakePlayerController::ToggleInventory);
}
}

private:
void SetupInputContext()
{
if (ULocalPlayer* LocalPlayer = GetLocalPlayer())
{
if (UEnhancedInputLocalPlayerSubsystem* Subsystem = LocalPlayer->GetSubsystem<UEnhancedInputLocalPlayerSubsystem>())
{
Subsystem->AddMappingContext(DefaultMapping, 0);
}
}
}

void HandleMove(const FInputActionValue& Value)
{
if (APawn* ControlledPawn = GetPawn())
{
const FVector2D InputAxis = Value.Get<FVector2D>();
ControlledPawn->AddMovementInput(ControlledPawn->GetActorForwardVector(), InputAxis.Y);
ControlledPawn->AddMovementInput(ControlledPawn->GetActorRightVector(), InputAxis.X);
}
}

void HandleLook(const FInputActionValue& Value)
{
ARemakePlayerCharacter* Character = Cast<ARemakePlayerCharacter>(GetPawn());
if (!Character) return;

const FVector2D InputAxis = Value.Get<FVector2D>();
Character->AddControllerYawInput(InputAxis.X * Character->BaseTurnRate * GetWorld()->GetDeltaSeconds());
Character->AddControllerPitchInput(InputAxis.Y * Character->BaseLookUpRate * GetWorld()->GetDeltaSeconds());
}

void HandleJump(const FInputActionValue& Value)
{
if (Value.Get<bool>())
{
GetPawn()->Jump();
}
}

void HandleInteract(const FInputActionValue& Value)
{
if (Value.Get<bool>())
{
OnInteract.Broadcast();
}
}

void ToggleInventory(const FInputActionValue& Value)
{
if (Value.Get<bool>())
{
OnInventoryToggle.Broadcast();
}
}

public:
UPROPERTY(EditDefaultsOnly, Category = "Input") UInputMappingContext* DefaultMapping;
UPROPERTY(EditDefaultsOnly, Category = "Input") UInputAction* MoveAction;
UPROPERTY(EditDefaultsOnly, Category = "Input") UInputAction* LookAction;
UPROPERTY(EditDefaultsOnly, Category = "Input") UInputAction* JumpAction;
UPROPERTY(EditDefaultsOnly, Category = "Input") UInputAction* InteractAction;
UPROPERTY(EditDefaultsOnly, Category = "Input") UInputAction* OpenInventoryAction;

DECLARE_MULTICAST_DELEGATE(FOnInteract);
FOnInteract OnInteract;

DECLARE_MULTICAST_DELEGATE(FOnInventoryToggle);
FOnInventoryToggle OnInventoryToggle;
};

// Componente de câmera compartilhado entre gameplay e visualização de inventário
UCLASS(ClassGroup=(Camera), meta=(BlueprintSpawnableComponent))
class URemakeOrbitCameraComponent : public USpringArmComponent
{
GENERATED_BODY()

public:
URemakeOrbitCameraComponent()
{
TargetArmLength = 400.f;
bUsePawnControlRotation = false;
Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
Camera->SetupAttachment(this);
}

void AttachToCharacter(ARemakePlayerCharacter* Character)
{
AttachToComponent(Character->GetRootComponent(), FAttachmentTransformRules::KeepRelativeTransform);
Camera->FieldOfView = 80.f;
}

void SetInventoryView(bool bInventory)
{
TargetArmLength = bInventory ? 220.f : 400.f;
bEnableCameraLag = bInventory;
Camera->SetFieldOfView(bInventory ? 65.f : 80.f);
}

private:
UPROPERTY()
UCameraComponent* Camera;
};

// Notas:
// - Instancie URemakeOrbitCameraComponent no personagem.
// - Sincronize OnInventoryToggle com o widget 3D (arquivo 08_UIAndHUD).
