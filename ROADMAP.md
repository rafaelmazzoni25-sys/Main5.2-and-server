# Guia de recriação fiel no Unreal Engine 5.7 (cliente + servidor)

Este documento traduz o comportamento do cliente Win32 OpenGL e do conjunto de servidores C++ para um projeto UE 5.7, usando apenas os assets originais. Cada etapa está ancorada em arquivos e estruturas reais do código-fonte.

## 1) O que o código atual faz (pontos de referência)
- **Loop principal e rendering**: `Winmain.cpp` cria a janela Win32/OpenGL, inicializa UI (`UIWindows.h`, `UIManager.h`), textura (`ZzzTexture.h`), cena (`ZzzScene.h`) e áudio (`wzAudio.lib` via `PlayMp3/StopMp3`).
- **Assets proprietários**: malhas/ossos/animações estão em BMD (`ZzzBMD.h`), com limites **MAX_BONES=200**, **MAX_MESH=50**, **MAX_VERTICES=15000** e flags de render (`RENDER_*`). Texturas têm script próprio (`TextureScript.h`) indicando brilho, malha oculta e sombra.
- **Entrada**: `Input.h` centraliza estados de mouse/teclado (cliques, duplo-clique, modo mão-esquerda, texto), usado pelas janelas UI.
- **Rede do cliente**: `ProtocolSend.*` define o enum `ProtocolHead` (login, lista de personagem, posição, movimento) e estruturas como `PMSG_CONNECT_ACCOUNT_SEND` (account[10], password[20], versão, serial) e `PMSG_MOVE_SEND` (x, y, path[8]).
- **UI de fluxo**: telas de login/seleção/criação estão em `LoginWin.cpp`, `CharSelMainWin.cpp`, `CharMakeWin.cpp`; inventário/HUD em `NewUIMyInventory.cpp`, `NewUIMainFrameWindow.cpp`, mini-mapa em `NewUIMiniMap.cpp`.
- **Servidor principal**: `GameServer/GameServer.cpp` lê configs de `GameServerInfo - Common.dat` via `gServerInfo`, inicia sockets (`SocketManager` ou `SocketManagerModern`), conecta no Join/Data Server e agenda timers (`gQueueTimer.CreateTimer`). Limites de objetos/usuários estão em `User.h` (ex.: `MAX_OBJECT_USER=1000`, `MAX_VIEWPORT=75`, `MAX_CHARACTER_LEVEL=400`).

## 2) Pré-requisitos e configuração do projeto UE 5.7
1. **Plugins e project settings**
   - Habilitar: Enhanced Input, Niagara, World Partition, Editor Scripting Utilities, Python, Online Subsystem (para sockets), e (se houver veículos/montarias) Chaos Vehicles.
   - `Maps & Modes`: defina `GameInstance`/`GameMode` C++ base + Blueprints derivadas. Mapas padrão: Login.umap (Editor e Game), Transition.umap (Transition Map).
   - `Input`: mapeie ações conforme `Input.h` usa mouse/teclado: MoveX/MoveY (WASD), LookX/LookY (sensibilidade inicial 0.5), ClickEsq/Direito (para seleção/movimento), Interact, Inventory, Skills 0-9.
   - `Network`: largura de banda alvo 30.000 (espelhando `GameServerInfo`), frame rate fixo 60 para testes de protocolo; desligar Network Simulator por padrão.
2. **Pastas sugeridas**: `/Game/Characters`, `/Game/Environment`, `/Game/UI`, `/Game/Audio`, `/Game/Systems` (Blueprint Function Libraries, DataAssets), `/Game/Maps/Login`, `/Game/Maps/Select`, `/Game/Maps/World`.
3. **Controle de versão**: ative LFS para FBX/PNG/WAV. Scripts Python/Commandlet para importação automática.

## 3) Conversão de assets (BMD, texturas, áudio)
1. **Malhas e esqueletos**
   - Converter BMD → FBX/GLTF respeitando **MAX_BONES=200**, **MAX_MESH=50** (`ZzzBMD.h`). Recrie um Skeleton compartilhado por família de personagens (ex.: SK_Player) preservando `Bone_t.Parent` e bounding boxes.
   - Mapear flags `RENDER_*` para materiais UE: Chrome/Oil → Material Instances com Fresnel/Emissive; Shadow/NoDepth → Material com depth test ajustado.
   - Gerar Physics Asset conforme volumes `BoundingVertices` dos ossos.
2. **Texturas e scripts**
   - Cada mesh (`Mesh_t`) referencia `TextureScript` (brilho, mesh oculto, shadow). Converta texturas para PNG/TGA; crie Material Functions com parâmetros booleanos para `Bright`, `HiddenMesh`, `StreamMesh`, `NoneBlendMesh`, `ShadowMesh` de `TextureScript.h`.
   - UI: texturas devem usar `Mip Gen Settings` Sharpen5 para nitidez (equivalente ao legado).
