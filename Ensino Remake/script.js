const curriculum = {
    preparacao: [
        {
            title: "Tour pelo pacote original",
            duration: "Dia 1",
            description:
                "Conheça cada pasta: identifique onde o cliente carrega recursos (Winmain.cpp, ZzzScene.cpp) e onde o servidor processa pacotes (GameMain.cpp, JSProtocol.cpp).",
            prereqs: [
                "Ler README.md destacando links para cliente e servidor",
                "Abrir Source Main 5.2/source e listar arquivos centrais (Winmain.cpp, NewUIMainFrameWindow.cpp, ProtocolSend.cpp)",
                "Visitar Source MuServer Update 15/ e apontar funções de ConnectServer, JoinServer, GameServer e DataServer",
                "Anotar dúvidas iniciais no diário de bordo"
            ]
        },
        {
            title: "Compilar o cliente original",
            duration: "Dia 2",
            description:
                "Abra Main.sln, ajuste caminhos de dependências e garanta que o build Debug executa sem erros. Isso valida seu ambiente de C++ antes de iniciar o remake.",
            prereqs: [
                "Configurar diretórios de include/lib em Project Properties",
                "Compilar Debug e Release verificando avisos",
                "Executar o cliente clássico e checar se o login abre",
                "Registrar soluções para erros de compilação encontrados"
            ]
        },
        {
            title: "Configurar ferramentas",
            duration: "Dia 3",
            description:
                "Instale softwares essenciais e confirme versões compatíveis com o código clássico e a Unreal Engine 5.3+.",
            prereqs: [
                "Instalar Visual Studio 2019 com Desktop development with C++ e Windows SDK 10",
                "Instalar Unreal Engine 5.3 ou superior via Epic Games Launcher",
                "Configurar Git (nome, e-mail, chave SSH ou token)",
                "Instalar SQL Server Express ou MariaDB para simular o DataServer"
            ]
        },
        {
            title: "Organizar assets reutilizáveis",
            duration: "Dia 4",
            description:
                "Separe texturas, fontes, sons e modelos do cliente clássico e catalogue onde cada item será reaproveitado na Unreal.",
            prereqs: [
                "Copiar Source Main 5.2/Global Release/Data para a área de trabalho",
                "Identificar texturas de interface em Interface/, UI/ e Mark/",
                "Criar estrutura Content/UI, Content/Audio e Content/Characters no projeto Unreal",
                "Registrar em planilha qual asset corresponde a cada tela ou efeito"
            ]
        },
        {
            title: "Rotina de estudos",
            duration: "Dia 5",
            description:
                "Monte um cronograma semanal equilibrando leitura de código, prática em C++ e implementação na Unreal. Documente avanços diariamente.",
            prereqs: [
                "Definir blocos de estudo para cliente, servidor e Unreal",
                "Criar diário de bordo (caderno, Notion ou Google Docs)",
                "Configurar lembretes para pausas, revisão e backup",
                "Criar checklist por módulo (UI, rede, banco, efeitos)"
            ]
        },
        {
            title: "Mapear o fluxo do cliente",
            duration: "Dia 6",
            description:
                "Entenda a sequência de inicialização do Main 5.2: leitura de recursos, criação do HUD e chamadas de rede. Esse mapa orienta a arquitetura do remake.",
            prereqs: [
                "Desenhar fluxograma com funções principais de Winmain.cpp",
                "Relacionar cenas em ZzzScene.cpp com janelas do NewUI",
                "Listar chamadas de ProtocolSend.cpp usadas em LoginWin.cpp",
                "Esboçar layout da HUD baseado em NewUIMainFrameWindow.cpp"
            ]
        },
        {
            title: "Catalogar protocolos essenciais",
            duration: "Dia 7",
            description:
                "Registre pacotes obrigatórios (login, lista de personagens, movimento, chat) observando como ProtocolSend.cpp envia e Protocol.cpp recebe.",
            prereqs: [
                "Identificar enums em ProtocolHead (cliente) e cases em Protocol.cpp (servidor)",
                "Documentar estrutura de login com BuxConvert e versão",
                "Associar cada pacote a uma tela ou ação da Unreal",
                "Criar tabela inicial para acompanhar testes de rede"
            ]
        },
        {
            title: "Serviços do MuServer",
            duration: "Dia 8",
            description:
                "Analise ConnectServer, JoinServer, GameServer e DataServer para compreender a jornada completa do jogador e preparar scripts de inicialização.",
            prereqs: [
                "Ler ConnectServer/ConnectServer.cpp destacando configuração de sockets",
                "Revisar JoinServer/GameServer/JSProtocol.cpp para login e movimentação",
                "Estudar GameServer/GameServer/GameMain.cpp observando timers e conexões",
                "Ler DataServer/DataServer/DataServerProtocol.cpp e listar chamadas ao banco"
            ]
        },
        {
            title: "Projeto base na Unreal",
            duration: "Dia 9",
            description:
                "Crie o projeto Unreal Engine 5 que receberá o remake, configure plugins e estabeleça pastas de conteúdo alinhadas ao código clássico.",
            prereqs: [
                "Criar projeto Third Person em C++ com nome EnsinoRemake",
                "Ativar Git Source Control, Online Subsystem e qualquer plugin necessário (ex.: WebSocket)",
                "Configurar módulos C++ (Core, NetworkBridge, UI) no .uproject",
                "Adicionar nível Test_Level com personagem padrão para validar build"
            ]
        },
        {
            title: "Mapeamento do banco de dados",
            duration: "Dia 10",
            description:
                "Configure o banco com tabelas Account, Character e Warehouse e teste stored procedures chamadas pelo DataServer antes de conectar a Unreal.",
            prereqs: [
                "Criar banco com collation compatível (Latin1_General_CI_AI)",
                "Executar script de criação de contas e personagens de teste",
                "Testar procedures equivalentes a GDCharacterListRecv/GDWarehouseItemRecv",
                "Documentar credenciais e portas usadas pelos serviços"
            ]
        },
        {
            title: "Primeiro commit documentado",
            duration: "Dia 11",
            description:
                "Registre o estado inicial do projeto no Git, anexando notas com ferramentas instaladas, assets separados e links para scripts SQL.",
            prereqs: [
                "Executar git status e revisar arquivos adicionados",
                "Escrever README curto explicando objetivos e dependências",
                "Criar commit inicial listando passos concluídos",
                "Enviar o commit para o repositório remoto ou backup local"
            ]
        }
    ],
    geral: [
        {
            title: "Preparação & Ferramentas",
            duration: "Semana 1",
            description:
                "Consolide ambiente, assets organizados e projeto Unreal configurado. Garanta que cliente, servidor e Unreal abrem sem erros e documente a estrutura completa.",
            prereqs: [
                "Completar todos os passos da preparação inicial (dias 1 a 11)",
                "Compilar Main.sln (Debug e Release) e registrar dependências usadas",
                "Executar projeto Unreal validando Test_Level e logando em arquivo",
                "Atualizar checklist com caminhos para assets, scripts SQL e serviços"
            ]
        },
        {
            title: "Fundamentos do Cliente",
            duration: "Semanas 2-3",
            description:
                "Recrie telas principais, entenda o fluxo do <code>CNewUIManager</code> e registre como <code>ProtocolSend.cpp</code> lida com autenticação e movimentação.",
            prereqs: [
                "Documentar arquivos-chave (LoginWin.cpp, NewUIMainFrameWindow.cpp, NewUIInventoryCtrl.cpp)",
                "Listar pacotes enviados por gProtocolSend nas ações de login, seleção e movimento",
                "Criar protótipo de HUD no Unreal usando assets importados",
                "Capturar screenshots do cliente original e anexar ao diário"
            ]
        },
        {
            title: "Base na Unreal Engine 5",
            duration: "Semanas 4-5",
            description:
                "Construa navegação de login e seleção na Unreal, importando assets e conectando Widgets a funções C++ que simulam <code>ProtocolSend</code>.",
            prereqs: [
                "Criar Widgets para login/seleção inspirados em LoginWin.cpp e CharSelMainWin.cpp",
                "Importar texturas de interface e configurar fontes/paleta",
                "Implementar GameMode, GameState e GameInstance personalizados",
                "Simular pacotes de login em modo offline e validar feedback visual"
            ]
        },
        {
            title: "Fundamentos do Servidor",
            duration: "Semanas 6-7",
            description:
                "Compile os serviços do MuServer, configure o banco e garanta que ConnectServer, JoinServer e GameServer trocam mensagens básicas com o cliente clássico.",
            prereqs: [
                "Compilar ConnectServer, JoinServer, GameServer e DataServer sem warnings críticos",
                "Configurar banco com tabelas Account/Character/Warehouse",
                "Executar JoinServer e verificar logs aceitando o cliente clássico",
                "Criar scripts de inicialização e desligamento para cada serviço"
            ]
        },
        {
            title: "Integração & Testes",
            duration: "Semanas 8-9",
            description:
                "Sincronize autenticação, movimentação e inventário entre a Unreal e o MuServer. Crie cenários de teste guiados para validar cada requisito e comparar logs com o cliente original.",
            prereqs: [
                "Cliente Unreal conectando ao JoinServer com pacote de login completo",
                "GameServer registrando movimento/ação via JSProtocol.cpp e Protocol.cpp",
                "Inventário replicado comparando slots com <code>CNewUIInventoryCtrl</code> e DataServer",
                "Planilha de bugs com prioridade, responsável e status"
            ]
        },
        {
            title: "Polimento & Publicação",
            duration: "Semana 10",
            description:
                "Refine efeitos, otimize pacotes, gere builds finais da Unreal e documente instalação para que novos estudantes repitam o processo sem consultar fontes externas.",
            prereqs: [
                "Executar build Shipping no Unreal e validar desempenho em máquina de referência",
                "Registrar melhorias gráficas priorizadas (Niagara, materiais)",
                "Preparar guia passo a passo de instalação para cliente e servidor",
                "Rodar testes com voluntários e coletar feedback documentado"
            ]
        },
        {
            title: "Mentoria & Registro do conhecimento",
            duration: "Semana 11",
            description:
                "Transforme o aprendizado em material educativo: revise anotações, grave vídeos curtos e atualize este guia para novos estudantes.",
            prereqs: [
                "Atualizar documentação com links para arquivos citados",
                "Gravar demonstração de 5 minutos mostrando o remake",
                "Publicar FAQ com dúvidas que surgiram durante o processo",
                "Planejar próximos passos (novas features ou correções)"
            ]
        }
    ],
    frontend: [
        {
            title: "Recompilar o cliente base",
            duration: "Semana 2",
            description:
                "Abra Main.sln, ajuste dependências em Source Main 5.2/dependencies e garanta builds Debug/Release limpos reproduzindo o executável original.",
            prereqs: [
                "Configurar caminhos de include e lib das dependências",
                "Gerar builds Debug/Release anotando qualquer alteração necessária",
                "Testar execução do cliente original em ambiente local com logs ativos",
                "Salvar relatório com erros encontrados e soluções aplicadas"
            ]
        },
        {
            title: "Mapear inicialização e cenas",
            duration: "Semana 2",
            description:
                "Estude Winmain.cpp e ZzzScene.cpp para entender como o cliente inicializa o DirectX/OpenGL, carrega recursos e muda entre tela de login, seleção e jogo.",
            prereqs: [
                "Anotar cada função chamada dentro de WinMain",
                "Documentar eventos de cena em ZzzScene.cpp",
                "Relacionar recursos carregados em ZzzBMD.cpp e ZzzObject.cpp",
                "Criar fluxograma com estados principais do cliente"
            ]
        },
        {
            title: "Explorar UI clássica",
            duration: "Semana 3",
            description:
                "Mapeie telas como LoginWin.cpp, CharSelMainWin.cpp e NewUIMainFrameWindow.cpp registrando botões, sons e interações necessários para a Unreal.",
            prereqs: [
                "Listar widgets e textos exibidos em cada janela",
                "Salvar referências de texturas em Global Release/Data",
                "Identificar funções em UIControls.cpp usadas pelos botões",
                "Registrar eventos de áudio disparados via DSPlaySound.h"
            ]
        },
        {
            title: "Gerenciador de UI",
            duration: "Semana 3",
            description:
                "Resuma a lógica de abertura e fechamento de janelas baseada em NewUIManager.cpp e UIControls.cpp e desenhe o equivalente com Widgets e Subsystems na Unreal.",
            prereqs: [
                "Listar janelas controladas por NewUIManager.cpp",
                "Entender hierarquia de componentes em UIControls.cpp",
                "Mapear atalhos de teclado e mouse configurados",
                "Escrever pseudo-código da lógica de alternância de janelas"
            ]
        },
        {
            title: "HUD e inventário",
            duration: "Semana 4",
            description:
                "Remonte o HUD principal (NewUIMainFrameWindow.cpp) e o inventário (NewUIInventoryCtrl.cpp), anotando dados necessários para replicação e sincronização com o servidor.",
            prereqs: [
                "Identificar structs de itens usadas em ZzzInventory.h",
                "Relacionar slots e colunas com NewUIInventoryCtrl.cpp",
                "Separar texturas do HUD em Global Release/Data/Interface",
                "Anotar atualizações de HP/MP em ZzzCharacter.cpp"
            ]
        },
        {
            title: "Sistema de input e câmera",
            duration: "Semana 4",
            description:
                "Analise arquivos como MouseProc.cpp, Input.h e CameraMove.cpp para entender entradas, sensibilidade e câmera a serem replicadas na Unreal.",
            prereqs: [
                "Ler MouseProc.cpp e mapear botões do mouse",
                "Estudar CameraMove.cpp para comportamento da câmera",
                "Registrar ajustes de sensibilidade e limites",
                "Comparar entradas com configurações atuais da Unreal"
            ]
        },
        {
            title: "Protocolos de rede",
            duration: "Semana 5",
            description:
                "Analise ProtocolSend.cpp, WSclient.cpp e wsclientinline.h para entender conexão, login, seleção e movimentação e preparar equivalentes na Unreal.",
            prereqs: [
                "Catalogar pacotes enviados por ProtocolSend.cpp",
                "Documentar handlers em WSclient.cpp e wsclientinline.h",
                "Testar conexão local com JoinServer",
                "Salvar logs de rede para comparar com a Unreal"
            ]
        },
        {
            title: "Efeitos e otimização",
            duration: "Semana 5",
            description:
                "Analise ZzzEffect.cpp, SkillEffectMgr.cpp, TextureScript.cpp e arquivos de modelos (ZzzBMD.cpp) para decidir quais efeitos migrar para Niagara ou materiais dinâmicos.",
            prereqs: [
                "Listar efeitos essenciais para a primeira versão",
                "Medir impacto de partículas no cliente clássico",
                "Definir estratégia para efeitos avançados no Unreal",
                "Criar backlog de otimizações pós-lançamento"
            ]
        },
        {
            title: "Depuração e ferramentas",
            duration: "Semana 6",
            description:
                "Estude utilitários em ./Utilities/ (logs, crash reporter) para implementar diagnósticos equivalentes no remake e manter aprendizes informados.",
            prereqs: [
                "Ativar g_ConsoleDebug no cliente clássico e observar saídas",
                "Configurar builds com símbolos para usar CrashReporter",
                "Documentar pontos de log importantes em ProtocolSend e Winmain",
                "Planejar ferramentas de captura de log para a Unreal"
            ]
        }
    ],
    unreal: [
        {
            title: "Criar projeto remake",
            duration: "Semana 4",
            description:
                "Configure o projeto Unreal com controle de versão, módulos C++ (Core, NetworkBridge, UI) e plugins necessários para replicar rede e UI do Main 5.2.",
            prereqs: [
                "Ativar plug-ins Git Source Control, Online Subsystem e WebSocket/TCP conforme necessidade",
                "Criar branches Git específicos (interface, gameplay, rede)",
                "Configurar pastas Content/UI, Content/Characters e Content/Maps",
                "Documentar convenções de nome (prefixos BP_, WB_, C++, FX_)"
            ]
        },
        {
            title: "Interface com UMG",
            duration: "Semana 4",
            description:
                "Reproduza o fluxo de login e seleção em Widgets UMG inspirados em LoginWin.cpp e CharSelMainWin.cpp, conectando botões a eventos Blueprint e chamadas C++.",
            prereqs: [
                "Importar fontes e texturas do Main 5.2",
                "Criar Widget Blueprint WB_LoginMenu com validação e estados de carregamento",
                "Configurar Widget WB_SelectCharacter com ListViews e dados recebidos",
                "Testar estados de erro (login inválido, servidor offline)"
            ]
        },
        {
            title: "Personagem e controles",
            duration: "Semana 5",
            description:
                "Configure movimentação, câmera e animações com Enhanced Input, Animation Blueprints e valores retirados de ZzzCharacter.cpp e CameraMove.cpp.",
            prereqs: [
                "Criar InputActions para movimento, câmera, ataque e interação",
                "Conectar Animation Blueprint às malhas importadas do cliente clássico",
                "Sincronizar velocidade, aceleração e limites com dados de ZzzCharacter.cpp",
                "Configurar modos de câmera alternando entre mouse travado e livre"
            ]
        },
        {
            title: "Inventário replicado",
            duration: "Semana 6",
            description:
                "Implemente inventário usando Actor Components replicados, Data Tables e widgets dinâmicos, sincronizando slots com pacotes definidos em Protocol.cpp e DataServerProtocol.cpp.",
            prereqs: [
                "Criar struct FItemSlot inspirada em ZzzInventory.h e ItemAttribute",
                "Montar Widget WB_Inventory com grids e drag & drop",
                "Conectar componente de inventário à UI atualizando slots replicados",
                "Testar adição/remoção de itens em sessão multiplayer local"
            ]
        },
        {
            title: "Comunicação com MuServer",
            duration: "Semana 7",
            description:
                "Implemente sockets TCP/UDP na Unreal para enviar pacotes compatíveis com ProtocolSend.cpp e consumir respostas tratadas por JSProtocol.cpp/Protocol.cpp.",
            prereqs: [
                "Criar módulo C++ NetworkBridge com classes de conexão e filas",
                "Serializar pacotes seguindo formato C1/C3 e estrutura do cliente clássico",
                "Registrar pacotes recebidos comparando com WSclient.cpp",
                "Implementar reconexão, heartbeat e feedback visual no HUD"
            ]
        },
        {
            title: "Build e automação",
            duration: "Semana 9",
            description:
                "Gere builds Development e Shipping, automatize empacotamento e alinhe a distribuição com os serviços do MuServer.",
            prereqs: [
                "Executar File > Package Project para Windows",
                "Criar script que copia dependências e configura arquivos .ini",
                "Rodar testes automatizados de navegação com Unreal Automation",
                "Documentar procedimento de instalação passo a passo"
            ]
        },
        {
            title: "Telemetria e suporte",
            duration: "Semana 9",
            description:
                "Implemente dashboards simples para exibir ping, FPS, status de serviços e erros capturados, auxiliando iniciantes na depuração do remake.",
            prereqs: [
                "Criar eventos que capturem ping/FPS e os exibam no HUD",
                "Mostrar status de conexão com ConnectServer/JoinServer",
                "Registrar falhas em arquivo inspirado no CrashReporter",
                "Publicar checklist de suporte e recuperação rápida"
            ]
        }
    ],
    backend: [
        {
            title: "Topologia do MuServer",
            duration: "Semana 6",
            description:
                "Entenda como ConnectServer, JoinServer, GameServer e DataServer trocam dados. Desenhe o fluxo completo desde a conexão inicial até a entrega de pacotes comparando com Protocol.cpp.",
            prereqs: [
                "Ler arquivos de configuração (.ini) de cada serviço",
                "Desenhar diagrama com portas utilizadas e sequência de mensagens",
                "Identificar logs gerados (ServerDisplayer, LogAdd) em cada processo",
                "Reservar portas locais e ajustar firewall para testes"
            ]
        },
        {
            title: "Build dos serviços",
            duration: "Semana 6",
            description:
                "Compile todos os projetos em Source MuServer Update 15 garantindo que Util/ forneça bibliotecas corretas e que dependências externas estejam acessíveis.",
            prereqs: [
                "Abrir soluções individuais (ConnectServer.sln, JoinServer.sln, etc.)",
                "Resolver referências faltantes em Util/",
                "Gerar executáveis em modo Debug/Release",
                "Documentar caminho de saída e parâmetros de cada build"
            ]
        },
        {
            title: "Autenticação",
            duration: "Semana 7",
            description:
                "Implemente e teste o fluxo de login completo: ConnectServer redireciona, JoinServer valida e GameServer inicia sessão com base no banco e no JSProtocol.cpp.",
            prereqs: [
                "Criar contas de teste no banco de dados",
                "Ativar logs detalhados em JoinServer/JoinServer.cpp",
                "Simular tentativas de login válidas e inválidas",
                "Verificar mensagens enviadas para o cliente Unreal"
            ]
        },
        {
            title: "Persistência e economia",
            duration: "Semana 8",
            description:
                "Revise DataServer e as estruturas de itens/experiência para garantir gravação consistente e compatibilidade com o inventário e a progressão do remake na Unreal.",
            prereqs: [
                "Mapear tabelas de itens e personagens no banco",
                "Testar salvamento de inventário via DataServerProtocol.cpp",
                "Revisar rotinas de reset em GameServer/GameServer/User.cpp",
                "Configurar backup automático do banco de dados"
            ]
        },
        {
            title: "Sincronização com Unreal",
            duration: "Semana 8",
            description:
                "Ajuste Protocol.cpp, JSProtocol.cpp e DataServerProtocol.cpp para aceitar pacotes enviados pela Unreal, garantindo que posições, inventário e eventos estejam alinhados.",
            prereqs: [
                "Comparar estrutura de pacotes com o cliente original",
                "Implementar logs customizados para cada mensagem",
                "Validar movimentação sincronizada com dois clientes Unreal",
                "Atualizar documentação quando pacotes forem alterados"
            ]
        },
        {
            title: "Eventos e sistemas avançados",
            duration: "Semana 9",
            description:
                "Ative eventos como Blood Castle e Castle Siege no GameServer conforme as interfaces equivalentes ficarem prontas na Unreal.",
            prereqs: [
                "Identificar arquivos de configuração de eventos (por exemplo, GameServer/Data/Event)",
                "Sincronizar horários e recompensas com o cliente",
                "Criar plano de testes específico para cada evento",
                "Registrar limitações temporárias para versões iniciais"
            ]
        },
        {
            title: "Implantação local controlada",
            duration: "Semana 9",
            description:
                "Prepare scripts para iniciar/derrubar serviços, monitore logs em tempo real e estabeleça rotina de testes integrados com o cliente da Unreal.",
            prereqs: [
                "Criar scripts batch ou PowerShell para start/stop",
                "Configurar rotação de logs usando ferramentas do Windows",
                "Executar sessões de teste com o cliente remake",
                "Anotar métricas básicas (tempo de login, ping, FPS)"
            ]
        },
        {
            title: "Monitoramento e suporte",
            duration: "Semana 10",
            description:
                "Implemente dashboards ou planilhas para acompanhar erros, métricas de servidor e feedback dos jogadores durante a fase de testes.",
            prereqs: [
                "Definir indicadores como número de conexões simultâneas",
                "Criar planilha para acompanhar crashes e soluções",
                "Agendar reuniões semanais de revisão com a equipe",
                "Planejar estratégia de suporte para novos testers"
            ]
        }
    ]
};

