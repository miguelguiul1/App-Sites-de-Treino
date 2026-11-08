/* Treino Pro — app 100% local (localStorage), sem backend, sem custo de tokens. */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parse = s => { const [a, b, c] = s.split('-').map(Number); return new Date(a, b - 1, c); };
const addD = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const wkStart = s => addD(s, -((parse(s).getDay() + 6) % 7));
const diffD = (a, b) => Math.round((parse(a) - parse(b)) / 864e5);
const tm = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const ft = n => `${pad(Math.floor(n / 60) % 24)}:${pad(n % 60)}`;
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
const rnd = (v, st) => Math.round(v / st) * st;
const DN = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const MODS = {
  forca: { n: 'Musculação', e: '🏋️', dur: 60, pref: '17:30' }, calis: { n: 'Calistenia', e: '🤸', dur: 45, pref: '17:30' },
  hiit: { n: 'HIIT', e: '⚡', dur: 30, pref: '17:30' }, nat: { n: 'Natação', e: '🏊', dur: 45, pref: '07:00' },
  corr: { n: 'Corrida', e: '🏃', dur: 40, pref: '07:00' }, cardio: { n: 'Cardio', e: '🚴', dur: 40, pref: '07:00' }
};
const LV = ['iniciante', 'intermediario', 'avancado'];
const QUOTES = ['A disciplina vence a motivação.', 'Um treino de cada vez.', 'Você não precisa estar motivado, só precisa começar.', 'Constância é o verdadeiro atalho.', 'Hoje você é mais forte que ontem.', 'Faça o básico muito bem, por muito tempo.'];

/* ---------- estado ---------- */
const KEY = 'treinopro.v1';
const fresh = () => ({ p: null, plan: null, logs: [], prog: {}, bw: [], start: today() });
let S; try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { toast('Sem espaço para salvar!'); } };
const defP = () => ({
  nome: '', objs: ['hipertrofia'], mods: ['forca', 'nat'], rotina: '', nivel: 'iniciante', volta: true, peso: '', desc: 90, notas: '', flags: [],
  freq: { forca: 3, calis: 0, hiit: 0, corr: 0, nat: 1, cardio: 0 },
  av: Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map(d => [d, { on: d >= 1 && d <= 5, de: '18:00', ate: '21:00' }]))
});
if (S.p && !S.p.objs) { S.p.objs = [S.p.obj || 'hipertrofia']; S.p.mods = Object.keys(S.p.freq || {}).filter(m => S.p.freq[m] > 0); S.p.rotina = S.p.rotina || ''; }
let D = JSON.parse(JSON.stringify(S.p || defP()));
const ui = { tab: S.p ? 'hoje' : 'perfil', ex: '' };
let W = null, R = null, H = null, tick = null;

