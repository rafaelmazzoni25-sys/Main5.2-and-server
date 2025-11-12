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
            "Meshes e animações usadas por personagens, monstros e objetos interativos definidos em ZzzBMD com conversão assistida pelo utilitário BMD_FBX.",
        extensions: [".bmd", ".smd"],
        target: "<code>.FBX</code> com esqueleto e texturas automatizadas",
        destination: "<code>Content/Characters</code> e <code>Content/Monsters</code>",
        steps: [
            "Compile o utilitário <code>BMD_FBX</code> com o FBX SDK e defina <code>BMD_FBX::SetRootPath</code> para apontar para <code>Data</code>, permitindo que o buscador localize texturas adicionais.",
            "Ajuste <code>BMD_FBX::SetFrameTime</code> conforme a velocidade desejada e execute <code>converter.Unpack(bmdPath, nullptr, true, true, true)</code> para gerar <code>SKM_/SM_*.fbx</code> com materiais, pesos e animações normalizadas.",
            "Revise a pasta gerada: as texturas são extraídas com nomes únicos e o esqueleto já possui raiz compatível com retargeting. Importe no Unreal ativando <em>Use T0 As Ref Pose</em> e associe as texturas renomeadas."
        ],
        references: [
            {
                path: "Source Main 5.2/source/ZzzBMD.cpp",
                note: "Estrutura de ossos e animações"
            },
            {
                path: "Source Main 5.2/bin/Data/Character",
                note: "Modelos originais do cliente"
            },
            {
                path: "Ensino Remake/index.html#bmd-fbx",
                note: "Guia de uso do conversor BMD_FBX"
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
const bmdConfigurator = document.getElementById("bmd-configurator");
const bmdConfiguratorCount = document.getElementById("bmd-configurator-count");
const bmdConfiguratorFiles = document.getElementById("bmd-configurator-files");
const bmdRootPathInput = document.getElementById("bmd-root-path");
const bmdOutputDirInput = document.getElementById("bmd-output-dir");
const bmdFrameTimeInput = document.getElementById("bmd-frame-time");
const bmdFindTexturesInput = document.getElementById("bmd-find-textures");
const bmdRenameTexturesInput = document.getElementById("bmd-rename-textures");
const bmdExportNormalsInput = document.getElementById("bmd-export-normals");
const bmdSnippetElement = document.getElementById("bmd-configurator-code");
const bmdOptionsSummary = document.getElementById("bmd-configurator-options");
const bmdCopyButton = document.getElementById("bmd-copy-button");
const noviceModeToggle = document.getElementById("novice-mode-toggle");
const noviceModeLabel = document.getElementById("novice-mode-label");
const recipesPanel = document.getElementById("receitas-unreal");
const recipeArticles = document.querySelectorAll("#receitas-unreal article.recipe-card");
const NOVICE_STORAGE_KEY = "ensino-remake-novice-mode";
const noviceBlocks = new Map();

let bmdDetectedFiles = [];
const BMD_PREVIEW_LIMIT = 8;
const BMD_SNIPPET_LIMIT = 12;
let bmdCopyResetHandle;

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

const noviceRecipes = {
    "receita-1": {
        "intro": "Objetivo: refazer a HUD principal sem depender de scripts complexos.",
        "preparation": [
            "Abra o projeto EnsinoRemake na Unreal Engine 5 e confirme que o mapa Test_Level está aberto.",
            "Separe em uma pasta as texturas exportadas do cliente clássico (menu01, menu_red, minimap, barras).",
            "No Content Drawer crie as pastas UI/HUD se ainda não existirem.",
            "Deixe o editor em modo Layout Default para seguir os mesmos nomes de menus mencionados nos passos."
        ],
        "steps": [
            "Clique em Add/Import > Import to /Game/UI/HUD e selecione todas as texturas coletadas.",
            "Na janela de importação, marque sRGB para imagens da interface e desmarque para máscaras do minimapa.",
            "Clique com o botão direito na pasta UI/HUD e crie o Widget Blueprint chamado WB_HUDMain (User Widget).",
            "Abra o WB_HUDMain, arraste um Canvas Panel para a Hierarchy e defina o tamanho padrão 640x480 em Designer > Desired Size.",
            "Adicione três Image como filhos do Canvas, posicione conforme as coordenadas anotadas no guia e defina as texturas importadas.",
            "Para cada barra (HP, MP, AG, SD) adicione uma Image, marque SizeBoxWrap e habilite Size X para poder animar a largura.",
            "Crie no Graph eventos personalizados AtualizarHP/MP/AG/SD, recebendo ValorAtual e ValorMaximo do tipo float.",
            "Dentro de cada evento use Divide (ValorAtual ÷ ValorMaximo) e SetRenderScale ou SetFillAmount da barra correspondente.",
            "Crie um Widget WB_Minimap, adicione Image com textura circular, crie material com máscara e salve.",
            "No Event Construct do WB_HUDMain, use Create Widget (WB_Minimap) e AddChildToOverlay para posicioná-lo no canto superior direito.",
            "No GameInstance padrão, abra o Graph, use Event Init -> Create Widget (WB_HUDMain) -> Add to Viewport e promova para variável HUDAtivo.",
            "Ainda no GameInstance, crie função AplicarStatusDoServidor que chama os eventos de atualização usando dados vindos da rede.",
            "Compile o Widget, salve e feche mantendo o Content Drawer organizado."
        ],
        "validation": [
            "No GameInstance, chame AplicarStatusDoServidor com valores fictícios (ex.: HP 100/200) e clique em Play para ver se barras mudam.",
            "Gire a câmera no modo Play: o minimapa deve acompanhar a rotação se o material estiver configurado como Masked.",
            "Abra o Output Log: nenhuma mensagem de erro sobre texturas faltando deve aparecer ao iniciar o nível."
        ]
    },
    "receita-2": {
        "intro": "Objetivo: entregar um inventário 8x8 funcional com arrastar e soltar sem escrever C++ avançado.",
        "preparation": [
            "Converta os ícones de itens para PNG/TGA e coloque em Content/UI/Inventory.",
            "Abra o arquivo ZzzInventory.h para ter a tabela de largura e altura de cada item durante o processo.",
            "Dentro da Unreal, confirme que o plugin UMG está ativo (deve estar por padrão).",
            "Crie uma Blueprint Class baseada em Actor chamada BP_InventarioFake para testar interações sem rede."
        ],
        "steps": [
            "No Content Drawer crie uma Data Table do tipo struct (ItemDefinition) contendo Nome, Classe, Largura, Altura, Icone.",
            "Preencha a Data Table copiando os valores do ZzzInventory.h usando nomes amigáveis.",
            "Crie um Widget Blueprint chamado WB_Inventory baseado em User Widget.",
            "No Designer, adicione um UniformGridPanel chamado GridSlots e configure Fill para 8 colunas por 8 linhas.",
            "Crie um Widget filho chamado WB_InventorySlot com botão transparente e uma imagem interna.",
            "No WB_Inventory, use ForLoop de 0 a 63 no Event Construct para criar 64 slots, adicionando ao Grid com AddChildToUniformGrid (linha = Índice/8, coluna = Índice % 8).",
            "Armazene cada slot em um array SlotsDisponiveis para consulta posterior.",
            "Implemente função PodeColocarItem (Entrada: ItemId, Linha, Coluna) verificando se o espaço está livre e respeita largura/altura.",
            "Crie estrutura FItemInstancia com campos ItemId, Quantidade, Rotacao e SlotsOcupados.",
            "Implemente a função AdicionarItem que percorre os slots usando PodeColocarItem e marca quais índices foram preenchidos.",
            "Para drag and drop, selecione o Botão do slot, marque Is Variable e em Behavior habilite On Mouse Button Down.",
            "No Graph, implemente OnDragDetected criando um DragVisual com a imagem do item e armazenando referência do slot original.",
            "Implemente OnDrop no WB_Inventory para reposicionar o item chamando AdicionarItem no novo local e liberando os slots antigos.",
            "Adicione texto flutuante no slot selecionado exibindo Nome e Atributos usando dados da Data Table.",
            "Coloque o Widget na tela através do BP_InventarioFake (Event BeginPlay -> Create Widget -> Add to Viewport)."
        ],
        "validation": [
            "No modo Play, arraste um item de um slot para outro: ele deve seguir o cursor e encaixar apenas quando houver espaço.",
            "Tente colocar um item 2x4 em uma área que falta espaço vertical: a função deve impedir e reproduzir som/feedback visual.",
            "Remova um item e confirme no Output Log que o array SlotsOcupados foi limpo (use PrintString temporário)."
        ]
    },
    "receita-3": {
        "intro": "Objetivo: reconstruir o chat completo com canais, cores e notificações sem precisar conhecer Slate.",
        "preparation": [
            "Separe as fontes usadas pelo cliente clássico (gothic, arial) em Content/UI/Fonts.",
            "Analise NewUIChat.cpp para entender códigos de canal (Normal, Party, Guild, Gens, Sistema).",
            "No servidor de testes, habilite pacotes de chat simples para validar ida e volta (ProtocolSend.cpp).",
            "Crie sons ou reutilize os .wav clássicos para toques de notificação."
        ],
        "steps": [
            "No Content Drawer, crie um Widget Blueprint chamado WB_ChatWindow.",
            "Adicione um Border escuro, dentro dele coloque um VerticalBox com um ScrollBox (mensagens) e um EditableTextBox (entrada).",
            "Configure o ScrollBox para usar tamanho automático e permitir Scroll to End quando novas mensagens chegarem.",
            "Crie uma Data Table DT_ChatChannels com campos Canal, Prefixo, CorTexto e SomNotificacao.",
            "No Graph do WB_ChatWindow, crie a função RegistrarMensagem (Entrada: Canal, Autor, Texto) e dentro instancie um Widget linha (WB_ChatLine) com RichTextBlock.",
            "Configure o EditableTextBox para capturar OnTextCommitted: ao pressionar Enter, leia o texto, determine canal (ex.: comandos /p, /g) e chame uma função do GameInstance para enviar ao servidor.",
            "No GameInstance, implemente EnviarChat que chama o NetworkBridge (ou stub) com o pacote 0x00 + subcódigo correto.",
            "Crie um componente UChatHistoryComponent armazenando últimas 100 mensagens para permitir rolagem após reconexão.",
            "Para notificações rápidas, adicione um Widget WB_ToastQueue com animação fade in/out e crie função MostrarToast recebendo título e descrição.",
            "Dentro do ScrollBox, use CreateWidget (WB_ChatLine) para cada mensagem, defina cor com base na Data Table e chame ScrollBox->ScrollToEnd.",
            "Associe atalhos PageUp/PageDown para navegar no histórico usando Input Actions simples.",
            "Para comandos de slash, adicione validação no Graph para impedir envio vazio e limpar o campo após confirmação.",
            "Adicione tooltips nos botões de canal (Normal, Party, Guild) para orientar iniciantes."
        ],
        "validation": [
            "Pressione Play em modo dois jogadores (New Editor Window) e envie mensagens: os canais precisam chegar coloridos nos dois clientes.",
            "Execute /p teste: somente jogadores do mesmo grupo devem receber e o prefixo [Party] deve aparecer.",
            "Provoque um aviso de sistema (por exemplo, entrada em evento) e confirme que o Toast aparece e some após o tempo configurado."
        ]
    },
    "receita-4": {
        "intro": "Objetivo: fazer o personagem andar, atacar e usar poções replicando pacotes do cliente original.",
        "preparation": [
            "Abra o Character original (BP_PlayerRemake ou similar) e confirme que inputs WASD e mouse estão configurados.",
            "Observe ProtocolSend.cpp para mapear pacotes 0xD7 (movimento), 0x1F (ataque) e 0x26 (uso de poção).",
            "Separe animações básicas (Idle, Walk, Run, Attack) importadas para Content/Characters.",
            "Ative o plugin Enhanced Input se ainda não estiver em uso para mapear ações."
        ],
        "steps": [
            "No Content Drawer abra o BP_PlayerRemake e confirme que o componente CharacterMovement usa valores de velocidade próximos aos do Main 5.2 (Walk 200, Run 350).",
            "Configure ações de input (IA_Move, IA_Attack, IA_UsePotion) no Input Mapping Context e associe teclas.",
            "No Event Graph, trate IA_Move para atualizar um vetor de movimento replicado (Add Movement Input) e enviar pacote 0xD7 através do NetworkBridge.",
            "Crie um componente UActionSyncComponent responsável por agrupar chamadas de rede e evitar spam (envio a cada 100 ms).",
            "Para ataque, reproduza animação usando Montage Play e envie pacote 0x1F com target selecionado.",
            "Conecte o uso de poção (tecla Q/W/E) à função ConsumirItem, que busca no inventário e dispara 0x26 com o slot correto.",
            "Utilize GameplayTags para impedir ações enquanto outra animação crítica estiver em andamento (evita spam de ataques).",
            "No servidor fake/local, replique resposta 0x1F confirmando dano e atualize a HUD chamando AplicarStatusDoServidor.",
            "Para feedback sonoro, reproduza efeitos clássicos (sword.wav, potion.wav) ao mesmo tempo da animação.",
            "Documente no blueprint com comentários coloridos indicando \"Entrada\", \"Envio de Rede\" e \"Feedback Visual\"."
        ],
        "validation": [
            "Inicie dois clientes em Play-in-Editor (Session Multiplayer) e mova um personagem: o outro deve ver deslocamento suave.",
            "Use uma poção: verifique se o HP aumenta no HUD e se a mensagem de confirmação aparece no log.",
            "Ataque um manequim de treino e confira se a animação corresponde ao tempo enviado ao servidor (sem atrasos visíveis)."
        ]
    },
    "receita-5": {
        "intro": "Objetivo: reproduzir as telas de login e seleção de personagem guiando quem nunca ligou cliente/servidor.",
        "preparation": [
            "Separe texturas da tela de login (Interface/Login) e da seleção de personagem (Interface/CharacterSelect).",
            "Crie contas e personagens fictícios no banco para testar fluxo completo.",
            "Ative Online Subsystem Null ou mantenha o stub de rede que envia pacotes via TCP para o JoinServer.",
            "Defina uma cena de fundo na Unreal (nível com SkySphere) para usar como cenário da seleção."
        ],
        "steps": [
            "Crie o Widget WB_Login com campos EditableTextBox para usuário e senha, checkbox \"Lembrar\" e botão Entrar.",
            "Conecte o botão Entrar a uma função ValidarCampos que impede envio vazio e mostra mensagens de erro amigáveis.",
            "Ao confirmar, chame GameInstance->EnviarLogin que envia pacote 0xC1 com versão, idioma e credenciais.",
            "Quando o servidor responder com sucesso, troque para o nível de seleção usando OpenLevel.",
            "No nível de seleção, crie um Actor BP_CharacterCarousel com três pedestais (SkeletalMesh) e câmera rotativa lenta.",
            "Construa o Widget WB_CharacterSelect contendo lista lateral com nome, classe, nível e botões Criar/Excluir.",
            "Preencha a lista lendo a resposta do servidor (0xF3 subcódigos) ou usando dados fictícios em Data Table.",
            "Ao clicar em Criar, abra modal com campos nome e classe, valide usando regras do servidor (tamanho mínimo, caracteres permitidos).",
            "Ao selecionar personagem e clicar em Iniciar, envie pacote 0xF3:0x03 confirmando e carregue o nível principal.",
            "Salve preferências (última conta usada) no SaveGame local para facilitar futuros testes.",
            "Adicione dicas visuais (tooltips) explicando cada campo para estudantes que nunca jogaram MU."
        ],
        "validation": [
            "Teste login com dados vazios e observe se mensagens amigáveis aparecem sem travar o fluxo.",
            "Crie dois personagens e confirme que ambos surgem no carrossel com modelos corretos.",
            "Ao confirmar entrada, verifique no Output Log se o pacote correto foi enviado e se o nível principal abre sem erros."
        ]
    },
    "receita-6": {
        "intro": "Objetivo: montar a barra de habilidades com atalhos configuráveis, cooldowns e suporte a itens consumíveis.",
        "preparation": [
            "Liste as habilidades principais do Main 5.2 (arquivo Skill.txt) e prepare ícones em Content/UI/Skills.",
            "Habilite o plugin GameplayAbilities caso use sistema de habilidades avançado.",
            "Separe efeitos sonoros e Niagara básicos para feedback.",
            "Defina teclas padrão (1 a 6, QWER) no Input Mapping Context."
        ],
        "steps": [
            "Crie o Widget WB_SkillBar com um HorizontalBox contendo 12 botões estilizados.",
            "Cada botão deve ter Image para ícone, texto pequeno para tecla e overlay para cooldown (ProgressBar circular).",
            "Crie struct FSkillSlot com campos SlotIndex, SkillId, CooldownAtual, CooldownMax, Tipo (Habilidade ou Item).",
            "No Event Construct, inicialize array de slots lendo Data Table de habilidades padrão.",
            "Implemente drag and drop permitindo arrastar ícones do painel de habilidades para a barra.",
            "Quando o jogador pressiona uma tecla, chame TentarAtivarSkill: verifique se cooldown está zero e se requisitos (mana, flechas) são atendidos.",
            "Se aprovado, envie pacote 0x19 (uso de skill) ou 0x26 (item) ao servidor e inicie contagem regressiva animando o overlay.",
            "Reproduza efeito Niagara/áudio e mostre mensagem no chat \"Skill usada\" para reforçar feedback.",
            "Crie função AtualizarCooldowns chamada a cada Tick do HUD usando Delta Seconds.",
            "Armazene preferências do jogador (layout da barra) em SaveGame para restaurar quando ele voltar."
        ],
        "validation": [
            "Arraste uma habilidade para outro slot e pressione a tecla: o ícone deve mudar e o comando correto deve ser enviado.",
            "Ao usar habilidade repetidamente, verifique se cooldown impede spam (overlay visual e bloqueio de input).",
            "Use um item consumível (Ex.: Poção de Zen) e confirme que a quantidade diminui no inventário e a barra atualiza."
        ]
    },
    "receita-7": {
        "intro": "Objetivo: orientar a criação de lojas NPC e trocas diretas entre jogadores com segurança para novatos.",
        "preparation": [
            "Liste os NPCs comerciantes relevantes no arquivo Shop0X.txt e separe seus ícones.",
            "Prepare tabela de itens vendidos com preço, nível e moeda (Zen, WCoin, Pontos).",
            "No servidor de testes, ative pacotes 0x30 (abrir loja) e 0x3F (troca) para simular respostas.",
            "Configure duas contas no banco para validar troca entre jogadores."
        ],
        "steps": [
            "Crie Widget WB_ShopWindow com abas para categorias e uma Grid com itens.",
            "Preencha a Grid lendo Data Table DT_NpcShops criada a partir dos arquivos Shop0X.txt.",
            "Ao clicar em um item, abra painel lateral com descrição, preço e botão Comprar.",
            "Integre com o inventário chamando UInventoryComponent->TemEspacoAntesDeComprar.",
            "Ao confirmar compra, envie pacote 0x31 para o servidor e aguarde resposta 0x32 para finalizar.",
            "Para lojas pessoais, crie Widget WB_PersonalStore que permite arrastar itens do inventário e definir preço.",
            "Ao abrir troca com outro jogador, use Widget WB_TradeWindow com dois quadros (você e outro) e botão Confirmar.",
            "Implemente travas: enquanto a troca não estiver confirmada pelos dois, impedir movimentação de itens.",
            "Adicione log de auditoria em CSV salvando itens envolvidos a cada transação educativa.",
            "Forneça dicas textuais explicando o fluxo (ex.: \"Arraste o item para a área superior para vender\")."
        ],
        "validation": [
            "Abra uma loja NPC, compre um item barato e veja se aparece no inventário com preço descontado do Zen.",
            "Configure loja pessoal e conecte segundo cliente: confirme se lista de itens aparece igual para ambos.",
            "Execute troca entre duas contas e verifique se, ao cancelar no final, nenhum item desaparece."
        ]
    },
    "receita-8": {
        "intro": "Objetivo: guiar a montagem do diário de missões com passos, recompensas e sincronização com o servidor.",
        "preparation": [
            "Extraia arquivos QuestInfo.dat e QuestProgress.txt para montar Data Tables.",
            "Separe ícones de missões e retratos de NPCs para Content/UI/Quests.",
            "Certifique-se de ter o plugin DataTable Editor habilitado para edição rápida.",
            "Verifique os pacotes 0xF6 no Protocol.cpp para entender como o servidor envia progresso de missão."
        ],
        "steps": [
            "Crie uma Data Table DT_Quests com campos Id, Nome, NPC, Objetivo, Recompensa, TextoResumo.",
            "Monte o Widget WB_QuestJournal com três colunas: lista de missões à esquerda, descrição no centro e recompensas à direita.",
            "Adicione um SearchBox para filtrar missões por nome ou categoria (Main, Sub, Evento).",
            "Implemente função AtualizarLista que percorre DT_Quests e marca quais estão concluídas conforme dados recebidos do servidor.",
            "Crie o Widget WB_QuestTracker (mini painel) para mostrar até três objetivos ativos na HUD.",
            "Ao aceitar missão, envie pacote 0xF6:0x01 e aguarde resposta confirmando estados.",
            "Quando o servidor enviar progresso, atualize a barra de objetivo e toque som de checkpoint.",
            "Permita que o usuário fixe uma missão no topo clicando no botão \"Fixar\" ao lado do nome.",
            "Salve progresso local em SaveGame caso esteja rodando offline para aulas.",
            "Adicione botões \"Mostrar no mapa\" que chamam o minimapa para destacar posição do NPC."
        ],
        "validation": [
            "Aceite uma missão teste e confirme que ela aparece no tracker com texto claro.",
            "Complete o objetivo (ex.: derrotar 5 monstros) e verifique se barra de progresso chega a 100%.",
            "Ao entregar missão, confira se recompensa é adicionada ao inventário e se o diário marca como concluída."
        ]
    },
    "receita-9": {
        "intro": "Objetivo: criar IA de monstros, ciclos de respawn e drops sem exigir conhecimento profundo de C++.",
        "preparation": [
            "Importe modelos e animações de monstros do cliente para Content/Monsters.",
            "Analise MonsterAI.txt e MonsterSetBase.txt para extrair posicionamentos e atributos.",
            "Crie um mapa simples com volumes que representarão áreas de respawn.",
            "Ative o Behavior Tree Editor (padrão) e prepare um Blackboard."
        ],
        "steps": [
            "Crie uma Blueprint de personagem chamada BP_MonsterBase herdando de Character.",
            "Adicione componentes para AgroSphere (detectar jogadores) e Vida.",
            "Construa um Behavior Tree BT_Monster com nós: Selecionar alvo -> Perseguir -> Atacar -> Resetar.",
            "No Blackboard, mantenha chaves TargetActor, SpawnPoint, TempoSemAlvo.",
            "Crie um SpawnManager que lê MonsterSetBase e instancia monstros conforme índice do mapa.",
            "Implemente respawn usando Delay com tempo configurado em Data Table.",
            "Ao morrer, gere drops consultando tabela de loot convertida (ItemDropRate.txt) e chame função do GameServer via pacote 0x1D.",
            "Para efeitos visuais, reproduza partículas clássicas (morte, drop) e sons.",
            "Registre estatísticas em HUD (quantos monstros restam) para facilitar exercícios de IA.",
            "Documente no Blueprint com comentários indicando trechos equivalentes em MonsterAI.cpp."
        ],
        "validation": [
            "Inicie o mapa e observe se monstros nascem nos pontos definidos.",
            "Ao aproximar-se, verifique se entram em combate seguindo a árvore (perseguem, atacam, retornam).",
            "Após eliminá-los, confirme se respawn ocorre após tempo configurado e itens caem corretamente."
        ]
    },
    "receita-10": {
        "intro": "Objetivo: estruturar party, guild e correio social com painéis fáceis de operar por iniciantes.",
        "preparation": [
            "Extraia arquivos GuildList.txt e FriendList para montar dados fictícios.",
            "Garanta que pacotes 0x40 (party) e 0x6D (guild) estejam documentados na planilha de rede.",
            "Separe ícones de guilda e brasões para Content/UI/Social.",
            "Configure duas contas adicionais para testar convites e mensagens."
        ],
        "steps": [
            "Crie o Widget WB_PartyPanel com lista de membros, barra de HP/MP compartilhada e botões Convidar/Sair.",
            "Implemente função EnviarConviteParty chamando pacote 0x40:0x01 com nome do jogador.",
            "Ao receber atualização 0x40:0x02, atualize lista e notifique com som discreto.",
            "Para guild, crie Widget WB_GuildWindow com abas (Informações, Membros, Alianças, Armazém).",
            "Monte Data Table DT_GuildRanks com permissões (convidar, expulsar, abrir baú) e use para habilitar botões.",
            "Implemente sistema de brasão permitindo importar imagem 24x24 (convertida) e enviar ao servidor via 0x6D:0x03.",
            "Crie Widget WB_Mailbox com lista de mensagens, anexos e botão Coletar Tudo.",
            "Armazene mensagens em SaveGame para uso offline durante aulas.",
            "Adicione log informando quem convidou quem e quando, útil para monitorar treinos."
        ],
        "validation": [
            "Convide um segundo jogador para party e verifique se ambos veem os dados sincronizados.",
            "Altere rank de um membro na guilda e confirme se permissões mudam instantaneamente.",
            "Envie correio com item anexado e teste resgate pelo destinatário, garantindo que o item apareça no inventário."
        ]
    },
    "receita-11": {
        "intro": "Objetivo: replicar eventos instanciados Blood Castle e Devil Square com foco em professores iniciantes.",
        "preparation": [
            "Exporta mapas originais (bmd) e converta para FBX usando o conversor documentado.",
            "Leia arquivos Event/BloodCastleSetting.txt e DevilSquareSetting.txt.",
            "Configure cronograma no servidor simulando abertura das instâncias.",
            "Prepare efeitos visuais (portões quebrando, portais) em Content/FX/Events."
        ],
        "steps": [
            "Crie níveis dedicados LV_BloodCastle e LV_DevilSquare reutilizando malhas convertidas.",
            "Implemente GameMode base AEventInstanceGameMode responsável por cronômetro, objetivos e pontuação.",
            "Crie um Director Actor que lê Data Table com fases (Preparação, Defesa, Boss) e controla spawn de monstros.",
            "Desenvolva Widget WB_EventHUD exibindo tempo restante, objetivos e ranking de contribuição.",
            "Ao iniciar evento, teletransporte jogadores usando ServerTravel e atribua times conforme nível.",
            "Controle portões e obstáculos com Sequencer (Level Sequence) acionado pelo Director.",
            "Ao finalizar, calcule pontos e envie pacote 0x9C (Blood Castle) ou 0x9B (Devil Square) ao servidor com resultados.",
            "Retorne jogadores ao mapa principal e conceda recompensas baseadas no ranking.",
            "Documente no guia como resetar o evento para a próxima aula."
        ],
        "validation": [
            "Inicie evento com dois alunos e confirme que ambos recebem objetivo \"Proteja o portão\" com contagem regressiva correta.",
            "Permita que o portão seja destruído: o evento deve avançar para fase seguinte automaticamente.",
            "Ao terminar, verifique se ranking e recompensas correspondem às configurações lidas do arquivo."
        ]
    },
    "receita-12": {
        "intro": "Objetivo: implementar o sistema de duelo 1x1 com placar, espectadores e regras anti-abuso.",
        "preparation": [
            "Analise CDuelMgr.cpp e NewUIDuelWindow.cpp para entender estados (Solicitado, Aceito, Em Andamento).",
            "Separe efeitos de contagem regressiva e trilha sonora curta para início de duelo.",
            "Configure área plana no mapa principal para servir de arena teste.",
            "Ative pacotes 0xAA no servidor de treino (pedidos de duelo e atualizações)."
        ],
        "steps": [
            "Crie componente UDuelComponent anexado ao PlayerState armazenando estado atual do duelo, adversário e pontuação.",
            "Construa Widget WB_DuelInvite com texto claro e botões Aceitar/Recusar.",
            "Ao desafiar (clique direito no jogador -> opção Duelo), envie pacote 0xAA:0x01 e aguarde resposta.",
            "Se aceito, ative contagem regressiva exibindo Widget WB_DuelCountdown e bloqueando movimentação até zero.",
            "Durante o duelo, atualize Widget WB_DuelHUD com barras de HP, pontuação e tempo restante (3 minutos padrão).",
            "Registre hits em UDuelComponent e envie atualização 0xAA:0x04 para sincronizar com servidor.",
            "Permita espectadores: jogadores próximos recebem Widget com barra \"Assistindo\" e podem deixar comentários no chat.",
            "Ao finalizar, reproduza animação de vitória e libere movimentação após 3 segundos.",
            "Gravar resultado em arquivo CSV para revisão posterior em aula."
        ],
        "validation": [
            "Solicite duelo entre duas contas e verifique se ambos veem a contagem regressiva e o placar.",
            "Forçe empate deixando o tempo zerar: o sistema deve declarar empate sem travar personagens.",
            "Durante duelo, tente usar Teleport Scroll: o componente deve impedir ações proibidas mostrando aviso."
        ]
    },
    "receita-13": {
        "intro": "Objetivo: guiar a criação do evento Empire Guardian com ondas cooperativas e HUD detalhada.",
        "preparation": [
            "Leia EmpireGuardian.cpp (GameServer) e NewUIEmpireGuardianNPC.cpp para mapear fases e NPCs.",
            "Converta assets do cenário (mu_guardian) para Content/Maps/EmpireGuardian.",
            "Prepare Data Table com configurações de waves, tipos de monstros e recompensas.",
            "Configure timers de teste no servidor para disparar a instância rapidamente."
        ],
        "steps": [
            "Crie nível LV_EmpireGuardian com pontos de spawn marcados por TargetPoints nomeados (Wave1_SpawnA, etc.).",
            "Desenvolva GameMode AEEmpireGuardianMode com estados Preparação, Defesa, Boss e Conclusão.",
            "Crie Widget WB_EmpireHUD mostrando tempo, vida do cristal, wave atual e barra de progresso.",
            "Implemente Actor CrystalGuardian com componente Vida compartilhada e evento OnDestroyed que encerra partida.",
            "Carregue waves lendo Data Table e, para cada entrada, agende SpawnActor de monstros com Delay.",
            "Ao completar wave, envie pacote 0x7F ao servidor com estatísticas e toque fanfarra curta.",
            "Ofereça dicas visuais (setas) indicando onde próxima wave aparecerá.",
            "Após vitória, abra Widget de recompensas listando itens com botão \"Coletar\".",
            "Documente no UI a origem dos dados (linhas específicas dos arquivos originais) para estudo."
        ],
        "validation": [
            "Inicie o evento com dois jogadores e confirme que ambos veem a mesma wave e barra do cristal.",
            "Deixe o cristal ser destruído: o jogo deve encerrar mostrando mensagem de falha e teletransportar os jogadores.",
            "Complete todas as waves e valide se recompensas listadas batem com Data Table configurada."
        ]
    },
    "receita-14": {
        "intro": "Objetivo: orientar a implementação do Cursed Temple com equipes Holy/Illusion, pontos e minimapa dedicado.",
        "preparation": [
            "Analise CNewUICursedTempleSystem.cpp e dados em Event/CursedTempleSetting.txt.",
            "Converta minimapas e ícones das equipes para Content/UI/CursedTemple.",
            "Configure GameServer para enviar pacotes 0x2B:0x30 relacionados ao evento.",
            "Separe efeitos Niagara para capturar selo e distribuir pontos."
        ],
        "steps": [
            "Crie nível LV_CursedTemple com volumes para capturar Relic e zonas de ressurgimento por equipe.",
            "Desenvolva GameMode ACTempleMode com times Holy e Illusion, usando GameState para replicar pontuação.",
            "Implemente Widget WB_CursedHUD com placar, tempo, contagem de selos e indicador do portador atual.",
            "Adicione minimapa dedicado com ícones coloridos para cada equipe e para a Relic.",
            "Ao capturar Relic, toque efeito, atribua pontos por segundo e envie pacote 0x2B:0x32 ao servidor.",
            "Gere mensagens de narração (\"Equipe Holy recuperou a relíquia!\") usando Data Table de frases.",
            "Ao final, mostre tela de resultados com ranking individual, pontos e recompensas.",
            "Salve replay opcional (Sequence Recorder) para análise em sala de aula."
        ],
        "validation": [
            "Capture a relíquia com a equipe Holy e garanta que pontuação aumente gradualmente.",
            "Deixe a equipe adversária derrotar o portador: a relíquia deve cair no chão com temporizador adequado.",
            "Finalize a partida e confira se a equipe vencedora recebe a mensagem e recompensas corretas."
        ]
    },
    "receita-15": {
        "intro": "Objetivo: replicar o evento Doppelganger com linha do tempo, cinematics e lógica de clones.",
        "preparation": [
            "Examine NewUIDoppelGangerWindow.cpp e dados em Event/DoppelGangerSetting.txt.",
            "Converta cutscenes curtas ou crie Level Sequences para abertura e encerramento.",
            "Prepare Data Table com passos (Estágio 1, Estágio 2, Boss) e recompensas.",
            "Configure servidor de testes para enviar pacotes 0xBF durante o evento."
        ],
        "steps": [
            "Crie nível LV_DoppelGanger com rotas separadas para equipe do jogador e clones.",
            "Desenvolva GameMode ADoppelMode controlando timeline (Start -> Run -> Boss -> Result).",
            "Monte Widget WB_DoppelTimeline exibindo barra de progresso com marcadores de cada etapa.",
            "Implemente spawn de clones usando versões esmaecidas dos personagens (material com opacity controlada).",
            "Ao derrotar clone, atualize pontuação e avance timeline com animação.",
            "Acione cinematic de transição usando Level Sequence quando Boss surgir.",
            "Envie pacote 0xBF:0x05 com pontuação final e compare com tabela de recompensas.",
            "Permita que professores acionem modo Replay para discutir decisões com os alunos."
        ],
        "validation": [
            "Inicie evento e verifique se timeline avança conforme monstros são derrotados.",
            "Chegando ao Boss, confirme que cinematic toca e que HUD atualiza para modo final.",
            "Ao concluir, confira se pontuação exibida bate com o log do servidor e se recompensas são entregues."
        ]
    },
    "receita-16": {
        "intro": "Objetivo: ensinar passo a passo a economia Lucky Coin e a janela Lucky Item, incluindo conversão de arquivos.",
        "preparation": [
            "Reúna LuckyCoinTrade.txt, LuckyItem.txt e recursos de interface correspondentes.",
            "Prepare banco com tabelas de moedas para contas teste.",
            "Certifique-se de que o conversor BMD_FBX exportou modelos necessários para itens brilhantes.",
            "Configure o servidor para enviar pacotes 0x3A (Lucky Coin) e 0xBF (Lucky Item)."
        ],
        "steps": [
            "Crie Data Table DT_LuckyCoin com itens oferecidos, custo em moedas e requisitos.",
            "Monte Widget WB_LuckyCoinExchange com lista de ofertas, pré-visualização e botão Trocar.",
            "Ao confirmar, envie pacote 0x3A:0x01 e exiba barra de progresso simulando animação de troca.",
            "Para Lucky Item, crie Widget WB_LuckyItemForge com slots para materiais, botão Combinar e visualização 3D do item.",
            "Importe partículas azuis e aplique ao item ao completar combinação.",
            "Registre histórico de trocas em arquivo local (CSV) para consulta.",
            "Informe ao aluno limites diários e como resetar contadores no servidor de treino.",
            "Adicione explicações textuais sobre diferença entre Lucky Coin e Cash Shop."
        ],
        "validation": [
            "Troque algumas Lucky Coins por item básico e confirme que o saldo reduz corretamente.",
            "Tente realizar combinação sem materiais completos: o sistema deve bloquear com mensagem clara.",
            "Gere um Lucky Item e verifique se brilha na vitrine 3D e aparece no inventário com opções extras."
        ]
    },
    "receita-17": {
        "intro": "Objetivo: orientar a refinaria Jewel of Harmony com interface, validações e logs educativos.",
        "preparation": [
            "Converta UIJewelHarmony.bmd para obter imagens e leia UIJewelHarmony.cpp para entender regras.",
            "Prepare Data Table com combinações permitidas (item base, opção, custo em Gemstone).",
            "Separe efeitos visuais para sucesso e falha.",
            "Configure servidor para aceitar pacotes 0x1F:0x04 (Harmony)."
        ],
        "steps": [
            "Crie Widget WB_HarmonyRefinery com slots para Item Base, Jewel of Harmony e Gemstone.",
            "Ao colocar item, valide se pertence às categorias suportadas consultando Data Table.",
            "Exiba lista de opções possíveis com descrição traduzida do arquivo original.",
            "Ao clicar em Combinar, envie pacote 0x1F:0x04 com dados do item e aguarde resposta.",
            "Em caso de sucesso, reproduza efeito brilhante e atualize atributos do item na Data Table do inventário.",
            "Se falhar, toque som específico e registre tentativa no log educacional (CSV).",
            "Forneça botão \"Histórico\" mostrando últimas combinações feitas pelo jogador."
        ],
        "validation": [
            "Insira item incompatível: interface deve exibir aviso e bloquear botão Combinar.",
            "Realize combinação de teste e confira se atributos extras aparecem no item no inventário.",
            "Abra histórico e veja se a linha recém-executada foi registrada com data, hora e resultado."
        ]
    },
    "receita-18": {
        "intro": "Objetivo: entregar o Chaos Castle com armadilhas, HUD dinâmica e guia passo a passo para professores.",
        "preparation": [
            "Converta mapas e texturas do Chaos Castle usando o pipeline BMD_FBX.",
            "Leia ChaosCastle.cpp (GameServer) para mapear estados e pacotes.",
            "Prepare Data Table com posições de armadilhas e tempos de ativação.",
            "Separe efeitos de queda e fogo para volumes letais."
        ],
        "steps": [
            "Monte nível LV_ChaosCastle com plataformas e volumes de queda identificados.",
            "Crie GameMode ACChaosCastleMode gerenciando fases StandBy, Playing e End.",
            "Adicione Widget WB_ChaosHUD com contador de sobreviventes, ranking e alertas de armadilha.",
            "Implemente Actor TrapController lendo Data Table e ativando volumes com Timeline.",
            "Ao eliminar jogador, chame função que envia pacote 0x95:0x06 e atualiza ranking.",
            "Crie espectador automático: quando cair, mudar para câmera aérea explicativa.",
            "Ao final, gere CSV com classificação semanal para acompanhamento."
        ],
        "validation": [
            "Inicie partida com vários bots e verifique se armadilhas ativam nos tempos programados.",
            "Caia de propósito para garantir que câmera de espectador e mensagens funcionem.",
            "Finalize a rodada e confira se ranking e CSV refletem posições corretas."
        ]
    },
    "receita-19": {
        "intro": "Objetivo: ensinar as facções Gens, missões diárias e buffs de rank com linguagem acessível.",
        "preparation": [
            "Leia GensSystem.cpp e NewUIGensWindow.cpp para entender estrutura.",
            "Converta ícones das facções (Vanert, Dupren) para Content/UI/Gens.",
            "Monte Data Table com recompensas por rank e missões diárias.",
            "Configure servidor para responder pacotes 0xF8."
        ],
        "steps": [
            "Crie Widget WB_GensLobby com botões Entrar Vanert/Dupren e descrição simples de cada facção.",
            "Implemente componente UGensFactionComponent armazenando pontos, rank, facção e buffs ativos.",
            "Ao entrar, envie pacote 0xF8:0x00 e aguarde confirmação para atualizar HUD.",
            "Crie Widget WB_GensRanking exibindo lista ordenada dos jogadores com pontuação.",
            "Adicione painel de missões diárias carregando Data Table e marcando concluídas quando pacote 0xF8:0x05 chegar.",
            "Aplique buffs utilizando GameplayEffects configurados conforme rank retornado.",
            "Exiba aura Niagara diferenciada por facção.",
            "Programe reset semanal com Timer lendo configuração ResetDay na Data Table."
        ],
        "validation": [
            "Entre em uma facção e confirme que ícones e cores da HUD mudam imediatamente.",
            "Complete missão diária e veja se pontos aumentam e ranking é atualizado.",
            "Espere pelo reset programado ou force manualmente e cheque se pontos voltam a zero mantendo histórico salvo."
        ]
    },
    "receita-20": {
        "intro": "Objetivo: reproduzir a Cash Shop completa, do catálogo à entrega de itens e saldo de moedas.",
        "preparation": [
            "Converta recursos da Cash Shop (Interface/XShop) para Content/UI/CashShop.",
            "Prepare Data Tables DT_CashCatalog e DT_CashPackages com dados dos arquivos originais.",
            "Configure servidor para aceitar pacotes 0xD2, 0xD3 e 0xD6.",
            "Separe sons e animações para compras e presentes."
        ],
        "steps": [
            "Crie Widget WB_CashShop com abas laterais, TileView de itens e painel de detalhes.",
            "Carregue Data Tables no Event Construct e filtre itens por categoria quando abas forem clicadas.",
            "Permita adicionar ao carrinho com botão destacado e exiba quantidade no canto superior.",
            "Ao clicar em Comprar, abra modal com resumo, saldo disponível e botão Confirmar.",
            "Envie pacote 0xD2 com itens do carrinho e aguarde resposta 0xD3.",
            "Atualize saldo mostrado na HUD e registre compra em log.",
            "Crie Widget WB_CashMailbox listando presentes (pacote 0xD6) com botão Resgatar.",
            "Ao resgatar, mova item para inventário e toque efeito de luz."
        ],
        "validation": [
            "Adicione itens diferentes ao carrinho e confirme que total e saldo são recalculados corretamente.",
            "Realize compra e verifique se resposta 0xD3 atualiza saldo e entrega itens no inventário.",
            "Resgate presente no mailbox e confirme se desaparece da lista e aparece na bolsa."
        ]
    }
};


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

function escapeCStringLiteral(value) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getBmdConfig() {
    const rootPath = (bmdRootPathInput?.value || "").trim();
    const outputDir = (bmdOutputDirInput?.value || "").trim();
    const frameValue = parseFloat(bmdFrameTimeInput?.value || "");
    const frameTime = Number.isFinite(frameValue) && frameValue > 0 ? frameValue : 0.033333;

    return {
        rootPath,
        outputDir,
        frameTime,
        findTextures: bmdFindTexturesInput ? bmdFindTexturesInput.checked : true,
        renameTextures: bmdRenameTexturesInput ? bmdRenameTexturesInput.checked : true,
        exportNormals: bmdExportNormalsInput ? bmdExportNormalsInput.checked : true
    };
}

function buildBmdSnippet(config) {
    if (!bmdSnippetElement || bmdDetectedFiles.length === 0) {
        return "";
    }

    const snippetFiles = bmdDetectedFiles.slice(0, BMD_SNIPPET_LIMIT);
    const extraCount = Math.max(0, bmdDetectedFiles.length - snippetFiles.length);

    const lines = [
        '#include "BMD_FBX.h"',
        '#include <iostream>',
        '#include <string>',
        '#include <vector>'
    ];

    if (config.outputDir) {
        lines.push('#include <filesystem>');
    }

    lines.push("", "int main()", "{", "    BMD_FBX converter;", "");

    if (config.rootPath) {
        lines.push(`    BMD_FBX::SetRootPath("${escapeCStringLiteral(config.rootPath)}");`);
    }

    lines.push(`    BMD_FBX::SetFrameTime(${config.frameTime.toFixed(6)});`, "");

    lines.push("    const std::vector<const char*> sources = {");
    snippetFiles.forEach((file, index) => {
        const isLast = index === snippetFiles.length - 1 && extraCount === 0;
        lines.push(`        "${escapeCStringLiteral(file)}"${isLast ? "" : ","}`);
    });
    if (extraCount > 0) {
        lines.push(`        // ... +${numberFormatter.format(extraCount)} arquivo(s) adicional(is)`);
    }
    lines.push("    };", "");

    if (config.outputDir) {
        lines.push(`    const std::filesystem::path outputRoot = "${escapeCStringLiteral(config.outputDir)}";`, "");
    }

    lines.push("    for (const char* source : sources) {", "        const char* destination = nullptr;");

    if (config.outputDir) {
        lines.push(
            "        std::string outputPath = (",
            "            outputRoot /",
            '            (std::filesystem::path(source).stem().string() + ".fbx")',
            "        ).string();",
            "        destination = outputPath.c_str();"
        );
    }

    lines.push(
        "        const bool ok = converter.Unpack(",
        "            source,",
        "            destination,",
        `            ${config.findTextures ? "true" : "false"},`,
        `            ${config.renameTextures ? "true" : "false"},`,
        `            ${config.exportNormals ? "true" : "false"}`,
        "        );",
        "        if (!ok) {",
        `            std::cerr << "[BMD_FBX] Falha ao converter " << source << '\\n';`,
        "        }",
        "    }",
        "",
        "    return 0;",
        "}"
    );

    return lines.join("\n");
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let succeeded = false;
    try {
        succeeded = document.execCommand("copy");
    } catch (error) {
        succeeded = false;
    }

    document.body.removeChild(textArea);
    return succeeded ? Promise.resolve() : Promise.reject();
}

function refreshBmdSnippet() {
    if (!bmdSnippetElement) {
        return;
    }

    if (bmdDetectedFiles.length === 0) {
        bmdSnippetElement.textContent = "";
        if (bmdCopyButton) {
            bmdCopyButton.disabled = true;
            bmdCopyButton.textContent = "Copiar";
        }
        if (bmdOptionsSummary) {
            bmdOptionsSummary.textContent = "";
        }
        return;
    }

    const config = getBmdConfig();
    const snippet = buildBmdSnippet(config);
    bmdSnippetElement.textContent = snippet;

    const hasSnippet = snippet.trim().length > 0;
    if (bmdCopyButton) {
        bmdCopyButton.disabled = !hasSnippet;
        const defaultLabel = bmdCopyButton.dataset.label || bmdCopyButton.textContent || "Copiar";
        bmdCopyButton.dataset.label = defaultLabel;
        if (!hasSnippet) {
            bmdCopyButton.textContent = "Copiar";
        } else if (!bmdCopyResetHandle && bmdCopyButton.textContent !== defaultLabel) {
            bmdCopyButton.textContent = defaultLabel;
        }
    }

    if (bmdOptionsSummary) {
        const snippetCount = Math.min(bmdDetectedFiles.length, BMD_SNIPPET_LIMIT);
        const parts = [
            `Localizar texturas: ${config.findTextures ? "ativo" : "desativado"}`,
            `Renomear texturas: ${config.renameTextures ? "ativo" : "desativado"}`,
            `Exportar normais: ${config.exportNormals ? "ativo" : "desativado"}`
        ];
        bmdOptionsSummary.textContent = `Opções atuais — ${parts.join(" · ")}. Snippet inclui ${numberFormatter.format(
            snippetCount
        )} de ${numberFormatter.format(bmdDetectedFiles.length)} arquivo(s) .BMD/.SMD detectados.`;
    }
}

function updateBmdConfigurator(files = []) {
    if (!bmdConfigurator || !bmdConfiguratorFiles || !bmdConfiguratorCount) {
        return;
    }

    if (!files || files.length === 0) {
        bmdDetectedFiles = [];
        bmdConfigurator.setAttribute("hidden", "");
        bmdConfiguratorFiles.innerHTML = "";
        bmdConfiguratorCount.textContent = "";
        refreshBmdSnippet();
        return;
    }

    bmdDetectedFiles = files
        .slice()
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    bmdConfigurator.removeAttribute("hidden");
    bmdConfiguratorFiles.innerHTML = "";
    bmdConfiguratorCount.textContent = `${numberFormatter.format(
        bmdDetectedFiles.length
    )} arquivo(s) .BMD/.SMD`;

    const preview = bmdDetectedFiles.slice(0, BMD_PREVIEW_LIMIT);
    preview.forEach((file) => {
        const item = document.createElement("li");
        item.className = "list-group-item";
        const code = document.createElement("code");
        code.textContent = file;
        item.appendChild(code);
        bmdConfiguratorFiles.appendChild(item);
    });

    if (bmdDetectedFiles.length > preview.length) {
        const more = document.createElement("li");
        more.className = "list-group-item text-muted fst-italic";
        more.textContent = `… +${numberFormatter.format(
            bmdDetectedFiles.length - preview.length
        )} outros`;
        bmdConfiguratorFiles.appendChild(more);
    }

    refreshBmdSnippet();
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

function appendNoviceList(container, title, items, ordered = false) {
    if (!items || items.length === 0) {
        return;
    }

    const heading = document.createElement("h5");
    heading.className = "recipe-novice__subtitle";
    heading.textContent = title;
    container.appendChild(heading);

    const list = createList(items, "recipe-novice__list", ordered);
    container.appendChild(list);
}

function buildNoviceSection(article, data) {
    const container = document.createElement("section");
    container.className = "recipe-novice";
    container.setAttribute("hidden", "");

    const title = document.createElement("h4");
    title.className = "recipe-novice__title";
    title.textContent = "Modo iniciante — tutorial completo";
    container.appendChild(title);

    if (data.intro) {
        const intro = document.createElement("p");
        intro.className = "recipe-novice__intro";
        intro.textContent = data.intro;
        container.appendChild(intro);
    }

    appendNoviceList(container, "Antes de começar", data.preparation, false);
    appendNoviceList(container, "Passo a passo guiado", data.steps, true);
    appendNoviceList(container, "Como conferir se deu certo", data.validation, false);

    return container;
}

function renderNoviceGuides() {
    recipeArticles.forEach((article) => {
        const recipeId = article?.dataset?.recipe;
        if (!recipeId || !noviceRecipes[recipeId]) {
            return;
        }

        if (article.querySelector(".recipe-novice")) {
            const existing = article.querySelector(".recipe-novice");
            noviceBlocks.set(recipeId, existing);
            return;
        }

        const block = buildNoviceSection(article, noviceRecipes[recipeId]);
        article.appendChild(block);
        noviceBlocks.set(recipeId, block);
    });
}

function updateNoviceMode(show) {
    if (recipesPanel) {
        recipesPanel.classList.toggle("panel--recipes-novice", show);
    }

    noviceBlocks.forEach((block) => {
        if (!block) {
            return;
        }
        if (show) {
            block.removeAttribute("hidden");
        } else {
            block.setAttribute("hidden", "");
        }
    });

    if (noviceModeLabel) {
        noviceModeLabel.textContent = show ? "Modo iniciante ativo" : "Ativar modo iniciante";
    }

    if (noviceModeToggle) {
        noviceModeToggle.setAttribute("aria-pressed", show ? "true" : "false");
    }
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
        const emptyCol = document.createElement("div");
        emptyCol.className = "col-12";
        const empty = document.createElement("div");
        empty.className = "asset-visualization__empty alert alert-warning shadow-sm mb-0";
        empty.textContent =
            "Confirme se a pasta Data contém Interface, Item e Character para visualizar este resumo.";
        emptyCol.appendChild(empty);
        assetVisualizationList.appendChild(emptyCol);
        return;
    }

    results.forEach((category) => {
        if (category.files.length === 0) {
            return;
        }

        const col = document.createElement("div");
        col.className = "col";

        const card = document.createElement("div");
        card.className = "asset-visualization__card card h-100 border-0 shadow-sm";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body d-flex flex-column gap-3";

        const header = document.createElement("div");
        header.className = "d-flex align-items-center justify-content-between gap-2";

        const title = document.createElement("h5");
        title.className = "card-title mb-0";
        title.textContent = category.label;
        header.appendChild(title);

        const count = document.createElement("span");
        count.className = "asset-visualization__count badge rounded-pill";
        count.textContent = `${numberFormatter.format(category.files.length)} arquivo(s)`;
        header.appendChild(count);

        cardBody.appendChild(header);

        const description = document.createElement("p");
        description.className = "asset-visualization__description card-text";
        description.textContent = category.description;
        cardBody.appendChild(description);

        const sampleFiles = category.files.slice(0, 5);
        if (sampleFiles.length > 0) {
            const samplesLabel = document.createElement("p");
            samplesLabel.className = "asset-visualization__samples-label text-uppercase small mb-1";
            samplesLabel.textContent = "Exemplos:";
            cardBody.appendChild(samplesLabel);

            const list = document.createElement("ul");
            list.className = "asset-visualization__samples list-group list-group-flush small";

            sampleFiles.forEach((filePath) => {
                const item = document.createElement("li");
                item.className = "list-group-item px-0 bg-transparent";
                const code = document.createElement("code");
                code.className = "text-break";
                code.textContent = filePath;
                item.appendChild(code);
                list.appendChild(item);
            });

            if (category.files.length > sampleFiles.length) {
                const more = document.createElement("li");
                more.className = "list-group-item px-0 bg-transparent text-muted fst-italic";
                more.textContent = `… +${numberFormatter.format(
                    category.files.length - sampleFiles.length
                )} outros`;
                list.appendChild(more);
            }

            cardBody.appendChild(list);
        }

        card.appendChild(cardBody);
        col.appendChild(card);
        assetVisualizationList.appendChild(col);
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
        updateBmdConfigurator([]);
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
    const bmdGroup = grouped.get("character-models");
    updateBmdConfigurator(bmdGroup ? bmdGroup.files : []);
}

if (assetInput) {
    assetInput.addEventListener("change", handleAssetSelection);
}

[bmdRootPathInput, bmdOutputDirInput, bmdFrameTimeInput].forEach((input) => {
    input?.addEventListener("input", refreshBmdSnippet);
});

[bmdFindTexturesInput, bmdRenameTexturesInput, bmdExportNormalsInput].forEach((input) => {
    input?.addEventListener("change", refreshBmdSnippet);
});

if (bmdCopyButton) {
    bmdCopyButton.addEventListener("click", () => {
        const code = bmdSnippetElement?.textContent || "";
        if (!code.trim()) {
            return;
        }

        if (bmdCopyResetHandle) {
            clearTimeout(bmdCopyResetHandle);
            bmdCopyResetHandle = undefined;
        }

        const defaultLabel = bmdCopyButton.dataset.label || bmdCopyButton.textContent;
        bmdCopyButton.dataset.label = defaultLabel;
        bmdCopyButton.disabled = true;

        copyTextToClipboard(code)
            .then(() => {
                bmdCopyButton.textContent = "Copiado!";
                bmdCopyResetHandle = window.setTimeout(() => {
                    bmdCopyButton.textContent = defaultLabel;
                    bmdCopyButton.disabled = false;
                    bmdCopyResetHandle = undefined;
                }, 2000);
            })
            .catch(() => {
                bmdCopyButton.textContent = "Erro ao copiar";
                bmdCopyResetHandle = window.setTimeout(() => {
                    bmdCopyButton.textContent = defaultLabel;
                    bmdCopyButton.disabled = false;
                    bmdCopyResetHandle = undefined;
                }, 2500);
            });
    });
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

renderNoviceGuides();
let initialNoviceState = false;

if (noviceModeToggle) {
    try {
        initialNoviceState = localStorage.getItem(NOVICE_STORAGE_KEY) === "true";
    } catch (error) {
        initialNoviceState = false;
    }

    noviceModeToggle.checked = initialNoviceState;
    updateNoviceMode(initialNoviceState);

    noviceModeToggle.addEventListener("change", () => {
        const show = noviceModeToggle.checked;
        updateNoviceMode(show);
        try {
            localStorage.setItem(NOVICE_STORAGE_KEY, show ? "true" : "false");
        } catch (error) {
            // ignore storage errors in ambientes restritos
        }
    });
} else {
    updateNoviceMode(false);
}