const assetConversionRules = [
    {
        id: "ui-textures",
        label: "Texturas de interface (.OZJ/.OZT)",
        description:
            "Imagens da HUD, menus e notificações carregadas pelo cliente clássico em NewUIMainFrameWindow.",
        extensions: [".ozj", ".ozt"],
        target: "<code>.PNG</code> 32 bits com <em>sRGB</em>",
        destination: "<code>Content/UI/HUD</code>",
        steps: [
            "Abrir os arquivos no MuOZ Extractor e exportar para PNG mantendo o mesmo nome.",
            "Revisar as texturas na pasta Interface para conferir alinhamento com o layout original.",
            "Importar em lote para o Unreal e atribuir às imagens do widget WB_HUDMain e demais UIs recreadas."
        ],
        references: [
            {
                path: "Source Main 5.2/source/NewUIMainFrameWindow.cpp",
                note: "Carga das texturas e botões do HUD"
            },
            {
                path: "Source Main 5.2/bin/Data/Interface",
                note: "Arquivos .OZJ/.OZT originais"
            }
        ]
    },
    {
        id: "character-models",
        label: "Modelos 3D (.BMD/.SMD)",
        description:
            "Meshes e animações usadas por personagens, monstros e objetos interativos definidos em ZzzBMD.",
        extensions: [".bmd", ".smd"],
        target: "<code>.FBX</code> com esqueleto compartilhado",
        destination: "<code>Content/Characters</code> e <code>Content/Monsters</code>",
        steps: [
            "Abrir o modelo no MuModel Viewer (ou ferramenta equivalente) e exportar FBX incluindo animações chave.",
            "Validar hierarquia de ossos conforme a estrutura documentada em ZzzBMD.cpp antes de importar no Unreal.",
            "Ativar \"Use T0 As Ref Pose\" no importador do Unreal e retargetar para o esqueleto player/monster."
        ],
        references: [
            {
                path: "Source Main 5.2/source/ZzzBMD.cpp",
                note: "Estrutura de ossos e animações"
            },
            {
                path: "Source Main 5.2/bin/Data/Character",
                note: "Modelos originais do cliente"
            }
        ]
    },
    {
        id: "terrain-maps",
        label: "Terrenos e atributos (.MAP/.ATT)",
        description:
            "Arquivos responsáveis por altura, colisão e zonas especiais de cada mundo carregados por ZzzOpenData.",
        extensions: [".map", ".att", ".att1"],
        target: "Heightmap <code>.RAW16</code> + tabelas <code>.CSV</code>",
        destination: "<code>Content/Levels</code> e <code>Content/Data/Terrain</code>",
        steps: [
            "Converter os arquivos .MAP para imagens RAW16 usando MuTerrain Tool ou scripts Python dedicados.",
            "Gerar uma planilha CSV com os atributos das .ATT para popular DataTables de colisão no Unreal.",
            "Aplicar as máscaras no Landscape e configurar volumes de colisão seguindo os flags usados no cliente clássico."
        ],
        references: [
            {
                path: "Source Main 5.2/source/ZzzOpenData.cpp",
                note: "Persistência de Terrain.map e Terrain.att"
            },
            {
                path: "Source Main 5.2/source/MapManager.cpp",
                note: "Leitura dos atributos de terreno"
            }
        ]
    },
    {
        id: "effect-packages",
        label: "Pacotes de efeitos (.OZB)",
        description:
            "Arquivos compactados que agrupam texturas e dados de efeitos usados por partículas e terrenos LOD.",
        extensions: [".ozb"],
        target: "Extrair para <code>.PNG</code>/<code>.TGA</code> antes da importação",
        destination: "<code>Content/FX</code> e <code>Content/Terrain</code>",
        steps: [
            "Usar MuOZ Extractor para abrir o pacote .OZB e recuperar os arquivos internos .OZJ/.OZT.",
            "Converter os recursos extraídos para PNG ou TGA respeitando canais alfa e iluminação original.",
            "Importar os assets no Unreal e recriar sistemas Niagara conforme parâmetros de efeito clássicos."
        ],
        references: [
            {
                path: "Source Main 5.2/source/ZzzLodTerrain.cpp",
                note: "Uso dos pacotes OZB nos terrenos"
            },
            {
                path: "Source Main 5.2/source/GlobalBitmap.cpp",
                note: "Geração e salvamento de OZB"
            }
        ]
    },
    {
        id: "legacy-tga",
        label: "Texturas legadas (.TGA)",
        description:
            "Arquivos já compatíveis com o importador da Unreal, mas que exigem ajustes de compressão e canais.",
        extensions: [".tga"],
        target: "Importar direto com ajustes de compressão",
        destination: "<code>Content/UI</code> e <code>Content/FX</code>",
        steps: [
            "Verificar se o canal alfa está correto e aplicar compressão \"UserInterface2D\" ou \"HDR\" conforme o caso.",
            "Para mapas normais, habilitar \"Flip Green Channel\" seguindo o padrão de sombreamento do cliente original.",
            "Revisar materiais criados automaticamente para garantir que o sRGB esteja ativado somente quando necessário."
        ],
        references: [
            {
                path: "Source Main 5.2/source/ZzzOpenData.cpp",
                note: "Carregamento de bitmaps e texturas TGA"
            }
        ]
    }
];

