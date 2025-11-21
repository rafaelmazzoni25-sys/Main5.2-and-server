# Roadmap de Portabilidade para Unreal Engine 5

Este plano descreve, em linguagem de trabalho do dia a dia, como recriar o cliente legado no Unreal Engine 5 usando apenas os assets originais. A ênfase é usar Blueprints sempre que fizer sentido (menus, lógica de gameplay, scripting de eventos), deixando C++ para infraestrutura ou pontos de performance.

## 1) Preparação e diagnóstico
- **Levantamento do acervo**: catalogar modelos, texturas, animações e sons (formatos BMD, scripts de textura, áudio). Registrar onde estão, dependências e o que falta.
- **Foto do cliente atual**: mapear o loop principal (inicialização, render OpenGL, UI Win32, áudio) para saber que papel assumirão `GameInstance`, `GameMode`, `PlayerController` e `Actor` no UE5.
- **Limites e formatos**: anotar restrições de ossos, vértices e materiais dos headers atuais para evitar perda de dados na conversão.
- **Ambiente**: instalar UE5, definir controle de versão de assets (Perforce/LFS) e organizar convenções de pastas e nomenclatura no novo projeto.

## 2) Conversão de assets
- **Modelos e animações**: criar/conferir conversores BMD → FBX/GLTF preservando hierarquia, pesos e animações. Validar Skeleton/Physics Assets no UE5.
- **Texturas e materiais**: converter para TGA/PNG/EXR e recriar materiais PBR. Usar Material Functions e Material Instances para agilizar ajustes.
- **Áudio**: padronizar para WAV/OGG e configurar Sound Cues/Sound Mixes equivalentes aos eventos do cliente atual.
- **Automação**: scripts (Python/Commandlet) para importar, renomear e organizar em `/Characters`, `/Environment`, `/UI`, mantendo um checklist de cobertura.

## 3) Arquitetura do projeto UE5
- **Base de código**: separar módulos C++ (Core/UI/Gameplay/Networking) apenas onde for necessário; expor nós reutilizáveis para Blueprints. `GameInstance` para bootstrap, `GameMode` e `PlayerController` para fluxo de jogo.
- **Mapas**: preparar mapas de Login, Seleção de Personagem e Mundo inicial. Avaliar `World Partition` e `Level Streaming` cedo.
- **Entrada**: migrar bindings para `Enhanced Input`. Criar mapeamentos de ações em Blueprints para facilitar iterações rápidas.

## 4) Sistemas de cliente (foco em Blueprint)
- **UI/UX**: reimplementar janelas/managers em UMG com Blueprints. HUD, inventário, chat, loja e overlays devem ser widgets modulares, prontos para localização e redimensionamento.
- **Personagem e câmeras**: configurar `Character`/`Pawn` com Animation Blueprints, `BlendSpaces` e `AimOffsets`. Ajustar câmeras (isométrica/livre) via Blueprints com componentes reutilizáveis.
- **Movimentação e física**: usar `Character Movement Component` com lógica de estado em Blueprints (dash, pulo, velocidade) e C++ apenas para extensões específicas.
- **Renderização e efeitos**: portar efeitos OpenGL para Niagara e Material Instances. Guardar perfis de qualidade em Blueprints para switches dinâmicos.
- **Áudio e feedback**: eventos de som dirigidos por Blueprints chamando Sound Cues, com Mixers para controle global.

## 5) Rede e serviços
- **Protocolo**: documentar mensagens (login, seleção, movimento). Se falar com servidor legado, criar camada cliente em C++ e expor nós de Blueprint para fluxos de UI/gameplay. Se migrar servidor, usar replicação/RPCs nativos.
- **Transporte**: sockets/HTTP/GRPC em C++; Blueprints consomem nós assíncronos para login, matchmaking e status de sessão.
- **Segurança**: autenticação, criptografia e validação de payloads antes de entregar dados a Blueprints.

## 6) Gameplay e conteúdo
- **Progressão e economia**: representar inventário, atributos e habilidades em Data Assets/Tables; lógica momentânea em Blueprints, regras de negócio sensíveis em C++.
- **IA e NPCs**: Behavior Trees/Blackboards e AI Controllers em Blueprints, com serviços C++ se precisar de desempenho.
- **Missões e eventos**: estruturar quests/eventos com objetos de dados e triggers; scripting majoritariamente em Blueprints para iteração rápida.
- **Partículas e VFX**: recriar efeitos em Niagara, testando performance em cenários de pico.

