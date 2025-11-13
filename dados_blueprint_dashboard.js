const stageData = [
  {
    order: 0,
    file: "00_ModulesAndStartup.md",
    title: "Fundação de Módulos e Projeto",
    priority: "Crítica",
    priorityClass: "critica",
    dependencies: [],
    unlocks: [
      "01_PlayerCharacter.md",
      "02_InputAndCamera.md",
      "03_MovementAndNav.md",
      "04_CombatAndSkills.md",
      "05_ItemsAndInventory.md",
      "06_QuestsAndProgression.md",
      "07_WorldAndSpawns.md",
      "08_UIAndHUD.md",
      "09_NetworkingAndPersistence.md",
      "10_LiveOpsAndTools.md",
      "11_TestingAndDeployment.md",
    ],
    window: "Semana 1 (Sessões 1–2)",
    description:
      "Inicialize o projeto, configure módulos essenciais e garanta que o pipeline esteja pronto para iterar em Blueprint.",
    blueprintSteps: [
      "Criar projeto base UE5 com starter content mínimo e habilitar plugins necessários (Enhanced Input, Niagara, CommonUI).",
      "Montar GameInstance Blueprint para gerenciar estados globais e registrar serviços iniciais (DataAssets, SaveGame).",
      "Configurar o Project Settings com mapas padrão, mapas de transição e subsistemas de áudio/renderização.",
      "Criar estruturas de dados (DataAssets/DataTables) que alimentam etapas posteriores, inclusive inventário e habilidades.",
    ],
    deliverables: [
      "Projeto UE5 versionado e organizado em pastas de módulos.",
      "Documentação interna descrevendo convenções de Blueprint e nomenclatura.",
      "Mapa de protótipo com PlayerStart e componentes de debug conectados.",
    ],
  },
  {
    order: 1,
    file: "01_PlayerCharacter.md",
    title: "Personagem Jogador Base",
    priority: "Crítica",
    priorityClass: "critica",
    dependencies: ["00_ModulesAndStartup.md"],
    unlocks: ["02_InputAndCamera.md", "03_MovementAndNav.md", "04_CombatAndSkills.md", "05_ItemsAndInventory.md"],
    window: "Semana 1 (Sessões 3–4)",
    description:
      "Construa o personagem jogável com Blueprint, incluindo malha, animações e estados fundamentais.",
    blueprintSteps: [
      "Derivar um BP_PlayerCharacter do Character com componentes de câmera, inventário e efeitos de status.",
      "Implementar estados básicos (Idle, Walk, Run, Jump) usando State Machines dentro do Animation Blueprint.",
      "Adicionar atributos vitais via AbilitySystemComponent ou sistema próprio Blueprint com atributos replicados.",
      "Criar eventos de notificação (AnimNotifies) para sincronizar efeitos de partículas e áudio básicos.",
    ],
    deliverables: [
      "BP_PlayerCharacter funcional com locomotion básico.",
      "Animation Blueprint organizado em camadas (Locomotion, Adicionais).",
      "Componentes customizados (Inventário, Status) plugados ao personagem.",
    ],
  },
  {
    order: 2,
    file: "02_InputAndCamera.md",
    title: "Input &amp; Sistema de Câmera",
    priority: "Alta",
    priorityClass: "alta",
    dependencies: ["00_ModulesAndStartup.md", "01_PlayerCharacter.md"],
    unlocks: ["03_MovementAndNav.md", "05_ItemsAndInventory.md", "07_WorldAndSpawns.md", "08_UIAndHUD.md"],
    window: "Semana 1 (Sessões 5–6)",
    description:
      "Implemente mapeamentos de input (Enhanced Input) e sistemas de câmera responsivos em Blueprint.",
    blueprintSteps: [
      "Configurar Input Mapping Contexts para locomotion, combate e interações contextualizadas.",
      "Criar Blueprint de câmera com transições suaves e offsets dinâmicos baseados em estados do personagem.",
      "Adicionar lógica de lock-on/target assist para combate a curta distância.",
      "Expor eventos de input que disparam gatilhos no inventário e UI futuramente.",
    ],
    deliverables: [
      "Contextos de input aplicados no BeginPlay do BP_PlayerCharacter.",
      "Sistema de câmera com blend de FOV e suavização configurável.",
      "Debug HUD para visualizar bindings de input ativos.",
    ],
  },
  {
    order: 3,
    file: "03_MovementAndNav.md",
    title: "Movimentação &amp; Navegação",
    priority: "Alta",
    priorityClass: "alta",
    dependencies: ["00_ModulesAndStartup.md", "01_PlayerCharacter.md", "02_InputAndCamera.md"],
    unlocks: ["04_CombatAndSkills.md", "05_ItemsAndInventory.md", "07_WorldAndSpawns.md", "08_UIAndHUD.md"],
    window: "Semana 2 (Sessões 1–2)",
    description:
      "Aprimore a movimentação com Blueprint, adicionando escalada simples, dash e navegação por AI Navigation Mesh.",
    blueprintSteps: [
      "Integrar componentes de movimento avançado (Sprint, Dash) e ajustar curvas de aceleração.",
      "Configurar NavMesh e criar rotinas Blueprint para pathfinding de NPCs básicos.",
      "Adicionar animações direcionais e blending para transições suaves.",
      "Criar volumes de escada/trepa com triggers Blueprint para animações contextuais.",
    ],
    deliverables: [
      "Sistemas de deslocamento responsivos testados em mapa protótipo.",
      "Blueprints de AI básicos seguindo rotas definidas.",
      "Ferramentas de debug (DrawDebug) para validar caminhos e velocidades.",
    ],
  },
  {
    order: 4,
    file: "04_CombatAndSkills.md",
    title: "Combate &amp; Habilidades",
    priority: "Alta",
    priorityClass: "alta",
    dependencies: ["00_ModulesAndStartup.md", "01_PlayerCharacter.md", "02_InputAndCamera.md", "03_MovementAndNav.md"],
    unlocks: ["05_ItemsAndInventory.md", "06_QuestsAndProgression.md", "07_WorldAndSpawns.md", "08_UIAndHUD.md", "09_NetworkingAndPersistence.md"],
    window: "Semana 2 (Sessões 3–4)",
    description:
      "Implementar o loop de combate com Blueprints, incluindo habilidades, efeitos visuais e feedback de UI.",
    blueprintSteps: [
      "Criar sistema de combos usando montages e filas de input (queued input) para ataques leves/pesados.",
      "Adicionar habilidades ativas via AbilitySystem Blueprint ou lógica custom com cooldowns e custos.",
      "Integrar efeitos Niagara e som 3D nas execuções de habilidade.",
      "Gerar eventos de dano com cálculo baseado em atributos e resistências provenientes de itens.",
    ],
    deliverables: [
      "Loop de combate funcional com feedback audiovisual completo.",
      "Widgets temporários exibindo cooldowns e estados de habilidade.",
      "Blueprints de inimigos dummy para validar balanceamento inicial.",
    ],
  },
  {
    order: 5,
    file: "05_ItemsAndInventory.md",
    title: "Itens, Inventário 3D &amp; HUD",
    priority: "Alta",
    priorityClass: "alta",
    dependencies: ["00_ModulesAndStartup.md", "01_PlayerCharacter.md", "02_InputAndCamera.md", "04_CombatAndSkills.md"],
    unlocks: ["06_QuestsAndProgression.md", "08_UIAndHUD.md", "09_NetworkingAndPersistence.md"],
    window: "Semana 3 (Sessões 1–2)",
    description:
      "Construa o inventário completo com visualização 3D, rotação de itens selecionados e integração de HUD em Blueprint.",
    blueprintSteps: [
      "Modelar DataAssets de itens com raridade, atributos e requisitos para efeitos de nível/excelente.",
      "Implementar grid em Widget Blueprint com drag & drop, preview 3D usando componentes SceneCapture.",
      "Animar rotação do item selecionado no HUD usando timelines ou rotatores interpolados.",
      "Replicar atualizações do inventário entre jogador e servidor (preparando networking futuro).",
    ],
    deliverables: [
      "Inventário 3D funcional com preview e rotação responsiva.",
      "HUD integrado mostrando slots equipados e status do item selecionado.",
      "Testes automatizados Blueprint (Functional Tests) cobrindo operações principais do inventário.",
    ],
  },
  {
    order: 6,
    file: "06_QuestsAndProgression.md",
    title: "Missões &amp; Progressão",
    priority: "Média-Alta",
    priorityClass: "media-alta",
    dependencies: ["00_ModulesAndStartup.md", "01_PlayerCharacter.md", "02_InputAndCamera.md", "04_CombatAndSkills.md", "05_ItemsAndInventory.md"],
    unlocks: ["07_WorldAndSpawns.md", "08_UIAndHUD.md", "09_NetworkingAndPersistence.md", "10_LiveOpsAndTools.md"],
    window: "Semana 3 (Sessões 3–4)",
    description:
      "Estruture o sistema de missões, experiência e recompensas totalmente em Blueprint.",
    blueprintSteps: [
      "Criar DataTables para missões, recompensas e requisitos de progressão.",
      "Implementar controlador de missões (Quest Manager) como Actor Component replicado.",
      "Atualizar HUD com widgets dinâmicos para objetivos e barras de XP.",
      "Integrar recompensas a partir de tabelas de loot e ajustes de atributos do personagem.",
    ],
    deliverables: [
      "Fluxo completo de missão com estados (Ativa, Concluída, Entregue).",
      "Progressão de nível e XP conectada ao inventário e habilidades.",
      "Testes de regressão garantindo que recompensas se refletem no personagem.",
    ],
  },
  {
    order: 7,
    file: "07_WorldAndSpawns.md",
    title: "Mundo, Eventos &amp; Spawns",
    priority: "Média",
    priorityClass: "media",
    dependencies: [
      "00_ModulesAndStartup.md",
      "01_PlayerCharacter.md",
      "02_InputAndCamera.md",
      "03_MovementAndNav.md",
      "04_CombatAndSkills.md",
      "06_QuestsAndProgression.md",
    ],
    unlocks: ["08_UIAndHUD.md", "09_NetworkingAndPersistence.md", "10_LiveOpsAndTools.md"],
    window: "Semana 4 (Sessões 1–2)",
    description:
      "Monte o mundo jogável com Blueprints de spawns, eventos dinâmicos e controle de clima.",
    blueprintSteps: [
      "Criar Level Blueprint com ciclos diurno/noturno e eventos climáticos Niagara.",
      "Adicionar gerenciadores de spawn que respeitam progressão e ameaças escalonadas.",
      "Organizar Streaming Levels para otimizar performance em mapas extensos.",
      "Ativar gatilhos de eventos mundiais conectados às missões e loot tables.",
    ],
    deliverables: [
      "Mapa mestre com subníveis carregados dinamicamente.",
      "Sistema de spawn configurável com pré-visualização em editor.",
      "Ferramentas de debug para eventos mundiais (painel via Editor Utility Widget).",
    ],
  },
  {
    order: 8,
    file: "08_UIAndHUD.md",
    title: "UI, HUD &amp; Feedback Dinâmico",
    priority: "Média",
    priorityClass: "media",
    dependencies: [
      "00_ModulesAndStartup.md",
      "01_PlayerCharacter.md",
      "02_InputAndCamera.md",
      "04_CombatAndSkills.md",
      "05_ItemsAndInventory.md",
      "06_QuestsAndProgression.md",
    ],
    unlocks: ["09_NetworkingAndPersistence.md", "10_LiveOpsAndTools.md", "11_TestingAndDeployment.md"],
    window: "Semana 4 (Sessões 3–4)",
    description:
      "Refine a HUD principal, menus e feedback contextual usando UMG e Blueprints.",
    blueprintSteps: [
      "Construir HUD principal com dados do inventário, missões e combate em sincronia.",
      "Implementar mini-mapa, indicadores contextuais e notificações animadas.",
      "Adicionar menus de pausa/opções com salvamento de preferências (SaveGame).",
      "Integrar sons UI e efeitos de foco alinhados com acessibilidade.",
    ],
    deliverables: [
      "HUD modular com bindings limpos para dados do jogador.",
      "Widgets reutilizáveis para notificações e diálogos.",
      "Fluxo de navegação de menus testado em gamepad e teclado/mouse.",
    ],
  },
  {
    order: 9,
    file: "09_NetworkingAndPersistence.md",
    title: "Networking &amp; Persistência",
    priority: "Média",
    priorityClass: "media",
    dependencies: [
      "00_ModulesAndStartup.md",
      "01_PlayerCharacter.md",
      "02_InputAndCamera.md",
      "03_MovementAndNav.md",
      "04_CombatAndSkills.md",
      "05_ItemsAndInventory.md",
      "06_QuestsAndProgression.md",
      "07_WorldAndSpawns.md",
      "08_UIAndHUD.md",
    ],
    unlocks: ["10_LiveOpsAndTools.md", "11_TestingAndDeployment.md"],
    window: "Semana 5 (Sessões 1–2)",
    description:
      "Habilite replicação, salvamento e sincronização de progresso usando Blueprints e componentes nativos UE5.",
    blueprintSteps: [
      "Configurar GameMode/GameState/PlayerState com variáveis replicadas críticas.",
      "Implementar SaveGame para persistir inventário, missões e preferências de HUD.",
      "Adicionar testes de conexão (latência, desconexão) e handlers de reconexão.",
      "Sincronizar eventos de mundo e spawn com clientes via Multicast e RunOnServer.",
    ],
    deliverables: [
      "Sessões multiplayer estáveis com inventário replicado.",
      "Sistema de salvamento/restauração validado em cenários de carga/recarga.",
      "Relatórios de teste cobrindo casos de falha de rede.",
    ],
  },
  {
    order: 10,
    file: "10_LiveOpsAndTools.md",
    title: "Live Ops &amp; Ferramentas",
    priority: "Média",
    priorityClass: "media",
    dependencies: [
      "00_ModulesAndStartup.md",
      "01_PlayerCharacter.md",
      "02_InputAndCamera.md",
      "03_MovementAndNav.md",
      "04_CombatAndSkills.md",
      "05_ItemsAndInventory.md",
      "06_QuestsAndProgression.md",
      "07_WorldAndSpawns.md",
      "08_UIAndHUD.md",
      "09_NetworkingAndPersistence.md",
    ],
    unlocks: ["11_TestingAndDeployment.md"],
    window: "Semana 5 (Sessões 3–4)",
    description:
      "Crie ferramentas de operação ao vivo, telemetria e pipelines editoriais em Blueprint e Editor Utility Widgets.",
    blueprintSteps: [
      "Construir painéis internos com Editor Utility Widgets para ajustar loot, spawn e eventos em tempo real.",
      "Integrar telemetria básica (Analytics Blueprint) para monitorar sessões.",
      "Automatizar processos de build/empacotamento com scripts do Unreal Automation Tool.",
      "Preparar fluxos de hotfix usando DataAssets carregados dinamicamente.",
    ],
    deliverables: [
      "Ferramentas editoriais validadas por QA interno.",
      "Relatórios de analytics capturando métricas essenciais.",
      "Procedimentos de build documentados para equipe de operações.",
    ],
  },
  {
    order: 11,
    file: "11_TestingAndDeployment.md",
    title: "Testes, QA &amp; Publicação",
    priority: "Média",
    priorityClass: "media",
    dependencies: [
      "00_ModulesAndStartup.md",
      "01_PlayerCharacter.md",
      "02_InputAndCamera.md",
      "03_MovementAndNav.md",
      "04_CombatAndSkills.md",
      "05_ItemsAndInventory.md",
      "06_QuestsAndProgression.md",
      "07_WorldAndSpawns.md",
      "08_UIAndHUD.md",
      "09_NetworkingAndPersistence.md",
      "10_LiveOpsAndTools.md",
    ],
    unlocks: ["Conclusão"],
    window: "Semana 6 (Sessões 1–2)",
    description:
      "Finalize com testes integrados, certificações e plano de publicação do remake.",
    blueprintSteps: [
      "Criar suites de testes automatizados (Functional &amp; Automation) cobrindo cenários críticos.",
      "Configurar pipelines CI/CD para builds de QA e produção.",
      "Realizar testes de conformidade em plataformas-alvo e checklist de loja.",
      "Planejar rollback e comunicação com comunidade para atualizações.",
    ],
    deliverables: [
      "Relatórios de QA assinados e aprovados.",
      "Build candidata pronta para submissão.",
      "Plano de contingência documentado para o lançamento.",
    ],
  },
];

