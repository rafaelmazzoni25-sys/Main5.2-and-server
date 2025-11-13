/*
================================================================================
Etapa 1 — Personagem Jogável, Atributos e Componentes Essenciais
================================================================================
Objetivo
    Construir o personagem base com suporte ao Gameplay Ability System (GAS),
    atributos primários e componentes obrigatórios (malha, câmera, FX base).

Pré-requisitos
    • Etapa 0 concluída e GameMode apontando para este Character.
    • Malha esquelética importada com AnimBP básico (idle/walk/attack).
    • Habilidades e efeitos padrão configurados no Content Browser.

Checklist de Implementação
    1. Criar AttributeSet com barras de HP/MP/AG/SD e taxas de regen.
    2. Configurar AbilitySystemComponent para replicação e inicialização.
    3. Definir componentes visuais (Aura FX, WeaponTrail) com Niagara.
    4. Implementar métodos de dano, cura e atualização de UI.
    5. Integrar com PlayerState e Controller (próxima etapa cuida do input).
    6. Preparar delegates para notificar HUD e sistemas de progresso.

Testes Essenciais
    • Possuir instância do personagem no mapa e verificar se atributos carregam.
    • Aplicar dano via console (`Damage 100`) e conferir atualização de barras.
    • Garantir replicação em sessão multiplayer (dedicado/listen).
*/

#include "GameFramework/Character.h"
#include "GameFramework/PlayerState.h"
#include "AbilitySystemComponent.h"
#include "AbilitySystemInterface.h"
#include "AttributeSet.h"
#include "GameplayEffect.h"
#include "GameplayEffectExtension.h"
#include "Components/CapsuleComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/ArrowComponent.h"
#include "NiagaraComponent.h"
#include "Engine/World.h"

DEFINE_LOG_CATEGORY_STATIC(LogRemakeCharacter, Log, All);

// -----------------------------------------------------------------------------
//  AttributeSet — estatísticas base compartilhadas por todos os personagens
// -----------------------------------------------------------------------------
UCLASS()
class URemakeAttributeSet : public UAttributeSet
{
    GENERATED_BODY()

public:
    URemakeAttributeSet()
    {
        Health = MaxHealth = 1000.f;
        Mana = MaxMana = 300.f;
        Stamina = MaxStamina = 150.f;
        Shield = MaxShield = 500.f;
        AttackPower = 120.f;
        DefensePower = 80.f;
    }

    void ApplyRegen(float DeltaSeconds)
    {
        Health = FMath::Clamp(Health + HealthRegenRate * DeltaSeconds, 0.f, MaxHealth);
        Mana = FMath::Clamp(Mana + ManaRegenRate * DeltaSeconds, 0.f, MaxMana);
        Stamina = FMath::Clamp(Stamina + StaminaRegenRate * DeltaSeconds, 0.f, MaxStamina);
    }

    void ApplyDamage(float Amount)
    {
        const float Mitigated = FMath::Max(Amount - DefensePower, 1.f);
        Shield = FMath::Clamp(Shield - Mitigated * ShieldAbsorption, 0.f, MaxShield);
        const float Residual = Mitigated * (1.f - ShieldAbsorption);
        Health = FMath::Clamp(Health - Residual, 0.f, MaxHealth);
    }

public:
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float Health;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float MaxHealth;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float HealthRegenRate = 4.f;

    UPROPERTY(BlueprintReadOnly, Category="Attributes") float Mana;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float MaxMana;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float ManaRegenRate = 6.f;

    UPROPERTY(BlueprintReadOnly, Category="Attributes") float Stamina;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float MaxStamina;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float StaminaRegenRate = 5.f;

    UPROPERTY(BlueprintReadOnly, Category="Attributes") float Shield;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float MaxShield;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float ShieldAbsorption = 0.4f;

    UPROPERTY(BlueprintReadOnly, Category="Attributes") float AttackPower;
    UPROPERTY(BlueprintReadOnly, Category="Attributes") float DefensePower;
};

