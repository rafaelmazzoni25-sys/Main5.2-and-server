# Roadmap de Portabilidade para Unreal Engine 5

Este plano descreve, em linguagem de trabalho do dia a dia, como recriar o cliente legado no Unreal Engine 5 usando apenas os assets originais. A ênfase é usar Blueprints sempre que fizer sentido (menus, lógica de gameplay, scripting de eventos), deixando C++ para infraestrutura ou pontos de performance.

## 1) Preparação e diagnóstico
- **Levantamento do acervo**: catalogar modelos, texturas, animações e sons (formatos BMD, scripts de textura, áudio). Registrar onde estão, dependências e o que falta.
- **Foto do cliente atual**: mapear o loop principal (inicialização, render OpenGL, UI Win32, áudio) para saber que papel assumirão `GameInstance`, `GameMode`, `PlayerController` e `Actor` no UE5.
- **Limites e formatos**: anotar restrições de ossos, vértices e materiais dos headers atuais para evitar perda de dados na conversão.
- **Ambiente**: instalar UE5, definir controle de versão de assets (Perforce/LFS) e organizar convenções de pastas e nomenclatura no novo projeto.

## 2) Conversão de assets
- **Modelos e animações**: criar/conferir conversores BMD → FBX/GLTF preservando hierarquia, pesos e animações. Validar Skeleton/Physics Assets no UE5.
- **Texturas e materiais**: converter para TGA/PNG/EXR e recriar materiais PBR. Usar Material Functions e Material Instances para agilizar ajustes.
- **Áudio**: padronizar para WAV/OGG e configurar Sound Cues/Sound Mixes equivalentes aos eventos do cliente atual.
- **Automação**: scripts (Python/Commandlet) para importar, renomear e organizar em `/Characters`, `/Environment`, `/UI`, mantendo um checklist de cobertura.

## 3) Arquitetura do projeto UE5
- **Base de código**: separar módulos C++ (Core/UI/Gameplay/Networking) apenas onde for necessário; expor nós reutilizáveis para Blueprints. `GameInstance` para bootstrap, `GameMode` e `PlayerController` para fluxo de jogo.
- **Mapas**: preparar mapas de Login, Seleção de Personagem e Mundo inicial. Avaliar `World Partition` e `Level Streaming` cedo.
- **Entrada**: migrar bindings para `Enhanced Input`. Criar mapeamentos de ações em Blueprints para facilitar iterações rápidas.

## 4) Sistemas de cliente (foco em Blueprint)
- **UI/UX**: reimplementar janelas/managers em UMG com Blueprints. HUD, inventário, chat, loja e overlays devem ser widgets modulares, prontos para localização e redimensionamento.
- **Personagem e câmeras**: configurar `Character`/`Pawn` com Animation Blueprints, `BlendSpaces` e `AimOffsets`. Ajustar câmeras (isométrica/livre) via Blueprints com componentes reutilizáveis.
- **Movimentação e física**: usar `Character Movement Component` com lógica de estado em Blueprints (dash, pulo, velocidade) e C++ apenas para extensões específicas.
- **Renderização e efeitos**: portar efeitos OpenGL para Niagara e Material Instances. Guardar perfis de qualidade em Blueprints para switches dinâmicos.
- **Áudio e feedback**: eventos de som dirigidos por Blueprints chamando Sound Cues, com Mixers para controle global.

## 5) Rede e serviços
- **Protocolo**: documentar mensagens (login, seleção, movimento). Se falar com servidor legado, criar camada cliente em C++ e expor nós de Blueprint para fluxos de UI/gameplay. Se migrar servidor, usar replicação/RPCs nativos.
- **Transporte**: sockets/HTTP/GRPC em C++; Blueprints consomem nós assíncronos para login, matchmaking e status de sessão.
- **Segurança**: autenticação, criptografia e validação de payloads antes de entregar dados a Blueprints.

