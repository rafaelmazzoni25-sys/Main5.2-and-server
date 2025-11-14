# Etapa 9 — Networking, Persistência e Backend

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P9 — Média |
| **Dependências Diretas** | Etapas 0 a 8 |
| **Desbloqueia** | Etapas 10 e 11 |
| **Foco UE5+** | Blueprint com replicação, SaveGame e integrações REST |
| **Linha do Tempo Indicativa** | Semana 5 — Sessões 1 e 2 |

## Marco Principal
Garantir replicação confiável de personagens, inventário e mundo, além de persistir dados localmente ou via backend externo.

## Pré-requisitos Organizacionais
- Todos os sistemas de gameplay e UI prontos e gerando eventos (Etapas 0–8).

## Sequência Cronológica em Blueprint
1. **Revisão de Replicação**
   - Confirmar que variáveis críticas (`EquippedItems`, `QuestStates`, `Currencies`) estão marcadas para replicação.
   - Implementar `OnRep` específicos para atualizar HUD quando valores mudarem.
2. **SaveGame Estruturado**
   - Criar `BP_RemakeSaveGame` com structs `FCharacterSnapshot`, `FInventorySnapshot`, `FQuestSnapshot`.
   - Implementar `SaveGameSubsystem` em Blueprint para salvar/carregar nos momentos corretos.
3. **Persistência Online**
   - Usar `VA REST Plugin` ou equivalente Blueprint para enviar/receber dados de backend REST.
   - Mapear endpoints `POST /character`, `GET /inventory`, etc., convertendo JSON para structs.
4. **Sessões e Matchmaking**
   - Integrar `Online Subsystem` (Steam/EOS) via Blueprint para criar/join session.
   - Expor UI de lobby simples usando widgets da Etapa 8.
5. **Resiliência e Rollback**
   - Implementar redundância com `Local Cache` em SaveGame caso backend falhe.
   - Registrar tentativas e falhas via `BP_RemakeLogger` para auditoria.

## Checklist de Saída
- Replicação validada para todos os componentes críticos.
- Persistência local e remota funcionando com fallback.

## Verificações de Dependência
- Testar conexão com backend mock (via `Play In Editor`) e garantir sincronização de inventário.
- Validar reconexão após falha de rede simulada.

## Referências do Código Original
- **Bootstrap de conexões**: `GameMain.cpp` demonstra conexões separadas com JoinServer/DataServer e leitura de configuração (`gServerInfo`), norteando a arquitetura de serviços/Online Subsystem. 【F:Source MuServer Update 15/GameServer/GameServer/GameMain.cpp†L1-L92】
- **Estados globais**: `User.cpp` mantém contadores (`gObjTotalUser`, `gObjOffStore`) e processa eventos recorrentes (`gObjEventRunProc`), destacando quais dados exigem replicação e sincronização em background. 【F:Source MuServer Update 15/GameServer/GameServer/User.cpp†L1-L104】
