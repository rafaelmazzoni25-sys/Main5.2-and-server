const curriculum = {
    preparacao: [
        {
            title: "Tour pelo pacote original",
            duration: "Dia 1",
            description:
                "Conheça a estrutura geral: leia o README, abra \"Source Main 5.2\" e \"Source MuServer Update 15\" para entender o que já está pronto.",
            prereqs: [
                "Explorar o arquivo README.md",
                "Examinar a pasta \"Source Main 5.2\" e identificar o projeto Main.sln",
                "Identificar os serviços na pasta \"Source MuServer Update 15\""
            ]
        },
        {
            title: "Configurar ferramentas",
            duration: "Dia 2",
            description:
                "Instale os softwares necessários: Visual Studio 2019 (compilador C++), Unreal Engine 5 via Epic Games Launcher, editor de texto leve e Git para versionamento.",
            prereqs: [
                "Criar conta no GitHub ou GitLab para hospedar o remake",
                "Instalar Visual Studio 2019 com a carga de trabalho C++",
                "Instalar Unreal Engine 5.3 ou superior pelo Epic Games Launcher",
                "Instalar Git e configurar usuário e e-mail"
            ]
        },
        {
            title: "Organizar ativos",
            duration: "Dia 3",
            description:
                "Separe os assets originais do cliente (texturas, modelos) e planeje como reutilizá-los no remake.",
            prereqs: [
                "Listar arquivos chave em \"Source Main 5.2/Global Release\"",
                "Selecionar assets essenciais para UI (pastas NewUI, ZzzInterface, etc.)",
                "Criar pastas de destino no novo projeto para armazenar assets reaproveitados"
            ]
        },
        {
            title: "Rotina de estudos",
            duration: "Dia 4",
            description:
                "Defina blocos de tempo para teoria, prática no Visual Studio e prática na Unreal, mantendo anotações do que aprendeu.",
            prereqs: [
                "Montar um calendário semanal com metas realistas",
                "Separar um caderno físico ou digital para registrar descobertas",
                "Criar um checklist simples para marcar módulos concluídos"
            ]
        }
    ],
    geral: [
        {
            title: "Preparação & Ferramentas",
            duration: "Semana 1",
            description:
                "Configuração do ambiente, entendimento da estrutura e definição do repositório do remake.",
            prereqs: ["Completar a seção de Preparação Inicial"]
        },
        {
            title: "Fundamentos do Cliente",
            duration: "Semanas 2-3",
            description:
                "Recrie telas principais (login, seleção de personagem) e configure o loop principal do jogo clássico.",
            prereqs: [
                "Compilar o projeto Main.sln em modo Debug",
                "Documentar arquivos essenciais da interface",
                "Ter uma lista dos pacotes de rede que o cliente envia"
            ]
        },
        {
            title: "Base na Unreal Engine 5",
            duration: "Semanas 4-5",
            description:
                "Criar o projeto na Unreal, importar assets e reproduzir a navegação básica com Blueprints e UMG.",
            prereqs: [
                "Criar projeto Third Person limpo",
                "Importar texturas e fontes da interface original",
                "Recriar menu de login com UMG"
            ]
        },
        {
            title: "Fundamentos do Servidor",
            duration: "Semanas 6-7",
            description:
                "Recompilar os serviços principais do MuServer, preparar banco de dados e estabelecer comunicação básica com o cliente remake.",
            prereqs: [
                "Executar ConnectServer e JoinServer em ambiente local",
                "Disponibilizar GameServer com personagens de teste",
                "Mapear portas e firewall necessários"
            ]
        },
        {
            title: "Integração & Testes",
            duration: "Semanas 8-9",
            description:
                "Sincronize autenticação, movimentação e inventário entre cliente, Unreal Engine 5 e servidor, documentando cada teste.",
            prereqs: [
                "Cliente Unreal conectando ao JoinServer",
                "Servidor aceitando conexões locais",
                "Checklist de bugs atualizado"
            ]
        },
        {
            title: "Polimento & Publicação",
            duration: "Semana 10",
            description:
                "Refine efeitos, otimize pacotes, empacote a build da Unreal e registre um guia de instalação para outras pessoas.",
            prereqs: [
                "Executar build Shipping no Unreal",
                "Rodar sessão de testes com voluntários",
                "Publicar changelog no repositório"
            ]
        }
    ],
    frontend: [
        {
            title: "Recompilar o cliente base",
            duration: "Semana 2",
            description:
                "Abra Main.sln no Visual Studio, garanta que as dependências em \"Source Main 5.2/dependencies\" estão corretas e gere um build limpo.",
            prereqs: [
                "Instalar bibliotecas C++ necessárias",
                "Configurar caminhos de include/lib para dependências",
                "Executar build Debug sem erros"
            ]
        },
        {
            title: "Explorar UI clássica",
            duration: "Semana 2",
            description:
                "Mapeie telas como LoginMainWin.cpp, CharSelMainWin.cpp e NewUIMainFrameWindow.cpp, anotando quais texturas e sons cada uma usa.",
            prereqs: [
                "Abrir arquivos da pasta NewUI no Visual Studio",
                "Identificar funções disparadas ao clicar em botões",
                "Capturar screenshots para referência visual"
            ]
        },
        {
            title: "Gerenciador de UI",
            duration: "Semana 3",
            description:
                "Implemente um resumo da lógica de abertura/fechamento de janelas baseada em NewUIManager.cpp e UIControls.cpp.",
            prereqs: [
                "Estudar NewUIManager.cpp",
                "Identificar componentes reutilizáveis em UIControls.cpp",
                "Planejar hierarquia de janelas (HUD, inventário, chat)"
            ]
        },
        {
            title: "HUD e inventário",
            duration: "Semana 3",
            description:
                "Remonte o HUD principal (NewUIMainFrameWindow.cpp) e uma versão simplificada do inventário (NewUIInventoryCtrl.cpp).",
            prereqs: [
                "Importar texturas do HUD",
                "Refatorar slots de inventário com base em NewUIInventoryCtrl.cpp",
                "Sincronizar dados com estruturas de personagem de ZzzCharacter.cpp"
            ]
        },
        {
            title: "Protocolos de rede",
            duration: "Semana 4",
            description:
                "Conecte o cliente clássico ao servidor usando ProtocolSend.cpp e WSclient.cpp como referência para enviar pacotes básicos.",
            prereqs: [
                "Ler ProtocolSend.cpp para entender mensagens de login",
                "Implementar handlers mínimos em WSclient.cpp",
                "Testar conexão local com JoinServer"
            ]
        },
        {
            title: "Extra: efeitos e otimização",
            duration: "Semana 5",
            description:
                "Analise ZzzEffect.cpp, SkillEffectMgr.cpp e otimizações em TextureScript.cpp para registrar quais elementos migrar para a Unreal.",
            prereqs: [
                "Confirmar renderização estável em mapas de teste",
                "Listar efeitos prioritários (skills, impactos)",
                "Documentar ajustes desejados para a Unreal"
            ]
        }
    ],
    unreal: [
        {
            title: "Criar projeto remake",
            duration: "Semana 4",
            description:
                "Crie um projeto Unreal Engine 5 baseado no template Third Person, configure o controle de versão com Git e ajuste pastas para assets importados.",
            prereqs: [
                "Instalar plug-in GitSourceControl na Unreal",
                "Configurar pasta Content/UI para texturas da interface",
                "Criar branches específicos para interface e gameplay"
            ]
        },
        {
            title: "Interface com UMG",
            duration: "Semana 4",
            description:
                "Reproduza o fluxo de login e seleção de personagem usando Widgets UMG, conectando botões a eventos Blueprint simples.",
            prereqs: [
                "Importar fontes e texturas da pasta NewUI",
                "Criar Widget Blueprint LoginWB",
                "Simular respostas do servidor com Blueprint ou Level Blueprint"
            ]
        },
        {
            title: "Personagem e controles",
            duration: "Semana 5",
            description:
                "Configure movimentação e câmera com o sistema Enhanced Input, ajustando a velocidade e animações para lembrar o cliente clássico.",
            prereqs: [
                "Estudar Character.cpp e conectar atributos equivalentes",
                "Importar malhas do personagem principal",
                "Testar esquema de teclado e mouse"
            ]
        },
        {
            title: "Inventário replicado",
            duration: "Semana 6",
            description:
                "Implemente inventário usando Actor Components e Replication Graph, sincronizando slots com dados recebidos do servidor.",
            prereqs: [
                "Criar estrutura \"FItemSlot\" em C++",
                "Conectar HUD UMG ao componente de inventário",
                "Testar adição e remoção de itens em modo multiplayer local"
            ]
        },
        {
            title: "Comunicação com MuServer",
            duration: "Semana 7",
            description:
                "Utilize sockets TCP/UDP em C++ na Unreal para enviar pacotes baseados em ProtocolSend.cpp e receber atualizações do GameServer.",
            prereqs: [
                "Criar módulo C++ separado para rede",
                "Serializar pacotes seguindo a estrutura original",
                "Logar pacotes recebidos para depuração"
            ]
        },
        {
            title: "Build e automação",
            duration: "Semana 9",
            description:
                "Gere builds Development e Shipping, configure scripts de empacotamento e registre passos de publicação para testes externos.",
            prereqs: [
                "Executar \"File > Package Project\" no Unreal",
                "Criar script PowerShell ou Bash para copiar arquivos necessários",
                "Testar instalação em outra máquina"
            ]
        }
    ],
    backend: [
        {
            title: "Topologia do MuServer",
            duration: "Semana 6",
            description:
                "Entenda como os serviços ConnectServer, JoinServer, GameServer e DataServer se conectam e quais portas utilizam.",
            prereqs: [
                "Ler a configuração padrão de cada serviço",
                "Desenhar um diagrama simples mostrando o fluxo de conexão",
                "Reservar portas locais no firewall"
            ]
        },
        {
            title: "Build dos serviços",
            duration: "Semana 6",
            description:
                "Compile cada projeto dentro de Source MuServer Update 15, garantindo que bibliotecas compartilhadas de Util/ estejam corretas.",
            prereqs: [
                "Abrir os projetos ConnectServer, JoinServer, GameServer e DataServer",
                "Resolver referências a bibliotecas da pasta Util",
                "Gerar executáveis em modo Debug"
            ]
        },
        {
            title: "Autenticação",
            duration: "Semana 7",
            description:
                "Implemente e teste o fluxo de login: ConnectServer redireciona, JoinServer valida e GameServer cria sessão.",
            prereqs: [
                "Configurar contas de teste no banco de dados",
                "Ativar logs detalhados de JoinServer",
                "Verificar integração com a camada de rede da Unreal"
            ]
        },
        {
            title: "Persistência e economia",
            duration: "Semana 8",
            description:
                "Revise DataServer e as estruturas de itens/experiência para garantir gravação consistente.",
            prereqs: [
                "Mapear tabelas de itens e personagens",
                "Testar salvamento de inventário e nível",
                "Criar scripts de backup automatizado"
            ]
        },
        {
            title: "Eventos e sistemas avançados",
            duration: "Semana 8",
            description:
                "Ative eventos como Blood Castle e Castle Siege conforme as janelas equivalentes do cliente na Unreal ficarem prontas.",
            prereqs: [
                "Identificar arquivos de configuração de eventos",
                "Sincronizar horários com o cliente",
                "Documentar checklist de cada evento"
            ]
        },
        {
            title: "Implantação local controlada",
            duration: "Semana 9",
            description:
                "Prepare scripts para iniciar/derrubar serviços, monitore logs e estabeleça rotinas de testes integrados com o cliente da Unreal.",
            prereqs: [
                "Criar scripts batch ou PowerShell para inicialização",
                "Configurar logs rotativos",
                "Executar sessão de testes com o cliente remake"
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