const timeline = document.getElementById("timeline");
const priorityFilter = document.getElementById("priorityFilter");
const searchInput = document.getElementById("searchInput");
const resetButton = document.getElementById("resetButton");
const stageCount = document.getElementById("stageCount");
const storageKey = "dados-blueprint-dashboard-checklist";

const checklistState = JSON.parse(localStorage.getItem(storageKey) || "{}");

function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function renderTimeline() {
  timeline.innerHTML = "";

  const priorityValue = priorityFilter.value;
  const searchValue = normalize(searchInput.value || "");

  const filtered = stageData.filter((stage) => {
    const priorityMatch = priorityValue ? stage.priority === priorityValue : true;
    if (!priorityMatch) return false;

    if (!searchValue) return true;

    const haystack = [
      stage.title,
      stage.file,
      stage.description,
      stage.blueprintSteps.join(" "),
      stage.deliverables.join(" "),
      stage.dependencies.join(" "),
      stage.unlocks.join(" "),
    ]
      .map(normalize)
      .join(" ");

    return haystack.includes(searchValue);
  });

  stageCount.textContent = `${filtered.length} etapa${filtered.length === 1 ? "" : "s"}`;

  filtered
    .sort((a, b) => a.order - b.order)
    .forEach((stage) => {
      const card = document.createElement("article");
      card.className = "timeline-card";
      card.innerHTML = createStageCard(stage);
      timeline.appendChild(card);
    });

  attachChecklistHandlers();
}

