# Etapa 8 — HUD, UI Dinâmica e Integrações 3D

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P8 — Média |
| **Dependências Diretas** | Etapas 0, 1, 2, 4, 5 e 6 |
| **Desbloqueia** | Etapas 9, 10 e 11 |
| **Foco UE5+** | Blueprint com UMG, Viewports 3D e bindings dinâmicos |
| **Linha do Tempo Indicativa** | Semana 4 — Sessões 3 e 4 |

## Marco Principal
Construir a HUD principal, telas contextuais e integrações com preview 3D de inventário, quests e status.

## Pré-requisitos Organizacionais
- Inventário 3D funcional (Etapa 5).
- Eventos de quests/economia disponíveis (Etapa 6).

## Sequência Cronológica em Blueprint
1. **HUD Base**
   - Criar `WBP_GameHUD` com painéis para barras, objetivos e notificações.
   - Vincular a `BP_RemakeGameMode` como HUD padrão.
2. **Widgets Dinâmicos**
   - Implementar `WBP_StatusBars`, `WBP_QuestTracker`, `WBP_CurrencyPanel` consumindo `Event Dispatchers` das etapas anteriores.
   - Configurar `Binding` apenas via `Event Driven` (evitar `Tick`).
3. **Inventário e Preview 3D**
   - Integrar `WBP_InventoryRoot` (Etapa 5) ao HUD com transição suave.
   - Garantir que `Viewport` 3D respeite iluminação e rotação do item selecionado.
4. **Menus Contextuais**
   - Criar `WBP_InteractionPrompt` para exibir ações disponíveis (usando Input da Etapa 2).
   - Adicionar `WBP_CombatLog` e `WBP_DamageNumbers` usando `Niagara UI Renderer` se disponível.
5. **Acessibilidade e Internacionalização**
   - Adicionar suporte a escalonamento de UI e legendas via `User Settings`.
   - Preparar `String Tables` para localização futura.

## Checklist de Saída
- HUD completa instanciada pelo GameMode com widgets atualizando em tempo real.
- Preview 3D integrado exibindo rotação de itens selecionados.

## Verificações de Dependência
- Testar abertura/fechamento de HUD, inventário e tracker de quests durante gameplay.
- Validar responsividade em diferentes resoluções e modos de tela.

## Referências do Código Original
- **HUD principal**: `CNewUIMainFrameWindow::Create` registra o HUD no `CNewUIManager` e na fila de renderização 3D, indicando que o remake precisa de um controlador central com slots para widgets e viewport dedicado. 【F:Source Main 5.2/source/NewUIMainFrameWindow.cpp†L37-L90】
- **Layout e botões**: `CNewUIMainFrameWindow::SetButtonInfo` posiciona botões com tooltips pré-definidos; converta-os em `Data Tables` e `Widget Blueprints` para preservar comportamento. 【F:Source Main 5.2/source/NewUIMainFrameWindow.cpp†L92-L144】