DECLARE_MULTICAST_DELEGATE_OneParam(FOnPrimaryAttributeChanged, const URemakeAttributeSet* /*Attributes*/);

// -----------------------------------------------------------------------------
//  Personagem principal — integra AttributeSet, AbilitySystem e FX
// -----------------------------------------------------------------------------
UCLASS()
class ARemakePlayerCharacter : public ACharacter, public IAbilitySystemInterface
{
    GENERATED_BODY()

public:
    ARemakePlayerCharacter();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;
    virtual void PossessedBy(AController* NewController) override;
    virtual void OnRep_PlayerState() override;
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

    virtual UAbilitySystemComponent* GetAbilitySystemComponent() const override
    {
        return AbilitySystem;
    }

    URemakeAttributeSet* GetAttributes() const { return Attributes; }

    void ApplyInstantDamage(float RawAmount, AActor* Causer);
    void Heal(float Amount);

    FOnPrimaryAttributeChanged OnPrimaryAttributeChanged;

private:
    void InitializeAttributes();
    void InitializeEquipmentSockets();
    void HandlePassiveRegeneration(float DeltaSeconds);
    void BroadcastAttributeSnapshot() const;
    void GrantStartupAbilities();
    void EquipDefaultWeapon();

private:
    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UAbilitySystemComponent> AbilitySystem;

    UPROPERTY()
    TObjectPtr<URemakeAttributeSet> Attributes;

    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UNiagaraComponent> AuraNiagara;

    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UArrowComponent> WeaponSocketDebug;

    UPROPERTY(EditDefaultsOnly, Category="Abilities")
    TArray<TSubclassOf<UGameplayAbility>> StartupAbilities;

    UPROPERTY(EditDefaultsOnly, Category="Abilities")
    TSubclassOf<UGameplayEffect> DefaultAttributeEffect;

    UPROPERTY(EditDefaultsOnly, Category="Abilities")
    TSubclassOf<UGameplayEffect> DefaultDamageEffect;
};

ARemakePlayerCharacter::ARemakePlayerCharacter()
{
    PrimaryActorTick.bCanEverTick = true;

    GetCapsuleComponent()->InitCapsuleSize(42.f, 96.f);

    AbilitySystem = CreateDefaultSubobject<UAbilitySystemComponent>(TEXT("AbilitySystem"));
    AbilitySystem->SetIsReplicated(true);
    AbilitySystem->SetReplicationMode(EGameplayEffectReplicationMode::Mixed);

    Attributes = CreateDefaultSubobject<URemakeAttributeSet>(TEXT("Attributes"));

    AuraNiagara = CreateDefaultSubobject<UNiagaraComponent>(TEXT("AuraEffect"));
    AuraNiagara->SetupAttachment(GetMesh());

    WeaponSocketDebug = CreateDefaultSubobject<UArrowComponent>(TEXT("WeaponSocketDebug"));
    WeaponSocketDebug->SetupAttachment(GetMesh(), TEXT("Weapon_R"));
}

void ARemakePlayerCharacter::BeginPlay()
{
    Super::BeginPlay();

    InitializeAttributes();
    InitializeEquipmentSockets();
    GrantStartupAbilities();
    EquipDefaultWeapon();
    BroadcastAttributeSnapshot();
}

void ARemakePlayerCharacter::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    HandlePassiveRegeneration(DeltaSeconds);
}

void ARemakePlayerCharacter::PossessedBy(AController* NewController)
{
    Super::PossessedBy(NewController);
    AbilitySystem->InitAbilityActorInfo(this, this);
    GrantStartupAbilities();
}

void ARemakePlayerCharacter::OnRep_PlayerState()
{
    Super::OnRep_PlayerState();
    AbilitySystem->InitAbilityActorInfo(this, this);
}

void ARemakePlayerCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
    // Input bindings configurados na etapa 2 (Enhanced Input)
}