function createStageCard(stage) {
  const priorityClass = `badge-priority-${stage.priorityClass}`;
  const dependencies = stage.dependencies.length
    ? stage.dependencies.map((dep) => `<span class="badge text-bg-light me-1">${dep}</span>`).join("")
    : '<span class="text-body-secondary">Nenhuma</span>';
  const unlocks = stage.unlocks.length
    ? stage.unlocks.map((unlock) => `<span class="badge bg-primary-subtle text-primary-emphasis me-1">${unlock}</span>`).join("")
    : '<span class="text-body-secondary">Conclusão</span>';

  const blueprintSteps = stage.blueprintSteps
    .map(
      (step) =>
        `<li class="list-group-item list-group-item-action small">${step}</li>`
    )
    .join("");

  const deliverables = stage.deliverables
    .map((item, index) => {
      const key = `${stage.order}-${index}`;
      const completed = checklistState[key];
      return `
        <li class="checklist-item small ${completed ? "completed" : ""}" data-key="${key}">
          <i class="bi ${completed ? "bi-check-circle-fill text-success" : "bi-circle"} me-2"></i>${item}
        </li>`;
    })
    .join("");

  return `
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex flex-column flex-lg-row gap-3 align-items-lg-start justify-content-lg-between">
          <div class="flex-grow-1">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span class="badge timeline-badge ${priorityClass}">${stage.priority}</span>
              <span class="badge text-bg-secondary">Ordem ${stage.order}</span>
              <span class="badge text-bg-info text-dark">${stage.window}</span>
            </div>
            <h3 class="h5 fw-bold mb-1">${stage.title}</h3>
            <p class="text-body-secondary small mb-3">${stage.description}</p>
            <div class="stage-links mb-3">
              <a class="btn btn-sm btn-outline-primary" href="Dados/${stage.file}" target="_blank" rel="noopener">
                Abrir guia (${stage.file})
              </a>
            </div>
            <div class="row g-3 small">
              <div class="col-md-6">
                <h4 class="h6 fw-semibold text-uppercase text-body-secondary">Dependências</h4>
                <div>${dependencies}</div>
              </div>
              <div class="col-md-6">
                <h4 class="h6 fw-semibold text-uppercase text-body-secondary">Desbloqueia</h4>
                <div>${unlocks}</div>
              </div>
            </div>
          </div>
          <div class="flex-shrink-0 text-end">
            <button class="btn btn-outline-primary btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#stage-details-${stage.order}">
              Ver detalhes
            </button>
          </div>
        </div>
        <div class="collapse mt-4" id="stage-details-${stage.order}">
          <div class="row g-4">
            <div class="col-lg-6">
              <div class="card h-100 border-primary-subtle">
                <div class="card-header bg-primary-subtle text-primary-emphasis py-2">
                  <span class="fw-semibold small text-uppercase">Sequência Blueprint</span>
                </div>
                <ul class="list-group list-group-flush">
                  ${blueprintSteps}
                </ul>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="card h-100 border-success-subtle">
                <div class="card-header bg-success-subtle text-success-emphasis py-2">
                  <span class="fw-semibold small text-uppercase">Checklist de Saída</span>
                </div>
                <ul class="list-group list-group-flush" data-stage="${stage.order}">
                  ${deliverables}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function attachChecklistHandlers() {
  const items = timeline.querySelectorAll(".checklist-item");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.key;
      const icon = item.querySelector(".bi");
      const completed = item.classList.toggle("completed");

      if (completed) {
        icon.classList.remove("bi-circle");
        icon.classList.add("bi-check-circle-fill", "text-success");
      } else {
        icon.classList.add("bi-circle");
        icon.classList.remove("bi-check-circle-fill", "text-success");
      }

      checklistState[key] = completed;
      if (!completed) {
        delete checklistState[key];
      }
      localStorage.setItem(storageKey, JSON.stringify(checklistState));
    });
  });
}

priorityFilter.addEventListener("change", renderTimeline);
searchInput.addEventListener("input", renderTimeline);
resetButton.addEventListener("click", () => {
  priorityFilter.value = "";
  searchInput.value = "";
  renderTimeline();
});

// Load Bootstrap icons for checklist icons
(function injectBootstrapIcons() {
  const existing = document.getElementById("bootstrap-icons");
  if (existing) return;
  const link = document.createElement("link");
  link.id = "bootstrap-icons";
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
  document.head.appendChild(link);
})();

renderTimeline();