const extensionRuleMap = new Map();
assetConversionRules.forEach((rule) => {
    rule.extensions.forEach((ext) => {
        extensionRuleMap.set(ext, rule);
    });
});

const nativeCompatibleExtensions = new Set([".png", ".wav", ".ogg", ".fbx", ".uasset", ".umap", ".ubulk"]);
const numberFormatter = new Intl.NumberFormat("pt-BR");

const assetInput = document.getElementById("asset-root-input");
const assetStatus = document.getElementById("asset-tool-status");
const assetSummary = document.getElementById("asset-tool-summary");
const assetResults = document.getElementById("asset-results");
const assetTotalEl = document.getElementById("asset-total-files");
const assetConvertibleEl = document.getElementById("asset-convertible-files");
const assetCompatibleEl = document.getElementById("asset-compatible-files");
const assetVisualization = document.getElementById("asset-visualization");
const assetVisualizationStatus = document.getElementById("asset-visualization-status");
const assetVisualizationList = document.getElementById("asset-visualization-list");

const visualizationCategories = [
    {
        id: "hud",
        label: "HUD",
        description: "Texturas e layouts da interface clássica.",
        keywords: ["/interface/", "/hud", "/ui/"]
    },
    {
        id: "inventory",
        label: "Inventário",
        description: "Ícones, slots e tabelas usados no inventário do jogo.",
        keywords: ["/item", "/inventory", "/equip"]
    },
    {
        id: "characters",
        label: "Personagens",
        description: "Modelos, animações e dados de personagens e monstros.",
        keywords: ["/character", "/monster", "/npc"]
    }
];