## 6) Gameplay e conteúdo
- **Progressão e economia**: representar inventário, atributos e habilidades em Data Assets/Tables; lógica momentânea em Blueprints, regras de negócio sensíveis em C++.
- **IA e NPCs**: Behavior Trees/Blackboards e AI Controllers em Blueprints, com serviços C++ se precisar de desempenho.
- **Missões e eventos**: estruturar quests/eventos com objetos de dados e triggers; scripting majoritariamente em Blueprints para iteração rápida.
- **Partículas e VFX**: recriar efeitos em Niagara, testando performance em cenários de pico.

## 7) Ferramentas, build e QA
- **Builds**: automação (CI) para editor e distribuição Win64; validações de assets e testes automatizados. Commandlets para checar nomes, referências quebradas e tamanho de pacotes.
- **Performance e memória**: perfilar CPU/GPU, ajustar LODs, `World Partition`, streaming de texturas e níveis de detalhe de Niagara. Perf presets selecionáveis em Blueprint.
- **Testes**: suites funcionais (Gauntlet/Automation) para UI, rede e gameplay crítico; smoke tests por milestone. Testes de Blueprint nativos para checar lógica de UI e fluxo de jogo.
- **Localização e acessibilidade**: preparar `Localization Dashboard`, bindings de input remapeáveis e opções de acessibilidade expostas em UI Blueprint.

## 8) Milestones sugeridos
1. **Prova de conceito**: personagem importado, mapa simples, UI mínima em UMG, movimento offline em Blueprint.
2. **Vertical slice online**: login, seleção de personagem, entrada em mapa com replicação básica (movimento/combate) e UI de rede em Blueprint.
3. **Cobertura principal**: UI completa, inventário/economia, missões, VFX e áudio; builds reproduzíveis e checklist de assets convertidos.
4. **Otimização e hardening**: performance, segurança de rede, testes automatizados e preparação para alpha.
5. **Conteúdo completo**: todos os mapas/quests/itens migrados, localização ativa e pipeline de publicação definido.

## 9) Governança e riscos
- **Escopo**: manter uso exclusivo dos assets originais e bloquear dependências externas não autorizadas.
- **Documentação viva**: changelog de conversões, tabelas de mapeamento (mensagens de rede → handlers UE5) e decisões de quando usar Blueprint vs C++.
- **Riscos**: perda de fidelidade de animação na conversão, divergência de protocolo de rede e custos de performance ao recriar efeitos antigos.

## 10) Critérios de conclusão
- Paridade funcional do cliente legado no UE5, com lógica principal exposta em Blueprints onde couber.
- Pipelines de build e testes automatizados estáveis.
- Assets originais convertidos/versionados, sem dependências externas não permitidas.
- Documentação e guias de operação/QA atualizados.

## 11) Instruções por sistema (passo a passo)

### Login (cliente + servidor)
1. **Blueprint Widget de Login**: criar tela com campos de usuário/senha e botão de entrar; validar input localmente antes de enviar.
2. **Chamada de rede**: usar `Blueprint Function Library` para encapsular envio de pacote de login; payload montado em C++ seguindo protocolo legado.
3. **Resposta**: em caso de sucesso, receber token/sessão e acionar evento Blueprint para carregar mapa de seleção de personagem; em erro, exibir mensagem amigável.

### Criação de personagem
1. **Tela UMG**: exibir slots vazios e existentes; usar Data Tables para classes/atributos iniciais.
2. **Validação**: aplicar regras de nome/classe em Blueprint e apenas então chamar função C++ de rede `CreateCharacter`.
3. **Confirmação**: ao receber confirmação do servidor, atualizar lista local e transicionar para seleção/spawn.

### HUD
1. **Widget principal**: construir barras de HP/MP, XP, mini-mapa e hotbar como componentes separados reutilizáveis.
2. **Bindings**: conectar variáveis replicadas (atributos, cooldowns) via `Event Dispatchers` em Blueprint.
3. **Notificações**: criar sistema de toasts/log no canto da tela, acionado tanto por eventos locais quanto de rede.

