# Etapa 8 — UI, HUD e Experiência do Jogador
**Prioridade:** Média  
**Depende de:** Etapas 0, 1, 2, 4, 5 e 6

## Objetivo
Construir a interface do usuário completa em Blueprints/UMG, conectando HUD, menus e feedbacks ao inventário, missões e combate.

## Pré-requisitos
- Eventos de atributos e cooldowns emitidos pelo personagem (Etapa 1 e 4).
- Inventário com eventos `OnInventoryUpdated` (Etapa 5).

## Fluxo de Trabalho em Blueprint
1. **HUD Base**
   - Crie `WBP_RemakeHUD` com widgets filhos para `StatusBar`, `SkillBar`, `MiniMap`, `QuestTracker`.
   - No `BP_RemakeHUD` (classe HUD), durante `BeginPlay`, crie e adicione `WBP_RemakeHUD` ao viewport.
   - Vincule `OnAttributeChanged` aos elementos de status usando `Bind Widget` ou `Event Dispatcher`.

2. **Inventário e Preview**
   - Integre `WBP_Inventory` da Etapa 5 ao HUD com transições (`Widget Switcher`).
   - Adicione `WBP_ItemDetails` que recebe dados `FItemData` e exibe descrição, requisitos, efeitos.
   - Conecte rotação 3D do item via `BP_ItemPreviewActor` e `Render Target` exibido no widget.

3. **HUD de Combate**
   - Implemente `WBP_SkillCooldown` que usa `Progress Bar` e animações `UMG` (Timeline) para cooldown.
   - Configure `Floating Damage Numbers` usando `Widget Component` anexado a inimigos.

4. **Menus de Missão e Economia**
   - `WBP_QuestLog`: lista missões do `BP_QuestComponent`, permite marcar rastreamento.
   - `WBP_Vendor`: interface de compra/venda, com `ListView` e lógica de drag & drop integrada ao inventário.

5. **Experiência do Jogador**
   - `WBP_LoadingScreen` acionado por `BP_WorldDirector` (Etapa 7) durante streaming.
   - `WBP_GameMenu` com opções (configurações, controles, saída) lendo `DA_RemakeSettings`.

## Entregáveis
- Widgets `WBP_RemakeHUD`, `WBP_Inventory`, `WBP_QuestLog`, `WBP_Vendor`, `WBP_LoadingScreen`.
- `BP_RemakeHUD` referenciado no GameMode.

## Verificações
- Testar HUD em `Play In Editor`, garantindo que alterações de atributos atualizam barras em tempo real.
- Abrir inventário, selecionar item e confirmar renderização 3D/rotação.
- Validar menus de missão e vendedor respondendo aos componentes correspondentes.