function normaliseExtension(path) {
    const lastDot = path.lastIndexOf(".");
    if (lastDot === -1) {
        return "";
    }
    return path.slice(lastDot).toLowerCase();
}

function normalisePath(path) {
    return path.replace(/\\/g, "/");
}

function createList(items, className, ordered = false) {
    const element = document.createElement(ordered ? "ol" : "ul");
    element.className = className;
    items.forEach((item) => {
        const li = document.createElement("li");
        if (item && item.__html) {
            li.innerHTML = item.__html;
        } else {
            li.textContent = item;
        }
        element.appendChild(li);
    });
    return element;
}

function buildReferenceText(references) {
    if (!references || references.length === 0) {
        return null;
    }

    const paragraph = document.createElement("p");
    paragraph.className = "asset-tool__references";

    const strong = document.createElement("strong");
    strong.textContent = "Referências do código original: ";
    paragraph.appendChild(strong);

    references.forEach((ref, index) => {
        const code = document.createElement("code");
        code.textContent = ref.path;
        paragraph.appendChild(code);
        if (ref.note) {
            const span = document.createElement("span");
            span.textContent = ` — ${ref.note}`;
            paragraph.appendChild(span);
        }
        if (index < references.length - 1) {
            paragraph.appendChild(document.createTextNode(" · "));
        }
    });

    return paragraph;
}

