# Prompt para colar na Lovable (projeto ai-fitness-coach)

Cole o bloco abaixo em **um** prompt. Se a Lovable reclamar do tamanho, divida nas etapas 1, 2 e 3.

---

Evolua o app "Treino AI" (React + Supabase + Lovable AI gateway). Antes de mexer, leia o schema atual do banco, `src/lib/onboarding.ts`, `src/lib/plan.functions.ts`, `src/lib/plan-chat.functions.ts`, `dashboard.tsx`, `profile.tsx` e `exercise-detail-dialog.tsx`, e reaproveite o que já existe. Não quebre auth nem RLS (toda tabela nova com RLS por usuário). Tudo em português do Brasil, mobile-first (uso na academia, com uma mão), visual escuro e motivador (fundo #0b0d12, destaque verde-limão #c6ff3d → turquesa #19e3b1, botões grandes).

## Etapa 1 — Onboarding novo (substitui o conversacional por perguntas)
1. **Objetivos (multi-seleção):** ganhar massa, perder gordura, ficar mais forte, condicionamento, melhorar na corrida, melhorar na natação, saúde e mobilidade, performance esportiva.
2. **Modalidades (multi-seleção, SEM perguntar quantas vezes):** musculação, calistenia, natação, HIIT, corrida, cardio (bike/esteira). O usuário só escolhe quais quer; a IA decide a frequência.
3. **"Descreva seu dia":** textarea livre (ex.: "trabalho seg–sex 8h às 18h, sábado livre de manhã, só treino de noite"). A IA interpreta e devolve JSON com a janela livre de cada dia da semana; mostre o resultado em chips editáveis (dia ligado/desligado + hora início/fim) para o usuário confirmar.
4. **Lesões e limitações (importante):** chips (ombro, cotovelo, punho, lombar, quadril, joelho, tornozelo) + texto livre (cirurgias, diagnósticos, o que piora a dor). Esses dados entram SEMPRE no prompt de geração do plano e do chat. A IA deve trocar exercícios de risco por alternativas seguras, usar HIIT/corrida de baixo impacto quando houver limitação nas pernas, e recomendar avaliação médica/fisioterápica em casos sérios.
5. **Dados:** nome, idade, sexo, peso, altura, nível (iniciante/voltando de pausa, intermediário, avançado). Se "voltando de pausa": 2 primeiras semanas com volume reduzido e esforço leve.

## Etapa 2 — Plano gerado pela IA (uma única chamada, saída estruturada)
A IA recebe tudo da etapa 1 e retorna um plano semanal completo:
- Escolhe quantas sessões de cada modalidade e em quais **dias e horários** (dentro das janelas livres), espaçando sessões pesadas (≥48h para o mesmo grupo muscular), musculação antes de cardio no mesmo dia, evitando treino intenso depois das 21h. Explica o porquê dos dias/horários e do split escolhido (texto salvo e visível).
- Cada sessão: musculação/calistenia = exercícios com séries, faixa de repetições, descanso e observação; natação = séries em metros com pausas; corrida = intervalos/progressão (iniciante: corre/caminha); HIIT = exercícios + tempo de trabalho/descanso; cardio = duração e zona.
- Para cada exercício de peso: **carga inicial sugerida em kg** estimada a partir de peso, sexo, nível e fase de adaptação (conservadora; deve sobrar 3–4 repetições).

## Etapa 3 — Cargas e progressão (SEM usar IA, lógica determinística no código)
- Em cada série do treino mostrar **"Indicada: X kg"** e dois inputs: **kg feito** e **reps feitas**, com botão ✓ que inicia o cronômetro de descanso (beep + vibração ao terminar).
- **Dupla progressão:** cada exercício tem faixa (ex.: 8–12). Se TODAS as séries atingirem o topo da faixa na carga atual → próxima carga indicada = +2,5 kg (membros superiores/halteres +2 kg, inferiores +5 kg). Se a média ficar 2+ reps abaixo do mínimo → reduzir 10%. Senão manter a carga e buscar +1 rep. Exercícios de peso do corpo/tempo: subir a faixa de reps/segundos quando bater o topo.
- **Semana leve (deload)** a cada 6 semanas: 40% menos séries e cargas −10%.
- Ao finalizar o treino: resumo com "indicada × feita" por exercício, volume total, novos recordes (1RM estimado = kg × (1 + reps/30)) e pedir esforço percebido (RPE 5–10).
- Tela de progresso: gráfico por exercício com duas linhas (carga indicada × carga feita), sessões por semana, recordes, peso corporal, histórico.
- Botão **"🩹 Trocar"** em cada exercício durante o treino: a IA (ou uma lista local de alternativas por grupo muscular, respeitando as lesões) substitui na hora.

## Chat e economia de créditos
- Mantenha o chat vinculado ao plano (trocar exercício, comparar splits, tirar dúvidas, ajustar rotina). Respostas curtas e objetivas.
- Use o **modelo mais barato disponível** no gateway para o chat e para interpretar a rotina; use o modelo mais forte **apenas** para gerar/regerar o plano. Não chame IA para progressão de carga, registros ou gráficos.
- Limite o histórico enviado ao chat às últimas ~10 mensagens + um resumo do plano (não reenvie o plano inteiro a cada mensagem).

## Extras
- Home "Hoje": sessão do dia, anel de progresso semanal, sequência de semanas cumpridas, frase motivacional.
- PWA instalável (manifest + ícones) para usar na tela inicial do celular.
