# Etapa 11: Testes, QA e Publicação

1. **Testes Unitários e Funcionais**
   - Configure `AutomationTool` para testes funcionais de movimento, combate e inventário.
   - Crie testes unitários em C++ para os componentes de inventário, progressão e quests.
2. **Perfis de Desempenho**
   - Utilize Unreal Insights e Stat Commands para validar FPS e consumo de memória.
   - Adicione métricas de rede (Packet Loss, RTT) nos servidores dedicados.
3. **Integração Contínua**
   - Scripts no `10_LiveOpsAndTools.cpp` devem acionar pipelines de build e testes automatizados.
   - Configure builds diários para Windows, Linux e consoles alvo.
4. **Preparação de Lançamento**
   - Gere pacotes `pak` assinados, aplique compressão Oodle.
   - Valide integrações com backend (login, loja, ranking) antes de liberar.
5. **Suporte Pós-Lançamento**
   - Planeje cadência de patches, monitoramento ativo e canais de suporte.

> Siga a ordem numérica dos arquivos para reconstruir o projeto com consistência entre mecânicas e sistemas.
