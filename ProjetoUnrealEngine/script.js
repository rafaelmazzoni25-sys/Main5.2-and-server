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
    const dataFormatter = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });

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

    function inicializarDiario() {
        const form = document.getElementById('diary-form');
        const lista = document.getElementById('diary-list');
        const limpar = document.getElementById('diary-clear');

        if (!form || !lista) return;

        function obterEntradas() {
            return Array.isArray(progresso.diaryEntries) ? progresso.diaryEntries : [];
        }

        function salvarEntradas(entradas) {
            progresso.diaryEntries = entradas;
            salvarProgresso(progresso);
        }

        function atualizarEstadoBotoes() {
            if (limpar) {
                limpar.disabled = obterEntradas().length === 0;
            }
        }

        function criarParagrafoRotulado(rotulo, conteudo) {
            const paragrafo = document.createElement('p');
            paragrafo.className = 'diary-line';
            const strong = document.createElement('strong');
            strong.textContent = `${rotulo}: `;
            paragrafo.appendChild(strong);
            paragrafo.appendChild(document.createTextNode(conteudo || 'Não registrado.'));
            return paragrafo;
        }

        function renderizar() {
            const entradas = obterEntradas();
            lista.innerHTML = '';

            if (!entradas.length) {
                const vazio = document.createElement('li');
                vazio.className = 'diary-empty';
                vazio.textContent = 'Nenhuma anotação salva ainda. Preencha o formulário para registrar suas interpretações.';
                lista.appendChild(vazio);
                atualizarEstadoBotoes();
                return;
            }

            entradas.forEach((entrada, indice) => {
                const item = document.createElement('li');
                item.className = 'diary-entry';

                const cabecalho = document.createElement('div');
                cabecalho.className = 'diary-entry-header';

                const titulo = document.createElement('h4');
                titulo.textContent = entrada.topic || 'Anotação sem título';
                cabecalho.appendChild(titulo);

                if (entrada.timestamp) {
                    try {
                        const exibicao = dataFormatter.format(new Date(entrada.timestamp));
                        const meta = document.createElement('span');
                        meta.className = 'diary-meta';
                        meta.textContent = `Registrado em ${exibicao}`;
                        cabecalho.appendChild(meta);
                    } catch (erro) {
                        console.warn('Não foi possível formatar a data do diário.', erro);
                    }
                }

                const remover = document.createElement('button');
                remover.type = 'button';
                remover.className = 'diary-remove';
                remover.dataset.index = String(indice);
                remover.setAttribute('aria-label', `Remover a anotação ${entrada.topic || indice + 1}`);
                remover.textContent = 'Remover';
                cabecalho.appendChild(remover);

                item.appendChild(cabecalho);
                item.appendChild(criarParagrafoRotulado('Arquivo ou função', entrada.reference));
                item.appendChild(criarParagrafoRotulado('Anotações', entrada.notes));
                item.appendChild(criarParagrafoRotulado('Próximo passo', entrada.next));

                lista.appendChild(item);
            });

            atualizarEstadoBotoes();
        }

        form.addEventListener('submit', (evento) => {
            evento.preventDefault();

            const dados = new FormData(form);
            const topic = (dados.get('topic') || '').toString().trim();
            const reference = (dados.get('reference') || '').toString().trim();
            const notes = (dados.get('notes') || '').toString().trim();
            const next = (dados.get('next') || '').toString().trim();

            if (!topic || !notes) {
                return;
            }

            const novasEntradas = obterEntradas().concat({
                topic,
                reference,
                notes,
                next,
                timestamp: new Date().toISOString(),
            });

            salvarEntradas(novasEntradas);
            form.reset();
            const primeiroCampo = form.querySelector('input[name="topic"]');
            if (primeiroCampo) {
                primeiroCampo.focus({ preventScroll: true });
            }
            renderizar();
        });

        lista.addEventListener('click', (evento) => {
            const alvo = evento.target;
            if (!(alvo instanceof Element)) return;
            const botao = alvo.closest('.diary-remove');
            if (!botao) return;

            const indice = Number.parseInt(botao.dataset.index, 10);
            if (Number.isNaN(indice)) return;

            const entradas = obterEntradas();
            entradas.splice(indice, 1);
            salvarEntradas(entradas);
            renderizar();
        });

        if (limpar) {
            limpar.addEventListener('click', () => {
                if (!obterEntradas().length) return;
                const confirmar = window.confirm('Tem certeza de que deseja limpar todas as anotações do diário?');
                if (!confirmar) return;
                salvarEntradas([]);
                renderizar();
            });
        }

        renderizar();
    }

    document.addEventListener('DOMContentLoaded', () => {
        inicializarChecklist();
        inicializarMapaJornada();
        inicializarFoco();
        inicializarBotaoRetomar();
        inicializarDiario();
    });
})();