### Movimentação
1. **Character Blueprint**: usar `Character Movement Component` com estados (walk/run/dash) e curvas de aceleração.
2. **Input**: mapear teclado/mouse/controlador via `Enhanced Input`; adicionar lógica de travamento de câmera se o jogo exigir.
3. **Rede**: replicar input/posição via RPCs confiando na movimentação C++ de base; eventos visuais (pegadas/VFX) em Blueprint.

### Itens, inventário e drops
1. **Estruturas**: definir `Item` em Data Table (ID, tipo, stats, ícone). Inventário como array replicado em `PlayerState` ou `PlayerController`.
2. **UI**: widgets de inventário/tooltip criados em Blueprint, atualizados por eventos de alteração de array.
3. **Drops**: atores de drop com `Sphere Collision`; ao coletar, chamar RPC de pickup que valida no servidor e confirma em Blueprint.
4. **Uso/equipamento**: lógica de equipar/consumir em Blueprint com checagens de regra sensível em C++ (classe nível, cooldown global).

### XP e progressão
1. **Fórmula**: implementar cálculo de XP/nível em C++ (segurança) e expor função `OnXpGained` a Blueprint para atualizar HUD e efeitos.
2. **Eventos**: ao upar, disparar VFX/SFX em Blueprint, atualizar atributos base e enviar atualização ao servidor.

### Criação de cenário
1. **World Partition/Levels**: dividir mapas grandes em subníveis; usar Level Streaming para telas de login/seleção e mundo.
2. **Colisão e navegação**: gerar `NavMesh` e volumes de colisão compatíveis com o movimento original.
3. **Iluminação e clima**: configurar `Directional Light`, `SkyAtmosphere` e `Volumetric Fog`; guardar perfis para variações de hora/clima.

### HUD e UI de loja/chat (se aplicável)
1. **Chat**: widget dedicado com filtro de canais e comandos rápidos; entrada protegida contra spam via C++.
2. **Loja/serviços**: telas de compra/venda em Blueprint consumindo APIs de rede para verificar saldo e itens.

### Sistemas adicionais
- **Buffs/Debuffs**: tabela de efeitos com duração e modificadores; aplicar em Blueprint e validar em C++.
- **Eventos sazonais**: scripts de gatilho em Blueprint amarrados a timers/replicação para sincronizar com servidor.

## 12) Guia detalhado para paridade 1:1 no UE 5.7 (Blueprint + C++)

> Use esta lista como "receita" para reconstruir o cliente/servidor. Cada etapa indica o asset envolvido, parâmetros sugeridos e onde fica a lógica (Blueprint ou C++).

### 12.1 Configuração base do projeto
1. **Plugins obrigatórios** (Editar → Plugins): habilitar Enhanced Input, Niagara, World Partition, Editor Scripting Utilities, Python, Online Subsystem (se usar sockets) e Chaos Vehicles se houver montarias/veículos.
2. **Project Settings**:
   - `Maps & Modes`: definir **GameInstance Class** (C++) e **GameMode** padrão (C++ base + BP derivado). Mapas de **Editor Startup** = Login.umap; **Game Default Map** = Login.umap; **Transition Map** = Transition.umap.
   - `Input`: criar **Input Mapping Context** (IMC_Legacy) com ações: Move (Axis X/Y), Look (Axis), Jump (Action), Attack (Action), Interact (Action), Inventory (Action), Skill1..Skill0 (Actions). **Scale**: movimento 1.0, look 0.5 (ajuste fino a partir do cliente legado).
   - `Network`: `Use Network Simulator` desabilitado por padrão; `Max Client Rate`=30000; `Net Client Fixed Frame Rate`=0; `Net Relevancy Check Distance` igual à distância de renderização do cliente original.
   - `Rendering`: desabilitar `Generate Mesh Distance Fields` se não houver uso (performance); `Support Sky Atmosphere Affect Height Fog` habilitado; perfis de qualidade em `Scalability.ini` replicando o cliente original (LOD bias, anisotropy 8x, sombras médias por padrão).
   - `Engine > General Settings`: **Framerate** bloqueado em 60 para paridade inicial; habilitar `Use Fixed Frame Rate` em testes de rede previsíveis.