function renderAssetGroups(groups, totals) {
    if (!assetResults) {
        return;
    }

    assetResults.innerHTML = "";

    if (groups.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "asset-tool__empty";
        emptyState.textContent =
            "Nenhum arquivo que exija conversão foi identificado automaticamente. Revise o diretório selecionado ou analise manualmente os formatos desconhecidos.";
        assetResults.appendChild(emptyState);
        return;
    }

    groups.forEach(({ rule, files }) => {
        const category = document.createElement("article");
        category.className = "asset-tool__category";

        const title = document.createElement("h4");
        title.textContent = rule.label;
        category.appendChild(title);

        const description = document.createElement("p");
        description.className = "asset-tool__description";
        description.textContent = rule.description;
        category.appendChild(description);

        const metaList = document.createElement("div");
        metaList.className = "asset-tool__meta";

        const count = document.createElement("p");
        count.innerHTML = `<strong>Arquivos detectados:</strong> ${numberFormatter.format(files.length)}`;
        metaList.appendChild(count);

        const target = document.createElement("p");
        target.innerHTML = `<strong>Formato Unreal:</strong> ${rule.target}`;
        metaList.appendChild(target);

        const destination = document.createElement("p");
        destination.innerHTML = `<strong>Destino sugerido:</strong> ${rule.destination}`;
        metaList.appendChild(destination);

        category.appendChild(metaList);

        const sampleLabel = document.createElement("p");
        sampleLabel.className = "asset-tool__samples-label";
        sampleLabel.textContent = "Exemplos encontrados:";
        category.appendChild(sampleLabel);

        const samplesList = document.createElement("ul");
        samplesList.className = "asset-tool__samples";

        files.slice(0, 6).forEach((file) => {
            const item = document.createElement("li");
            const code = document.createElement("code");
            code.textContent = file;
            item.appendChild(code);
            samplesList.appendChild(item);
        });

        if (files.length > 6) {
            const remainingItem = document.createElement("li");
            remainingItem.textContent = `… +${numberFormatter.format(files.length - 6)} outros`;
            samplesList.appendChild(remainingItem);
        }

        category.appendChild(samplesList);

        const details = document.createElement("details");
        details.className = "asset-tool__details";
        details.open = true;

        const summary = document.createElement("summary");
        summary.textContent = "Passo a passo de conversão";
        details.appendChild(summary);

        const stepsList = createList(
            rule.steps.map((step) => ({ __html: step })),
            "asset-tool__steps",
            true
        );
        details.appendChild(stepsList);

        category.appendChild(details);

        const references = buildReferenceText(rule.references);
        if (references) {
            category.appendChild(references);
        }

        assetResults.appendChild(category);
    });

    if (totals.unknown > 0) {
        const unknownWarning = document.createElement("p");
        unknownWarning.className = "asset-tool__unknown";
        unknownWarning.innerHTML =
            `<strong>Atenção:</strong> ${numberFormatter.format(
                totals.unknown
            )} arquivo(s) não foram classificados automaticamente. Consulte o diário de bordo para anotá-los e verifique se pertencem a scripts, textos ou formatos proprietários.`;
        assetResults.appendChild(unknownWarning);
    }
}

