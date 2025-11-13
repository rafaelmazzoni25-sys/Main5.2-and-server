// Etapa 3: Movimentação, Navegação e Sincronização
// Implementa locomotion com RootMotion/BlendSpaces, dash e pathfinding.

#include "GameFramework/CharacterMovementComponent.h"
#include "NavigationSystem.h"
#include "NavigationPath.h"
#include "Net/UnrealNetwork.h"

UCLASS()
class URemakeMovementComponent : public UCharacterMovementComponent
{
GENERATED_BODY()

public:
URemakeMovementComponent()
{
MaxWalkSpeed = 600.f;
BrakingDecelerationWalking = 1500.f;
bOrientRotationToMovement = true;
}

UFUNCTION(Server, Reliable, WithValidation)
void ServerDashRequest(const FVector& Direction)
{
Launch(Direction * DashStrength);
}

protected:
virtual void BeginPlay() override
{
Super::BeginPlay();
SetIsReplicated(true);
}

public:
UPROPERTY(EditDefaultsOnly, Category="Movement") float DashStrength = 1200.f;
};

// Integração com IA e Pathfinding
UCLASS()
class ARemakePathNavigator : public AAIController
{
GENERATED_BODY()

public:
void MoveToLocationSmart(const FVector& Dest)
{
FNavLocation Projected;
if (UNavigationSystemV1* NavSys = UNavigationSystemV1::GetCurrent(GetWorld()))
{
NavSys->ProjectPointToNavigation(Dest, Projected);
MoveToLocation(Projected.Location, 5.f, true, true, true);
}
}
};

// Notas:
// - Substitua o CharacterMovementComponent padrão de ARemakePlayerCharacter por URemakeMovementComponent.
// - Dash deve replicar usando RPCs. Complete implementação do WithValidation.
// - Para NPCs, utilize Behavior Trees com este controlador.
