// Banco de exercícios e programas. [nome, grupo, tipo(w=carga b=peso do corpo t=tempo), riscos, alternativa, dica, passo kg]
const EX = {
  supino_reto: ['Supino reto (barra)', 'peito', 'w', ['ombro'], 'supino_halt', 'Escápulas juntas, barra toca o peito, cotovelos ~45°.', 2.5],
  supino_halt: ['Supino com halteres', 'peito', 'w', [], 0, 'Desça em 2s, empurre sem bater os halteres.', 2],
  supino_inc_halt: ['Supino inclinado (halteres)', 'peito', 'w', ['ombro'], 'crucifixo_maq', 'Banco a 30°, ombros para trás e para baixo.', 2],
  crucifixo_maq: ['Peck deck (crucifixo)', 'peito', 'w', [], 0, 'Cotovelos levemente flexionados, aperte no centro.', 2.5],
  crossover: ['Crossover (polia)', 'peito', 'w', [], 0, 'Braços em arco, foque em juntar o peito.', 2.5],
  flexao: ['Flexão de braço', 'peito', 'b', ['punho'], 'flexao_inc', 'Corpo em linha reta, peito perto do chão.'],
  flexao_inc: ['Flexão inclinada (mãos no banco)', 'peito', 'b', [], 0, 'Mãos elevadas, corpo reto.'],
  flexao_diamante: ['Flexão diamante', 'braco', 'b', ['punho', 'ombro'], 'flexao', 'Mãos juntas, cotovelos rente ao corpo.'],
  pike: ['Flexão pike (ombros)', 'ombro', 'b', ['ombro'], 'flexao_inc', 'Quadril alto em V, cabeça passa entre os braços.'],
  mergulho_banco: ['Mergulho no banco', 'braco', 'b', ['ombro', 'punho'], 'triceps_polia', 'Costas rente ao banco, desça até 90°.'],
  puxada: ['Puxada frontal', 'costas', 'w', [], 0, 'Puxe a barra ao peito, cotovelos para baixo.', 2.5],
  remada_baixa: ['Remada baixa (polia)', 'costas', 'w', [], 0, 'Peito aberto, junte as escápulas no final.', 2.5],
  remada_curv: ['Remada curvada (barra)', 'costas', 'w', ['lombar'], 'remada_apoiada', 'Tronco ~45°, coluna neutra, puxe até o umbigo.', 2.5],
  remada_apoiada: ['Remada apoiada (máquina)', 'costas', 'w', [], 0, 'Peito apoiado, puxe os cotovelos para trás.', 2.5],
  remada_unil: ['Remada unilateral (halter)', 'costas', 'w', [], 0, 'Apoie mão e joelho no banco, puxe ao quadril.', 2],
  face_pull: ['Face pull (polia)', 'ombro', 'w', [], 0, 'Puxe a corda ao rosto abrindo os cotovelos.', 2.5],
  barra_fixa: ['Barra fixa', 'costas', 'b', ['ombro'], 'puxada', 'Peito à barra, sem balançar.'],
  barra_neg: ['Barra fixa negativa', 'costas', 'b', [], 0, 'Suba com apoio/pulo e desça em 4–5s.'],
  australiana: ['Remada australiana', 'costas', 'b', [], 0, 'Corpo reto sob a barra, puxe o peito até ela.'],
  desenv_halt: ['Desenvolvimento (halteres)', 'ombro', 'w', ['ombro'], 'elev_lat', 'Core firme, empurre sem arquear a lombar.', 2],
  elev_lat: ['Elevação lateral', 'ombro', 'w', [], 0, 'Suba até a altura do ombro, sem balançar.', 1],
  goblet: ['Agachamento goblet', 'perna', 'w', [], 0, 'Halter no peito, desça com tronco ereto.', 2],
  agachamento: ['Agachamento livre (barra)', 'perna', 'w', ['joelho', 'lombar'], 'leg_press', 'Joelhos acompanham os pés, coluna neutra.', 5],
  leg_press: ['Leg press', 'perna', 'w', ['joelho'], 'elev_pelvico', 'Lombar colada, não trave os joelhos.', 5],
  afundo: ['Afundo / passada', 'perna', 'w', ['joelho'], 'elev_pelvico', 'Passo largo, tronco ereto, joelho alinhado.', 2],
  stiff: ['Stiff (posterior)', 'perna', 'w', ['lombar'], 'mesa_flexora', 'Quadril para trás, coluna neutra.', 5],
  mesa_flexora: ['Mesa flexora', 'perna', 'w', [], 0, 'Controle a descida, quadril colado.', 2.5],
  cadeira_ext: ['Cadeira extensora', 'perna', 'w', ['joelho'], 'elev_pelvico', 'Estenda sem travar, desça devagar.', 2.5],
  elev_pelvico: ['Elevação pélvica', 'perna', 'w', [], 0, 'Queixo no peito, aperte o glúteo no topo.', 5],
  panturrilha: ['Panturrilha em pé', 'perna', 'w', [], 0, 'Amplitude total, pause 1s no topo.', 5],
  rosca_direta: ['Rosca direta', 'braco', 'w', ['punho'], 'rosca_martelo', 'Cotovelos fixos, sem balançar o tronco.', 2],
  rosca_martelo: ['Rosca martelo', 'braco', 'w', [], 0, 'Pegada neutra, cotovelos colados.', 2],
  triceps_polia: ['Tríceps na polia', 'braco', 'w', [], 0, 'Cotovelos colados, estenda por completo.', 2.5],
  triceps_testa: ['Tríceps testa', 'braco', 'w', ['punho'], 'triceps_polia', 'Cotovelos apontando para cima, controle.', 2],
  prancha: ['Prancha', 'core', 't', ['punho'], 'dead_bug', 'Corpo reto, abdômen contraído, respire.'],
  hollow: ['Hollow hold', 'core', 't', ['lombar'], 'dead_bug', 'Lombar no chão, braços e pernas estendidos.'],
  dead_bug: ['Dead bug', 'core', 'b', [], 0, 'Lombar no chão, braço e perna opostos.'],
  elev_pernas: ['Elevação de pernas', 'core', 'b', ['lombar'], 'dead_bug', 'Lombar colada, desça devagar.'],
  agach_livre: ['Agachamento (peso do corpo)', 'perna', 'b', ['joelho'], 'ponte', 'Coxas paralelas, calcanhar no chão.'],
  agach_bulg: ['Agachamento búlgaro', 'perna', 'b', ['joelho'], 'ponte', 'Pé de trás elevado, tronco ereto.'],
  avanco_bw: ['Avanço (peso do corpo)', 'perna', 'b', ['joelho'], 'ponte', 'Passo largo, joelho de trás quase no chão.'],
  ponte: ['Ponte de glúteo', 'perna', 'b', [], 0, 'Aperte o glúteo no topo por 1s.'],
  pant_bw: ['Panturrilha (peso do corpo)', 'perna', 'b', [], 0, 'Suba nas pontas, desça devagar.']
};
const GRP = { peito: 'Peito', costas: 'Costas', ombro: 'Ombros', perna: 'Pernas', braco: 'Braços', core: 'Core' };

