# Etapa 9 — Rede, Replicação e Persistência
**Prioridade:** Média  
**Depende de:** Etapas 0 a 8

## Objetivo
Implementar funcionalidades multiplayer, replicação de inventário/atributos e sincronização com backend usando Blueprints (com suporte opcional a C++ para otimizações críticas).

## Pré-requisitos
- Gameplay loop single-player validado até a Etapa 8.
- Servidor dedicado opcional configurado via `DA_RemakeSettings`.

## Fluxo de Trabalho em Blueprint
1. **Configurações de Rede**
   - Ajustar `Project Settings > Maps & Modes` para suportar `Number of Players` > 1 durante testes.
   - Definir classes replicáveis (`BP_RemakeCharacter`, `BP_RemakeEnemy`, `BP_ItemPreviewActor` com relevância local).

2. **Replicação de Inventário**
   - Em `BP_InventoryComponent`, marque arrays como `ReplicatedUsing OnRep_Inventory` e implemente `OnRep` para atualizar UI.
   - Use `Server` RPC `Server_RequestEquipItem` e `Client` RPC `Client_ConfirmEquip` para feedback.
   - Para preview 3D, mantenha `ItemPreview` somente em cliente (não replicado) para otimizar.

3. **Sincronização de Progressão**
   - No `BP_RemakePlayerState`, replique `CurrentXP`, `CurrentLevel`, `ActiveQuests`.
   - Utilize `GameMode` ou `GameState` para guardar estado global de eventos (Etapa 7) replicado para clientes.

4. **Persistência com Backend**
   - Crie `Blueprint Async Action` `Async_SavePlayerData` que chama APIs REST (via `Http Request` blueprint) para salvar inventário, missões e progresso.
   - `Async_LoadPlayerData` roda ao entrar no mundo, povoando componentes locais. Em builds finais, mover lógica crítica para C++ se necessário.

5. **Sessões e Matchmaking**
   - Utilize `OnlineSubsystem` (Steam/EOS) com Blueprints: `Create Session`, `Find Sessions`, `Join Session`.
   - Implemente `WBP_SessionBrowser` exibindo lobbies e capacidade.

## Entregáveis
- Inventário, progressão e missões replicando corretamente entre servidor e clientes.
- Blueprints assíncronos de Save/Load integrados a APIs externas.
- Widgets de sessão funcionando.

## Verificações
- Testar `Play As Listen Server` + `2 Clients`, equipar itens, completar missões e validar sincronização.
- Interromper conexão e retomar confirmando que `Async_SavePlayerData` foi chamado (logs/prints).
