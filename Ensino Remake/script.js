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
                "Instale os softwares necessários: Visual Studio 2019 (compilador C++), editor de código leve e Git para versionamento.",
            prereqs: [
                "Criar conta no GitHub ou GitLab para hospedar o remake",
                "Instalar Visual Studio 2019 com a carga de trabalho C++",
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
            duration: "Semanas 2-4",
            description:
                "Recrie telas principais (login, seleção de personagem) e configure o loop principal do jogo.",
            prereqs: ["Compilar o projeto Main.sln em modo Debug", "Replicar assets de interface básicos"]
        },
        {
            title: "Fundamentos do Servidor",
            duration: "Semanas 5-7",
            description:
                "Recompilar os serviços principais do MuServer e estabelecer comunicação básica com o cliente.",
            prereqs: ["Executar ConnectServer e JoinServer em ambiente local", "Disponibilizar GameServer com personagens de teste"]
        },
        {
            title: "Integração & Testes",
            duration: "Semanas 8-9",
            description:
                "Sincronize autenticação, movimentação e inventário entre cliente e servidor e documente os testes.",
            prereqs: ["Cliente renderizando mapas de teste", "Servidor aceitando conexões locais"]
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
            title: "Tela de login e seleção",
            duration: "Semana 2",
            description:
                "Recrie a lógica visual baseada em LoginMainWin.cpp e CharSelMainWin.cpp, introduzindo botões simplificados.",
            prereqs: [
                "Ler LoginMainWin.cpp para entender eventos de entrada",
                "Mapear assets usados na pasta NewUILogin",
                "Criar mock de servidor para validar fluxo de login"
            ]
        },
        {
            title: "Gerenciador de UI",
            duration: "Semana 3",
            description:
                "Implemente um sistema básico inspirado em NewUIManager.cpp e UIControls.cpp para abrir/fechar janelas.",
            prereqs: [
                "Estudar NewUIManager.cpp",
                "Identificar componentes reutilizáveis em UIControls.cpp",
                "Planejar hierarquia de janelas (HUD, inventário, chat)"
            ]
        },
        {
            title: "HUD e inventário",
            duration: "Semana 4",
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
            duration: "Semana 5",
            description:
                "Conecte o cliente ao servidor usando ProtocolSend.cpp e WSclient.cpp como referência para enviar pacotes básicos.",
            prereqs: [
                "Ler ProtocolSend.cpp para entender mensagens de login",
                "Implementar handlers mínimos em WSclient.cpp",
                "Testar conexão local com JoinServer"
            ]
        },
        {
            title: "Efeitos e otimização",
            duration: "Semana 6",
            description:
                "Trabalhe gradualmente com ZzzEffect.cpp, SkillEffectMgr.cpp e otimizações em TextureScript.cpp para polir a apresentação visual.",
            prereqs: [
                "Confirmar renderização estável em mapas de teste",
                "Listar efeitos prioritários (skills, impactos)",
                "Documentar ganhos de desempenho após ajustes"
            ]
        }
    ],
    backend: [
        {
            title: "Topologia do MuServer",
            duration: "Semana 5",
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
            duration: "Semana 5",
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
            duration: "Semana 6",
            description:
                "Implemente e teste o fluxo de login: ConnectServer redireciona, JoinServer valida e GameServer cria sessão.",
            prereqs: [
                "Configurar contas de teste no banco de dados",
                "Ativar logs detalhados de JoinServer",
                "Verificar integração com ProtocolSend.cpp no cliente"
            ]
        },
        {
            title: "Persistência e economia",
            duration: "Semana 7",
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
                "Gradualmente, ative eventos como Blood Castle e Castle Siege conforme as janelas equivalentes do cliente ficarem prontas.",
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
                "Prepare scripts para iniciar/derrubar serviços, monitore logs e estabeleça rotinas de testes integrados.",
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
renderTimeline("backend");
