(function () {
    const STORAGE_KEY = 'guia-unreal-progresso';
    const storage = window.localStorage;

    function carregarProgresso() {
        try {
            const data = storage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (erro) {
            console.warn('Não foi possível ler o progresso salvo.', erro);
            return {};
        }
    }

    function salvarProgresso(progresso) {
        try {
            storage.setItem(STORAGE_KEY, JSON.stringify(progresso));
        } catch (erro) {
            console.warn('Não foi possível salvar o progresso.', erro);
        }
    }

    const progresso = carregarProgresso();

    function inicializarChecklist() {
        const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            const id = checkbox.dataset.taskId;
            checkbox.checked = Boolean(progresso[id]);
            checkbox.addEventListener('change', () => {
                progresso[id] = checkbox.checked;
                salvarProgresso(progresso);
            });
        });
    }

    function inicializarMapaJornada() {
        const lista = document.getElementById('toc-list');
        const template = document.getElementById('toc-item-template');
        const secoes = document.querySelectorAll('section[data-section-id]');

        secoes.forEach((secao) => {
            const item = template.content.firstElementChild.cloneNode(true);
            const titulo = secao.querySelector('h2');
            const link = item.querySelector('a');
            const targetId = secao.dataset.sectionId;
            secao.id = targetId;

            link.dataset.target = targetId;
            link.textContent = titulo ? titulo.textContent : targetId;
            link.addEventListener('click', (evento) => {
                evento.preventDefault();
                document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            lista.appendChild(item);
        });
    }

    function inicializarFoco() {
        const toggles = document.querySelectorAll('.focus-toggle');
        toggles.forEach((botao) => {
            const alvo = document.getElementById(botao.dataset.target);
            if (!alvo) return;

            const closeLabel = botao.dataset.closeLabel || botao.textContent.trim();
            const fallbackOpen = closeLabel.toLowerCase().includes('mostrar')
                ? closeLabel.replace(/mostrar/i, 'Ocultar')
                : 'Ocultar detalhe';
            const openLabel = botao.dataset.openLabel || fallbackOpen;

            botao.dataset.closeLabel = closeLabel;
            botao.dataset.openLabel = openLabel;
            botao.setAttribute('aria-expanded', alvo.hasAttribute('hidden') ? 'false' : 'true');

            botao.addEventListener('click', () => {
                const estaOculto = alvo.hasAttribute('hidden');
                if (estaOculto) {
                    alvo.removeAttribute('hidden');
                    botao.textContent = botao.dataset.openLabel;
                    botao.setAttribute('aria-expanded', 'true');
                } else {
                    alvo.setAttribute('hidden', '');
                    botao.textContent = botao.dataset.closeLabel;
                    botao.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    function inicializarBotaoRetomar() {
        const botao = document.getElementById('resume-button');
        if (!botao) return;

        botao.addEventListener('click', () => {
            const primeiroNaoConcluido = document.querySelector('.checklist input[type="checkbox"]:not(:checked)');
            if (primeiroNaoConcluido) {
                primeiroNaoConcluido.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primeiroNaoConcluido.focus({ preventScroll: true });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        inicializarChecklist();
        inicializarMapaJornada();
        inicializarFoco();
        inicializarBotaoRetomar();
    });
})();
