// app.js

const mechanics = [
  {
    id: "serverlist-script-load",
    name: "Leitura e descriptografia de ServerList.bmd",
    type: "Cliente",
    files: ["ServerListManager.cpp", "ServerListManager.h"],
    classes: ["CServerListManager"],
    functions: ["LoadServerListScript", "BuxConvert"],
    networkDetails: "Nenhum envio de rede: leitura local do arquivo Data\\\\Local\\\\ServerList.bmd e armazenamento em m_mapServerListScript.",
    flow: "LoadServerListScript abre ServerList.bmd, verifica erro, descriptografa campos com BuxConvert e insere SERVER_GROUP_INFO decodificados em m_mapServerListScript, retornando false se o arquivo não for encontrado.",
    description: "Mantém um cache de grupos de servidor a partir do arquivo binário local, aplicando XOR rotativo (0xfc,0xcf,0xab) em cada byte lido antes de copiar para SServerGroupInfo e checando falha de fopen."
  },
  {
    id: "servergroup-creation",
    name: "Criação/reutilização de grupos de servidor",
    type: "Cliente",
    files: ["ServerListManager.cpp", "ServerListManager.h", "ServerGroup.cpp", "ServerGroup.h"],
    classes: ["CServerListManager", "CServerGroup"],
    functions: ["InsertServerGroup", "MakeServerGroup", "Release"],
    networkDetails: "Não envia pacotes; reorganiza estruturas locais antes da conexão.",
    flow: "InsertServerGroup procura grupo existente por m_iServerIndex (iConnectIndex/20); se não há, cria CServerGroup, preenche via MakeServerGroup com dados de script e registra em m_mapServerGroup.",
    description: "Administra o ciclo de vida de grupos (alocação, limpeza, posição e sequência) antes de listar/selecionar servidores." 
  },
  {
    id: "serverentry-population",
    name: "Construção de entradas de servidor e rotulagem de carga",
    type: "Cliente",
    files: ["ServerListManager.cpp", "ServerInfo.h"],
    classes: ["CServerListManager", "CServerInfo"],
    functions: ["InsertServer"],
    networkDetails: "Sem RPCs; prepara texto exibido para seleção.",
    flow: "InsertServer cria CServerInfo, define índices (m_iSequence, m_iIndex, m_iConnectIndex), aplica percentuais para escolher GlobalText[560..562] e monta m_bName com sufixos Non-PVP/Gold conforme m_byNonPvP.",
    description: "Formata nomes visíveis e percentuais de uso por servidor, preservando flags de PvP e conectividade." 
  },
  {
    id: "server-iteration",
    name: "Iteração sobre grupos e servidores",
    type: "Cliente",
    files: ["ServerListManager.cpp", "ServerGroup.cpp"],
    classes: ["CServerListManager", "CServerGroup"],
    functions: ["SetFirst", "GetNext"],
    networkDetails: "Sem rede; iteração local.",
    flow: "Ambas as classes resetam iteradores (SetFirst) e percorrem coleções com GetNext, retornando ponteiros até esgotar a lista; em CServerListManager o iterador percorre m_mapServerGroup e em CServerGroup percorre m_vServerInfo.",
    description: "Fornece cursores para UI percorrer grupos e servidores cadastrados sem reordenar a coleção."
  },
  {
    id: "server-selection-state",
    name: "Registro de seleção de servidor e flags",
    type: "Cliente",
    files: ["ServerListManager.cpp", "ServerListManager.h"],
    classes: ["CServerListManager"],
    functions: ["SetSelectServerInfo", "GetSelectServerName", "GetSelectServerIndex", "GetCensorshipIndex", "IsNonPvP", "IsTestServer"],
    networkDetails: "Sem envio imediato; guarda estado para uso posterior.",
    flow: "SetSelectServerInfo copia nome, índices e flags de PvP/teste em membros; getters retornam esses dados para UI/fluxo de conexão; m_bCensorshipIndex é derivado de iCensorship e m_bNonPVP/m_bIsTestServer são retornados por verificadores dedicados.",
    description: "Mantém estado do servidor escolhido pelo usuário, incluindo censura, flag de teste e PvP, para ser usado por conectores como WSclient ou ProtocolSend." 
  },
  {
    id: "protocol-connection",
    name: "Conexão e desconexão via CustomClient",
    type: "Cliente",
    files: ["ProtocolSend.cpp", "ProtocolSend.h"],
    classes: ["CProtocolSend", "CustomClient"],
    functions: ["ConnectServer", "DisconnectServer", "CheckConnected", "SendPingTest", "SendCheckOnline", "SendPacket", "SendPacketClassic"],
    networkDetails: "Sistema de packets do projeto original: utiliza olc::net::client_interface<ProtocolHead> para conectar IP/Port, manter flag g_bGameServerConnected e enviar ping (CLIENT_LIVE_CLIENT) e check periódico.",
    flow: "ConnectServer instancia CustomClient e chama Connect; DisconnectServer zera g_bGameServerConnected, fecha socket e loga; CheckConnected verifica IsConnected; SendPingTest delega a PingServer; SendCheckOnline retorna se desconectado, envia ping e loga; SendPacket/SendPacketClassic são wrappers para DataSend com/sem cabeçalho.",
    description: "Gerencia o socket cliente e o envio bruto pelo sistema de packets do projeto original usando ProtocolHead; na adaptação Unreal esses envios são substituídos por RPCs e propriedades replicadas."
  },
  {
    id: "protocol-recv-dispatch",
    name: "Fila de recebimento e despacho de mensagens",
    type: "Cliente",
    files: ["ProtocolSend.cpp", "WSclient.cpp"],
    classes: ["CProtocolSend"],
    functions: ["RecvMessage"],
    networkDetails: "Sistema de packets do projeto original: processa mensagens ProtocolHead do servidor e encaminha para handlers locais ou TranslateProtocol; WSclient.cpp lida com pacotes C1/C2/C3/C4 descriptografando via SimpleModulus e validando g_byPacketSerialRecv antes de repassar.",
    flow: "Dentro de conexão ativa, enquanto Incoming não vazio: pop_front.msg e switch em msg.header.id chamando RecvJoinServerNew (SERVER_CONNECT), RecvLoginNew (BOTH_CONNECT_LOGIN), ReceiveCharacterList, ReceiveMovePosition, ReceiveMoveCharacter ou TranslateProtocol para BOTH_MESSAGE após calcular header/size; na pilha WSclient::ProtocolCompiler, GetReadMsg devolve buffers, cabeçalhos C3/C4 são decriptados para byDec, serial é incrementado ou gera erro/hacking se divergente e TotalPacketSize é acumulado.",
    description: "Ponto central de despacho de pacotes recebidos e decodificados, combinando fila da CustomClient com parsing de cabeçalhos C1/C2/C3/C4 e controle de serial para detectar corrupção." 
  },
  {
    id: "protocol-login-send",
    name: "Envio de login com codificação Bux",
    type: "Cliente",
    files: ["ProtocolSend.cpp", "ProtocolSend.h"],
    classes: ["CProtocolSend"],
    functions: ["SendRequestLogInNew"],
    networkDetails: "Sistema de packets do projeto original: envia PMSG_CONNECT_ACCOUNT_SEND via ProtocolHead::BOTH_CONNECT_LOGIN com campos codificados por BuxConvert e versão/serial do cliente.",
    flow: "Configura LogIn=1, CurrentProtocolState=REQUEST_LOG_IN, copia account/password com strncpy, faz BuxConvert nos campos, define TickCount/versão/serial, escreve mensagens em g_pChatListBox e chama SendPacket." ,
    description: "Constrói pacote de autenticação e notifica UI via g_pChatListBox antes do envio."
  },
  {
    id: "socket-option-script",
    name: "Leitura de opções de socket e descriptografia",
    type: "Cliente",
    files: ["SocketSystem.cpp", "SocketSystem.h"],
    classes: ["CSocketItemMgr"],
    functions: ["OpenSocketItemScript", "BuxConvert", "CalcSocketOptionValue", "CalcSocketOptionValueText", "CreateSocketOptionText"],
    networkDetails: "Sem rede; o sistema de packets do projeto original não participa desta carga de dados local.",
    flow: "OpenSocketItemScript abre arquivo binário de opções, faz fread de SOCKET_OPTION_INFO em duplo loop por tipo e índice, aplica BuxConvert (XOR 0xfc/0xcf/0xab) para descriptografar, fecha o arquivo e calcula m_iNumEquitSetBonusOptions até encontrar entrada vazia.",
    description: "Processa script de opções de socket em binário local, aplicando XOR por byte, montando valores numéricos e texto de bônus (CalcSocketOptionValue/CalcSocketOptionValueText) para uso por ferramentas de tooltip e cálculo de status."
  },
  {
    id: "socket-tooltip-bonus",
    name: "Tooltip e bônus de itens com socket",
    type: "Cliente",
    files: ["SocketSystem.cpp", "SocketSystem.h"],
    classes: ["CSocketItemMgr"],
    functions: ["IsSocketItem", "GetSocketCategory", "AttachToolTipForSocketItem", "AttachToolTipForSeedSphereItem", "RenderToolTipForSocketSetOption", "CheckSocketSetOption", "CalcSocketStatusBonus", "GetSocketOptionValue"],
    networkDetails: "Sem rede; calcula apenas localmente e exibe com RenderTipTextList. O sistema de packets do projeto original não intervém nesta lógica de UI/atributos.",
    flow: "IsSocketItem avalia tipos de item ou OBJECT; AttachToolTipForSocketItem/AttachToolTipForSeedSphereItem formatam TextList com GlobalText e cores; CheckSocketSetOption soma categorias para habilitar bônus set e preenche m_EquipSetBonusList; RenderToolTipForSocketSetOption exibe bônus; CalcSocketStatusBonus percorre equipamentos e acumula bônus de ataques/defesa/atributos; GetSocketOptionValue retorna bônus individual de slot quando não vazio.",
    description: "Gera textos de tooltip, verifica seeds e set bonus, acumula bônus de status e fornece valores numéricos para itens com sockets, utilizando tabelas carregadas e inventário atual."
  },
  {
    id: "protocol-login-recv",
    name: "Processamento de join/login recebidos",
    type: "Cliente",
    files: ["ProtocolSend.cpp"],
    classes: ["CProtocolSend"],
    functions: ["RecvJoinServerNew", "RecvLoginNew"],
    networkDetails: "Manipula mensagens ProtocolHead::SERVER_CONNECT e BOTH_CONNECT_LOGIN recebidas na fila.",
    flow: "RecvJoinServerNew extrai HeroKey, loga dados de versão, quando LogIn!=0 chama g_csMapServer.SendChangeMapServer; caso contrário mostra m_LoginWin, seta CurrentProtocolState conforme result ou abre PopUpMsgWin e valida Version vs ClientVersion; RecvLoginNew faz switch nos códigos 0x00-0xD2, ajusta CurrentProtocolState/LogIn, chama CheckHack nos casos de sucesso e mostra PopUpMsgWin para erros diversos." ,
    description: "Define o estado de conexão após resposta do servidor, aciona troca de map server quando já logado e aplica validação de versão e mensagens de erro específicas."
  },
  {
    id: "protocol-character-and-move",
    name: "Solicitação de personagens, posição e movimento comprimido",
    type: "Cliente",
    files: ["ProtocolSend.cpp", "ProtocolSend.h"],
    classes: ["CProtocolSend"],
    functions: ["SendRequestCharactersListNew", "SendPositionNew", "SendCharacterMoveNew"],
    networkDetails: "Sistema de packets do projeto original: pacotes enviados com cabeçalhos BOTH_CONNECT_CHARACTER, BOTH_POSITION e BOTH_MOVE; PathNum limitado por MAX_PATH_FIND e codificado em nibbles.",
    flow: "SendRequestCharactersListNew envia PMSG_SIMPLE_RESULT_SEND.result=1; SendPositionNew envia PMSG_POSITION_SEND com x/y; SendCharacterMoveNew valida PathNum, copia coordenadas iniciais, calcula Path[8] e Dir baseado em DirTable, agrega PathNum e envia pacote." ,
    description: "Aciona listagem de personagens e movimento do avatar com compressão de trajeto em bytes path[8]." 
  },
  {
    id: "protocol-generic-send",
    name: "Envio genérico de pacotes via DataSend",
    type: "Cliente",
    files: ["ProtocolSend.h"],
    classes: ["CustomClient"],
    functions: ["DataSend(ProtocolHead,uint8_t*,uint16_t)", "DataSend(uint8_t*,uint16_t)", "MessageAll"],
    networkDetails: "Sistema de packets do projeto original: encapsula payload em olc::net::message com header.id específico ou BOTH_MESSAGE quando apenas buffer é fornecido.",
    flow: "Versão com ProtocolHead define header.id e redimensiona body antes de Send; versão clássica verifica IsConnected, seta id=BOTH_MESSAGE e preenche body com memcpy.",
    description: "Abstrai a montagem de mensagens binárias para diferentes cabeçalhos do protocolo sem alterar os dados originais."
  },
  {
    id: "wsclient-socket-decode",
    name: "Criação de socket assíncrono e descriptografia de pacotes (WSclient)",
    type: "Cliente",
    files: ["WSclient.cpp", "wsclientinline.h"],
    classes: ["CWsctlc"],
    functions: ["CreateSocket", "DeleteSocket", "ProtocolCompiler", "AddDebugText", "ReceiveCheckSumRequest"],
    networkDetails: "Sistema de packets do projeto original: CreateSocket inicializa CWsctlc, conecta com WM_ASYNCSELECTMSG e zera g_byPacketSerialSend/g_byPacketSerialRecv; ProtocolCompiler decripta pacotes C3/C4 via g_SimpleModulusSC, valida serial e envia SendHackingChecked em falha.",
    flow: "CreateSocket executa Startup/LogPrintOn (debug), cria socket da janela e chama Connect; ProtocolCompiler consome GetReadMsg, identifica C1/C2 ou decripta C3/C4 para byDec, ajusta header e incrementa g_byPacketSerialRecv ou registra erro, soma Size em TotalPacketSize e opcionalmente salva pacote; ReceiveCheckSumRequest calcula checksum e invoca SendCheckSum; DeleteSocket fecha o socket.",
    description: "Implementa camada de transporte síncrona ao Windows, incluindo conexão assíncrona, serialização de pacotes criptografados SimpleModulus, verificação de sequência e resposta a pedidos de checksum."
  },
  {
    id: "server-protocolcore-dispatch",
    name: "Despacho central ProtocolCore (servidor)",
    type: "Servidor",
    files: ["Protocol.cpp", "Connection.cpp", "SocketManagerModern.cpp"],
    classes: ["ProtocolCore"],
    functions: ["ProtocolCore", "Connection::ProtocolCore", "SocketManagerModern::DataRecv"],
    networkDetails: "Sistema de packets do projeto original: SocketManagerModern/Connection leem cabeçalhos C1/C2/C3/C4, calculam tamanho/serial e repassam para ProtocolCore, que roteia para handlers específicos (chat, ataque, movimento, item, trade, party, guild, warehouse etc.).",
    flow: "Connection carrega ponteiro wsProtocolCore com ProtocolCore; ao receber dados (SocketManagerModern::DataRecv) decriptografa se necessário e chama ProtocolCore(head,lpMsg,size,aIndex,encrypt,serial). ProtocolCore loga packets (exceto alguns cabeçalhos) e faz switch em head: 0x00 chat → CGChatRecv; 0x02 whisper → CGChatWhisperRecv; 0x03 main check; 0x0E live client; PROTOCOL_CODE2 ataque → gAttack.CGAttackRecv; PROTOCOL_CODE3 posição → CGPositionRecv; 0x18 ação → CGActionRecv; 0x19/0x1B/0x1E skills; 0x22-0x26 pegar/soltar/mover/usar item; 0x30/0x31 falar com NPC/fechar; 0x32-0x34 comprar/vender/reparar; 0x36-0x3D fluxo de trade (request/response/dinheiro/ok/cancel); 0x3F subcódigos de PersonalShop; 0x40-0x43 party; 0x4A-0x4E skills RageFighter/mineração/event inventory/MuRummy/Muun; 0x50-0x57 guild; 0x61/0x66 guild war/viewport; 0x81-0x83 warehouse; 0x86-0x87 chaos mix; 0x8E teleporte; 0x90 DevilSquare e demais casos especificados.",
    description: "Função central do servidor que recebe pacotes do sistema de packets original e encaminha para dezenas de handlers especializados (chat, combate, skills, itens, trade, party, guild, warehouse, eventos), registrando logs hexadecimais para depuração."
  },
  {
    id: "mapserver-change",
    name: "Troca de Map Server e reconexão",
    type: "Cliente",
    files: ["CSMapServer.cpp", "CSMapServer.h", "WSclient.cpp"],
    classes: ["CSMServer"],
    functions: ["ConnectChangeMapServer", "SendChangeMapServer", "SetServerInfo", "SetHeroID", "GetServerAddress"],
    networkDetails: "Sistema de packets do projeto original: usa CreateSocket/SendChangeMServer e transições controladas por LogIn/HeroKey; sem RPCs Unreal.",
    flow: "ConnectChangeMapServer armazena MServerInfo, salva opções/macro, dorme 20ms e cria socket para novo IP/porta se LogIn!=0; SetHeroID guarda m_strHeroID; SendChangeMapServer valida m_bFillServerInfo/LogIn, copia ID para CharID, chama ClearCharacters(-1)/InitGame e depois SendChangeMServer com auth codes e LogInID; GetServerInfo/GetServerAddress retornam valores ou zeram buffers quando sem dados.",
    description: "Gerencia reconexão para map server diferente após login, persistindo dados de servidor e ID do herói, disponibilizando getters e reinicializando estado local antes de enviar a troca."
  },
  {
    id: "buff-script-load",
    name: "Carga e descriptografia de BuffEffect_*.bmd",
    type: "Cliente",
    files: ["w_BuffScriptLoader.cpp", "w_BuffScriptLoader.h"],
    classes: ["BuffScriptLoader", "BuffInfo"],
    functions: ["BuffScriptLoader::Load", "BuxConvert", "BuxConvertW", "CutTokenString", "GetBuffinfo", "IsBuffClass", "GetBuffIndex", "GetBuffType"],
    networkDetails: "Nenhuma comunicação de rede; leitura local de arquivo data/local/<ML>/BuffEffect_<ML>.bmd com checagem de checksum e xor BuxConvert.",
    flow: "Construtor forma nome do arquivo, chama Load; Load abre BIN, lê listsize e buffer criptografado, aplica BuxConvert/BuxConvertW, valida checksum com GenerateCheckSum2, monta BuffInfo com nomes/descrições tokenizadas e insere em m_Info; opcionalmente resolve índices/tipos por item code.",
    description: "Deserializa tabelas de buffs de arquivo BMD, aplica xor rotativo, valida checksum e tokeniza descrições em lista para uso posterior, abortando com MessageBox/SendMessage em corrupção ou ausência de arquivo."
  },
  {
    id: "buff-time-control",
    name: "Registro e temporização de buffs ativos",
    type: "Cliente",
    files: ["w_BuffTimeControl.cpp", "w_BuffTimeControl.h"],
    classes: ["BuffTimeControl"],
    functions: ["RegisterBuffTime", "UnRegisterBuffTime", "CheckBuffTimeType", "GetBuffMaxTime", "HandleWindowMessage", "GetBuffStringTime", "GetBuffTime", "IsBuffTime", "GetBuffEventTime", "GetStringTime"],
    networkDetails: "Sem rede; usa SetTimer/KillTimer de janela (WM_TIMER) para decrementar tempos de buff localmente.",
    flow: "Destrutor limpa m_BuffTimeList e mata timers; RegisterBuffTime calcula BuffTimeType via g_IsBuffClass/g_BuffInfo, limita tempo pelo ItemAddOption/retorno -1, grava em m_BuffTimeList e seta timer 900ms; HandleWindowMessage responde WM_TIMER e chama CheckBuffTime para decrementar; UnRegisterBuffTime remove timers ativos; GetBuffStringTime/GetStringTime convertem duração em texto usando GlobalText[2298..2308].",
    description: "Gerencia duração de buffs com timers de janela, converte tempos para texto, controla existência via IsBuffTime e encerra buffers no destrutor."
  },
  {
    id: "buff-value-control",
    name: "Consulta de valores numéricos de buffs",
    type: "Cliente",
    files: ["w_BuffStateValueControl.cpp", "w_BuffStateValueControl.h"],
    classes: ["BuffStateValueControl"],
    functions: ["CheckValue", "SetValue", "GetValue", "GetBuffInfoString", "GetBuffValueString", "Initialize"],
    networkDetails: "Nenhuma rede; consome tabelas locais de BuffInfo e ItemAddOptioninfo para preencher valores.",
    flow: "Initialize percorre eBuff_Attack..eBuff_Count chamando CheckValue; GetValue consulta cache m_BuffStateValue ou chama SetValue para popular com dados de item/zerar valores; GetBuffInfoString adiciona nome e descrições tokenizadas a uma lista com quebra de linha; GetBuffValueString formata Value1 em texto.",
    description: "Fornece acesso a valores e textos de buffs combinando dados carregados e opções de itens, mantendo cache por eBuffState e destrutor que invoca Destroy()."
  },
  {
    id: "buff-system-dispatch",
    name: "Agregação de sistema de buff e encaminhamento de mensagens de janela",
    type: "Cliente",
    files: ["w_BuffStateSystem.cpp", "w_BuffStateSystem.h", "_GlobalFunctions.cpp", "_GlobalFunctions.h"],
    classes: ["BuffStateSystem"],
    functions: ["BuffStateSystem::Make", "Initialize", "Destroy", "HandleWindowMessage", "TheBuffStateSystem"],
    networkDetails: "Sem rede; apenas instancia controles e delega mensagens WM_TIMER.",
    flow: "Make cria BuffStateSystem, chama Initialize para instanciar BuffScriptLoader/BuffTimeControl/BuffStateValueControl; HandleWindowMessage delega para BuffTimeControl; globais em _GlobalFunctions expõem TheBuffStateSystem e g_BuffSystem para uso amplo.",
    description: "Coordena subsistemas de buff, centralizando criação e roteamento de mensagens de temporização para manter o estado em sincronia." 
  },

  {
    id: "server-modern-socket",
    name: "Servidor assíncrono SocketManagerModern",
    type: "Servidor",
    files: ["SocketManagerModern.cpp", "SocketManagerModern.h", "SocketConnection.cpp", "SocketConnection.h"],
    classes: ["CSocketManagerModern", "CSocketConnection"],
    functions: ["StartServer", "ListenServer", "PacketSend", "DataReceived", "ProtocolSend", "OnMessage"],
    networkDetails: "Sistema de packets do projeto original: servidor usa olc::net::server_interface<ProtocolHead> para aceitar clientes, PacketSend encapsula head/size e envia, e DataReceived despacha CLIENT_LIVE_CLIENT, BOTH_CONNECT_LOGIN, BOTH_CONNECT_CHARACTER, BOTH_POSITION, BOTH_MOVE, BOTH_ATTACK1/2 e BOTH_MESSAGE (repassado a ProtocolCore).",
    flow: "StartServer verifica porta com CheckPortUse, instancia CSocketConnection, inicia thread ListenServer que chama connection->Update; PacketSend cria message<ProtocolHead> com body via memcpy e chama connection->ProtocolSend; DataReceived faz switch em header.id, chama CGConnectAccountRecv/CGCharacterListRecv/CGPositionRecv/CGMoveRecv/gAttack/gSkillManager ou reconstrói recv[] e passa a ProtocolCore via gPacketManager.ExtractPacket.",
    description: "Orquestra a camada de transporte moderna do servidor, encaminhando cada ProtocolHead para a lógica de jogo depois de validar e reconstruir o buffer recebido."
  },
  {
    id: "server-login-auth",
    name: "Handshake de conexão e autenticação do servidor",
    type: "Servidor",
    files: ["Protocol.cpp"],
    classes: ["ProtocolCore"],
    functions: ["GCConnectClientSend", "GCConnectAccountSend", "CGConnectAccountRecv"],
    networkDetails: "Sistema de packets do projeto original: GCConnectClientSend/GCConnectAccountSend usam ProtocolHead::SERVER_CONNECT e BOTH_CONNECT_LOGIN quando NEW_PROTOCOL_SYSTEM==1; CGConnectAccountRecv valida ClientVersion/ClientSerial antes de encaminhar ao JoinServer.",
    flow: "GCConnectClientSend monta PMSG_CONNECT_CLIENT_SEND com result, índices e ClientVersion e envia via gSocketManagerModern.PacketSend; GCConnectAccountSend devolve código de login. CGConnectAccountRecv exige Connected==OBJECT_CONNECTED, compara versões/seriais, registra TickCounts, decripta account/password com PacketArgumentDecrypt e chama GJConnectAccountSend com IP do cliente.",
    description: "Processo de autenticação no servidor que confirma versão/serial e só depois pede validação de conta ao JoinServer."
  },
  {
    id: "server-character-list",
    name: "Envio da lista de personagens (servidor)",
    type: "Servidor",
    files: ["Protocol.cpp", "DSProtocol.cpp"],
    classes: ["ProtocolCore"],
    functions: ["CGCharacterListRecv", "GDCharacterListSend", "DGCharacterListRecv"],
    networkDetails: "Sistema de packets do projeto original: BOTH_CONNECT_CHARACTER acionado em DataReceived chama CGCharacterListRecv e GDCharacterListSend; DSProtocol monta buffer com personagens e envia via gSocketManagerModern.PacketSend quando NEW_PROTOCOL_SYSTEM==1.",
    flow: "CGCharacterListRecv retorna se Connected!=OBJECT_LOGGED; caso contrário, chama GDCharacterListSend. No retorno do DataServer (DGCharacterListRecv), o código preenche PMSG_CHARACTER_LIST_SEND com contagem, classe liberada e info de cada slot, ajusta header.size e envia pela PacketSend/ProtocolHead::BOTH_CONNECT_CHARACTER.",
    description: "Fornece ao cliente a lista completa de personagens disponíveis após login, respeitando restrições de classe/nível e usando o protocolo moderno quando habilitado."
  },
  {
    id: "server-position-sync",
    name: "Atualização de posição e broadcast (servidor)",
    type: "Servidor",
    files: ["Protocol.cpp"],
    classes: ["ProtocolCore"],
    functions: ["CGPositionRecv"],
    networkDetails: "Sistema de packets do projeto original: mensagem ProtocolHead::BOTH_POSITION recebida em DataReceived dispara CGPositionRecv, que envia PMSG_POSITION_SEND para o próprio jogador e para todos do viewport via PacketSend/DataSend.",
    flow: "CGPositionRecv redefine PathCount/PathCur, atualiza X/Y/TX/TY/OldX/OldY, ajusta atributos do mapa e monta PMSG_POSITION_SEND com index/x/y; envia ao próprio usuário e itera VpPlayer2 para enviar a cada usuário ativo no entorno.",
    description: "Sincroniza reposicionamento instantâneo do personagem no servidor e replica a nova coordenada para todos os jogadores visíveis."
  },
  {
    id: "server-move-sync",
    name: "Processamento de movimento comprimido (servidor)",
    type: "Servidor",
    files: ["Protocol.cpp"],
    classes: ["ProtocolCore"],
    functions: ["CGMoveRecv"],
    networkDetails: "Sistema de packets do projeto original: ProtocolHead::BOTH_MOVE recebido em DataReceived chama CGMoveRecv, que converte path codificado em PMSG_MOVE_SEND e envia via PacketSend/DataSend para o jogador e seu viewport.",
    flow: "CGMoveRecv verifica PathCount e colisão em gMap; se bloqueado, limpa Path e reposiciona. Caso contrário, deleta stand attr antiga, atualiza coordenadas/dir, seta nova stand attr, monta PMSG_MOVE_SEND com dir<<4 e envia ao jogador e a cada VpPlayer2 ativo.",
    description: "Aplica o caminho enviado pelo cliente, lida com bloqueios de terreno e propaga o movimento comprimido para observadores próximos."
  }

];

