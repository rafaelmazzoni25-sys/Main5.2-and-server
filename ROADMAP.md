# Guia passo a passo para recriar o cliente (OpenGL) e os servidores no Unreal Engine 5.7

Este roteiro traduz o comportamento real do cliente Win32/OpenGL e do conjunto de servidores C++ para um projeto UE 5.7. Cada etapa cita arquivos e estruturas que existem no código-fonte para que as decisões de implementação sejam ancoradas no projeto original.

## 1) Como o projeto atual funciona
1. **Janela, renderização e áudio**: `Winmain.cpp` cria a janela Win32/OpenGL, inicializa UI, texturas e cena, e controla a reprodução de MP3 com `PlayMp3/StopMp3` (biblioteca `wzAudio.lib`).
2. **Entrada**: `Input.h` mantém o estado do mouse e teclado (clique, clique duplo, manter pressionado, modo mão esquerda e modo de edição de texto) e expõe acessores como `IsLBtnDn/IsKeyDown` para toda a UI.
3. **Assets proprietários**: `ZzzBMD.h` define os limites dos modelos BMD (malha/ossos/animações) com `MAX_BONES=200`, `MAX_MESH=50`, `MAX_VERTICES=15000` e flags de renderização `RENDER_*`. O comportamento das texturas é descrito em `TextureScript.h` com flags como brilho, malha oculta e sombra.
4. **Protocolos do cliente**: `ProtocolSend.h/.cpp` define o enum `ProtocolHead` (login, personagem, posição, movimento, mensagem), as estruturas de pacote (`PMSG_CONNECT_ACCOUNT_SEND`, `PMSG_POSITION_SEND`, `PMSG_MOVE_SEND`) e a lógica de login/movimento (`SendRequestLogInNew`, `SendCharacterMoveNew`).
5. **Servidor principal**: `GameServer/GameServer.cpp` lê `GameServerInfo - Common.dat`, sobe sockets TCP/UDP (switch entre `SocketManager` e `SocketManagerModern`), conecta a Join/Data Server e agenda timers de 100 ms a 10 s. `User.h` fixa limites como `MAX_OBJECT_USER=1000`, `MAX_VIEWPORT=75`, `MAX_CHARACTER_LEVEL=400` e `MAX_MONEY=2000000000`.

## 2) Preparação do projeto UE 5.7
1. **Instale e ative plugins** no Project Settings: Enhanced Input (para mapear mouse/teclado), Niagara (efeitos), World Partition (streaming de mundo), Editor Scripting Utilities e Python (importação), Online Subsystem para sockets, e Chaos Vehicles se houver montarias.
2. **Configuração inicial**:
   - `Maps & Modes`: defina `GameInstance`/`GameMode` C++ de base e Blueprints derivadas. Crie mapas Login.umap (login), Transition.umap (carregamento) e World.umap (mundo).
   - `Input`: mapeie ações que correspondem às flags de `CInput` (andar: WASD, olhar: eixo do mouse, clique esquerdo/direito, duplo clique, inventário, interação, habilidades 0–9). Explique que “ação” é um nome de comando que o UE associa a teclas/botões.
   - `Network`: fixe largura de banda alvo 30.000 (valor usado pelo servidor) e `Use Fixed Frame Rate` em 60 fps para depurar protocolos.
3. **Pastas sugeridas**: `/Game/Characters`, `/Game/Environment`, `/Game/UI`, `/Game/Audio`, `/Game/Systems` (Blueprint Function Libraries, DataAssets), `/Game/Maps/Login`, `/Game/Maps/Select`, `/Game/Maps/World`.
4. **Controle de versão**: habilite Git LFS para FBX/PNG/WAV. Se possível, crie scripts Python/Commandlet para importar assets repetidamente.

