// Etapa 4: Combate, Habilidades e Efeitos Visuais
// Abrange sistema de habilidades, combos, cálculo de dano e efeitos excelentes.

#include "AbilitySystemComponent.h"
#include "GameplayAbility.h"
#include "GameplayEffect.h"
#include "NiagaraFunctionLibrary.h"
#include "Sound/SoundCue.h"

UCLASS()
class URemakeSkillQueueComponent : public UActorComponent
{
GENERATED_BODY()

public:
void QueueAbility(TSubclassOf<UGameplayAbility> AbilityClass)
{
PendingAbilities.Enqueue(AbilityClass);
TryTriggerAbility();
}

private:
void TryTriggerAbility()
{
if (PendingAbilities.IsEmpty()) return;

if (!OwningASC || OwningASC->GetCurrentActivationInfo().ActivationMode != EGameplayAbilityActivationMode::Authority)
{
return;
}

TSubclassOf<UGameplayAbility> AbilityClass;
PendingAbilities.Dequeue(AbilityClass);
OwningASC->TryActivateAbilityByClass(AbilityClass);
}

public:
void Initialize(UAbilitySystemComponent* InASC)
{
OwningASC = InASC;
}

private:
UAbilitySystemComponent* OwningASC;
TQueue<TSubclassOf<UGameplayAbility>> PendingAbilities;
};

UCLASS()
class UGA_BasicAttack : public UGameplayAbility
{
GENERATED_BODY()

public:
UGA_BasicAttack()
{
InstancingPolicy = EGameplayAbilityInstancingPolicy::InstancedPerExecution;
}

virtual void ActivateAbility(const FGameplayAbilitySpecHandle Handle,
const FGameplayAbilityActorInfo* ActorInfo,
const FGameplayAbilityActivationInfo ActivationInfo,
const FGameplayEventData* TriggerEventData) override
{
PlayMontageAndWait();
ApplyDamageEffect();
SpawnImpactFX(TriggerEventData->TargetData);
}

private:
void PlayMontageAndWait()
{
// Chamar AnimMontage configurada no editor
}

void ApplyDamageEffect()
{
if (URemakeAttributeSet* Attributes = ActorInfo->AvatarActor->FindComponentByClass<URemakeAttributeSet>())
{
const float FinalDamage = CalculateDamage(Attributes);
// Aplicar dano no alvo usando GameplayEffect customizado
}
}

float CalculateDamage(const URemakeAttributeSet* Attributes) const
{
float Base = Attributes->Strength * 1.5f + Attributes->Dexterity * 0.5f;
float ExcellentBonus = Attributes->ExcellentRate > FMath::FRand() ? Base * 0.2f : 0.f;
return Base + ExcellentBonus;
}

void SpawnImpactFX(const FGameplayAbilityTargetDataHandle& TargetData)
{
for (auto It = TargetData.CreateConstIterator(); It; ++It)
{
const FGameplayAbilityTargetData* Data = It.GetData();
if (Data)
{
UNiagaraFunctionLibrary::SpawnSystemAtLocation(GetWorld(), ExcellentImpactFX, Data->GetHitResult()->Location);
}
}
}

private:
UPROPERTY(EditDefaultsOnly) UNiagaraSystem* ExcellentImpactFX;
};

// Notas:
// - Crie AbilitySets para personagens e inimigos.
// - Expanda AttributeSet com Strength, Dexterity e ExcellentRate usados acima.