/* ---------- lógica de treino ---------- */
const count = m => S.logs.filter(l => l.m === m).length;
function phase() {
  const w = Math.floor(diffD(today(), S.start) / 7) + 1;
  return { w, adapt: !!S.p.volta && w <= 2, deload: w > 2 && w % 6 === 0 };
}
function resolve(id, p) {
  for (let k = 0; k < 3; k++) {
    if (id === 'barra_fixa' && p.nivel === 'iniciante') return 'barra_neg';
    const x = EX[id];
    if (x[4] && x[3].some(r => p.flags.includes(r))) id = x[4]; else break;
  }
  return id;
}
function mkLift(tpl, p, ph) {
  const seen = new Set(), out = [];
  tpl.forEach(([id, sets, lo, hi, rest]) => {
    id = resolve(id, p); if (seen.has(id)) return; seen.add(id);
    const o = p.objs || [];
    if (o.includes('forca') && !o.includes('hipertrofia') && !o.includes('emagrecer') && EX[id][2] === 'w') { lo = Math.max(3, lo - 3); hi = Math.max(lo + 2, hi - 4); rest = (rest || p.desc) + 30; }
    let n = sets + (p.nivel === 'avancado' ? 1 : 0) - (p.nivel === 'iniciante' && sets > 3 ? 1 : 0);
    if (ph.adapt) n = Math.max(2, n - 1);
    if (ph.deload) n = Math.max(2, Math.ceil(n * .6));
    out.push({ id, n, lo, hi, rest: rest || p.desc });
  });
  return out;
}
function nextIdx(m) {
  const n = S.p.freq[m] || 3, ws = wkStart(today());
  return S.logs.filter(l => l.m === m && l.d >= ws).length % Math.max(1, Math.min(n, m === 'calis' ? 3 : 6));
}
const legFlag = () => ['joelho', 'tornozelo', 'quadril'].some(f => S.p.flags.includes(f));
function sessionFor(m, i) {
  const s = sessionBase(m, i);
  if (s.kind === 'hiit' && legFlag()) s.mv = s.mv.map(x => LOWIMP[x] || x);
  if (s.m === 'corr' && legFlag()) s.notes.unshift('⚠️ Você marcou limitação nas pernas: prefira bike ou natação e converse com um profissional antes de correr.');
  return s;
}
function sessionBase(m, i) {
  const p = S.p, L = Math.max(0, LV.indexOf(p.nivel)), ph = phase(), c = count(m);
  if (m === 'forca' || m === 'calis') {
    const n = Math.min(Math.max(p.freq[m] || 3, 1), m === 'calis' ? 3 : 6), sp = SPLIT[m][n], [name, tpl] = T[sp[i % sp.length]];
    return { m, kind: 'lift', name, ex: mkLift(tpl, p, ph) };
  }
  if (m === 'hiit') { const [name, mv] = HIIT[c % 3], [w, r, v] = HIIT_L[L]; return { m, kind: 'hiit', name, mv, w, r, v }; }
  if (m === 'nat') {
    const aq = [100, 200, 400][L];
    const V = [
      ['Natação técnica', [`Aquecimento: ${aq} m solto`, `Técnica: ${[4, 6, 8][L]}×50 m (educativos + pernada), pausa 20s`, `Principal: ${[4, 8, 10][L]}×${[50, 100, 100][L]} m crawl contínuo, pausa 20s`, 'Volta à calma: 100 m solto']],
      ['Natação resistência', [`Aquecimento: ${aq} m`, `Principal: ${[2, 3, 4][L]}×${[200, 300, 400][L]} m em ritmo constante, pausa 30s`, 'Pernada com prancha: 4×50 m', 'Volta à calma: 100 m']],
      ['Natação velocidade', [`Aquecimento: ${aq} m`, 'Educativos: 4×50 m', `Tiros: ${[6, 8, 10][L]}×${[25, 50, 50][L]} m forte, pausa 30s`, 'Solto: 200 m alternando nados', 'Volta à calma: 100 m']]
    ][c % 3];
    return { m, kind: 'nat', name: V[0], notes: V[1], f: ['Metros nadados', 'Minutos'] };
  }
  if (m === 'corr') {
    if (L === 0) {
      let c2 = c, tot = RUN_LADDER.reduce((a, r) => a + r[0], 0);
      for (const [n, r, w, v] of RUN_LADDER) {
        if (c2 < n) return { m, kind: 'corr', name: `Corrida: etapa ${c + 1}/${tot}`, notes: ['Aquecimento: caminhada 5 min', w ? `${v}× (${r} min correndo leve + ${w} min caminhando)` : `${r} min correndo contínuo, ritmo de conversa`, 'Desaquecimento: caminhada 5 min'], f: ['Distância (km)', 'Minutos'] };
        c2 -= n;
      }
      return { m, kind: 'corr', name: 'Corrida contínua', notes: ['Aquecimento: caminhada 5 min', '25–35 min em ritmo de conversa (você consegue falar frases)', 'Desaquecimento: caminhada 5 min'], f: ['Distância (km)', 'Minutos'] };
    }
    const V = [['Corrida leve', '35–45 min em ritmo de conversa (zona 2)'], ['Corrida intervalada', `Aquecimento 10 min + ${[0, 6, 8][L]}×(2 min forte / 2 min leve) + 5 min solto`], ['Corrida longa', `${[0, 50, 70][L]} min bem leve, sem se preocupar com o pace`]][c % 3];
    return { m, kind: 'corr', name: V[0], notes: [V[1], 'Aumente o volume semanal em no máximo ~10%'], f: ['Distância (km)', 'Minutos'] };
  }
  const min = Math.min(30 + 5 * Math.floor(c / 2), 60);
  return { m: 'cardio', kind: 'cardio', name: 'Cardio zona 2', notes: [`${min} min em bike, esteira, elíptico ou remo`, 'Intensidade moderada: dá para conversar (RPE 5–6)'], f: ['Distância (km)', 'Minutos'] };
}
function planWeek(p) {
  const heavy = [], light = [];
  ['forca', 'calis', 'hiit', 'corr', 'nat', 'cardio'].forEach(m => { for (let i = 0; i < (p.freq[m] || 0); i++)(['forca', 'calis', 'hiit'].includes(m) ? heavy : light).push({ m, i }); });
  let days = WEEK.filter(d => p.av[d] && p.av[d].on); if (!days.length) days = [1, 3, 5];
  const plan = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }, k = Math.min(heavy.length, days.length);
  let best = days.slice(0, k), bs = -1;
  (function rec(st, ch) {
    if (ch.length === k) {
      const pos = ch.map(d => (d + 6) % 7).sort((a, b) => a - b);
      let mg = 7; if (k > 1) for (let j = 0; j < k; j++) mg = Math.min(mg, j + 1 < k ? pos[j + 1] - pos[j] : pos[0] + 7 - pos[j]);
      if (mg > bs) { bs = mg; best = ch.slice(); } return;
    }
    for (let j = st; j < days.length; j++) { ch.push(days[j]); rec(j + 1, ch); ch.pop(); }
  })(0, []);
  best.sort((a, b) => (a + 6) % 7 - (b + 6) % 7);
  heavy.forEach((s, j) => plan[best[j % best.length]].push(s));
  light.forEach(s => { const d = days.slice().sort((a, b) => plan[a].length - plan[b].length)[0]; plan[d].push(s); });
  for (const d in plan) {
    const a = p.av[d] && p.av[d].on ? p.av[d] : { de: '18:00', ate: '20:00' }; let cur = null;
    plan[d].sort((x, y) => (['forca', 'calis', 'hiit'].includes(y.m) ? 1 : 0) - (['forca', 'calis', 'hiit'].includes(x.m) ? 1 : 0));
    plan[d].forEach(s => {
      const dur = MODS[s.m].dur; let st;
      if (cur === null) { const lo = tm(a.de), hi = Math.max(lo, tm(a.ate) - dur); st = Math.min(Math.max(tm(MODS[s.m].pref), lo), hi); } else st = cur + 10;
      s.t = ft(st); s.e = ft(st + dur); cur = st + dur;
    });
  }
  return plan;
}
const sugKg = (id, ph) => {
  const x = EX[id]; if (x[2] !== 'w') return '';
  const st = x[6] || 2.5; let kg = (S.prog[id] || {}).kg || 0;
  if (!kg) { const r = START[id], bw = num(S.p.peso); if (!r || !bw) return ''; kg = Math.max(st, rnd(bw * r * [1, 1.35, 1.7][Math.max(0, LV.indexOf(S.p.nivel))] * (S.p.volta ? .8 : 1) * .85, st)); }
  return ph.deload ? rnd(kg * .9, st) : kg;
};
const shift = id => (S.prog[id] || {}).sh || 0;
function metaText(e) {
  const x = EX[e.id], u = x[2] === 't' ? 's' : 'reps', sh = x[2] === 'w' ? 0 : shift(e.id), lo = e.lo + sh, hi = e.hi + sh, kg = sugKg(e.id, phase());
  if (x[2] === 'w') return kg ? ((S.prog[e.id] || {}).kg ? `Carga indicada: ${kg} kg × ${lo}–${hi} ${u}` : `Estimativa inicial: ${kg} kg × ${lo}–${hi} ${u} · ajuste: devem sobrar 3–4 reps`) : `1ª vez: carga leve, sobrando 3–4 reps · ${lo}–${hi} ${u} (informe seu peso no Perfil para estimar)`;
  return `Meta: ${lo}–${hi} ${u}${sh ? ' (nível subiu!)' : ''}`;
}
function updProg(e) {
  const x = EX[e.id], done = e.sets.filter(s => s.done && num(s.reps) > 0);
  if (!done.length || phase().deload) return;
  const pr = S.prog[e.id] || { kg: 0, sh: 0 };
  if (x[2] === 'w') {
    const top = Math.max(...done.map(s => num(s.kg))), st = x[6] || 2.5, atTop = done.filter(s => num(s.kg) === top);
    const hit = atTop.length >= e.n && atTop.every(s => num(s.reps) >= e.hi);
    const avg = atTop.reduce((a, s) => a + num(s.reps), 0) / atTop.length;
    pr.kg = top ? (hit ? top + st : avg < e.lo - 2 ? Math.max(st, rnd(top * .9, st)) : top) : 0;
  } else if (done.length >= e.n && done.every(s => num(s.reps) >= e.hi + pr.sh)) pr.sh += x[2] === 't' ? 5 : 2;
  S.prog[e.id] = pr;
}
const e1 = (kg, r) => kg * (1 + r / 30);
function bestOf(id, logs) { let b = 0; logs.forEach(l => (l.ex || []).forEach(x => { if (x.id === id) x.s.forEach(([k, r]) => { b = Math.max(b, e1(k, r)); }); })); return b; }
const planned = () => Object.values(S.plan || {}).reduce((a, l) => a + l.length, 0);
function weekDone(off = 0) { const a = addD(wkStart(today()), -7 * off), b = addD(a, 7); return S.logs.filter(l => l.d >= a && l.d < b).length; }
function streak() {
  const need = Math.max(1, Math.ceil(planned() * .7)); let w = weekDone(0) >= need ? 0 : 1, n = 0;
  while (w < 60 && weekDone(w) >= need) { n++; w++; } return n;
}