const ueGuides = {
  "serverlist-script-load": {
    title: "Recriar leitura ServerList.bmd",
    steps: [
      "1. Abra o Unreal Engine 5.7, carregue o projeto e no Content Browser clique em **Add → New C++ Class**.",
      "2. Escolha **None** como base e crie uma classe `UObject` chamada `UServerListManagerUE` para substituir a leitura local feita por CServerListManager.",
      "3. No arquivo `.h`, declare um método `UFUNCTION(BlueprintCallable)` `bool LoadServerListScript(const FString& FilePath)` e um `TMap<int32, FServerGroupInfo>` (defina `USTRUCT` espelhando SERVER_GROUP_INFO: nome, pos, sequence, NonPVP).",
      "4. No arquivo `.cpp`, em `LoadServerListScript`, use `FFileHelper::LoadFileToArray` e aplique o XOR rotativo (0xfc, 0xcf, 0xab) byte a byte antes de copiar para o struct; retorne false quando falhar, replicando o comportamento do código original.",
      "5. Compile pelo Editor (botão **Compile**). Depois, crie um Blueprint baseado em `UServerListManagerUE`, abra em **Class Defaults** e deixe sem replicação (somente cliente), pois é leitura local.",
      "6. No Blueprint de UI que lista servidores, chame `LoadServerListScript` via BlueprintCallable e armazene o TMap para preencher widgets de lista, sem qualquer socket ou packet do sistema original."
    ]
  },
  "servergroup-creation": {
    title: "Gerenciar grupos de servidor",
    steps: [
      "1. No Content Browser, crie um **Blueprint Struct** `FServerGroupUE` com campos para sequência, posição, largura e array de servidores (espelhando CServerGroup).",
      "2. Em seguida, crie uma classe `UObject` C++ `UServerGroupContainer` (Add → New C++ Class → None) para armazenar um `TMap<int32, FServerGroupUE>`.",
      "3. No `.h`, declare `UFUNCTION(BlueprintCallable)` `void InsertServerGroup(int32 ConnectIndex, const FServerGroupInfo& Info)` que calcula `ServerIndex = ConnectIndex/20` e cria ou reutiliza entradas, e métodos `SetFirst`/`GetNext` que mantêm um índice interno para iteração.",
      "4. No `.cpp`, implemente a lógica de criação e preenchimento usando dados já carregados pelo gerenciador de scripts; não use sockets nem packets do sistema original, apenas estruturas locais.",
      "5. Compile e crie um Blueprint baseado em `UServerGroupContainer`; em **Class Defaults**, deixe sem replicação, pois é estado local de UI.",
      "6. Na UI (UMG), chame `SetFirst` e `GetNext` via nós Blueprint para percorrer grupos ao construir a lista de servidores."
    ]
  },
  "serverentry-population": {
    title: "Construir entradas e rótulos de servidor",
    steps: [
      "1. Crie um **Blueprint Struct** `FServerInfoUE` contendo Sequence, Index, ConnectIndex, Percent, NonPvP (bool) e Name (FString) para espelhar CServerInfo.",
      "2. Em uma classe `UObject` (pode ser o mesmo container de grupos), adicione uma função `UFUNCTION(BlueprintCallable)` `FServerInfoUE MakeServerInfo(...)` que recebe os valores e monta o texto de Name com base no Percent (>=128, >=100 ou outro) e no flag NonPvP, seguindo o código de InsertServer.",
      "3. No `.cpp`, carregue as strings equivalentes a GlobalText[560..562]; se o código não fornecer o texto, use a frase 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' e permita edição manual no Blueprint.",
      "4. Compile e, no Blueprint de UI da lista de servidores, chame `MakeServerInfo` para cada entrada antes de popular um ListView; não marque replicação, pois é apenas visual."
    ]
  },
  "server-iteration": {
    title: "Iterar grupos e servidores",
    steps: [
      "1. No `UServerGroupContainer`, adicione variáveis `int32 CurrentGroupIndex` e `int32 CurrentServerIndex` marcadas como `UPROPERTY()` simples (sem replicação).",
      "2. Implemente `UFUNCTION(BlueprintCallable)` `void SetFirstGroup()` e `UFUNCTION(BlueprintCallable)` `bool GetNextGroup(FServerGroupUE& OutGroup)` que percorrem o TMap mantendo a ordem de inserção armazenada; retorne false ao fim.",
      "3. Dentro de cada grupo, implemente funções análogas `SetFirstServer`/`GetNextServer` que iteram o array de `FServerInfoUE`.",
      "4. Compile e, no Widget Blueprint, ao abrir a lista, chame `SetFirstGroup` e em loop `GetNextGroup` para popular a UI; repita para servidores conforme seleção do grupo."
    ]
  },
  "server-selection-state": {
    title: "Persistir seleção de servidor",
    steps: [
      "1. Crie uma classe `UObject` C++ `USelectedServerState` (Add → New C++ Class → None).",
      "2. No `.h`, declare `UPROPERTY(BlueprintReadOnly)` `FString ServerName`, `int32 ServerIndex`, `int32 CensorshipIndex`, `bool bNonPvP`, `bool bIsTestServer`.",
      "3. Ainda no `.h`, crie `UFUNCTION(BlueprintCallable)` `void SetSelectServerInfo(const FString& Name, int32 Index, int32 CensorIdx, bool bNonPvPFlag, bool bTest)` copiando exatamente os parâmetros que o código original armazenava.",
      "4. Implemente no `.cpp` a simples atribuição dos valores; compile e crie um Blueprint baseado na classe. Em **Class Defaults**, mantenha sem replicação (estado local de UI).",
      "5. Na tela de seleção, ao clicar em um servidor, chame `SetSelectServerInfo`; em seguida, leia `ServerIndex` e `bIsTestServer` em Blueprints para decidir se pode prosseguir."
    ]
  },
  "protocol-connection": {
    title: "Conectar e pingar via sockets UE",
    steps: [
      "1. No Unreal 5.7, abra **Add → New C++ Class** e derive de `APlayerController`, nomeando `ANetworkPC`.",
      "2. No arquivo `.h`, adicione `UPROPERTY(Replicated)` `bool bIsConnected` e implemente `GetLifetimeReplicatedProps` no `.cpp` com `DOREPLIFETIME(ANetworkPC, bIsConnected)`.",
      "3. Declare no `.h` `UFUNCTION(Server, Reliable)` `void ServerRequestConnection();` substituindo ConnectServer; no `.cpp`, defina `bIsConnected=true` e registre logs (nenhum socket manual).",
      "4. Declare `UFUNCTION(Server, Reliable)` `void ServerPingTest(int32 ClientTick);` e `UFUNCTION(Client, Reliable)` `void ClientHandlePingResponse(int32 EchoTick);` replicando a intenção do ping CLIENT_LIVE_CLIENT do sistema de packets original.",
      "5. Declare `UFUNCTION(Server, Reliable)` `void ServerDisconnect();` e `UFUNCTION(Client, Reliable)` `void ClientOnDisconnected();` para limpar e notificar, substituindo SendCheckOnline/DisconnectServer.",
      "6. No construtor ou BeginPlay, configure um timer com `FTimerManager` chamando `ServerPingTest(FPlatformTime::Cycles())` a cada segundo enquanto `bIsConnected` for true.",
      "7. No Blueprint baseado em `ANetworkPC`, em **Class Defaults**, marque **Replicates**; compile no Editor. Não envie packets brutos: todas as mensagens usam RPCs da UE."
    ]
  },
  "socket-option-script": {
    title: "Carregar script de opções de socket",
    steps: [
      "1. No Editor, clique em **Add → New C++ Class** e escolha **None** para criar `USocketOptionScript` derivada de `UObject`.",
      "2. No arquivo `.h`, declare `UFUNCTION(BlueprintCallable)` `bool LoadSocketOptions(const FString& FilePath);` e defina um `USTRUCT` `FSocketOptionInfo` com os mesmos campos usados em SOCKET_OPTION_INFO (OptionIndex, Type, Value, Text).",
      "3. No `.cpp`, em `LoadSocketOptions`, use `FFileHelper::LoadFileToArray` para ler o binário e aplique o XOR rotativo (0xfc, 0xcf, 0xab) byte a byte antes de preencher cada `FSocketOptionInfo`; retorne false se fread falhar, conforme o código original.",
      "4. Adicione `UFUNCTION(BlueprintPure)` `const TArray<FSocketOptionInfo>& GetOptions() const;` para fornecer dados à UI e funções auxiliares que somem `m_iNumEquitSetBonusOptions` e calculem valores usando lógica de `CalcSocketOptionValue/Text`.",
      "5. Compile e, em um Blueprint de inventário, chame `LoadSocketOptions` no BeginPlay para preencher as tabelas; mantenha sem replicação (dados locais).",
      "6. Documente em comentário que o sistema de packets do projeto original não é usado na UE; todos os fluxos de rede devem usar RPCs e propriedades replicadas."
    ]
  },
  "socket-tooltip-bonus": {
    title: "Tooltip e bônus de itens com socket",
    steps: [
      "1. Em **Add → New C++ Class**, escolha **Actor Component** e nomeie `USocketItemComponent`, anexando-o ao personagem que exibe tooltips.",
      "2. No `.h`, inclua referência ao `USocketOptionScript` e declare métodos `UFUNCTION(BlueprintCallable)` `bool IsSocketItem(const FItemData& Item);`, `int32 GetSocketOptionValue(...)`, `void BuildSocketTooltip(const FItemData& Item, TArray<FText>& OutLines);` refletindo AttachToolTipForSocketItem/SeedSphere.",
      "3. No `.cpp`, consulte as tabelas carregadas por `USocketOptionScript` para gerar textos e bônus (CalcSocketBonusValue); se alguma string ou cálculo não estiver no código, escreva 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' como placeholder.",
      "4. Se o bônus precisar ser sincronizado entre clientes, adicione `UPROPERTY(Replicated)` para valores agregados e implemente `GetLifetimeReplicatedProps`; para notificações visuais, crie `UFUNCTION(Client, Unreliable)` `ClientShowSocketTooltip(...)` e chame do servidor em vez de enviar packets.",
      "5. Compile e, no Blueprint do personagem, em **Class Defaults**, marque **Replicates** e adicione o componente `SocketItemComponent`; no Widget de tooltip, invoque `BuildSocketTooltip` para preencher as linhas."
    ]
  },
  "protocol-recv-dispatch": {
    title: "Despachar mensagens recebidas",
    steps: [
      "1. No Unreal 5.7, abra **Add → New C++ Class** e escolha `APlayerController` ou `AGameMode` para hospedar a lógica de despacho, criando por exemplo `ANetworkDispatcher`.",
      "2. No arquivo `.h`, declare RPCs `UFUNCTION(Client, Reliable)` para cada mensagem que o sistema de packets original tratava (JoinServer, Login, CharacterList, MovePosition, MoveCharacter) e `UFUNCTION(NetMulticast, Reliable/Unreliable)` se houver broadcasts.",
      "3. Adicione também `UFUNCTION(Server, Reliable)` para os comandos iniciados pelo cliente; defina um `enum class EProtocolMessageType` para substituir o cabeçalho original e organizar o switch.",
      "4. No `.cpp`, implemente um método chamado em `Tick` ou por `FTimerManager` que consuma uma fila `TQueue<EProtocolMessageType>` e chame os RPCs correspondentes; remova qualquer parsing de bytes.",
      "5. Marque a classe como replicada em **Class Defaults** (Blueprint), compile e conecte eventos de UI aos RPCs; quando o código original não detalhar uma mensagem, inclua comentário 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'."
    ]
  },
  "protocol-login-send": {
    title: "Envio de login codificado",
    steps: [
      "1. No PlayerController `ANetworkPC`, abra o `.h` e declare `USTRUCT(BlueprintType)` `FLoginRequest` com Account, Password, TickCount, ClientVersion, ClientSerial (espelhando o packet do código original).",
      "2. Ainda no `.h`, adicione `UPROPERTY(Replicated)` para `uint8 CurrentProtocolState` e `uint8 LogIn` se esses estados precisarem ser visíveis; implemente `GetLifetimeReplicatedProps` no `.cpp` com `DOREPLIFETIME` para cada um.",
      "3. Declare `UFUNCTION(Server, Reliable)` `void ServerRequestLogin(const FLoginRequest& Request);` e implemente no `.cpp` validando o tamanho das strings antes de copiar para variáveis internas, replicando a ordem do sistema de packets original.",
      "4. Declare `UFUNCTION(Client, Reliable)` `void ClientLoginResponse(uint8 ResultCode, int32 HeroKey);` que o servidor chamará após processar a lógica que substitui RecvLoginNew.",
      "5. No Editor, vá em **Edit → Project Settings → Input** e crie uma Action Mapping `LoginConfirm`; no Blueprint de UI de login, capture o evento `InputAction LoginConfirm` e chame `ServerRequestLogin` preenchendo o struct `FLoginRequest`.",
      "6. Compile e, no Blueprint do PlayerController, em **Class Defaults**, marque **Replicates**; não envie buffers ou packets: toda a comunicação usa RPCs."
    ]
  },
  "protocol-login-recv": {
    title: "Tratar join e códigos de login",
    steps: [
      "1. No `.h` de `ANetworkPC`, declare `UFUNCTION(Client, Reliable)` `void ClientReceiveJoinResult(uint8 Result, uint8 IndexA, uint8 IndexB, const FString& ServerVersion);` substituindo RecvJoinServerNew.",
      "2. No `.cpp`, em `ClientReceiveJoinResult`, calcule `HeroKey = (IndexB * 256) + IndexA` como no código original e compare `ServerVersion` com a versão local; atualize `CurrentProtocolState` para `RECEIVE_JOIN_SERVER_SUCCESS` quando Result==0x01.",
      "3. Se `LogIn` já for diferente de zero, chame `ServerRequestMapChange()` (RPC Server) para substituir `SendChangeMapServer`; se faltar informação de implementação, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "4. Declare `UFUNCTION(Client, Reliable)` `void ClientHandleLoginCodes(uint8 ResultCode);` e implemente switch para códigos 0x00-0xD2 abrindo pop-ups de erro ou prosseguindo; use `OnRep_CurrentProtocolState` se precisar atualizar UI ao replicar o estado.",
      "5. Compile e conecte `ClientReceiveJoinResult`/`ClientHandleLoginCodes` a widgets UMG para mostrar mensagens equivalentes às do sistema de packets original."
    ]
  },
  "protocol-character-and-move": {
    title: "Enviar lista de personagens, posição e movimento",
    steps: [
      "1. Abra o Unreal e, no PlayerController `ANetworkPC`, declare `UFUNCTION(Server, Reliable)` `void ServerRequestCharacterList();` substituindo o envio PMSG_SIMPLE_RESULT_SEND.",
      "2. No `.h`, declare `UFUNCTION(Client, Reliable)` `void ClientReceiveCharacterList(const TArray<FCharacterSummary>& Characters);` (crie `USTRUCT` para o resumo se necessário).",
      "3. Para posição, abra o Blueprint do `ACharacter` e em **Class Defaults** marque **Replicate Movement**; no `.h`, se precisar de atualização manual, declare `UFUNCTION(Server, Unreliable)` `void ServerUpdatePosition(const FVector& Pos);`.",
      "4. Para caminhos, declare `UFUNCTION(Server, Reliable)` `void ServerMoveAlongPath(const TArray<uint8>& Directions);` e no `.cpp` valide `Directions.Num()` contra um limite constante que substitui MAX_PATH_FIND; se a tabela de direção não estiver clara, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "5. Caso o servidor precise confirmar, crie `UFUNCTION(Client, Unreliable)` `void ClientAcknowledgeMove();` e chame após processar o movimento; nenhuma serialização manual de bytes é usada, apenas RPCs."
    ]
  },
  "protocol-generic-send": {
    title: "Encapsular envios genéricos",
    steps: [
      "1. No Unreal, crie um `UActorComponent` `UMessageRouterComponent` (Add → New C++ Class → Actor Component) para substituir DataSend.",
      "2. No `.h`, declare RPCs `UFUNCTION(Server, Reliable)`/`NetMulticast` para cada comando identificado no código original, com parâmetros tipados em vez de buffers brutos.",
      "3. Se precisar de mensagem genérica, declare `UFUNCTION(NetMulticast, Unreliable)` `void MulticastBroadcastMessage(uint8 MessageId, const TArray<uint8>& Payload);` apenas quando o design exigir payload binário; caso contrário, crie UPROPERTY(Replicated) específicas.",
      "4. No Blueprint do ator que usa o componente, marque **Replicates** e adicione o componente; use nós de chamada para cada RPC em resposta a eventos de jogo ou input.",
      "5. Documente nos comentários que o sistema de packets do projeto original é histórico e que toda comunicação atual deve passar por RPCs e replicação padrão da UE."
    ]
  },

  "wsclient-socket-decode": {
    title: "Configurar socket assíncrono e parsing C1/C2/C3/C4",
    steps: [
      "1. No Editor, vá em **Add → New C++ Class** e crie um `UGameInstanceSubsystem` chamado `UPacketHistorySubsystem` apenas para registrar contadores de serial/checksum do sistema original (telemetria).",
      "2. No `.h`, adicione variáveis `UPROPERTY()` simples para `uint8 PacketSerialSend`, `uint8 PacketSerialRecv` e flags de checksum; nenhum socket será aberto.",
      "3. Para cada mensagem que `ProtocolCompiler` tratava (C1/C2/C3/C4), crie RPCs específicos em `APlayerController`/`AGameMode` (`UFUNCTION(Server, Reliable/Unreliable)`, `Client`, `NetMulticast`) e remova toda leitura/descrição de bytes.",
      "4. Se precisar validar checksum, implemente função C++ comum no subsistema e envie o resultado via `UFUNCTION(Client, Reliable)`; quando o código não trouxer detalhes, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "5. No Blueprint do subsistema, deixe claro em comentários que este módulo apenas referencia o sistema de packets do projeto original e que a rede real usa replicação padrão da UE."
    ]
  },
  "server-protocolcore-dispatch": {
    title: "Substituir ProtocolCore por RPCs no servidor UE",
    steps: [
      "1. Abra o Unreal Engine 5.7 e em **Add → New C++ Class** escolha **GameMode Base**, nomeando `AProtocolRouterGameMode` para substituir o roteador ProtocolCore do servidor.",
      "2. No arquivo `.h`, declare `UFUNCTION(Server, Reliable)` métodos como `ServerHandleChat(const FString& Message)`, `ServerHandleWhisper(const FString& Target, const FString& Message)`, `ServerHandleAttack(int32 SkillId, const FVector& TargetPos)`, `ServerHandleItemMove(...)`, `ServerHandleTradeRequest(int32 TargetId)` e demais equivalentes aos cabeçalhos atendidos em ProtocolCore (0x00 chat, 0x02 whisper, 0x18 ação, 0x22-0x26 itens, 0x36-0x3D trade, 0x3F personal shop, 0x40-0x43 party, 0x4A-0x4E skills/Mineração/EventInventory/MuRummy/Muun, 0x50-0x57 guild, 0x61/0x66 guild war/viewport, 0x81-0x83 warehouse, 0x86-0x87 chaos mix, 0x8E teleporte, 0x90 DevilSquare).",
      "3. No `.cpp`, implemente cada RPC validando parâmetros e chamando componentes de jogo (chat, combate, inventário, trade, guild, eventos). Quando a lógica detalhada não estiver no código original ou não houver equivalente em UE, registre um log com 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' para esse trecho.",
      "4. Declare `UFUNCTION(Client, Reliable)` ou `UFUNCTION(NetMulticast, Reliable)` notificações para respostas que no projeto original eram pacotes de retorno (ex.: resultado de trade, atualização de guild ou warehouse) e implemente atualização de estados replicados ou widgets de UI em vez de enviar bytes manualmente.",
      "5. Abra **Edit → Project Settings → Maps & Modes** e defina `AProtocolRouterGameMode` como GameMode padrão. Compile no Editor (botão **Compile**) para garantir que os RPCs fiquem disponíveis nas sessões.",
      "6. No PlayerController C++ (por exemplo `ANetworkPC`), adicione chamadas client-side para cada RPC do GameMode. No Blueprint do PlayerController, abra o **Event Graph** e conecte botões de chat/ataque/uso de item às chamadas `ServerHandleChat`, `ServerHandleAttack`, `ServerHandleItemMove`, `ServerHandleTradeRequest` e similares. Em **Class Defaults**, marque **Replicates** e implemente `GetLifetimeReplicatedProps` se estados adicionais forem replicados.",
      "7. Se a ordem global não estiver explícita no código, considere criar este GameMode logo após configurar a rede básica; se não puder garantir a precedência, documente que a sequência é sugestão genérica."
    ]
  },
  "mapserver-change": {
    title: "Trocar para Map Server e reinicializar estado",
    steps: [
      "1. No Editor, crie um `UGameInstanceSubsystem` chamado `UMapServerManager` (Add → New C++ Class → Game Instance Subsystem) para armazenar JoinAuthCodes, HeroID, IP/Porta como referência local.",
      "2. No `.h` do PlayerController, declare `UFUNCTION(Server, Reliable)` `void ServerRequestMapChange(const FString& HeroId);` e, no `.cpp`, valide flags equivalentes a `LogIn` e `bFillServerInfo` antes de chamar o GameMode.",
      "3. No GameMode, declare `UFUNCTION(Server, Reliable)` `void ServerPerformMapChange(const FString& MapName);` e chame `ServerTravel` ou `OpenLevel` conforme a necessidade; se detalhes faltarem, use a frase padrão de impossibilidade de inferência.",
      "4. Antes da transição, invoque funções locais que limpem personagens (ClearCharacters/InitGame) se existirem; quando não houver detalhes no código, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "5. Declare `UFUNCTION(Client, Reliable)` `void ClientConfirmMapChange();` para notificar o cliente após o sucesso; no Blueprint do PlayerController, conecte essa chamada para atualizar UI e não recrie sockets do sistema de packets original.",
      "6. Exponha getters `UFUNCTION(BlueprintPure)` no subsistema para IP/porta/flags para uso de UI; lembre que toda navegação acontece via RPCs de GameMode/PlayerController."
    ]
  },
  "buff-script-load": {
    title: "Recriar carga e descriptografia de BuffEffect",
    steps: [
      "1. No Editor, clique em **Add → New C++ Class → None** e crie `UBuffScriptLoaderUE` derivada de `UObject`.",
      "2. No `.h`, declare `UFUNCTION(BlueprintCallable)` `bool LoadBuffScript(const FString& Path);` e defina `USTRUCT` para `_BUFFINFO` com campos equivalentes aos do código (s_BuffIndex, s_BuffEffectType, s_ItemType, s_ItemIndex, s_BuffName, s_BuffClassType, s_NoticeType, s_ClearType, s_BuffDescript).",
      "3. No `.cpp`, use `FFileHelper::LoadFileToArray` para ler BuffEffect_<ML>.bmd, aplique XOR rotativo (0xfc, 0xcf, 0xab) antes de copiar para o struct e retorne false se o tamanho não bater.",
      "4. Implemente verificação de checksum equivalente a GenerateCheckSum2; se faltar referência, escreva 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' e substitua por um log/abort manual.",
      "5. Após carregar, divida s_BuffDescript por '/' em `TArray<FString>` e armazene em `TMap<eBuffState, FBuffInfo>` acessível a Blueprints.",
      "6. Compile e crie um Blueprint baseado em `UBuffScriptLoaderUE`; em **Class Defaults**, mantenha sem replicação (processo local)."
    ]
  },
  "buff-time-control": {
    title: "Gerenciar timers de buff no cliente UE",
    steps: [
      "1. Em **Add → New C++ Class → Actor Component**, crie `UBuffTimeComponent` e anexe ao PlayerController ou GameInstance.",
      "2. No `.h`, defina `TMap<eBuffTimeType, FBuffTimeInfo>` com campos BuffType, CurBuffTime(ms) e EventBuffTime; declare `UFUNCTION(BlueprintCallable)` `void RegisterBuffTime(eBuffState Buff, int TimeMs, int ItemAddOption);`.",
      "3. No `.cpp`, implemente RegisterBuffTime calculando o tipo conforme CheckBuffTimeType do código e limitando pelo ItemAddOption; armazene no mapa e programe `FTimerManager` com intervalo ~0.9s para decrementar o tempo.",
      "4. Implemente `UFUNCTION()` interno chamado pelo timer que reduz CurBuffTime e remove quando chega a zero; substitui HandleWindowMessage/WM_TIMER do código original.",
      "5. Declare `UFUNCTION(BlueprintPure)` `FString GetBuffStringTime(eBuffTimeType Type)` e `int32 GetBuffTime(eBuffTimeType Type)` para UI; se algum texto (GlobalText) não estiver disponível, registre a frase padrão de impossibilidade.",
      "6. Compile e, no Blueprint do controlador/personagem, marque **Replicates** se precisar compartilhar timers (caso contrário mantenha local)."
    ]
  },
  "buff-value-control": {
    title: "Consultar valores numéricos de buff em UE",
    steps: [
      "1. Crie `UObject` `UBuffValueControlUE` (Add → New C++ Class → None).",
      "2. No `.h`, defina `TMap<eBuffState, FBuffStateValueInfo>` com campos Value1, Value2, Time e declare `UFUNCTION(BlueprintCallable)` `void InitializeValues();` que percorre os enums como no código original.",
      "3. Implemente `CheckValue` e `SetValue` no `.cpp` para decidir se os dados vêm de tabela de itens (ItemAddOptioninfo); se a tabela não existir, retorne texto 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "4. Adicione `UFUNCTION(BlueprintPure)` `int32 GetValue(eBuffState State);`, `void GetBuffInfoString(eBuffState State, TArray<FString>& OutLines);` e `FString GetBuffValueString(eBuffState State);` consultando o cache e o loader de buffs.",
      "5. Compile e use em Blueprints de UI para mostrar valores; mantenha sem replicação, pois o cálculo é local.",
      "6. No destrutor ou método `BeginDestroy`, limpe o mapa se necessário para espelhar Destroy() do código original."
    ]
  },
  "buff-system-dispatch": {
    title: "Centralizar subsistemas de buff em UE",
    steps: [
      "1. Em **Add → New C++ Class → Game Instance Subsystem**, crie `UBuffStateSubsystem` para orquestrar os controles.",
      "2. No `.h`, mantenha ponteiros `UPROPERTY()` para `UBuffScriptLoaderUE`, `UBuffTimeComponent` e `UBuffValueControlUE`; declare `UFUNCTION(BlueprintCallable)` `void InitializeBuffSystems();`.",
      "3. No `.cpp`, em `InitializeBuffSystems`, instancie cada objeto (NewObject<>) e armazene; configure um timer ou Tick para chamar a função de decremento de `UBuffTimeComponent`, substituindo HandleWindowMessage.",
      "4. Adicione `UFUNCTION(BlueprintPure)` `UBuffScriptLoaderUE* GetLoader();` e equivalentes para tempo/valores, permitindo acesso de UI e outros componentes, assim como os wrappers TheBuffStateSystem.",
      "5. Implemente método `Deinitialize` limpando timers e referências, replicando Destroy() do código original; compile e marque o subsistema para iniciar automaticamente."
    ]
  },

  "server-modern-socket": {
    title: "Encaminhar ProtocolHead no servidor UE 5.7",
    steps: [
      "1. Abra o Unreal Engine 5.7 e em **Add → New C++ Class → GameMode Base** crie `AUEProtocolRouter` para substituir o socket server manual.",
      "2. No `.h`, marque `bUseSeamlessTravel` se necessário e declare `UFUNCTION(Server, Reliable)` manipuladores como `void ServerHandleLogin(const FLoginRequest& Request);`, `void ServerHandleMove(const TArray<uint8>& DirData);` e `void ServerHandlePosition(const FVector& Pos);` para substituir os casos BOTH_CONNECT_LOGIN/BOTH_MOVE/BOTH_POSITION.",
      "3. No `.cpp`, em cada handler valide o `APlayerController` chamador com `ensure(HasAuthority())` e repasse para componentes de jogo; em vez de reconstruir buffers, processe os parâmetros tipados e chame funções de gameplay.",
      "4. Crie `UFUNCTION(NetMulticast, Reliable)` notificações como `void MulticastPositionUpdate(ACharacter* Target, const FVector& Pos);` para substituir PacketSend para VpPlayer2; chame-as quando o servidor aplicar a mudança.",
      "5. Abra **Edit → Project Settings → Maps & Modes** e defina `AUEProtocolRouter` como GameMode padrão para que todas as sessões usem os RPCs.",
      "6. No Blueprint do GameMode, documente que o servidor da UE usa RPCs e replicação padrão em vez de olc::net/PacketManager; não crie sockets ou buffers manuais.",
      "7. Execute **Build** no Editor para compilar e, em seguida, teste com dois clientes PIE verificando se `MulticastPositionUpdate` replica as posições."
    ]
  },
  "server-login-auth": {
    title: "Autenticar cliente no servidor UE (versão/serial)",
    steps: [
      "1. No PlayerController C++ (`ANetworkPC`), declare `UFUNCTION(Server, Reliable)` `void ServerSubmitLogin(const FString& Account, const FString& Password, const FString& ClientVersion, const FString& ClientSerial);`.",
      "2. No `.cpp`, em `ServerSubmitLogin`, chame `HasAuthority()` e compare `ClientVersion`/`ClientSerial` com valores armazenados no GameInstance; se divergirem, chame `ClientNotifyLoginResult` (RPC Client) com código de erro análogo a GCConnectAccountSend.",
      "3. No GameMode `AUEProtocolRouter`, crie método `bool ValidateLogin(const FString& Account, const FString& Password);` que consulta um backend ou tabela local; se faltar implementação no código original, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' em um log.",
      "4. Declare `UFUNCTION(Client, Reliable)` `void ClientReceiveJoinData(uint8 Result, uint8 IndexA, uint8 IndexB, const FString& ServerVersion);` para substituir GCConnectClientSend; calcule HeroKey como no código original e atualize estados replicados.",
      "5. No Blueprint de UI de login, capture clique/ação e chame `ServerSubmitLogin`; mostre mensagens conforme códigos retornados em `ClientNotifyLoginResult` (mapeando os cases 0x00..0xD2).",
      "6. No Editor, abra **Edit → Project Settings → Input** e crie Action Mapping `LoginSubmit`; no Event Graph do Widget use `InputAction LoginSubmit` para disparar a chamada RPC.",
      "7. Compile e teste em duas instâncias PIE para garantir que apenas o servidor execute a validação e que os RPCs Client mostrem os pop-ups corretos." 
    ]
  },
  "server-character-list": {
    title: "Entregar lista de personagens via RPC",
    steps: [
      "1. Crie um `USTRUCT(BlueprintType)` `FCharacterSummary` com campos Name, Level, Class e GuildStatus equivalentes aos preenchidos em DGCharacterListRecv.",
      "2. No GameMode `AUEProtocolRouter`, declare `UFUNCTION(Server, Reliable)` `void ServerRequestCharacterList(ANetworkPC* RequestingPC);` que será chamado pelo PlayerController após login.",
      "3. No `.cpp`, ao receber a solicitação, monte `TArray<FCharacterSummary>` a partir do backend (substituindo GDCharacterListSend) e chame `ClientReceiveCharacterList` (RPC Client, Reliable) no PlayerController.",
      "4. No PlayerController, declare `UFUNCTION(Client, Reliable)` `void ClientReceiveCharacterList(const TArray<FCharacterSummary>& Characters);` e atualize um `UPROPERTY(BlueprintAssignable)` event para a UI preencher a lista.",
      "5. Se houver classes bloqueadas por nível/reset, aplique a mesma lógica ao montar o array e, quando alguma regra não puder ser inferida, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' em um log.",
      "6. Em UMG, crie um ListView de personagens e, no Event Graph, consuma o array recebido para popular os itens.",
      "7. Compile e valide com dois clientes PIE que o servidor envia a lista apenas após autenticação bem-sucedida." 
    ]
  },
  "server-position-sync": {
    title: "Replicar posição recebida do cliente",
    steps: [
      "1. No Character C++ derivado de `ACharacter`, marque em **Class Defaults** a opção **Replicate Movement** e ative **Replicates**.",
      "2. No `.h`, declare `UFUNCTION(Server, Unreliable)` `void ServerUpdatePosition(const FVector& NewPos);` e `UFUNCTION(NetMulticast, Unreliable)` `void MulticastApplyPosition(const FVector& NewPos);` para substituir CGPositionRecv e o broadcast subsequente.",
      "3. No `.cpp`, implemente `ServerUpdatePosition` com `if (!HasAuthority()) return;` seguido de validação simples (se faltar regra, registre a frase padrão) e chamada de `MulticastApplyPosition`.",
      "4. Em `MulticastApplyPosition`, chame `SetActorLocation(NewPos, false, nullptr, ETeleportType::TeleportPhysics);` para atualizar todos os clientes simultaneamente.",
      "5. No PlayerController, ao detectar teleporte ou correção de posição, chame `ServerUpdatePosition` passando `GetPawn()->GetActorLocation()`.",
      "6. No Editor, teste com dois players em PIE verificando se a posição é replicada para observadores próximos sem usar buffers path[8].",
      "7. Documente no Blueprint ou comentários que o envio é Unreliable, espelhando o comportamento contínuo do pacote original." 
    ]
  },
  "server-move-sync": {
    title: "Aplicar e replicar movimento comprimido",
    steps: [
      "1. No Character C++, declare `UFUNCTION(Server, Reliable)` `void ServerSubmitMove(const TArray<uint8>& Directions, uint8 DirByte);` representando o path comprimido do cliente.",
      "2. No `.cpp`, em `ServerSubmitMove`, valide tamanho de `Directions` contra um limite constante equivalente a MAX_PATH_FIND; se houver colisão ou dados faltantes, registre a frase padrão de não inferência e retorne.",
      "3. Calcule a posição alvo somando vetores de direção (use tabela de vetores de 8 direções) e chame `SetActorLocation` ou movimentação por `CharacterMovementComponent`.",
      "4. Declare `UFUNCTION(NetMulticast, Unreliable)` `void MulticastConfirmMove(const TArray<FVector>& PathPoints, uint8 DirByte);` e dispare após aplicar o movimento no servidor.",
      "5. No Multicast, atualize uma fila de destinos para reproduzir o movimento nos demais clientes; se não houver path detalhado no código, registre a frase padrão antes de usar apenas a posição final.",
      "6. Em **Edit → Project Settings → Input**, configure Action/Axis para movimento e, no Event Graph do Character Blueprint, chame `ServerSubmitMove` ao processar input.",
      "7. Compile e teste com múltiplos clientes PIE garantindo que o caminho não ultrapasse o limite e que os observadores recebam `MulticastConfirmMove`."
    ]
  }

};