function resetAssetVisualization() {
    if (!assetVisualization || !assetVisualizationList) {
        return;
    }

    assetVisualization.setAttribute("hidden", "");
    assetVisualizationList.innerHTML = "";
    if (assetVisualizationStatus) {
        assetVisualizationStatus.textContent =
            "Selecione a pasta Data para localizar rapidamente arquivos de HUD, Inventário e Personagens.";
    }
}

function renderAssetVisualization(paths) {
    if (!assetVisualization || !assetVisualizationList) {
        return;
    }

    if (!paths || paths.length === 0) {
        resetAssetVisualization();
        return;
    }

    assetVisualizationList.innerHTML = "";

    const results = visualizationCategories.map((category) => {
        const files = paths
            .filter((entry) =>
                category.keywords.some((keyword) => entry.lower.includes(keyword))
            )
            .map((entry) => entry.display);

        return { ...category, files };
    });

    const totalMatches = results.reduce((sum, category) => sum + category.files.length, 0);

    assetVisualization.removeAttribute("hidden");

    if (assetVisualizationStatus) {
        if (totalMatches === 0) {
            assetVisualizationStatus.textContent =
                "Nenhum arquivo característico de HUD, Inventário ou Personagens foi encontrado automaticamente.";
        } else {
            assetVisualizationStatus.textContent = `Encontrados ${numberFormatter.format(
                totalMatches
            )} arquivo(s) ligados à HUD, Inventário e Personagens. Veja amostras abaixo.`;
        }
    }

    if (totalMatches === 0) {
        const empty = document.createElement("p");
        empty.className = "asset-visualization__empty";
        empty.textContent =
            "Confirme se a pasta Data contém Interface, Item e Character para visualizar este resumo.";
        assetVisualizationList.appendChild(empty);
        return;
    }

    results.forEach((category) => {
        if (category.files.length === 0) {
            return;
        }

        const card = document.createElement("article");
        card.className = "asset-visualization__card";

        const title = document.createElement("h5");
        title.textContent = category.label;
        card.appendChild(title);

        const count = document.createElement("p");
        count.className = "asset-visualization__count";
        count.textContent = `${numberFormatter.format(category.files.length)} arquivo(s)`;
        card.appendChild(count);

        const description = document.createElement("p");
        description.className = "asset-visualization__description";
        description.textContent = category.description;
        card.appendChild(description);

        const sampleFiles = category.files.slice(0, 5);
        if (sampleFiles.length > 0) {
            const samplesLabel = document.createElement("p");
            samplesLabel.className = "asset-visualization__samples-label";
            samplesLabel.textContent = "Exemplos:";
            card.appendChild(samplesLabel);

            const list = document.createElement("ul");
            list.className = "asset-visualization__samples";

            sampleFiles.forEach((filePath) => {
                const item = document.createElement("li");
                const code = document.createElement("code");
                code.textContent = filePath;
                item.appendChild(code);
                list.appendChild(item);
            });

            if (category.files.length > sampleFiles.length) {
                const more = document.createElement("li");
                more.textContent = `… +${numberFormatter.format(
                    category.files.length - sampleFiles.length
                )} outros`;
                list.appendChild(more);
            }

            card.appendChild(list);
        }

        assetVisualizationList.appendChild(card);
    });
}