/* ---------- UI helpers ---------- */
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2600); }
function beep(f = 880, d = .15) {
  try { beep.c = beep.c || new (window.AudioContext || window.webkitAudioContext)(); const c = beep.c, o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.value = .15; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch { }
  try { navigator.vibrate && navigator.vibrate(120); } catch { }
}
const chips = (arr, sel, act) => arr.map(([v, l]) => `<span class="chip ${sel(v) ? 'on' : ''}" data-a="${act}" data-v="${v}">${l}</span>`).join(' ');
const mmss = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;
function bars(v, lab) {
  const m = Math.max(...v, 1), bw = 300 / v.length;
  return `<svg viewBox="0 0 300 130" width="100%"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c6ff3d"/><stop offset="1" stop-color="#19e3b1"/></linearGradient></defs>${v.map((x, i) => { const h = x / m * 88; return `<rect x="${i * bw + 7}" y="${100 - h}" width="${bw - 14}" height="${Math.max(h, 2)}" rx="5" fill="${x ? 'url(#gb)' : '#262d3d'}"/><text x="${i * bw + bw / 2}" y="122" text-anchor="middle">${lab[i]}</text>${x ? `<text x="${i * bw + bw / 2}" y="${94 - h}" text-anchor="middle" style="fill:#eef1f7">${x}</text>` : ''}`; }).join('')}</svg>`;
}
function line(pts, unit, p2) {
  if (pts.length < 2) return '<p class="mu sm">Registre ao menos 2 treinos para ver a evolução.</p>';
  const all = pts.map(p => p[1]).concat(p2 ? p2.map(p => p[1]) : []), mn = Math.min(...all), mx = Math.max(...all), rg = mx - mn || 1;
  const xy = a => a.map((p, i) => [10 + i / (a.length - 1) * 280, 90 - (p[1] - mn) / rg * 70]);
  const c = xy(pts), c2 = p2 ? xy(p2) : null;
  return `<svg viewBox="0 0 300 120" width="100%">${c2 ? `<polyline fill="none" stroke="#ffb800" stroke-width="2" stroke-dasharray="5 4" points="${c2.map(p => p.join(',')).join(' ')}"/>` : ''}<polyline fill="none" stroke="#c6ff3d" stroke-width="3" stroke-linejoin="round" points="${c.map(p => p.join(',')).join(' ')}"/>${c.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#19e3b1"/>`).join('')}<text x="10" y="112">${mn}${unit}</text><text x="290" y="112" text-anchor="end">${mx}${unit}</text></svg>${c2 ? '<p class="mu sm" style="margin:4px 0 0"><span style="color:#c6ff3d">━</span> feita &nbsp; <span style="color:#ffb800">╍</span> indicada</p>' : ''}`;
}

/* ---------- telas ---------- */
function vHoje() {
  const p = S.p, t = today(), dow = new Date().getDay(), tl = S.plan[dow] || [], ph = phase(), pl = planned(), wd = weekDone(), pct = pl ? Math.min(100, Math.round(wd / pl * 100)) : 0;
  const fl = ['🌱 Semana ' + ph.w + ': adaptação (volume reduzido)', ph.deload ? '😌 Semana leve (deload): recupere' : '', ''].filter(Boolean);
  return `<p class="mu">${DL[dow]}, ${parse(t).getDate()}/${parse(t).getMonth() + 1}</p>
<h1>${p.nome ? `Fala, <span class="grad">${esc(p.nome)}</span>` : 'Bora treinar'} 👊</h1>
<p class="mu">${QUOTES[(parse(t).getDate() + parse(t).getMonth()) % QUOTES.length]}</p>
<div class="card hero row" style="margin-top:14px"><div class="ring" style="--p:${pct}"><i>${wd}/${pl}</i></div><div class="grow"><h3>Sua semana</h3><p class="mu sm">${wd >= pl && pl ? 'Meta cumprida! 🔥' : `Faltam ${Math.max(0, pl - wd)} sessões`} · ${streak()} sem. seguidas</p>${ph.adapt ? '<span class="tag ac">🌱 adaptação · semana ' + ph.w + '</span>' : ph.deload ? '<span class="tag warn">semana leve</span>' : `<span class="tag">semana ${ph.w}</span>`}</div></div>
<h2>Hoje</h2>${tl.length ? tl.map(s => {
    const se = sessionFor(s.m, s.i), dn = S.logs.some(l => l.d === t && l.m === s.m);
    return `<div class="card"><div class="row sp"><div><span class="tag ${dn ? 'ac' : ''}">${MODS[s.m].e} ${MODS[s.m].n}${dn ? ' · feito ✓' : ''}</span><h3 style="margin-top:8px">${esc(se.name)}</h3><p class="mu sm">Sugestão: ${s.t}–${s.e}${se.ex ? ' · ' + se.ex.length + ' exercícios' : ''}</p></div></div><button class="btn" style="margin-top:10px" data-a="start" data-m="${s.m}" data-i="${s.i}">${dn ? 'Treinar de novo' : 'Iniciar treino'}</button></div>`;
  }).join('') : `<div class="card"><h3>Dia de descanso 😴</h3><p class="mu">Músculos crescem na recuperação. Durma bem, hidrate-se e caminhe um pouco.</p></div>`}
<h2>Treinar outra coisa</h2><div class="row wrap">${Object.keys(MODS).map(m => `<span class="chip" data-a="start" data-m="${m}" data-i="${nextIdx(m)}">${MODS[m].e} ${MODS[m].n}</span>`).join('')}</div>`;
}
function vPlano() {
  const dow = new Date().getDay();
  return `<h1>Seu <span class="grad">plano</span></h1><p class="mu">Distribuído para dar recuperação entre sessões pesadas, dentro dos seus horários.<br>Frequência automática: ${Object.keys(MODS).filter(m => S.p.freq[m]).map(m => MODS[m].e + ' ' + S.p.freq[m] + '×').join(' · ')}</p>
