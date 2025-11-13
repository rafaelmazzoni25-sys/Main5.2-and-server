# Etapa 0A — Receitas Blueprint para a Fundação do Projeto

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P0 — Crítica (executar junto com Etapa 0) |
| **Dependências Diretas** | Etapa 0 — Fundamentos do Projeto e Subsystems |
| **Desbloqueia** | Agilidade nas Etapas 1 a 3 |
| **Foco UE5+** | Blueprint-first com nós nativos do editor |
| **Linha do Tempo Indicativa** | Semana 1 — Sessão 2 (após validar os módulos) |

Esta folha funciona como uma "receita de bolo" para implementar rapidamente os Blueprints essenciais da fundação. Cada receita lista ingredientes (ativos e nós), montagem passo a passo e testes rápidos que validam a configuração antes de prosseguir.

---

## Receita 1 — Boot da GameInstance
**Objetivo:** Garantir que a `BP_RemakeGameInstance` carregue dados e assets fundamentais logo na inicialização.

**Ingredientes**
- Blueprint `BP_RemakeGameInstance` derivado de `GameInstance`.
- DataTables `DT_Items`, `DT_Skills`, `DT_Monsters` criadas previamente.
- Nós: `Event Init`, `Load Data Table`, `Set`, `Async Load Asset`, `For Each Loop`.

**Passo a passo**
1. No Graph da GameInstance, adicione o evento `Event Init`.
2. Para cada DataTable, chame `Load Data Table` e armazene o retorno em variáveis `DT_Items`, `DT_Skills`, `DT_Monsters` (`Instance Editable`, `Expose on Spawn`).
3. Crie uma variável array `StartupAssetLabels` (tipo `Primary Asset Label`). No Construction Script, preencha com labels de HUD, personagem base e efeitos essenciais.
4. Ainda no `Event Init`, use `Async Load Asset` com `StartupAssetLabels`. Ligue o `Completed` a um `Custom Event` chamado `OnStartupAssetsReady`.
5. Dentro de `OnStartupAssetsReady`, percorra o array de assets carregados com `For Each Loop` e valide `Is Valid`. Faça log informativo usando a função da Receita 4.

**Teste rápido**
- Rode `Play In Editor` e verifique, na janela de Output Log, mensagens `Assets prontos` e ausência de erros de DataTable.

---

## Receita 2 — Subsystem de Streaming Compartilhado
**Objetivo:** Disponibilizar um `Streamable Manager` acessível para toda a aplicação via Blueprint.

**Ingredientes**
- Blueprint `BP_RemakeEngineSubsystem` derivado de `EngineSubsystem`.
- Nós: `On Initialized`, `Make Streamable Manager`, `Promote to Variable`, `Pure Function`.

**Passo a passo**
1. Crie o Blueprint `BP_RemakeEngineSubsystem` em `/Game/Core/Subsystems`.
2. No `Event On Initialized`, arraste um nó `Make Streamable Manager`.
3. Promova o retorno para uma variável `StreamableManager` marcada como `Instance Editable`.
4. Adicione uma função pura `GetStreamableManager`. Dentro dela, retorne a variável `StreamableManager`.
5. No final do `On Initialized`, chame `Print String` com mensagem "Subsystem pronto" para confirmar execução.

**Teste rápido**
- No mapa principal, execute `Get Game Instance -> Get Subsystem (BP_RemakeEngineSubsystem) -> GetStreamableManager` via Blueprint Debug e confirme que o retorno não é `None`.

---

## Receita 3 — Configurações Centralizadas
**Objetivo:** Carregar configurações de usuário e Data Assets que controlam flags globais.

**Ingredientes**
- Blueprint `BP_ConfigSubsystem` derivado de `GameInstanceSubsystem`.
- Data Asset `DA_RemakeSettings` (PrimaryDataAsset) com booleans `bEnableDedicatedServer`, `bUseMultithreadedLoading`.
- `RemakeSettings.ini` com overrides opcionais.
- Nós: `On Game Instance Init`, `Get Game User Settings`, `Load Settings`, `Async Load Primary Asset`, `Set Members`.

**Passo a passo**
1. Crie `BP_ConfigSubsystem` e override `Event On Game Instance Init`.
2. Primeiro nó: `Get Game User Settings` seguido de `Load Settings` para aplicar preferências locais.
3. Adicione `Async Load Primary Asset`, informando o ID do `DA_RemakeSettings`. No `Completed`, converta para `DA_RemakeSettings` e salve em variável `ActiveSettings`.
4. Em seguida, leia `Config/Data/RemakeSettings.ini` usando uma `Blueprint Function Library` utilitária (função `ReadConfigSection`).
5. Faça merge das opções INI nas variáveis do Data Asset com `Set Members` e exponha um evento dispatcher `OnSettingsUpdated`.

**Teste rápido**
- No Blueprint da GameInstance, logo após criar a instância do subsystem, adicione `Bind Event to OnSettingsUpdated` e imprima as flags carregadas. Valide em PIE trocando valores no INI.

---

## Receita 4 — Biblioteca de Log e Garantias
**Objetivo:** Padronizar logs e verificações essenciais em Blueprint.

**Ingredientes**
- Blueprint Function Library `BFL_RemakeLogger`.
- Nós: `Print String`, `Ensure`, `Format Text`, `Branch`.

**Passo a passo**
1. Crie `BFL_RemakeLogger` em `/Game/Core/Blueprints`.
2. Adicione função `Log Info` com parâmetros `Context` (String) e `Message` (String). Use `Format Text` para montar "[{Context}] {Message}" e conecte a `Print String` com cor azul.
3. Adicione função `Log Warning` semelhante, alterando cor para laranja e duração maior.
4. Crie função `Ensure Data Table Loaded` recebendo `TableName` (Name) e `DataTable` (DataTable). Use `Branch` com condição `Is Valid`. Se falso, chame `Ensure` com texto "DataTable {TableName} ausente".
5. No final de cada receita anterior, substitua `Print String` por chamadas a `Log Info`.

**Teste rápido**
- Ao inicializar o jogo, o Output Log deve exibir mensagens formatadas com contexto e nenhuma Ensure falhando.

---

## Checklist Final Antes da Etapa 1
- `BP_RemakeGameInstance` inicializa DataTables e assets usando as funções de log.
- `BP_RemakeEngineSubsystem` expõe `GetStreamableManager` funcional.
- `BP_ConfigSubsystem` carrega `DA_RemakeSettings` e aplica overrides do INI.
- `BFL_RemakeLogger` está referenciado por todos os Blueprints centrais.

Quando todos os itens estiverem marcados, avance para a Etapa 1 (`01_PlayerCharacter.md`) com a confiança de que o alicerce Blueprint está sólido.