function handleAssetSelection(event) {
    if (!assetStatus || !assetTotalEl || !assetConvertibleEl || !assetCompatibleEl) {
        return;
    }

    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
        assetSummary?.setAttribute("hidden", "");
        assetStatus.textContent =
            "Nenhum diretório analisado ainda. Assim que você apontar a pasta Data, os resultados aparecem aqui.";
        assetResults && (assetResults.innerHTML = "");
        resetAssetVisualization();
        return;
    }

    const grouped = new Map();
    let convertible = 0;
    let compatible = 0;
    let unknown = 0;
    const analysedPaths = [];

    files.forEach((file) => {
        const rawPath = file.webkitRelativePath || file.name;
        const relativePath = normalisePath(rawPath);
        analysedPaths.push({ display: relativePath, lower: relativePath.toLowerCase() });
        const extension = normaliseExtension(relativePath);

        if (extensionRuleMap.has(extension)) {
            const rule = extensionRuleMap.get(extension);
            convertible += 1;
            if (!grouped.has(rule.id)) {
                grouped.set(rule.id, { rule, files: [] });
            }
            grouped.get(rule.id).files.push(relativePath);
        } else if (nativeCompatibleExtensions.has(extension)) {
            compatible += 1;
        } else {
            unknown += 1;
        }
    });

    const total = files.length;
    const convertiblePercent = total ? Math.round((convertible / total) * 100) : 0;
    const compatiblePercent = total ? Math.round((compatible / total) * 100) : 0;

    assetTotalEl.textContent = numberFormatter.format(total);
    assetConvertibleEl.textContent = numberFormatter.format(convertible);
    assetCompatibleEl.textContent = numberFormatter.format(compatible);

    const summaryText = [`Analisados ${numberFormatter.format(total)} arquivo(s).`];
    summaryText.push(
        `${numberFormatter.format(convertible)} precisam de conversão (${convertiblePercent}% do total).`
    );
    summaryText.push(
        `${numberFormatter.format(compatible)} já são aceitos pela Unreal (${compatiblePercent}%).`
    );
    if (unknown > 0) {
        summaryText.push(
            `${numberFormatter.format(unknown)} arquivo(s) exigem revisão manual (formatos proprietários ou scripts).`
        );
    }

    assetStatus.textContent = summaryText.join(" ");
    assetSummary?.removeAttribute("hidden");

    const groups = Array.from(grouped.values()).sort((a, b) => b.files.length - a.files.length);
    renderAssetGroups(groups, { unknown });
    renderAssetVisualization(analysedPaths);
}

