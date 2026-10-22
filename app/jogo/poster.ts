// Cartaz da campanha de patrocínio: o jogador com a marca, num layout por categoria (cartão do banco, lata,
// carro, celular, chuteira, lanche). Logos são desenhos nossos: o nome e as cores lembram a marca real.
import type { Marca, Simbolo } from "../../src/marcas";

const DISPLAY = "'Big Shoulders Display', 'Barlow', sans-serif", TEXTO = "'Barlow', sans-serif";
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Ícone do logo num quadro de 40×40. */
export function simbolo(s: Simbolo, c: string, c2: string, letra: string): string {
  switch (s) {
    case "onda": return `<path d="M3 24 Q11 12 20 22 T37 18" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;
    case "circulo": return `<circle cx="20" cy="20" r="16" fill="${c}"/><circle cx="20" cy="20" r="9" fill="${c2}"/>`;
    case "pera": return `<path d="M20 9 C27 9 25 17 29 23 C33 30 28 37 20 37 C12 37 7 30 11 23 C15 17 13 9 20 9 Z" fill="${c}"/><path d="M20 9 Q22 3 27 2" stroke="${c}" stroke-width="2.5" fill="none"/><ellipse cx="25" cy="5" rx="4" ry="2" fill="${c}" transform="rotate(-25 25 5)"/>`;
    case "coroa": return `<path d="M4 30 L7 12 L14 21 L20 8 L26 21 L33 12 L36 30 Z" fill="${c}"/><rect x="4" y="31" width="32" height="5" rx="2" fill="${c}"/>`;
    case "guardaChuva": return `<path d="M3 21 Q20 -2 37 21 Q32 17 28 21 Q24 17 20 21 Q16 17 12 21 Q8 17 3 21 Z" fill="${c}"/><path d="M20 21 V33 Q20 37 16 36" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case "chama": return `<path d="M20 3 C27 13 33 18 31 27 C29 35 22 38 20 38 C14 38 8 33 9 26 C10 20 15 18 16 12 C19 16 19 19 21 21 C23 16 22 9 20 3 Z" fill="${c}"/>`;
    case "raio": return `<path d="M24 2 L8 23 H18 L14 38 L32 15 H22 Z" fill="${c}"/>`;
    case "folha": return `<path d="M6 34 C6 14 18 5 36 5 C36 24 26 34 6 34 Z" fill="${c}"/><path d="M8 32 L28 12" stroke="${c2}" stroke-width="2"/>`;
    case "gota": return `<path d="M20 3 C27 14 32 20 32 26 A12 12 0 0 1 8 26 C8 20 13 14 20 3 Z" fill="${c}"/><path d="M14 27 Q15 32 20 33" stroke="${c2}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    case "estrela": return `<path d="M20 3 L25 15 L38 15 L27 23 L31 36 L20 28 L9 36 L13 23 L2 15 L15 15 Z" fill="${c}"/>`;
    case "oval": return `<ellipse cx="20" cy="20" rx="18" ry="11" fill="none" stroke="${c}" stroke-width="4"/><text x="20" y="25" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="14" fill="${c}">${esc(letra)}</text>`;
    case "escudo": return `<path d="M5 4 H35 V19 Q35 32 20 38 Q5 32 5 19 Z" fill="${c}"/><text x="20" y="26" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="17" fill="${c2}">${esc(letra)}</text>`;
    case "pontos": return [0, 1, 2, 3].map((i) => `<circle cx="${8 + i * 8}" cy="${28 - i * 6}" r="${3 + i}" fill="${c}"/>`).join("");
    case "batata": return `<path d="M9 18 H31 L28 37 H12 Z" fill="${c}"/>${[11, 15, 19, 23, 27].map((x, i) => `<rect x="${x}" y="${4 + (i % 2) * 3}" width="3" height="16" rx="1" fill="${c2}"/>`).join("")}`;
    case "asa": return `<path d="M3 26 C10 10 26 6 37 8 C30 12 26 16 24 22 C18 20 10 22 3 26 Z" fill="${c}"/><path d="M8 32 C16 26 26 26 34 22" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case "balanca": return `<path d="M20 5 V34 M8 34 H32 M7 12 H33" stroke="${c}" stroke-width="3" stroke-linecap="round"/><path d="M3 24 L7 12 L11 24 Z M29 24 L33 12 L37 24 Z" fill="${c}"/>`;
    case "quadrado": return `<rect x="4" y="4" width="32" height="32" rx="9" fill="${c}"/><text x="20" y="27" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="19" fill="${c2}">${esc(letra)}</text>`;
    case "chifre": return `<path d="M4 30 C6 16 12 10 20 22 C28 10 34 16 36 30 C30 24 26 24 20 30 C14 24 10 24 4 30 Z" fill="${c}"/><circle cx="20" cy="12" r="6" fill="${c2}"/>`;
    case "garra": return [0, 1, 2].map((i) => `<path d="M${8 + i * 9} 4 Q${4 + i * 9} 20 ${10 + i * 9} 37" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("");
    case "engrenagem": return `<circle cx="20" cy="20" r="11" fill="none" stroke="${c}" stroke-width="6" stroke-dasharray="5 3"/><circle cx="20" cy="20" r="5" fill="${c}"/>`;
    case "letra": return `<rect x="3" y="3" width="34" height="34" rx="6" fill="${c}"/><path d="M10 30 L20 10 L30 30" stroke="${c2}" stroke-width="5" fill="none" stroke-linejoin="round"/>`;
  }
}

const estiloLetra = (m: Marca) => m.letra === "italica" ? `font-style="italic" font-weight="800"` : m.letra === "fina" ? `font-weight="600" letter-spacing="2"` : m.letra === "redonda" ? `font-weight="700"` : `font-weight="900"`;
const fonteLetra = (m: Marca) => (m.letra === "fina" || m.letra === "redonda" ? TEXTO : DISPLAY);

/** Logo: ícone + nome. Devolve um <g> com ~ (40 + texto) de largura e 40 de altura. */
export function logoMarca(m: Marca, cor = m.cores[1], cor2 = m.cores[0], tamanho = 22): string {
  const nome = m.letra === "fina" ? m.nome.toUpperCase() : m.nome;
  return `<g>${`<g>${simbolo(m.simbolo, cor, cor2, m.nome[0])}</g>`}<text x="48" y="${20 + tamanho * 0.36}" font-family="${fonteLetra(m)}" ${estiloLetra(m)} font-size="${tamanho}" fill="${cor}">${esc(nome)}</text></g>`;
}
export function logoSvg(m: Marca, altura = 28): string {
  const larg = 58 + m.nome.length * (m.letra === "fina" ? 17 : 13);
  return `<svg class="logo-marca" viewBox="0 0 ${larg} 40" height="${altura}" role="img" aria-label="${esc(m.nome)}"><rect width="${larg}" height="40" rx="8" fill="${m.cores[0]}"/><g transform="translate(4 0)">${logoMarca(m)}</g></svg>`;
}

/** O produto desenhado no cartaz, perto do jogador. */
function produto(m: Marca, apelido: string, numero: string): string {
  const [a, b, c] = m.cores;
  switch (m.categoria) {
    case "banco": return `<g transform="translate(150 250) rotate(-10)"><rect width="150" height="94" rx="12" fill="${b}" stroke="${c}" stroke-width="2"/><rect x="14" y="30" width="24" height="18" rx="3" fill="#E3B341"/><text x="14" y="72" font-family="monospace" font-size="11" fill="${a}">5023 •••• •••• ${numero.padStart(4, "0")}</text><text x="14" y="86" font-family="${TEXTO}" font-weight="700" font-size="10" fill="${a}">${esc(apelido.toUpperCase())}</text><g transform="translate(104 8) scale(.9)">${simbolo(m.simbolo, a, b, m.nome[0])}</g></g>`;
    case "refrigerante": case "cerveja": case "energetico": return `<g transform="translate(222 222)"><rect x="0" y="12" width="64" height="118" rx="10" fill="${a}" stroke="${c}" stroke-width="2"/><rect x="4" y="2" width="56" height="14" rx="5" fill="#C9CCD1"/><rect x="0" y="52" width="64" height="40" fill="${b}"/><g transform="translate(12 52)">${simbolo(m.simbolo, a, b, m.nome[0])}</g><path d="M8 20 V124" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/></g>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${214 + i * 18}" cy="${214 - (i % 2) * 10}" r="${3 + (i % 3)}" fill="${b}" opacity=".7"/>`).join("")}`;
    case "carro": return `<g transform="translate(14 300)"><path d="M10 52 L22 30 Q30 18 52 16 H172 Q196 16 214 30 L262 38 Q284 42 286 56 V66 H10 Z" fill="${b}" stroke="${c}" stroke-width="2"/><path d="M58 22 H160 Q178 22 190 34 H44 Z" fill="${a}" opacity=".55"/><circle cx="70" cy="68" r="18" fill="#1A1A1A"/><circle cx="70" cy="68" r="7" fill="#C9CCD1"/><circle cx="226" cy="68" r="18" fill="#1A1A1A"/><circle cx="226" cy="68" r="7" fill="#C9CCD1"/><g transform="translate(128 34) scale(.55)">${simbolo(m.simbolo, a, b, m.nome[0])}</g></g>`;
    case "celular": return `<g transform="translate(196 196) rotate(8)"><rect width="96" height="176" rx="18" fill="#1A1A1A"/><rect x="6" y="8" width="84" height="160" rx="13" fill="${b}"/><circle cx="48" cy="18" r="4" fill="#1A1A1A"/><g transform="translate(28 64)">${simbolo(m.simbolo, a, b, m.nome[0])}</g><text x="48" y="140" text-anchor="middle" font-family="${TEXTO}" font-weight="700" font-size="11" fill="${a}">200 MP</text></g>`;
    case "material": return `<g transform="translate(150 300) rotate(-14)"><path d="M6 46 Q4 22 22 18 L70 14 Q84 4 104 8 Q128 12 150 30 Q162 42 156 52 H14 Q6 52 6 46 Z" fill="${b}" stroke="${c}" stroke-width="2"/><path d="M14 52 H156" stroke="${a}" stroke-width="6"/>${[30, 56, 82, 108, 134].map((x) => `<rect x="${x}" y="54" width="8" height="9" rx="2" fill="${a}"/>`).join("")}<g transform="translate(60 18) scale(.7)">${simbolo(m.simbolo, a, b, m.nome[0])}</g></g>`;
    case "comida": return `<g transform="translate(196 262)"><path d="M6 46 Q50 -6 94 46 Z" fill="#E0A34A"/><rect x="2" y="46" width="96" height="12" rx="5" fill="#5A9E3A"/><rect x="0" y="57" width="100" height="16" rx="6" fill="#6B3A1E"/><rect x="2" y="72" width="96" height="10" rx="4" fill="#F2C200"/><path d="M4 82 Q50 104 96 82 Z" fill="#E0A34A"/>${[18, 40, 62, 80].map((x) => `<ellipse cx="${x}" cy="${26 + (x % 3) * 4}" rx="2.4" ry="1.4" fill="#FFF4DA"/>`).join("")}</g><g transform="translate(150 268) scale(1.2)">${simbolo("batata", a, b, "")}</g>`;
  }
}

/** Luminância relativa aproximada (0 = preto, 1 = branco). */
function luz(hex: string): number {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function quebrar(t: string, max: number): string[] {
  const out: string[] = []; let atual = "";
  for (const p of t.split(" ")) { if ((atual + " " + p).trim().length > max && atual) { out.push(atual); atual = p; } else atual = (atual + " " + p).trim(); }
  if (atual) out.push(atual);
  return out;
}

/** Cartaz da campanha (320 × 440). */
export function cartazPatrocinio(m: Marca, fotoSvg: string, apelido: string, numero: string, ano: number): string {
  const [a, b, c] = m.cores, id = `cz${m.id}${ano}`;
  const foto = fotoSvg.replace(/<rect width="300" height="360" fill="#13261F"\/>/, "").replace("<svg ", `<svg x="-10" y="128" width="236" height="283" `);
  const tinta = luz(a) > 0.6 ? "#111111" : "#FFFFFF";
  const destaque = [b, a, c, "#E3B341"].find((x) => luz(x) > 0.35 && luz(x) < 0.97) ?? "#E3B341";
  const linhas = quebrar(m.slogan.toUpperCase(), 19).slice(0, 3);
  return `<svg class="cartaz" viewBox="0 0 320 440" role="img" aria-label="Campanha ${esc(m.nome)} com ${esc(apelido)}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}" stop-opacity=".85"/></linearGradient>
  <clipPath id="${id}c"><rect width="320" height="440" rx="14"/></clipPath></defs>
  <g clip-path="url(#${id}c)">
    <rect width="320" height="440" fill="url(#${id}g)"/>
    <circle cx="250" cy="150" r="150" fill="${b}" opacity=".12"/><circle cx="40" cy="420" r="120" fill="${b}" opacity=".08"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${-40 + i * 70} 440 L${60 + i * 70} 90" stroke="${b}" stroke-opacity=".07" stroke-width="22"/>`).join("")}
    ${foto}
    ${produto(m, apelido, numero)}
    <g transform="translate(18 14)">${logoMarca(m, luz(a) > 0.6 ? (luz(b) < 0.5 ? b : "#111111") : (luz(b) > 0.45 ? b : "#FFFFFF"), a, 24)}</g>
    ${linhas.map((l, i) => `<text x="18" y="${84 + i * (linhas.length > 2 ? 26 : 30)}" font-family="${DISPLAY}" font-weight="900" font-size="${linhas.length > 2 ? 25 : 29}" fill="${tinta}">${esc(l)}</text>`).join("")}
    <rect x="0" y="398" width="320" height="42" fill="#0B0B0B" opacity=".72"/>
    <text x="18" y="425" font-family="${DISPLAY}" font-weight="800" font-size="20" fill="#FFFFFF" letter-spacing="1">${esc(apelido.toUpperCase())} <tspan fill="${destaque}">#${esc(numero)}</tspan></text>
    <text x="302" y="425" text-anchor="end" font-family="${TEXTO}" font-weight="600" font-size="11" fill="#FFFFFF" opacity=".8">CAMPANHA ${ano}</text>
  </g></svg>`;
}