## 7) Ferramentas, build e QA
- **Builds**: automação (CI) para editor e distribuição Win64; validações de assets e testes automatizados. Commandlets para checar nomes, referências quebradas e tamanho de pacotes.
- **Performance e memória**: perfilar CPU/GPU, ajustar LODs, `World Partition`, streaming de texturas e níveis de detalhe de Niagara. Perf presets selecionáveis em Blueprint.
- **Testes**: suites funcionais (Gauntlet/Automation) para UI, rede e gameplay crítico; smoke tests por milestone. Testes de Blueprint nativos para checar lógica de UI e fluxo de jogo.
- **Localização e acessibilidade**: preparar `Localization Dashboard`, bindings de input remapeáveis e opções de acessibilidade expostas em UI Blueprint.

## 8) Milestones sugeridos
1. **Prova de conceito**: personagem importado, mapa simples, UI mínima em UMG, movimento offline em Blueprint.
2. **Vertical slice online**: login, seleção de personagem, entrada em mapa com replicação básica (movimento/combate) e UI de rede em Blueprint.
3. **Cobertura principal**: UI completa, inventário/economia, missões, VFX e áudio; builds reproduzíveis e checklist de assets convertidos.
4. **Otimização e hardening**: performance, segurança de rede, testes automatizados e preparação para alpha.
5. **Conteúdo completo**: todos os mapas/quests/itens migrados, localização ativa e pipeline de publicação definido.

## 9) Governança e riscos
- **Escopo**: manter uso exclusivo dos assets originais e bloquear dependências externas não autorizadas.
- **Documentação viva**: changelog de conversões, tabelas de mapeamento (mensagens de rede → handlers UE5) e decisões de quando usar Blueprint vs C++.
- **Riscos**: perda de fidelidade de animação na conversão, divergência de protocolo de rede e custos de performance ao recriar efeitos antigos.

## 10) Critérios de conclusão
- Paridade funcional do cliente legado no UE5, com lógica principal exposta em Blueprints onde couber.
- Pipelines de build e testes automatizados estáveis.
- Assets originais convertidos/versionados, sem dependências externas não permitidas.
Este roadmap detalha as etapas para reconstruir o cliente legado no Unreal Engine 5 (UE5), reutilizando apenas os assets originais do projeto e sem dependências externas além do que já existe no código-fonte/recursos atuais.

## 1) Preparação e diagnóstico
- **Inventário do repositório e assets**: mapear modelos, texturas, animações e sons existentes (formatos proprietários como BMD, scripts de textura, áudio). Registrar localizações e dependências.
- **Mapeamento do loop principal**: documentar inicialização, pipeline de renderização OpenGL, UI e áudio do cliente Win32 para entender equivalentes em UE5 (`GameInstance`, `GameMode`, `PlayerController`, `Actor`).
- **Formato e limites de dados**: catalogar restrições de ossos, vértices e materiais indicados nos headers do pipeline atual para orientar conversões.
- **Configuração do ambiente**: instalar UE5, setar controle de versão de assets (Perforce/LFS) e definir convenções de naming/estruturas de diretórios no novo projeto.

## 2) Conversão de assets
- **Modelos/Animações**: criar conversores de BMD -> FBX/GLTF preservando hierarquia, pesos e animações. Validar no UE5 com Skeleton e Physics Assets.
- **Texturas e materiais**: converter texturas para formatos suportados (TGA/PNG/EXR) e recriar materiais PBR no UE5. Automatizar normal/roughness/metalness quando possível.
- **Audio**: padronizar assets de áudio (WAV/OGG) e configurar Sound Cues equivalentes aos eventos do cliente atual.
- **Automação**: scripts para batch import/rename/organizar assets em pastas UE (`/Characters`, `/Environment`, `/UI`).

