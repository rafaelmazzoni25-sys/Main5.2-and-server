# Etapa 11 — QA, Automação e Publicação

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P11 — Média |
| **Dependências Diretas** | Etapas 0 a 10 |
| **Desbloqueia** | Conclusão do roadmap |
| **Foco UE5+** | Blueprint com Automation Framework e pipelines |
| **Linha do Tempo Indicativa** | Semana 6 — Sessões 1 e 2 |

## Marco Principal
Estabelecer rotinas de QA, testes automatizados em Blueprint e pipeline de publicação para consoles/PC.

## Pré-requisitos Organizacionais
- Ferramentas e analytics operacionais (Etapa 10).

## Sequência Cronológica em Blueprint
1. **Planos de Teste**
   - Criar `Test Case Assets` usando `Functional Testing` em Blueprint para inventário, quests e combate.
   - Catalogar cenários críticos e critérios de aprovação.
2. **Automação**
   - Configurar `Automation Tool` para executar testes funcionais e registrar resultados.
   - Criar `Editor Utility Widget` para disparar suíte completa.
3. **Continuous Integration**
   - Integrar com soluções CI (GitHub Actions/Azure DevOps) exportando comandos CLI do Unreal.
   - Garantir geração de relatórios em HTML para QA.
4. **Empacotamento e Publicação**
   - Documentar `Project Launcher` com perfis para QA, Beta e Live.
   - Scriptar passos para gerar builds incrementais e enviar para plataformas (Steam/Epic) usando ferramentas Blueprint ou CLI.
5. **Rollback e Suporte**
   - Definir procedimentos de rollback utilizando `SaveGame` versionado e toggles de Live Events.
   - Preparar checklists pós-lançamento (monitorar analytics, estabilidade, feedback).

## Checklist de Saída
- Testes automatizados cobrindo mecânicas principais executáveis via Blueprint.
- Pipeline de build/publicação documentado e repetível.

## Verificações de Dependência
- Executar suíte funcional e validar geração de relatório.
- Realizar empacotamento de teste confirmando integridade em build QA.
