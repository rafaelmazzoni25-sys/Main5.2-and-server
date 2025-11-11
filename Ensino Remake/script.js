const curriculum = {
    preparacao: [
        {
            title: "Tour pelo pacote original",
            duration: "Dia 1",
            description:
                "Conheça a estrutura geral: leia o README, abra as pastas Source Main 5.2 e Source MuServer Update 15 e identifique onde ficam código, assets e ferramentas.",
            prereqs: [
                "Ler README.md e destacar as seções que citam cliente e servidor",
                "Abrir Source Main 5.2/source no editor e listar arquivos como Winmain.cpp e ZzzScene.cpp",
                "Visitar Source MuServer Update 15/ e anotar a função de ConnectServer, JoinServer, GameServer e DataServer"
            ]
        },
        {
            title: "Configurar ferramentas",
            duration: "Dia 2",
            description:
                "Instale softwares essenciais e faça um teste rápido de funcionamento. O objetivo é ter Visual Studio 2019, Unreal Engine 5.3+, Git e um banco de dados local prontos para uso.",
            prereqs: [
                "Instalar Visual Studio 2019 com Desktop development with C++",
                "Instalar Unreal Engine 5.3 ou superior via Epic Games Launcher",
                "Configurar Git com usuário, e-mail e repositório remoto",
                "Instalar SQL Server Express ou MariaDB para simular o DataServer"
            ]
        },
        {
            title: "Organizar assets reutilizáveis",
            duration: "Dia 3",
            description:
                "Separe texturas, sons e fontes do cliente clássico para importação futura. Documente onde cada item será usado no remake.",
            prereqs: [
                "Copiar Source Main 5.2/Global Release/Data para uma pasta de trabalho",
                "Identificar arquivos essenciais da interface nas pastas Interface e UI",
                "Criar estrutura Content/UI e Content/Audio no projeto Unreal",
                "Registrar em planilha qual asset pertence a cada tela"
            ]
        },
        {
            title: "Rotina de estudos",
            duration: "Dia 4",
            description:
                "Monte um cronograma semanal com blocos de leitura, prática em C++ e prática na Unreal. Anote dúvidas para revisar ao fim de cada sessão.",
            prereqs: [
                "Definir horários fixos para teoria, prática e revisão",
                "Criar um diário de bordo (caderno ou documento digital)",
                "Configurar lembretes para pausas e resumo diário",
                "Criar checklist de tópicos concluídos por módulo"
            ]
        },
        {
            title: "Fluxo do cliente clássico",
            duration: "Dia 5",
            description:
                "Entenda como o Main 5.2 inicia, mostra telas e comunica com o servidor. O foco está em Winmain.cpp, LoginWin.cpp, NewUIMainFrameWindow.cpp e ProtocolSend.cpp.",
            prereqs: [
                "Ler Winmain.cpp e identificar o loop principal",
                "Mapear a transição de cenas em ZzzScene.cpp",
                "Anotar quais funções em LoginWin.cpp chamam gProtocolSend",
                "Desenhar um diagrama simples do HUD baseado em NewUIMainFrameWindow.cpp"
            ]
        },
        {
            title: "Serviços do MuServer",
            duration: "Dia 6",
            description:
                "Analise cada serviço dedicado para entender o caminho completo de conexão. Leia ConnectServer.cpp, JoinServer.cpp, GameMain.cpp e DataServerProtocol.cpp.",
            prereqs: [
                "Abrir ConnectServer/ConnectServer.cpp e destacar o fluxo de sockets",
                "Revisar JoinServer/JoinServer.cpp e anotar as etapas de validação",
                "Ler GameServer/GameServer/GameMain.cpp para entender a inicialização",
                "Verificar DataServer/DataServer/DataServerProtocol.cpp e mapear chamadas ao banco"
            ]
        },
        {
            title: "Projeto base na Unreal",
            duration: "Dia 7",
            description:
                "Crie o projeto Unreal Engine 5 que receberá o remake. Configure controle de versão, estrutura de pastas e um nível de teste simples.",
            prereqs: [
                "Criar projeto Third Person em C++ com nome EnsinoRemake",
                "Ativar o plug-in Git Source Control e conectar ao repositório",
                "Criar pastas Content/UI, Content/Characters e Content/Maps",
                "Adicionar um nível Test_Level com personagem padrão para navegação"
            ]
        },
        {
            title: "Primeiro commit documentado",
            duration: "Dia 8",
            description:
                "Registre o estado inicial do projeto no Git com notas sobre o que já foi preparado. Essa prática garante rastreabilidade desde o começo.",
            prereqs: [
                "Executar git status e conferir arquivos adicionados",
                "Escrever README curto explicando o objetivo do remake",
                "Criar commit inicial descrevendo ferramentas instaladas",
                "Enviar o commit para o repositório remoto"
            ]
        }
    ],
    geral: [
        {
            title: "Preparação & Ferramentas",
            duration: "Semana 1",
            description:
                "Consolide ambiente, assets organizados e projeto Unreal configurado. Garanta que cliente, servidor e Unreal podem ser abertos sem erros.",
            prereqs: [
                "Completar todos os passos da preparação inicial",
                "Abrir Main.sln e compilar um build vazio",
                "Executar projeto Unreal para validar o mapa de teste",
                "Salvar checklist com links para arquivos importantes"
            ]
        },
        {
            title: "Fundamentos do Cliente",
            duration: "Semanas 2-3",
            description:
                "Recrie telas principais, entenda o fluxo de UI e registre como ProtocolSend.cpp lida com autenticação e movimentação.",
            prereqs: [
                "Compilar Main.sln em modo Debug com sucesso",
                "Documentar arquivos-chave como LoginWin.cpp e NewUIMainFrameWindow.cpp",
                "Listar pacotes enviados por gProtocolSend nas principais ações",
                "Capturar screenshots do cliente original para referência"
            ]
        },
        {
            title: "Base na Unreal Engine 5",
            duration: "Semanas 4-5",
            description:
                "Construa a navegação de login e seleção de personagem na Unreal, importando assets e conectando Blueprints a funções C++ simplificadas.",
            prereqs: [
                "Criar Widget Blueprint para login inspirado em LoginWin.cpp",
                "Importar texturas de interface e configurar fontes",
                "Implementar GameMode e GameInstance personalizados",
                "Testar navegação entre telas usando InputActions"
            ]
        },
        {
            title: "Fundamentos do Servidor",
            duration: "Semanas 6-7",
            description:
                "Compile os serviços do MuServer, configure o banco de dados e garanta que ConnectServer, JoinServer e GameServer trocam mensagens básicas.",
            prereqs: [
                "Compilar ConnectServer, JoinServer, GameServer e DataServer",
                "Configurar banco com tabelas Account e Character",
                "Executar JoinServer e verificar logs de conexão",
                "Documentar portas abertas e scripts de inicialização"
            ]
        },
        {
            title: "Integração & Testes",
            duration: "Semanas 8-9",
            description:
                "Sincronize autenticação, movimentação e inventário entre cliente Unreal e MuServer. Crie cenários de teste guiados para validar cada requisito.",
            prereqs: [
                "Cliente Unreal conectando ao JoinServer com pacote de login",
                "GameServer registrando entradas de movimento via JSProtocol.cpp",
                "Inventário replicado comparando dados com User.cpp",
                "Planilha de bugs com prioridade e responsável"
            ]
        },
        {
            title: "Polimento & Publicação",
            duration: "Semana 10",
            description:
                "Refine efeitos, otimize pacotes, gere builds finais da Unreal e documente passos de instalação para outras pessoas repetirem o processo.",
            prereqs: [
                "Executar build Shipping no Unreal e validar desempenho",
                "Registrar melhorias gráficas priorizadas",
                "Preparar guia passo a passo de instalação",
                "Rodar sessão de testes com voluntários e coletar feedback"
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
                "Abra Main.sln, ajuste dependências em Source Main 5.2/dependencies e garanta um build Debug limpo com os executáveis originais.",
            prereqs: [
                "Configurar caminhos de include e lib das dependências",
                "Gerar build Debug e registrar passos executados",
                "Testar execução do cliente original em ambiente local",
                "Salvar relatório com erros encontrados e soluções"
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
                "Mapeie telas como LoginWin.cpp, CharSelMainWin.cpp e NewUIMainFrameWindow.cpp registrando botões, sons e interações necessárias para a Unreal.",
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
                "Resuma a lógica de abertura e fechamento de janelas com base em NewUIManager.cpp e UIControls.cpp para replicar o comportamento com Widgets na Unreal.",
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
                "Remonte o HUD principal (NewUIMainFrameWindow.cpp) e o inventário (NewUIInventoryCtrl.cpp) anotando dados necessários para replicação.",
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
                "Analise arquivos como MouseProc.cpp e CameraMove.cpp para entender entradas e movimentação da câmera a serem replicadas no Unreal.",
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
                "Conecte o cliente clássico ao servidor usando ProtocolSend.cpp e WSclient.cpp como referência para login, seleção de personagem e movimentação.",
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
                "Analise ZzzEffect.cpp, SkillEffectMgr.cpp e TextureScript.cpp para decidir quais efeitos migrar para Niagara ou Material Instances no Unreal.",
            prereqs: [
                "Listar efeitos essenciais para a primeira versão",
                "Medir impacto de partículas no cliente clássico",
                "Definir estratégia para efeitos avançados no Unreal",
                "Criar backlog de otimizações pós-lançamento"
            ]
        }
    ],
    unreal: [
        {
            title: "Criar projeto remake",
            duration: "Semana 4",
            description:
                "Configure o projeto Unreal com controle de versão, pastas organizadas e plugins necessários para replicação de rede e UI.",
            prereqs: [
                "Ativar plug-ins Git Source Control e Online Subsystem",
                "Criar branches Git específicos (interface, gameplay, rede)",
                "Configurar pasta Content/UI para texturas importadas",
                "Documentar convenções de nome (prefixos BP_, WB_, C++)"
            ]
        },
        {
            title: "Interface com UMG",
            duration: "Semana 4",
            description:
                "Reproduza o fluxo de login e seleção de personagem em Widgets UMG, conectando botões a eventos Blueprint e preparando chamadas C++.",
            prereqs: [
                "Importar fontes e texturas do Main 5.2",
                "Criar Widget Blueprint WB_LoginMenu com campos validados",
                "Configurar Widget WB_SelectCharacter inspirado em CharSelMainWin.cpp",
                "Testar estados de erro (login inválido, servidor offline)"
            ]
        },
        {
            title: "Personagem e controles",
            duration: "Semana 5",
            description:
                "Configure movimentação, câmera e animações com Enhanced Input e Animation Blueprints para reproduzir a sensação do cliente clássico.",
            prereqs: [
                "Criar InputActions para movimento, câmera e ataque",
                "Conectar Animation Blueprint às malhas importadas",
                "Sincronizar velocidade com dados de ZzzCharacter.cpp",
                "Configurar modo de câmera alternando entre mouse e teclado"
            ]
        },
        {
            title: "Inventário replicado",
            duration: "Semana 6",
            description:
                "Implemente inventário usando Actor Components e replicação, sincronizando slots com pacotes enviados pelo servidor.",
            prereqs: [
                "Criar struct FItemSlot em C++ inspirada em ZzzInventory.h",
                "Montar Widget WB_Inventory com grids dinâmicos",
                "Conectar componente de inventário à UI",
                "Testar adição e remoção de itens em sessão multiplayer local"
            ]
        },
        {
            title: "Comunicação com MuServer",
            duration: "Semana 7",
            description:
                "Utilize sockets em C++ na Unreal para enviar pacotes compatíveis com ProtocolSend.cpp e consumir respostas tratadas por JSProtocol.cpp.",
            prereqs: [
                "Criar módulo C++ NetworkBridge com classe para sockets",
                "Serializar pacotes seguindo estrutura do cliente clássico",
                "Logar pacotes recebidos e comparar com o WSclient.cpp",
                "Implementar reconexão simples e feedback visual"
            ]
        },
        {
            title: "Build e automação",
            duration: "Semana 9",
            description:
                "Gere builds Development e Shipping, configure scripts de empacotamento e registre passos de distribuição para testers iniciantes.",
            prereqs: [
                "Executar File > Package Project para Windows",
                "Criar script que copia dependências para uma pasta Distribuicao",
                "Rodar testes automatizados de navegação com Unreal Automation",
                "Documentar procedimento de instalação passo a passo"
            ]
        }
    ],
    backend: [
        {
            title: "Topologia do MuServer",
            duration: "Semana 6",
            description:
                "Entenda como ConnectServer, JoinServer, GameServer e DataServer trocam dados. Desenhe o fluxo completo desde a conexão inicial até a entrega de pacotes de jogo.",
            prereqs: [
                "Ler arquivos de configuração de cada serviço",
                "Desenhar diagrama com portas utilizadas",
                "Identificar logs gerados por cada processo",
                "Reservar portas locais e ajustar firewall"
            ]
        },
        {
            title: "Build dos serviços",
            duration: "Semana 6",
            description:
                "Compile todos os projetos em Source MuServer Update 15 garantindo que Util/ ofereça as bibliotecas corretas e que dependências externas estejam acessíveis.",
            prereqs: [
                "Abrir soluções individuais (ConnectServer.sln, JoinServer.sln, etc.)",
                "Resolver referências faltantes em Util/",
                "Gerar executáveis em modo Debug",
                "Documentar caminho de saída de cada build"
            ]
        },
        {
            title: "Autenticação",
            duration: "Semana 7",
            description:
                "Implemente e teste o fluxo de login completo: ConnectServer redireciona, JoinServer valida e GameServer inicia sessão com base no banco.",
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
                "Revise DataServer e as estruturas de itens/experiência para garantir gravação consistente e compatibilidade com o inventário da Unreal.",
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
                "Ajuste Protocol.cpp e JSProtocol.cpp para aceitar os pacotes enviados pelo remake na Unreal, garantindo que posições, inventário e eventos estejam alinhados.",
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
                "Prepare scripts para iniciar e derrubar serviços, monitore logs em tempo real e estabeleça rotina de testes integrados com o cliente da Unreal.",
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
                "Implemente dashboards simples ou planilhas para acompanhar erros, métricas de servidor e feedback dos jogadores durante a fase de testes.",
            prereqs: [
                "Definir indicadores como número de conexões simultâneas",
                "Criar planilha para acompanhar crashes e soluções",
                "Agendar reuniões semanais de revisão com a equipe",
                "Planejar estratégia de suporte para novos testers"
            ]
        }
    ]
};

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