3. **Pastas padrão**: `/Game/Characters`, `/Game/Environment`, `/Game/UI`, `/Game/Audio`, `/Game/Systems` (Blueprint Function Libraries e Data Assets), `/Game/Maps/Login`, `/Game/Maps/Select`, `/Game/Maps/World`.

### 12.2 Importação e limpeza de assets
1. **Modelos/Animações**: importar FBX com `Import Mesh`=true, `Skeletal Mesh`=true, `Import Animations`=true, `Import Normals and Tangents`=true, `Preserve Smoothing Groups`=true. Skeleton compartilhado por família de personagens (ex.: SK_Player). Verificar `Max Influences`=4 para equivaler ao pipeline antigo.
2. **Materiais**: criar **Material Function** base (MF_CharacterSurface) com parâmetros: BaseColor (Texture), Normal, ORM (oclusão/roughness/metallic). **Material Instance** por personagem copiando coeficientes do cliente (specular/intensity). Se o cliente usava brilho per-vertex, habilitar `Use Emissive for Static Lighting` quando aplicável.
3. **Texturas**: Import Settings → `Mip Gen Settings`=Sharpen5 para UI; para personagens usar `Sharpen2`; `Compression Settings`=Masks (para ORM) e `TC_Default` para demais. **sRGB** desativado para mapas de normal/ORM.
4. **Áudio**: Sound Waves com `Sample Rate`=48kHz, `Compression Quality`=60 para efeitos curtos; usar Sound Cues com Random/Loop nodes replicando os gatilhos do cliente (passos, impactos, UI clicks).
5. **Niagara**: recriar partículas principais (impactos, buffs, portais) com System Settings limitando `Max Particles` para corresponder ao budget antigo; presets de qualidade via `Scalability` → `Niagara`.
6. **Mapas**: habilitar **World Partition** em mapas grandes. Converter colisões do cliente em `Blocking Volume` + `NavMeshBoundsVolume`. `Lighting` inicial: 1 `Directional Light` (Intensity 6-8 lux), `SkyLight` (Real Time Capture se necessário), `Exponential Height Fog` com `Fog Density` replicando visibilidade do cliente (ex.: 0.02 para neblina leve).

### 12.3 Rede: cliente + servidor
1. **Módulo de rede C++ (ClientNetModule)**: implementar sockets TCP/UDP conforme protocolo legado. Estruturas de pacote: `Header (uint16 opcode, uint16 size) + payload`. Funções expostas a Blueprint via `UBlueprintFunctionLibrary`:
   - `SendLogin(User, Pass)`, `SendCreateCharacter(Name, ClassId)`, `SendMove(Vector2D Input)`, `SendAttack(SkillId)`, `SendPickup(ItemGuid)`, `SendChat(Channel, Message)`.
   - Eventos multicast (`OnLoginResult`, `OnCharacterList`, `OnMoveRemote`, `OnItemDropped`, `OnXpChanged`).
2. **Fila de mensagens**: thread de rede em C++ coloca pacotes em `TQueue`. `GameInstance` processa na thread do jogo a cada Tick chamando eventos Blueprint.
3. **Validação**: checar tamanho de payload, opcode permitido e rate limit (ex.: movimento máximo 20 msgs/s). Descarta pacotes inválidos antes de expor a Blueprint.

### 12.4 Sistema de Login (passo a passo)
1. **UI**: criar `WB_Login` (Widget Blueprint) com campos `EditableText_Username`, `EditableText_Password`, botão `BtnLogin`. Botão chama `BP_SendLogin` (função em `BPL_Network` que aciona `SendLogin` C++).
2. **Feedback**: `Text_Error` visível em falha; spinner animado enquanto aguarda resposta (Timeline no widget).
3. **Fluxo**:
   - OnClick → valida vazio/regex local → desabilita campos → chama `SendLogin`.
   - `OnLoginResult` (evento do módulo C++) retorna `Success/Fail/Reason` → reabilita campos ou abre mapa `Select.umap` via `OpenLevel`.
