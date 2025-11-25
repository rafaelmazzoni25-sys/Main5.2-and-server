// app.js

const mechanics = [
  {
    id: "serverlist-script-load",
    name: "Leitura e descriptografia de ServerList.bmd",
    type: "Cliente",
    implementationOrder: 1,
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
    implementationOrder: 2,
    dependsOn: ["serverlist-script-load"],
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
    implementationOrder: 3,
    dependsOn: ["servergroup-creation"],
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
    implementationOrder: 4,
    dependsOn: ["servergroup-creation"],
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
    implementationOrder: 5,
    dependsOn: ["serverentry-population", "server-iteration"],
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
    implementationOrder: 6,
    dependsOn: ["server-selection-state"],
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
    implementationOrder: 7,
    dependsOn: ["protocol-connection"],
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
    implementationOrder: 8,
    dependsOn: ["protocol-connection"],
    files: ["ProtocolSend.cpp", "ProtocolSend.h"],
    classes: ["CProtocolSend"],
    functions: ["SendRequestLogInNew"],
    networkDetails: "Sistema de packets do projeto original: envia PMSG_CONNECT_ACCOUNT_SEND via ProtocolHead::BOTH_CONNECT_LOGIN com campos codificados por BuxConvert e versão/serial do cliente.",
    flow: "Configura LogIn=1, CurrentProtocolState=REQUEST_LOG_IN, copia account/password com strncpy, faz BuxConvert nos campos, define TickCount/versão/serial, escreve mensagens em g_pChatListBox e chama SendPacket.",
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
    flow: "RecvJoinServerNew extrai HeroKey, loga dados de versão, quando LogIn!=0 chama g_csMapServer.SendChangeMapServer; caso contrário mostra m_LoginWin, seta CurrentProtocolState conforme result ou abre PopUpMsgWin e valida Version vs ClientVersion; RecvLoginNew faz switch nos códigos 0x00-0xD2, ajusta CurrentProtocolState/LogIn, chama CheckHack nos casos de sucesso e mostra PopUpMsgWin para erros diversos.",
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
    flow: "SendRequestCharactersListNew envia PMSG_SIMPLE_RESULT_SEND.result=1; SendPositionNew envia PMSG_POSITION_SEND com x/y; SendCharacterMoveNew valida PathNum, copia coordenadas iniciais, calcula Path[8] e Dir baseado em DirTable, agrega PathNum e envia pacote.",
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
    id: "client-quest-reception",
    name: "Recepção e aplicação de estados de Quest",
    type: "Cliente",
    files: ["WSclient.cpp", "CSQuest.h", "QuestMng.h"],
    classes: ["CQuestMng"],
    functions: ["ReceiveQuestHistory", "ReceiveQuestState", "ReceiveQuestResult", "ReceiveQuestPrize", "ReceiveEventCount"],
    networkDetails: "Sistema de packets do projeto original: funções chamadas pelo dispatcher tratam buffers com estados/conclusões de quest, recompensas e contagem de evento.",
    flow: "ReceiveQuestHistory lê m_byQuest/m_byCount e chama g_csQuest.setQuestLists usando a classe do herói; ReceiveQuestState atualiza uma quest individual e força exibição da interface NPCQUEST; ReceiveQuestResult atualiza estado quando m_byResult==0; ReceiveQuestPrize trata recompensas (level up points ou mudança de classe) disparando efeitos/sons e valida classe via ChangeServerClassTypeToClientClassType; ReceiveEventCount apenas encaminha m_wEventType/m_wLeftEnterCount para g_csQuest.SetEventCount.",
    description: "Atualiza listas/estados de quest e recompensa o jogador com pontos ou mudança de classe, disparando UI e efeitos locais; na adaptação UE 5.7, esses fluxos devem ser convertidos para RPCs/replicação em vez de buffers C1/C3/C4."
  },
  {
    id: "buff-script-load",
    name: "Carga e descriptografia de BuffEffect_*.bmd",
    type: "Cliente",
    implementationOrder: 20,
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
    implementationOrder: 21,
    dependsOn: ["buff-script-load"],
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
    implementationOrder: 22,
    dependsOn: ["buff-script-load"],
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
    implementationOrder: 23,
    dependsOn: ["buff-script-load", "buff-time-control", "buff-value-control"],
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
  },
  {
    id: "server-dataserver-dispatch",
    name: "Despacho de respostas do DataServer",
    type: "Servidor",
    files: ["DSProtocol.cpp"],
    classes: ["DataServerProtocolCore"],
    functions: ["DataServerProtocolCore"],
    networkDetails: "Sistema de packets do projeto original: DataServerProtocolCore recebe cabeçalho head e, para subpacotes com C1/C2, avalia subcódigos em lpMsg[3] ou lpMsg[4] para direcionar warehouse, quest, master skill, NPCs e comandos personalizados.",
    flow: "Switch em head (0x00 info, 0x01 lista de personagens, 0x02 criação, 0x03 deleção, 0x04 info). Para head 0x05, verifica subcódigos 0x00/0x01/0x70/0x71/0x75 e chama gWarehouse. 0x07 cria item, 0x08 opções, 0x09 pet info, 0x0A/0x0B checagem/rename de nome, 0x0C/0x0D/0x0E/0x0F/0x10/0x11 usam subcódigos para quest kill, master skill tree, NPCs (Leo/Santa), comandos reset/marry/rename/bloc/gift/top, QuestWorld e Gens insert/delete.",
    description: "Centraliza o roteamento de mensagens vindas do DataServer, distribuindo para warehouse, personagem, comandos de reset e sistemas de quest/Gens conforme cabeçalho e subcódigo sem alterar o payload."
  },
  {
    id: "server-joinserver-auth-move",
    name: "Autenticação e troca de servidor via JoinServer",
    type: "Servidor",
    files: ["JSProtocol.cpp"],
    classes: ["JoinServerProtocolCore"],
    functions: ["JoinServerProtocolCore", "JGConnectAccountRecv", "JGMapServerMoveRecv", "JGMapServerMoveAuthRecv", "JGAccountLevelRecv", "JGAccountLevelRecv2", "JGAccountAlreadyConnectedRecv", "GJConnectAccountSend", "GJDisconnectAccountSend", "GJMapServerMoveSend", "GJMapServerMoveAuthSend"],
    networkDetails: "Sistema de packets do projeto original: JoinServerProtocolCore switch em head (0x00-0x06,0x30) e envia/recebe pacotes SDHP_* usando gJoinServerConnection.DataSend; fluxo controla login, desconexão, mudança de mapa e níveis de conta.",
    flow: "JGConnectAccountRecv decrementa LoginMessageSend, valida estado Connected, bloqueios e server lock, copia Account/PersonalCode/AccountLevel/expire date/Lock e envia GCConnectAccountSend. JGMapServerMoveRecv valida conta, em sucesso monta PMSG_MAP_SERVER_MOVE_SEND com IP/porta ou cancela e reenvia notice; em caso de NextServerCode válido grava AuthCodes e fecha character via CharacterGameClose. JGMapServerMoveAuthRecv revalida MapServerMoveRequest e estado Connected, aplica bloqueios e, em sucesso, atualiza Account/PersonalCode/AccountLevel/Lock/destinos e chama GDCharacterInfoSend. AccountLevelRecv atualiza nível e avisa via notice; AccountLevelRecv2 envia notices e GJAccountLevelSend para usuários com mesma conta; AccountAlreadyConnectedRecv mata usuário se configurado e notifica módulos CustomAttack/CustomStore. GJ* funções constroem SDHP_* e enviam ao JoinServer com header apropriado.",
    description: "Gerencia autenticação centralizada com o JoinServer, inclusive verificação de bloqueios e mudança de MapServer, mantendo contadores de mensagens e replicando dados de conta antes de carregar personagem."
  },
  {
    id: "server-packet-encryption-manager",
    name: "Inicialização de criptografia e filtros de pacote",
    type: "Servidor",
    files: ["PacketManager.cpp", "PacketManager.h"],
    classes: ["CPacketManager"],
    functions: ["Init", "LoadEncryptionKey", "LoadDecryptionKey", "LoadKey"],
    networkDetails: "Sistema de packets do projeto original: define chaves DES_XEX3 quando GAMESERVER_UPDATE>=701 ou tabelas XOR (m_SaveLoadXor, m_XorFilter) para criptografia/descrição de pacotes persistidos; LoadKey lê arquivo com ENCDEC_HEADER e campos Modulus/Key ofuscados.",
    flow: "Init seta chaves DES ou zera m_Encryption/m_Decryption e preenche SaveLoadXor e XorFilter de 32 bytes; LoadEncryptionKey/LoadDecryptionKey chamam LoadKey (header 4370) que abre arquivo, valida header/size, lê tabelas com CreateFile/ReadFile e aplica XOR com SaveLoadXor para preencher Modulus/Key.",
    description: "Prepara os filtros e chaves de criptografia usados pelo servidor para salvar/carregar dados e processar pacotes, sem enviar nada diretamente na rede."
  },
  {
    id: "server-item-structs",
    name: "Estruturas de item e limites de inventário",
    type: "Servidor",
    files: ["Item.h", "ItemManager.h"],
    classes: ["CItem", "ITEM_INFO", "ITEM_ATTRIBUTE", "CItemManager"],
    functions: ["CItem::Convert", "CItemManager::Load"],
    networkDetails: "Definições usadas pelos packets de item (C1:22-26/32-34) no protocolo original; não enviam dados diretamente, mas são serializadas por ItemManager em respostas como PMSG_ITEM_GET/MOVE.",
    flow: "CItem (Item.h) guarda Serial, Index, Level, Slot, TwoHand, Attack/Defense, Resistências, requisitos de atributos, opções (Option1/2/3, NewOption, SetOption, JewelOfHarmony, SocketOption), durabilidade e flags periódicas; macros INVENTORY_RANGE/WAREHOUSE_RANGE/TRADE_RANGE definem índices válidos. ItemManager::Load lê scripts via CMemScript e preenche ITEM_INFO com Index, Slot, Skill, Width/Height, HaveSerial/Option, DropItem, Name, atributos (Damage/Defense/Durability/Requirements) por seção.",
    description: "Base de dados do servidor para calcular espaço, requisitos e opções de itens, incluindo sockets e período/validade, usada pelos handlers de rede e verificações de inventário."
  },
  {
    id: "server-item-packet-structs",
    name: "Packets de item (get/drop/move/use/buy/sell/repair)",
    type: "Servidor",
    files: ["ItemManager.h"],
    classes: [],
    functions: ["PMSG_ITEM_GET_RECV", "PMSG_ITEM_DROP_RECV", "PMSG_ITEM_MOVE_RECV", "PMSG_ITEM_USE_RECV", "PMSG_ITEM_BUY_RECV", "PMSG_ITEM_SELL_RECV", "PMSG_ITEM_REPAIR_RECV", "PMSG_ITEM_GET_SEND", "PMSG_ITEM_DROP_SEND", "PMSG_ITEM_MOVE_SEND", "PMSG_ITEM_CHANGE_SEND", "PMSG_ITEM_DELETE_SEND", "PMSG_ITEM_DUR_SEND", "PMSG_ITEM_BUY_SEND", "PMSG_ITEM_SELL_SEND", "PMSG_ITEM_REPAIR_SEND", "PMSG_ITEM_LIST_SEND", "PMSG_ITEM_LIST", "PMSG_ITEM_EQUIPMENT_SEND", "PMSG_ITEM_MODIFY_SEND", "PMSG_ITEM_BUY_NEW"],
    networkDetails: "Sistema de packets original: cabeçalhos PBMSG_HEAD/PSWMSG_HEAD/PSBMSG_HEAD com opcodes C1:22-26/32-34 e F3:10/13/14 encapsulam solicitações e respostas de item entre cliente e GameServer.",
    flow: "Packets de cliente carregam índices/slots/ItemInfo (12 bytes) e coordenadas (drop x/y). Packets de servidor retornam result/slot/ItemInfo, updates de durabilidade, deleção, lista completa (count+PMSG_ITEM_LIST) ou equipamentos (CharSet). Os structs definem exatamente os campos transportados sem lógica adicional.",
    description: "Mapa completo dos pacotes de item usados no protocolo original para get/drop/move/use/buy/sell/repair e sincronização de listas/equipamentos." 
  },
  {
    id: "server-item-handlers",
    name: "Handlers de packet de item (pegar/soltar/mover/usar)",
    type: "Servidor",
    files: ["ItemManager.cpp", "ItemManager.h"],
    classes: ["CItemManager"],
    functions: ["CGItemGetRecv", "CGItemDropRecv", "CGItemMoveRecv", "CGItemUseRecv"],
    networkDetails: "Sistema de packets original: recebe C1:22 (get), 0x23 (drop), 0x24 (move), 0x26 (use) e responde com PMSG_ITEM_GET/DROP/MOVE/DUR/DELETE via DataSend.",
    flow: "CGItemGetRecv valida estado, bloqueia itens de evento/Muun, trata zen (0xFE) e insere itens via InventoryInsertItem/ItemByteConvert antes de retornar PMSG_ITEM_GET_SEND. CGItemDropRecv impede drops quando lock/DieRegen/Interface e chama gMap.ItemDrop; se êxito, InventoryDelItem e PMSG_ITEM_DROP_SEND. CGItemMoveRecv constrói resposta 0x24, checa interfaces (Trade/Warehouse/Chaos/PersonalShop/Trainer) e chama MoveItemTo* para trocar entre inventário, trade, warehouse, chaos, personal shop, event e muun, convertendo ItemInfo e notificando durabilidade/período. CGItemUseRecv filtra índices (scrolls, bless bundle, fruit) e, ao consumir, envia GCItemDeleteSend/GCItemModifySend conforme o alvo.",
    description: "Fluxo servidor que manipula todos os comandos de item do cliente, aplicando regras de bloqueio e contêineres antes de atualizar inventário e responder pelos packets do protocolo original."
  },
  {
    id: "server-item-move-matrix",
    name: "Regras de movimento entre contêineres (Inventory/Trade/Warehouse/Chaos/Shop/Trainer)",
    type: "Servidor",
    files: ["ItemManager.cpp", "ItemManager.h"],
    classes: ["CItemManager"],
    functions: ["CGItemMoveRecv", "MoveItemToInventoryFromInventory", "MoveItemToTradeFromInventory", "MoveItemToWarehouseFromInventory", "MoveItemToChaosBoxFromInventory"],
    networkDetails: "Sistema de packets original: C1:24 carrega SourceFlag/TargetFlag/slots e ItemInfo; servidor responde com PMSG_ITEM_MOVE_SEND result/slot/ItemInfo.",
    flow: "CGItemMoveRecv cria PMSG_ITEM_MOVE_SEND (0x24), bloqueia se DieRegen ou interfaces incorretas. Valida SourceFlag/TargetFlag para Trade (Interface.type==INTERFACE_TRADE), Warehouse (Interface.type==INTERFACE_WAREHOUSE e LoadWarehouse/WarehouseLock), Chaos Box (Interface.type==INTERFACE_CHAOS_BOX ou flags 6-20), PersonalShop (PShopOpen/PShopTransaction) e Trainer (Interface.type==INTERFACE_TRAINER). Cada combinação chama MoveItemTo* correspondente (Inventory→Inventory/Trade/Warehouse/Chaos/PersonalShop/EventInventory/Muun, Trade→Inventory/Trade/EventInventory, Warehouse→Inventory/Warehouse, ChaosBox→Inventory/ChaosBox, PersonalShop→Inventory/PersonalShop) e, em sucesso, converte ItemInfo do alvo. Restrições impedem operação sem interface ativa ou locks.",
    description: "Tabela de roteamento de movimento que verifica flags de interface antes de mover itens entre contêineres, retornando result/slot e ItemInfo preenchido somente após validações específicas de Trade, Warehouse, Chaos, PersonalShop e Trainer."
  },
  {
    id: "server-chaos-event-muun-move",
    name: "Movimentação para Chaos Box, Event Inventory e Muun Inventory",
    type: "Servidor",
    files: ["ItemManager.cpp", "ItemManager.h"],
    classes: ["CItemManager"],
    functions: ["MoveItemToChaosBoxFromInventory", "MoveItemToEventInventoryFromEventInventory", "MoveItemToMuunInventoryFromMuunInventory"],
    networkDetails: "Parte do fluxo C1:24; CGItemMoveRecv chama essas funções quando SourceFlag/TargetFlag correspondem a Chaos Box, Event Inventory ou Muun Inventory, respondendo via PMSG_ITEM_MOVE_SEND.",
    flow: "MoveItemToChaosBoxFromInventory exige range de inventário e Chaos, checa expansões Ext1-4 e CheckItemMoveToChaos, verifica serial em inventário/warehouse e adiciona no ChaosBox, deletando e atualizando viewport ao sucesso. MoveItemToEventInventoryFromEventInventory (>=802) valida slots, impede Source=Target, confere serial duplicado, tenta empilhar via EventInventoryAddItemStack, copia mapa, marca source 0xFF e reverte mapa em falha; ao sucesso, move item, atualiza mapa e retorna TargetFlag. MoveItemToMuunInventoryFromMuunInventory (>=803) valida range, impede Source=Target, checa CheckItemMoveToMuunInventory, move com cópia de mapa e, quando envolve slots de equipar, refaz CharSet e envia GCMuunItemChangeSend/GCMuunItemStatusSend.",
    description: "Implementa regras específicas para transferir itens entre inventário normal e contêineres especiais (Chaos Box, Event Inventory, Muun), aplicando validações de expansão, serial e atualização visual quando Muun equipado."
  },
  {
    id: "server-muun-system",
    name: "Sistema de Muun (inventário, opções e handlers)",
    type: "Servidor",
    files: ["MuunSystem.cpp", "MuunSystem.h"],
    classes: ["CMuunSystem"],
    functions: [
      "Load",
      "MainProc",
      "MuunInventoryInsertItem",
      "CGMuunItemGetRecv",
      "CGMuunItemUseRecv",
      "CGMuunItemSellRecv",
      "GCMuunItemStatusSend",
      "DGMuunInventoryRecv",
      "GDMuunInventorySaveSend"
    ],
    networkDetails:
      "Sistema de packets original: cabeçalhos 0x4E (subcódigos 00,02-09) trafegam listas, durabilidade, deleção, status e uso de itens Muun entre GameServer e cliente; DataServer sincroniza slots via C2:27:00 (load) e C2:27:30 (save).",
    flow:
      "Load lê script de Muun (section 0 e 1) em m_MuunSystemInfo/m_MuunSystemOptionInfo; MainProc percorre MUUN_INVENTORY_WEAR_SIZE e consulta CheckSpecialOption/GetMuunSystemOptionInfo para aplicar/revogar status, recalculando atributos e enviando GCMuunItemStatusSend. CGMuunItemGetRecv (0x4E:00) valida conexão, interface, duelo e CheckItemGive; aceita apenas itens Muun/utilitários, insere via MuunInventoryInsertItem, remove do mapa e envia ItemInfo convertido. CGMuunItemUseRecv (0x4E:08) despacha type 1/2/3 para CharacterUseMuunLevelUp/EvolutionStone/JewelOfLife, apagando/modificando slots e retornando resultado. CGMuunItemSellRecv (0x4E:09) exige interface shop, valida slot e allow sell, calcula PetValue/Value, atualiza Money e remove item, recalculando CharSet/status quando slot de equipar. DGMuunInventoryRecv carrega slots e mapa 62x16 bytes vindos do DataServer; GDMuunInventorySend/GDMuunInventorySaveSend solicitam e persistem inventário completo em sessões.",
    description:
      "Gerencia inventário dedicado de Muun (62 slots, 2 de equipar), opções temporais e especiais carregadas de script, valida pick/use/sell via subcódigos 0x4E e sincroniza estado com DataServer, recalculando atributos e pré-visualização do personagem quando pets Muun são equipados ou removidos."
  },
  {
    id: "server-item-get-drop-conditions",
    name: "Condições de pegar e dropar itens (servidor)",
    type: "Servidor",
    files: ["ItemManager.cpp", "ItemManager.h"],
    classes: ["CItemManager"],
    functions: ["CGItemGetRecv", "CGItemDropRecv"],
    networkDetails: "Sistema de packets original: C1:22 solicita pegar item do mapa e C1:23 soltar item; respostas usam PMSG_ITEM_GET_SEND ou PMSG_ITEM_DROP_SEND.",
    flow: "CGItemGetRecv valida conexão, DieRegen, interface ativa, duelo, transação, range de mapa e CheckItemGive; bloqueia itens de evento/Muun e contagem de quest. Impede duplicar rings específicos e trata zen (14,15) creditando Money com result 0xFE. Caso contrário, tenta InventoryInsertItemStack ou InventoryInsertItem e envia ItemByteConvert/GCPartyItemInfoSend, incluindo notificações periódicas e eventos BloodCastle/IllusionTemple. CGItemDropRecv valida estados semelhantes, impede Lucky/Periodic/Lock, consulta CheckItemMoveAllowDrop e bloqueia itens level>4 ou excellent/set/harmony; tenta DropItemByItemIndex ou casos especiais (Summon/Life Stone). Em sucesso, remove do inventário e confirma via DataSend.",
    description: "Aplica filtros de estado, tipo de item e regras especiais para pegar itens do mapa ou soltá-los, tratando zen, rings únicos, eventos e drops bloqueados antes de alterar inventário e responder ao cliente."
  },
  {
    id: "server-380-item-option",
    name: "Opções 380 e aplicação em atributos",
    type: "Servidor",
    files: ["380ItemOption.cpp", "380ItemOption.h"],
    classes: ["C380ItemOption"],
    functions: ["Load", "Calc380ItemOption", "InsertOption", "Is380Item", "SetInfo", "GetInfo"],
    networkDetails: "Sem envio direto; calcula bônus em LPOBJ ao equipar itens com flag 0x80 (m_ItemOptionEx) usando tabelas 380 carregadas.",
    flow: "Load lê ITEM_380_OPTION_INFO via MemScript (Index, Name, Value), inicializa m_380ItemOptionInfo e armazena por índice; Calc380ItemOption percorre INVENTORY_WEAR_SIZE, verifica IsItem/Is380Item e consulta g380ItemType.Get380ItemOptionIndex/Value para até 2 opções, aplicando InsertOption que soma AttackSuccessRatePvP, DamagePvP, DefenseSuccessRatePvP, DefensePvP, AddLife, AddShield ou SDRecovery em lpObj quando flag==0.",
    description: "Gerencia tabela de opções 380 e aplica bônus PvP/SD/HP quando itens com bit 0x80 estão equipados, usando valores do script ou overrides por item." 
  },
  {
    id: "server-380-item-type-map",
    name: "Mapeamento de opções 380 por item",
    type: "Servidor",
    files: ["380ItemType.cpp", "380ItemType.h"],
    classes: ["C380ItemType"],
    functions: ["Load", "Check380ItemType", "Get380ItemOptionIndex", "Get380ItemOptionValue"],
    networkDetails: "Nenhum packet direto; fornece índices/valores para C380ItemOption construir bônus ao equipar.",
    flow: "Load lê ITEM_380_TYPE_INFO via MemScript, converte par (type,index) com GET_ITEM e armazena OptionIndex/OptionValue (2 posições) em std::map m_380ItemTypeInfo; Check380ItemType testa existência; Get380ItemOptionIndex/Value retornam dados ou -1 quando fora do mapa ou fora do range.",
    description: "Tabela que vincula itens específicos a até duas opções 380 e valores associados, servindo de base para o cálculo de bônus no equipamento." 
  },
  {
    id: "server-item-shop-handlers",
    name: "Compra, venda e reparo de itens",
    type: "Servidor",
    files: ["ItemManager.cpp", "ItemManager.h"],
    classes: ["CItemManager"],
    functions: ["CGItemBuyRecv", "CGItemSellRecv", "CGItemRepairRecv", "CGItemBuyConfirmRecv"],
    networkDetails: "Sistema de packets original: C1:32 (buy), C1:33 (sell), C1:34 (repair) e C1:32/F3:ED (buy confirm) trafegam itens/slots; respostas usam PMSG_ITEM_BUY/SELL/REPAIR_SEND e atualizam dinheiro ou item stack.",
    flow: "CGItemBuyRecv valida conexão, Interface=SHOP, TargetShopNumber e Transaction antes de buscar item em gShopManager/GetItemByIndex; aplica tax gCastleSiegeSync, lida com moedas Coin1-3 ou zen, tenta InventoryInsertItemStack/InventoryInsertItem e envia PMSG_ITEM_BUY_SEND com ItemInfo/money. CGItemSellRecv exige interface shop, checa INVENTORY_FULL_RANGE, valida item em Inventory[slot], calcula valor via gItemMove.CheckItemMoveAllowSell e atualiza Money com PMSG_ITEM_SELL_SEND, removendo item e recalculando atributos. CGItemRepairRecv opcionalmente repara tudo (slot 0xFF) ou slot específico, bloqueando trade/NPC inadequado, chama RepairItem para durabilidade e responde com PMSG_ITEM_REPAIR_SEND; recalcula atributos quando reparo é aplicado.",
    description: "Implementa transações de loja no servidor, incluindo compra com impostos e moedas especiais, venda validando itens permitidos e reparo em lote ou individual com verificação de interface/nível antes de aplicar custos e atualizar inventário/dinheiro."
  },
  {
    id: "server-mapitem-drop-lifecycle",
    name: "Criação e tempo de vida de itens no mapa",
    type: "Servidor",
    files: ["MapItem.cpp", "MapItem.h"],
    classes: ["CMapItem"],
    functions: ["Init", "CreateItem", "DropCreateItem"],
    networkDetails: "Sem envio direto; instâncias CMapItem são geradas e depois serializadas pelos handlers de item ao responder pacotes de drop/get.",
    flow: "CreateItem/DropCreateItem chamam Init, ajustam Level/Durability e Convert com opções (Option1/2/3/New/Set/JewelOfHarmony/ItemOptionEx/Socket/SocketBonus), definem flags periódicas e tempo restante (m_IsPeriodicItem/m_LoadPeriodicItem/m_PeriodicItemTime), posicionam m_X/m_Y, marcam m_Live=1, m_Give=0, m_State=OBJECT_CREATE e programam m_Time e m_LootTime usando gServerInfo.m_ItemDropTime (100% e 50% do valor) antes de gravar Serial.",
    description: "Define o ciclo de vida de objetos de item no mundo com timers de loot e expiração baseados em configuração, preparando-os para coleta ou remoção posterior."
  },
  {
    id: "server-pk-drop-system",
    name: "Drop de itens ao morrer em PK",
    type: "Servidor",
    files: ["User.cpp", "ItemManager.h"],
    classes: [],
    functions: ["gObjDie", "CItemManager::CGPkDrop"],
    networkDetails: "Sistema de packets original: reutiliza PMSG_ITEM_DROP_RECV para simular drop forçado quando PKLevel>=6 e m_PkItemDropRate passa no rand(); usa GetItemName para logar e CGPkDrop para processar.",
    flow: "Em gObjDie, quando m_PkItemDropSwitch e m_PkItemDropEnable permitem, sorteia até 24 tentativas em slots 0-11 ou inventário principal, monta PMSG_ITEM_DROP_RECV com slot/x/y e chama CGPkDrop; ignora alguns índices especiais (GET_ITEM(13,20) com níveis 1-2) e registra LogAdd de drop ao sucesso.",
    description: "Implementa perda de item em mortes PK via reuso do handler de drop, respeitando limites de mapa, PKLevel e itens bloqueados, e limpando inventário conforme CGPkDrop."
  },
  {
    id: "server-pentagram-system",
    name: "Pentagram: inserção/remoção/refino de joias elementais",
    type: "Servidor",
    files: ["PentagramSystem.cpp", "PentagramSystem.h"],
    classes: ["CPentagramSystem"],
    functions: [
      "Load",
      "LoadJewel",
      "LoadMixRate",
      "CGPentagramJewelInsertRecv",
      "CGPentagramJewelRemoveRecv",
      "CGPentagramJewelRefineRecv",
      "CGPentagramJewelUpgradeRecv",
      "GCPentagramJewelInfoSend"
    ],
    networkDetails: [
      "Sistema de packets original: C1:EC:00 (insert), C1:EC:01 (remove),",
      "C1:EC:02 (refine mix), C1:EC:03 (upgrade level/rank) e C1:EE:01",
      "(info) usam structs PMSG_PENTAGRAM_JEWEL_* com slots/alvo/tipo;",
      "DataServer interage via C2:23:00/ C1:23:00 para salvar/recuperar info."
    ].join(' '),
    flow: [
      "Load/LoadJewel/LoadMixRate leem tabelas de tipo/opções/rates via",
      "CMemScript para mapas m_PentagramTypeInfo/m_PentagramOptionInfo/",
      "m_PentagramJewelOptionInfo/m_PentagramJewelRemoveInfo/m_Pentagram",
      "JewelUpgrade*. CGPentagramJewelInsertRecv valida conexão e range,",
      "confirma PentagramItem e PentagramJewel, calcula SocketSlot e só",
      "permite se slot está 0xFE e atributo combina; AddPentagramJewelInfo",
      "registra info, envia PMSG_PENTAGRAM_JEWEL_INSERT_SEND, grava índice",
      "na m_SocketOption e remove o item de origem. CGPentagramJewelRemove",
      "Recv checa ranges/validações, consulta GetPentagramJewelInfo e",
      "espaço no inventário, avalia taxa MixRate por atributo, cria item de",
      "joia (GDCreateItemSend) ou apenas limpa slot para 0xFE, removendo info",
      "e enviando resultado. CGPentagramJewelRefineRecv e",
      "CGPentagramJewelUpgradeRecv aplicam ChaosLock/PShopOpen, zeram",
      "dinheiro/sucesso e delegam para gChaosBox mixes (mithril/elixir/jewel/",
      "decomposite/upgrade level/rank). GCPentagramJewelInfoSend varre arrays",
      "PentagramJewelInfo_* e envia blocos via 0xEE:01 para cliente."
    ].join(' '),
    description: "Gerencia joias elementais (pentagram) carregando tabelas de tipo/opção/rate e tratando inserção, remoção, refino e upgrade com validações de slots, atributos e espaço, usando mixes de Chaos e sincronização com DataServer/cliente."
  },
  {
    id: "client-item-structs",
    name: "Struct ITEM do cliente e atributos carregados",
    type: "Cliente",
    files: ["_struct.h"],
    classes: ["ITEM", "ITEM_ATTRIBUTE"],
    functions: [],
    networkDetails: "Estruturas locais usadas para armazenar dados vindos dos packets de inventário/equipamentos; não enviam dados diretamente.",
    flow: "ITEM inclui campos Type, Level, requisitos, opções especiais, sockets, posição (x/y) e flags de período/opção 380; ITEM_ATTRIBUTE guarda nome, TwoHand, SkillIndex, requisitos e resistências carregadas dos scripts.",
    description: "Modelo de item usado pelo cliente para renderização e validação, mantendo informações de sockets e posição em grid compatíveis com o layout do inventário."
  },
  {
    id: "client-inventory-handling",
    name: "Recebimento de inventário e interação de itens no cliente",
    type: "Cliente",
    files: ["WSclient.cpp"],
    classes: [],
    functions: ["ReceiveInventory", "ReceiveDeleteInventory", "ReceiveGetItem", "ReceiveDropItem", "ReceiveTradeInventory", "ReceiveCreateItemViewport"],
    networkDetails: "Sistema de packets original: interpreta listas completas (C4:F3:10) em PRECEIVE_INVENTORY, confirma exclusão (C1:28), coleta (C3:22), drop (C1:23) e lotes de trade/loja/mix (C1:31) além de criação/remoção de itens no viewport.",
    flow: "ReceiveInventory zera equipamentos/malas/loja, remove pets (DeleteBug/DeletePet), percorre Value entradas e distribui itens entre equipamentos, mochila e loja pessoal; ReceiveDeleteInventory remove slots específicos e desabilita uso quando Value !=0. ReceiveGetItem trata resultados NOT_GET_ITEM/GET_ITEM_ZEN/GET_ITEM_MULTI, atualiza Gold, insere item ou toca sons específicos, e envia mensagens de chat com nome do item; ReceiveDropItem aplica remoção no slot equipamento/mochila conforme KeyH e faz backup do item selecionado. ReceiveTradeInventory interpreta SubCode (3/5 mix falho/sucesso) tocando sons e reiniciando MixInventory ou popula Shop/Storage com PRECEIVE_INVENTORY recebido. ReceiveCreateItemViewport instancia itens no mapa com coordenadas escaladas e remove via ReceiveDeleteItemViewport quando necessário.",
    description: "Camada cliente que sincroniza inventário, trade/mix/storage e itens no mundo usando os packets do protocolo original, removendo/atualizando slots e sons conforme respostas do servidor."
  },
  {
    id: "server-item-require-checks",
    name: "Validação de requisitos e movimentação para slots",
    type: "Servidor",
    files: ["ItemManager.cpp", "ItemManager.h"],
    classes: ["CItemManager"],
    functions: [
      "CheckItemRequireLevel",
      "CheckItemRequireStrength",
      "CheckItemRequireDexterity",
      "CheckItemRequireVitality",
      "CheckItemRequireEnergy",
      "CheckItemRequireLeadership",
      "CheckItemRequireClass",
      "CheckItemMoveToInventory",
      "CheckItemMoveToTrade",
      "CheckItemMoveToVault",
      "CheckItemMoveToChaos",
      "CheckItemMoveToBlock"
    ],
    networkDetails: "Usado por handlers de item (C1:22-26/32-34) antes de aceitar movimentação, trade, vault ou chaos; não envia pacotes diretamente, mas determina respostas de sucesso/erro nos fluxos de item do protocolo original.",
    flow: "CheckItemRequire* compara nível/força/destreza/vitalidade/energia/liderança e classe contra campos m_Require* e RequireClass; CheckItemMoveToInventory exige item válido, valida range de slot equipável, requisitos, combinações de mão (slots 0/1 e 10/11), bloqueia montaria em Atlans e rings duplicados. CheckItemMoveToTrade/Vault/Chaos verificam periodicidade, itens Lucky/Pentagram, filtros gItemMove e bloqueios (TradeDuel, Lock, gServerInfo TradeItemBlock). CheckItemMoveToBlock rejeita trocas de itens Exc/Set/Harmony conforme limites de gServerInfo.",
    description: "Camada de regras que determina se um item pode ser equipado, trocado, armazenado ou enviado para caos, incluindo restrições por mapa, mão dupla e flags de servidor; influência direta no resultado dos packets de movimentação."
  },
  {
    id: "server-item-move-allowlist",
    name: "Lista de permissões de drop/venda/troca/vault por item",
    type: "Servidor",
    files: ["ItemMove.h"],
    classes: ["CItemMove"],
    functions: ["Load", "CheckItemMoveAllowDrop", "CheckItemMoveAllowSell", "CheckItemMoveAllowTrade", "CheckItemMoveAllowVault"],
    networkDetails: "Consultado pelos handlers de movimento e trade antes de aceitar ações nos pacotes C1:23/C1:24/C1:32-34 para decidir se um item específico pode ser dropado, vendido, trocado ou enviado ao vault.",
    flow: "ITEM_MOVE_INFO contém flags AllowDrop/AllowSell/AllowTrade/AllowVault carregadas via Load em m_ItemMoveInfo; métodos CheckItemMoveAllow* consultam o map por Index e retornam permissão binária usada por CItemManager ao processar os comandos de item.",
    description: "Tabela de permissão granular para ações de drop/venda/troca/vault por código de item, influenciando respostas de pacotes de movimentação e comércio."
  },
  {
    id: "server-item-stack-config",
    name: "Configuração de stack e item criado a partir de stack",
    type: "Servidor",
    files: ["ItemStack.h"],
    classes: ["CItemStack"],
    functions: ["Load", "GetItemMaxStack", "GetCreateItemIndex"],
    networkDetails: "Sem envio direto; fornece limites usados quando handlers de item e inventário avaliam empilhamento em respostas de pacotes.",
    flow: "ITEM_STACK_INFO armazena Index, MaxStack e CreateItemIndex; Load popula m_ItemStackInfo, e GetItemMaxStack/GetCreateItemIndex retornam o limite de pilha e item resultante quando a stack é consumida ou convertida.",
    description: "Define quantidades máximas por item empilhável e qual item pode ser criado, permitindo ao servidor validar e resolver pilhas durante operações de inventário e drops."
  },
  {
    id: "server-item-stack-operations",
    name: "Empilhamento, fusão e criação a partir de pilhas",
    type: "Servidor",
    files: ["ItemManager.cpp", "ItemManager.h", "ItemStack.cpp", "ItemStack.h"],
    classes: ["CItemManager", "CItemStack"],
    functions: [
      "InventoryInsertItemStack",
      "InventoryAddItemStack",
      "DeleteInventoryItemCount",
      "ConvertItemByte"
    ],
    networkDetails: "Usa o sistema de packets original: handlers C1:22-26 acionam GCItemDurSend/GCItemDeleteSend e GDCreateItemSend ao fundir pilhas ou gerar item bônus ao atingir MaxStack.",
    flow: "InventoryInsertItemStack percorre slots não equipáveis, compara index/level/socketBonus e soma durabilidade até MaxStack; ao atingir o limite, chama GDCreateItemSend com CreateItemIndex e remove a pilha, caso contrário atualiza durabilidade. InventoryAddItemStack move quantidade de SourceSlot para TargetSlot quando index/level/socketBonus coincidem, também gerando CreateItemIndex ao preencher a pilha e apagando fonte se zerar. DeleteInventoryItemCount consome itens contando durabilidade para pilhas e envia GCItemDurSend ou GCItemDeleteSend. ConvertItemByte limita durabilidade recebida pelo MaxStack para evitar pilhas maiores que o configurado.",
    description: "Implementa a fusão e o consumo de pilhas de itens com limites por ItemStack.txt, incluindo criação automática de itens derivados quando a pilha atinge o máximo e sincronização de durabilidade/remoção via respostas de inventário."
  },
  {
    id: "server-inventory-equipment-effects",
    name: "Efeitos de itens equipados por durabilidade especial",
    type: "Servidor",
    files: ["InventoryEquipment.cpp", "InventoryEquipment.h", "EffectManager.h", "ItemManager.h"],
    classes: ["CInventoryEquipment"],
    functions: ["MainProc", "CheckInventoryEquipment", "InsertInventoryEquipment", "CGInventoryEquipmentRecv"],
    networkDetails: "Sistema de packets original: handler C1:BF:20 (PMSG_INVENTORY_EQUIPMENT_RECV/SEND) recebe slot e result (254 ativa, 255 desativa) para alternar efeitos de itens 13,128-13,134 com durabilidade especial (254/255).",
    flow: "MainProc percorre jogadores conectados e seus efeitos; quando encontra efeitos Hawk/Goat/Oak/Maple figurine/charm/horseshoe, consulta CheckInventoryEquipment para ver se item índice e durabilidade 254 ainda estão presentes em slots INVENTORY_WEAR_SIZE..INVENTORY_EXT4_SIZE, removendo efeito se não estiver. CheckInventoryEquipment confirma existência do item com durability 254. InsertInventoryEquipment varre o inventário estendido e, para itens 13,128-13,134 com durabilidade 254, busca EFFECT_INFO via GetInfoByItem e, se o grupo não estiver ativo, adiciona efeito. CGInventoryEquipmentRecv valida conexão, ranges de slot (exclui equipamentos), checa item válido/durabilidade, troca 255→254 adicionando efeito ou 254→255 removendo efeito e responde via DataSend com result -2 (ativado) ou -1 (desativado/erro).",
    description: "Controla ativação/desativação de efeitos de itens especiais em slots de inventário estendido através de flags de durabilidade e aplica/retira buffs via EffectManager conforme comandos do cliente."
  },
  {
    id: "server-socket-item-type",
    name: "Tipos de item com limite de sockets",
    type: "Servidor",
    files: ["SocketItemType.cpp", "SocketItemType.h"],
    classes: ["CSocketItemType"],
    functions: ["Load", "CheckSocketItemType", "GetSocketItemMaxSocket"],
    networkDetails: "Sem envio direto; fornece limites consultados por MakeSocketOption e validações de criação antes de enviar respostas de item no protocolo original.",
    flow: "Load percorre script com CMemScript, converte tipo/índice via SafeGetItem(GET_ITEM), armazena MaxSocket em m_SocketItemTypeInfo; CheckSocketItemType retorna existência do registro e GetSocketItemMaxSocket devolve o limite de sockets usado por MakeSocketOption.",
    description: "Tabela de quais itens aceitam sockets e quantos, aplicada nas rotinas de geração de opções e validação de itens com socket."
  },
  {
    id: "server-item-value",
    name: "Tabela de valor de item e moedas", 
    type: "Servidor",
    files: ["ItemValue.cpp", "ItemValue.h"],
    classes: ["CItemValue"],
    functions: ["Load", "GetItemValue", "GetItemValueNew"],
    networkDetails: "Usado por verificações de preço/venda antes de responder a operações de item; não envia pacotes diretamente.",
    flow: "Load lê ITEM_VALUE_INFO (Index, Level, Grade, Value, Coin1-3, Sell) para m_ItemValueInfo; GetItemValue retorna Value ajustado por durabilidade para itens empilháveis; GetItemValueNew devolve valor e moedas específicas considerando Level/Grade ou curingas (-1) para complementar outras rotinas de economia.",
    description: "Mantém tabela de avaliação monetária e moedas especiais por item/nível/grade, reutilizada para cálculos de venda e consumo em operações de inventário."
  },
  {
    id: "server-item-value-trade",
    name: "Validação de valor e moedas em troca",
    type: "Servidor",
    files: ["ItemValueTrade.cpp", "ItemValueTrade.h"],
    classes: ["CItemValueTrade"],
    functions: ["Load", "CheckItemValueTrade"],
    networkDetails: "Executado no servidor ao processar trocas antes de confirmar os pacotes de trade do protocolo original; deduz zen e moedas via GDSetCoinSend/GCMoneySend.",
    flow: "Load monta m_ItemValueTradeInfo com Index e valores Money/Coin1-3. CheckItemValueTrade soma valor das pilhas em cada lado (usando gItemStack e durabilidade para stack) e compara com Money/Coin disponíveis; emite GCNotice em falta, envia GDSetCoinSend para debitar moedas virtuais e ajusta Money de ambos os jogadores antes de finalizar a troca.",
    description: "Regra de paridade de troca que garante que zen e moedas especiais cobrirem o valor configurado dos itens negociados, bloqueando e notificando quando faltam recursos."
  },
  {
    id: "server-personal-shop",
    name: "Loja pessoal: preço, abertura e compra",
    type: "Servidor",
    files: ["PersonalShop.cpp", "PersonalShop.h", "ItemManager.cpp", "CustomStore.cpp", "ServerInfo.h"],
    classes: ["CPersonalShop"],
    functions: [
      "CGPShopSetItemPriceRecv",
      "CGPShopOpenRecv",
      "CGPShopCloseRecv",
      "CGPShopItemListRecv",
      "CGPShopBuyItemRecv",
      "CGPShopLeaveRecv",
      "GetRequireJewelCount",
      "GetPaymentJewelCount",
      "SetRequireJewelCount",
      "SetPaymentJewelCount",
      "GCPShop*Send",
      "GDPShop*SaveSend"
    ],
    networkDetails: "Sistema original usa packets 0x3F e DataSend nas rotinas GCPShop*/GDPShop* para preço/abertura/lista/compra com persistência no DataServer; na UE 5.7 deve ser substituído por RPCs Server/Client/NetMulticast e replicação de estado de loja, sem uso do protocolo legado.",
    flow: "CGPShopSetItemPriceRecv valida conexão, slot e existência do item, exige preço >0 (zen ou JoB/JoS/JoC em updates >=802) e nível >5 antes de gravar m_PShopValue/m_PShopJo* e responder com GCPShopSetItemPriceSend. CGPShopOpenRecv verifica switch do ServerInfo, interface livre, mapas proibidos (CA/CC/IT), nível >5 e toggla PShopOpen copiando texto; dispara GCPShopOpenSend e, se já aberto, GCPShopTextChangeSend. CGPShopItemListRecv confirma que o alvo está aberto, nome confere, marca PShopWantDeal/PShopDealerIndex e envia lista via GCPShopItemListSend com hooks gCustomStore. CGPShopBuyItemRecv valida transação/money, verifica preço/joias/saldo/jewels requeridos via GetRequire/PaymentJewelCount e limites de commission; insere item no comprador com InventoryInsertItem, debita zen, registra log, move joias conforme tabelas e remove item do vendedor com GCPShopSellItemSend/GD saves, fechando loja se vazia. CGPShopCloseRecv/LeaveRecv zeram flags de negociação; GCPShopViewportSend varre viewport para anunciar lojas abertas.",
    description: "Implementa o ciclo completo de loja pessoal: definição de preço (zen ou joias), abertura com texto, listagem segura por nome/índice, compra com validações de saldo/joias/comissão e remoção do item do vendedor, além de persistir valores no DataServer via GDPShopItemValue*."
  },
  {
    id: "server-item-option-rate",
    name: "Taxas de opção e geração de opções de item",
    type: "Servidor",
    files: ["ItemOptionRate.cpp", "ItemOptionRate.h"],
    classes: ["CItemOptionRate"],
    functions: [
      "Load",
      "GetItemOption0",
      "GetItemOption1",
      "GetItemOption2",
      "GetItemOption3",
      "GetItemOption4",
      "GetItemOption5",
      "GetItemOption6",
      "MakeNewOption",
      "MakeSetOption",
      "MakeSocketOption"
    ],
    networkDetails: "Sem envio direto; fornece probabilidades para handlers de criação/drop que mais tarde são serializados nos packets de item do protocolo original.",
    flow: "Load lê seções 0-6 via CMemScript, preenche mapas m_ItemOption*RateInfo. Métodos GetItemOption* montam CRandomManager com Rate[n] e retornam opção sorteada. MakeNewOption limita quantidade de opções excelentes por item (asas, dinorant, fenrir, etc.), MakeSetOption escolhe índices de set e MakeSocketOption preenche slots com 0xFE respeitando gSocketItemType/pentagram.",
    description: "Tabela central de probabilidades para níveis/opções exc/seed/set/sockets, usada por ItemBag, MossMerchant e LuckyItem para construir itens com opções coerentes."
  },
  {
    id: "server-lucky-item-options",
    name: "Aplicação de opções e regeneração de Lucky Items",
    type: "Servidor",
    files: ["LuckyItem.cpp", "LuckyItem.h"],
    classes: ["CLuckyItem"],
    functions: [
      "GetLuckyItemOption0",
      "GetLuckyItemOption1",
      "GetLuckyItemOption2",
      "GetLuckyItemOption3",
      "GetLuckyItemOption4",
      "GetLuckyItemOption5",
      "GetLuckyItemOption6",
      "CharacterUseJewelOfElevation"
    ],
    networkDetails: "Sem envio direto; resultados são usados por criação/atualização de itens antes de envio pelos packets de inventário do protocolo original.",
    flow: "Cada GetLuckyItemOption* busca LUCKY_ITEM_INFO por índice e delega ao gItemOptionRate para sortear nível/opções. CharacterUseJewelOfElevation verifica se o item em TargetSlot é Lucky, restaura durabilidade para 255 e reconverte o item, chamando CharacterMakePreviewCharSet para atualizar aparência.",
    description: "Especializa regras de sorteio e restauração para Lucky Items, encadeando a tabela de taxas global e reconstruindo o item com Convert para refletir mudanças visuais."
  },
  {
    id: "server-lucky-item-decay-sync",
    name: "Carga, regeneração e sincronização de durabilidade de Lucky Items",
    type: "Servidor",
    files: ["LuckyItem.cpp", "LuckyItem.h"],
    classes: ["CLuckyItem"],
    functions: [
      "Load",
      "IsLuckyItem",
      "GetLuckyItemIndex",
      "GetLuckyItemDecay",
      "CharacterUseJewelOfExtension",
      "CharacterUseJewelOfElevation",
      "DGLuckyItemRecv",
      "GDLuckyItemSend",
      "GDLuckyItemSaveSend"
    ],
    networkDetails: "Sistema original usa mensagens C2:22:00 (send/recv) e C2:22:30 entre GameServer e DataServer para sincronizar slots/seriais e m_DurabilitySmall de itens Lucky; na UE 5.7 isso deve ser substituído por RPCs/replicação e salvamento nativo, sem packets legados.",
    flow: "Load lê LuckyItem.txt via CMemScript preenchendo LUCKY_ITEM_INFO (Index, Group, Decay, Option0-6) no mapa m_LuckyItemInfo. IsLuckyItem verifica presença no mapa. GetLuckyItemIndex percorre o mapa por section/group e chama CheckItemRequireClass antes de devolver o índice. GetLuckyItemDecay retorna Decay por índice. CharacterUseJewelOfExtension valida ranges e existência nos slots fonte/alvo, exige Lucky com durabilidade não 0/255, seta m_Durability=255, reconverte o item com Convert e chama CharacterMakePreviewCharSet. CharacterUseJewelOfElevation delega a AddJewelOfElevationOption. DGLuckyItemRecv valida conta e, para cada SDHP_LUCKY_ITEM1 recebido, confere slot, existência, Lucky e serial antes de gravar m_DurabilitySmall. GDLuckyItemSend percorre INVENTORY_SIZE, coleta slot/serial de Lucky Items e envia PSWMSG_HEAD 0x22:00 ao DataServer. GDLuckyItemSaveSend monta 0x22:30 com serial e DurabilitySmall dos Lucky Items ativos.",
    description: "Implementa carga de configurações Lucky, checagem de elegibilidade por classe/section, regeneração de durabilidade via Jewel of Extension/Elevation e sincronização periódica com DataServer dos seriais/durabilidades, rejeitando slots inválidos ou itens não Lucky."
  },
  {
    id: "server-harmony-options",
    name: "Opções Jewel of Harmony e Smelt/Elevation",
    type: "Servidor",
    files: ["JewelOfHarmonyOption.cpp", "JewelOfHarmonyOption.h", "ServerInfo.h"],
    classes: ["CJewelOfHarmonyOption"],
    functions: [
      "Load",
      "GetJewelOfHarmonyItemOptionType",
      "GetJewelOfHarmonyRandomOption",
      "AddJewelOfHarmonyOption",
      "AddSmeltStoneOption",
      "AddJewelOfElevationOption",
      "CalcJewelOfHarmonyOption"
    ],
    networkDetails: "Sem envio direto; as funções são chamadas por handlers de inventário/chaos antes de responder pelos packets tradicionais, atribuindo opções Harmony ao item e recalculando atributos do personagem.",
    flow: "Load percorre seções por tipo (weapon/staff/armor) via CMemScript, preenchendo JEWEL_OF_HARMONY_OPTION_INFO com ValueTable/MoneyTable e Rate. GetJewelOfHarmonyItemOptionType categoriza o índice (armas/staff/armaduras) ignorando sockets. GetJewelOfHarmonyRandomOption usa CRandomManager para sortear opção elegível respeitando Level e requisitos de STR/DEX. AddJewelOfHarmonyOption valida slots, bloqueia Set/Lucky/Socket, sorteia opção/nível inicial e, se sucesso percentual m_HarmonySuccessRate[AccountLevel], grava m_JewelOfHarmonyOption e reconverte o item atualizando CharSet. AddSmeltStoneOption exige item Harmony, calcula rate por pedra (m_SmeltStoneSuccessRate1/2), incrementa nível até 13 ou reseta para nível base e reconverte. AddJewelOfElevationOption aplica Harmony em Lucky Items (nível clamped a 13) usando a mesma taxa. CalcJewelOfHarmonyOption percorre INVENTORY_WEAR_SIZE e chama InsertOption para aplicar bônus em atributos (dano, crítico, SkillDamage, defesa, HP/MP/BP, redução de dano, SD) conforme type/index e flag.",
    description: "Implementa carga de tabela Harmony, categorização por tipo de item, sorteio aplicado com taxas configuráveis e recálculo de atributos ao equipar ou refinar, com tratamentos específicos para Smelt/Elevation e atualização de CharSet."
  },
  {
    id: "server-custom-jewel",
    name: "Carga e aplicação de Custom Jewel em itens",
    type: "Servidor",
    files: ["CustomJewel.cpp", "CustomJewel.h", "ObjectManager.cpp", "ItemManager.cpp"],
    classes: ["CCustomJewel", "CObjectManager", "CItemManager"],
    functions: [
      "Load",
      "CheckCustomJewelApplyItem",
      "GetCustomJewelSuccessRate",
      "GetCustomJewelNewOption",
      "GetCustomJewelSetOption",
      "GetCustomJewelSocketOption",
      "CharacterUseCustomJewel"
    ],
    networkDetails: "Sistema de packets original: ProtocolCore recebe C1:24 (move/use) e CItemManager::CGItemMoveRecv delega ao CharacterUseCustomJewel; a resposta é feita via GCItemDeleteSend/GCItemModifySend. Na UE 5.7 isso vira RPCs/replicação sem packets legados.",
    flow: "Load percorre seções 0/1/2 em CustomJewel.txt preenchendo CUSTOM_JEWEL_INFO (item permitido, ranges de level/opções/socket, taxa por AccountLevel, preço) e Success/FailureInfo (incrementos/decrementos). CheckCustomJewelApplyItem valida alvo: LuckyItem bloqueado, categoria de slot (arma/armadura/asa) conforme flags, níveis/opções mín./máx., limites de exc/set/socket com gItemManager/gSetItemType/gSocketItemType/gCustomWing. CharacterUseCustomJewel checa slots fonte/alvo, rejeita itens periódicos, avalia sucesso GetLargeRand%rate; em sucesso aplica incrementos de level/option1/option2/option3 e chama GetCustomJewelNewOption/SetOption/SocketOption, recalcula durabilidade via GetItemDurability e reconverte o item com Convert/CharacterMakePreviewCharSet; em falha subtrai campos conforme FailureInfo e reconverte antes de devolver 1.",
    description: "Gerencia joias customizadas configuradas em arquivo, aplicando regras de elegibilidade e incrementos/decrementos no item alvo com reconversão e atualização visual; integra-se a CGItemMoveRecv para consumir a joia no slot fonte e modificar o item de destino."
  },
  {
    id: "server-moss-merchant-gamble",
    name: "Sorteio de item no Moss Merchant",
    type: "Servidor",
    files: ["MossMerchant.cpp", "MossMerchant.h"],
    classes: ["CMossMerchant"],
    functions: ["RollItem"],
    networkDetails: "Sem packets diretos; cria item via GDCreateItemSend após sortear opções, que serão sincronizados pelos packets de inventário tradicionais.",
    flow: "RollItem filtra itens por grupo, usa CRandomManager em GambleRate para escolher MOSS_MERCHANT_ITEM_INFO, consulta gItemOptionRate para Option0-6, aplica MakeNew/Set/Socket e envia GDCreateItemSend com opções sorteadas.",
    description: "Implementa gacha de loja Moss configurável por grupo, combinando probabilidades de opções com GDCreateItemSend para entregar o item ao jogador."
  },
  {
    id: "server-jewel-mix",
    name: "Mix e UnMix de Jewels com Chaos Lock",
    type: "Servidor",
    files: ["JewelMix.cpp", "JewelMix.h", "Protocol.cpp", "CommandManager.cpp"],
    classes: ["CJewelMix"],
    functions: [
      "GetJewelSimpleIndex",
      "GetJewelBundleIndex",
      "CGJewelMixRecv",
      "CGJewelUnMixRecv",
      "GCJewelMixResultSend",
      "GCJewelUnMixResultSend",
      "CommandJewelMix",
      "CommandJewelUnMix"
    ],
    networkDetails: "Sistema de packets original: ProtocolCore recebe C1:BC:00 (mix) e C1:BC:01 (unmix) e retorna resultados em C1:BC:[00/01] pela GCJewel*ResultSend; comandos /mix e /unmix usam a mesma lógica sem envolver os packets do cliente legado na adaptação UE.",
    flow: "CGJewelMixRecv verifica conexão/interface comum e ChaosLock, valida type 0-9 e level 0-2, exige quantidade ((level+1)*10) de jewels simples via gItemManager, cobra MixMoney calculado, deleta jewels e cria bundle (GetJewelBundleIndex) via GDCreateItemSend; envia resultado 1 em sucesso e libera ChaosLock. CGJewelUnMixRecv valida range de slot, index/level do bundle, espaço livre para JewelCount, cobra 1.000.000 zen, deleta bundle e gera Jewels simples com GDCreateItemSend em loop antes de enviar resultado. CommandJewelMix/UnMix parseiam texto (bless/soul/life/creation/guardian/gem/harmony/chaos/lowstone/highstone) e quantidades 10/20/30, chamando as mesmas validações e respostas.",
    description: "Processa empacotamento e desempaquetamento de jewels em bundles com controle de concorrência via ChaosLock, consumo de zen e criação de itens pelo servidor, reportando estados via subcódigos 0xBC sem reusar o sistema de packets na UE 5.7."
  },
  {
    id: "server-item-attribute-loader",
    name: "Carregamento e cache de atributos de item",
    type: "Servidor",
    files: ["ItemManager.cpp", "ItemManager.h"],
    classes: ["CItemManager"],
    functions: [
      "Load",
      "GetInfo",
      "GetItemDurability",
      "GetItemRepairMoney"
    ],
    networkDetails: "Sem envio direto; preenche m_ItemInfo usado pelos handlers C1:22-26/32-34 e pelas conversões ItemByteConvert/DBItemByteConvert antes de responder via packets.",
    flow: "Load lê MemScript seccionado e cria ITEM_INFO com index, slot, skill, dimensões, flags de serial/opção/drop, nome, dano/defesa, AttackSpeed/WalkSpeed, Durability somada a MagicDurability, requisitos de level/atributos/resistências e preço; marca TwoHand quando Width>=2 e insere em m_ItemInfo para consultas posteriores.",
    description: "Carrega e armazena todos os atributos de item do arquivo script, disponibilizando requisitos, dimensões e preços para as demais rotinas de inventário, reparo e montagem de packets."
  },
  {
    id: "server-itembag-manager",
    name: "Roteamento de ItemBag por índice/monstro/evento",
    type: "Servidor",
    files: ["ItemBagManager.cpp", "ItemBagManager.h"],
    classes: ["CItemBagManager"],
    functions: [
      "Load",
      "LoadEventItemBag",
      "GetItemByItemIndex",
      "GetItemByMonsterClass",
      "GetItemBySpecialValue",
      "DropItemByItemIndex",
      "DropItemByMonsterClass",
      "DropItemBySpecialValue"
    ],
    networkDetails: "Servidor decide itens a dropar antes de enviar criação de item aos clientes; sem envio direto, mas influencia os packets de drop/loot processados em ProtocolCore.",
    flow: "Load popula m_ItemBagManagerInfo com ItemIndex, ItemLevel, MonsterClass e SpecialValue; LoadEventItemBag percorre diretório EventItemBag/ e associa ItemBag.Load para cada arquivo; métodos GetItem/DropItem iteram o map e delegam a ItemBag.GetItem/DropItem conforme filtro de item, monstro ou valor especial.",
    description: "Administra a associação entre tabelas de drop (ItemBag) e filtros de índice/monstro/evento, retornando itens gerados ou disparando quedas no mapa conforme configuração carregada."
  },
  {
    id: "server-itembag-ex",
    name: "ItemBagEx: drop seccional com requisitos de classe",
    type: "Servidor",
    files: ["ItemBagEx.cpp", "ItemBagEx.h"],
    classes: ["CItemBagEx"],
    functions: ["Load", "GetItem", "DropItem", "CheckDropClass", "GetRandomItemDropLocation"],
    networkDetails: "Não recebe pacotes diretos; DropItem usa GDCreateItemSend para criar itens no mapa após sortear seções/itens. Regras de classe podem envolver party (CheckDropClass) e acionam efeitos via GCFireworksSend.",
    flow: "Load lê seções do script: seção 3 popula m_ItemBagInfo (Index/DropRate); seção 4 insere DropInfo (Section/Rate/Money/OptionValue/RequireClass) em cada ItemBag; seções >=5 acumulam ITEM_BAG_EX_ITEM_INFO (Index/Level/Grade/Option0-6/Duration) agrupados pela seção. GetItem percorre ItemBags, aplica DropRate (<10000), filtra DropInfo por classe/party (OptionValue&2) e usa CRandomManager para escolher seção; pega item aleatório da seção, aplica opções via gItemOptionRate (Option0-6, set/socket) e converte no CItem retornado. DropItem replica a seleção mas chama GetRandomItemDropLocation quando o tile está bloqueado e usa GDCreateItemSend para spawnar no mapa, ou MoneyItemDrop quando faltam itens, disparando fogos quando OptionValue&1.",
    description: "Implementa tabelas avançadas de drop com seções e requisitos de classe/party, aplicando opções/sets/socket e duração a itens criados no mundo, reutilizando ItemOptionRate e verificando posições válidas de spawn."
  },
  {
    id: "server-item-drop-config",
    name: "Tabela de drop configurado por monstro/mapa",
    type: "Servidor",
    files: ["ItemDrop.h"],
    classes: ["CItemDrop"],
    functions: ["Load", "DropItem", "GetItemDropRate"],
    networkDetails: "Orientado a servidor: decide qual item é criado antes de enviar packets de drop/mundo aos clientes.",
    flow: "ITEM_DROP_INFO guarda Index, Level, Grade, opções 0-6, duração, mapa, monstro e faixa de nível, além de DropRate; Load preenche m_ItemDropInfo e DropItem seleciona itens considerando GetItemDropRate com parâmetros do monstro/target.",
    description: "Camada de configuração que determina quais itens podem cair de monstros específicos em mapas e níveis definidos, alimentando a criação de itens no mundo."
  },
  {
    id: "server-excellent-option-rate",
    name: "Seleção de opção excellent por taxa e faixa de item",
    type: "Servidor",
    files: ["ItemExcellentOptionRate.cpp", "ItemExcellentOptionRate.h"],
    classes: ["CItemExOptionRate"],
    functions: ["Load", "GetExcellentOptionByRate"],
    networkDetails: "Processo interno de geração de opção antes de enviar criação de item ao cliente; não recebe packets diretos.",
    flow: "Load usa CMemScript para criar ITEM_EX_OPTION_RATE_INFO com OptionIndex, ItemMinIndex/ItemMaxIndex, Name e OptionRate, armazenando em m_ItemExOptionRateInfo. GetExcellentOptionByRate instancia CRandomManager, filtra registros pela faixa de índice do item e por opções já presentes (NewOption & OptionIndex), adiciona OptionIndex à roleta com OptionRate e retorna o OptionIndex sorteado via GetRandomElement.",
    description: "Carrega tabela de chance de opções excellent por intervalo de ItemIndex e escolhe uma opção ainda não aplicada ao item ao gerar loot ou recompensas."
  },
  {
    id: "server-set-item-option",
    name: "Aplicação de bônus de Set Item",
    type: "Servidor",
    files: ["SetItemOption.cpp", "SetItemOption.h", "SetItemType.h"],
    classes: ["CSetItemOption"],
    functions: ["Init", "Load", "GetInventorySetItemOptionCount", "CalcSetItemStat", "CalcSetItemOption", "InsertOption"],
    networkDetails: "Sem packets dedicados; altera atributos do personagem antes de sincronizar estado/CharSet com o cliente.",
    flow: "Load reinicializa m_SetItemOptionInfo e lê OptionTable/FullOptionTable via CMemScript para cada índice de set. CalcSetItemStat percorre INVENTORY_WEAR, verifica IsSetItem e tipo via gSetItemType, obtém ItemOption com GetSetItemStatType e chama InsertOption para aplicar atributos base (Strength/Dexterity/Vitality/Energy/Leadership). CalcSetItemOption conta peças equipadas por set (GetInventorySetItemOptionCount), aplica OptionTable para cada quantidade-1 e, quando o máximo é atingido, aplica FullOptionTable e marca lpObj->IsFullSetItem.",
    description: "Calcula bônus de sets equipados somando atributos, dano, defesa, resistências e flags de set completo conforme tabelas de OptionTable/FullOptionTable carregadas."
  },
  {
    id: "server-custom-quest-rewards",
    name: "Recompensas de CustomQuest com validação de espaço e sockets",
    type: "Servidor",
    files: ["CustomQuest.cpp", "CustomQuest.h"],
    classes: ["CCustomQuest"],
    functions: [
      "CheckItemRewardInventorySpace",
      "CheckItemInventorySpace",
      "AddRewardItem",
      "QuestCommand"
    ],
    networkDetails: "Uso do sistema original: QuestCommand envia SDHP_CUSTOMQUEST_SAVE_SEND (C1:F2) ao DataServer e chama GDCreateItemSend para criar itens de recompensa; não há RPCs/replicação na Unreal.",
    flow: "CheckItemRewardInventorySpace percorre recompensas do quest aplicável, filtra por classe e usa CheckItemInventorySpace para encontrar retângulo livre com InventoryRectCheck antes de premiar; AddRewardItem monta ItemSocketOption limitado por gSocketItemType.GetSocketItemMaxSocket, chama GDCreateItemSend com opções/JOH/OpEx/Duration e sockets definidos e aplica duração via time(0)+Duration; QuestCommand valida switch CustomQuest, interfaces e trade duel, verifica Character/Item/Monster e espaço, incrementa lpObj->CustomQuest, envia SDHP_CUSTOMQUEST_SAVE_SEND ao DataServer, remove itens/moedas requeridos e chama AddRewardCoin/Item/Buff/Experience seguido de GCFireworksSend.",
    description: "Implementa fluxo de conclusão de CustomQuest com pré-checagem de inventário e sockets antes de premiar itens, moedas e buffs, coordenando salvamento no DataServer e efeitos visuais ao concluir."
  }

];