void ARemakePlayerCharacter::ApplyInstantDamage(float RawAmount, AActor* Causer)
{
    if (!AbilitySystem || RawAmount <= 0.f)
    {
        return;
    }

    FGameplayEffectContextHandle Context = AbilitySystem->MakeEffectContext();
    Context.AddInstigator(Causer, Causer);

    FGameplayEffectSpecHandle SpecHandle = AbilitySystem->MakeOutgoingSpec(DefaultDamageEffect, 1.f, Context);
    if (SpecHandle.IsValid())
    {
        SpecHandle.Data->SetSetByCallerMagnitude(FGameplayTag::RequestGameplayTag(TEXT("Data.Damage.Base")), RawAmount);
        AbilitySystem->ApplyGameplayEffectSpecToSelf(*SpecHandle.Data.Get());
    }
}

void ARemakePlayerCharacter::Heal(float Amount)
{
    if (Attributes)
    {
        Attributes->Health = FMath::Clamp(Attributes->Health + Amount, 0.f, Attributes->MaxHealth);
        BroadcastAttributeSnapshot();
    }
}

void ARemakePlayerCharacter::InitializeAttributes()
{
    if (!AbilitySystem || !DefaultAttributeEffect)
    {
        return;
    }

    AbilitySystem->InitAbilityActorInfo(this, this);
    AbilitySystem->ApplyGameplayEffectToSelf(DefaultAttributeEffect.GetDefaultObject(), 1.f, AbilitySystem->MakeEffectContext());
}

void ARemakePlayerCharacter::InitializeEquipmentSockets()
{
    // Conecta sockets que serão usados por armas, asas, pets e efeitos visuais
    // Verificar se o esqueleto possui sockets "Weapon_R", "Wing_L", "Wing_R", "Pet".
}

void ARemakePlayerCharacter::HandlePassiveRegeneration(float DeltaSeconds)
{
    if (!Attributes)
    {
        return;
    }

    const float PreviousHealth = Attributes->Health;
    const float PreviousMana = Attributes->Mana;
    Attributes->ApplyRegen(DeltaSeconds);

    if (!FMath::IsNearlyEqual(PreviousHealth, Attributes->Health) ||
        !FMath::IsNearlyEqual(PreviousMana, Attributes->Mana))
    {
        BroadcastAttributeSnapshot();
    }
}

void ARemakePlayerCharacter::BroadcastAttributeSnapshot() const
{
    OnPrimaryAttributeChanged.Broadcast(Attributes);
}

void ARemakePlayerCharacter::GrantStartupAbilities()
{
    if (!AbilitySystem)
    {
        return;
    }

    for (const TSubclassOf<UGameplayAbility>& AbilityClass : StartupAbilities)
    {
        if (AbilityClass)
        {
            AbilitySystem->GiveAbility(FGameplayAbilitySpec(AbilityClass, 1, INDEX_NONE, this));
        }
    }
}

void ARemakePlayerCharacter::EquipDefaultWeapon()
{
    // A arma padrão será configurada via data-driven (ver Etapa 5)
    UE_LOG(LogRemakeCharacter, Verbose, TEXT("EquipDefaultWeapon - placeholder para integração com inventário."));
}

// -----------------------------------------------------------------------------
//  Guia de Integração
// -----------------------------------------------------------------------------
/*
Blueprints:
    • Criar BP_PlayerCharacter herdando desta classe e configurar Skeletal Mesh,
      AnimBP, Niagara System para Aura e SFX.
    • Definir GameplayEffect de atributos (DefaultAttributeEffect) com valores
      base coerentes para classe do personagem.

PlayerState/Controller:
    • PlayerState deve implementar IAbilitySystemInterface e repassar ASC para HUD.
    • Controller configurará Enhanced Input (próxima etapa) e notificará HUD.

Validação:
    • Usar comando `ShowDebug AbilitySystem` para observar atributos replicados.
    • Criar automação funcional que cause dano e verifique se o personagem morre
      corretamente quando Health <= 0.
*/