4. **Servidor**: endpoint de login valida credenciais e envia opcode `0xF1` (exemplo) com token de sessão. Armazena token no `GameInstance` (var replicada para Blueprints).

### 12.5 Criação e seleção de personagem
1. **Widget `WB_CharacterSelect`**: lista de slots (UserWidget repetível `WB_CharSlot`). Cada slot tem botão `Create` se vazio ou `Play` se ocupado.
2. **Criação**: botão `Create` abre `WB_CharacterCreate` com campos Nome, Classe (Dropdown), Aparência (opcional). Blueprint valida nome (<=12 chars, regex) e chama `SendCreateCharacter`.
3. **Recepção**: `OnCharacterList` popula slots; `OnCharacterCreated` atualiza UI e retorna para seleção. `Play` chama RPC `SendSelectCharacter` e depois `OpenLevel` para o mapa inicial.
4. **Spawning**: GameMode recebe ID do personagem selecionado via `GameInstance`, busca DataTable de atributos iniciais e instancia `BP_PlayerCharacter` no ponto de spawn configurado.

### 12.6 HUD e UI in-game
1. **Estrutura**: `WB_HUD` agrega subwidgets: `WB_Bars` (HP/MP/Estamina), `WB_XP`, `WB_Minimap`, `WB_Hotbar`, `WB_Log/Toasts`, `WB_QuestTracker`.
2. **Bindings**: PlayerState expõe `CurrentHP`, `MaxHP`, `CurrentMP`, `XP`, `Level`, `Currency`. Eventos C++ → `OnAttributeChanged` → `Event Dispatchers` no PlayerController → Widgets escutam e atualizam progress bars/textos.
3. **Mini-mapa**: `SceneCapture2D` apontando para render target; máscara/ícones configurados em DataTable (tipo → ícone). Tamanho do render target igual ao cliente original (ex.: 512x512) para nitidez.
4. **Hotbar**: DataTable de Skills/Itens com ícone, cooldown, atalho padrão. Ao pressionar, chama `SendAttack` ou `UseItem` (Blueprint → C++ valida).

### 12.7 Movimentação e câmera
1. **Character Blueprint (BP_PlayerCharacter)**: usar `Character Movement` com `Max Walk Speed`=600 (ajuste baseado no cliente), `Braking Deceleration`=2048, `Rotation Rate`= (0,720,0). Estados walk/run/dash em **State Machine** no Animation Blueprint (ABP_Player). Dash: Timeline 0.25s multiplicando velocidade para 1200; cooldown controlado em PlayerController.
2. **Input**: IMC_Legacy mapeia WASD/Analog. **Look** sensitivity 0.5; inverter eixo se configurado. Câmera: `SpringArm` com `Target Arm Length` 600-800 (isométrico) ou 300-400 (over-the-shoulder). `Use Pawn Control Rotation` conforme estilo original.
3. **Rede**: `CharacterMovement` replicado automaticamente; habilidades de movimento extra usam `Server` RPC confiável. Latência: habilitar `Client Prediction` e `Network Smoothing Mode`=Linear para comportamento próximo ao cliente antigo.

### 12.8 Combate básico (se aplicável)
1. **Habilidades**: DataTable `DT_Skills` com ID, animação, danos, custo, cooldown, efeitos. Blueprint lê e dispara montagens de ataque (`AnimMontage`) com `Section` por tipo de arma.
2. **Aplicação de dano**: função `Server_ApplySkill` em C++ valida alvo, range (linha ou esfera), cooldown; aplica dano e envia evento `OnDamageApplied` para efeitos em Blueprint.
3. **Feedback**: Niagara para trilhas/impactos; Sound Cue por arma. Hit-react em ABP via notifies.

