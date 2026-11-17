// Campo 2D da partida ao vivo (ideia do Brasileirinho FC): os 22 jogadores e a bola se mexendo minuto a minuto.
// O campo é desenhado uma vez; a cada minuto só mudam as posições (com transição suave do CSS). A bola segue os lances do
// motor: chance e gol do seu time levam a bola para o ataque, do adversário para a sua defesa; nos outros minutos ela
// circula conforme a posse. Os blocos dos dois times andam juntos com a bola (sobem quando você ataca, descem quando defende).
import { RNG, clamp } from "../../src/rng";

export interface Ponto { x: number; y: number; num: string; fora?: boolean }
export interface QuadroCampo { meus: Ponto[]; deles: Ponto[]; bola: { x: number; y: number }; gol?: "meu" | "deles" }
const W = 100, H = 140;
/** Formação do adversário (4-4-2 em coordenadas de 0 a 100, o gol dele em cima). */
const ADV: [number, number][] = [[50, 92], [12, 70], [37, 76], [63, 76], [88, 70], [12, 46], [38, 52], [62, 52], [88, 46], [40, 20], [60, 20]];

export function svgCampo(corMeu: [string, string], corAdv: [string, string]): string {
  const linhas = `<rect x="0" y="0" width="${W}" height="${H}" fill="#2f7d3a"/>${Array.from({ length: 7 }, (_, i) => `<rect x="0" y="${i * 20}" width="${W}" height="10" fill="#2a7334"/>`).join("")}
    <g fill="none" stroke="rgba(255,255,255,.75)" stroke-width=".5"><rect x="3" y="3" width="${W - 6}" height="${H - 6}"/><line x1="3" y1="${H / 2}" x2="${W - 3}" y2="${H / 2}"/><circle cx="50" cy="${H / 2}" r="9"/>
    <rect x="22" y="3" width="56" height="17"/><rect x="36" y="3" width="28" height="6"/><rect x="22" y="${H - 20}" width="56" height="17"/><rect x="36" y="${H - 9}" width="28" height="6"/>
    <path d="M40 20 A9 9 0 0 0 60 20"/><path d="M40 ${H - 20} A9 9 0 0 1 60 ${H - 20}"/></g>
    <rect x="44" y="0.6" width="12" height="2.4" fill="#fff" opacity=".85"/><rect x="44" y="${H - 3}" width="12" height="2.4" fill="#fff" opacity=".85"/>`;
  const jog = (lado: "m" | "a", i: number, c: [string, string]) => `<g class="c2-j c2-${lado}" id="c2${lado}${i}"><circle r="3.7" fill="${c[0]}" stroke="${c[1]}" stroke-width=".8"/><text y="1.25" text-anchor="middle" font-size="3.5" font-weight="700" fill="${c[1]}" transform="rotate(-90)"></text></g>`;
  // desenhado em pé (seu gol embaixo) e girado: no celular o campo deitado ocupa menos altura (você ataca para a direita)
  return `<svg class="campo2d" viewBox="0 0 ${H} ${W}" preserveAspectRatio="xMidYMid meet" aria-label="Campo da partida"><g transform="translate(${H} 0) rotate(90)">${linhas}
    ${Array.from({ length: 11 }, (_, i) => jog("a", i, corAdv)).join("")}${Array.from({ length: 11 }, (_, i) => jog("m", i, corMeu)).join("")}
    <g id="c2bola" class="c2-j"><circle r="1.5" fill="#fff" stroke="#111" stroke-width=".4"/></g>
    </g><text id="c2gol" x="${H / 2}" y="${W / 2 + 6}" text-anchor="middle" font-size="18" font-weight="900" fill="#ffd54a" stroke="#000" stroke-width=".6" opacity="0">GOL!</text></svg>`;
}
/** Onde está cada um no minuto `m` (sempre igual para o mesmo jogo e minuto). */
export function quadro(semente: string, m: number, minhas: { x: number; y: number; num: string; fora?: boolean }[], numAdv: string[], posse: number, lance?: { meu: boolean; gol: boolean }): QuadroCampo {
  const r = new RNG(`${semente}|c2|${m}`);
  // t > 0: meu time atacando (bola no campo deles, em cima); t < 0: eles atacando
  let t: number, gol: QuadroCampo["gol"];
  if (lance) { t = lance.meu ? r.range(0.75, 0.95) : -r.range(0.75, 0.95); if (lance.gol) gol = lance.meu ? "meu" : "deles"; }
  else { const meu = r.next() < posse / 100; t = (meu ? 1 : -1) * r.range(0.05, 0.6); }
  const bx = clamp(50 + r.normal(0, 22), 8, 92), by = gol === "meu" ? 2.5 : gol === "deles" ? H - 2.5 : clamp(H / 2 - t * 52 + r.normal(0, 4), 8, H - 8);
  const desloc = -t * 24, puxaX = (bx - 50) * 0.22;
  const yMeu = (y: number) => H / 2 + (y - 50) / 100 * H * 0.86;
  const meus = minhas.map((p, i) => ({ ...p, x: clamp(p.x + puxaX + r.normal(0, 2.2), 4, W - 4), y: clamp(yMeu(p.y) + desloc * (i === 0 ? 0.25 : 1) + r.normal(0, 2), 5, H - 5) }));
  const deles = ADV.map(([x, y], i) => ({ x: clamp(100 - x + puxaX + r.normal(0, 2.2), 4, W - 4), y: clamp(H - yMeu(y) + desloc * (i === 0 ? 0.25 : 1) + r.normal(0, 2), 5, H - 5), num: numAdv[i] ?? String(i + 1) }));
  // quem está mais perto da bola vai nela
  const perto = (l: { x: number; y: number }[]) => l.reduce((b, p, i) => (Math.hypot(p.x - bx, p.y - by) < Math.hypot(l[b].x - bx, l[b].y - by) ? i : b), 1);
  if (!gol) { const lista = t > 0 ? meus : deles, k = perto(lista); lista[k] = { ...lista[k], x: bx + 1.8, y: by + (t > 0 ? 2.5 : -2.5) }; }
  return { meus, deles, bola: { x: bx, y: by }, gol };
}
/** Põe os números e move tudo (duração da transição = um minuto da tela). */
export function moverCampo(el: HTMLElement, q: QuadroCampo, ms: number) {
  const pos = (id: string, x: number, y: number, vis = true) => { const g = el.querySelector<SVGGElement>(`#${id}`); if (!g) return; g.style.transition = `transform ${Math.max(80, ms)}ms linear, opacity .3s`; g.style.transform = `translate(${x}px, ${y}px)`; g.style.opacity = vis ? "1" : "0"; };
  q.meus.forEach((p, i) => { pos(`c2m${i}`, p.x, p.y, !p.fora); const t = el.querySelector(`#c2m${i} text`); if (t && t.textContent !== p.num) t.textContent = p.num; });
  for (let i = q.meus.length; i < 11; i++) pos(`c2m${i}`, 50, 70, false);
  q.deles.forEach((p, i) => { pos(`c2a${i}`, p.x, p.y); const t = el.querySelector(`#c2a${i} text`); if (t && t.textContent !== p.num) t.textContent = p.num; });
  pos("c2bola", q.bola.x, q.bola.y);
  const g = el.querySelector<SVGTextElement>("#c2gol");
  if (g) { g.style.transition = "opacity .25s"; g.style.opacity = q.gol ? "1" : "0"; }
}
