# Blueprint Fidelity Crosswalk — Cliente Main 5.2 e MuServer Update 15

## Objetivo
Garantir que cada etapa do roteiro em Blueprint utilize o comportamento do cliente `Main` e dos serviços `MuServer` como referência direta, permitindo um remake fiel na Unreal Engine 5+.

## Cliente Main 5.2
### Ciclo de vida, serviços e inicialização
- `Winmain.cpp` instancia gerenciadores globais (`CUIManager`, `CUIMapName`), prepara GL, som MP3 e liga o subsistema de chat, servindo como mapa para configurar `BP_RemakeGameInstance`/`Subsystems` (Etapa 0). 【F:Source Main 5.2/source/Winmain.cpp†L1-L111】
- O setup do `wzAudio` e das flags de janelas evidencia requisitos de serviço que devem virar `Subsystems`/`Settings` no remake para equalizar experiência audiovisual e modos de janela. 【F:Source Main 5.2/source/Winmain.cpp†L45-L112】

### HUD principal e composição de UI
- `CNewUIMainFrameWindow::Create` registra o HUD no `CNewUIManager` e injeta o objeto no pipeline 3D (`Add3DRenderObj`), apontando que o HUD Blueprint precisa de um controlador central (`WBP_HUDRoot`) com registrador de widgets e viewport 3D (Etapa 8). 【F:Source Main 5.2/source/NewUIMainFrameWindow.cpp†L37-L90】
- A definição detalhada dos botões (`SetButtonInfo`) demonstra posicionamento e tooltips específicos, que devem ser transportados para `Widget Blueprints` com `Data Tables` para manter layout e textos. 【F:Source Main 5.2/source/NewUIMainFrameWindow.cpp†L92-L144】

### Inventário, preview 3D e efeitos de equipamento
- `CNewUIMyInventory::Create` injeta `CNewUIInventoryCtrl`, registra renderização 3D e inicializa slots, servindo como blueprint para o componente `BP_InventoryComponent`/`Viewport 3D` da Etapa 5. 【F:Source Main 5.2/source/NewUIMyInventory.cpp†L29-L76】
- O fluxo `EquipItem` confirma triggers adicionais (pets, efeitos, replicação de dados) que precisam ser reproduzidos via `Gameplay Ability System` e eventos multicast. 【F:Source Main 5.2/source/NewUIMyInventory.cpp†L78-L123】

### Classes de personagem e conversões
- `CCharacterManager::GetCharacterClass` traduz IDs de classe do servidor em enums de jogo; replique esse mapa em `Data Tables`/`Enum` para manter lógica de desbloqueio e animações (Etapa 1). 【F:Source Main 5.2/source/CharacterManager.cpp†L1-L79】

## MuServer Update 15
### Bootstrap do GameServer
- `GameMainInit` monta o mutex do servidor, inicializa tabelas de experiência, dados de monstros e conexões com Join/DataServer — guie o setup de serviços dedicados/autoridade no UE5 (Etapa 9). 【F:Source MuServer Update 15/GameServer/GameServer/GameMain.cpp†L1-L53】
- `JoinServerConnect` e `DataServerConnect` mostram handshakes separados para login e persistência, devendo virar `OnlineSubsystem`/`EOS` ou backend custom que respeite canais distintos. 【F:Source MuServer Update 15/GameServer/GameServer/GameMain.cpp†L55-L92】

### Loop de eventos e progressão
- `gObjEventRunProc` executa eventos sazonais (Blood Castle, Castle Siege, eventos custom), definindo a lista mínima de sistemas que precisam de equivalentes modularizados no remake. 【F:Source MuServer Update 15/GameServer/GameServer/User.cpp†L1-L85】
- As variáveis globais (`gObjTotalUser`, `gObjOffStore`, `gObjOffAttack`) mostram estados que exigem replicação/autosave, guiando os `GameState`/`SaveGame` da Etapa 9. 【F:Source MuServer Update 15/GameServer/GameServer/User.cpp†L86-L104】

### Regras de combate e PvP
- `CAttack::Attack` valida conexões, mapas, flags de PvP e integra sistemas como Duel, Castle Siege e eventos PvP — reflita essas verificações nos `Gameplay Effects`/`Ability Tasks` para garantir fidelidade (Etapa 4). 【F:Source MuServer Update 15/GameServer/GameServer/Attack.cpp†L1-L74】

## Estratégia de Blueprint derivada do código
- Etapa 0 replica `Winmain.cpp`/`GameMainInit` com `Subsystems`, `GameInstance` e serviços de áudio/janela configuráveis.
- Etapa 1 herda o mapa de classes do `CharacterManager` para desbloquear habilidades e animações corretas.
- Etapas 4, 5 e 8 tomam `Attack.cpp`, `NewUIMyInventory.cpp` e `NewUIMainFrameWindow.cpp` como referências para habilidades, inventário com preview 3D e HUD.
- Etapa 9 mapeia a dupla conexão Join/DataServer e estados globais do `User.cpp` para replicação/persistência.

## Checklist de Conformidade
1. Revise cada etapa do roteiro comparando com os pontos acima e cruze com o código original antes de implementar Blueprints.
2. Para cada sistema migrado, crie um `Test Plan` que valide condições equivalentes às verificadas nos fontes (ex.: flags de PvP, eventos sazonais, inicialização de áudio).
3. Documente divergências intencionais (ex.: substituição de bibliotecas de áudio) diretamente na etapa correspondente e atualize esta tabela cruzada.
