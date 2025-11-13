# Etapa 10 — Live Ops, Ferramentas e Automação
**Prioridade:** Média  
**Depende de:** Etapas 0 a 9

## Objetivo
Preparar ferramentas e pipelines de Live Ops usando Blueprints, Editor Utilities e integração com serviços externos para suporte pós-lançamento.

## Pré-requisitos
- Sistemas principais concluídos até a Etapa 9.
- Acesso a repositório de controle de versão e pipelines de CI/CD.

## Fluxo de Trabalho em Blueprint
1. **Ferramentas de Editor**
   - Crie `Editor Utility Widget` `EUW_SpawnConfigurator` para editar `DA_SpawnTables` visualmente.
   - Desenvolva `EUW_ItemBatchImporter` que lê CSV e popula DataTables de itens.

2. **Eventos em Tempo Real**
   - Configure `BP_LiveEventManager` (Actor Singleton) que consome `Async` HTTP para ativar eventos temporários (boosts, skins).
   - Use `Gameplay Tags` para aplicar modificadores globais (ex.: `Event.DropRateBoost`).

3. **Analytics e Telemetria**
   - Crie `Blueprint Function Library` `BFL_Telemetry` com funções `SendEvent` usando `Analytics Blueprint` plugin.
   - Integre chamadas em pontos críticos: completar missão, loot raro, entrada em evento.

4. **Automação de Testes**
   - Utilize `Automation` Blueprints (`Functional Testing`) para cenários chave: login, combate boss, compra em vendor.
   - Configure mapa `FunctionalTestMap` com `Functional Test Actors` acionados via `Automation Controller`.

5. **Publicação e Hotfix**
   - Crie `WBP_PatchNotes` lido pelo cliente via JSON remoto.
   - Estruture fluxo de hotfix usando `Primary Asset Labels` para atualizar assets sem rebuild completo.

## Entregáveis
- Editor Utility Widgets e Function Libraries para Live Ops.
- Scripts de automação configurados no mapa de testes.
- Integração de telemetria básica acionada por Blueprints.

## Verificações
- Executar testes funcionais via `Session Frontend > Automation` e registrar resultados.
- Simular evento Live Ops chamando manualmente `BP_LiveEventManager` e validar efeitos.
