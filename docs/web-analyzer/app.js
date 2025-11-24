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
    networkDetails: "Utiliza olc::net::client_interface<ProtocolHead> para conectar IP/Port, manter flag g_bGameServerConnected e enviar ping (CLIENT_LIVE_CLIENT) e check periódico.",
    flow: "ConnectServer instancia CustomClient e chama Connect; DisconnectServer zera g_bGameServerConnected, fecha socket e loga; CheckConnected verifica IsConnected; SendPingTest delega a PingServer; SendCheckOnline retorna se desconectado, envia ping e loga; SendPacket/SendPacketClassic são wrappers para DataSend com/sem cabeçalho.",
    description: "Gerencia o socket cliente, check de vida e envio bruto usando ProtocolHead, incluindo wrappers para pacotes clássicos sem cabeçalho customizado."
  },
  {
    id: "protocol-recv-dispatch",
    name: "Fila de recebimento e despacho de mensagens",
    type: "Cliente",
    files: ["ProtocolSend.cpp", "WSclient.cpp"],
    classes: ["CProtocolSend"],
    functions: ["RecvMessage"],
    networkDetails: "Processa mensagens ProtocolHead do servidor e encaminha para handlers locais ou TranslateProtocol; WSclient.cpp lida com pacotes C1/C2/C3/C4 descriptografando via SimpleModulus e validando g_byPacketSerialRecv antes de repassar.",
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
    networkDetails: "Envia PMSG_CONNECT_ACCOUNT_SEND via ProtocolHead::BOTH_CONNECT_LOGIN com campos codificados por BuxConvert e versão/serial do cliente.",
    flow: "Configura LogIn=1, CurrentProtocolState=REQUEST_LOG_IN, copia account/password com strncpy, faz BuxConvert nos campos, define TickCount/versão/serial, escreve mensagens em g_pChatListBox e chama SendPacket." ,
    description: "Constrói pacote de autenticação e notifica UI via g_pChatListBox antes do envio."
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
    networkDetails: "Pacotes enviados com cabeçalhos BOTH_CONNECT_CHARACTER, BOTH_POSITION e BOTH_MOVE; PathNum limitado por MAX_PATH_FIND e codificado em nibbles.",
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
    networkDetails: "Encapsula payload em olc::net::message com header.id específico ou BOTH_MESSAGE quando apenas buffer é fornecido.",
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
    networkDetails: "CreateSocket inicializa CWsctlc, conecta com WM_ASYNCSELECTMSG e zera g_byPacketSerialSend/g_byPacketSerialRecv; ProtocolCompiler decripta pacotes C3/C4 via g_SimpleModulusSC, valida serial e envia SendHackingChecked em falha.",
    flow: "CreateSocket executa Startup/LogPrintOn (debug), cria socket da janela e chama Connect; ProtocolCompiler consome GetReadMsg, identifica C1/C2 ou decripta C3/C4 para byDec, ajusta header e incrementa g_byPacketSerialRecv ou registra erro, soma Size em TotalPacketSize e opcionalmente salva pacote; ReceiveCheckSumRequest calcula checksum e invoca SendCheckSum; DeleteSocket fecha o socket.",
    description: "Implementa camada de transporte síncrona ao Windows, incluindo conexão assíncrona, serialização de pacotes criptografados SimpleModulus, verificação de sequência e resposta a pedidos de checksum." 
  },
  {
    id: "mapserver-change",
    name: "Troca de Map Server e reconexão",
    type: "Cliente",
    files: ["CSMapServer.cpp", "CSMapServer.h", "WSclient.cpp"],
    classes: ["CSMServer"],
    functions: ["ConnectChangeMapServer", "SendChangeMapServer", "SetServerInfo", "SetHeroID", "GetServerAddress"],
    networkDetails: "Usa CreateSocket/SendChangeMServer e transições controladas por LogIn/HeroKey; sem RPCs Unreal.",
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
  }
];