<div class="card" style="margin-top:12px">${WEEK.map(d => { const l = S.plan[d] || []; return `<div class="day ${d === dow ? 'today' : ''}"><div class="d">${DN[d]}</div><div class="grow">${l.length ? l.map(s => { const se = sessionFor(s.m, s.i); return `<details><summary><b>${MODS[s.m].e} ${esc(se.name)}</b> <span class="mu sm">· ${s.t}–${s.e}</span></summary><div class="mu sm" style="margin:6px 0 4px">${se.ex ? se.ex.map(e => `• ${EX[e.id][0]} — ${e.n}× ${e.lo}–${e.hi}${EX[e.id][2] === 't' ? 's' : ''}`).join('<br>') : se.kind === 'hiit' ? `${se.v} voltas · ${se.w}s forte / ${se.r}s descanso<br>${se.mv.join(', ')}` : se.notes.map(n => '• ' + esc(n)).join('<br>')}</div></details>`; }).join('') : '<span class="mu">Descanso</span>'}</div></div>`; }).join('')}</div>
<div class="card"><h3>💡 Por que esses horários?</h3><p class="mu sm" style="margin-top:6px">Força e potência tendem a render um pouco mais no fim da tarde, então sessões pesadas ficam o mais próximo possível disso na sua janela. Corrida/natação/cardio ficam cedo se sua janela permitir. Evite terminar treino intenso depois das 21h (sono). Se houver 2 sessões no mesmo dia, faça musculação antes do cardio.</p></div>
<button class="btn ghost" data-a="tab" data-v="perfil">Ajustar rotina e modalidades</button>`;
}
function vProg() {
  const L = S.logs, ws = wkStart(today()), vol = L.filter(l => l.d >= ws).reduce((a, l) => a + (l.vol || 0), 0);
  const wk = [], lb = []; for (let i = 7; i >= 0; i--) { wk.push(weekDone(i)); lb.push(i ? '-' + i : 'atual'); }
  const ids = [...new Set(L.flatMap(l => (l.ex || []).filter(x => EX[x.id] && EX[x.id][2] === 'w').map(x => x.id)))];
  if (!ids.includes(ui.ex)) ui.ex = ids[0] || '';
  const ll = ui.ex ? L.filter(l => (l.ex || []).some(x => x.id === ui.ex)) : [], pts = ll.map(l => [l.d, Math.max(...l.ex.find(x => x.id === ui.ex).s.map(s => s[0]))]), pts2 = ll.map(l => { const ik = Math.max(...l.ex.find(x => x.id === ui.ex).s.map(s => s[2] || 0)); return [l.d, ik || Math.max(...l.ex.find(x => x.id === ui.ex).s.map(s => s[0]))]; });
  const recs = ids.map(id => [id, bestOf(id, L)]).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return `<h1><span class="grad">Progresso</span></h1>
<div class="row" style="margin:14px 0"><div class="stat"><b>${L.length}</b><span>sessões</span></div><div class="stat"><b>${weekDone()}</b><span>na semana</span></div><div class="stat"><b>${Math.round(vol / 100) / 10}t</b><span>volume sem.</span></div></div>
<div class="card"><h3>Sessões por semana</h3>${bars(wk, lb)}</div>
<div class="card"><h3>Carga por exercício</h3>${ids.length ? `<select data-a="exsel" style="margin:10px 0">${ids.map(i => `<option value="${i}" ${i === ui.ex ? 'selected' : ''}>${EX[i][0]}</option>`).join('')}</select>${line(pts, 'kg', pts2)}` : '<p class="mu sm">Finalize um treino de musculação para ver sua evolução de carga.</p>'}</div>
${recs.length ? `<div class="card"><h3>🏆 Recordes (1RM estimado)</h3>${recs.map(([i, v]) => `<div class="row sp" style="padding:8px 0;border-top:1px solid var(--line)"><span>${EX[i][0]}</span><b>${Math.round(v * 2) / 2} kg</b></div>`).join('')}</div>` : ''}
<div class="card"><h3>⚖️ Peso corporal</h3><div class="row" style="margin:10px 0"><input id="bwi" inputmode="decimal" placeholder="kg"><button class="btn sm" data-a="bwadd">Salvar</button></div>${line(S.bw.slice(-20).map(b => [b.d, b.kg]), 'kg')}</div>
<h2>Histórico</h2>${L.slice(-15).reverse().map(l => `<div class="card row sp"><div><b>${MODS[l.m] ? MODS[l.m].e : ''} ${esc(l.name)}</b><p class="mu sm" style="margin:0">${l.d.split('-').reverse().slice(0, 2).join('/')} · ${l.dur} min${l.vol ? ' · ' + l.vol + ' kg vol' : ''}${l.x && l.x.a ? ' · ' + esc(l.x.a) : ''} · RPE ${l.rpe}</p></div><span class="chip" data-a="dellog" data-v="${l.id}">🗑</span></div>`).join('') || '<p class="mu">Nenhum treino ainda.</p>'}`;
}
function vCoach() {
  const p = S.p, ph = phase(), L = S.logs, last = L[L.length - 1], since = last ? diffD(today(), last.d) : null, t = [];
  const r3 = L.slice(-3).map(l => l.rpe).filter(Boolean), avg = r3.length ? r3.reduce((a, b) => a + b, 0) / r3.length : 0, pl = planned();
  if (ph.adapt) t.push(['🌱', 'Fase de adaptação', 'Nas semanas 1–2 o app reduz as séries. Pare sempre com 3–4 repetições sobrando. O objetivo agora é criar hábito e aprender os movimentos; dor muscular leve é normal.']);
  if (ph.deload) t.push(['😌', 'Semana leve', 'Esta é uma semana de recuperação: menos séries, cargas ~10% menores. Não pule — é ela que sustenta a progressão.']);
  if (since === null) t.push(['🚀', 'Comece pela primeira sessão', 'Vá na aba Hoje e inicie. A primeira sessão serve para descobrir suas cargas iniciais: escolha pesos leves.']);
  else if (since >= 7) t.push(['⏰', `Há ${since} dias sem treinar`, 'Retome com uma sessão leve (cargas ~20% menores). Consistência vence intensidade.']);
  if (avg >= 9) t.push(['🛑', 'Esforço muito alto', `Seu RPE médio recente é ${avg.toFixed(1)}. Se estiver cansado ou dormindo mal, reduza uma série por exercício ou adicione um dia de descanso.`]);
  else if (avg && avg <= 6) t.push(['📈', 'Dá para apertar mais', `RPE médio ${avg.toFixed(1)}: suas sessões estão leves. Busque mais carga, terminando com 1–2 repetições sobrando.`]);
  if (pl) t.push(['🎯', 'Meta da semana', `${weekDone()}/${pl} sessões feitas. ${weekDone() >= pl ? 'Missão cumprida!' : 'Se faltar tempo, faça uma versão curta (só os 3 primeiros exercícios) em vez de pular.'}`]);
  if (num(p.peso)) { const k = num(p.peso); t.push(['🍗', 'Alimentação e água', `Proteína: ~${Math.round(k * 1.6)}–${Math.round(k * 2.2)} g/dia (1,6–2,2 g/kg). Água: ~${(k * .035).toFixed(1)} L/dia. Sono: 7–9 h.`]); }
  else t.push(['🍗', 'Alimentação e sono', 'Informe seu peso no Perfil para calcular proteína e água. Regra geral: 1,6–2,2 g de proteína/kg e 7–9 h de sono.']);
  const o = p.objs || [];
  if (o.includes('emagrecer')) t.push(['🔥', 'Perder gordura', 'Déficit calórico moderado (~300–500 kcal), proteína alta e 7–10 mil passos por dia. A musculação preserva o músculo enquanto você emagrece.']);
  if (o.includes('hipertrofia')) t.push(['💪', 'Ganhar massa', 'Treine perto da falha (1–3 reps sobrando), 10–20 séries por grupo na semana, superávit leve (~200–300 kcal) e sono em dia.']);
  if (o.includes('forca')) t.push(['🏋️', 'Ficar mais forte', 'Faixas mais baixas de repetição nos compostos e descanso maior. Registre todas as cargas: o que não é medido não progride.']);
  if (p.freq.hiit && p.freq.forca) t.push(['⚡', 'HIIT + pernas', 'Evite HIIT no dia anterior ao treino de pernas, e separe sessões pesadas por pelo menos 48 h para o mesmo grupo muscular.']);
  if (p.freq.nat) t.push(['🏊', 'Natação', 'Foque na técnica antes do volume: respiração bilateral e braçada longa. Natação é ótima para dias de recuperação ativa.']);
  if (p.freq.corr) t.push(['🏃', 'Corrida', 'Aumente o volume semanal em no máximo ~10%. Tênis adequado e ritmo de conversa na maioria dos treinos.']);
  if (p.flags.length) t.push(['🩹', 'Cuidados com ' + p.flags.join(', '), 'O app já trocou exercícios de maior risco para essas áreas. Pare se houver dor aguda e procure um profissional.']);
  t.push(['🩺', 'Antes de começar', 'Voltando após uma pausa ou com algum problema de saúde? Faça uma avaliação médica/fisioterápica. Este app orienta, mas não substitui um profissional.']);
  return `<h1>Seu <span class="grad">coach</span></h1><p class="mu">Conselhos baseados nos seus dados, gerados no próprio aparelho.</p><div style="margin-top:14px">${t.map(x => `<div class="card tip"><div class="e">${x[0]}</div><div><h3>${x[1]}</h3><p class="mu sm" style="margin:4px 0 0">${x[2]}</p></div></div>`).join('')}</div>