const ueGuides = {
  "serverlist-script-load": {
    title: "Recriar leitura ServerList.bmd",
    steps: [
      "1. Abra o Unreal Engine 5.7, carregue o projeto e no Content Browser clique em **Add → New C++ Class**.",
      "2. Escolha **None** como base e crie uma classe `UObject` chamada `UServerListManagerUE` para substituir a leitura local feita por CServerListManager.",
      "3. No arquivo `.h`, declare um método `UFUNCTION(BlueprintCallable)` `bool LoadServerListScript(const FString& FilePath)` e um `TMap<int32, FServerGroupInfo>` (defina `USTRUCT` espelhando SERVER_GROUP_INFO: nome, pos, sequence, NonPVP).",
      "4. No arquivo `.cpp`, em `LoadServerListScript`, apenas carregue os dados com `FFileHelper::LoadFileToArray` e copie para o struct sem aplicar XOR/BuxConvert, pois os assets já estarão em formato aceito pela UE 5.7; se receber um arquivo legado, registre log orientando a substituição pelo asset convertido.",
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
      "3. No `.cpp`, em `LoadSocketOptions`, use `FFileHelper::LoadFileToArray` para ler o binário já convertido e preencher cada `FSocketOptionInfo` diretamente, sem aplicar XOR/BuxConvert; se um arquivo legado criptografado for detectado, registre aviso para substituição antes de retornar false.",
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
      "3. No `.cpp`, use `FFileHelper::LoadFileToArray` para ler BuffEffect_<ML>.bmd e copie diretamente os dados para o struct, sem XOR/BuxConvert, já que os arquivos foram convertidos para formato compatível com a UE 5.7; retorne false se o tamanho não bater e registre aviso se identificar um arquivo legado criptografado.",
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
  },
  "server-dataserver-dispatch": {
    title: "Roteio de respostas de backend em UE",
    steps: [
      "1. No Unreal 5.7, crie um **GameInstance Subsystem** chamado `UDataBackendRouter` (Add → New C++ Class → Game Instance Subsystem) para substituir `DataServerProtocolCore`.",
      "2. No `.h`, declare `UFUNCTION(Server, Reliable)` handlers como `void ServerHandleWarehouse(const FWarehousePayload& Data);`, `void ServerHandleCharacterList(const TArray<FCharacterSummary>& Characters);` e `void ServerHandleCommandReset(const FResetResult& Result);` espelhando os cases 0x01-0x0F do código original.",
      "3. No `.cpp`, registre um mapa `TMap<uint8, TFunction<void(const TArray<uint8>&)>>` que associa cada head/subcódigo a um delegate forte; em `Initialize`, preencha os delegates chamando funções tipadas em vez de parsing manual de bytes.",
      "4. Para notificações ao cliente, declare `UFUNCTION(Client, Reliable)` como `void ClientReceiveWarehouseItems(const FWarehousePayload& Data);` ou `ClientReceiveQuestKill(const FQuestKillData& Data);` e chame-as nos handlers, substituindo o envio de buffers gWarehouse/DGQuestKillCountRecv.",
      "5. Se alguma estrutura de retorno não puder ser inferida do código original, inclua na implementação um `UE_LOG` com a mensagem 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' e bloqueie a chamada até obter especificação.",
      "6. Em **Edit → Project Settings → Maps & Modes**, marque o GameMode para usar este subsistema (via `GetGameInstance()->GetSubsystem<UDataBackendRouter>()`) ao iniciar a sessão e teste em PIE chamando manualmente os handlers para ver as notificações Client." 
    ]
  },
  "server-joinserver-auth-move": {
    title: "Autenticar e trocar de mapa com JoinServer em UE",
    steps: [
      "1. Crie um **GameInstance Subsystem** `UJoinServerBridge` (Add → New C++ Class → Game Instance Subsystem) para manter dados de conta, AuthCodes e contadores equivalentes a LoginMessageSend.",
      "2. No PlayerController `ANetworkPC`, declare `UPROPERTY(Replicated)` `uint8 LoginMessageSend` e implemente `GetLifetimeReplicatedProps` com `DOREPLIFETIME` para esse campo e `AccountLevel`.",
      "3. No `.h` do PlayerController, adicione `UFUNCTION(Server, Reliable)` `void ServerSubmitAccount(const FString& Account, const FString& Password);`, `void ServerRequestMapMove(int32 NextServerCode, uint8 Map, uint8 X, uint8 Y);` e `void ServerConfirmMapAuth(const FAuthPayload& Auth);`.",
      "4. No GameMode, crie `UFUNCTION(Server, Reliable)` `void ServerProcessMapMove(ANetworkPC* PC, int32 NextServerCode, uint8 Map, uint8 X, uint8 Y);` que consulta o `UJoinServerBridge` para validar bloqueios/Lock e em sucesso chama `ClientReceiveMapMove` (RPC Client) com IP/porta ou envia `ClientMapMoveCanceled` caso contrário.",
      "5. No PlayerController, implemente `UFUNCTION(Client, Reliable)` `void ClientReceiveJoinResult(uint8 ResultCode, uint8 AccountLevel, const FString& ExpireDate);` e `void ClientReceiveMapMove(const FString& Ip, uint16 Port, const FAuthPayload& Auth);` para substituir GCConnectAccountSend/JGMapServerMoveRecv; atualize estados replicados e chame `ServerTravel` somente após confirmação.",
      "6. Para contas já conectadas, declare `UFUNCTION(Server, Reliable)` `void ServerHandleAlreadyConnected(const FString& Account);` e, caso `UJoinServerBridge` detecte duplicidade, chame `ClientForceLogout()` (RPC Client) ou finalize o pawn com `Destroy()` conforme gServerInfo.m_DisconnectOnlineAccount.",
      "7. Em UMG de login, conecte botão \"Login\" à chamada `ServerSubmitAccount`; para mudança de mapa, ligue o evento correspondente ao botão de teleporte para disparar `ServerRequestMapMove`. Compile, ative **Replicates** no PlayerController Blueprint e teste transições em PIE."
    ]
  },
  "server-packet-encryption-manager": {
    title: "Configurar segurança de transporte sem buffers manuais",
    steps: [
      "1. No Editor, adicione um **Game Instance Subsystem** `UPacketSecuritySubsystem` (Add → New C++ Class → Game Instance Subsystem) para substituir `CPacketManager`.",
      "2. No `.h`, declare `UPROPERTY()` arrays para chaves `TArray<uint8> EncryptionKey` e `DecryptionKey` e métodos `UFUNCTION(BlueprintCallable)` `void InitializeKeys();` e `void ApplySecuritySettings();`.",
      "3. Em `InitializeKeys` no `.cpp`, carregue chaves de um DataTable ou arquivo `INI` usando `GConfig`; se não houver arquivo equivalente ao ENCDEC_HEADER, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' e use chaves padrões do backend.",
      "4. Em `ApplySecuritySettings`, configure `UNetDriver::EncryptionKey` ou utilize `FEncryptionContext` da UE para assinar/criptografar pacotes, em vez de aplicar XOR manual; documente em comentários que não são usados buffers m_SaveLoadXor/m_XorFilter.",
      "5. No GameMode inicial (por exemplo `AUEProtocolRouter`), chame `GetGameInstance()->GetSubsystem<UPacketSecuritySubsystem>()->InitializeKeys();` no BeginPlay para garantir que a sessão configure as chaves antes de qualquer RPC.",
      "6. Se precisar registrar telemetria, crie `UFUNCTION(BlueprintCallable)` `FString DescribeKeysForDebug();` que retorna apenas tamanhos ou hashes, nunca o conteúdo; compile e teste conexão em PIE para confirmar que os RPCs continuam funcionando sem serialização manual."
    ]
  },
  "server-item-packet-structs": {
    title: "Mapear structs de packet de item para RPCs UE",
    steps: [
      "1. No projeto UE 5.7, crie `USTRUCT(BlueprintType)` `FItemPacketPayload` com campos `int32 Slot`, `FVector_NetQuantize10 DropPos`, `TArray<uint8> ItemInfoBytes` (12 bytes) e `uint8 ResultCode` para espelhar `PMSG_ITEM_GET/DROP/MOVE/USE/BUY/SELL/REPAIR`.",
      "2. No PlayerController, declare `UFUNCTION(Server, Reliable)` wrappers como `void ServerSendItemGet(int32 WorldItemId);`, `void ServerSendItemDrop(int32 Slot, const FVector& Pos);`, `void ServerSendItemMove(int32 FromFlag, int32 FromSlot, const TArray<uint8>& ItemInfo, int32 ToFlag, int32 ToSlot);` e `void ServerSendItemUse(int32 SourceSlot, int32 TargetSlot, uint8 UseType);` substituindo os pacotes C1:22/23/24/26.",
      "3. No GameMode ou InventorySubsystem, declare `UFUNCTION(Client, Reliable)` `void ClientItemGetResult(const FItemPacketPayload& Payload);`, `ClientItemDropResult`, `ClientItemMoveResult`, `ClientItemDurUpdate`, `ClientItemDelete` correspondentes aos PMSG de retorno; marque Payload como `const` e atualize arrays replicados ao receber.",
      "4. Registre as chamadas no BeginPlay do PlayerController conectando eventos de UI e input a esses RPCs; sempre valide tamanhos `ItemInfoBytes.Num()==12` e, se faltar algum campo do pacote original, logue 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' antes de rejeitar.",
      "5. Use `FNetSerialize` customizado em `FItemPacketPayload` se quiser comprimir `ItemInfoBytes` em bits; teste em PIE enviando e recebendo payloads e verificando que InventoryComponent atualiza slots de forma consistente."
    ]
  },

  "server-item-attribute-loader": {
    title: "Ordem UE 5.7: importar atributos de item",
    globalOrderStep: 1,
    steps: [
      "1. Abra o Unreal Engine 5.7 e clique em **Add → New C++ Class**. Selecione **None** e crie uma classe `UItemDataLibrary` derivada de `UObject` marcada com `UCLASS(BlueprintType)`. No `.h`, declare `USTRUCT(BlueprintType) FItemInfoRow` copiando campos de ITEM_INFO: `int32 Index`, `int32 Slot`, `int32 Skill`, `int32 Width`, `int32 Height`, `bool bHaveSerial`, `bool bHaveOption`, `bool bDropItem`, `FString Name`, `int32 Level`, `int32 DamageMin/Max`, `int32 MagicDamageRate`, `bool bTwoHand`, `int32 Defense`, `int32 MagicDefense`, `int32 DefenseSuccessRate`, `int32 AttackSpeed`, `int32 WalkSpeed`, `int32 Durability`, `int32 MagicDurability`, `int32 Value`, `int32 BuyMoney`, `int32 Resistance[8]`, `int32 RequireLevel/Strength/Dexterity/Energy/Vitality/Leadership`, `TArray<int32> RequireClass`. Para campos não encontrados no código, registre em comentário: 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "2. Compile. No Content Browser, clique em **Add → Miscellaneous → Data Table**, escolha `FItemInfoRow` como Row Structure e nomeie `DT_ItemInfo`. Preencha manualmente os valores equivalentes aos scripts carregados por CItemManager::Load; quando faltar dado de seção 12-15 que não esteja no código, escreva a frase padrão no campo de descrição da linha.",
      "3. Em `UItemDataLibrary`, adicione método `UFUNCTION(BlueprintCallable)` `bool FindItemInfo(int32 Index, FItemInfoRow& OutRow)` que busca na DataTable (via `FindRow`) e retorna falso se não encontrar. No `.cpp`, inicialize um ponteiro `UDataTable* ItemInfoTable` em `BeginPlay` do GameMode lendo um SoftObjectPath para `DT_ItemInfo`.",
      "4. No GameMode ou em um `UItemRuleSubsystem` (Add → New C++ Class → Game Instance Subsystem), exponha função `GetItemDurabilityUE` que soma `Durability + MagicDurability` como faz `GetItemDurability` no C++; use essa função ao inicializar novos `FItemData` no inventário. Quando não houver regra específica de seções (por exemplo, itens 12-15), logue a frase padrão e retorne o valor básico do DataTable.",
      "5. Marque `UItemRuleSubsystem` como replicável via RPCs Client para enviar tabelas resumidas somente quando for necessário (por exemplo, `ClientSyncItemRow(Index, Row)`), lembrando que a tabela não usa sockets nem parsing manual; apenas serialização padrão UE."
    ]
  },

  "server-380-item-type-map": {
    title: "Ordem UE 5.7: mapa de opções 380 por item",
    globalOrderStep: 2,
    steps: [
      "1. No Editor, crie um **Blueprint Struct** `FItem380TypeRow` com campos `int32 ItemIndex`, `int32 OptionIndex[2]`, `int32 OptionValue[2]` refletindo ITEM_380_TYPE_INFO.",
      "2. Em **Add → Miscellaneous → Data Table**, escolha `FItem380TypeRow` e nomeie `DT_Item380Type`; preencha linhas com pares ItemIndex/OptionIndex/OptionValue conforme scripts do servidor. Se faltar linha ou valor no código, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' no comentário da linha.",
      "3. Crie um **Game Instance Subsystem** `UItem380TypeService` com `UPROPERTY()` `TMap<int32, FItem380TypeRow> TypeMap` e métodos `LoadFromTable` e `bool GetOptionData(int32 ItemIndex, FItem380TypeRow& OutRow)`.",
      "4. No `.cpp`, em `Initialize`, carregue `DT_Item380Type` (via SoftObjectPath) e preencha `TypeMap`; implemente `GetOptionData` retornando falso quando não achar o item. Não use parsing de bytes ou packets do legado: apenas DataTable e RPCs se necessário.",
      "5. No Character ou InventoryComponent, ao equipar item, chame `GetSubsystem<UItem380TypeService>()->GetOptionData(ItemIndex, Row)` para decidir se o item é 380 e armazenar OptionIndex/Value replicados para uso pelos bônus."
    ]
  },

  "server-380-item-option": {
    title: "Ordem UE 5.7: aplicar bônus 380 em atributos",
    globalOrderStep: 3,
    steps: [
      "1. Crie um **Blueprint Struct** `FItem380OptionRow` com `int32 Index`, `FString Name`, `int32 Value` espelhando ITEM_380_OPTION_INFO e gere `DT_Item380Option` como DataTable correspondente.",
      "2. No mesmo subsystem `UItemRuleSubsystem` ou um novo `UItem380OptionService`, adicione `TMap<int32, FItem380OptionRow> OptionMap` e método `void Apply380Options(ACharacter* Target, const FItem380TypeRow& TypeRow, bool bRemove);`.",
      "3. Implemente `Apply380Options` iterando `OptionIndex[0..1]`; para cada índice válido, consulte `OptionMap` para obter Value ou use `TypeRow.OptionValue` quando disponível, aplicando em variáveis replicadas do personagem (`AttackSuccessRatePvP`, `DamagePvP`, `DefenseSuccessRatePvP`, `DefensePvP`, `BonusMaxHP`, `BonusMaxSD`, `SDRecoveryType`, `SDRecoveryRate`). Quando um campo não existir no personagem, registre a frase padrão e pule a aplicação.",
      "4. No Character, adicione `UPROPERTY(Replicated)` para os atributos acima e `UFUNCTION(Server, Reliable)` `void ServerRecalculate380Options();` que obtém itens equipados do InventoryComponent, consulta `UItem380TypeService` e chama `Apply380Options` com bRemove=true antes de reaplicar.",
      "5. Configure `OnRep` para atributos relevantes para atualizar HUD ou efeitos locais; não use nenhum packet legado. Teste em PIE equipando/remoção de itens marcados como 380 e valide replicação em múltiplos clientes seguindo a ordem: carregar DataTables → equipar item → recalcular → atualizar UI."
    ]
  },

  "server-excellent-option-rate": {
    title: "Ordem UE 5.7: rolar opção excellent por taxa",
    globalOrderStep: 5,
    steps: [
      "1. Crie um **Blueprint Struct** `FExcellentOptionRateRow` com `int32 OptionIndex`, `int32 ItemMinIndex`, `int32 ItemMaxIndex`, `FString Name`, `int32 OptionRate` (espelhando ITEM_EX_OPTION_RATE_INFO). Depois, adicione um **Data Table** `DT_ExcellentOptionRate` com esse struct.",
      "2. Adicione um **Game Instance Subsystem** `UExcellentOptionService` com `TArray<FExcellentOptionRateRow> Rows` e um método `UFUNCTION(BlueprintCallable)` `bool RollExcellentOption(int32 ItemIndex, int32 CurrentOptionMask, int32& OutOptionIndex);`.",
      "3. No `.cpp`, em `Initialize`, carregue `DT_ExcellentOptionRate` via SoftObjectPath e preencha `Rows`. Em `RollExcellentOption`, percorra `Rows`, filtre por faixa (`ItemIndex` dentro de ItemMin/ItemMax) e descarte opções já presentes (`CurrentOptionMask & OptionIndex`), acumulando pesos `OptionRate` em um `FRandomStream` ou `FWeightedRandomSampler`. Retorne falso quando nada se encaixar.",
      "4. Integre a ordem cronológica: após carregar os dados de item (passos 1-4), invoque `RollExcellentOption` no fluxo de criação de loot/upgrade antes de construir `FItemData`. Se o código original não indicar quantas opções aplicar, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' em log e aplique apenas uma opção sorteada.",
      "5. Para auditoria, exponha `UFUNCTION(Client, Reliable)` `void ClientDebugExcellentRoll(int32 ItemIndex, int32 RolledOption);` chamado apenas em builds de teste. Não use qualquer packet legado; toda comunicação deve ser via RPCs nativos UE.",
      "6. No Blueprint do sistema de loot (por exemplo, Controller de mobs), chame `RollExcellentOption` ao gerar item e escreva o resultado em `FItemData.ExcellentOptionsMask` replicado, garantindo que o cliente atualize tooltips via OnRep."
    ]
  },

  "server-set-item-option": {
    title: "Ordem UE 5.7: bônus de Set Item e set completo",
    globalOrderStep: 6,
    steps: [
      "1. Crie um **Blueprint Struct** `FSetItemOptionRow` com `int32 Index`, `FString Name`, `int32 OptionTable[3][6]` (Index/Value pareados) e `int32 FullOptionTable[3][2]` espelhando SET_ITEM_OPTION_INFO. Preencha um **Data Table** `DT_SetItemOption` com essas linhas; onde valores não estiverem no código, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "2. Adicione um **Game Instance Subsystem** `USetItemOptionService` com `TMap<int32, FSetItemOptionRow> OptionMap` e métodos `void LoadFromTable()` e `void ApplySetOptions(ACharacter* Target, const TArray<FEquippedItem>& EquippedItems, bool bRemove);`.",
      "3. No `.cpp`, em `Initialize`, carregue `DT_SetItemOption` e preencha `OptionMap`. Em `ApplySetOptions`, conte peças por set usando `EquippedItems` (estrutura com ItemIndex, SetMask). Para cada set, avalie quantidade equipada-1 para percorrer `OptionTable` e aplicar valores em atributos replicados (força, destreza, vitalidade, energia, liderança, dano, defesa, resistências). Quando a quantidade atingir o máximo disponível, aplique `FullOptionTable` e marque um flag replicado `bHasFullSet`.",
      "4. No Character C++, adicione `UPROPERTY(Replicated)` variáveis para bônus agregados (`SetAddStrength`, `SetAddDexterity`, `SetAddVitality`, `SetAddEnergy`, `SetAddLeadership`, `SetAddDefense`, `SetAddDamage`, `SetResistance[7]`, `bHasFullSet`). Crie `UFUNCTION(Server, Reliable)` `void ServerRecalculateSetOptions();` que chama o serviço com `bRemove=true` para limpar e reaplicar.",
      "5. No InventoryComponent, em `OnRep_EquippedItems`, chame `ServerRecalculateSetOptions` (se autoridade) ou solicite via RPC Server para que o servidor recalcule. Atualize HUD com OnRep dos atributos agregados. Se alguma correspondência de slot não estiver clara, registre a frase padrão e ignore a peça.",
      "6. Na UI, adicione tooltips exibindo Name/OptionTable/FullOptionTable do set usando dados da DataTable. Não use packets legados; toda sincronização deve ocorrer pelas propriedades replicadas e RPCs descritos acima.",
      "7. Ordem cronológica: (a) carregar DataTable de set, (b) adicionar atributos replicados no Character, (c) implementar serviço de aplicação, (d) conectar OnRep de equipamentos, (e) atualizar HUD/tooltips."
    ]
  },

  "server-custom-quest-rewards": {
    title: "UE 5.7: recompensas de CustomQuest sem packets legados (ordem cronológica)",
    steps: [
      "1. Crie **Blueprint Structs** `FCustomQuestRewardItem` (Index, ItemIndex, ItemLevel, Durability, Option1-3, NewOption, AncOption, JOH, OpEx, Socket[5], DurationSeconds, ClassReq) e `FCustomQuestReward` (Index, Coin1-3, Zen). Importe dados equivalentes aos arrays de CCustomQuest::Load; onde não houver valor no código, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "2. Adicione um **GameInstanceSubsystem** `UCustomQuestSubsystem` em C++ com `TMap<int32, FCustomQuestRewardItem>` e `TMap<int32, FCustomQuestReward>` e uma função `bool GetRewards(int32 QuestId, TArray<FCustomQuestRewardItem>& OutItems, FCustomQuestReward& OutCurrency)` que filtra pelo Index e classe (ClassReq).",
      "3. No `APlayerState` (ou componente de progressão), declare `UPROPERTY(ReplicatedUsing=OnRep_QuestId)` `int32 CurrentQuestId` e RPC `UFUNCTION(Server, Reliable)` `void ServerCompleteQuest(int32 QuestId);` em substituição ao packet C1:F2. No corpo, valide que QuestId corresponde a CurrentQuestId+1 e que o jogador não está em trade/menus (mantenha flags replicadas equivalentes a Interface/TradeDuel; se ausentes, registre a frase padrão).",
      "4. Implemente helpers `bool HasInventorySpaceForRewards(const TArray<FCustomQuestRewardItem>&)` no `UInventoryComponent` replicado, percorrendo slots e chamando `InventoryRectCheck` equivalente para verificar largura/altura dos itens como em CheckItemInventorySpace. Retorne falso e envie Client RPC de erro quando não houver espaço.",
      "5. Em `ServerCompleteQuest`, consulte `UCustomQuestSubsystem::GetRewards`, chame `HasInventorySpaceForRewards`, debite moedas/itens exigidos (usando helpers existentes de consumo) e incremente CurrentQuestId. Em seguida, para cada `FCustomQuestRewardItem`, crie `FItemData` preenchendo sockets até o limite conhecido e chame `SpawnInventoryItem` ou `AddItem` no componente (não use sockets/packets diretos).",
      "6. Para efeitos/buffs, crie um serviço `UEffectManager` que aplique buffs quando o reward contiver EffectID/Time/Power; use `UFUNCTION(NetMulticast, Reliable)` `void MulticastApplyQuestRewardFX()` para substituir `GCFireworksSend` exibindo VFX no personagem ao concluir a quest.",
      "7. Integre UI: em um Widget Blueprint de quest, no OnClicked do botão Concluir, chame `ServerCompleteQuest`. Em `OnRep_QuestId`, atualize a UI de progresso. Para mensagens de erro (sem espaço/requisitos), apresente texto em tela replicando os avisos do servidor original.",
      "8. Ordem cronológica recomendada: (a) criar structs/DataTables de recompensa, (b) subsystem de consulta, (c) replicar CurrentQuestId, (d) validar espaço e requisitos em RPC Server, (e) adicionar itens/buffs/moedas e FX multicast, (f) ligar UI. Quando a ordem depender de detalhes ausentes, anote a frase padrão e não implemente lógica supositiva."
    ]
  },

  "server-item-handlers": {
    title: "Plano UE 5.7 para sistema de itens (dados, inventário, drop e uso)",
    globalOrderStep: 4,
    steps: [
      "1. No Content Browser, crie um **Blueprint Struct** `FItemData` (Add → Blueprints → Structure) contendo campos equivalentes ao CItem/ITEM_INFO: `int32 Index`, `int32 Level`, `float Durability`, `int32 Slot`, `bool bIsTwoHand`, `TArray<uint8> Special`, `TArray<uint8> SocketOptions`, `int32 RequireStrength/Dexterity/Energy/Vitality/Leadership`, `int32 SellPrice`, `bool bIsPeriodic`, `int32 PeriodicSeconds`, `int32 SerialLow` (se precisar). Para quaisquer campos não documentados no código, registre \"NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++\" em comentários do struct.",
      "2. Adicione um **C++ Class** derivado de `UActorComponent` chamado `UInventoryComponent` (Add → New C++ Class → Actor Component). No `.h`, declare `UPROPERTY(ReplicatedUsing=OnRep_Items)` `TArray<FItemData> InventorySlots` com tamanho inicial conforme INVENTORY_SIZE (Item.h) e `TArray<FItemData> EquipmentSlots` com INVENTORY_WEAR_SIZE. Implemente `GetLifetimeReplicatedProps` com `DOREPLIFETIME` para ambos.",
      "3. No `.cpp` de `UInventoryComponent`, implemente `void InitializeSlots(int32 InventorySize, int32 EquipSize)` para preencher arrays com entradas vazias e funções helpers `bool SetItemAt(int32 Slot, const FItemData&)`, `bool MoveItem(int32 From, int32 To)` que validem índices usando constantes copiadas de Item.h; se alguma regra de colisão não puder ser deduzida, logue a frase padrão antes de retornar falso.",
      "4. No Character C++ derivado de `ACharacter`, adicione `UPROPERTY(VisibleAnywhere)` `UInventoryComponent* InventoryComp;` inicializado no construtor com `CreateDefaultSubobject`. Marque o Character como `bReplicates=true` e ative **Replicate Movement** em Class Defaults.",
      "5. Declare no Character `UFUNCTION(Server, Reliable)` `void ServerRequestGetItem(int32 WorldItemId);`, `void ServerRequestDropItem(int32 Slot, const FVector& DropPos);`, `void ServerRequestMoveItem(int32 FromSlot, int32 ToSlot);`, `void ServerRequestUseItem(int32 Slot, int32 TargetSlot, uint8 UseType);` correspondendo aos packets C1:22/23/24/26. Cada função deve validar `InventoryComp` e os limites de slot antes de chamar lógica interna.",
      "6. Crie um **C++ Class** derivado de `AActor` chamado `AWorldItem` com `UPROPERTY(Replicated)` `FItemData ItemData` e `UStaticMeshComponent* Mesh`. Em Class Defaults, marque **Replicates**. Adicione `void InitializeFromData(const FItemData&)` e RPC `UFUNCTION(NetMulticast, Reliable)` `void MulticastPlayDropFX()` para efeitos de drop; se animações específicas não existirem no código, documente como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++'.",
      "7. No GameMode ou em um `UItemWorldSubsystem`, implemente funções server-only `bool SpawnWorldItem(const FItemData&, const FVector& Pos)` que chamam `GetWorld()->SpawnActor<AWorldItem>` e armazenam um mapa `WorldItemId → Actor`. Vincule `ServerRequestGetItem` para procurar o ID, aplicar validações equivalentes a CGItemGetRecv (estado vivo, interfaces) e, em sucesso, preencher `InventoryComp->InventorySlots` e destruir o `AWorldItem` com `Destroy()`.",
      "8. Em `ServerRequestDropItem`, leia `InventoryComp->InventorySlots[Slot]`, valide locks semelhantes a CGItemDropRecv (ex.: estado morto/lock flag replicada), e se permitido chame `SpawnWorldItem` com os campos do item e limpe o slot. Chame `MulticastPlayDropFX` no item criado para reproduzir efeitos visuais.",
      "9. Em `ServerRequestMoveItem`, espelhe a lógica de CGItemMoveRecv chamando helpers `MoveItem` para Inventário→Equipamento e outros contêineres. Se o projeto precisar de outros inventários (warehouse/chaos), crie componentes adicionais e registre em comentários quando regras não forem dedutíveis.",
      "10. Em `ServerRequestUseItem`, aplique casos específicos vistos em CGItemUseRecv: para pergaminhos ou frutas use Branch/Switch em Blueprint ou `switch` no C++ para chamar funções `ApplyScrollEffect`, `ApplyFruitStats`, consumindo o item (`SetItemAt` com vazio) e chamando RPC `ClientItemRemoved` (Client, Reliable) para atualizar UI. Sempre que a mecânica exata não estiver clara, chame `UE_LOG` com a frase padrão antes de abortar.",
      "11. Crie um Widget Blueprint `WBP_Inventory` (Add → User Interface → Widget Blueprint). No Event Construct, obtenha o Pawn → `GetComponentByClass` (InventoryComponent) e armazene como variável. Use `ForEachLoop` sobre `InventorySlots` para popular botões de slot; no OnClicked de cada botão, chame funções BlueprintCallable que invocam `ServerRequestMoveItem` ou `ServerRequestUseItem` conforme contexto. Vincule um botão \"Drop\" que chama `ServerRequestDropItem` com `GetHitResultUnderCursor` para posição.",
      "12. Para integração visual de equipamentos, no Character Blueprint, anexe SkeletalMesh/StaticMesh a sockets (ex.: `hand_r`, `spine`) usando `AttachToComponent` quando `InventoryComp` emitir um evento `OnRep_Items` indicando novo item com Slot < INVENTORY_WEAR_SIZE. Se faltar mapeamento exato de sockets, documente em comentários como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' e escolha sockets padrão de Character."
    ]
  },
  "server-itembag-manager": {
    title: "Ordem UE 5.7: tabelas de drop ItemBag",
    globalOrderStep: 7,
    steps: [
      "1. No Editor, crie `USTRUCT(BlueprintType)` `FItemBagEntry` com campos `int32 Index`, `int32 ItemIndex`, `int32 ItemLevel`, `int32 MonsterClass`, `int32 SpecialValue` para espelhar ITEM_BAG_MANAGER_INFO. Adicione `TSoftObjectPtr<UDataTable> BagTable` para referenciar DataTables de loot específicos.",
      "2. Crie uma classe C++ `UItemBagManagerSubsystem` derivada de `UGameInstanceSubsystem`. No `.h`, mantenha `UPROPERTY()` `TMap<int32, FItemBagEntry> BagEntries` e métodos `void LoadBagEntry(const FItemBagEntry&)`, `bool GetItemByItemIndex(int32 ItemIndex, int32 ItemLevel, FItemData& OutItem)`, `bool GetItemByMonsterClass(int32 MonsterClass, FItemData& OutItem)`, `bool GetItemBySpecialValue(int32 SpecialValue, FItemData& OutItem)`.",
      "3. No `.cpp`, implemente `Initialize` carregando DataTables apontadas por `BagTable` e preencha `BagEntries`. Para cada busca GetItem*, itere `BagEntries` filtrando campos como no C++ (ItemIndex+ItemLevel ou MonsterClass ou SpecialValue). Quando não houver correspondência, retorne falso. Use a frase padrão se alguma condição adicional não estiver clara.",
      "4. Adicione `bool DropItemBy...` equivalentes que chamam `SpawnWorldItem` (do guia de drops) ao encontrar uma linha válida. Atribua posição/quantidade a partir do contexto de gameplay (ex.: morte de monstro). Se o fluxo exato de evento não estiver no código, marque como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++'.",
      "5. No Blueprint do GameMode ou em um Actor Controller de mobs, ao finalizar um inimigo, chame o Subsystem `GetItemByMonsterClass` e, em sucesso, invoque RPC Server de drop para criar `AWorldItem` replicado. Configure ordem cronológica: carregar DataTables na inicialização do servidor, registrar bag entries, depois conectar eventos de morte/loot, por fim testar coleta em PIE."
    ]
  },

  "server-itembag-ex": {
    title: "Ordem UE 5.7: ItemBagEx com seções e requisitos de classe",
    globalOrderStep: 8,
    steps: [
      "1. Crie três **Blueprint Structs**: `FItemBagExInfo` (Index, DropRate), `FItemBagExDropInfo` (Index, Section, SectionRate, MoneyAmount, OptionValue, RequireClass[6]) e `FItemBagExItemInfo` (Index, Level, Grade, Option0-6, Duration). Importe os dados do script usado pelo servidor; onde valores não estiverem no código, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "2. Crie DataTables para cada struct (`DT_ItemBagEx`, `DT_ItemBagExDrop`, `DT_ItemBagExItem`) e preencha seções 3/4/5+ conforme o arquivo lido no C++ (seções 3 para BagInfo, 4 para DropInfo, >=5 para itens agrupados por seção). Mantenha o índice de seção como chave para os itens.",
      "3. Adicione um **Game Instance Subsystem** `UItemBagExSubsystem` com mapas `TMap<int32, FItemBagExInfo> BagInfo`, `TMultiMap<int32, FItemBagExDropInfo> DropInfo`, `TMultiMap<int32, FItemBagExItemInfo> SectionItems`. No `Initialize`, carregue DataTables e popular esses mapas mantendo a associação de seções.",
      "4. Implemente método server-only `bool SelectItem(int32& OutSection, FItemBagExItemInfo& OutItem, const FItemContext& Ctx)` que percorre `BagInfo`, testa `DropRate` com rand 0-9999, filtra `DropInfo` por classe/party (OptionValue bit 1) comparando `RequireClass` com o ChangeUp equivalente e usa `FRandomStream` para escolher SectionRate. Depois, randomize `SectionItems` da seção e preencha `OutItem`. Quando não encontrar seção ou item, retorne falso.",
      "5. Adicione função server `FItemData BuildItemFromBagEx(const FItemBagExItemInfo& ItemRow)` que aplica regras equivalentes a gItemOptionRate.GetItemOption0-6/MakeNew/MakeSet/MakeSocket. Use um serviço já criado para ItemOptionRate (passos anteriores) e preencha sockets/sets na struct FItemData; defina `DurationSeconds` se Duration>0.",
      "6. No GameMode/Subsystem de loot, exponha `bool TrySpawnItemBagEx(const FItemContext& Ctx, const FVector& Pos)` que chama `SelectItem` e, em sucesso, converte para `FItemData` e chama o serviço de spawn `SpawnWorldItem` (do guia de drops). Se nenhum item for encontrado mas MoneyAmount for >0, crie um AWorldItem que representa dinheiro ou atualize moeda do jogador diretamente.",
      "7. Para efeitos, adicione `UFUNCTION(NetMulticast, Unreliable)` `void MulticastBagExDropFX(const FVector& Pos)` no GameMode ou Actor do monstro e chame após `SpawnWorldItem` quando `OptionValue & 1` vier marcado, substituindo `GCFireworksSend` sem usar packets legados.",
      "8. Integre a ordem cronológica: (a) carregar DataTables de BagEx, (b) carregar serviço de ItemOptionRate, (c) implementar seleção/validação de classe, (d) construir item com opções/set/socket, (e) spawn/loot replicado, (f) efeitos multicast. Quando a ordem exata não estiver explícita no código, anote a frase padrão após o passo.",
      "9. Para teste, crie um Blueprint de mob que em `Event OnDeath` chama `TrySpawnItemBagEx` com contexto (classe do killer, ChangeUp, party). Valide em PIE que somente classes autorizadas recebem drops e que o efeito multicast dispara conforme OptionValue." 
    ]
  },

  "server-item-move-matrix": {
    title: "Replicar matriz de movimento entre contêineres",
    steps: [
      "1. No componente `UInventoryComponent`, declare constantes de faixa equivalentes a INVENTORY_FULL_RANGE/TRADE_RANGE/WAREHOUSE_RANGE e exponha `bool bWarehouseLoaded`, `bool bWarehouseLocked`, `bool bChaosLocked`, `bool bPersonalShopOpen` como UPROPERTY(Replicated).",
      "2. Declare RPCs Server `void ServerMoveItem(int32 SourceFlag, int32 SourceSlot, int32 TargetFlag, int32 TargetSlot, const TArray<uint8>& ItemInfo);` correspondendo ao C1:24. Valide `ItemInfo.Num()==12` e retorne se qualquer flag não estiver autorizada (por exemplo, Warehouse sem bWarehouseLoaded).",
      "3. Implemente um dispatcher em `ServerMoveItem` usando `switch`/`if` para cada combinação de SourceFlag/TargetFlag (Inventory→Inventory/Trade/Warehouse/Chaos/PersonalShop/Event/Muun; Trade→Inventory/Trade/Event; Warehouse→Inventory/Warehouse; Chaos→Inventory/Chaos; PersonalShop→Inventory/PersonalShop). Se alguma combinação não existir no código, logue 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' e rejeite.",
      "4. Para Trade, valide que o PlayerController mantém um estado `EInterfaceState::Trade` replicado e que o alvo ainda existe; para Warehouse, cheque `bWarehouseLocked` e `bWarehouseLoaded`; para Chaos/Trainer, valide um estado replicado `EInterfaceState::ChaosBox`/`Trainer`.",
      "5. Após mover, atualize o array replicado `InventorySlots` ou contêiner correspondente e dispare `ClientItemMoveResult` (Client, Reliable) com um `FItemPacketPayload` contendo ResultCode/TargetSlot/ItemInfo, substituindo PMSG_ITEM_MOVE_SEND.",
      "6. No Widget de inventário (`WBP_Inventory`), conecte arrastar/soltar ou cliques a `ServerMoveItem`, preenchendo SourceFlag/TargetFlag conforme aba ativa (inventário, trade, warehouse). Use Branch nodes para bloquear ações quando estados replicados indicarem lock ou interface diferente.",
      "7. No Character Blueprint, use `OnRep` para bChaosLocked/bPersonalShopOpen para desabilitar botões correspondentes. Se faltarem regras de bloqueio específicas, documente nos comentários a frase padrão e mantenha comportamento conservador (negar movimento)."
    ]
  },
  "server-mapitem-drop-lifecycle": {
    title: "Temporizar itens dropados no mundo",
    steps: [
      "1. Crie uma classe C++ `AWorldItem` (Add → New C++ Class → Actor). No `.h`, declare `UPROPERTY(Replicated)` `FItemData ItemData;`, `UPROPERTY(VisibleAnywhere)` `UStaticMeshComponent* Mesh;`, `UPROPERTY(Replicated)` `float LootExpireTime;` e `float LootProtectionTime;`. Marque `bReplicates=true` no construtor e em Class Defaults.",
      "2. No `.cpp`, implemente `void InitializeFromItem(const FItemData& Data, float DropDurationSeconds)` para copiar campos, definir `LootExpireTime=GetWorld()->GetTimeSeconds()+DropDurationSeconds` e `LootProtectionTime=GetWorld()->GetTimeSeconds()+DropDurationSeconds*0.5f` (espelhando m_Time e m_LootTime). Chame `SetReplicateMovement(true)` para sincronizar posição.",
      "3. Crie `UFUNCTION(NetMulticast, Unreliable)` `void MulticastPlaySpawnFX();` e chame efeitos de partícula/áudio (se inexistentes no código original, marque como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++'). Invocar após spawn para todos os clientes.",
      "4. Em um subsistema ou GameMode `UItemWorldSubsystem`, implemente `AWorldItem* SpawnWorldItem(const FItemData& Data, const FVector& Pos, float DurationSeconds);` que instancia AWorldItem, chama `InitializeFromItem` e retorna ponteiro armazenado em mapa `WorldItemId→Actor`.",
      "5. No tick server-side ou timer, percorra WorldItems e destrua aqueles cuja `LootExpireTime` foi ultrapassada; antes disso, permita coleta apenas se o solicitante for proprietário ou se `GetWorld()->GetTimeSeconds()>LootProtectionTime` para liberar para todos, replicando regras de m_LootTime.",
      "6. Conecte `ServerRequestDropItem` do guia de itens para chamar `SpawnWorldItem` com duração configurável (DataTable ou Config). Ao coletar, destrua o actor e envie `ClientItemGetResult` ao coletor.",
      "7. No Blueprint de inventário, exiba temporizadores se `AWorldItem` expuser `LootExpireTime` via interface BlueprintCallable; teste em PIE deixando itens no chão para confirmar expiração e liberação de loot antes da coleta."
    ]
  },
  "server-chaos-event-muun-move": {
    title: "Replicar Chaos Box, Event Inventory e Muun Inventory",
    steps: [
      "1. No componente `UInventoryComponent`, adicione arrays replicados separados: `TArray<FItemData> ChaosBoxSlots`, `EventInventorySlots`, `MuunInventorySlots`, cada um com tamanho definido por constantes equivalentes às macros CHAOS_BOX_SIZE/EVENT_INVENTORY_SIZE/MUUN_INVENTORY_SIZE. Declare `UPROPERTY(Replicated)` mapas de ocupação `TArray<uint8> ChaosMap`, `EventMap`, `MuunMap` se precisar espelhar os mapas do código.",
      "2. Declare RPC Server `void ServerMoveChaosEventMuun(int32 SourceFlag, int32 SourceSlot, int32 TargetFlag, int32 TargetSlot);` que será chamado pelo cliente quando mover itens nesses contêineres. Valide intervalos usando helpers que correspondam às macros INVENTORY_FULL_RANGE/CHAOS_BOX_RANGE/EVENT_INVENTORY_RANGE/MUUN_INVENTORY_RANGE; rejeite se `SourceSlot==TargetSlot`.",
      "3. Para Chaos Box, bloqueie quando expansões não estiverem habilitadas (equivalentes a ExtInventory<1..4) e quando uma função `CheckItemMoveToChaos(const FItemData&)` retornar falso (parâmetro para configurar em DataTable). Ao mover, copie o item, remova do inventário e atualize `ChaosBoxSlots[TargetSlot]`, disparando um OnRep para widgets de Chaos.",
      "4. Para Event Inventory, implemente um helper `bool TryStackEvent(int32 SourceSlot,int32 TargetSlot)` que soma quantidades e retorna falha quando não caber; se falhar, reverta os mapas como o código original faz. Em sucesso, marque mapas (0xFF para limpar source, 1 para ocupado target), movendo `EventInventorySlots` e notificando via `ClientEventInventoryChanged` (Client, Reliable).",
      "5. Para Muun Inventory, adicione validação `CheckItemMoveToMuunInventory` configurável e, quando o alvo for slot de equipar, recalcule uma variável replicada `FMuunPreviewData` no Character e chame um multicast `MulticastMuunChanged(int32 Slot)` para atualizar meshes/particles em todos os clientes.",
      "6. No UI Blueprint de cada aba (Chaos, Event, Muun), conecte arrastar/soltar ou botões para chamar `ServerMoveChaosEventMuun` com flags numéricas equivalentes; em OnRep dos arrays, reconstrua os itens. Documente com a frase padrão quaisquer flags ou tamanhos não dedutíveis.",
      "7. Teste em PIE movendo itens entre Inventário→Chaos, Event→Event e Muun→Muun para garantir que os mapas se mantêm consistentes e que a visualização Muun é atualizada via RPC multicast quando slots de equipar são usados."
    ]
  },
  "server-item-get-drop-conditions": {
    title: "Validar pegar e dropar itens",
    steps: [
      "1. No componente `UInventoryComponent`, declare RPCs `UFUNCTION(Server, Reliable)` `void ServerRequestGetWorldItem(int32 WorldItemId);` e `void ServerRequestDropItem(int32 Slot, const FVector& Pos);` que substituem os packets C1:22 e C1:23. Valide `bIsDead`, `bInTransaction`, `bInterfaceLock` replicados antes de prosseguir.",
      "2. Em `ServerRequestGetWorldItem`, recupere o actor `AWorldItem` do mapa `WorldItemId→Actor`; rejeite se for item de evento/Muun (flags no FItemData) ou se `QuestObjective` interno indicar excedente. Impedir anéis duplicados verificando `CountItem` pelo índice/nível. Para zen, aumente `Money` replicado e envie `ClientMoneySync` (Client, Reliable); para outros itens tente `TryStackItem` e, se falhar, insira em slot vazio e destrua o `AWorldItem`.",
      "3. Em `ServerRequestDropItem`, valide lock/estado de morte/duelo equivalentes e chame um helper `bool IsDropAllowed(const FItemData&)` que verifica flags `bLucky`, `bPeriodic`, filtros `gItemMove.CheckItemMoveAllowDrop` carregados em DataTable e limites de nível/opções. Se rejeitado, envie `ClientItemError` com a frase padrão.",
      "4. Quando o drop for permitido, remova o item do inventário, chame `SpawnWorldItem` (do guia de drop) com posição/tempo e chame `MulticastPlayDropFX`. Para itens especiais como mercenário ou life stone, documente com a frase padrão se não houver equivalente em UE.",
      "5. Atualize widgets após pegar/dropar usando OnRep do inventário e OnRep da moeda; utilize `GCPartyItemInfoSend` equivalente (Client RPC multicast opcional) se precisar notificar grupo sobre o item adquirido, anotando quando a necessidade não puder ser inferida.",
      "6. No UI (Widget de inventário), conecte botões de \"Pegar\" (em overlay de `AWorldItem`) para chamar `ServerRequestGetWorldItem` e botões de \"Dropar\" para chamar `ServerRequestDropItem` com `GetHitResultUnderCursor`. Teste cenários de anel duplicado e zen para confirmar a lógica."
    ]
  },

  "server-trade-flow": {
    title: "Fluxo de trade UE 5.7 sem packets legados (ordem cronológica)",
    steps: [
      "1. Após replicar inventário e moedas, crie componente `UTradeComponent` no PlayerController com `UPROPERTY(ReplicatedUsing=OnRep_TradeState)` contendo `TArray<FItemData> TradeSlots` (tamanho TRADE_BOX_SIZE), `int32 TradeZen`, `bool bTradeLocked` e `bool bTradeOk`.",
      "2. Adicione RPCs `UFUNCTION(Server, Reliable)` `void ServerRequestTrade(APlayerController* Target);`, `void ServerAcceptTrade();`, `void ServerMoveTradeItem(int32 FromSlot, int32 ToSlot);`, `void ServerSetTradeZen(int32 Amount);`, `void ServerLockTrade(bool bLock);` e `void ServerConfirmTrade(bool bOk);` substituindo os cabeçalhos C1:3C-3D. Cada RPC deve validar Authority, distância (LineTrace ou radius) e estados de UI antes de mutar TradeState.",
      "3. No GameMode, mantenha mapa de sessões de trade (`TMap<FString, FTradeSession>`) para parear iniciador e alvo; ao aceitar, inicialize TradeSlots vazios em ambos os componentes e limpe qualquer referência anterior. Registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' quando alguma regra de distância/estado não estiver explícita.",
      "4. Em `ServerMoveTradeItem`, remova itens do inventário replicado e insira em `TradeSlots`, usando helpers de empilhamento já criados; bloqueie quando bTradeLocked for true. Replica alterações com OnRep e chame RPC Client `ClientTradeItemMoved` para feedback.",
      "5. Em `ServerLockTrade`, marque `bTradeLocked` e envie RPC Client `ClientTradeLocked`. Quando ambos marcarem `bTradeLocked`, habilite o botão de confirmação (OK). Em `ServerConfirmTrade`, marque `bTradeOk`; quando ambos estiverem true, transfira itens/zen entre inventários, recalculando stacks e disparando OnRep para UI. Desfaça transação se algum slot não puder ser inserido, retornando erros via `ClientTradeError`.",
      "6. Blueprint/UI: crie Widget de trade com grids ligados a `TradeSlots` e `TradeZen`. Conecte botões para chamar os RPCs acima e use `OnRep_TradeState` para atualizar ícones/quantidades. Teste em ordem: solicitar trade → aceitar → mover itens → travar → confirmar → validar rollback/sucesso, sempre sem usar DataSend/DataRecv.",
      "7. Adicione logs de depuração em cada transição de estado usando `UE_LOG(LogTrade, Log, TEXT(...))` para facilitar a migração e substitua quaisquer chamadas `DataSend`/`GCTradeResultSend` por RPCs/replicação."
    ]
  },

  "client-mapserver-transition": {
    title: "Mudança de Map Server em UE 5.7 (sequência prática)",
    steps: [
      "1. Substitua `CSMServer::ConnectChangeMapServer` por um fluxo de nível/servidor em UE: no GameInstance, crie função `RequestMapTravel(const FServerTravelInfo& Info)` contendo Address/Port/LevelName/AuthToken e mantenha `CurrentMapServer` replicado via GameState para todos os clientes.",
      "2. Após login, quando o servidor desejar mover o jogador, chame RPC Client `ClientPrepareMapTravel(FServerTravelInfo Info)` no PlayerController. Esse RPC deve armazenar Info e apresentar um widget de carregamento, eliminando qualquer envio de cabeçalho BOTH_CONNECT_LOGIN ou chamadas `SendChangeMServer`.",
      "3. No lado servidor, valide que o jogador não está em trade/chaos/vault antes de autorizar a troca. Quando autorizado, use `ServerTravel` (para troca de mapa dedicada) ou `ClientTravel` (para mundos abertos) com parâmetros `?AuthToken=` derivados de Info.HeroKey/Index. Documente com a frase padrão quando alguma condição de bloqueio não estiver clara no código original.",
      "4. Ao carregar o novo mapa, no `GameMode::PostLogin`, replique `CurrentMapServer` e chame RPC Client `ClientSyncHeroContext` para reatribuir HeroID/Slot, recarregar inventário via `ClientReceiveInventory` e reconfigurar Buffs. Essa ordem substitui totalmente o handshake de reconexão com sockets e pacotes C1/C3/C4.",
      "5. Para transições rápidas (ex.: eventos), implemente `AsyncLoadLevel` com LevelStreaming e, ao concluir, teleporte o personagem server-side e atualize `CurrentMapServer`. Use NetMulticast `MulticastMapTransitionFX` para efeitos visuais, garantindo que nada dependa do sistema de packets legado.",
      "6. Teste em cronologia: (a) login inicial preenche CurrentMapServer, (b) servidor aciona `ClientPrepareMapTravel`, (c) fluxo de travel executa, (d) `PostLogin`/`BeginPlay` repopulam inventário/buffs, (e) verificações finais garantem que nenhum código chama WSclient ou ProtocolSend para mudar de mapa."
    ]
  },

  "server-warehouse-sync": {
    title: "Sincronizar Warehouse na UE 5.7 sem packets legados",
    steps: [
      "1. Crie um **Game Instance Subsystem** `UWarehouseSubsystem` (Add → New C++ Class → Game Instance Subsystem) para armazenar `TArray<FItemData> WarehouseSlots` do tamanho `WAREHOUSE_SIZE` e `int32 WarehouseMoney`, todos marcados como `UPROPERTY(Replicated)`. Implemente `GetLifetimeReplicatedProps` para esses campos.",
      "2. No PlayerController `ANetworkPC`, declare RPCs `UFUNCTION(Server, Reliable)` `void ServerRequestWarehouseOpen();`, `void ServerMoveWarehouseItem(int32 FromSlot, int32 ToSlot);` e `void ServerWarehouseDeposit(int32 InventorySlot, int64 Amount);` substituindo os pacotes C1:81/82 usados pelo código original.",
      "3. No `.cpp` do subsystem, implemente validadores equivalentes a `gWarehouse`: bloquear quando `bWarehouseLock` replicado estiver ativo, garantir que o personagem não esteja em trade/chaos/personal shop e checar rangos com helpers de `UInventoryComponent`. Quando faltar regra explícita no C++, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' e rejeite a operação.",
      "4. Crie RPC Client `UFUNCTION(Client, Reliable)` `void ClientWarehouseSync(const TArray<FItemData>& Slots, int64 Money);` e `void ClientWarehouseError(const FString& Reason);` para substituir PMSG_ITEM_WAREHOUSE_LIST_SEND e mensagens de erro; no handler server, chame o Client após qualquer operação.",
      "5. No Widget `WBP_Warehouse`, vincule botões Depositar/Retirar a chamadas BlueprintCallable que invocam os RPCs Server; ao receber `ClientWarehouseSync`, popular um GridPanel com os slots e atualizar texto de zen, mantendo a ordem cronológica: abrir → sincronizar → permitir mover/depositar → fechar.",
      "6. Teste em PIE com duas instâncias, abrindo o warehouse em uma e confirmando que mudanças replicam para o servidor e não usam `gWarehouse` ou buffers C1/C2; documente no Blueprint que todo fluxo usa RPCs/replicação nativa."
    ]
  },

  "server-item-shop-handlers": {
    title: "RPCs UE 5.7 para compra, venda e reparo de itens",
    globalOrderStep: 5,
    steps: [
      "1. No `UInventoryComponent`, declare `UFUNCTION(Server, Reliable)` `void ServerRequestBuyItem(int32 ShopSlot);`, `void ServerRequestSellItem(int32 InventorySlot);` e `void ServerRequestRepairItem(int32 InventorySlot, uint8 RepairType);` para substituir C1:32/33/34.",
      "2. No `.cpp`, em `ServerRequestBuyItem`, valide um estado `bShopOpen` replicado e um identificador de loja (substituindo TargetShopNumber). Use uma `TArray<FShopItemData>` carregada no GameMode para recuperar preço/ItemData e aplique taxa (DataTable/Config) equivalente a gCastleSiegeSync; se a regra de impostos não estiver clara, registre a frase padrão e use zero.",
      "3. Implemente dedução de moedas replicadas (`Zen`, `Coin1`, `Coin2`, `Coin3`) no PlayerState; utilize `FMath::Clamp` para evitar overflow e chame `OnRep`/widgets após atualizar. Se o item for empilhável, chame um helper `TryStackItem`; caso contrário, use `InventoryComp->SetItemAt`.",
      "4. Para venda, em `ServerRequestSellItem`, valide o slot com as mesmas checagens de INVENTORY_FULL_RANGE; consulte uma função `int32 GetSellValue(const FItemData&)` (mirroring gItemMove.CheckItemMoveAllowSell) e credite a moeda correspondente. Limpe o slot e chame `ClientConfirmSell` (Client, Reliable) para atualizar UI com novo saldo.",
      "5. Para reparo, implemente `ServerRequestRepairItem` aceitando `InventorySlot` ou `-1` para reparar todos. Aplique custo por item e recalcule atributos (chame `RecalculateStats()` no Character) após ajustar Durability; se algum cálculo estiver ausente no código, registre a frase padrão e pule o item.",
      "6. Crie Widgets UMG para loja: `WBP_Shop` com botões Buy/Sell/Repair. Nos OnClicked, chame as RPCs Server correspondentes passando o índice do slot e, em sucesso (Client RPC), atualize listas e saldos replicados.",
      "7. Marque `UInventoryComponent` e PlayerState como replicados. No Character Blueprint, defina **Replicates** e use `GetLifetimeReplicatedProps` para Zen/Coin1/Coin2/Coin3. Teste em PIE abrindo loja, comprando, vendendo e reparando para garantir sincronização sem enviar buffers.",
      "8. Documente em comentários que PMSG_ITEM_BUY_NEW e headers C1:32/33/34 são substituídos por essas RPCs; quando alguma regra de preço/tributo não for dedutível, anote 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' para revisão."
    ]
  },
  "server-party-guild-flow": {
    title: "Fluxo de Party e Guild na UE 5.7 (ordem cronológica)",
    steps: [
      "1. No GameMode `AUEProtocolRouter`, declare RPCs Server `void ServerPartyInvite(APlayerController* Target);`, `void ServerPartyResponse(APlayerController* Inviter, bool bAccept);`, `void ServerGuildRequest(const FText& GuildName);`, `void ServerGuildWarRequest(const FString& TargetGuild);` para substituir os casos 0x40-0x43 e 0x50-0x57 do ProtocolCore.",
      "2. Crie componentes replicados `UPartyComponent` e `UGuildComponent` anexados ao PlayerState com `UPROPERTY(Replicated)` para PartyId/GuildId/GuildStatus e arrays de membros. Implemente `GetLifetimeReplicatedProps` e eventos `OnRep_PartyMembers`/`OnRep_GuildMembers` para atualizar UI.",
      "3. No Server de convite, valide que nenhum dos jogadores está em duel/trade/chaos ou desconectado; se o código original tiver bloqueios adicionais não claros, registre a frase padrão de não inferência e retorne erro. Em sucesso, chame RPC Client `ClientReceivePartyInvite` no alvo.",
      "4. Para respostas, ao aceitar, atribua PartyId (por exemplo, GUID) e replique a lista para todos os membros via `NetMulticast` ou atualização das arrays replicadas; ao recusar, chame `ClientPartyInviteResult` apenas no convidador. Evite qualquer envio de cabeçalho C1/C3 usado no legado.",
      "5. No fluxo de guild, trate `ServerGuildRequest` como criação ou ingresso conforme contexto: valide requisitos de nível/reset disponíveis no código e, quando ausentes, registre a frase padrão e bloqueie. Use DataTables para armazenar regras e persistência via backend, não DataSend.",
      "6. Para guerras de guild (equivalente a 0x61/0x66), declare RPCs `ServerDeclareGuildWar` e `NetMulticast` `MulticastGuildWarState` atualizando HUDs. Ordem cronológica: (a) convidar/aceitar party, (b) criar/ingressar guild, (c) sincronizar membros, (d) habilitar guerra, sempre sem sistema de packets legado.",
      "7. Em UMG, crie widgets `WBP_Party` e `WBP_Guild` que leem as arrays replicadas nos componentes; em cada ação de botão, chame RPC Server correspondente. Teste com múltiplos clientes PIE garantindo que convites, entradas e guerras funcionem apenas com RPCs UE."
    ]
  },
  "server-pk-drop-system": {
    title: "Queda forçada de itens em mortes PK na UE",
    steps: [
      "1. No Character C++ (Player), adicione `UPROPERTY(Replicated)` `uint8 PKLevel` e `bool bAllowPkDrop` com `GetLifetimeReplicatedProps` usando `DOREPLIFETIME`; configure valores ao criar o pawn conforme regras do servidor original.",
      "2. Crie um componente ou função em GameMode `void HandlePkDeath(AUECharacter* Dead, AUECharacter* Killer);` chamada no evento de morte; valide `bAllowPkDrop`, `PKLevel>=6` e restrições de mapa (ex.: `AllowedMaps` DataTable). Se alguma regra estiver ausente, logue a frase padrão e retorne.",
      "3. Para selecionar o item, percorra `InventoryComp->InventorySlots` priorizando slots 0-11 (equipamentos) e depois mochila, respeitando filtros de exclusão (ex.: se Index corresponde a itens bloqueados). Caso não haja item elegível, finalize sem drop.",
      "4. Construa um `FItemData` com o slot escolhido, remova-o do inventário e chame função server `SpawnWorldItem` (do guia de itens) para criar `AWorldItem` na posição do personagem morto; chame `MulticastPlayDropFX` para mostrar efeito.",
      "5. Notifique o jogador via `UFUNCTION(Client, Reliable)` `void ClientPkDropLog(const FString& ItemName);` para espelhar os logs `LogAdd` do servidor original; atualize UI de inventário através de OnRep/Widgets.",
      "6. Em testes PIE, force PKLevel alto e provoque morte para validar que apenas um item cai e que regras de bloqueio são respeitadas; registre em comentários quando detalhes de exclusão não puderem ser inferidos."
    ]
  },
  "server-pentagram-system": {
    title: "Pentagram e joias elementais sem packets legados",
    globalOrderStep: 11,
    steps: [
      "1. Crie DataTables UE para `PentagramType`, `PentagramOption`, `PentagramJewelOption`, `PentagramJewelRemove` e `PentagramJewelUpgrade` replicando os campos carregados por Load/LoadJewel/LoadMixRate (Index, OptionIndex/Value, Rank/Level arrays, MixRate). Marque em comentários qualquer campo cujo significado não esteja claro com 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "2. No componente `UInventoryComponent` (replicado), adicione arrays `TArray<FPentagramJewelInfo> InventoryPentagramInfo` e `TArray<FPentagramJewelInfo> WarehousePentagramInfo` com tamanho MAX_PENTAGRAM_JEWEL_INFO. Crie `USTRUCT` FPentagramJewelInfo com campos Type/Index/Attribute/ItemSection/ItemType/ItemLevel/OptionIndexRank[1..5]/OptionLevelRank[1..5] espelhando PENTAGRAM_JEWEL_INFO. Marque como `UPROPERTY(Replicated)` e implemente `GetLifetimeReplicatedProps`.",
      "3. Declare RPCs Server: `ServerInsertPentagramJewel(int32 TargetSlot,int32 SourceSlot);`, `ServerRemovePentagramJewel(int32 SourceSlot,uint8 SocketSlot);`, `ServerRefinePentagram(uint8 MixType);` e `ServerUpgradePentagram(uint8 MixType,uint8 Info);` substituindo os packets C1:EC:00/01/02/03. Em cada RPC, valide conexão/locks equivalentes (IsDead, bInPShop, ChaosLock) e ranges de slot (funções helper para INVENTORY_BASE_RANGE e CHECK_RANGE).",
      "4. Na lógica de inserção, verifique se TargetSlot contém item Pentagram (faixa GET_ITEM(12,200-220)) e SourceSlot contém joia (12,221-261), calcule SocketSlot = (ItemIndex-221)/10 e confirme que `SocketOption[SocketSlot]==0xFE` e que `SocketOptionBonus` bate com o atributo. Em sucesso, registre o jewel info na array replicada e grave o índice no slot do item; dispare `OnRep_PentagramSlots` ou RPC Client `ClientPentagramInserted` para atualizar UI. Caso qualquer validação falhe, retorne com erro sem modificar estado.",
      "5. Para remoção, busque o FPentagramJewelInfo correspondente ao índice armazenado no socket; valide espaço livre em inventário antes de criar o item. Aplique MixRate por atributo (usar DataTable PentagramJewelRemoveInfo) para decidir entre sucesso (spawn item de joia) ou falha (apenas limpar slot). Use `ServerSpawnWorldItem` ou inserção direta no inventário e chame um RPC Client para resultado. Em todos os casos, limpe `SocketOption[SocketSlot]=0xFE` e remova o registro replicado.",
      "6. Em `ServerRefinePentagram`, bloqueie quando ChaosLock/PShop estiverem ativos, zere variáveis de mix e roteie para funções específicas (mithril/elixir/jewel/decomposite) que consumam ChaosBox slots replicados; use timers/async se o mix tiver duração, e em sucesso/falha notifique via `ClientPentagramMixResult`. Para upgrade (MixType level/rank), siga sequência similar e aplique custos a moedas replicadas. Quando qualquer regra de custo/duração não estiver no código, marque com a frase padrão.",
      "7. Exponha um RPC Client `ClientSyncPentagramJewelInfo(TArray<FPentagramJewelInfo> Info, uint8 Type)` equivalente ao envio C1:EE:01 para povoar UI ao entrar no jogo. No Widget de Pentagram, no Event Construct, chame esse RPC ou leia OnRep das arrays replicadas para mostrar joias equipadas e atributos.",
      "8. No Blueprint do personagem, marque **Replicates** e adicione lógica visual opcional para representar o atributo elemental (material parameter ou particle). Qualquer parte estética não presente no código deve ser rotulada como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++'. Teste em PIE a ordem: carregar DataTables → replicar info → inserir joia → remover joia → refino/upgrade, sem enviar buffers manuais."
    ]
  },
  "server-item-require-checks": {
    title: "Validar requisitos de item e slots no servidor UE",
    steps: [
      "1. No componente `UInventoryComponent` (replicado), implemente helpers C++ `bool CheckRequirements(const FItemData& Item) const` verificando Level/Strength/Dexterity/Vitality/Energy/Leadership replicados do Character/PlayerState antes de equipar. Inclua classe/personagem com DataTable equivalente a RequireClass; se os requisitos de classe não puderem ser mapeados, registre a frase padrão.",
      "2. Adicione `bool CanMoveToSlot(const FItemData& Item, int32 TargetSlot, int32 CurrentSlot)` que replica as regras de mão dupla (slots 0/1 e 10/11), bloqueio de montarias em mapas específicos e duplicidade de rings; defina tabelas `TSet<int32>` para índices proibidos em mapas (ex.: Atlans) e verifique pares de slot.",
      "3. Em RPCs `ServerMoveItem`/`ServerEquipItem`, chame `CheckRequirements` e `CanMoveToSlot` antes de alterar arrays replicados; se falhar, retorne via `ClientItemError` (Client, Reliable) sem modificar estado.",
      "4. Para bloqueios de trade/vault/chaos, crie enums `EItemMoveContext { Inventory, Trade, Vault, Chaos }` e função `bool CanMoveInContext(const FItemData&, EItemMoveContext)` que checa flags de periodicidade, Lucky/Pentagram e bloqueios de segurança (`bLock`, `bInTrade`). Mantenha arrays de configuração no GameMode ou DataTable para replicar gServerInfo/gItemMove filtros; caso algum filtro não esteja no código, documente como sugestão genérica.",
      "5. Exponha `CheckRequirements` e `CanMoveToSlot` para Blueprints (`BlueprintCallable`) para que widgets validem antes de chamar RPCs, evitando enviar comandos inválidos.",
      "6. Teste em PIE equipando itens incompatíveis e movendo-os entre contêineres; confirme que o servidor rejeita e envia mensagens de erro replicadas ao cliente sem alterar o inventário." 
    ]
  },
  "server-item-move-allowlist": {
    title: "Permissões de drop/venda/troca/vault por item na UE",
    steps: [
      "1. Crie um DataTable `FItemMoveRule` com campos `ItemIndex`, `bAllowDrop`, `bAllowSell`, `bAllowTrade`, `bAllowVault` correspondentes a ITEM_MOVE_INFO. Carregue-o no GameMode em BeginPlay.",
      "2. No `UInventoryComponent`, mantenha um ponteiro para essas regras e implemente `bool IsActionAllowed(const FItemData&, EItemMoveAction Action)` com switch para Drop/Sell/Trade/Vault, retornando falso se o índice não existir ou se o flag for 0.",
      "3. Antes de executar RPCs `ServerDropItem`, `ServerSellItem`, `ServerTradeItem`, `ServerStoreVault`, chame `IsActionAllowed`; se negar, retorne via `ClientItemError` e não altere estado.",
      "4. Para venda, exponha os flags ao UI (BlueprintCallable) para desabilitar botões quando `bAllowSell` for falso. Para drop, faça o mesmo em widgets de confirmação de drop.",
      "5. Documente em comentários que isso substitui gItemMove.CheckItemMoveAllow* e que qualquer regra ausente deve ser marcada com 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'."
    ]
  },
  "server-item-stack-config": {
    title: "Regras de empilhamento e criação de item na UE",
    steps: [
      "1. Defina um `USTRUCT` `FItemStackRule` com `int32 ItemIndex`, `int32 MaxStack`, `int32 CreateItemIndex`. Carregue um DataTable no GameMode para popular um `TMap<int32, FItemStackRule>`.",
      "2. No `UInventoryComponent`, implemente `int32 GetMaxStack(int32 ItemIndex)` e `int32 GetCreateItemIndex(int32 ItemIndex)` lendo o mapa; exponha como BlueprintCallable para UI.",
      "3. Em `ServerAddItem`/`ServerMoveItem`, antes de adicionar ao slot, chame um helper `bool TryStackItem(int32 TargetSlot, const FItemData& Incoming)` que soma `Quantity` até `MaxStack` e, se exceder, gera novo item baseado em `CreateItemIndex` quando aplicável; se não houver regra, mantenha comportamento original e marque a lacuna com a frase padrão.",
      "4. Replicação: marque `InventorySlots` como `UPROPERTY(ReplicatedUsing=OnRep_Inventory)` e, no OnRep, atualize widgets de quantidade. Use RPC Client `ClientStackMerged` para feedback visual quando pilhas são fundidas.",
      "5. Teste em PIE adicionando itens repetidos e verificando que a UI soma quantidades e cria itens derivados quando MaxStack é atingido."
    ]
  },
  "server-item-stack-operations": {
    title: "Fusão e consumo de pilhas na UE 5.7 em ordem cronológica",
    steps: [
      "1. Após carregar o DataTable de stack, garanta que `FItemData` tenha campo `Quantity` (ou reuse Durability para stacks) e esteja replicado em `UInventoryComponent` com `ReplicatedUsing=OnRep_Inventory`.",
      "2. Implemente helper C++ `bool TryMergeIntoSlot(int32 TargetSlot, FItemData& Incoming, bool& bCreatedBonus)` que verifica se o slot alvo contém mesmo Index/Level/SocketBonus, soma Quantity até MaxStack e, se atingir o limite e existir CreateItemIndex, remove a pilha e chama um factory para gerar novo item em outro slot ou no chão. Retorne falso se MaxStack<=0 ou tipos divergentes.",
      "3. Em `ServerAddItem` (pickup/drop) e `ServerMoveItem`, chame `TryMergeIntoSlot` antes de ocupar um slot vazio. Se `Incoming.Quantity` zerar, remova o item de origem e invoque RPC Client `ClientStackMerged(TargetSlot, bCreatedBonus)` para feedback. Não use packets legados.",
      "4. Crie função `void ConsumeItemCount(int32 ItemIndex, int32 Level, int32 Count)` no servidor que percorre inventário replicado e consome stacks ou itens avulsos replicando `DeleteInventoryItemCount`; atualize Quantities e remova slots vazios, chamando OnRep para atualizar UI. Use frases de impossibilidade quando regras adicionais não estiverem no código.",
      "5. No parsing de drops/loja (equivalente a ConvertItemByte), aplique clamp: `Quantity = FMath::Min(Quantity, MaxStack)` para evitar pilhas acima do limite ao criar `FItemData`.",
      "6. Blueprint: no widget de inventário, ao arrastar um item sobre outro idêntico, chame `ServerMoveItem` e deixe o servidor decidir fusão; em OnRep/ClientStackMerged, atualize contadores visuais. Adicione mensagens quando CreateItemIndex gerar item bônus.",
      "7. Ordem cronológica sugerida: (a) DataTable/serviço de stack carregado, (b) campo Quantity replicado em FItemData, (c) helpers TryMerge/Consume implementados, (d) integração nos RPCs de pickup/move/compras, (e) clamps em factories de item, (f) UI com feedback. Quando a ordem depender de regra ausente, registre a frase padrão."
    ]
  },
  "server-inventory-equipment-effects": {
    title: "Ativar/desativar efeitos de inventário estendido na UE 5.7 sem packets",
    globalOrderStep: 9,
    steps: [
      "1. Depois de implementar inventário/equipamentos replicados, crie um `USTRUCT(BlueprintType)` `FEquipmentEffectItem` com `int32 ItemIndex` e `bool bActive`. Mantenha um `TArray<FEquipmentEffectItem>` em um componente `UInventoryComponent` marcado como `UPROPERTY(ReplicatedUsing=OnRep_EquipmentEffects)`.",
      "2. No componente, adicione `UFUNCTION(Server, Reliable)` `void ServerToggleEquipmentEffect(int32 SlotIndex, bool bActivate);` substituindo o packet C1:BF:20. No corpo, valide `HasAuthority()`, range de slot (ignorar INVENTORY_WEAR_RANGE) e confirme que o item pertence ao intervalo GET_ITEM(13,128-134). Quando regras específicas não existirem, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "3. Se `bActivate` for true, verifique que o item não está com durabilidade zero e marque bActive no array replicado; chame função `ApplyEquipmentEffect` que consulta um DataTable de efeitos (Index→EffectId/StatDelta) e aplica atributos ou buffs via AbilitySystem ou variáveis replicadas. Caso o DataTable não tenha definição, insira comentários com a frase padrão.",
      "4. Se `bActivate` for false, chame `RemoveEquipmentEffect` para remover buffs/atributos e marque bActive como false. Em ambos os casos, chame `OnRep_EquipmentEffects` para clientes atualizar UI e efeitos visuais (ex.: desativar partículas anexadas ao personagem) via Blueprint.",
      "5. No `BeginPlay` do componente (server), percorra slots INVENTORY_WEAR_SIZE..INVENTORY_EXT4_SIZE verificando itens 13,128-13,134 para popular o array e reaplicar efeitos em sessões restauradas, espelhando InsertInventoryEquipment. Use Timer periódico (ex.: 5s) para revisar itens ativos e remover efeitos se o item sumir, replicando a lógica de MainProc/CheckInventoryEquipment.",
      "6. No Widget de inventário, adicione um botão ou toggle por slot desses itens. No Event Graph, ao clicar, chame `ServerToggleEquipmentEffect` com SlotIndex e estado desejado; use Branch para bloquear quando o item não corresponder ao intervalo permitido. Registre mensagens na UI usando nós de texto quando o servidor retornar erro.",
      "7. Ordem cronológica recomendada: (a) finalizar inventário replicado e DataTables de efeitos, (b) criar struct/array `FEquipmentEffectItem`, (c) implementar RPC Server/OnRep e funções Apply/Remove, (d) adicionar Timer de revisão, (e) conectar UI. Se alguma etapa depender de regra não dedutível, inclua a frase padrão e marque como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++'."
    ]
  },
  "server-socket-item-type": {
    title: "Limites de sockets por item na UE (ordem cronológica)",
    steps: [
      "1. Antes de gerar opções de item, crie um DataTable `FSocketItemTypeRow` com `ItemIndex` e `MaxSocket` refletindo SocketItemType.txt. Carregue-o no GameInstance/Subsystem em BeginPlay e preencha um `TMap<int32, int32>`.",
      "2. No serviço já usado para MakeSocketOption (ex.: `UItemOptionRateService`), injete o mapa de MaxSocket e exponha `int32 GetMaxSocket(int32 ItemIndex) const` retornando 0 quando não houver linha (registrando 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++').",
      "3. Em qualquer fábrica de item (drops, lojas, Moss Merchant), antes de preencher sockets, chame `GetMaxSocket` e limite o tamanho do array de sockets replicado para `MaxSocket`, preenchendo 0xFE nos demais.",
      "4. No `UInventoryComponent`, ao equipar ou receber itens replicados, valide que o número de sockets não ultrapassa `MaxSocket`; se ultrapassar, rejeite e logue a frase padrão.",
      "5. Em widgets de tooltip, leia `MaxSocket` e exiba o número máximo suportado; como feedback opcional, destaque itens sem entrada de tabela como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'."
    ]
  },
  "server-item-value": {
    title: "Avaliação de itens e moedas na UE (sequência guiada)",
    steps: [
      "1. Crie DataTable `FItemValueRow` com campos `ItemIndex`, `Level`, `Grade`, `Value`, `Coin1`, `Coin2`, `Coin3`, `Sell` alinhados a ITEM_VALUE_INFO. Carregue em um `UItemValueService` inicializado após os serviços de stack e socket.",
      "2. No serviço, implemente `bool GetItemValue(const FItemData&, int32& OutValue)` que aplica multiplicador de quantidade/durabilidade para itens empilháveis; quando não houver linha aplicável, retorne false e registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "3. Implemente `bool GetItemValueDetailed(const FItemData&, int32& OutValue, int32& OutCoin1, int32& OutCoin2, int32& OutCoin3, int32& OutSell)` respeitando combinatória de Level/Grade ou curingas (-1).",
      "4. Nos RPCs Server de vender/descartar/comprar, consulte `GetItemValueDetailed` antes de debitar/adicionar moedas e envie RPC Client de resultado; não use packets legados.",
      "5. Em UI de venda (Widget), no Event Graph, ao selecionar um item, chame função BlueprintCallable que consulta o serviço e exibe Value/CoinX; se retornar false, mostre a frase padrão e bloqueie a ação."
    ]
  },
  "server-item-value-trade": {
    title: "Validação de moedas em troca na UE sem packets",
    steps: [
      "1. Depois de carregar ItemValueService, estenda `UInventoryComponent` com RPC `UFUNCTION(Server, Reliable)` `void ServerValidateTrade(const TArray<FItemData>& OfferedItems, APlayerState* Target);` para substituir CheckItemValueTrade.",
      "2. No corpo, some Value/Coin1-3 usando ItemValueService; para itens empilháveis use `Quantity` como durabilidade. Compare com `Money` e moedas replicadas do PlayerState de cada lado; se faltar, chame RPC Client `ClientTradeRejected` com código descritivo.",
      "3. Se válido, debite moedas/zen replicados (ex.: `ModifyMoney(-Money)` no PlayerState) e finalize a troca movendo itens via funções já replicadas de inventário, sem qualquer serialização de packet.",
      "4. No Widget de Trade, ao aceitar, chame `ServerValidateTrade` passando a lista de itens ofertados; em OnRep das moedas/zen atualize a UI.",
      "5. Registre sempre a frase padrão quando alguma moeda ou condição da troca não puder ser deduzida do código legado."
    ]
  },
  "server-personal-shop": {
    title: "Loja pessoal replicada na UE 5.7 (ordem cronológica)",
    steps: [
      "1. Após ter o `UInventoryComponent` replicado e o serviço de valor de item disponível, adicione a classe C++ `UPersonalShopComponent` (ActorComponent replicado) anexada ao Character. Declare `UPROPERTY(Replicated)` flags `bShopOpen`, `FString ShopText`, e arrays de preços por slot: `TMap<int32, int32> ZenPrices` e `TMap<int32, FIntVector> JewelPrices` (X=JoB, Y=JoS, Z=JoC).",
      "2. Implemente RPC `UFUNCTION(Server, Reliable)` `void ServerSetShopPrice(int32 Slot, int32 Zen, int32 JoB, int32 JoS, int32 JoC);` validando Authority, slot válido, item existente no inventário, ao menos um preço >0 (espelhando m_PShopValue/m_PShopJo*), e `Level>5` do Character. Grave nos mapas e marque `bShopOpen` como false se necessário; invoque `OnRep` para atualizar UI.",
      "3. Adicione RPC `UFUNCTION(Server, Reliable)` `void ServerOpenShop(const FString& Text);` que verifica flags de mapa proibido (DataTable de CA/CC/IT), ausência de Trade/Interface ativa e nível >5 antes de setar `bShopOpen=true`, copiar `ShopText` e fazer `OnRep` para todos. Para fechar, RPC `ServerCloseShop()` limpa `bShopOpen` e texto. Substitui CGPShopOpen/CloseRecv.",
      "4. Para listar itens de outro jogador, crie RPC `UFUNCTION(Server, Reliable)` `void ServerRequestShopList(APlayerState* ShopOwner);` que valida se o alvo está aberto e não em transação. No sucesso, envie RPC Client `ClientReceiveShopList` com snapshot dos slots/preços e `ShopText`, substituindo GCPShopItemListSend.",
      "5. Compra: implemente RPC `UFUNCTION(Server, Reliable)` `void ServerBuyShopItem(APlayerState* ShopOwner, int32 Slot);` que valida conexão, preço configurado, item existente, saldo de zen/moedas (usando ItemValueService e preços recebidos), filtros opcionais de joias (`GetRequireJewelCount/PaymentJewelCount` equivalentes) e `bInTransaction` no vendedor. Se válido, use `InventoryComponent->TryAddItem` para comprador, debite zen/joias do comprador, compute comissão (`PersonalShopMoneyCommissionRate/JewelCommissionRate` configuráveis) e credite vendedor; remova o item do vendedor e marque replicação. Use RPC Client `ClientShopResult` para ambos com códigos de erro/sucesso em ordem cronológica de validação.",
      "6. No Widget UMG de loja pessoal, adicione botões 'Definir Preço', 'Abrir/Fechar' e uma lista de slots do vendedor. No Event Graph, `OnClicked` de 'Definir Preço' chama `ServerSetShopPrice`; 'Abrir' chama `ServerOpenShop`; ao clicar em item listado de outro jogador, chame `ServerBuyShopItem`. Bind `OnRep` de `UPersonalShopComponent` para atualizar UI.",
      "7. Adicione `NetMulticast` opcional `MulticastShopAnnouncement` para exibir ícone/efeito em players com loja aberta (sugestão genérica se não houver efeito no código). Teste cronologicamente: (a) definir preço, (b) abrir loja, (c) listar em outro cliente, (d) comprar e validar transferências/fechamento automático sem qualquer packet legado."
    ]
  },
  "server-item-option-rate": {
    title: "Importar taxas de opção e gerar opções na UE (ordem cronológica)",
    steps: [
      "1. No Content Browser, **Add → New C++ Class → None** e crie `UItemOptionRateService`. Este será carregado antes de qualquer drop/loja para manter a cronologia de dados.",
      "2. No `.h`, declare `USTRUCT(BlueprintType) FItemOptionRateRow { GENERATED_BODY() int32 Index; TArray<int32> Rates; };` e `UDataTable* OptionTables[7];` (0-6) para espelhar as seções do Load. Adicione `bool LoadTables();`.",
      "3. No `.cpp`, em `LoadTables`, para cada seção 0-6 carregue o DataTable correspondente (Paths em Config) e preencha `TMap<int32, FItemOptionRateRow>`; se faltar tabela, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "4. Implemente helpers `uint8 GetItemOptionN(int32 Section, int32 Index)` que usam um `FRandomStream` e `Rates` como pesos, equivalente a CRandomManager.AddElement/GetRandomElement.",
      "5. Crie `uint8 MakeNewOption(int32 ItemIndex, int32 Value)` aplicando limites (asas dinorant/fenrir etc.) conforme MakeNewOption; quando um caso não aparecer na tabela, registre a frase padrão antes de retornar Value clampado.",
      "6. Crie `uint8 MakeSetOption(int32 ItemIndex, int32 Value)` espelhando a combinação de índice e bit 4*value; para itens sem set conhecido, retorne 0 com a frase padrão em log.",
      "7. Crie `void MakeSocketOption(int32 ItemIndex, int32 Value, TArray<uint8>& OutSockets)` preenchendo 0xFE até o máximo suportado; se MaxSocket não estiver definido, limite a Value e logue a ausência.",
      "8. No GameMode ou Subsystem de drops, instancie `UItemOptionRateService` em BeginPlay (ordem inicial), chame `LoadTables` e armazene ponteiro em Singleton acessível por serviços de drop/loja/lucky item.",
      "9. Compile e teste em PIE criando um item de teste chamando `GetItemOptionN` e `MakeNewOption` a partir de um comando de console Blueprint, validando que pesos e limites são aplicados antes de qualquer spawn."
    ]
  },
  "server-lucky-item-options": {
    title: "Replicar Lucky Items e regeneração na UE (sequência guiada)",
    steps: [
      "1. Após configurar `UItemOptionRateService`, crie `USTRUCT(BlueprintType) FLuckyItemInfo` com campos Option0-6 e Decay. Carregue um DataTable em um `ULuckyItemService` inicializado logo após o serviço de opções.",
      "2. No `.h` de `ULuckyItemService`, exponha `FLuckyItemInfo* FindLuckyInfo(int32 ItemIndex)` e funções BlueprintCallable `uint8 RollLuckyOptionN(int32 ItemIndex, int32 Section)` que delegam para o serviço de taxas.",
      "3. No `UInventoryComponent`, adicione RPC `UFUNCTION(Server, Reliable)` `void ServerRegenerateLuckyItem(int32 SlotIndex);` para substituir CharacterUseJewelOfElevation. Implemente chamando HasAuthority, validando se o slot contém Lucky e invocando `Regenerate` no serviço, atualizando durabilidade para valor máximo replicado.",
      "4. Marque o array de itens como `UPROPERTY(ReplicatedUsing=OnRep_Inventory)` e em `OnRep` notifique a UI para atualizar durabilidade/visual do slot.",
      "5. No Blueprint do inventário, crie um botão 'Regenerar Lucky' que chama `ServerRegenerateLuckyItem` passando o Slot selecionado. Use nós `Branch` para exibir mensagens se não for Lucky (logando a frase padrão se necessário).",
      "6. Para efeitos visuais, adicione `UFUNCTION(NetMulticast, Reliable)` `void MulticastLuckyRefreshFX(int32 SlotIndex);` no componente e invoque após a regeneração para tocar partículas/sons (marcar como sugestão genérica quando o código não detalhar FX).",
      "7. Compile e execute dois clientes PIE verificando replicação da durabilidade e atualização visual sem qualquer uso de packets do legado."
    ]
  },
  "server-lucky-item-decay-sync": {
    title: "Persistência e sincronização de Lucky Items na UE (ordem cronológica)",
    steps: [
      "1. Depois de carregar `ULuckyItemService`, crie um **SaveGame** ou serviço backend `ULuckyItemPersistenceService` com um array `FLuckyItemPersist` (Slot, Serial, DurabilitySmall, ItemIndex). Marque o serviço para iniciar antes do login do jogador, substituindo o tráfego C2:22:00/30.",
      "2. No `UInventoryComponent`, adicione `UPROPERTY(Replicated)` `TArray<FLuckyItemPersist> LuckySnapshot` para armazenar os dados recebidos do serviço. Exponha `BlueprintCallable` `void ApplyLuckySnapshot(const TArray<FLuckyItemPersist>& Data);` que percorre o inventário replicado, valida serial e Lucky antes de aplicar `DurabilitySmall` semelhante a DGLuckyItemRecv.",
      "3. Implemente RPC `UFUNCTION(Server, Reliable)` `void ServerSyncLuckyItems();` chamado no BeginPlay do Character após o inventário base estar carregado. No corpo, consulte o serviço de persistência e chame `ClientReceiveLuckySnapshot` (Client, Reliable) enviando o array `FLuckyItemPersist` para popular `LuckySnapshot` e atualizar durabilidade dos slots. Nenhum packet legado deve ser usado.",
      "4. Adicione RPC `UFUNCTION(Server, Reliable)` `void ServerUseJewelOfExtension(int32 SourceSlot, int32 TargetSlot);` que replica CLuckyItem::CharacterUseJewelOfExtension: valida ranges, existência de itens, `IsLucky`, e durabilidade !=0/255 antes de setar durabilidade máxima e reconverter o item. Após a atualização, invoque `MulticastLuckyRefreshFX` (NetMulticast) opcional para feedback visual.",
      "5. Para salvar periodicamente, crie função `void CollectLuckySnapshot()` no componente que itera o inventário replicado, filtra Lucky e registra Slot/Serial/DurabilitySmall. No logout/desconexão (GameMode `Logout` ou GameInstance `OnEndPlay`), chame o serviço de persistência para gravar estes dados (SaveGame ou backend), substituindo GDLuckyItemSend/GDLuckyItemSaveSend.",
      "6. No Widget de inventário, adicione botão 'Sincronizar Lucky' que chama `ServerSyncLuckyItems` e, ao receber `ClientReceiveLuckySnapshot`, percorre dados e atualiza barras de durabilidade na UI. Acrescente mensagens de erro com a frase padrão quando faltar serial/dado necessário.",
      "7. Ordem cronológica sugerida: (a) criar structs e serviço de persistência, (b) replicar `LuckySnapshot` no inventário, (c) implementar RPC de sincronização na entrada, (d) implementar uso da Jewel of Extension, (e) adicionar coleta/salvamento na saída, (f) ligar UI de sincronização e FX. Se alguma ordem não puder ser inferida, registre a frase padrão." 
    ]
  },
  "server-harmony-options": {
    title: "Aplicar e refinar Jewel of Harmony na UE 5.7 (ordem cronológica)",
    steps: [
      "1. Após carregar serviços de ItemOptionRate e ItemInfo, crie um **Blueprint Struct** `FHarmonyOptionRow` com campos `int32 Index`, `int32 Rate`, `int32 Level`, `TArray<int32> ValueTable`, `TArray<int32> MoneyTable`, `EItemHarmonyType Type` (Weapon/Staff/Armor). Gere DataTable `DT_HarmonyOptions` espelhando o script lido em CJewelOfHarmonyOption::Load; se faltar alguma linha, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "2. Crie um **Game Instance Subsystem** `UHarmonyOptionService` com `TMap<EItemHarmonyType, TMap<int32, FHarmonyOptionRow>> OptionMap` e métodos `void LoadFromTable(UDataTable*); int32 GetRestoreMoney(const FItemData& Item); uint8 RollHarmonyOption(const FItemData& Item);`. Em `RollHarmonyOption`, replique os filtros do código (ignorar sockets, checar Level e RequireStrength/Dexterity > 0 para sub require).",
      "3. No `UInventoryComponent`, adicione RPC `UFUNCTION(Server, Reliable)` `void ServerApplyHarmony(int32 SourceSlot, int32 TargetSlot);` que verifica autoridade, se SourceSlot tem Jewel/SmeltStone e TargetSlot contém item elegível (não Set, não Socket, não Lucky salvo para Elevation). Consulte `UHarmonyOptionService` para `RollHarmonyOption`, e aplique `ItemData.HarmonyOption = (Option << 4) | Level` usando taxa configurada (exponha `HarmonySuccessRate` em Config).",
      "4. Adicione RPC `UFUNCTION(Server, Reliable)` `void ServerSmeltHarmony(int32 SourceSlot, int32 TargetSlot);` que valida item Harmony existente, confere nível < 13 e escolhe taxa conforme SmeltStone usada. Em sucesso incremente nível, caso contrário resete para nível base da tabela. Atualize o item replicado e chame `ClientHarmonyResult` (Client, Reliable) com códigos equivalentes aos resultados do servidor. Em falta de regra, retorne a frase padrão.",
      "5. Adicione RPC `UFUNCTION(Server, Reliable)` `void ServerApplyElevation(int32 SourceSlot, int32 TargetSlot);` específico para Lucky Items, limitando nível ao mínimo entre 13 e Level do item, usando a mesma taxa de sucesso. Em falha, apenas registre mensagem e mantenha o item.",
      "6. No Character/PlayerState, implemente `void RecalculateHarmonyOptions(bool bRemove=false);` percorrendo equipamentos replicados (`INVENTORY_WEAR_SIZE` equivalente) e consultando `UHarmonyOptionService` para `FHarmonyOptionRow`. Para cada item Harmony, aplique `ValueTable[Level]` em atributos replicados (PhysiDamage, MagicDamage, CriticalDamage, SkillDamageBonus, Defense, AddBP, AddLife, HPRecovery, MPRecovery, DefenseSuccessRatePvP, DamageReduction, ShieldGaugeRate, IgnoreShieldGaugeRate) usando funções helper; se um atributo não existir, logue a frase padrão e pule.",
      "7. Em Blueprints do inventário, adicione botões 'Aplicar Harmony', 'Smelt' e 'Elevation'. No Event Graph, use `OnClicked` → `ServerApplyHarmony/ServerSmeltHarmony/ServerApplyElevation` com os slots selecionados. Use `Branch` para checar códigos retornados via `ClientHarmonyResult` e exibir mensagens equivalentes (sucesso, falha, item inválido).",
      "8. Configure **Replicates** no Character e marque `InventoryComponent` como `ReplicatedUsing=OnRep_Inventory`. Na função `OnRep`, chame `RecalculateHarmonyOptions` para atualizar atributos locais. Teste cronologicamente: (a) carregar tabelas, (b) aplicar Harmony, (c) smelt até nível 13, (d) aplicar em Lucky Items com Elevation, (e) verificar replicação entre dois clientes PIE sem qualquer packet legado."
    ]
  },
  "server-custom-jewel": {
    title: "Aplicar Custom Jewel em ordem cronológica na UE 5.7 (sem packets)",
    steps: [
      "1. Antes de quaisquer RPCs de inventário, crie um **Blueprint Struct** `FCustomJewelRow` com os campos de CUSTOM_JEWEL_INFO: Index, ItemIndex, MinItemLevel, MaxItemLevel, MaxItemOption1, MaxItemOption2, MinItemOption3, MaxItemOption3, MinItemNewOption, MaxItemNewOption, MaxItemSetOption, MinItemSocketOption, MaxItemSocketOption, EnableSlotWeapon/Armor/Wing, SuccessRate[4], SalePrice, ModelName e structs aninhados `FCustomJewelSuccessInfo`/`FCustomJewelFailureInfo` contendo Level/Option1/Option2/Option3/NewOption/SetOption/SocketOption. Importe um DataTable `DT_CustomJewel` com esses campos replicando CustomJewel.txt.",
      "2. Crie um **Game Instance Subsystem** `UCustomJewelService` inicializado após os serviços de ItemOptionRate/ItemInfo. No `.h`, armazene `TMap<int32, FCustomJewelRow> JewelByItemIndex` e expose `bool CanApply(const FItemData& Jewel, const FItemData& Target, int32 AccountLevel, FCustomJewelRow& OutRow) const; int32 GetSalePrice(int32 ItemIndex) const;`.",
      "3. No `.cpp`, implemente `CanApply` espelhando `CheckCustomJewelApplyItem`: rejeite LuckyItem/itens periódicos, valide categoria (arma/armadura/asa) por EnableSlot*, níveis/opções 1/2/3 dentro dos limites, chame serviço de info de item para checar Skill e limites MaxItemOption*, e valide contagem de opções excelentes/set/socket consultando serviços de SetItem/Socket; quando algum dado faltar, retorne false e registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "4. Ainda no serviço, implemente `void ApplySuccess(const FCustomJewelRow& Row, FItemData& Target, int32 AccountLevel)` que incrementa Level/Option1/Option2/Option3 limitados a 15/1/1/gServerInfo.m_MaxItemOption equivalente, chama helpers `ApplyExcellentOptions(Target, Row.SuccessInfo.NewOption)`, `ApplySetOptions(Target, Row.SuccessInfo.SetOption)`, `ApplySocketOptions(Target, Row.SuccessInfo.SocketOption)` e recalcula durabilidade chamando o serviço de info de item. Crie versões para falha subtraindo valores de FailureInfo com clamp em 0.",
      "5. No `UInventoryComponent`, após implementar replicação básica, adicione RPC `UFUNCTION(Server, Reliable)` `void ServerApplyCustomJewel(int32 SourceSlot, int32 TargetSlot);`. No corpo, valide Authority, existência de itens em ambos slots e chame `CustomJewelService->CanApply` com AccountLevel do PlayerState. Se inválido, envie `ClientCustomJewelResult(false, ErrorCode)` (RPC Client).",
      "6. Em caso de sucesso, gere `FRandomStream` e compare `RandRange(0,99)` com `SuccessRate[AccountLevel]` do Row. Se sucesso, chame `ApplySuccess`; se falha, `ApplyFailure`. Consuma 1 unidade do item de SourceSlot, atualize o item de TargetSlot, marque arrays replicados `Inventory`/`Equipment` para replicação e invoque `ClientCustomJewelResult(true/false, ResultCode)` para feedback. Nenhum packet legado deve ser usado.",
      "7. No Blueprint do widget de inventário, adicione botão 'Aplicar Custom Jewel'. No Event Graph, ao clicar, obtenha slot selecionado da joia e do item alvo, chame `ServerApplyCustomJewel`. Em `ClientCustomJewelResult`, use `Branch` para exibir mensagens/sons e, opcionalmente, chame `MulticastCustomJewelFX` (NetMulticast) para partículas; marque FX como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++' se não houver referência no código.",
      "8. Teste cronologicamente: (a) carregar DataTable `DT_CustomJewel`, (b) inicializar CustomJewelService, (c) aplicar replicação do inventário, (d) chamar ServerApplyCustomJewel com caso válido e observar sucesso/falha, (e) validar reconversão visual via OnRep/PreviewCharSet equivalente entre dois clientes PIE sem qualquer uso do sistema de packets legado."
    ]
  },
  "server-moss-merchant-gamble": {
    title: "Implementar Moss Merchant com opções sorteadas na UE (ordem cronológica)",
    steps: [
      "1. Após os serviços de dados (ItemOptionRate/Lucky), crie `AUE_MossMerchantNPC` derivado de `AActor` com componente `UStaticMesh` e `UBoxComponent` para interação. Marque `bReplicates`.",
      "2. Crie `USTRUCT(BlueprintType) FMossMerchantItem` com campos Index, Group, Option0-6, GambleRate. Carregue DataTable no BeginPlay do NPC para popular um `TArray<FMossMerchantItem>`.",
      "3. No NPC, declare `UFUNCTION(Server, Reliable)` `void ServerRequestGamble(APlayerController* PC, int32 Group);` validando distância e moedas antes de prosseguir (se valores de moeda não estiverem no código, registre a frase padrão).",
      "4. Em `ServerRequestGamble`, use `FRandomStream` para sortear um item pelo GambleRate dentro do grupo. Para o item escolhido, chame o `UItemOptionRateService` para obter Option0-6 e executar MakeNew/Set/Socket.",
      "5. Gere `FItemData` preenchido e chame função do `UInventoryComponent` do jogador `bool TryAddItem(const FItemData&);`; se sucesso, emita `ClientReceiveGambleResult` (RPC Client) com dados para UI.",
      "6. No Widget de Moss Merchant, crie lista de grupos disponíveis. No Event Graph, ao clicar em 'Comprar', chame `ServerRequestGamble` com o grupo selecionado e mostre feedback usando o retorno de `ClientReceiveGambleResult`.",
      "7. Adicione `NetMulticast` FX opcional para spawn ou highlight do item ganho. Caso efeitos específicos não apareçam no código, marque como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++'.",
      "8. Teste em duas sessões PIE garantindo que apenas o servidor executa o sorteio e os dados replicados de inventário refletem o item gerado, sem qualquer packet legado."
    ]
  },
  "server-jewel-mix": {
    title: "Replicar mix/unmix de jewels na UE 5.7 sem packets legados",
    steps: [
      "1. Após carregar serviços de ItemOptionRate e dados de itens, crie `USTRUCT(BlueprintType) FJewelMixBundle` com campos `Type` (0-9), `Level` (0-2), `BundleItemIndex`, `SimpleItemIndex`, `RequiredCount`, `Cost`. Preencha um `TArray` constante em código espelhando GetJewelSimpleIndex/GetJewelBundleIndex com RequiredCount = (Level+1)*10 e Cost = (Level+1)*500000 para mix; para unmix, use custo fixo 1.000.000.",
      "2. Em um componente `UInventoryComponent` já replicado, adicione RPC `UFUNCTION(Server, Reliable)` `void ServerMixJewels(uint8 Type, uint8 Level);` que verifica Authority, consulta a tabela FJewelMixBundle, valida Type/Level, verifica Interface aberta (substituir Interface.type==INTERFACE_COMMON com uma flag boolean replicada de UI de mix) e aplica um lock booleano `bChaosLock` replicado para evitar concorrência.",
      "3. Dentro de `ServerMixJewels`, conte itens simples no inventário (`CountItemByIndex(SimpleItemIndex)`) e valide espaço/zen (`PlayerState` ou componente de economia). Se faltar, retorne via `ClientShowMixResult` (RPC Client) com códigos de erro equivalentes (0-5 do código) e registre a frase padrão quando algum motivo não puder ser inferido.",
      "4. Se válido, subtraia moedas, remova RequiredCount de SimpleItemIndex e adicione um item `FItemData` com Index = BundleItemIndex e Level = Level; marque o inventário para replicação (`MarkItemDirty`/OnRep_Inventory) e chame `ClientShowMixResult` com sucesso (1).",
      "5. Adicione RPC `UFUNCTION(Server, Reliable)` `void ServerUnmixJewels(int32 SlotIndex);` validando Authority, lock e se o slot contém BundleItemIndex com Level correspondente. Verifique espaço livre para RequiredCount jewels e moedas; remova bundle, adicione múltiplos simples e envie `ClientShowUnmixResult` com códigos de erro/sucesso.",
      "6. No Widget de mix/unmix (UMG), adicione botões 'Mix' e 'Unmix'. No Event Graph, ao clicar, chame `ServerMixJewels` ou `ServerUnmixJewels` passando Type/Level ou Slot selecionado. Use nós `Branch` para checar erros retornados pelos RPCs Client e exibir mensagens equivalentes aos result codes (sucesso, falta de jewels, falta de espaço, etc.).",
      "7. Opcional: adicionar `NetMulticast` FX para sucesso de mix/unmix. Caso efeitos específicos não estejam no código, marque-os como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++'.",
      "8. Teste em ordem cronológica após implementar inventário replicado e economia: 1) carregar tabelas de jewels, 2) habilitar UI de mix, 3) validar contagem/custos, 4) replicar resultados entre dois clientes PIE sem qualquer packet legado." 
    ]
  },
  "server-item-drop-config": {
    title: "Tabela de drop configurado em UE",
    steps: [
      "1. Crie um DataTable `FDropRow` com campos `ItemIndex`, `Level`, `Grade`, `Option0..Option6`, `DurationSeconds`, `MapNumber`, `MonsterClass`, `MonsterLevelMin`, `MonsterLevelMax`, `DropRate`. Carregue-o no GameMode ou em um Subsystem.",
      "2. Implemente um serviço `UItemDropService` com função `FItemData RollDrop(int32 MapNumber, int32 MonsterClass, int32 MonsterLevel)` que filtra as linhas por mapa/monstro/nivel e sorteia usando `FMath::RandRange(1,1000000)` comparando com DropRate; se nenhuma linha corresponder, retorne vazio.",
      "3. No `AMonster` C++ (derivado de ACharacter), ao morrer no servidor, chame `RollDrop` e, se obtiver item, invoque `SpawnWorldItem` (do guia de mapa de drop) passando `DurationSeconds` e opções/melhorias de Option0..Option6 preenchidas na struct `FItemData`.",
      "4. Adicione `UFUNCTION(NetMulticast, Unreliable)` `void MulticastDropFX()` no monstro ou no `AWorldItem` para mostrar animação/sons; marque como sugestão genérica quando não existir no código original.",
      "5. Em testes PIE, configure linhas simples no DataTable e verifique que apenas monstros elegíveis geram itens, respeitando DropRate e DurationSeconds replicados no `AWorldItem`."
    ]
  },
  "server-muun-system": {
    title: "Replicar Muun Inventory e opções na UE 5.7 sem packets legados",
    steps: [
      "1. Crie dois DataTables: `FMuunInfoRow` espelhando `MUUN_SYSTEM_INFO` (Index, Type, Rank, OptionIndex, EvolutionItemIndex) e `FMuunOptionRow` para `MUUN_SYSTEM_OPTION_INFO` (Index, OptionValue[5], MaxOptionValue, SpecialOptionIndex, SpecialOptionValue, MapZone, PlayTime, DayOfWeek, MinHour, MaxHour, MinLevel, MaxLevel, MinMasterLevel, MaxMasterLevel). Importe os valores dos scripts usados pelo servidor e marque qualquer coluna desconhecida com a frase padrão.",
      "2. No componente replicado `UInventoryComponent`, adicione `UPROPERTY(Replicated)` arrays `TArray<FItemData> MuunSlots` (tamanho 62) e `TArray<uint8> MuunMap` (62*?16 -> use 62*16 para manter compatibilidade com os buffers do código). Mantenha constantes `MuunInventorySize=62` e `MuunWearSize=2` equivalentes às macros. Implemente `OnRep_MuunSlots` para atualizar UI e aplicar status.",
      "3. Adicione RPCs Server: `ServerPickupMuun(int32 WorldItemId)`, `ServerUseMuun(int32 SourceSlot, int32 TargetSlot, uint8 Type)`, `ServerSellMuun(int32 Slot)` e `ServerSaveMuunInventory()`. Cada RPC valida autoridade, estado de morte/Interface ativa (substituir com flags boolean replicadas) e chama funções de validação equivalentes a `CheckItemGive`, `CheckItemMoveToMuunInventory` e `gItemMove.CheckItemMoveAllowSell` com registros de log quando não for possível inferir regra.",
      "4. Ao pegar (`ServerPickupMuun`), confirme que o `AWorldItem` representa um Muun ou utilitário; tente inserir via `TryInsertMuunItem` que verifica retângulo livre (`MuunMap`) e retorna índice. Destrua o actor de mundo e envie RPC Client `ClientMuunPickupResult` com sucesso/erro, eliminando qualquer dependência de packet 0x4E:00.",
      "5. Em `ServerUseMuun`, processe `Type` 1/2/3 mapeando para level up, evolution stone ou Jewel of Life conforme o código. Atualize `MuunSlots`/`MuunMap`, marque slots removidos e chame `MulticastMuunChanged(int32 Slot)` para quem estiver no viewport. Sempre replique `FMuunStatus` ou variável similar indicando ativação para substituir `GCMuunItemStatusSend`.",
      "6. Para vender, valide que a interface de shop replicada está aberta, calcule valor usando dados do item (PetValue/Value) e atualize moeda replicada. Limpe slot e reexecute cálculo de aparência do personagem (preview CharSet) em um método server que recalcule meshes de pets anexados.",
      "7. Implemente um tick server-side (Timer ou override de componente) que emula `MainProc`: percorra os 2 slots de equipar, recupere `FMuunInfoRow`/`FMuunOptionRow`, cheque condições de mapa/horário/nível e aplique bônus em atributos replicados do Character. Quando uma condição deixar de ser satisfeita, remova o bônus e dispare `MulticastMuunChanged` para atualizar visual.",
      "8. Na UI (UMG) crie uma aba Muun Inventory. No Event Construct do widget, obtenha `InventoryComponent` do owning player, leia `MuunSlots` e popular um grid 4x15 começando em índice 2 para slots base. Conecte cliques/drag para chamar `ServerUseMuun` ou `ServerSellMuun`. Em OnRep, refresque durabilidade e status na tela.",
      "9. Integre persistência chamando `ServerSaveMuunInventory` ao salvar personagem ou desconectar; a implementação pode escrever em SaveGame ou serviço backend em vez de DataServer. Se não houver detalhes de persistência no código além das mensagens C2:27, anote como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++'.",
      "10. Ordem cronológica sugerida: (a) criar DataTables e structs, (b) adicionar arrays replicados e constantes de tamanho, (c) implementar RPCs pickup/use/sell, (d) adicionar tick de aplicação de opções e multicast visual, (e) integrar UI UMG, (f) adicionar salvamento/restore. Quando alguma ordem não puder ser deduzida, documente com a frase padrão."
    ]
  },

  "client-inventory-handling": {
    title: "Sincronizar inventário no cliente usando replicação UE 5.7 (ordem cronológica)",
    steps: [
      "1. Após criar `UInventoryComponent` replicado, adicione `UPROPERTY(ReplicatedUsing=OnRep_Inventory)` `TArray<FItemData> InventorySlots` do tamanho de INVENTORY_FULL_RANGE e implemente `OnRep_Inventory` para reconstruir widgets sem usar buffers C1/C3/C4.",
      "2. No PlayerController `ANetworkPC`, crie RPC `UFUNCTION(Client, Reliable)` `void ClientReceiveInventory(const TArray<FItemData>& Slots);` chamado pelo servidor após login/respawn para substituir PRECEIVE_INVENTORY (C4:F3:10). Atualize `InventorySlots` e invoque `OnRep_Inventory`.",
      "3. Para remoção de item (equivalente a ReceiveDeleteInventory), declare RPC `UFUNCTION(Client, Reliable)` `void ClientDeleteInventorySlot(int32 Slot, uint8 Reason);` e, no componente, zere o slot e dispare UI/sons com base no Reason. Use enums em vez de cabeçalhos C1:28.",
      "4. Para coleta/drop (ReceiveGetItem/ReceiveDropItem), reutilize os RPCs de item do guia `server-item-get-drop-conditions` e, no lado do cliente, aplique o delta em `InventorySlots` antes de tocar sons ou mensagens. Documente mensagens desconhecidas com a frase padrão.",
      "5. Para inventário de trade/loja/mix, declare RPCs dedicados (ClientReliable) que entregam arrays já descriptografados, eliminando toda a lógica de SimpleModulus do WSclient. Preencha `TradeSlots`, `ShopSlots`, `MixSlots` replicados e chame `OnRep` em cada um.",
      "6. No Widget de inventário (UMG), conecte `OnRep_Inventory` para reconstruir listas e meshes; para efeitos visuais no mapa (ReceiveCreateItemViewport), responda a `MulticastSpawnWorldItem` do servidor em vez de manipular buffers manualmente.",
      "7. Teste em ordem: (a) login chama `ClientReceiveInventory`, (b) dropar item e receber `ClientDeleteInventorySlot`, (c) coletar item e receber atualização, (d) abrir trade/loja e verificar arrays específicos, (e) garantir que nenhum trecho dependa do sistema de packets legado."
    ]
  },

  "server-harmony-options": {
    title: "Aplicar Jewel of Harmony/Smelt/Elevation na UE 5.7 sem packets",
    steps: [
      "1. Após carregar serviços de item e sockets, crie DataTable `FHarmonyOptionRow` com campos de JEWEL_OF_HARMONY_OPTION_INFO (Section, Rate, ValueTable[7], MoneyTable[7]) e mapeie índices 0/1/2 para arma/staff/armadura. Carregue no GameInstance em BeginPlay.",
      "2. No `UInventoryComponent`, declare RPC `UFUNCTION(Server, Reliable)` `void ServerApplyHarmony(int32 SourceSlot, int32 TargetSlot, uint8 Action);` onde Action=0 aplica Harmony, 1 aplica SmeltStone, 2 aplica Jewel of Elevation. Valide Authority, item em ambos slots e bloqueie Set/Lucky/Socket como no código; registre a frase padrão quando algum filtro não estiver claro.",
      "3. Em ação 0 (AddJewelOfHarmonyOption), sorteie opção/tier usando `FHarmonyOptionRow` e `FRandomStream`, limite nível conforme m_HarmonySuccessRate[AccountLevel] e reconverta o item chamando helper `RebuildItemStats`. Atualize arrays replicados e envie `ClientHarmonyResult` (RPC Client) com sucesso/erro.",
      "4. Em ação 1 (AddSmeltStoneOption), incremente nível até 13 conforme taxas configuráveis (m_SmeltStoneSuccessRate1/2) e zere para nível base em falha; sempre marque OnRep no inventário e reavalie atributos do personagem. Documente taxas desconhecidas com a frase padrão.",
      "5. Em ação 2 (AddJewelOfElevationOption), aplique Harmony em Lucky Items limitando nível a 13, reaproveitando o fluxo de sucesso/erro e a recalculação de CharSet/preview.",
      "6. No Widget UMG de Harmony, crie botões 'Aplicar Harmony', 'Smelt' e 'Elevation'. No Event Graph, chame `ServerApplyHarmony` com Action apropriada e mostre feedback com base no retorno de `ClientHarmonyResult`. Garanta ordem cronológica: carregar DataTable → habilitar RPC → conectar UI.",
      "7. Remova qualquer referência a DataSend/DataRecv/ProtocolCore; toda comunicação ocorre via RPCs e variáveis replicadas." 
    ]
  },

  "server-item-stack-operations": {
    title: "Empilhar/fundir itens replicados na UE (sequência passo a passo)",
    steps: [
      "1. Depois de definir `InventorySlots` replicados, adicione helpers `int32 GetMaxStack(int32 ItemIndex)` e `int32 GetCreateItemIndex(int32 ItemIndex)` consumindo DataTable equivalente a ItemStack.txt; retorne -1 e registre a frase padrão quando faltarem dados.",
      "2. Crie RPC `UFUNCTION(Server, Reliable)` `void ServerStackItem(int32 SourceSlot, int32 TargetSlot);` validando Authority, existência de itens e compatibilidade de Index/Level/SocketBonus. Rejeite se Target estiver equipado ou se MaxStack<=0.",
      "3. Ao empilhar, some `Quantity` (ou Durability para compatibilidade) até MaxStack; se exceder e `CreateItemIndex` estiver definido, gere um novo item com esse índice e remova a pilha original, replicando ambos os slots. Caso contrário, atualize a quantidade e, se zerar o Source, limpe o slot.",
      "4. Para fusão em coleta (equivalente a InventoryInsertItemStack), reutilize o helper em `ServerRequestGetWorldItem` antes de inserir em slot vazio, respeitando MaxStack e criando item bônus quando aplicável.",
      "5. Ao consumir itens por contagem (equivalente a DeleteInventoryItemCount), implemente função `bool ConsumeStackItem(int32 ItemIndex, int32 Count)` que percorre o inventário server-side, decrementa quantidades e replica alterações; retorne false quando faltar item e registre em log se alguma regra de exclusão não puder ser inferida.",
      "6. Exponha BlueprintCallable `bool CanStackItem(const FItemData& A, const FItemData& B)` para UIs decidirem quando permitir arrastar sobre outro slot. Em widgets, use Branch para bloquear quando `CanStackItem` for falso ou quando MaxStack já estiver atingido.",
      "7. Teste cronologicamente: (a) carregar DataTable de stack, (b) empilhar manualmente via UI, (c) coletar itens que autoempilham, (d) consumir pilhas para crafting/compras, (e) verificar criação automática de item bônus, sempre sem packets legados." 
    ]
  }

};

const ueSystems = [
  {
    id: "items-system",
    name: "Sistema de Items",
    status: "Encontrado",
    mechanicsIds: ["server-protocolcore-dispatch", "server-item-structs", "server-item-packet-structs", "server-item-attribute-loader", "server-380-item-type-map", "server-380-item-option", "server-excellent-option-rate", "server-set-item-option", "server-custom-quest-rewards", "server-item-handlers", "server-item-move-matrix", "server-chaos-event-muun-move", "server-muun-system", "server-item-require-checks", "server-item-move-allowlist", "server-item-stack-config", "server-item-stack-operations", "server-inventory-equipment-effects", "server-socket-item-type", "server-item-option-rate", "server-item-value", "server-item-value-trade", "server-lucky-item-options", "server-lucky-item-decay-sync", "server-harmony-options", "server-custom-jewel", "server-moss-merchant-gamble", "server-jewel-mix", "server-itembag-manager", "server-itembag-ex", "server-item-drop-config", "server-item-get-drop-conditions", "server-item-shop-handlers", "server-mapitem-drop-lifecycle", "server-pk-drop-system", "server-pentagram-system", "client-item-structs", "client-inventory-handling", "server-personal-shop"],
    codeSummary: "ProtocolCore (Protocol.cpp) roteia C1:22-26/32-34 para CItemManager (get/drop/move/use/buy/sell/repair) usando structs CItem/ITEM_INFO; o cliente mantém ITEM e PRECEIVE_INVENTORY para refletir o inventário e renderizar itens/viewport.",
    ue57Summary: "Mapear get/drop/move/use/buy/sell/repair para RPCs Server em Character/InventoryComponent, usar `FItemData` replicado, atores `AWorldItem` para drops e Widgets para UI; marcar campos ausentes com 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'."
  },
  {
    id: "inventory-system",
    name: "Sistema de Inventory",
    status: "Encontrado",
    mechanicsIds: ["server-protocolcore-dispatch", "server-character-list", "server-item-structs", "server-item-packet-structs", "server-item-attribute-loader", "server-380-item-type-map", "server-380-item-option", "server-excellent-option-rate", "server-set-item-option", "server-custom-quest-rewards", "server-item-handlers", "server-item-move-matrix", "server-chaos-event-muun-move", "server-muun-system", "server-item-require-checks", "server-item-move-allowlist", "server-item-stack-config", "server-item-stack-operations", "server-inventory-equipment-effects", "server-socket-item-type", "server-item-option-rate", "server-item-value", "server-item-value-trade", "server-lucky-item-options", "server-lucky-item-decay-sync", "server-harmony-options", "server-custom-jewel", "server-moss-merchant-gamble", "server-jewel-mix", "server-itembag-manager", "server-itembag-ex", "server-item-drop-config", "server-item-get-drop-conditions", "server-item-shop-handlers", "server-mapitem-drop-lifecycle", "server-pentagram-system", "client-inventory-handling", "client-item-structs", "server-personal-shop"],
    codeSummary: "DGCharacterListRecv carrega slots iniciais enquanto CItemManager move/usa/compra/vende/repara itens entre inventário/equipamentos/warehouse/chaos; no cliente, ReceiveInventory/ReceiveGetItem/ReceiveDropItem/ReceiveTradeInventory sincronizam g_pMyInventory, MixInventory e lojas.",
    ue57Summary: "Replicar arrays de inventário/equipamento e saldos em componente anexado ao Character/PlayerState, criar RPCs para transferir/loja/reparar itens e usar hooks OnRep para atualizar UI; validar tamanho e contêiner conforme limites de Item.h e registrar 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' quando regras faltarem."
  },
  {
    id: "character-system",
    name: "Sistema de Character",
    status: "Encontrado",
    mechanicsIds: ["protocol-character-and-move", "server-character-list"],
    codeSummary: "CGCharacterListRecv/GDCharacterListSend enviam resumo de personagens após login e os envios de posição/movimento partem do cliente (SendPositionNew/SendCharacterMoveNew).",
    ue57Summary: "Criar classe derivada de ACharacter replicada, com RPC Server para solicitar lista de personagens e variáveis replicadas para atributos básicos; onde faltarem estatísticas específicas, registrar 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'."
  },
  {
    id: "character-appearance",
    name: "Sistema de Aparência do Character",
    status: "NaoEncontrado",
    mechanicsIds: [],
    codeSummary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++",
    ue57Summary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++"
  },
  {
    id: "quest-system",
    name: "Sistema de Quests",
    status: "Encontrado",
    mechanicsIds: ["client-quest-reception"],
    codeSummary: "WSclient.cpp recebe histórico, estado, resultado e recompensa de quest, atualiza g_csQuest e dispara UI/efeitos locais para pontos e mudança de classe.",
    ue57Summary: "Replicar arrays de quest em componente de PlayerState, expor RPCs Server/Client para atualizar estados e recompensas e abrir widgets UMG; substituir mensagens C1/C3/C4 por replicação e Multicast para efeitos visuais."
  },
  {
    id: "appearance-by-items",
    name: "Mudanças de Aparência por Items nos Slots",
    status: "NaoEncontrado",
    mechanicsIds: [],
    codeSummary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++",
    ue57Summary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++"
  },
  {
    id: "hud-system",
    name: "HUD",
    status: "NaoEncontrado",
    mechanicsIds: [],
    codeSummary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++",
    ue57Summary: "Para recriar UI em UE 5.7 seria necessário UMG, mas a ordem e campos exibidos não estão no código: 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'."
  },
  {
    id: "character-movement",
    name: "Movimentação do Character",
    status: "Encontrado",
    mechanicsIds: ["protocol-character-and-move", "server-position-sync", "server-move-sync"],
    codeSummary: "SendCharacterMoveNew envia caminho comprimido (PathNum/DirTable) e CGMoveRecv aplica path validando colisão em gMap, atualizando stand attr e difundindo via PacketSend para jogadores do viewport.",
    ue57Summary: "Usar ACharacter com bReplicateMovement, RPC Server para receber Arrays de direções e validação de colisão no servidor; broadcast via NetMulticast ou variáveis replicadas para posição/rota."
  },
  {
    id: "mobs-system",
    name: "Mobs",
    status: "NaoEncontrado",
    mechanicsIds: [],
    codeSummary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++",
    ue57Summary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++"
  },
  {
    id: "mob-ai",
    name: "AI dos Mobs",
    status: "NaoEncontrado",
    mechanicsIds: [],
    codeSummary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++",
    ue57Summary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++"
  },
  {
    id: "mob-spawn",
    name: "Spawn de Mobs",
    status: "NaoEncontrado",
    mechanicsIds: [],
    codeSummary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++",
    ue57Summary: "NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++"
  },
  {
    id: "drop-system",
    name: "Sistema de Drop (com animação)",
    status: "Encontrado",
    mechanicsIds: ["server-protocolcore-dispatch"],
    codeSummary: "ProtocolCore roteia comandos de pegar/soltar item (0x22-0x26), mas nenhuma animação é descrita nos handlers; o servidor apenas valida e repassa via PacketSend/DataSend.",
    ue57Summary: "Transformar comandos de drop em RPC Server que spawnem AActor replicado para o item no mundo; animações ou efeitos visuais devem ser marcados como 'SUGESTÃO GENÉRICA, NÃO DIRETAMENTE INFERIDA DO CÓDIGO-FONTE C++' quando não estiverem no código."
  },
  {
    id: "item-effects",
    name: "Sistema de Efeitos dos Items",
    status: "Encontrado",
    mechanicsIds: ["buff-script-load", "buff-time-control", "buff-value-control", "buff-system-dispatch"],
    codeSummary: "BuffScriptLoader lê BuffEffect_<ML>.bmd com XOR e checksum, BuffTimeControl registra timers via WM_TIMER e BuffStateValueControl calcula valores a partir de BuffInfo/ItemAddOptioninfo.",
    ue57Summary: "Criar subsistemas UE que carreguem tabelas de buff em USTRUCT, usem FTimerManager para contagem regressiva e exponham valores replicados quando afetarem outros jogadores; textos ausentes devem usar 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'."
  },
  {
    id: "character-sockets",
    name: "Sistema de Sockets no Personagem (Weapons, Wings, Pets, Montaria)",
    status: "Encontrado",
    mechanicsIds: ["socket-option-script", "socket-tooltip-bonus"],
    codeSummary: "CSocketItemMgr lê scripts de socket com XOR rotativo e cálculos CalcSocketOptionValue/Bonus, e funções de tooltip para SeedSphere e bônus usam esses dados.",
    ue57Summary: "Armazenar opções de socket em USTRUCT carregado localmente e anexar armas/itens a sockets do esqueleto via AttachToComponent; quando a relação exata de slots não aparecer, registrar 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'."
  },
  {
    id: "terrain-system",
    name: "Sistema de Terrain (coordenadas/rotação)",
    status: "Encontrado",
    mechanicsIds: ["server-move-sync"],
    codeSummary: "CGMoveRecv consulta gMap para verificar bloqueios (stand attr) e reposiciona o jogador quando o path encontra colisão, limpando e setando stand attr conforme a nova coordenada.",
    ue57Summary: "Executar validação de terreno no servidor UE usando navegação/colisão antes de replicar movimento; ajustes de unidade/rotação não aparecem no código, então 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' para conversões específicas."
  }
];

const roadmap = [
  {
    id: "roadmap-validate-bux",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["serverlist-script-load"],
    description: "Adicionar verificação de tamanho e logs ao carregar os arquivos já convertidos (sem BuxConvert/XOR), registrando aviso caso algum binário legado ainda criptografado seja encontrado.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ServerListManager.cpp linha 79-94)."
  },
  {
    id: "roadmap-item-info-datatable",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-item-attribute-loader"],
    description: "Gerar DataTable UE com campos de ITEM_INFO e validar carregamento similar ao loop de CItemManager::Load incluindo seções 0-15 e requisitos.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemManager.cpp linhas 65-199)."
  },
  {
    id: "roadmap-itembag-binding",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["server-itembag-manager", "server-item-drop-config"],
    description: "Mapear ItemBagManager (ItemIndex/MonsterClass/SpecialValue) para DataTables UE e garantir carregamento de arquivos EventItemBag/*.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemBagManager.cpp linhas 26-200)."
  },
  {
    id: "roadmap-itembag-ex-import",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["server-itembag-ex"],
    description: "Importar tabelas ItemBagEx (seções 3/4/5+) para DataTables UE, implementar seleção por RequireClass/SectionRate e substituição de GCFireworksSend por multicast FX.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemBagEx.cpp linhas 25-196 e 200-310)."
  },
  {
    id: "roadmap-inventory-equipment-effects",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["server-inventory-equipment-effects"],
    description: "Migrar o fluxo C1:BF:20 de ativação/desativação de itens 13,128-13,134 para RPCs e componente replicado, incluindo reaplicação periódica de efeitos sem packets legados.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (InventoryEquipment.cpp linhas 19-117)."
  },
  {
    id: "roadmap-item-option-rate-tables",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-item-option-rate"],
    description: "Carregar tabelas de Rate 0-6 em DataTables UE e validar pesos antes de usá-las em drop/loja, replicando o fluxo de CItemOptionRate::Load/GetItemOption*.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemOptionRate.cpp linhas 33-132 e 140-205)."
  },
  {
    id: "roadmap-socket-max-table",
    horizon: "Curto Prazo",
    priority: "Média",
    mechanicsIds: ["server-socket-item-type"],
    description: "Extrair limites de MaxSocket para DataTable UE antes de aplicar opções de socket em drops ou lojas.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (SocketItemType.cpp linhas 26-103; SocketItemType.h linhas 9-23)."
  },
  {
    id: "roadmap-item-value-service",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-item-value"],
    description: "Criar serviço UE para carregar ITEM_VALUE_INFO e fornecer valores/coinagens para venda e validações antes de RPCs de economia.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemValue.cpp linhas 27-175; ItemValue.h linhas 9-29)."
  },
  {
    id: "roadmap-trade-coin-validation",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-item-value-trade"],
    description: "Migrar CheckItemValueTrade para RPCs UE garantindo débito de zen/coins e mensagens de erro replicadas antes de concluir trocas.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemValueTrade.cpp linhas 30-223; ItemValueTrade.h linhas 9-27)."
  },
  {
    id: "roadmap-stack-merge-rpc",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-item-stack-config", "server-item-stack-operations"],
    description: "Migrar fusão/consumo de pilhas e criação de item bônus para RPCs UE, substituindo GCItemDurSend/GCItemDeleteSend/GDCreateItemSend por replicação e factories locais.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemManager.cpp linhas 1188-1305 e 1916-1945; ItemStack.cpp linhas 26-103)."
  },
  {
    id: "roadmap-quest-rpc-migration",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["client-quest-reception"],
    description: "Transformar ReceiveQuestHistory/State/Result/Prize/EventCount em RPCs UE 5.7, replicando arrays de quest e recompensas sem usar buffers C1/C3/C4.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (WSclient.cpp linhas 9529-9606)."
  },
  {
    id: "roadmap-quest-ui-sync",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["client-quest-reception"],
    description: "Recriar interface NPCQUEST em UMG com sequências cronológicas: replicar estados, abrir a tela ao receber RPC de quest, aplicar recompensas (pontos/classe) e efeitos com Multicast.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (WSclient.cpp linhas 9529-9606)."
  },
  {
    id: "roadmap-pentagram-rpc-migration",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-pentagram-system"],
    description: "Migrar inserção/remoção/refino/upgrade de joias pentagram para RPCs UE com DataTables de taxa/opções e arrays replicados de FPentagramJewelInfo em inventário e warehouse.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (PentagramSystem.h linhas 11-216; PentagramSystem.cpp linhas 1487-1841)."
  },
  {
    id: "roadmap-personal-shop-migration",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-personal-shop"],
    description: "Migrar fluxo de loja pessoal (definir preço, abrir, listar, comprar) para componentes replicados e RPCs UE, substituindo packets 0x3F e salvamentos GDPShop*.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (PersonalShop.cpp linhas 281-744; ServerInfo.h linhas 101-103; ItemManager.cpp linhas 2380-3793)."
  },
  {
    id: "roadmap-harmony-option-service",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["server-harmony-options"],
    description: "Carregar tabela de Jewel of Harmony em DataTables UE e implementar RPCs de aplicar/smelt/elevation com recálculo de atributos replicados.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (JewelOfHarmonyOption.cpp linhas 37-441, 443-603, 605-761; JewelOfHarmonyOption.h linhas 9-63)."
  },
  {
    id: "roadmap-custom-jewel-migration",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-custom-jewel"],
    description: "Migrar CustomJewel.txt e fluxo de uso (CheckCustomJewelApplyItem/CharacterUseCustomJewel) para DataTables, serviço e RPC Server/Client substituindo C1:24 e GCItemDelete/Modify.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (CustomJewel.h linhas 9-86; CustomJewel.cpp linhas 202-602; ObjectManager.cpp linhas 2793-2874; ItemManager.cpp linhas 4088-4121)."
  },
  {
    id: "roadmap-custom-quest-rewards",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["server-custom-quest-rewards"],
    description: "Migrar conclusão de CustomQuest para RPCs UE com verificação de espaço no inventário, criação de itens com sockets limitados e sincronização de progresso sem packets C1:F1/F2.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (CustomQuest.h linhas 11-145; CustomQuest.cpp linhas 558-930)."
  },
  {
    id: "roadmap-jewel-mix-flow",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-jewel-mix"],
    description: "Migrar mix/unmix de jewels para RPCs UE validando ChaosLock, contagem de jewels, custos e slots livres antes de criar bundles ou dividir stacks.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (JewelMix.cpp linhas 31-210 e 253-401; JewelMix.h linhas 8-47; Protocol.cpp linhas 523-536)."
  },
  {
    id: "roadmap-380-type-mapping",
    horizon: "Curto Prazo",
    priority: "Média",
    mechanicsIds: ["server-380-item-type-map"],
    description: "Migrar ITEM_380_TYPE_INFO para DataTable UE e validar leitura de OptionIndex/OptionValue antes de aplicar em equipamentos.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (380ItemType.cpp linhas 24-70)."
  },
  {
    id: "roadmap-380-option-application",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-380-item-option"],
    description: "Reaplicar bônus AttackSuccessRatePvP/DamagePvP/DefensePvP/HP/SD/SDRecovery em atributos replicados ao equipar itens 380.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (380ItemOption.cpp linhas 16-92)."
  },
  {
    id: "roadmap-excellent-option-rate",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-excellent-option-rate"],
    description: "Migrar ITEM_EX_OPTION_RATE_INFO para DataTable UE e implementar rolagem de opção excellent evitando duplicidade de bits já aplicados.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemExcellentOptionRate.cpp linhas 18-78 e 80-109)."
  },
  {
    id: "roadmap-set-item-option-service",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-set-item-option"],
    description: "Portar OptionTable/FullOptionTable de sets para DataTables UE e recalcular atributos replicados sempre que peças de set forem equipadas ou removidas.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (SetItemOption.cpp linhas 25-191, 193-327 e 329-463)."
  },
  {
    id: "roadmap-lucky-item-service",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["server-lucky-item-options", "server-lucky-item-decay-sync"],
    description: "Criar serviço UE para Lucky Items que consulta taxas globais, aplica restauração de durabilidade, sincroniza serial/durabilidade e atualiza CharSet equivalente a CharacterMakePreviewCharSet.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (LuckyItem.cpp linhas 31-188 e 322-544; LuckyItem.h linhas 14-102)."
  },
  {
    id: "roadmap-moss-merchant-gamble",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["server-moss-merchant-gamble"],
    description: "Migrar RollItem do Moss Merchant para RPCs UE, mantendo GambleRate e opções sorteadas via ItemOptionRate e GDCreateItemSend equivalente em inventário replicado.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (MossMerchant.cpp linhas 410-448)."
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
  },
  {
    id: "roadmap-dataserver-telemetry",
    horizon: "Curto Prazo",
    priority: "Média",
    mechanicsIds: ["server-dataserver-dispatch"],
    description: "Registrar métricas por head/subcódigo em DataServerProtocolCore e validar acessos a lpMsg[3]/lpMsg[4] antes de chamar handlers.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (DSProtocol.cpp switch de head 0x00-0x11 e subcódigos 0x00/0x01/0x70/0x71/0x75)."
  },
  {
    id: "roadmap-joinserver-dup-protection",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-joinserver-auth-move"],
    description: "Fortalecer tratamento de conta duplicada em JGAccountAlreadyConnectedRecv sincronizando com CustomAttack/CustomStore para encerrar sessões conflitantes.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (JSProtocol.cpp função JGAccountAlreadyConnectedRecv e uso de gCustomAttack/gCustomStore)."
  },
  {
    id: "roadmap-packet-key-config",
    horizon: "Curto Prazo",
    priority: "Média",
    mechanicsIds: ["server-packet-encryption-manager"],
    description: "Externalizar chaves DES_XEX3/XorFilter para arquivo de configuração e adicionar validação de header 4370 antes de ApplySecuritySettings.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (PacketManager.cpp Init/LoadKey usando ENCDEC_HEADER e m_SaveLoadXor/m_XorFilter)."
  },
  {
    id: "roadmap-chaos-event-muun-replication",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-chaos-event-muun-move"],
    description: "Mapear as expansões de inventário e mapas de slots ao portar Chaos/Event/Muun Inventory para componentes replicados, adicionando logs de rollback quando EventInventoryAddItemStack falhar.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemManager.cpp linhas 2754-2810 e 3001-3114)."
  },
  {
    id: "roadmap-muun-system-migration",
    horizon: "Médio Prazo",
    priority: "Alta",
    mechanicsIds: ["server-muun-system"],
    description: "Migrar inventário Muun, aplicação de opções e RPCs de pegar/usar/vender para componentes replicados e DataTables UE, substituindo os subcódigos 0x4E e sincronização C2:27.* com backend UE.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (MuunSystem.h linhas 10-171 e 206-248; MuunSystem.cpp linhas 1066-1215)."
  },
  {
    id: "roadmap-item-get-drop-validation",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-item-get-drop-conditions"],
    description: "Recriar na UE 5.7 as verificações de estado (DieRegen, Interface, Transaction), filtros de evento/Muun/quest e restrições de rings/zen antes de pegar ou dropar itens.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemManager.cpp linhas 3123-3338)."
  },
  {
    id: "roadmap-warehouse-rpc",
    horizon: "Curto Prazo",
    priority: "Alta",
    mechanicsIds: ["server-warehouse-sync"],
    description: "Substituir PMSG_ITEM_WAREHOUSE_LIST_SEND e C1:81/82 por RPCs Server/Client replicando slots e zen do warehouse com validadores de lock/estado.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (ItemManager.cpp linhas 3339-3520 e Protocol.cpp cases 0x81-0x83)."
  },
  {
    id: "roadmap-party-guild-rpc",
    horizon: "Médio Prazo",
    priority: "Média",
    mechanicsIds: ["server-party-guild-flow"],
    description: "Migrar convites de party e guild, confirmações e guerras (cases 0x40-0x43 e 0x50-0x57) para RPCs UE com componentes replicados para membros e status.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (Protocol.cpp cases de party/guild e GuildClass.cpp regras de criação)."
  }

];

// UI Logic
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-pane-section');
  const ueSystemsContainer = document.getElementById('ue-systems-container');

  if (!tabButtons.length || !tabContents.length) {
    console.error('[web-analyzer] Não foi possível inicializar as abas: elementos não encontrados.');
    return;
  }

  function switchTab(targetId) {
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
    tabContents.forEach(content => content.classList.toggle('active', content.id === targetId));
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      switchTab(btn.dataset.target);
    });
  });

  const missingText = 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++';

  function typeBadgeClass(type) {
    switch (type) {
      case 'Cliente':
        return 'text-bg-info';
      case 'Servidor':
        return 'text-bg-success';
      case 'Compartilhada':
        return 'text-bg-warning';
      default:
        return 'text-bg-secondary';
    }
  }

  // Mechanics rendering
  const mechanicsListEl = document.getElementById('mechanics-list');
  const mechanicDetailEl = document.getElementById('mechanic-detail');
  const searchInput = document.getElementById('mechanics-search');
  const typeFilter = document.getElementById('mechanics-type-filter');
  const orderFilter = document.getElementById('mechanics-order-filter');

  function renderMechanicsList() {
    const query = searchInput.value.toLowerCase();
    const type = typeFilter.value;
    const order = orderFilter.value;
    mechanicsListEl.innerHTML = '';
    const sorted = mechanics
      .filter(m => (!type || m.type === type))
      .filter(m => m.name.toLowerCase().includes(query));

    sorted.sort((a, b) => {
      if (order === 'order') {
        const orderA = Number.isFinite(a.implementationOrder) ? a.implementationOrder : Number.MAX_SAFE_INTEGER;
        const orderB = Number.isFinite(b.implementationOrder) ? b.implementationOrder : Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
      }
      return a.name.localeCompare(b.name, 'pt');
    });

    sorted.forEach(m => {
        const orderLabel = Number.isFinite(m.implementationOrder)
          ? `Etapa #${m.implementationOrder}`
          : 'Sem ordem definida';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
        button.dataset.id = m.id;
        button.innerHTML = `
          <div class="me-2 text-start">
            <div class="fw-semibold">${m.name}</div>
            <div class="small text-muted">${m.files?.[0] || 'C/C++'}</div>
            <div class="small text-muted">${orderLabel}</div>
          </div>
          <span class="badge rounded-pill ${typeBadgeClass(m.type)} align-self-center">${m.type}</span>
        `;
        button.addEventListener('click', () => selectMechanic(m.id));
        mechanicsListEl.appendChild(button);
      });
  }

  function renderPillGroup(label, items) {
    if (!items || !items.length) {
      return `
        <div class="mb-3">
          <div class="text-muted text-uppercase small mb-1">${label}</div>
          <div class="text-muted-80">${missingText}</div>
        </div>
      `;
    }
    return `
      <div class="mb-3">
        <div class="text-muted text-uppercase small mb-1">${label}</div>
        <div>${items.map(item => `<span class="info-pill">${item}</span>`).join('')}</div>
      </div>
    `;
  }

  function resolveMechanicName(id) {
    const mech = mechanics.find(x => x.id === id);
    return mech ? mech.name : id;
  }

  function buildChronologyBlock(mechanic) {
    const orderLabel = Number.isFinite(mechanic.implementationOrder)
      ? `Etapa #${mechanic.implementationOrder}`
      : 'Sem ordem definida';

    const prerequisites = mechanic.dependsOn?.map(resolveMechanicName) || [];
    const unlocks = mechanics
      .filter(other => Array.isArray(other.dependsOn) && other.dependsOn.includes(mechanic.id))
      .sort((a, b) => {
        const orderA = Number.isFinite(a.implementationOrder) ? a.implementationOrder : Number.MAX_SAFE_INTEGER;
        const orderB = Number.isFinite(b.implementationOrder) ? b.implementationOrder : Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name, 'pt');
      })
      .map(m => m.name);

    const prerequisitesText = prerequisites.length
      ? `Depende de: ${prerequisites.join(', ')}`
      : 'Não possui pré-requisitos cronológicos registrados.';

    const unlocksText = unlocks.length
      ? `Desbloqueia: ${unlocks.join(', ')}`
      : 'Nenhuma ligação posterior registrada.';

    return `
      <div class="row g-3 mb-3 align-items-start">
        <div class="col-md-6">
          <div class="text-muted text-uppercase small mb-1">Ordem de implementação</div>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <span class="badge text-bg-dark detail-badge">${orderLabel}</span>
            <span class="text-muted small">${prerequisitesText}</span>
          </div>
        </div>
        <div class="col-md-6">
          <div class="text-muted text-uppercase small mb-1">Conexões cronológicas</div>
          <div class="text-muted-80 small">${unlocksText}</div>
        </div>
      </div>
    `;
  }

  function selectMechanic(id) {
    const m = mechanics.find(x => x.id === id);
    if (!m) return;
    mechanicsListEl.querySelectorAll('.list-group-item').forEach(li => li.classList.toggle('active', li.dataset.id === id));
    mechanicDetailEl.innerHTML = `
      <div class="d-flex justify-content-between flex-wrap gap-2 align-items-start mb-3">
        <div>
          <h3 class="h4 mb-1">${m.name}</h3>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge ${typeBadgeClass(m.type)} detail-badge">${m.type}</span>
            <span class="badge text-bg-secondary detail-badge">ID: ${m.id}</span>
          </div>
        </div>
        <div class="text-muted small">Fluxo de rede e adaptação Unreal</div>
      </div>
      <p class="text-muted-80">${m.description}</p>
      ${buildChronologyBlock(m)}
      ${renderPillGroup('Arquivos', m.files)}
      ${renderPillGroup('Classes', m.classes)}
      ${renderPillGroup('Funções', m.functions)}
      <div class="mb-3">
        <div class="text-muted text-uppercase small mb-1">Fluxo</div>
        <p class="mb-0">${m.flow}</p>
      </div>
      <div>
        <div class="text-muted text-uppercase small mb-1">Rede</div>
        <p class="mb-0">${m.networkDetails || missingText}</p>
      </div>
    `;
    updateGuideSelection(id);
  }

  searchInput.addEventListener('input', renderMechanicsList);
  typeFilter.addEventListener('change', renderMechanicsList);
  orderFilter.addEventListener('change', renderMechanicsList);

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
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h3 class="h4 mb-1">${guide.title}</h3>
          <div class="text-muted small">Checklist para Unreal Engine 5.7</div>
        </div>
        <span class="badge text-bg-primary">Guia</span>
      </div>
      <ol class="list-group list-group-numbered list-group-flush">
        ${guide.steps.map(step => `<li class="list-group-item">${step}</li>`).join('')}
      </ol>
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
      const column = document.createElement('div');
      column.className = 'col-lg-6';
      const card = document.createElement('div');
      card.className = 'roadmap-card shadow-sm p-3';
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
          <div>
            <h3 class="h6 mb-1">${hz}</h3>
            <div class="text-muted small">Itens priorizados por horizonte</div>
          </div>
          <span class="badge text-bg-info">${hz}</span>
        </div>
      `;

      grouped[hz].forEach(item => {
        const mechNames = item.mechanicsIds
          .map(id => {
            const mech = mechanics.find(m => m.id === id);
            return mech ? mech.name : id;
          })
          .join(', ');
        const note = item.notes || '';
        const priorityClass = item.priority === 'Alta'
          ? 'text-bg-danger'
          : item.priority === 'Média'
          ? 'text-bg-warning'
          : 'text-bg-secondary';

        card.innerHTML += `
          <div class="p-3 mb-2 border rounded-3">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div class="fw-semibold">${item.description}</div>
              <span class="badge ${priorityClass}">${item.priority}</span>
            </div>
            <div class="text-muted mt-1">Mecânicas: ${mechNames}</div>
            <div class="text-muted small">${note}</div>
          </div>
        `;
      });

      column.appendChild(card);
      roadmapGroups.appendChild(column);
    });

    if (!Object.keys(grouped).length) {
      roadmapGroups.innerHTML = '<div class="col-12 text-center text-muted">Nenhum item encontrado com os filtros atuais.</div>';
    }
  }

  roadmapHorizon.addEventListener('change', renderRoadmap);
  roadmapPriority.addEventListener('change', renderRoadmap);
  roadmapMechanic.addEventListener('change', renderRoadmap);

  // UE Systems rendering
  function renderUESystems() {
    if (!ueSystemsContainer) return;
    const mechanicsMap = new Map(mechanics.map(m => [m.id, m.name]));
    ueSystemsContainer.innerHTML = '';
    ueSystems.forEach(sys => {
      const column = document.createElement('div');
      column.className = 'col';
      const card = document.createElement('div');
      card.className = 'system-card shadow-sm';
      const statusClass = sys.status === 'Encontrado' ? 'text-bg-success' : 'text-bg-secondary';
      const mechanicsList = sys.mechanicsIds && sys.mechanicsIds.length
        ? sys.mechanicsIds.map(id => mechanicsMap.get(id) || id).join(', ')
        : missingText;
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <h3 class="h5 mb-0">${sys.name}</h3>
          <span class="badge ${statusClass} status-tag">${sys.status === 'Encontrado' ? 'Encontrado no código' : 'Não encontrado'}</span>
        </div>
        <div><strong>Mecânicas Relacionadas:</strong> ${mechanicsList}</div>
        <div class="text-muted"><strong>Resumo técnico (código):</strong> ${sys.codeSummary}</div>
        <div class="text-muted"><strong>Adaptação UE 5.7:</strong> ${sys.ue57Summary}</div>
      `;
      column.appendChild(card);
      ueSystemsContainer.appendChild(column);
    });
  }

  // Initial render
  populateGuideSelect();
  populateRoadmapMechanicFilter();
  renderMechanicsList();
  renderGuide();
  renderRoadmap();
  renderUESystems();
});