const roadmap = [
  {
    id: "roadmap-validate-bux",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["serverlist-script-load"],
    description: "Adicionar verificação de tamanho e logs antes de aplicar BuxConvert e fread para evitar leituras parciais.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ServerListManager.cpp linha 79-94)."
  },
  {
    id: "roadmap-group-iterator-reset",
    horizon: "Curto Prazo",
    priority: "Média",
    mechanicsIds: ["servergroup-creation", "server-iteration"],
    description: "Centralizar reset de iteradores após inserção para evitar inconsistências quando m_iterServerGroup é usado por múltiplas UIs.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ServerListManager.cpp linhas 138-140, 222-241)."
  },
  {
    id: "roadmap-name-text-source",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["serverentry-population"],
    description: "Documentar origem de GlobalText[560..562] ou substituir por tabela explícita carregada em tempo de execução.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ServerListManager.cpp linhas 177-212)."
  },
  {
    id: "roadmap-recv-thread",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["protocol-recv-dispatch", "protocol-connection"],
    description: "Reavaliar loop de recebimento comentado e migrar para thread ou timer com controle de saída limpa para evitar bloqueio de UI.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ProtocolSend.cpp linhas 51-152)."
  },
  {
    id: "roadmap-socket-script-errors",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["socket-option-script"],
    description: "Tratar de forma segura falha de fopen/fread em OpenSocketItemScript adicionando logs antes de MessageBox/SendMessage.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (SocketSystem.cpp linhas 193-234 e 316-343)."
  },
  {
    id: "roadmap-socket-tooltip-bounds",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["socket-tooltip-bonus"],
    description: "Revisar formatação de TextList em AttachToolTipForSocketItem/SeedSphere para evitar estouro de buffers e dependência de GlobalText constante.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (SocketSystem.cpp linhas 229-320 e 323-397)."
  },
  {
    id: "roadmap-serial-checks",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["wsclient-socket-decode", "protocol-recv-dispatch"],
    description: "Adicionar logs e tratamento explícito quando g_byPacketSerialRecv divergir do byte de serial de pacotes C3/C4 e garantir reset seguro dos contadores ao reconectar.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (WSclient.cpp linhas 11560-11630 e CreateSocket linhas 160-196)."
  },
  {
    id: "roadmap-mapserver-guard",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["mapserver-change"],
    description: "Validar m_bFillServerInfo antes de chamar CreateSocket/SendChangeMServer e adicionar logs quando LogIn==0 bloquear reconexão de mapa para evitar chamadas silenciosas.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (CSMapServer.cpp linhas 22-66 e 76-92)."
  },
  {
    id: "roadmap-login-security",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["protocol-login-send", "protocol-login-recv"],
    description: "Adicionar validações extras nos buffers de login (comprimento de account/password) antes de BuxConvert e envio para mitigar overflow.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ProtocolSend.cpp linhas 166-199)."
  },
  {
    id: "roadmap-move-dir-validation",
    horizon: "Longo Prazo",
    priority: "Média",
    mechanicsIds: ["protocol-character-and-move"],
    description: "Isolar DirTable em módulo de configuração e adicionar testes automatizados para compressão Path[8] com cenários de PathNum variado.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ProtocolSend.cpp linhas 221-282)."
  },
  {
    id: "roadmap-generic-suggestion-metrics",
    horizon: "Longo Prazo",
    priority: "Baixa",
    mechanicsIds: ["protocol-generic-send"],
    description: "Instrumentar métricas de envio/recebimento para monitorar latência e perda de pacotes durante sessões prolongadas.",
    basedOnCode: false,
    notes: "SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C/C++."
  },
  {
    id: "roadmap-buff-checksum-validation",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["buff-script-load"],
    description: "Adicionar logs e retorno de erro robusto quando checksum de BuffEffect_*.bmd falhar para evitar crash ao tentar MessageBox/SendMessage.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (w_BuffScriptLoader.cpp linhas 33-112)."
  },
  {
    id: "roadmap-buff-timer-safety",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["buff-time-control", "buff-system-dispatch"],
    description: "Isolar uso de KillTimer/SetTimer com verificações de existência da janela e evitar dangling timers ao destruir BuffTimeControl.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (w_BuffTimeControl.cpp linhas 14-74, 113-158)."
  },
  {
    id: "roadmap-protocolcore-rpc-alignment",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-protocolcore-dispatch"],
    description: "Mapear cada case do ProtocolCore para RPCs/replicação na UE 5.7 e garantir que nenhum cabeçalho do sistema de packets original fique sem equivalente.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (Protocol.cpp switch de cabeçalhos 0x00-0x90 e Connection.cpp)."
  },
  {
    id: "roadmap-buff-cache-validation",
    horizon: "Longo Prazo",
    priority: "Média",
    mechanicsIds: ["buff-value-control"],
    description: "Criar testes que verifiquem consistência de m_BuffStateValue ao longo de múltiplas chamadas GetValue e cargas de itens variáveis.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (w_BuffStateValueControl.cpp linhas 20-83)."
  },

  {
    id: "roadmap-modern-socket-cleanup",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-modern-socket"],
    description: "Revisar thread detach no destrutor de CSocketManagerModern e adicionar desligamento ordenado do connection->Stop().",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (SocketManagerModern.h destrutor detach sem join)."
  },
  {
    id: "roadmap-login-version-serial",
    horizon: "Curto Prazo",
    priority: "Média",
    mechanicsIds: ["server-login-auth"],
    description: "Externalizar tabelas de versão/serial do servidor para configuração em vez de constantes compiladas.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (Protocol.cpp GCConnectClientSend/CGConnectAccountRecv comparando ClientVersion/ClientSerial)."
  },
  {
    id: "roadmap-move-collision",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-move-sync", "server-position-sync"],
    description: "Adicionar logs detalhados quando gMap.CheckAttr bloquear movimento e teleporte corretivo for aplicado em CGMoveRecv/CGPositionRecv.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (Protocol.cpp blocos de gMap.CheckAttr e resets de PathCount)."
  }

];