<h2>Dúvidas comuns</h2><div class="card faq" style="padding-top:4px">${FAQ.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</div>`;
}
function vPerfil() {
  const first = !S.p, mods = Object.keys(MODS).map(m => [m, MODS[m].e + ' ' + MODS[m].n]);
  return `<h1>${first ? 'Vamos montar <span class="grad">seu plano</span>' : '<span class="grad">Perfil</span> e rotina'}</h1><p class="mu">${first ? 'Responda em 1 minuto. Dá para mudar tudo depois.' : 'Ao salvar, o plano é refeito.'}</p>
<div class="card" style="margin-top:12px"><h3>1 · Seus objetivos</h3><p class="mu sm">Escolha quantos quiser.</p><div class="row wrap">${chips(OBJS, v => D.objs.includes(v), 'obj')}</div>
<label class="f">Nível atual</label><select data-f="nivel">${[['iniciante', 'Iniciante / voltando'], ['intermediario', 'Intermediário'], ['avancado', 'Avançado']].map(([v, l]) => `<option value="${v}" ${D.nivel === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
<label class="row f" style="color:var(--tx)"><input type="checkbox" data-f="volta" ${D.volta ? 'checked' : ''}> Estou voltando a treinar depois de uma pausa (2 semanas de adaptação)</label></div>
<div class="card"><h3>2 · O que você quer fazer?</h3><p class="mu sm">Escolha as modalidades. O app decide quantas vezes por semana, conforme seus dias livres e objetivos.</p><div class="row wrap">${chips(mods, v => D.mods.includes(v), 'mod')}</div></div>
<div class="card"><h3>3 · Descreva seu dia</h3><p class="mu sm">Ex.: "Trabalho de segunda a sexta das 8 às 18. Sábado fico livre de manhã."</p><textarea data-f="rotina" placeholder="Conte sua rotina, horários e quando consegue treinar...">${esc(D.rotina)}</textarea><button class="btn ghost" style="margin-top:8px" data-a="parse">✨ Interpretar minha rotina</button>
<p class="mu sm" style="margin:14px 0 4px">Janelas livres (ajuste se precisar):</p>${WEEK.map(d => `<div class="row sp wrap" style="padding:6px 0"><span class="chip ${D.av[d].on ? 'on' : ''}" data-a="avt" data-d="${d}" style="min-width:64px;text-align:center">${DN[d]}</span>${D.av[d].on ? `<div class="row grow" style="min-width:200px"><input type="time" data-av="de" data-d="${d}" value="${D.av[d].de}"><span class="mu">até</span><input type="time" data-av="ate" data-d="${d}" value="${D.av[d].ate}"></div>` : '<span class="mu sm">indisponível</span>'}</div>`).join('')}</div>
<div class="card"><h3>4 · Lesões e limitações 🩹</h3><p class="mu sm">Marque o que dói ou já machucou. O app troca exercícios de risco e deixa o HIIT/corrida de baixo impacto.</p><div class="row wrap">${chips(FLAGS, v => D.flags.includes(v), 'flag')}</div>
<label class="f">Detalhes (cirurgia, diagnóstico, o que piora a dor...)</label><textarea data-f="notas" placeholder="Ex.: joelho direito dói ao descer escada; hérnia de disco L5...">${esc(D.notas)}</textarea><p class="mu sm">Durante o treino, o botão "🩹 Trocar" em cada exercício substitui o movimento na hora.</p></div>
<div class="card"><h3>5 · Seus dados</h3><label class="f">Nome</label><input data-f="nome" value="${esc(D.nome)}" placeholder="Como te chamo?">
<label class="f">Peso (kg) — usado para estimar as cargas iniciais</label><input data-f="peso" inputmode="decimal" value="${esc(D.peso)}" placeholder="ex: 75">
<label class="f">Descanso padrão entre séries</label><select data-f="desc">${[60, 90, 120, 150].map(v => `<option value="${v}" ${+D.desc === v ? 'selected' : ''}>${v} s</option>`).join('')}</select></div>
<button class="btn" data-a="saveP">${first ? 'Gerar meu plano 🚀' : 'Salvar e refazer plano'}</button>
${first ? '' : `<h2>Dados</h2><div class="row wrap"><button class="btn ghost sm" data-a="exp">Exportar backup</button><label class="btn ghost sm" style="margin:0">Importar<input type="file" accept="application/json" id="imp" hidden></label><button class="btn bad sm" data-a="reset">Apagar tudo</button></div><p class="mu sm" style="margin-top:10px">Seus dados ficam só neste aparelho. Exporte backups de vez em quando.</p>`}`;
}
function autoFreq(p) {
  const days = WEEK.filter(d => p.av[d] && p.av[d].on).length || 3, mods = p.mods.length ? p.mods : ['forca'], o = p.objs || [];
  let T = Math.min(Math.max(days, 2), 6); if (p.volta) T = Math.min(T, 4); T = Math.max(T, mods.length);
  const w = { forca: 3, calis: 2, hiit: 1, corr: 2, nat: 2, cardio: 1 }, cap = { forca: 5, calis: 3, hiit: 2, corr: 3, nat: 3, cardio: 2 };
  if (o.includes('hipertrofia') || o.includes('forca')) { w.forca += 2; w.calis += 1; }
  if (o.includes('emagrecer')) { w.hiit += 1; w.cardio += 1; w.corr += 1; }
  if (o.includes('corrida')) w.corr += 2; if (o.includes('natacao')) w.nat += 2;
  const f = Object.fromEntries(Object.keys(MODS).map(m => [m, 0])); mods.forEach(m => f[m] = 1);
  for (let left = T - mods.length; left > 0; left--) {
    const c = mods.filter(m => f[m] < cap[m]).sort((a, b) => w[b] / (f[b] + 1) - w[a] / (f[a] + 1))[0]; if (!c) break; f[c]++;
  }
  return f;
}
function parseRoutine(tx, old) {
  const t = tx.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), K = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
  const hm = (h, m) => +h * 60 + (m ? +m : 0), R_ = '(\\d{1,2})(?:[:h](\\d{2}))?\\s*(?:h|horas?)?', info = {};
  const get = d => info[d] || (info[d] = {});
  t.split(/[.;\n!]+/).forEach(sn => {
    let ds = new Set();
    for (const m of sn.matchAll(/\b(dom|seg|ter|qua|qui|sex|sab)\w*\s+(?:a|ate)\s+(dom|seg|ter|qua|qui|sex|sab)\w*/g)) { let a = K[m[1]], b = K[m[2]]; for (let k = 0; k < 7; k++) { ds.add(a); if (a === b) break; a = (a + 1) % 7; } }
    for (const m of sn.matchAll(/\b(dom|seg|ter|qua|qui|sex|sab)\w*/g)) ds.add(K[m[1]]);
    if (/fim de semana|fins de semana/.test(sn)) { ds.add(6); ds.add(0); }
    if (/todos os dias|todo dia/.test(sn)) [0, 1, 2, 3, 4, 5, 6].forEach(d => ds.add(d));
    if (/dias uteis/.test(sn)) [1, 2, 3, 4, 5].forEach(d => ds.add(d));
    const exp = ds.size > 0; if (!exp) [1, 2, 3, 4, 5].forEach(d => ds.add(d));
    const rg = sn.match(new RegExp('d?as?\\s+' + R_ + '\\s*(?:as|a|ate|-)\\s*' + R_)), out = sn.match(new RegExp('(?:saio|termino|largo|volto)[^\\d]*' + R_));
    const busy = /trabalh|aula|faculdade|escola|estag|servico|expediente|plantao/.test(sn), free = /livre|disponivel|posso|consigo|treino|treinar/.test(sn) && !busy;
    ds.forEach(d => {
      const x = get(d); if (exp) x.exp = 1;
      if (/nao (treino|posso|consigo|tenho)|folga|sem treino|descanso/.test(sn)) { x.off = 1; return; }
      if (rg && busy) x.busy = [hm(rg[1], rg[2]), hm(rg[3], rg[4])]; else if (rg && free) x.free = [hm(rg[1], rg[2]), hm(rg[3], rg[4])];
      if (out && !rg) x.busy = [x.busy ? x.busy[0] : 8 * 60, hm(out[1], out[2])];
      if (/manha|cedo/.test(sn)) x.pref = 'm'; else if (/tarde/.test(sn)) x.pref = 't'; else if (/noite/.test(sn)) x.pref = 'n';
    });
  });
  const av = {}; let n = 0, ex = '';
  for (let d = 0; d < 7; d++) {
    const x = info[d], wk = d >= 1 && d <= 5; let w = null;
    if (x && x.off) w = null;
    else if (x && x.free) w = x.free;
    else if (x && (x.busy || x.pref)) {
      const ev = x.busy ? [x.busy[1] + 30, 21 * 60 + 30] : [18 * 60 + 30, 21 * 60 + 30], mo = x.busy ? [6 * 60, x.busy[0] - 60] : [6 * 60, 10 * 60];
      if (x.pref === 'm' && mo[1] - mo[0] >= 60) w = mo; else if (x.pref === 't') w = x.busy ? (ev[1] - ev[0] >= 60 ? ev : mo) : [13 * 60, 18 * 60];
      else if (ev[1] - ev[0] >= 60) w = ev; else if (mo[1] - mo[0] >= 60) w = mo; else w = [19 * 60, 21 * 60];
    } else if (wk || (x && x.exp)) w = [18 * 60, 21 * 60];
    av[d] = w ? { on: true, de: ft(w[0]), ate: ft(w[1]) } : { on: false, de: old[d].de, ate: old[d].ate };
    if (w) { n++; ex = ex || `${DN[d]} ${ft(w[0])}–${ft(w[1])}`; }
  }
  return { av, n, ex };
}
const V = { hoje: vHoje, plano: vPlano, prog: vProg, coach: vCoach, perfil: vPerfil };
function render() {
  if (!S.p) ui.tab = 'perfil';
  $('#app').innerHTML = V[ui.tab]();
  $('#nav').innerHTML = S.p ? [['hoje', '🏠', 'Hoje'], ['plano', '📅', 'Plano'], ['prog', '📈', 'Progresso'], ['coach', '🧠', 'Coach'], ['perfil', '⚙️', 'Perfil']].map(([k, e, l]) => `<button class="${ui.tab === k ? 'on' : ''}" data-a="tab" data-v="${k}"><b>${e}</b>${l}</button>`).join('') : '';
  $('#nav').hidden = !S.p;
}
const go = t => { ui.tab = t; render(); scrollTo(0, 0); };

/* ---------- treino em andamento ---------- */
function startW(m, i) {
  const s = sessionFor(m, i), ph = phase();
  W = { s, m, t0: Date.now(), rpe: 7, x: ['', ''], done: null };
  if (s.kind === 'lift') W.exs = s.ex.map(e => ({ ...e, sets: Array.from({ length: e.n }, () => { const k = sugKg(e.id, ph); return { kg: k, ik: k, reps: '', done: false }; }) }));
  if (s.kind === 'hiit') {
    const q = [{ n: 'Prepare-se', d: 10, w: 0 }];
    for (let k = 0; k < s.v; k++) { q.push({ n: s.mv[k % s.mv.length], d: s.w, w: 1 }); if (k < s.v - 1) q.push({ n: 'Descanso', d: s.r, w: 0 }); }
    H = { q, i: 0, run: false, left: q[0].d, end: 0 };
  }
  openW();
  clearInterval(tick); tick = setInterval(onTick, 250);
}
function openW() { const o = $('#ov'); o.hidden = false; o.innerHTML = vW(); document.body.style.overflow = 'hidden'; }
function closeW() { clearInterval(tick); tick = null; W = null; H = null; stopRest(); $('#ov').hidden = true; document.body.style.overflow = ''; }
function vW() {
  const s = W.s;
  if (W.done) {
    const d = W.done;
    return `<div class="in"><div class="top"><b>Treino concluído</b></div><div class="card hero" style="text-align:center"><div style="font-size:54px">🎉</div><h1 class="grad">Mandou bem!</h1><p class="mu">${esc(s.name)}</p><div class="row" style="margin-top:12px"><div class="stat"><b>${d.dur}</b><span>min</span></div>${d.vol ? `<div class="stat"><b>${d.vol}</b><span>kg volume</span></div>` : ''}<div class="stat"><b>${d.rpe}</b><span>RPE</span></div></div></div>${d.sum.length ? `<div class="card"><h3>Carga indicada × feita</h3>${d.sum.map(x => `<p style="margin:8px 0">${x}</p>`).join('')}</div>` : ''}${d.prs.length ? `<div class="card"><h3>🔥 Novos recordes</h3><p class="mu">${d.prs.map(esc).join(', ')}</p></div>` : ''}<button class="btn" data-a="close">Voltar ao início</button></div>`;
  }
  let body = '';
  if (s.kind === 'lift') body = W.exs.map((e, ei) => {
    const x = EX[e.id], t = x[2];
    return `<div class="card ex"><div class="row sp"><h3>${x[0]}</h3><span class="chip" data-a="swap" data-e="${ei}" style="padding:4px 10px;font-size:12px">🩹 Trocar</span></div><p class="cue">${x[5]}</p><p class="meta">${metaText(e)}</p><div class="sets"><span class="h">Série</span><span class="h">${t === 'w' ? 'kg' : ''}</span><span class="h">${t === 't' ? 'seg' : 'reps'}</span><span></span>${e.sets.map((st, si) => `<span class="n">${si + 1}</span>${t === 'w' ? `<input inputmode="decimal" data-w="kg" data-e="${ei}" data-s="${si}" value="${st.kg}" placeholder="kg">` : '<span class="n">—</span>'}<input inputmode="numeric" data-w="reps" data-e="${ei}" data-s="${si}" value="${st.reps}" placeholder="${e.lo + (t === 'w' ? 0 : shift(e.id))}–${e.hi + (t === 'w' ? 0 : shift(e.id))}"><button class="ck ${st.done ? 'on' : ''}" data-a="chk" data-e="${ei}" data-s="${si}">✓</button>`).join('')}</div></div>`;
  }).join('');
  else if (s.kind === 'hiit') {
    body = `<div class="card" style="text-align:center"><p class="mu" id="hr">${s.v} voltas · ${s.w}s forte / ${s.r}s descanso</p><h2 id="hn" style="font-size:30px;margin:6px 0">Pronto?</h2><div class="big" id="ht">${H.left}</div><div class="bar" style="margin:16px 0"><i id="hb" style="width:0"></i></div><button class="btn" id="hbtn" data-a="hplay">▶ Começar</button></div><div class="card"><h3>Exercícios (em rodízio)</h3><p class="mu">${s.mv.join(' · ')}</p><p class="mu sm">Aqueça 5 min antes. Segure a técnica: se perder a forma, descanse.</p></div>`;
  } else body = `<div class="card"><h3>${MODS[s.m].e} ${esc(s.name)}</h3>${s.notes.map(n => `<p class="mu" style="margin-top:8px">• ${esc(n)}</p>`).join('')}</div><div class="card"><h3>Registro</h3><div class="row"><div class="grow"><label class="f">${s.f[0]}</label><input inputmode="decimal" data-x="0" value="${esc(W.x[0])}"></div><div class="grow"><label class="f">${s.f[1]}</label><input inputmode="decimal" data-x="1" value="${esc(W.x[1])}"></div></div></div>`;
  return `<div class="in"><div class="top"><span class="chip" data-a="cancel">✕ Sair</span><b>${esc(s.name)}</b><b id="el" class="grad">0:00</b></div>${body}<div class="card"><h3>Como foi o esforço?</h3><p class="mu sm">1 = muito leve · 10 = máximo</p><select data-a="rpe">${[5, 6, 7, 8, 9, 10].map(v => `<option ${W.rpe === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div><button class="btn" data-a="fin">Finalizar treino ✓</button></div>`;
}
function onTick() {
  if (!W) return;
  const el = $('#el'); if (el) el.textContent = mmss(Math.floor((Date.now() - W.t0) / 1000));
  if (R) { const l = Math.ceil((R.end - Date.now()) / 1000), r = $('#rt'); if (l <= 0) { beep(1040, .3); stopRest(); } else if (r) r.textContent = mmss(l); }
  if (H && H.run) {
    const l = Math.ceil((H.end - Date.now()) / 1000); H.left = Math.max(l, 0);
    if (l <= 3 && l > 0 && H.last !== l) { H.last = l; beep(660, .08); }
    if (l <= 0) { H.i++; H.last = 0; if (H.i >= H.q.length) { H.run = false; H.i = H.q.length - 1; H.left = 0; beep(1200, .5); const b = $('#hbtn'); if (b) b.textContent = '✔ Concluído'; toast('HIIT completo! 💪'); } else { H.end = Date.now() + H.q[H.i].d * 1000; H.left = H.q[H.i].d; beep(H.q[H.i].w ? 1000 : 600, .25); } }
    hui();
  }
}
function hui() {
  const q = H.q[H.i], n = $('#hn'); if (!n) return; n.textContent = q.n; n.style.color = q.w ? 'var(--ac)' : 'var(--mu)';
  $('#ht').textContent = H.left; $('#hb').style.width = (1 - H.left / q.d) * 100 + '%';
  const rd = H.q.slice(0, H.i + 1).filter(x => x.w).length; $('#hr').textContent = `Volta ${Math.min(rd, W.s.v)}/${W.s.v}`;
}
function startRest(sec) {
  stopRest(); R = { end: Date.now() + sec * 1000 };
  const d = document.createElement('div'); d.id = 'rest'; d.innerHTML = `<span>⏱</span><span class="t" id="rt">${mmss(sec)}</span><button class="btn ghost sm" data-a="r15">+15s</button><button class="btn sm" data-a="rskip">Pular</button>`; document.body.appendChild(d);
}
function stopRest() { R = null; const d = $('#rest'); if (d) d.remove(); }
function finish() {
  const s = W.s, dur = Math.max(1, Math.round((Date.now() - W.t0) / 60000)), e = { id: Date.now().toString(36), d: today(), m: s.m, name: s.name, dur, rpe: W.rpe, vol: 0 }, prs = [];
  if (s.kind === 'lift') {
    e.ex = [];
    W.exs.forEach(x => {
      const ds = x.sets.filter(t => t.done && num(t.reps) > 0); if (!ds.length) return;
      const isW = EX[x.id][2] === 'w'; e.ex.push({ id: x.id, s: ds.map(t => [isW ? num(t.kg) : 0, num(t.reps), isW ? num(t.ik) : 0]) });
      if (isW) { e.vol += ds.reduce((a, t) => a + num(t.kg) * num(t.reps), 0); const b = bestOf(x.id, S.logs), n = bestOf(x.id, [{ ex: [{ id: x.id, s: ds.map(t => [num(t.kg), num(t.reps)]) }] }]); if (b && n > b * 1.001) prs.push(EX[x.id][0]); }
      updProg(x);
    });
    e.vol = Math.round(e.vol);
    if (!e.ex.length && !confirm('Nenhuma série marcada. Salvar mesmo assim?')) return;
  } else if (s.kind === 'hiit') e.x = { a: `${H.q.slice(0, H.i + 1).filter(q => q.w).length} voltas` };
  else e.x = { a: [W.x[0] && W.x[0] + (s.m === 'nat' ? ' m' : ' km'), W.x[1] && W.x[1] + ' min'].filter(Boolean).join(' · ') };
  S.logs.push(e); save(); W.done = { dur, vol: e.vol, rpe: W.rpe, prs, sum: (e.ex || []).filter(x => EX[x.id][2] === 'w').map(x => `<b>${EX[x.id][0]}</b><br><span class="mu sm">indicada ${x.s[0][2] || '—'} kg → feito ${x.s.map(t => t[0] + '×' + t[1]).join(' · ')}</span>`) }; stopRest(); clearInterval(tick); $('#ov').innerHTML = vW(); $('#ov').scrollTop = 0; beep(1000, .25);
}

/* ---------- eventos ---------- */
const A = {
  tab: t => go(t.dataset.v),
  start: t => startW(t.dataset.m, +t.dataset.i),
  cancel: () => { if (confirm('Sair sem salvar este treino?')) closeW(); },
  close: () => { closeW(); go('hoje'); },
  chk: t => {
    const e = W.exs[+t.dataset.e], s = e.sets[+t.dataset.s]; s.done = !s.done;
    if (s.done && !num(s.reps)) s.reps = String(e.lo + (EX[e.id][2] === 'w' ? 0 : shift(e.id)));
    openW(); if (s.done) startRest(e.rest);
  },
  swap: t => {
    const i = +t.dataset.e, e = W.exs[i], used = new Set(W.exs.map(x => x.id)), x = EX[e.id];
    let alt = x[4] && resolve(x[4], S.p); if (!alt || used.has(alt)) alt = Object.keys(EX).find(k => !used.has(k) && EX[k][1] === x[1] && EX[k][2] === x[2] && !EX[k][3].some(r => S.p.flags.includes(r)));
    if (!alt) return toast('Sem alternativa para esse exercício');
    const ty = EX[alt][2], k = sugKg(alt, phase()), t0 = ty === 't' ? [30, 45] : [8, 12];
    W.exs[i] = { ...e, id: alt, lo: ty === x[2] ? e.lo : t0[0], hi: ty === x[2] ? e.hi : t0[1], sets: e.sets.map(() => ({ kg: k, ik: k, reps: '', done: false })) }; openW(); toast('Trocado por ' + EX[alt][0]);
  },
  r15: () => { if (R) R.end += 15000; }, rskip: stopRest,
  rpe: t => { W.rpe = +t.value; },
  hplay: t => {
    if (!H.run) { if (H.i >= H.q.length - 1 && H.left === 0) return; H.run = true; H.end = Date.now() + H.left * 1000; t.textContent = '⏸ Pausar'; beep(800, .1); } else { H.run = false; t.textContent = '▶ Continuar'; }
  },
  fin: finish,
  exsel: t => { ui.ex = t.value; render(); },
  bwadd: () => { const v = num($('#bwi').value); if (!v) return; S.bw.push({ d: today(), kg: v }); save(); render(); },
  dellog: t => { if (confirm('Apagar este treino do histórico?')) { S.logs = S.logs.filter(l => l.id !== t.dataset.v); save(); render(); } },
  obj: t => { const v = t.dataset.v, i = D.objs.indexOf(v); i < 0 ? D.objs.push(v) : D.objs.splice(i, 1); render(); },
  mod: t => { const v = t.dataset.v, i = D.mods.indexOf(v); i < 0 ? D.mods.push(v) : D.mods.splice(i, 1); render(); },
  parse: () => { if (!D.rotina.trim()) return toast('Descreva seu dia primeiro'); const r = parseRoutine(D.rotina, D.av); D.av = r.av; render(); toast(`Entendi: ${r.n} dias livres (ex.: ${r.ex}). Confira abaixo.`); },
  avt: t => { D.av[t.dataset.d].on = !D.av[t.dataset.d].on; render(); },
  flag: t => { const v = t.dataset.v, i = D.flags.indexOf(v); i < 0 ? D.flags.push(v) : D.flags.splice(i, 1); render(); },
  saveP: () => {
    if (!D.mods.length) return toast('Escolha ao menos uma modalidade');
    D.freq = autoFreq(D);
    if (!Object.values(D.av).some(v => v.on)) return toast('Marque ao menos um dia disponível');
    const first = !S.p; S.p = JSON.parse(JSON.stringify(D)); S.plan = planWeek(S.p); if (first) S.start = today(); save(); toast(first ? 'Plano pronto! 🚀' : 'Plano atualizado ✓'); go('hoje');
  },
  exp: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = `treino-backup-${today()}.json`; a.click(); },
  reset: () => { if (confirm('Apagar TODOS os dados deste aparelho?')) { localStorage.removeItem(KEY); location.reload(); } }
};
document.addEventListener('click', e => { const t = e.target.closest('[data-a]'); if (t && t.tagName !== 'SELECT' && A[t.dataset.a]) A[t.dataset.a](t, e); });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.tagName === 'SELECT' && t.dataset.a) A[t.dataset.a](t);
  if (t.id === 'imp' && t.files[0]) { t.files[0].text().then(x => { try { const j = JSON.parse(x); if (!j.logs) throw 0; S = Object.assign(fresh(), j); save(); location.reload(); } catch { toast('Arquivo inválido'); } }); }
  if (t.dataset.f === 'volta') D.volta = t.checked;
});
document.addEventListener('input', e => {
  const t = e.target, ds = t.dataset;
  if (ds.f && t.type !== 'checkbox') D[ds.f] = ds.f === 'desc' ? +t.value : t.value;
  if (ds.av) D.av[ds.d][ds.av] = t.value;
  if (ds.w) W.exs[+ds.e].sets[+ds.s][ds.w] = t.value;
  if (ds.x !== undefined) W.x[+ds.x] = t.value;
});
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('/sw.js').catch(() => { });
