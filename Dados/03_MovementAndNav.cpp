/*
================================================================================
Etapa 3 — Movimentação, Navegação e Controle de Rede
================================================================================
Objetivo
    Consolidar movimentação do personagem, sistema de dash/esquiva, navegação AI
    e sincronização de dados em rede (character movement + GAS cues).

Pré-requisitos
    • Etapas 1 e 2 concluídas com personagem e input.
    • NavMeshBoundsVolume configurado no mapa padrão.
    • Projeto com suporte a multiplayer (Listen e Dedicated Server).

Checklist de Implementação
    1. Ajustar CharacterMovementComponent com velocidades de caminhada, corrida,
       dash e salto inspiradas no jogo original.
    2. Implementar componente de locomotion para tratar stamina e consumo.
    3. Configurar tarefas de pathfinding para NPCs (usando AIController básico).
    4. Garantir replicação de habilidades de movimento, inclusive partículas.
    5. Registrar comandos de servidor para dash e teleport (skills).
    6. Validar previsões (prediction) para clientes via MovementComponent.

Testes Essenciais
    • Medir latência e jitter com `p.NetPktLoss=1` e confirmar correção.
    • Verificar que stamina diminui e recarrega corretamente ao correr/dar dash.
    • NPCs devem navegar até o jogador utilizando `SimpleMoveToActor` sem travar.
*/

#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "AIController.h"
#include "Kismet/GameplayStatics.h"
#include "NavigationSystem.h"
#include "NavigationPath.h"
#include "TimerManager.h"
#include "Engine/World.h"
#include "DrawDebugHelpers.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeMovement, Log, All);

// -----------------------------------------------------------------------------
//  Componente de locomotion — controla stamina e dash
// -----------------------------------------------------------------------------
UCLASS(ClassGroup=(Movement), meta=(BlueprintSpawnableComponent))
class URemakeLocomotionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    URemakeLocomotionComponent();

    virtual void BeginPlay() override;
    virtual void TickComponent(float DeltaTime, enum ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

    bool TryConsumeStamina(float Amount);
    void StartDash(const FVector& Direction);

    UFUNCTION(Server, Reliable)
    void ServerStartDash(const FVector_NetQuantizeNormal& Direction);

private:
    void PerformDash(const FVector& Direction);

private:
    UPROPERTY()
    TObjectPtr<ACharacter> OwnerCharacter;

    float MaxStamina = 150.f;
    float CurrentStamina = 150.f;
    float DashCost = 35.f;
    float SprintCostPerSecond = 10.f;
    float StaminaRegenPerSecond = 18.f;

    bool bIsSprinting = false;
};

URemakeLocomotionComponent::URemakeLocomotionComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
    SetIsReplicatedByDefault(true);
}

void URemakeLocomotionComponent::BeginPlay()
{
    Super::BeginPlay();
    OwnerCharacter = Cast<ACharacter>(GetOwner());
}

void URemakeLocomotionComponent::TickComponent(float DeltaTime, enum ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (!OwnerCharacter)
    {
        return;
    }

    if (bIsSprinting)
    {
        TryConsumeStamina(SprintCostPerSecond * DeltaTime);
    }
    else
    {
        CurrentStamina = FMath::Clamp(CurrentStamina + StaminaRegenPerSecond * DeltaTime, 0.f, MaxStamina);
    }
}

bool URemakeLocomotionComponent::TryConsumeStamina(float Amount)
{
    if (CurrentStamina < Amount)
    {
        return false;
    }

    CurrentStamina -= Amount;
    return true;
}

void URemakeLocomotionComponent::StartDash(const FVector& Direction)
{
    if (!OwnerCharacter || Direction.IsNearlyZero())
    {
        return;
    }

    if (!TryConsumeStamina(DashCost))
    {
        UE_LOG(LogRemakeMovement, Warning, TEXT("Stamina insuficiente para dash"));
        return;
    }

    if (OwnerCharacter->HasAuthority())
    {
        PerformDash(Direction);
    }
    else
    {
        ServerStartDash(Direction);
    }
}

void URemakeLocomotionComponent::ServerStartDash_Implementation(const FVector_NetQuantizeNormal& Direction)
{
    PerformDash(Direction);
}

void URemakeLocomotionComponent::PerformDash(const FVector& Direction)
{
    if (!OwnerCharacter)
    {
        return;
    }

    const float DashDistance = 600.f;
    const FVector DashVelocity = Direction.GetSafeNormal() * DashDistance;

    OwnerCharacter->LaunchCharacter(DashVelocity, true, true);

    // TODO: acionar GameplayCue de dash com Niagara (Etapa 4)
}

// -----------------------------------------------------------------------------
//  AI Controller simples para testes de navegação
// -----------------------------------------------------------------------------
UCLASS()
class ARemakeBasicAIController : public AAIController
{
    GENERATED_BODY()

public:
    virtual void OnPossess(APawn* InPawn) override
    {
        Super::OnPossess(InPawn);

        GetWorldTimerManager().SetTimer(FindTargetHandle, this, &ARemakeBasicAIController::FindTargetAndMove, 1.5f, true);
    }

private:
    void FindTargetAndMove()
    {
        APawn* ControlledPawn = GetPawn();
        if (!ControlledPawn)
        {
            return;
        }

        AActor* PlayerActor = UGameplayStatics::GetPlayerPawn(GetWorld(), 0);
        if (!PlayerActor)
        {
            return;
        }

        UNavigationSystemV1* NavSystem = UNavigationSystemV1::GetCurrent(GetWorld());
        if (!NavSystem)
        {
            return;
        }

        MoveToActor(PlayerActor, 150.f);
    }

private:
    FTimerHandle FindTargetHandle;
};

// -----------------------------------------------------------------------------
//  Helper para desenhar caminho previsto de dash (depuração)
// -----------------------------------------------------------------------------
static void DrawDashPrediction(UWorld* World, const FVector& Start, const FVector& Direction)
{
    if (!World)
    {
        return;
    }

    const float DashDistance = 600.f;
    FVector End = Start + Direction.GetSafeNormal() * DashDistance;

    DrawDebugLine(World, Start, End, FColor::Cyan, false, 0.5f, 0, 2.f);
    DrawDebugSphere(World, End, 25.f, 12, FColor::Cyan, false, 0.5f);
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Configurações do CharacterMovementComponent:
    • Max Walk Speed = 600, Sprint = 750 (usando `bWantsToSprint` no componente).
    • Braking Deceleration Walking = 2048 para resposta rápida.
    • Rotation Rate (Yaw) = 720 para turn instantâneo.

Blueprints / GAS:
    • Criar GameplayAbility_GroundDash que chama `StartDash` e dispara Niagara.
    • Setup GameplayCue `GC_Dash` replicado para clientes.

AI/Navegação:
    • Adicionar NavMeshBoundsVolume cobrindo mapas principais.
    • Expandir ARemakeBasicAIController com Behavior Tree quando disponível.

Testes:
    • Console `cheat script` para executar dashes consecutivos e verificar clamps.
    • Perfilar com `stat net` para observar `UnacknowledgedBunches` durante dash.
*/