// UI Logic
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

function switchTab(targetId) {
  tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
  tabContents.forEach(content => content.classList.toggle('active', content.id === targetId));
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.target));
});

// Mechanics rendering
const mechanicsListEl = document.getElementById('mechanics-list');
const mechanicDetailEl = document.getElementById('mechanic-detail');
const searchInput = document.getElementById('mechanics-search');
const typeFilter = document.getElementById('mechanics-type-filter');

function renderMechanicsList() {
  const query = searchInput.value.toLowerCase();
  const type = typeFilter.value;
  mechanicsListEl.innerHTML = '';
  mechanics
    .filter(m => (!type || m.type === type))
    .filter(m => m.name.toLowerCase().includes(query))
    .forEach(m => {
      const li = document.createElement('li');
      li.textContent = `${m.name} (${m.type})`;
      li.dataset.id = m.id;
      li.addEventListener('click', () => selectMechanic(m.id));
      mechanicsListEl.appendChild(li);
    });
}

function formatList(label, items) {
  if (!items || !items.length) return `<div><strong>${label}:</strong> NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++</div>`;
  return `<div><strong>${label}:</strong> ${items.join(', ')}</div>`;
}

function selectMechanic(id) {
  const m = mechanics.find(x => x.id === id);
  if (!m) return;
  mechanicsListEl.querySelectorAll('li').forEach(li => li.classList.toggle('active', li.dataset.id === id));
  mechanicDetailEl.innerHTML = `
    <h3>${m.name}</h3>
    <div class="tag ${m.type}">${m.type}</div>
    <p>${m.description}</p>
    ${formatList('Arquivos', m.files)}
    ${formatList('Classes', m.classes)}
    ${formatList('Funções', m.functions)}
    <p><strong>Fluxo:</strong> ${m.flow}</p>
    <p><strong>Rede:</strong> ${m.networkDetails || 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++'}</p>
  `;
  updateGuideSelection(id);
}