3. **Animações**
   - `Action_t` mantém `Loop`, `PlaySpeed`, `NumAnimationKeys`, posições. No UE, crie Animation Sequences com PlayRate inicial = `PlaySpeed`; marque looping conforme `Loop`.
4. **Áudio**
   - Sons MP3 eram tocados por `wzAudioPlay`/`StopMp3`. Converta para WAV/OGG 48kHz; crie Sound Cues com looping para BGMs usados em `PlayMp3(Name, bEnforce)`.

## 4) Arquitetura UE 5.7 alinhada ao cliente
- **Bootstrap**: `GameInstance` inicia a thread de rede C++ (ver seção 6) e instancia UI de login (equivalente a `LoginWin`).
- **GameMode/Controller**: `GameMode` controla fase (Login → Seleção → Mundo). `PlayerController` processa entrada via Enhanced Input espelhando `CInput` (click, hold, double-click). Câmera/controle em Blueprint com valores base: `MaxWalkSpeed=600`, `RotationRate=(0,720,0)`.
- **Character/HUD**: `Character` + Animation Blueprint replicam estados ACTION_* de `User.h` (ataque, movimento, emotes). HUD modular cobre barras, mini-mapa e hotbar como em `NewUIMainFrameWindow`/`NewUIMiniMap`.
- **Persistência temporária**: dados de sessão (token, personagem selecionado) ficam no `GameInstance`, equivalente ao uso global de `LogIn`, `HeroKey` e `LogInID` em `ProtocolSend.cpp`.

## 5) Rede: espelhando `ProtocolSend` e servidor
1. **Estruturas e opcodes**
   - Implemente em C++ um cliente de socket com os mesmos pacotes de `ProtocolSend.h`: `ProtocolHead::BOTH_CONNECT_LOGIN`, `BOTH_CONNECT_CHARACTER`, `BOTH_POSITION`, `BOTH_MOVE`, `BOTH_MESSAGE`.
   - Estruturas mínimas:
     - `PMSG_CONNECT_ACCOUNT_SEND`: account[10], password[20], TickCount, ClientVersion[5], ClientSerial[16].
     - `PMSG_POSITION_SEND`: BYTE x, BYTE y.
     - `PMSG_MOVE_SEND`: BYTE x, BYTE y, BYTE path[8] (path[0] contém direção + (PathNum-1)).
2. **Thread de recepção**
   - No UE, crie uma thread C++ que lê a fila de mensagens e dispara delegates Blueprint equivalentes às chamadas de `RecvMessage()` (casos `SERVER_CONNECT`, `BOTH_CONNECT_LOGIN`, `BOTH_CONNECT_CHARACTER`, `BOTH_POSITION`, `BOTH_MOVE`, `BOTH_MESSAGE`).
3. **Handshakes**
   - Login: envie `PMSG_CONNECT_ACCOUNT_SEND` preenchendo ClientVersion/Serial como em `SendRequestLogInNew` (Version[i]-(i+1)). Trate resultados segundo `RecvLoginNew`: 0x01/0x20 = sucesso; demais códigos exibem mensagens específicas.
   - Lista de personagens: envie `PMSG_SIMPLE_RESULT_SEND.result=1` em `BOTH_CONNECT_CHARACTER` e processe a lista retornada como em `ReceiveCharacterList`.
   - Movimento: replique o cálculo de `SendCharacterMoveNew` (DirTable, PathNum limitado a `MAX_PATH_FIND-1`) e compacte o path em `path[8]`.
4. **Servidor**
   - Replique a configuração de `GameServer.cpp`: ler `GameServerInfo - Common.dat`, iniciar sockets TCP (`SocketManager` ou `SocketManagerModern` se NEW_PROTOCOL_SYSTEM=1) e UDP (`SocketManagerUdp`) para ConnectServer. Configure timers de 100ms para AI/eventos e 1s/10s para manutenção.
   - Respeite limites de `User.h` para dimensionar replicação (ex.: MAX_VIEWPORT=75 influencia relevância/interest management no UE).

## 6) Sistemas reproduzidos passo a passo (Blueprint + C++)
### 6.1 Login
1. **Widget `WB_Login`**: campos usuário/senha e botão Entrar. Campos validados localmente (<=10 chars usuário, <=20 senha como structs). Botão chama função Blueprint `BP_SendLogin` → C++ envia `BOTH_CONNECT_LOGIN` com `PMSG_CONNECT_ACCOUNT_SEND`.
2. **Resposta**: delegate `OnLoginResult(result)` mapeia códigos de `RecvLoginNew` (0x00 senha errada, 0x02 ID inválido, 0x06 versão incompatível etc.) e mostra mensagens equivalentes às `PopUpMsgWin`.
3. **Transição**: em sucesso (0x01/0x20), salvar `HeroKey` e token no `GameInstance` e abrir mapa de seleção.

