// Etapa 1: Personagem Jogável, Atributos e Componentes Essenciais
// Define o personagem base com sistema de atributos, componentes de combate e
// gerenciadores de efeitos visuais que serão expandidos em etapas posteriores.

#include "GameFramework/Character.h"
#include "AbilitySystemComponent.h"
#include "AttributeSet.h"
#include "GameplayEffectTypes.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/CapsuleComponent.h"
#include "NiagaraComponent.h"

UCLASS()
class ARemakePlayerCharacter : public ACharacter
{
GENERATED_BODY()

public:
ARemakePlayerCharacter()
{
PrimaryActorTick.bCanEverTick = true;
AbilitySystem = CreateDefaultSubobject<UAbilitySystemComponent>(TEXT("AbilitySystem"));
Attributes = CreateDefaultSubobject<URemakeAttributeSet>(TEXT("Attributes"));
AuraNiagara = CreateDefaultSubobject<UNiagaraComponent>(TEXT("AuraEffect"));
AuraNiagara->SetupAttachment(GetMesh());

GetCapsuleComponent()->InitCapsuleSize(42.f, 96.f);
BaseTurnRate = 45.f;
BaseLookUpRate = 45.f;
}

virtual void BeginPlay() override
{
Super::BeginPlay();
InitializeAttributes();
InitializeEquipmentSockets();
}

virtual void Tick(float DeltaSeconds) override
{
Super::Tick(DeltaSeconds);
HandlePassiveRegeneration(DeltaSeconds);
}

UAbilitySystemComponent* GetAbilitySystem() const { return AbilitySystem; }

void ApplyDamage(float Amount, AActor* Source)
{
const FGameplayEffectSpecHandle DamageSpec = AbilitySystem->MakeOutgoingSpec(DamageEffect, 1, AbilitySystem->MakeEffectContext());
if (DamageSpec.IsValid())
{
AbilitySystem->ApplyGameplayEffectSpecToSelf(*DamageSpec.Data.Get());
}
}

protected:
void InitializeAttributes()
{
AbilitySystem->InitAbilityActorInfo(this, this);
AbilitySystem->ApplyGameplayEffectToSelf(DefaultAttributeEffect.GetDefaultObject(), 1, AbilitySystem->MakeEffectContext());
}

void InitializeEquipmentSockets()
{
// Prepara sockets de arma, asa e pet para efeitos 3D
}

void HandlePassiveRegeneration(float DeltaSeconds)
{
Attributes->ApplyRegen(DeltaSeconds);
}

protected:
UPROPERTY(EditDefaultsOnly, Category = "Attributes")
TSubclassOf<UGameplayEffect> DefaultAttributeEffect;

UPROPERTY(EditDefaultsOnly, Category = "Attributes")
TSubclassOf<UGameplayEffect> DamageEffect;

UPROPERTY()
UAbilitySystemComponent* AbilitySystem;

UPROPERTY()
URemakeAttributeSet* Attributes;

UPROPERTY()
UNiagaraComponent* AuraNiagara;

float BaseTurnRate;
float BaseLookUpRate;
};

// Attribute Set resumido com barras de HP/MP/AG/SD típicas
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
}

void ApplyRegen(float DeltaSeconds)
{
Health = FMath::Min(Health + HealthRegenRate * DeltaSeconds, MaxHealth);
Mana = FMath::Min(Mana + ManaRegenRate * DeltaSeconds, MaxMana);
}

public:
UPROPERTY(BlueprintReadOnly, Category = "Attributes") float Health;
UPROPERTY(BlueprintReadOnly, Category = "Attributes") float MaxHealth;
UPROPERTY(BlueprintReadOnly, Category = "Attributes") float HealthRegenRate = 4.f;

UPROPERTY(BlueprintReadOnly, Category = "Attributes") float Mana;
UPROPERTY(BlueprintReadOnly, Category = "Attributes") float MaxMana;
UPROPERTY(BlueprintReadOnly, Category = "Attributes") float ManaRegenRate = 6.f;

UPROPERTY(BlueprintReadOnly, Category = "Attributes") float Stamina;
UPROPERTY(BlueprintReadOnly, Category = "Attributes") float MaxStamina;
UPROPERTY(BlueprintReadOnly, Category = "Attributes") float Shield;
UPROPERTY(BlueprintReadOnly, Category = "Attributes") float MaxShield;
};

// Notas:
// - A classe ARemakePlayerController deve ser criada em paralelo para lidar com input (próximo arquivo).
// - Configure esqueleto, anim blueprint e montagens de ataques no editor.
