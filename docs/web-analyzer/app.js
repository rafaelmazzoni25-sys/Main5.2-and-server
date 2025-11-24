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
    flow: "LoadServerListScript abre ServerList.bmd, verifica erro, descriptografa campos com BuxConvert e insere SERVER_GROUP_INFO decodificados em m_mapServerListScript.",
    description: "Mantém um cache de grupos de servidor a partir do arquivo binário local, aplicando XOR rotativo (0xfc,0xcf,0xab) em cada byte lido antes de copiar para SServerGroupInfo." 
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
    flow: "Ambas as classes resetam iteradores (SetFirst) e percorrem coleções com GetNext, retornando ponteiros até esgotar a lista.",
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
    flow: "SetSelectServerInfo copia nome, índices e flags de PvP/teste em membros; getters retornam esses dados para UI/fluxo de conexão.",
    description: "Mantém estado do servidor escolhido pelo usuário, incluindo censura e flag de teste." 
  },
  {
    id: "protocol-connection",
    name: "Conexão e desconexão via CustomClient",
    type: "Cliente",
    files: ["ProtocolSend.cpp", "ProtocolSend.h"],
    classes: ["CProtocolSend", "CustomClient"],
    functions: ["ConnectServer", "DisconnectServer", "CheckConnected", "SendPingTest"],
    networkDetails: "Utiliza olc::net::client_interface<ProtocolHead> para conectar IP/Port, manter flag de conexão e enviar ping (CLIENT_LIVE_CLIENT).",
    flow: "ConnectServer instancia CustomClient e chama Connect; DisconnectServer zera g_bGameServerConnected e fecha socket; CheckConnected verifica IsConnected; SendPingTest delega a PingServer que envia tickcount e WORDs de teste.",
    description: "Gerencia o socket cliente e um ping simples usando cabeçalhos ProtocolHead." 
  },
  {
    id: "protocol-recv-dispatch",
    name: "Fila de recebimento e despacho de mensagens",
    type: "Cliente",
    files: ["ProtocolSend.cpp"],
    classes: ["CProtocolSend"],
    functions: ["RecvMessage"],
    networkDetails: "Processa mensagens ProtocolHead do servidor e encaminha para handlers locais ou TranslateProtocol.",
    flow: "Loop enquanto Incoming não vazio: pop_front.msg e switch em msg.header.id chamando RecvJoinServerNew, RecvLoginNew, ReceiveCharacterList, ReceiveMovePosition, ReceiveMoveCharacter ou TranslateProtocol para BOTH_MESSAGE." ,
    description: "Ponto central de despacho de pacotes recebidos, sem tratamento multithread ativado (loop comentado)." 
  },
  {
    id: "protocol-login-send",
    name: "Envio de login com codificação Bux",
    type: "Cliente",
    files: ["ProtocolSend.cpp", "ProtocolSend.h"],
    classes: ["CProtocolSend"],
    functions: ["SendRequestLogInNew"],
    networkDetails: "Envia PMSG_CONNECT_ACCOUNT_SEND via ProtocolHead::BOTH_CONNECT_LOGIN com campos codificados por BuxConvert e versão/serial do cliente.",
    flow: "Configura LogIn=1, CurrentProtocolState=REQUEST_LOG_IN, copia account/password com strncpy, faz BuxConvert nos campos, define TickCount/versão/serial e chama SendPacket." ,
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
    flow: "RecvJoinServerNew extrai HeroKey, registra versões e decide entre SendChangeMapServer ou mostrar m_LoginWin/erros; valida ClientVersion; RecvLoginNew trata códigos result específicos (0x00-0xD2) atualizando CurrentProtocolState/LogIn ou exibindo PopUpMsgWin." ,
    description: "Define o estado de conexão após resposta do servidor e aplica validação de versão e mensagens de erro específicas." 
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
      "Inclua método DisconnectServer para fechar socket e atualizar um bool replicado apenas para leitura se quiser refletir estado em outros clientes; caso contrário mantenha local." 
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
