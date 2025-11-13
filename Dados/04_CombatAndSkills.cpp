/*
================================================================================
Etapa 4 — Combate, Habilidades e Efeitos Especiais
================================================================================
Objetivo
    Implementar pipeline de combate básico (ataques, combos, projéteis), integrar
    com GAS, cues de efeitos excelentes e cálculo de dano elemental.

Pré-requisitos
    • Etapas 1–3 concluídas com personagem móvel e input funcional.
    • DataTables de habilidades e itens excelentes configuradas.
    • Niagara Systems prontos para golpes, projéteis e buffs.

Checklist de Implementação
    1. Criar estrutura de dados de habilidade (custo, cooldown, efeitos visuais).
    2. Implementar GameplayAbility base com ativação, custo e aplicação de dano.
    3. Criar componente de combo que alterna animações e chama habilidades leves.
    4. Adicionar projéteis com replicação e cálculo de dano no impacto.
    5. Sincronizar efeitos excelentes (Glow, Wings) com base em tags do item.
    6. Integrar UI para mostrar cooldown e estado da habilidade.

Testes Essenciais
    • Executar combos com diferentes armas e verificar transições corretas.
    • Lançar habilidades em multiplayer para garantir replicação de FX e dano.
    • Validar cooldowns (não permitir spam) e consumo de recursos.
*/

#include "AbilitySystemComponent.h"
#include "AbilitySystemGlobals.h"
#include "Components/SphereComponent.h"
#include "GameplayAbility.h"
#include "GameplayCueManager.h"
#include "GameplayEffect.h"
#include "GameplayTagContainer.h"
#include "Engine/DataTable.h"
#include "GameFramework/Character.h"
#include "GameFramework/ProjectileMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "NiagaraComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "Components/SkeletalMeshComponent.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeCombat, Log, All);

// -----------------------------------------------------------------------------
//  Estruturas de dados para habilidades
// -----------------------------------------------------------------------------
USTRUCT(BlueprintType)
struct FRemakeSkillRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadOnly) FName SkillId;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TSubclassOf<UGameplayAbility> AbilityClass;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) float ManaCost = 30.f;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) float Cooldown = 5.f;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) FGameplayTagContainer RequiredTags;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TObjectPtr<UNiagaraSystem> CastFX;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TObjectPtr<UNiagaraSystem> ImpactFX;
};

// -----------------------------------------------------------------------------
//  GameplayAbility base — aplica custo e chama execução customizada
// -----------------------------------------------------------------------------
UCLASS(Abstract)
class URemakeGameplayAbility : public UGameplayAbility
{
    GENERATED_BODY()

public:
    URemakeGameplayAbility()
    {
        InstancingPolicy = EGameplayAbilityInstancingPolicy::InstancedPerActor;
    }

    virtual void ActivateAbility(const FGameplayAbilitySpecHandle Handle,
                                 const FGameplayAbilityActorInfo* ActorInfo,
                                 const FGameplayAbilityActivationInfo ActivationInfo,
                                 const FGameplayEventData* TriggerEventData) override
    {
        if (!CommitAbility(Handle, ActorInfo, ActivationInfo))
        {
            EndAbility(Handle, ActorInfo, ActivationInfo, true, true);
            return;
        }

        ExecuteAbilityLogic(Handle, ActorInfo, ActivationInfo, TriggerEventData);
    }

protected:
    virtual void ExecuteAbilityLogic(const FGameplayAbilitySpecHandle& Handle,
                                     const FGameplayAbilityActorInfo* ActorInfo,
                                     const FGameplayAbilityActivationInfo& ActivationInfo,
                                     const FGameplayEventData* TriggerEventData)
    {
        // Implementado nas subclasses
    }
};

// -----------------------------------------------------------------------------
//  Habilidade de ataque leve (combo)
// -----------------------------------------------------------------------------
UCLASS()
class URemakeAbility_LightAttack : public URemakeGameplayAbility
{
    GENERATED_BODY()

protected:
    virtual void ExecuteAbilityLogic(const FGameplayAbilitySpecHandle& Handle,
                                     const FGameplayAbilityActorInfo* ActorInfo,
                                     const FGameplayAbilityActivationInfo& ActivationInfo,
                                     const FGameplayEventData* TriggerEventData) override
    {
        if (!ActorInfo || !ActorInfo->AvatarActor.IsValid())
        {
            EndAbility(Handle, ActorInfo, ActivationInfo, true, true);
            return;
        }

        ACharacter* Character = Cast<ACharacter>(ActorInfo->AvatarActor.Get());
        if (!Character)
        {
            EndAbility(Handle, ActorInfo, ActivationInfo, true, true);
            return;
        }

        UAnimInstance* AnimInstance = Character->GetMesh()->GetAnimInstance();
        if (AnimInstance)
        {
            AnimInstance->Montage_Play(LightAttackMontage);
        }

        // Dispara GameplayCue de arma excelente
        UAbilitySystemComponent* ASC = ActorInfo->AbilitySystemComponent.Get();
        if (ASC)
        {
            ASC->ExecuteGameplayCue(GameplayCueTagExcellentHit);
        }
    }

private:
    UPROPERTY(EditDefaultsOnly)
    TObjectPtr<UAnimMontage> LightAttackMontage;

