# Etapa 3 — Movimentação Avançada e Navegação

| Campo | Detalhe |
| --- | --- |
| **Prioridade Global** | P3 — Alta |
| **Dependências Diretas** | Etapas 0, 1 e 2 |
| **Desbloqueia** | Etapas 4, 5, 7 e 8 |
| **Foco UE5+** | Blueprint com Character Movement e Navigation System |
| **Linha do Tempo Indicativa** | Semana 2 — Sessões 1 e 2 |

## Marco Principal
Expandir a locomoção do personagem com dash, salto carregado e navegação AI/companion, garantindo base sólida para combate e mundo aberto.

## Pré-requisitos Organizacionais
- `BP_RemakeCharacter` com input funcional (Etapa 2).
- Mapas com `NavMeshBoundsVolume` configurado para testes.

## Sequência Cronológica em Blueprint
1. **Ajustes de Character Movement**
   - Atualizar `Character Movement` para suportar sprint e dash (habilitar `Use Separate Braking Friction`).
   - Criar Timeline Blueprint para dash, aplicando impulso via `Launch Character`.
   - Expor variáveis `WalkSpeed`, `SprintSpeed`, `DashDistance` para DataTable.
2. **Sistema de Estamina**
   - Integrar consumo de `Stamina` durante sprint/dash utilizando `GameplayAbility` leve ou lógica direta em Blueprint.
   - Ligar eventos `OnStaminaBelowThreshold` -> interromper sprint e emitir aviso via HUD (Etapa 8).
3. **Movimentos Verticais**
   - Implementar `Mantle` simples usando `Trace For Objects` e timeline para subir obstáculos.
   - Adicionar `Charged Jump` com `Hold` no Input Action e curva de força.
4. **Navegação e AI Assistida**
   - Criar `BP_RemakeNavHelper` (Actor Blueprint) responsável por chamar `Simple Move to Location` e emitir eventos de navegação.
   - Configurar `Nav Link Proxy` para saltos e escaladas especiais.
   - Preparar `AI Companion` placeholder (`BP_RemakeCompanion`) que segue player usando `Move To` (utilizado na Etapa 7).
5. **Sincronização em Multiplayer**
   - Certificar que `Launch Character`, `Dash` e `Mantle` são executados no servidor e replicados aos clientes.
   - Usar `Multicast` para efeitos visuais compartilhados.

## Checklist de Saída
- Blueprint do personagem com movimentos expandidos e variáveis parametrizadas.
- Componentes de navegação e helpers disponíveis para companions e inimigos.

## Verificações de Dependência
- Testar `Play In Editor` com `2 Clients` garantindo replicação do dash/mantle.
- Validar `NavMesh` com `Show Navigation` e checar se `AI Companion` contorna obstáculos.