### 6.2 Seleção/Criação de personagem
1. **Widget `WB_CharacterSelect`**: lista slots existentes e botão Criar. Preencher via evento de `OnCharacterList` (resposta de `BOTH_CONNECT_CHARACTER`).
2. **Criação**: formulário chama `BP_SendCreateCharacter` → C++ monta pacote compatível com o servidor (seguir campos usados por `CreateCharacter` no servidor). Validar regex de nome antes de enviar.
3. **Entrar no mundo**: botão Jogar envia `SendSelectCharacter` (opcode do servidor legado) e abre `World.umap` com spawn baseado na classe/atributos iniciais do DataTable.

### 6.3 HUD e UI in-game
1. **Layout**: replicar `NewUIMainFrameWindow` com subwidgets HP/MP/Estamina, XP, mini-mapa (`SceneCapture2D` 512x512), hotbar e log.
2. **Bindings**: atributos replicados via `PlayerState` correspondendo a `User.h` (`CurrentHP/MaxHP`, `Level` até 400, `Money` com teto 2.000.000.000 de `MAX_MONEY`).
3. **Mini-mapa**: ícones configurados por DataTable (NPC/Party/Enemy) e máscaras conforme mapas definidos em `w_MapHeaders.h`.

### 6.4 Movimentação e câmera
1. **Character Blueprint**: `MaxWalkSpeed=600`, `BrakingDeceleration=2048`, `RotationRate=(0,720,0)` de base. State Machine na Animation BP cobrindo ACTION_MOVE/ATTACK/DAMAGE/DIE conforme enum em `User.h`.
2. **Input**: ações de clique esquerdo/direito/dash replicam comportamento de `CInput` (clique simples, hold, double). Em rede, envie `PMSG_POSITION_SEND` a cada atualização de tile e `PMSG_MOVE_SEND` ao calcular path (veja DirTable em `ProtocolSend.cpp`).

### 6.5 Itens, drops e inventário
1. **Estruturas**: inventário replicado como array (espelhando `Inventory[MAX_INVENTORY]` em `ZzzInventory.h`). Usar DataAssets com campos compatíveis (Level, AttMin/Max, ReqStr/Dex/Eng etc.).
2. **UI**: widgets de inventário/tooltip refletem colunas `_COLUMN_TYPE_*` (level, pode equipar, requisitos, ataque/defesa). Personal Shop/Trade seguem flags `ITEMSETOPTION`.
3. **Drops**: actor de drop com colisão; ao coletar, chame RPC de pickup validando regras de `ItemDrop.cpp`/`ItemMove.cpp` no servidor.

### 6.6 XP e progressão
1. **Limites**: `MAX_CHARACTER_LEVEL=400` e tipos de experiência (`EXPERIENCE_COMMON`, `EXPERIENCE_PARTY`, etc. em `User.h`).
2. **Servidor**: use tabelas equivalentes às de `ExperienceTable.cpp` para calcular XP. Exponha evento `OnXpChanged` para atualizar HUD e efeitos Niagara.

### 6.7 Cenário, colisão e navmesh
1. **Mapas**: converta dados de `w_MapHeaders.h`/`w_MapProcess.cpp` para Levels UE. Use World Partition para mapas grandes.
2. **Colisão**: gere `NavMeshBoundsVolume` e volumes de bloqueio conforme geometria original. Ajuste visibilidade/clima com `DirectionalLight`/`SkyLight`/`ExponentialHeightFog` equivalente às configs de `Winmain` (fog/weather variáveis `weather=rand()%3`).

### 6.8 Sistema de áudio
- Reproduza BGMs/efeitos acionados em `PlayMp3/StopMp3` e efeitos de UI/combate. Use Sound Classes/Mix para mutar conforme `m_MusicOnOff` e eventos de estado (login, seleção, mapa).

### 6.9 QA e critérios de conclusão
- **Paridade funcional**: UI e fluxos (login → seleção → mundo) reproduzidos; movimentação/drops/inventário/XP refletem as estruturas citadas.
- **Protocolos validados**: tráfego client/server igual a `ProtocolSend` (opcodes e tamanhos corretos), com timers de servidor configurados como em `GameServer.cpp`.
- **Assets convertidos**: todos os BMD/Texturas/sons originais importados com parâmetros acima.
- **Testes**: smoke de rede (login/lista/movimento), checagem de Level/XP até 400, e verificação de limites de inventário/dinheiro.

