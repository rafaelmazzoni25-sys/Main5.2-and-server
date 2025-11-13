# Plano de Implementação para Remake UE5+ (Blueprint)

A pasta **Dados** traz o roteiro completo para reconstruir o projeto no Unreal Engine 5+ priorizando **Blueprints**. Cada etapa detalha prioridades, dependências diretas, atividades cronológicas e checkpoints de saída.

## Estrutura dos Arquivos
- `00_*.md` até `11_*.md`: guias de etapas em ordem **prioritária, cronológica e dependente**.
- Cada arquivo descreve objetivo, pré-requisitos, sequência em Blueprint, checklist e verificações.

## Linha do Tempo, Prioridades e Dependências
| Ordem | Arquivo | Prioridade | Dependências Diretas | Desbloqueia | Janela Indicativa |
| --- | --- | --- | --- | --- | --- |
| 0 | `00_ModulesAndStartup.md` | Crítica | Nenhuma | 0A, 1–11 | Semana 1 (Sessões 1–2) |
| 0A | `00A_BlueprintCookbook.md` | Crítica | 0 | 1–3 | Semana 1 (Sessão 2) |
| 1 | `01_PlayerCharacter.md` | Crítica | 0 | 2–5 | Semana 1 (Sessões 3–4) |
| 2 | `02_InputAndCamera.md` | Alta | 0–1 | 3–5,7–8 | Semana 1 (Sessões 5–6) |
| 3 | `03_MovementAndNav.md` | Alta | 0–2 | 4–5,7–8 | Semana 2 (Sessões 1–2) |
| 4 | `04_CombatAndSkills.md` | Alta | 0–3 | 5–9 | Semana 2 (Sessões 3–4) |
| 5 | `05_ItemsAndInventory.md` | Alta | 0,1,2,4 | 6,8,9 | Semana 3 (Sessões 1–2) |
| 6 | `06_QuestsAndProgression.md` | Média-Alta | 0,1,2,4,5 | 7–10 | Semana 3 (Sessões 3–4) |
| 7 | `07_WorldAndSpawns.md` | Média | 0,1,2,3,4,6 | 8–10 | Semana 4 (Sessões 1–2) |
| 8 | `08_UIAndHUD.md` | Média | 0,1,2,4,5,6 | 9–11 | Semana 4 (Sessões 3–4) |
| 9 | `09_NetworkingAndPersistence.md` | Média | 0–8 | 10–11 | Semana 5 (Sessões 1–2) |
| 10 | `10_LiveOpsAndTools.md` | Média | 0–9 | 11 | Semana 5 (Sessões 3–4) |
| 11 | `11_TestingAndDeployment.md` | Média | 0–10 | Conclusão | Semana 6 (Sessões 1–2) |

## Como Utilizar
1. Prossiga na ordem indicada pela tabela, confirmando dependências antes de iniciar a próxima etapa.
2. Utilize a seção **Sequência Cronológica em Blueprint** de cada arquivo para orientar sessões de desenvolvimento.
3. Marque os itens da **Checklist de Saída** e execute as **Verificações de Dependência** para garantir prontidão da próxima etapa.

Seguindo essa linha do tempo, o remake evolui de fundações técnicas até operações ao vivo, com foco integral em soluções Blueprint compatíveis com UE5+.