// [exercício, séries, reps mín, reps máx (ou segundos), descanso s]
const T = {
  FB_A: ['Corpo todo A', [['goblet', 3, 10, 12, 90], ['supino_halt', 3, 8, 12, 90], ['remada_baixa', 3, 10, 12, 90], ['desenv_halt', 2, 10, 12, 75], ['mesa_flexora', 2, 10, 15, 75], ['prancha', 3, 30, 45, 45]]],
  FB_B: ['Corpo todo B', [['leg_press', 3, 10, 12, 90], ['puxada', 3, 8, 12, 90], ['supino_inc_halt', 3, 8, 12, 90], ['elev_pelvico', 3, 10, 12, 90], ['elev_lat', 2, 12, 15, 60], ['rosca_direta', 2, 10, 12, 60], ['triceps_polia', 2, 10, 12, 60]]],
  FB_C: ['Corpo todo C', [['afundo', 3, 8, 12, 90], ['remada_unil', 3, 8, 12, 90], ['flexao', 3, 8, 15, 75], ['stiff', 3, 8, 12, 90], ['face_pull', 2, 12, 15, 60], ['panturrilha', 3, 12, 15, 60], ['dead_bug', 3, 10, 12, 45]]],
  UP_A: ['Superiores A', [['supino_halt', 4, 6, 10, 120], ['puxada', 4, 8, 12, 90], ['desenv_halt', 3, 8, 12, 90], ['remada_baixa', 3, 8, 12, 90], ['elev_lat', 3, 12, 15, 60], ['triceps_polia', 3, 10, 12, 60], ['rosca_direta', 3, 10, 12, 60]]],
  LO_A: ['Inferiores A', [['agachamento', 4, 6, 10, 150], ['stiff', 3, 8, 12, 120], ['leg_press', 3, 10, 12, 90], ['mesa_flexora', 3, 10, 15, 75], ['panturrilha', 4, 10, 15, 60], ['prancha', 3, 30, 45, 45]]],
  UP_B: ['Superiores B', [['supino_inc_halt', 4, 8, 12, 90], ['remada_curv', 4, 6, 10, 120], ['crucifixo_maq', 3, 10, 15, 60], ['face_pull', 3, 12, 15, 60], ['rosca_martelo', 3, 10, 12, 60], ['triceps_testa', 3, 10, 12, 60]]],
  LO_B: ['Inferiores B', [['leg_press', 4, 8, 12, 120], ['elev_pelvico', 4, 8, 12, 90], ['cadeira_ext', 3, 10, 15, 75], ['afundo', 3, 8, 12, 90], ['mesa_flexora', 3, 10, 15, 75], ['elev_pernas', 3, 10, 15, 45]]],
  PUSH: ['Empurrar', [['supino_reto', 4, 6, 10, 120], ['supino_inc_halt', 3, 8, 12, 90], ['desenv_halt', 3, 8, 12, 90], ['elev_lat', 4, 12, 20, 60], ['triceps_polia', 3, 10, 12, 60], ['crossover', 2, 12, 15, 60]]],
  PULL: ['Puxar', [['puxada', 4, 6, 10, 120], ['remada_curv', 3, 8, 12, 90], ['remada_baixa', 3, 8, 12, 90], ['face_pull', 3, 12, 15, 60], ['rosca_direta', 3, 8, 12, 60], ['rosca_martelo', 2, 10, 12, 60]]],
  LEGS: ['Pernas', [['agachamento', 4, 6, 10, 150], ['stiff', 3, 8, 12, 120], ['leg_press', 3, 10, 12, 90], ['cadeira_ext', 2, 10, 15, 75], ['mesa_flexora', 3, 10, 15, 75], ['panturrilha', 4, 10, 15, 60]]],
  C_FULL: ['Calistenia corpo todo', [['flexao', 3, 8, 15, 75], ['australiana', 3, 8, 12, 75], ['agach_livre', 3, 12, 20, 60], ['ponte', 3, 12, 20, 60], ['prancha', 3, 30, 60, 45]]],
  C_UP: ['Calistenia superiores', [['flexao', 4, 8, 15, 75], ['barra_fixa', 4, 3, 8, 90], ['pike', 3, 6, 12, 75], ['mergulho_banco', 3, 8, 15, 75], ['hollow', 3, 15, 30, 45]]],
  C_PUSH: ['Calistenia: empurrar', [['flexao', 4, 8, 15, 75], ['pike', 3, 6, 12, 75], ['mergulho_banco', 3, 8, 15, 75], ['flexao_diamante', 3, 6, 12, 75], ['prancha', 3, 30, 60, 45]]],
  C_PULL: ['Calistenia: puxar', [['barra_fixa', 5, 3, 8, 90], ['australiana', 4, 8, 12, 75], ['dead_bug', 3, 10, 12, 45], ['hollow', 3, 15, 30, 45]]],
  C_LEGS: ['Calistenia: pernas', [['agach_livre', 4, 12, 20, 60], ['agach_bulg', 3, 8, 12, 75], ['ponte', 3, 12, 20, 60], ['avanco_bw', 3, 10, 12, 60], ['pant_bw', 3, 15, 25, 45]]]
};
const SPLIT = {
  forca: { 1: ['FB_A'], 2: ['FB_A', 'FB_B'], 3: ['FB_A', 'FB_B', 'FB_C'], 4: ['UP_A', 'LO_A', 'UP_B', 'LO_B'], 5: ['PUSH', 'PULL', 'LEGS', 'UP_A', 'LO_A'], 6: ['PUSH', 'PULL', 'LEGS', 'PUSH', 'PULL', 'LEGS'] },
  calis: { 1: ['C_FULL'], 2: ['C_UP', 'C_LEGS'], 3: ['C_PUSH', 'C_PULL', 'C_LEGS'] }
};