searchInput.addEventListener('input', renderMechanicsList);
typeFilter.addEventListener('change', renderMechanicsList);

// Guides rendering
const guideSelect = document.getElementById('guide-mechanic-filter');
const guideContent = document.getElementById('guide-content');

function populateGuideSelect() {
  guideSelect.innerHTML = '<option value="">Selecione uma mecânica</option>';
  mechanics.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    guideSelect.appendChild(opt);
  });
}

function updateGuideSelection(id) {
  if (guideSelect.value !== id) {
    guideSelect.value = id;
  }
  renderGuide();
}

function renderGuide() {
  const id = guideSelect.value;
  if (!id || !ueGuides[id]) {
    guideContent.textContent = 'Selecione uma mecânica para ver o guia.';
    return;
  }
  const guide = ueGuides[id];
  guideContent.innerHTML = `
    <h3>${guide.title}</h3>
    <ol>${guide.steps.map(step => `<li>${step}</li>`).join('')}</ol>
  `;
}

guideSelect.addEventListener('change', renderGuide);

// Roadmap rendering
const roadmapHorizon = document.getElementById('roadmap-horizon-filter');
const roadmapPriority = document.getElementById('roadmap-priority-filter');
const roadmapMechanic = document.getElementById('roadmap-mechanic-filter');
const roadmapGroups = document.getElementById('roadmap-groups');