## 3) Conversão de assets (BMD → UE)
1. **Malhas e esqueletos**
   - Converta cada BMD para FBX/GLTF respeitando `MAX_BONES=200`, `MAX_MESH=50` e `MAX_VERTICES=15000`. Monte um esqueleto UE por família de personagem preservando `Bone_t.Parent` e as `BoundingVertices` para gerar Physics Assets.
   - Mapeie flags `RENDER_*`: Chrome/Oil viram materiais com Fresnel/Emissive; `RENDER_NODEPTH` pede material sem teste de profundidade; Shadow/Lightmap exigem canais de sombra/iluminação.
2. **Texturas e scripts**
   - `TextureScript` indica brilho (`getBright`), malha oculta (`getHiddenMesh`), stream (`getStreamMesh`), mesh sem blend (`getNoneBlendMesh`) e sombra (`getShadowMesh`). Crie Material Functions/parameters que reproduzam cada flag.
   - Para UI, aplique `Mip Gen Settings` em Sharpen5 para obter nitidez equivalente ao cliente legado.
3. **Animações**
   - `Action_t` guarda `Loop`, `PlaySpeed`, `NumAnimationKeys` e posições. Gere Animation Sequences e ajuste `PlayRate` para o `PlaySpeed`, marcando looping quando `Loop=true`.
4. **Áudio**
   - Converta MP3 chamados por `PlayMp3/StopMp3` em WAV/OGG 48 kHz e crie Sound Cues com opção de looping. Mantenha nomes para permitir gatilhos pelo mesmo identificador.

## 4) Arquitetura do cliente UE baseada no código
1. **Bootstrap**: no `GameInstance` inicie a thread de rede C++ equivalente a `gProtocolSend` e carregue o widget de login. Explique que o `GameInstance` é o objeto global do UE, assim como as variáveis globais usadas no cliente original.
2. **GameMode/Controller**: o `GameMode` troca fases (Login → Seleção → Mundo). O `PlayerController` processa entrada via Enhanced Input replicando os estados de `CInput` (clique simples, manter, duplo clique) e passa comandos para a thread de rede.
3. **Personagem e HUD**: o `Character` e a Animation Blueprint espelham os estados `ACTION_*` de `User.h` (andar, ataque, dano, morrer). A HUD modular cobre barras, mini-mapa (`SceneCapture2D` 512×512), hotbar e log, seguindo os widgets `NewUIMainFrameWindow` e `NewUIMiniMap` do cliente.
4. **Áudio**: adicione um subsistema de áudio que consulta o estado `m_MusicOnOff` e use Sound Classes para silenciar/retomar, como fazem `PlayMp3` e `StopMp3`.

## 5) Rede: copiando `ProtocolSend`
1. **Pacotes e opcodes**
   - Implemente um cliente de socket em C++ que envie os pacotes de `ProtocolHead` (Login, Personagem, Posição, Movimento, Mensagem).
   - Estruturas obrigatórias: `PMSG_CONNECT_ACCOUNT_SEND` (account[10], password[20], TickCount, ClientVersion[5], ClientSerial[16]), `PMSG_POSITION_SEND` (x, y) e `PMSG_MOVE_SEND` (x, y, path[8]).
2. **Login**
   - Copie `SendRequestLogInNew`: preencha `ClientVersion[i] = Version[i] - (i+1)` e `ClientSerial` literal, chame `BuxConvert` antes de enviar, e envie `ProtocolHead::BOTH_CONNECT_LOGIN`.
   - Ao receber `RecvLoginNew`, trate códigos de retorno (0x01/0x20 sucesso; outros exibem mensagens de erro em pop-up/HUD).
3. **Lista de personagens**
   - Envie `PMSG_SIMPLE_RESULT_SEND.result = 1` com `ProtocolHead::BOTH_CONNECT_CHARACTER` e aguarde a lista para preencher o widget de seleção.
4. **Movimentação**
   - Copie `SendCharacterMoveNew`: limite `PathNum` a `MAX_PATH_FIND-1`, derive direção com `DirTable` e compacte duas direções por byte em `path[8]`. Envie `ProtocolHead::BOTH_MOVE`.
5. **Posicionamento periódico**
   - Envie `PMSG_POSITION_SEND` a cada atualização de tile para replicar `ProtocolHead::BOTH_POSITION`.