    UPROPERTY(EditDefaultsOnly)
    FGameplayTag GameplayCueTagExcellentHit = FGameplayTag::RequestGameplayTag(TEXT("Cue.Excellent.Hit"));
};

// -----------------------------------------------------------------------------
//  Projétil replicado para habilidades mágicas
// -----------------------------------------------------------------------------
UCLASS()
class ARemakeMagicProjectile : public AActor
{
    GENERATED_BODY()

public:
    ARemakeMagicProjectile();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;

    void InitializeProjectile(float Damage, AActor* InOwner, UNiagaraSystem* TrailFX, UNiagaraSystem* ImpactFXAsset);

private:
    UFUNCTION()
    void OnProjectileOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
                             UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
                             bool bFromSweep, const FHitResult& SweepResult);

private:
    UPROPERTY(VisibleAnywhere)
    TObjectPtr<USphereComponent> CollisionComponent;

    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UProjectileMovementComponent> MovementComponent;

    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UNiagaraComponent> TrailComponent;

    float ProjectileDamage = 0.f;
    TObjectPtr<AActor> OwningActor;
    TObjectPtr<UNiagaraSystem> ImpactFX;
};

ARemakeMagicProjectile::ARemakeMagicProjectile()
{
    PrimaryActorTick.bCanEverTick = true;
    bReplicates = true;

    CollisionComponent = CreateDefaultSubobject<USphereComponent>(TEXT("Collision"));
    CollisionComponent->InitSphereRadius(12.f);
    CollisionComponent->SetCollisionProfileName(TEXT("Projectile"));
    CollisionComponent->OnComponentBeginOverlap.AddDynamic(this, &ARemakeMagicProjectile::OnProjectileOverlap);
    SetRootComponent(CollisionComponent);

    MovementComponent = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));
    MovementComponent->InitialSpeed = 1200.f;
    MovementComponent->MaxSpeed = 1200.f;
    MovementComponent->ProjectileGravityScale = 0.f;

    TrailComponent = CreateDefaultSubobject<UNiagaraComponent>(TEXT("Trail"));
    TrailComponent->SetupAttachment(RootComponent);
}

void ARemakeMagicProjectile::BeginPlay()
{
    Super::BeginPlay();
}

void ARemakeMagicProjectile::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
}

void ARemakeMagicProjectile::InitializeProjectile(float Damage, AActor* InOwner, UNiagaraSystem* TrailFX, UNiagaraSystem* ImpactFXAsset)
{
    ProjectileDamage = Damage;
    OwningActor = InOwner;

    if (TrailFX)
    {
        TrailComponent->SetAsset(TrailFX);
        TrailComponent->Activate(true);
    }

    ImpactFX = ImpactFXAsset;
}

void ARemakeMagicProjectile::OnProjectileOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
                                                 UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
                                                 bool bFromSweep, const FHitResult& SweepResult)
{
    if (OtherActor && OtherActor != OwningActor)
    {
        // Aplicar dano via GameplayCue (deverá chamar ASC do alvo)
        UGameplayStatics::ApplyDamage(OtherActor, ProjectileDamage, nullptr, OwningActor, nullptr);

        if (ImpactFX)
        {
            UNiagaraFunctionLibrary::SpawnSystemAtLocation(GetWorld(), ImpactFX, SweepResult.ImpactPoint);
        }

        Destroy();
    }
}

// -----------------------------------------------------------------------------
//  Sistema de combos simples — alterna index do ataque
// -----------------------------------------------------------------------------
UCLASS(ClassGroup=(Combat), meta=(BlueprintSpawnableComponent))
class URemakeComboComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    void RegisterLightAttackAbility(TSubclassOf<URemakeGameplayAbility> Ability) { LightAttackAbility = Ability; }
    void TriggerCombo(UAbilitySystemComponent* ASC);

private:
    UPROPERTY()
    TSubclassOf<URemakeGameplayAbility> LightAttackAbility;

    int32 ComboIndex = 0;
    float ComboResetTime = 1.2f;
    FTimerHandle ComboTimerHandle;
};

void URemakeComboComponent::TriggerCombo(UAbilitySystemComponent* ASC)
{
    if (!ASC || !LightAttackAbility)
    {
        return;
    }

    ASC->TryActivateAbilityByClass(LightAttackAbility);
    ComboIndex = (ComboIndex + 1) % 3;

    ASC->GetWorld()->GetTimerManager().SetTimer(ComboTimerHandle, [this]()
    {
        ComboIndex = 0;
    }, ComboResetTime, false);
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Blueprints/Assets:
    • Criar Niagara `NS_ExcellentHit` e associar ao GameplayCue `Cue.Excellent.Hit`.
    • Configurar montagens de ataque (LightAttackMontage) com seções 1,2,3.
    • Preencher DataTable de skills mapeando `SkillId` → `AbilityClass`.

Integração com Inventário (Etapa 5):
    • Ao equipar item excelente, adicionar tag `Item.Excellent` ao ASC para ativar
      glow adicional durante combos.

Testes:
    • Automatizar com `FunctionalTest` que ativa habilidade, valida cooldown e FX.
    • Rodar `net.PktLag=100` para garantir que projétil atinge alvo remotamente.
*/
