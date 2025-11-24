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
      "No Unreal 5.7, crie um `APlayerController` derivado (Add → C++ Class) que atuará como cliente de rede padrão da UE, sem usar sockets manuais do sistema de packets original.",
      "No `.h`, declare uma função `UFUNCTION(Server, Reliable)` chamada `ServerRequestConnection(const FString& TargetAddress, int32 Port)` para substituir ConnectServer; implemente no `.cpp` a validação do endereço e atualização de um `bool bIsConnected` replicado somente para leitura.",
      "Adicione `UFUNCTION(Server, Reliable)` chamada `ServerPingTest()` que registra o TickCount recebido e responde via `UFUNCTION(Client, Reliable)` `ClientHandlePingResponse(int32 TickCount)`; essa dupla substitui o envio do packet CLIENT_LIVE_CLIENT do sistema original.",
      "Crie função `UFUNCTION(Server, Reliable)` `ServerDisconnect()` para limpar estado e sinalizar ao cliente via `ClientOnDisconnected()`; elimine qualquer chamada direta a sockets, pois a sessão de rede da UE cuida da conexão.",
      "Implemente verificação periódica usando `FTimerManager` em `APlayerController` que chama `ServerPingTest()` enquanto `bIsConnected` estiver verdadeiro; o timer substitui SendCheckOnline do código original.",
      "Para mensagens gerais antes enviadas por SendPacket/SendPacketClassic, crie RPCs específicos (Server/Client/NetMulticast) e, se necessário, use propriedades `UPROPERTY(Replicated)` em `AGameState` ou `APlayerState` para compartilhar o estado; deixe claro que o sistema de packets original não é reimplementado."
    ]
  },
  "protocol-recv-dispatch": {
    title: "Despachar mensagens recebidas",
    steps: [
      "No Unreal 5.7, substitua o loop de parsing de packets por RPCs. Em `APlayerController` ou `AGameMode`, crie funções `UFUNCTION(Server, Reliable)`/`Client`/`NetMulticast` que representem cada mensagem tratada (JoinServer, Login, CharacterList, MovePosition, MoveCharacter).",
      "Remova a leitura direta de buffers: cada evento que o servidor deveria enviar vira `UFUNCTION(Client, Reliable)` (por exemplo, `ClientReceiveLoginResult(uint8 Result, int32 HeroKey)`) e cada comando do cliente vira `UFUNCTION(Server, Reliable)`; o switch em cabeçalho vira um switch de enums dentro do RPC ou múltiplas funções distintas.",
      "Mantenha handlers BlueprintCallable para acionar UI, mas deixe explícito que o sistema de packets do projeto original é apenas referência histórica e não deve ser reimplementado byte a byte.",
      "Para qualquer handler sem detalhes suficientes no código C++, documente no corpo com 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C/C++' e defina o conteúdo conforme o design ao implementar no projeto Unreal."
    ]
  },
  "protocol-login-send": {
    title: "Envio de login codificado",
    steps: [
      "No Unreal 5.7, em `APlayerController`, declare `UFUNCTION(Server, Reliable)` `ServerRequestLogin(const FString& Account, const FString& Password)` que substitui o envio do packet BOTH_CONNECT_LOGIN; valide tamanho das strings antes de copiar para buffers internos.",
      "Dentro do RPC, se precisar replicar dados de versão/serial, salve em propriedades `UPROPERTY(Replicated)` em `APlayerState` ou `AGameState` (por exemplo `FString ClientVersion`, `FString ClientSerial`) em vez de serializar manualmente.",
      "Crie `UFUNCTION(Client, Reliable)` `ClientLoginResponse(uint8 ResultCode, int32 HeroKey)` para devolver ao cliente os códigos de RecvLoginNew; essa função substitui a recepção do packet no sistema original.",
      "No Blueprint do PlayerController, exponha uma função que chame `ServerRequestLogin` quando o usuário confirmar a UI de login; registre CurrentProtocolState/LogIn em variáveis locais replicadas somente se forem necessárias por outros atores."
    ]
  },
  "protocol-login-recv": {
    title: "Tratar join e códigos de login",
    steps: [
      "Implemente `UFUNCTION(Client, Reliable)` `ClientReceiveJoinResult(uint8 Result, uint8 IndexA, uint8 IndexB, FString ServerVersion)` para substituir RecvJoinServerNew; no corpo, calcule HeroKey e compare versão, ajustando CurrentProtocolState replicado se necessário.",
      "Quando `LogIn` já for diferente de zero, chame um RPC de servidor como `ServerRequestMapChange()` (substituindo SendChangeMapServer) ou registre a falta de detalhes como 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "Para códigos 0x00-0xD2 de login, exponha `ClientLoginResponse` (do guia anterior) fazendo switch em Blueprint ou C++ e abrindo telas de UI equivalentes; defina CurrentProtocolState = RECEIVE_JOIN_SERVER_SUCCESS quando Result==0x01.",
      "Mantenha todas as interações através de RPCs e variáveis replicadas; deixe claro que o parsing de packets do projeto original não é refeito na UE."
    ]
  },
  "protocol-character-and-move": {
    title: "Enviar lista de personagens, posição e movimento",
    steps: [
      "No Unreal 5.7, use o `APlayerController` para emitir um `UFUNCTION(Server, Reliable)` `ServerRequestCharacterList()` em vez de enviar PMSG_SIMPLE_RESULT_SEND; o servidor devolve via `UFUNCTION(Client, Reliable)` `ClientReceiveCharacterList(...)`.",
      "Para posição, mantenha `ACharacter` replicando movimento (`bReplicateMovement=true`) e, se precisar de atualização manual, crie `UFUNCTION(Server, Unreliable)` `ServerUpdatePosition(const FVector& Pos)`; não serialize bytes manualmente.",
      "Para movimento com caminhos, substitua o envio de Path[8] por `ServerMoveAlongPath(const TArray<uint8>& Directions)` e, no servidor, valide `PathNum` contra um limite constante; se a lógica exata de `DirTable` não estiver clara, registre 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++' e defina conforme o design.",
      "Exponha eventos de confirmação ao cliente com `UFUNCTION(Client, Unreliable)` se precisar notificar conclusão; todo fluxo usa RPCs da UE em vez do sistema de packets original."
    ]
  },
  "protocol-generic-send": {
    title: "Encapsular envios genéricos",
    steps: [
      "Substitua DataSend por RPCs nomeados. Para cada comando que exigia um cabeçalho, declare `UFUNCTION(Server, Reliable)` ou `NetMulticast` apropriado e remova o envio de buffers brutos.",
      "Para mensagens que eram BOTH_MESSAGE, crie um RPC genérico `UFUNCTION(NetMulticast, Unreliable)` `MulticastBroadcastMessage(uint8 MessageId, const TArray<uint8>& Payload)` se realmente precisar de payload bruto; caso contrário, modele propriedades específicas replicadas.",
      "Mantenha um componente ou subsistema apenas para roteamento dos RPCs e para registrar telemetria, deixando claro que o sistema de packets do projeto original não é utilizado na implementação Unreal."
    ]
  },
  "wsclient-socket-decode": {
    title: "Configurar socket assíncrono e parsing C1/C2/C3/C4",
    steps: [
      "No Unreal 5.7, não reimplemente a pilha de sockets do sistema de packets original; em vez disso, use o pipeline de rede padrão da UE com RPCs.",
      "Crie um `UGameInstanceSubsystem` para armazenar o estado original (contadores de serial, flags de checksum) apenas para referência/telemetria, marcando comentários sobre o comportamento do projeto original.",
      "Para cada mensagem que o `ProtocolCompiler` tratava (C1/C2/C3/C4), substitua por RPCs específicos (Server/Client/NetMulticast) e propriedades replicadas; elimine leitura manual de bytes e descriptografia SimpleModulus.",
      "Se a lógica de checksum for necessária, implemente-a em funções C++ normais e envie resultados por RPC; quando faltar detalhe do código, marque com 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "Documente na classe que o socket assíncrono é parte do sistema de packets do projeto original e que, na Unreal, a conectividade usa o subsistema online/replicação padrão."
    ]
  },
  "mapserver-change": {
    title: "Trocar para Map Server e reinicializar estado",
    steps: [
      "No Unreal 5.7, implemente a troca de mapa usando o fluxo de rede da UE: crie um `UGameInstanceSubsystem` `UMapServerManager` apenas para armazenar dados lidos do código original (JoinAuthCodes, HeroID, IP/porta) como referência local.",
      "Em `APlayerController`, declare `UFUNCTION(Server, Reliable)` `ServerRequestMapChange(const FString& HeroId)` que valida estados equivalentes a `LogIn` e `bFillServerInfo` e chama uma função no `AGameMode` para executar `ServerTravel` ou transição de nível.",
      "Antes da transição, chame funções locais equivalentes a ClearCharacters/InitGame se estiverem implementadas; quando não houver detalhes no código, marque 'NÃO DÁ PARA INFERIR COM SEGURANÇA COM BASE NO CÓDIGO-FONTE C++'.",
      "Use `UFUNCTION(Client, Reliable)` `ClientConfirmMapChange()` para sinalizar sucesso ao cliente; não reconstrua sockets nem envie buffers binários, pois o sistema de packets original não é usado na UE.",
      "Adicione getters BlueprintPure no subsistema para expor IP/porta/flags para UI, mas mantenha claro que a navegação efetiva ocorre via RPCs do GameMode/PlayerController."
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