const ueGuides = {
  "serverlist-script-load": {
    title: "Recriar leitura ServerList.bmd",
    steps: [
      "No Unreal 5.7, crie um módulo C++ utilitário (por exemplo, subclass de UObject) para substituir CServerListManager e carregar dados locais.",
      "Implemente função equivalente a LoadServerListScript lendo de um arquivo configurado no projeto (usando FFileHelper) e aplicando XOR rotativo 0xfc/0xcf/0xab em cada byte, preservando o mesmo tamanho de struct SERVER_GROUP_INFO.",
      "Armazene os dados em um mapa TMap<int32, FServerGroupInfo> com campos m_szName, m_byPos, m_bySequence e m_abyNonPVP replicando o layout original.",
      "Expose um método BlueprintCallable para iniciar o carregamento, permitindo gatilho em UI sem rede; marque o objeto como não replicado (somente cliente)."
    ]
  },
  "servergroup-creation": {
    title: "Gerenciar grupos de servidor",
    steps: [
      "Crie uma classe UObject derivada para representar grupos (equivalente a CServerGroup) contendo array de servidores e flags de PvP.",
      "Implemente método InserirGrupo similar a InsertServerGroup: pesquise em TMap por índice (iConnectIndex/20) e, se não existir, instancie novo grupo preenchendo com dados pré-carregados (MakeServerGroup).",
      "Use funções BlueprintCallable para SetFirst/GetNext retornando índices válidos para UI; mantenha ponteiros/índices locais, sem replicação.",
      "Armazene largura/posição em propriedades UPROPERTY(EditAnywhere) para permitir layout dinâmico, espelhando m_iWidthPos/m_iBtnPos." 
    ]
  },
  "serverentry-population": {
    title: "Construir entradas e rótulos de servidor",
    steps: [
      "Adicione estrutura UStruct FServerInfo com campos Sequence, Index, ConnectIndex, Percent, NonPvP e Name (FString) equivalentes aos membros de CServerInfo.",
      "Implemente função de fábrica que receba Percent e NonPvP e monte o texto conforme InsertServer (selecionando mensagem para >=128, >=100 ou outro).",
      "Para manter paridade, armazene o texto global em array TArray<FText> carregado de recurso local; se os textos não estiverem no código C++, marque como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++' e preencha manualmente.",
      "Não marque replicação; esses dados são usados apenas na UI cliente antes da conexão." 
    ]
  },
  "server-iteration": {
    title: "Iterar grupos e servidores",
    steps: [
      "Implemente métodos em C++ ou Blueprint que mantenham um índice atual para TArray/TMap e avancem como GetNext, retornando nullptr/None ao final.",
      "Resete iteradores com SetFirst equivalente ao clicar em uma aba de lista; use UFUNCTION(BlueprintCallable) para que a UI possa percorrer itens em widgets ListView.",
      "Garanta que a iteração não reordene elementos, seguindo a lista original preservada por inserção." 
    ]
  },
  "server-selection-state": {
    title: "Persistir seleção de servidor",
    steps: [
      "Crie uma classe UObject de estado (ex.: USelectedServerState) com propriedades UPROPERTY(BlueprintReadOnly) para Name, Index, CensorshipIndex, NonPvPFlag e bIsTestServer.",
      "Implemente método SetSelectServerInfo equivalente: copie os valores recebidos da UI e armazene para uso posterior na conexão.",
      "Expose getters BlueprintPure para UI recuperar as flags e decidir fluxos (por exemplo, permitir entrada apenas se !IsTestServer).",
      "Como os valores são locais, não use replicação; mantenha claro que o estado deriva da escolha do usuário cliente." 
    ]
  },
  "protocol-connection": {
    title: "Conectar e pingar via sockets UE",
    steps: [
      "Em Unreal 5.7, crie um componente de rede custom (UActorComponent) para o PlayerController que encapsule um FSocket ou FInternetAddr para substituir CustomClient.",
      "Implemente ConnectServer(IP,Port) chamando ISocketSubsystem::CreateSocket e Connect; guarde um bool bIsConnected equivalente a CheckConnected.",
      "Adicione método SendPingTest que serialize TickCount e WORDs em um buffer e envie usando send/SendPacket abstrato com cabeçalho ProtocolHead::CLIENT_LIVE_CLIENT mapeado para um enum próprio.",
      "Inclua método DisconnectServer para fechar socket e atualizar um bool replicado apenas para leitura se quiser refletir estado em outros clientes; caso contrário mantenha local.",
      "Implemente SendCheckOnline como função periódica (TimerManager) que retorna cedo se desconectado, chama SendPingTest e grava log/telemetria local.",
      "Exponha wrappers SendPacket/SendPacketClassic aceitando cabeçalho custom ou payload cru, chamando DataSend equivalente; mantenha-os não replicados pois operam no lado cliente."
    ]
  },
  "protocol-recv-dispatch": {
    title: "Despachar mensagens recebidas",
    steps: [
      "Implemente um loop de leitura (FTimer ou Tick) que verifica uma fila de pacotes recebidos semelhante a Incoming() do CustomClient.",
      "Para cada pacote, faça switch no cabeçalho equivalente a ProtocolHead e chame handlers que espelhem RecvJoinServerNew, RecvLoginNew, ReceiveCharacterList, ReceiveMovePosition, ReceiveMoveCharacter ou TranslateProtocol.",
      "Mantenha os handlers como métodos UFUNCTION(BlueprintCallable) se precisar acionar UIs em Blueprint; não invente lógica além do que está no código-fonte.",
      "Se algum handler (ex.: ReceiveCharacterList) não tiver implementação nos arquivos C++, marque no código como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++' e implemente conforme design desejado." 
    ]
  },
  "protocol-login-send": {
    title: "Envio de login codificado",
    steps: [
      "Crie um struct BlueprintType com campos Account[10], Password[20], TickCount, ClientVersion[5] e ClientSerial[16] replicando PMSG_CONNECT_ACCOUNT_SEND.",
      "Implemente função que copia strings via TCHAR->ANSII e aplica XOR (BuxConvert) antes de enviar, mantendo CurrentProtocolState e LogIn como variáveis locais/replicadas conforme necessário.",
      "Envie o pacote usando cabeçalho de RPC custom do seu protocolo (enum) equivalente a BOTH_CONNECT_LOGIN; em UE, isso pode ser um envio via socket custom, não RPC UE padrão, pois depende do protocolo binário existente.",
      "Acione mensagens de UI antes do envio (ex.: adicionar texto em um widget de log) tal como g_pChatListBox->AddText." 
    ]
  },
  "protocol-login-recv": {
    title: "Tratar join e códigos de login",
    steps: [
      "Implemente handler para SERVER_CONNECT que leia result, index[2] e ClientVersion[5]; calcule HeroKey e valide versão conforme loop em RecvJoinServerNew.",
      "Se o estado LogIn != 0, chame função que mapeie g_csMapServer.SendChangeMapServer; caso não exista no código atual, marque como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++'.",
      "Quando result == 0x01, mostre tela de login (Blueprint ou UMG) e defina CurrentProtocolState = RECEIVE_JOIN_SERVER_SUCCESS; para demais códigos, exiba mensagens de erro equivalentes.",
      "Implemente handler de BOTH_CONNECT_LOGIN (RecvLoginNew) que faça switch nos códigos 0x00-0xD2, atualizando estados locais e mostrando PopUps conforme o código fonte; mantenha variáveis CurrentProtocolState e LogIn sincronizadas." 
    ]
  },
  "protocol-character-and-move": {
    title: "Enviar lista de personagens, posição e movimento",
    steps: [
      "Implemente struct equivalente a PMSG_SIMPLE_RESULT_SEND e PMSG_POSITION_SEND em UE para serializar dados binários.",
      "Crie método para solicitar lista de personagens enviando result=1 com cabeçalho BOTH_CONNECT_CHARACTER; nenhuma replicação UE padrão é usada, é envio de socket custom.",
      "Para SendPositionNew, serialize bytes x/y de coordenada atual e envie com cabeçalho BOTH_POSITION.",
      "Para SendCharacterMoveNew, replique o algoritmo de Path: valide PathNum (<MAX_PATH_FIND), calcule Dir comparando PathX/Y com DirTable e compacte duas direções por byte (nibbles). O primeiro byte recebe (PathNum-1) e dir inicial. Em UE, encapsule em função C++ e exponha a Blueprints.",
      "Se DirTable ou MAX_PATH_FIND não estiverem definidos nos arquivos C++ acessados, marque essa dependência como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++' e forneça manualmente." 
    ]
  },
  "protocol-generic-send": {
    title: "Encapsular envios genéricos",
    steps: [
      "Implemente uma função que receba um enum cabeçalho e buffer binário e construa um pacote com header.id e tamanho antes de enviar (equivalente a DataSend com ProtocolHead).",
      "Implemente variante que usa cabeçalho fixo BOTH_MESSAGE quando apenas o buffer é fornecido, verificando se a conexão está ativa antes do envio.",
      "Se desejar suportar multicast UE, encapsule o envio em um componente não replicado e dispare eventos locais após o envio para manter telemetria de UI."
    ]
  },
  "wsclient-socket-decode": {
    title: "Configurar socket assíncrono e parsing C1/C2/C3/C4",
    steps: [
      "No Unreal 5.7, abra o projeto e em **Add → C++ Class** crie um `UObject` ou `UGameInstanceSubsystem` chamado `UNetworkSocketManager` para substituir o fluxo de CWsctlc.",
      "Implemente método `CreateSocket` usando `ISocketSubsystem::CreateSocket` e `FSocket::Connect` com endereço/porta recebidos; armazene dois contadores `uint8 g_byPacketSerialSend/Recv` como membros, resetando-os a zero na conexão.",
      "Adicione função `StartReadLoop` usando `FTimerManager` ou `Tick` para ler do socket e empilhar pacotes brutos em uma fila (TArray<uint8>) semelhante a `GetReadMsg` antes do parse.",
      "Implemente rotina `ProtocolCompiler` que leia o primeiro byte para decidir entre C1/C2 (copiar tamanho) ou C3/C4 (rodar descriptografia SimpleModulus equivalente; se não houver implementações prontas, escreva nota 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++').",
      "Após decriptar, monte cabeçalho com id e tamanho e compare o terceiro byte com `g_byPacketSerialRecv`; se divergir incremente contador e registre log/erros assim como SendHackingChecked faz.",
      "Implemente `ReceiveCheckSumRequest` calculando checksum sobre `Data->Value` e enviando resposta com função de envio do subsistema; se a fórmula exata de GetCheckSum não constar no código, anote 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++' e insira implementação após verificar o código.",
      "Expose um método BlueprintCallable para fechar o socket (`DeleteSocket`) e limpar timers; mantenha tudo no cliente (sem `bReplicates`)."
    ]
  },
  "mapserver-change": {
    title: "Trocar para Map Server e reinicializar estado",
    steps: [
      "Abra o Unreal 5.7 e crie um `UGameInstanceSubsystem` chamado `UMapServerManager` em **Add → C++ Class** para manter `MServerInfo`, `bFillServerInfo` e `HeroID` como propriedades locais (sem replicação).",
      "Implemente método `SetServerInfo` recebendo struct equivalente a `MServerInfo` e copiando campos de IP/porta/auth codes, e método `SetHeroID` armazenando string do herói (use `FString`/`std::string`).",
      "Crie função `ConnectChangeMapServer` que valide `LogIn` e `bFillServerInfo`, salve opções locais (se o jogo possuir, caso contrário marque como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++'), e reconstrua o socket chamando um componente de conexão (ex.: o criado no guia `wsclient-socket-decode`) para `m_szMapSvrIpAddress/m_wMapSvrPort`; utilize `FTimerManager` para aplicar espera de 20 ms antes da conexão se necessário.",
      "Implemente função `SendChangeMapServer` que verifica `bFillServerInfo` e `LogIn`, copia o ID do herói para buffer fixo (respeitando `MAX_ID_SIZE`), chama funções locais `ClearCharacters(-1)` e `InitGame` (se existirem; caso contrário anotar 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++') e por fim envia `SendChangeMServer(LogInID, CharID, JoinAuthCode1..4)` usando seu wrapper de envio binário.",
      "Adicione getters BlueprintPure para recuperar IP/porta e flags de preenchimento para a UI decidir se deve habilitar o botão de troca de servidor.",
      "Se o protocolo de mudança de mapa não for descrito nos arquivos C++, inclua passo explícito na implementação anotando a falta de informação e aguarde definição de design." 
    ]
  },
  "buff-script-load": {
    title: "Recriar carga e descriptografia de BuffEffect",
    steps: [
      "No Unreal 5.7, crie uma classe UObject utilitária que leia BuffEffect_<ML>.bmd de um caminho configurável (FFileHelper::LoadFileToArray) e valide tamanho equivalente a _BUFFINFO.",
      "Aplique XOR rotativo nos bytes (0xfc, 0xcf, 0xab) antes de copiar para um struct UStruct que replique os campos s_BuffIndex, s_BuffEffectType, s_ItemType, s_ItemIndex, s_BuffName, s_BuffClassType, s_NoticeType, s_ClearType e s_BuffDescript.",
      "Implemente verificação de checksum (GenerateCheckSum2 equivalente) e em caso de falha acione log/encerramento conforme o código; se a função GenerateCheckSum2 não existir em UE, marque como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++' e forneça implementação manual.",
      "Divida descrições por '/' em um TArray<FString> para simular CutTokenString e armazene em um TMap<eBuffState, FBuffInfo> acessível a Blueprints."
    ]
  },
  "buff-time-control": {
    title: "Gerenciar timers de buff no cliente UE",
    steps: [
      "Implemente um componente (UActorComponent) que mantenha TMap<eBuffTimeType, FBuffTimeInfo> com campos BuffType, CurBuffTime (ms) e EventBuffTime, inicializando via método equivalente a RegisterBuffTime.",
      "Converta CheckBuffTimeType para lógica UE usando enum eBuffState/eBuffTimeType já definidos; recupere dados de buff via objeto Loader e limite tempo máximo conforme tabela de itens ou retorne -1 se indefinido.",
      "Substitua SetTimer/KillTimer de janela por FTimerManager no PlayerController/GameInstance para ticks a cada ~0.9s, chamando função que reduz CurBuffTime como CheckBuffTime.",
      "Exponha métodos BlueprintCallable para GetBuffStringTime e GetBuffTime, formatando texto de duração; mantenha lógica de expiração (quando <=0, cancelar timer e remover entrada)."
    ]
  },
  "buff-value-control": {
    title: "Consultar valores numéricos de buff em UE",
    steps: [
      "Crie um objeto UObject com TMap<eBuffState, FBuffStateValueInfo> contendo Value1, Value2 e Time; inicialize percorrendo enums como em Initialize.",
      "Implemente função CheckValue para decidir se os dados virão de ItemAddOption (caso default) ou ficam zerados; traduza ItemAddOptioninfo para uma tabela de dados de item na UE ou marque como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++' se o arquivo não existir.",
      "Implemente GetValue que cria/popula cache consultando Loader de BuffInfo e tabela de itens; exponha GetBuffInfoString/GetBuffValueString como BlueprintPure para UI usar textos e valores.",
      "Não utilize replicação, pois os valores são calculados localmente; mantenha coerência com o cache para evitar consultas repetidas."
    ]
  },
  "buff-system-dispatch": {
    title: "Centralizar subsistemas de buff em UE",
    steps: [
      "Implemente um subsistema (UGameInstanceSubsystem) que, ao iniciar, instancia objetos equivalentes a BuffScriptLoader, BuffTimeControl e BuffStateValueControl e os mantém acessíveis globalmente, similar a g_BuffSystem.",
      "Crie função estática BlueprintCallable que retorne referências a cada subsistema para UIs e outros componentes (equivalente a TheBuffStateSystem wrappers).",
      "Implemente roteamento de mensagens de tempo: em vez de HandleWindowMessage, chame o componente de timers a cada Tick ou via timer global para reduzir tempos de buff.",
      "Garanta destruição/limpeza no final da sessão liberando timers e dados carregados, replicando a intenção de Destroy()."
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
    id: "roadmap-buff-cache-validation",
    horizon: "Longo Prazo",
    priority: "Média",
    mechanicsIds: ["buff-value-control"],
    description: "Criar testes que verifiquem consistência de m_BuffStateValue ao longo de múltiplas chamadas GetValue e cargas de itens variáveis.",
    basedOnCode: true,
    notes: "Baseado diretamente no código C++ (w_BuffStateValueControl.cpp linhas 20-83)."
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