6. **Thread de recepção**
   - Crie uma thread que lê mensagens e dispara delegates Blueprint equivalentes às chamadas de `TranslateProtocol` (login, personagem, posição, movimento, mensagem).

## 6) Servidor espelhado a partir de `GameServer`
1. **Configuração**: leia `GameServerInfo - Common.dat` na inicialização. Se `NEW_PROTOCOL_SYSTEM` estiver desligado, use `SocketManager`; se ligado, use `SocketManagerModern`. Conecte a Join Server e Data Server e abra socket UDP para o ConnectServer.
2. **Timers**: registre timers como no código original: 100 ms para AI/eventos/viewport e 1–10 s para rotinas de manutenção.
3. **Limites e replicação**: respeite `MAX_OBJECT_USER=1000`, `MAX_VIEWPORT=75`, `MAX_CHARACTER_LEVEL=400` e `MAX_MONEY=2000000000` ao definir limites de usuários, relevância de replicação e tetos de atributos no UE.
4. **Estados de personagem**: exponha no servidor os enums `ACTION_*` para animações e `EXPERIENCE_*` para tipos de experiência; replique esses estados para o cliente UE.

## 7) Fluxos de UI e gameplay (Blueprint + C++)
1. **Login**: widget `WB_Login` com campos (10 caracteres para usuário, 20 para senha). Botão “Entrar” chama uma função Blueprint que envia `BOTH_CONNECT_LOGIN`. Use um evento `OnLoginResult` para traduzir códigos de retorno em mensagens amigáveis.
2. **Seleção e criação de personagem**: widget `WB_CharacterSelect` preenche slots com a resposta de `BOTH_CONNECT_CHARACTER`. A criação envia o pacote esperado pelo servidor (siga o formato de `CreateCharacter`). O botão “Jogar” chama a seleção e abre o mapa World.umap com spawn baseado na tabela de atributos iniciais.
3. **HUD in-game**: barras de HP/MP/Estamina/X P e mini-mapa atualizados por atributos replicados (`CurrentHP/MaxHP`, `Level` até 400, `Money` até o teto). Ícones do mini-mapa vêm de DataTables equivalentes a `w_MapHeaders.h`.
4. **Movimento e câmera**: `Character` com `MaxWalkSpeed=600`, `BrakingDeceleration=2048`, `RotationRate=(0,720,0)`. Eventos de clique reproduzem `CInput` (clique simples, manter, duplo) e disparam pacotes de posição/movimento.
5. **Itens e inventário**: modele o inventário como array (espelhando `Inventory[MAX_INVENTORY]`). UI mostra colunas de requisitos e efeitos (`ITEMSETOPTION`). Personal Shop/Trade seguem as mesmas flags.
6. **Drops**: atores de drop chamam RPC de coleta com as mesmas validações de `ItemDrop.cpp/ItemMove.cpp`.
7. **XP e progressão**: aplique limites de nível 400 e os tipos `EXPERIENCE_*`; use uma tabela de XP equivalente à de `ExperienceTable.cpp`.
8. **Cenário e clima**: converta mapas de `w_MapHeaders.h`/`w_MapProcess.cpp`, adicione `NavMeshBoundsVolume` e ajuste neblina/clima conforme o valor `weather = rand()%3` do cliente.
9. **Áudio contextual**: toque BGMs/FX conforme chamadas originais de `PlayMp3/StopMp3` e estados da UI (login, seleção, mundo).

## 8) Critérios de validação
- **Paridade funcional**: fluxo login → seleção → mundo reproduzido; movimentação, inventário e XP seguem os limites e enums originais.
- **Protocolos**: pacotes e tamanhos idênticos aos de `ProtocolSend`, com timers de servidor configurados como em `GameServer`.
- **Assets**: todos os BMD/texturas/sons convertidos com as flags e limites listados acima.
- **Testes mínimos**: login e lista de personagem pela rede, movimento com path comprimido, checagem de level 400 e limite de dinheiro, preenchimento correto do inventário.