## 3) Arquitetura do projeto UE5
- **Estrutura base**: criar módulos C++ para Core, UI, Gameplay e Networking. Definir `GameInstance` para bootstrap, `GameMode`/`PlayerController` para fluxo de gameplay, e módulos editor/build.
- **Configuração de mapas**: estabelecer mapas de Login, Seleção de Personagem e Mundo inicial. Preparar `LevelSequence` ou `World Partition` se aplicável.
- **Sistemas de entrada**: migrar mapeamentos de teclado/mouse para `Enhanced Input`, garantindo paridade de controles.

## 4) Sistemas de cliente
- **UI/UX**: portar janelas/managers do cliente Win32 para widgets UMG. Implementar HUD, inventário, chat, loja e overlays de estado. Suportar redimensionamento/localização.
- **Personagem e câmeras**: configurar Pawns/Characters, animação com Animation Blueprints, `AimOffset` e `BlendSpaces`. Reproduzir câmeras isométricas/livres conforme o design original.
- **Movimentação e física**: replicar lógica de movimentação, colisão e interação com o mundo, ajustando para o Character Movement Component.
- **Renderização e efeitos**: substituir efeitos OpenGL por Niagara/Material Functions. Validar iluminação, sombras e pós-processamento.
- **Áudio e feedback**: mapear eventos de som do pipeline antigo para Sound Cues e Mixers no UE5.

## 5) Rede e serviços
- **Definição de protocolo**: documentar mensagens existentes (ex.: login, seleção, movimento) e desenhar contrato binário/JSON equivalente. Se o servidor legado for mantido, implementar cliente UE5 compatível; se for migrado, definir replicação e RPCs.
- **Camada de transporte**: implementar sockets/HTTP/GRPC em C++ ou usar replicação nativa caso também porte o servidor para UE. Garantir gerenciamento de sessões, keep-alive e reconexão.
- **Segurança**: validar autenticação, criptografia de tráfego e validações de dados recebidos.

## 6) Gameplay e sistemas de conteúdo
- **Progressão e economia**: portar inventário, atributos, habilidades e transações seguindo a lógica do cliente atual, com DataAssets/Table Rows para balanceamento.
- **IA e NPCs**: converter comportamentos para Behavior Trees/Blackboard e AI Controllers. Recriar rotinas de spawn e rotas.
- **Missões e eventos**: representar quests/eventos com objetos de dados, triggers e scripting (Blueprints/C++).
- **Partículas e VFX**: recriar efeitos especiais dos assets originais em Niagara, validando performance.

## 7) Ferramentas, build e QA
- **Pipelines de build**: configurar automação (CI) para builds de editor e distribuições (Win64). Incluir validações de assets e testes automatizados.
- **Perf e memória**: perfilar CPU/GPU no UE5, ajustar LODs, `World Partition`, streaming de texturas e tamanhos de pacotes.
- **Testes**: criar suites de testes funcionais (Gauntlet/Automation) para UI, rede e gameplay crítico. Incluir smoke tests para cada milestone.
- **Localização e acessibilidade**: preparar o projeto para múltiplos idiomas e opções de acessibilidade.

## 8) Milestones sugeridos
1. **Prova de conceito**: importação de um personagem, mapa simples e UI mínima; movimento offline funcional.
2. **Vertical slice online**: login, seleção de personagem, entrada em mapa com replicação básica de movimento/combate.
3. **Cobertura de sistemas principais**: UI completa, inventário/economia, missões, VFX e áudio, com build reproduzível.
4. **Otimização e hardening**: ajustes de performance, segurança de rede, testes automatizados e preparação para alpha.
5. **Conteúdo completo**: todos os mapas/quests/itens migrados, suporte a localização, pipeline de publicação.

## 9) Governança e riscos
- **Controle de escopo**: bloquear requisitos de terceiros e manter uso exclusivo dos assets originais.
- **Documentação viva**: manter changelog de conversões e tabelas de mapeamento (ex.: mensagens de rede -> handlers UE5).
- **Riscos principais**: perda de fidelidade de animação na conversão, divergência de protocolo de rede e custos de performance ao recriar efeitos antigos.

## 10) Critérios de conclusão
- Todos os sistemas do cliente legado reproduzidos no UE5 com paridade funcional.
- Pipelines de build e testes automatizados estáveis.
- Assets originais convertidos e versionados, sem dependências externas não autorizadas.
- Documentação e guias de operação/QA atualizados.
