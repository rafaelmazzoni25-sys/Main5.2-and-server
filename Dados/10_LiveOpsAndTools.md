# Etapa 10 — Live Ops, Ferramentas e Telemetria

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P10 — Média |
| **Dependências Diretas** | Etapas 0 a 9 |
| **Desbloqueia** | Etapa 11 |
| **Foco UE5+** | Blueprint com Editor Utilities, Analytics e Live Updates |
| **Linha do Tempo Indicativa** | Semana 5 — Sessões 3 e 4 |

## Marco Principal
Preparar ferramentas para operação contínua: telemetria, eventos ao vivo e utilidades de editor que aceleram atualizações.

## Pré-requisitos Organizacionais
- Networking/persistência funcionando (Etapa 9).

## Sequência Cronológica em Blueprint
1. **Telemetria e Analytics**
   - Integrar `Analytics Blueprint Library` para registrar eventos (`QuestCompleted`, `ItemCrafted`).
   - Garantir envio assíncrono com fallback offline.
2. **Ferramentas de Editor**
   - Criar `Editor Utility Widgets` para manipular DataTables de itens/quests.
   - Implementar validações automáticas (ex.: checar dependências de item) acionadas via botão.
3. **Eventos Ao Vivo**
   - Configurar `BP_LiveEventManager` lendo DataAssets `DA_LiveEvent` com cronograma.
   - Expor eventos para HUD e sistemas de mundo (Etapa 7).
4. **Balanceamento Contínuo**
   - Criar `Curve Tables` para escalonar recompensas e usar `Runtime Float Curve` para ajustes sem recompilar.
   - Incluir opção de recarregar curvas em tempo real via console.
5. **Automação de Publicação**
   - Documentar pipeline de empacotamento em Blueprint (Automation Tool) e scripts Editor Utility para gerar builds QA/live.

## Checklist de Saída
- Ferramentas e analytics conectados, permitindo operação contínua.
- Eventos ao vivo configuráveis via DataAssets.

## Verificações de Dependência
- Executar evento ao vivo de teste e verificar logs de analytics.
- Validar edição de DataTables através do Editor Utility.