### 12.9 Itens, inventário e drops
1. **Definição**: `DT_Items` com campos: `ItemID`, `Tipo`, `ClasseEquip`, `MinLevel`, `Atributos`, `StackMax`, `Icone`, `Mesh`. Inventário: array replicado em `PlayerState`; peso total calculado em Blueprint para exibição.
2. **UI**: `WB_Inventory` grid com `WB_ItemSlot`. Drag & Drop habilitado; ao soltar, chama `Server_MoveItem` (C++ valida posição/stack). Tooltips leem atributos da DataTable.
3. **Drops**: classe `BP_DropActor` com `StaticMesh/SkeletalMesh`, `Sphere Collision (Radius 80-120)`, `Billboard` para ícone. Evento `OnBeginOverlap` chama `Server_RequestPickup(ItemGuid)`. Servidor confirma e envia `OnItemPicked` para cliente remover o actor e atualizar inventário.
4. **Equipar/usar**: blueprint chama `Server_Equip(ItemGuid)`; C++ verifica requisitos e atualiza atributos, replicando aparência (Skeletal Mesh merge ou Attach Component).

### 12.10 XP, níveis e progressão
1. **Fórmula**: implementar em C++ (`GetXpForLevel(Level)`) com tabela ou curva que replica o cliente. Variáveis replicadas: `CurrentXP`, `CurrentLevel`, `AttributePoints`.
2. **Ganho**: `OnXpGained` (evento C++) chamado ao receber pacote de combate; Blueprint atualiza HUD, toca VFX/SFX de level up e abre `WB_LevelUp` para distribuição de pontos.
3. **Sincronismo**: ao subir nível, servidor envia atributos atualizados; cliente reconcilia e atualiza barras/atributos locais.

### 12.11 Criação de cenário e navegação
1. **Blocos de colisão**: importar colisões do cliente ou criar `Blocking Volume` alinhado. Ajustar `NavMesh` para largura de personagens igual ao cliente (ex.: `Agent Radius`=35, `Agent Height`=96).
2. **Streaming**: mapas grandes divididos em subníveis (terrain, props, VFX). Level Streaming por portal ou distância; telas de login/seleção carregam subnível mínimo para boot rápido (<5s).
3. **Iluminação**: perfis Dia/Noite armazenados em `Data Assets` com `Directional Intensity`, `SkyLight Intensity`, `Fog Density`, `Temperature` (Kelvin). Blueprint alterna conforme eventos do servidor.
4. **Triggers e scripting**: volumes `BP_TriggerEvent` enviados do servidor para spawn de NPCs, portais e cutscenes; lógica visual em Blueprint, autorização em C++.

### 12.12 Áudio e feedback
1. **Mix**: criar `Sound Mix` e `Sound Class` para Música, FX, Voz, UI. Sliders em `WB_Options` ajustam `SoundClass Volume` replicando as preferências do cliente.
2. **Notifies**: em montagens de ataque, adicionar Notifies para passos, impacto, voz. Em Blueprint, disparar Niagara/SFX correspondentes.
3. **Ambiente**: zonas com `Audio Volume` e `Reverb Effect` similares ao cliente (ex.: cavernas com ReverbPredelay 20ms, DecayTime 1.2s).

### 12.13 QA, automação e publicação
1. **Automation Tests**: criar testes de UI (UMG) e de rede (Gauntlet) que executam login → selecionar personagem → mover → atacar → pegar item. Salvar como `Automation/SmokeLoginMove`.
2. **Commandlets**: script Python/Commandlet para validar naming (`SK_`, `SM_`, `MI_`, `WB_`), checar texturas com sRGB correto e detectar referências quebradas.
3. **Build**: `Cook by the book` para Win64; `Pak` habilitado; `Pak` encryption desativada se precisar de compatibilidade com servidor legado (ou habilitar AES e compartilhar chave). Inclua `-NoEditorContent` para garantir uso exclusivo dos assets originais.