const HIIT = [
  ['HIIT corpo todo', ['Polichinelo', 'Agachamento com salto', 'Mountain climber', 'Burpee sem flexão']],
  ['HIIT pernas + cardio', ['Joelho alto', 'Avanço alternado', 'Skater (lateral)', 'Agachamento rápido']],
  ['HIIT core + cardio', ['Mountain climber', 'Polichinelo', 'Prancha com toque no ombro', 'Corrida parada']]
];
// [trabalho s, descanso s, voltas] por nível
const HIIT_L = [[30, 30, 8], [40, 20, 10], [45, 15, 12]];

const RUN_LADDER = [[3, 1, 2, 8], [3, 2, 2, 7], [3, 3, 2, 6], [3, 5, 2, 4], [3, 8, 2, 3], [3, 12, 2, 2], [3, 20, 0, 1]];

const FAQ = [
  ['Como funciona a progressão de carga?', 'Dupla progressão: você tem uma faixa de repetições (ex.: 8–12). Quando completar todas as séries no topo da faixa, o app sobe a carga e a meta volta ao início da faixa. Se não bateu, repita a carga e tente +1 rep.'],
  ['Quanto descansar entre séries?', 'Exercícios pesados e compostos: 2–3 min. Acessórios: 60–90s. O cronômetro automático já sugere o tempo.'],
  ['Cardio antes ou depois da musculação?', 'Se o objetivo é força/hipertrofia, faça musculação primeiro (ou separe por 6h+). Cardio leve de aquecimento (5 min) é ok.'],
  ['Posso treinar com dor?', 'Dor muscular tardia (DOMS) é normal. Dor aguda, articular ou que piora: pare, troque o exercício e procure um profissional de saúde.'],
  ['O que é RIR/RPE?', 'RIR = repetições que sobraram no tanque. RIR 2 ≈ você pararia com mais 2 reps possíveis. RPE 8 ≈ RIR 2. Maioria das séries deve ficar em RIR 1–3.'],
  ['Semana leve (deload)?', 'A cada 6 semanas o app reduz o volume (~40%) e a carga (~10%) por uma semana para recuperar. Você volta mais forte.']
];