function populateRoadmapMechanicFilter() {
  roadmapMechanic.innerHTML = '<option value="">Todas mecânicas</option>';
  mechanics.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    roadmapMechanic.appendChild(opt);
  });
}

function renderRoadmap() {
  const horizon = roadmapHorizon.value;
  const priority = roadmapPriority.value;
  const mechFilter = roadmapMechanic.value;

  const grouped = {};
  roadmap
    .filter(item => (!horizon || item.horizon === horizon))
    .filter(item => (!priority || item.priority === priority))
    .filter(item => (!mechFilter || item.mechanicsIds.includes(mechFilter)))
    .forEach(item => {
      grouped[item.horizon] = grouped[item.horizon] || [];
      grouped[item.horizon].push(item);
    });

  roadmapGroups.innerHTML = '';
  Object.keys(grouped).forEach(hz => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'roadmap-group';
    groupDiv.innerHTML = `<h3>${hz}</h3>`;
    grouped[hz].forEach(item => {
      const mechNames = item.mechanicsIds.map(id => mechanics.find(m => m.id === id)?.name || id).join(', ');
      const note = item.notes || '';
      groupDiv.innerHTML += `
        <div class="roadmap-item">
          <div><span class="priority">[${item.priority}]</span> ${item.description}</div>
          <div>Mecânicas: ${mechNames}</div>
          <div class="note">${note}</div>
        </div>
      `;
    });
    roadmapGroups.appendChild(groupDiv);
  });

  if (!Object.keys(grouped).length) {
    roadmapGroups.textContent = 'Nenhum item encontrado com os filtros atuais.';
  }
}

roadmapHorizon.addEventListener('change', renderRoadmap);
roadmapPriority.addEventListener('change', renderRoadmap);
roadmapMechanic.addEventListener('change', renderRoadmap);

// Initial render
populateGuideSelect();
populateRoadmapMechanicFilter();
renderMechanicsList();
renderGuide();
renderRoadmap();