if (assetInput) {
    assetInput.addEventListener("change", handleAssetSelection);
}

const navigationButtons = document.querySelectorAll(".quick-nav button");

navigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const targetId = button.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

function renderTimeline(trackName) {
    const container = document.querySelector(`.timeline[data-track="${trackName}"]`);
    if (!container) return;

    const template = document.getElementById("timeline-item");
    const fragment = document.createDocumentFragment();

    curriculum[trackName].forEach((item) => {
        const node = template.content.cloneNode(true);
        node.querySelector(".timeline__title").textContent = item.title;
        node.querySelector(".timeline__duration").textContent = item.duration;
        node.querySelector(".timeline__description").textContent = item.description;

        const prereqList = node.querySelector(".timeline__prereqs");
        item.prereqs.forEach((prereq) => {
            const li = document.createElement("li");
            li.textContent = prereq;
            prereqList.appendChild(li);
        });

        const toggleButton = node.querySelector(".timeline__toggle");
        toggleButton.addEventListener("click", () => {
            const isHidden = prereqList.hasAttribute("hidden");
            if (isHidden) {
                prereqList.removeAttribute("hidden");
                toggleButton.textContent = "Ocultar pré-requisitos";
            } else {
                prereqList.setAttribute("hidden", "");
                toggleButton.textContent = "Ver pré-requisitos";
            }
        });

        fragment.appendChild(node);
    });

    container.appendChild(fragment);
}

renderTimeline("preparacao");
renderTimeline("geral");
renderTimeline("frontend");
renderTimeline("unreal");
renderTimeline("backend");
