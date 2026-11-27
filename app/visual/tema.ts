// Cor de destaque do jogo tirada das cores do seu clube: a mais viva das duas, clareada até ler
// bem no fundo escuro. Clube preto e branco fica com o branco. Muda quando você troca de clube.

const PADRAO = "#FF5A36";
const FUNDO = [11, 13, 16];

const rgb = (h: string): number[] => { const x = h.replace("#", ""); const v = x.length === 3 ? x.split("").map((c) => c + c).join("") : x.slice(0, 6); return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) || 0); };
const hex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const lum = (c: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const contraste = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mistura = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const croma = (c: number[]) => (Math.max(...c) - Math.min(...c)) / 255;
const hsl = (c: number[]) => { const [r, g, b] = c.map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1)); const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, s, l]; };
const deHsl = ([h, s, l]: number[]) => { const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [r, g, b].map((v) => (v + m) * 255); };
/** Clareia mantendo o matiz (e um pouco mais de saturação) até ler bem no fundo escuro. */
const clarear = (c: number[], alvo: number) => { let [h, s, l] = hsl(c); s = Math.min(1, Math.max(s, 0.55)); let out = c, k = 0; while (contraste(out, FUNDO) < alvo && k++ < 40) { l = Math.min(0.92, l + 0.025); out = deHsl([h, s, l]); } return out; };

/** As cores do tema para um par de cores de clube. */
export function coresDoTema(cores?: readonly string[]): { ouro: string; claro: string; escuro: string; tinta: string } {
  const l = (cores ?? []).filter(Boolean).map(rgb);
  let base = l.length ? l.slice().sort((a, b) => croma(b) - croma(a))[0] : rgb(PADRAO);
  if (croma(base) < 0.2) base = l.length ? [236, 239, 242] : rgb(PADRAO); // preto, branco, cinza: o destaque é o branco
  // forte o bastante para botão (3:1) e um tom claro para texto (4,5:1)
  const neutro = croma(base) < 0.2;
  const ouro = neutro || contraste(base, FUNDO) >= 3.2 ? base : clarear(base, 3.2);
  const claro = neutro || contraste(ouro, FUNDO) >= 5 ? ouro : clarear(ouro, 5);
  const escuro = mistura(ouro, FUNDO, 0.62);
  const tinta = contraste(ouro, [10, 12, 14]) >= contraste(ouro, [255, 255, 255]) ? "#0A0C0E" : "#FFFFFF";
  return { ouro: hex(ouro), claro: hex(claro), escuro: hex(escuro), tinta };
}

let ultimo = "";
/** Pinta o jogo com as cores do clube (ou volta ao padrão sem clube). */
export function aplicarTema(cores?: readonly string[]) {
  const chave = (cores ?? []).join(",");
  if (chave === ultimo || typeof document === "undefined") return;
  ultimo = chave;
  const t = coresDoTema(cores), st = document.documentElement.style;
  st.setProperty("--ouro", t.ouro); st.setProperty("--ouro-claro", t.claro); st.setProperty("--ouro-escuro", t.escuro); st.setProperty("--tinta", t.tinta);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#0B0D10");
}
