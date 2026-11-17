// Cartaz da campanha de patrocínio: o jogador com a marca, num layout por categoria (cartão do banco, lata,
// carro, celular, chuteira, lanche). Logos são desenhos nossos: o nome e as cores lembram a marca real.
import type { Marca, Simbolo } from "../../src/marcas";

const DISPLAY = "'Big Shoulders Display', 'Barlow', sans-serif", TEXTO = "'Barlow', sans-serif";
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Ícone do logo num quadro de 40×40 (também vai no boné e no blusão do patrocinador). */
export const simboloMarca = (m: Marca, cor: string, cor2: string) => desenhoMarca(m, cor, cor2);
/** O desenho de cada marca: as que têm um logo só delas; as outras usam o símbolo do tipo. */
function desenhoMarca(m: Marca, c: string, c2: string): string { return PROPRIO[m.id]?.(c, c2) ?? simbolo(m.simbolo, c, c2, m.nome[0]); }
const ESTRELA5 = (cx: number, cy: number, R: number) => `M${Array.from({ length: 10 }, (_, k) => { const r = k % 2 ? R * 0.42 : R, a = -Math.PI / 2 + (k * Math.PI) / 5; return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`; }).join(" L")} Z`;
const LEAO_PERFIL = "M6.2 14.6 L7.6 13.2 C8.4 11.6 9.6 10.6 11 10.2 L11.4 8.6 L12.6 9.6 C13 7.4 15 6.2 17 6.6 L16.4 7.8 L18.8 7.6 L18 9 L20.6 9.4 L19.4 10.6 L21.6 11.6 L20.2 12.6 L22 14 L20.4 14.8 L21.8 16.6 L20 17 L20.8 19 L19 18.8 L19 20.8 L17.4 19.8 L16.6 21.8 L15.4 20.4 L14 22 L13.4 20.2 C12 20 10.4 19.4 9.6 18.2 L8.4 18 L9.2 17.2 L7 16.6 C6.4 16.4 6 15.4 6.2 14.6 Z";
const PROPRIO: Record<string, (c: string, c2: string) => string> = {
  // círculo: metade de cima vermelha, metade de baixo azul, um traço branco reto no meio
  pepsy: () => `<circle cx="20" cy="20" r="17" fill="#FFFFFF"/><path d="M4.4 18.4 A15.6 15.6 0 0 1 35.6 18.4 Z" fill="#E32934"/><path d="M4.4 21.6 A15.6 15.6 0 0 0 35.6 21.6 Z" fill="#004B93"/>`,
  // estrela vermelha com contorno verde
  heinekao: () => `<path d="${ESTRELA5(20, 21, 17)}" fill="#C8102E" stroke="#FFFFFF" stroke-width="4.2" stroke-linejoin="round"/><path d="${ESTRELA5(20, 21, 17)}" fill="#C8102E" stroke="#00843D" stroke-width="2.2" stroke-linejoin="round"/>`,
  // bola com o V em cima e o W embaixo
  volksvagao: (c) => `<circle cx="20" cy="20" r="16.5" fill="none" stroke="${c}" stroke-width="2.6"/><g fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"><path d="M13.4 7.4 L20 20 L26.6 7.4"/><path d="M6.6 15 L12.4 31.4 L20 22 L27.6 31.4 L33.4 15"/></g>`,
  // bola dividida em 4 como pizza, azul e branco
  bmv: () => `<circle cx="20" cy="20" r="17.5" fill="#111111"/><path d="M20 20 V6.5 A13.5 13.5 0 0 1 33.5 20 Z M20 20 V33.5 A13.5 13.5 0 0 1 6.5 20 Z" fill="#0066B1"/><path d="M20 20 H33.5 A13.5 13.5 0 0 1 20 33.5 Z M20 20 H6.5 A13.5 13.5 0 0 1 20 6.5 Z" fill="#FFFFFF"/>`,
  // mapa da América do Sul, bem simples
  latao: (c) => `<path d="M13 4 L22 4.6 L28 8 L34.6 12 L36 15.6 L32.4 21 L27 25.4 L23.6 30 L21.4 37.4 L18.6 36 L18.4 29.4 L15.6 24 L11.4 19 L8.4 14 L9.6 8.4 Z" fill="${c}"/>`,
  // mapa do Brasil, azul, bem simples
  azulzinha: (c) => `<path d="M9.6 9.4 L16 6.6 L21 7.4 L24.4 4.6 L28.4 8 L34 10.6 L37 15.4 L35.4 19.4 L31.6 22 L30 27.4 L25.4 30.6 L21.4 36.6 L19.2 33 L15.6 30.6 L14.2 25.4 L9.4 23.6 L5.6 20 L3.4 15.4 L6 12.4 Z" fill="#4FC3F7" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>`,
  // bolinha com a bandeira da Turquia
  turquinha: () => `<circle cx="20" cy="20" r="17" fill="#E30A17" stroke="#FFFFFF" stroke-width="1.5"/><circle cx="17" cy="20" r="8.4" fill="#FFFFFF"/><circle cx="19.2" cy="20" r="6.7" fill="#E30A17"/><path d="${ESTRELA5(28, 20, 4.2)}" fill="#FFFFFF" transform="rotate(-18 28 20)"/>`,
  // uma fatia de pizza
  pizzarut: (c, c2) => `<path d="M20 37 L5.6 9.4 Q20 3.4 34.4 9.4 Z" fill="${c}"/><path d="M5.6 9.4 Q20 3.4 34.4 9.4" fill="none" stroke="${c}" stroke-width="4.4" stroke-linecap="round"/>${[[16, 14], [24, 16], [19, 23], [21, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c2}"/>`).join("")}`,
  // um B com um raio dentro
  betona: (c, c2) => `<text x="20" y="34" text-anchor="middle" font-family="'Big Shoulders Display', Arial Black, sans-serif" font-weight="900" font-size="38" fill="${c}">B</text><path d="M22.4 8 L13.6 21 H19.4 L16.6 32 L26.4 17.6 H20.6 Z" fill="${c2}"/>`,
  // círculo quadriculado: quadradinhos na cor e o resto vazio
  alianca: (c) => `<defs><clipPath id="cAli"><circle cx="20" cy="20" r="16"/></clipPath></defs><g clip-path="url(#cAli)" fill="${c}">${Array.from({ length: 64 }, (_, k) => [k % 8, Math.floor(k / 8)]).filter(([i, j]) => (i + j) % 2 === 0).map(([i, j]) => `<rect x="${4 + i * 4}" y="${4 + j * 4}" width="4" height="4"/>`).join("")}</g><circle cx="20" cy="20" r="16" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  // quadrado com o nome escrito
  itao: (c, c2) => `<rect x="2" y="5" width="36" height="30" rx="7" fill="${c}"/><text x="20" y="25.4" text-anchor="middle" font-family="'Barlow', sans-serif" font-weight="800" font-size="13" fill="${c2}">Itaó</text>`,
  // diamante (dois losangos, um dentro do outro)
  reno: (c) => `<g fill="none" stroke="${c}" stroke-width="3.2" stroke-linejoin="miter"><path d="M20 3 L31 20 L20 37 L9 20 Z"/><path d="M20 10.4 L26.2 20 L20 29.6 L13.8 20 Z"/></g>`,
  // o número 366 em amarelo
  bet366: () => `<text x="20" y="27" text-anchor="middle" font-family="'Big Shoulders Display', Arial Black, sans-serif" font-weight="900" font-size="20" textLength="36" lengthAdjust="spacingAndGlyphs" fill="#FFDF1B" stroke="#0A0A0A" stroke-width=".8" paint-order="stroke">366</text>`,
  // só o N
  nokya: (c) => `<text x="20" y="33" text-anchor="middle" font-family="'Big Shoulders Display', Arial Black, sans-serif" font-weight="900" font-size="36" fill="${c}">N</text>`,
  // oval com o nome escrito
  fordi: (c, c2) => `<ellipse cx="20" cy="20" rx="19" ry="12.5" fill="${c}"/><ellipse cx="20" cy="20" rx="17.2" ry="10.8" fill="none" stroke="${c2}" stroke-width=".8"/><text x="20" y="24.6" text-anchor="middle" font-family="'Brush Script MT', 'Segoe Script', cursive" font-style="italic" font-weight="700" font-size="13" fill="${c2}">Fordi</text>`,
  // silhueta de uma pera mordida
  apel: (c, c2) => `<path d="M20 9 C27 9 25 17 29 23 C33 30 28 37 20 37 C12 37 7 30 11 23 C15 17 13 9 20 9 Z" fill="${c}"/><circle cx="31.6" cy="21.4" r="5.6" fill="${c2}"/><path d="M20 9 Q21 4.6 25 3" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  // um "certinho" (o visto de conferido)
  naiki: (c) => `<path d="M3 21.4 L13.4 31.4 L37.4 8.6" fill="none" stroke="${c}" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  // uma pimenta
  chilibins: (c) => `<path d="M9.4 12.6 C14 10.6 18.6 12.4 21 16.6 C24.4 22.6 29.6 28.6 36.6 33.4 C28 35 18.4 31 12.6 24.4 C9.4 20.8 7.8 16.4 9.4 12.6 Z" fill="${c}"/><path d="M10.6 12.4 C10 9 11 6.6 13.6 5.4 M10.6 12.4 C12.6 10.4 15 10.6 16.6 12" fill="none" stroke="#2E8B3E" stroke-width="2.4" stroke-linecap="round"/>`,
  // um oval com dois risquinhos de fumaça saindo para cima
  santandeiro: (c) => `<ellipse cx="20" cy="27" rx="15" ry="8" fill="${c}"/><path d="M15 16.6 C12.6 13.6 17.4 11 15 7.4 M24.6 16.6 C22.2 13.6 27 11 24.6 7.4" fill="none" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`,
  // um X: a perna laranja embaixo e a azul passando por cima
  caixinha: () => `<path d="M8 8 L32 32" stroke="#F39200" stroke-width="7.4" stroke-linecap="round"/><path d="M32 8 L8 32" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/><path d="M32 8 L8 32" stroke="#005CA9" stroke-width="7.4" stroke-linecap="round"/>`,
  // dois b minúsculos sobrepostos na diagonal
  bbr: (c, c2) => `<g font-family="'Barlow', Arial Black, sans-serif" font-weight="900" font-size="24" fill="${c}" stroke="${c2}" stroke-width="1.6" paint-order="stroke"><text x="7" y="24">b</text><text x="17" y="35">b</text></g>`,
  // coroa redonda, com joias
  burguerrei: (c, c2) => `<path d="M5 30 L5 13 L12.6 20 L20 8 L27.4 20 L35 13 L35 30 Z" fill="${c}" stroke-linejoin="round"/><rect x="5" y="30" width="30" height="5" rx="2.4" fill="${c}"/>${[5, 20, 35].map((x, i) => `<circle cx="${x}" cy="${[13, 8, 13][i]}" r="2.4" fill="${c}"/>`).join("")}<circle cx="20" cy="23" r="2.6" fill="${c2}"/>`,
  // um X de pernas arredondadas (dois arcos), branco num quadrado vermelho
  brodesco: () => `<rect x="2" y="2" width="36" height="36" rx="7" fill="#CC092F"/><g fill="none" stroke="#FFFFFF" stroke-width="4.2" stroke-linecap="round"><path d="M8.6 8 Q27 14 30.6 32.4"/><path d="M31.4 8 Q13 14 9.4 32.4"/></g>`,
  // leque de pétalas abertas (como penas de pavão), em degradê
  huawey: () => `<defs><linearGradient id="gHw" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8E0019"/><stop offset="1" stop-color="#FF4D5E"/></linearGradient></defs><g fill="url(#gHw)">${[-72, -46, -20, 20, 46, 72].map((a) => `<path d="M20 34 C17 26 16.6 16 20 6 C23.4 16 23 26 20 34 Z" transform="rotate(${a} 20 34)"/>`).join("")}</g>`,
  // leão de perfil
  ingleao: (c) => `<g transform="translate(20 20) scale(1.95) translate(-14 -14.1)"><path d="${LEAO_PERFIL}" fill="${c}"/></g>`,
  // leão de pé (só a silhueta da cabeça e da juba, dentro de um escudinho)
  peujo: (c, c2) => `<path d="M7 4 H33 V20 Q33 32 20 37 Q7 32 7 20 Z" fill="${c}"/><g transform="translate(20 19) scale(1.3) translate(-14 -14.1)"><path d="${LEAO_PERFIL}" fill="${c2}"/></g>`,
  // um M estilizado (duas pontas) dentro de uma bolinha
  motorolo: (c, c2) => `<circle cx="20" cy="20" r="17" fill="${c}"/><path d="M9.6 29 L15.6 10.6 L20 22.4 L24.4 10.6 L30.4 29" fill="none" stroke="${c2}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>`,
  // só o nome em letra cursiva
  kokakolla: (c) => `<text x="20" y="25" text-anchor="middle" font-family="'Brush Script MT', 'Segoe Script', cursive" font-style="italic" font-weight="700" font-size="14" textLength="38" lengthAdjust="spacingAndGlyphs" fill="${c}">Koka-Kolla</text>`,
  // um tiozinho em estêncil preto e branco: cabelo branco, óculos e um bigodão marcante
  kentucky: () => `<circle cx="20" cy="20" r="18.5" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.6"/><path d="M8.4 17 C8 8.6 13 5.2 20 5.2 C27 5.2 32 8.6 31.6 17 C30.4 13 27.6 11.2 20 11.4 C12.4 11.2 9.6 13 8.4 17 Z" fill="#1A1A1A"/>`
    + `<path d="M10.6 15.4 C10.6 26 14 31.4 20 31.4 C26 31.4 29.4 26 29.4 15.4" fill="none" stroke="#1A1A1A" stroke-width="1.6"/><g fill="none" stroke="#1A1A1A" stroke-width="1.6"><rect x="12" y="15.4" width="6.4" height="4.6" rx="2"/><rect x="21.6" y="15.4" width="6.4" height="4.6" rx="2"/><path d="M18.4 17.2 H21.6"/></g>`
    + `<path d="M11.2 25.4 C13.4 22.4 17 22.2 20 23.4 C23 22.2 26.6 22.4 28.8 25.4 C26 25 23.4 25.4 20 26.6 C16.6 25.4 14 25 11.2 25.4 Z" fill="#1A1A1A"/><path d="M18 28 L20 33 L22 28 Z" fill="#1A1A1A"/><path d="M15 35.6 L20 33.6 L25 35.6 L25 37.4 L20 35.6 L15 37.4 Z" fill="#1A1A1A"/>`,
  // só o nome: "Sub" em verde e "uei" em amarelo
  subuei: () => `<text x="20" y="25.4" text-anchor="middle" font-family="'Big Shoulders Display', Arial Black, sans-serif" font-weight="900" font-size="15" textLength="38" lengthAdjust="spacingAndGlyphs" stroke="#FFFFFF" stroke-width="1.2" paint-order="stroke"><tspan fill="#008C15">Sub</tspan><tspan fill="#FFC600">uei</tspan></text>`,
  // duas folhas vermelhas em cima e um olho redondo (a frutinha do guaraná) embaixo
  gororo: () => `<path d="M20 15 C14 15 8.4 11 7.4 4.6 C13.6 4.4 18.6 8.4 20 15 Z" fill="#E30613"/><path d="M20 15 C26 15 31.6 11 32.6 4.6 C26.4 4.4 21.4 8.4 20 15 Z" fill="#E30613"/><circle cx="20" cy="26" r="10.6" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.6"/><circle cx="20" cy="26" r="5.4" fill="#1A1A1A"/><circle cx="18.4" cy="24.4" r="1.4" fill="#FFFFFF"/>`,
  // uma seta redonda, dando a volta e descendo
  skull: (c) => `<path d="M9.4 26.6 A12.4 12.4 0 1 1 30.6 26.6" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M24.2 25 L36.4 24.2 L30.4 36 Z" fill="${c}"/>`,
  // silhueta de um javali correndo
  pumba: (c, c2) => `<path d="M4 22 C4 16 9 12 16 12 L18 10 L19.6 12 L21 10 L22.4 12.2 C26 12.4 29 14 31 16.6 L36.6 19.4 L37 22.4 L33.6 22.6 L32 21.6 C31 23.4 29.6 24.6 28 25 L31.6 31 L29 31.8 L25.4 26.6 L20 27 L15 26.6 L10.4 31.6 L7.8 30.8 L11.4 25.2 C8.4 24.6 6 23.6 4 22 Z" fill="${c}"/><path d="M27.2 14.2 L28.6 10.2 L30 14.8 Z" fill="${c}"/><path d="M4.6 20.4 Q1.6 19.6 2 16.2" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/><path d="M33.4 22.6 Q35.4 21.6 35.4 19.6" fill="none" stroke="${c2}" stroke-width="1.1" stroke-linecap="round"/><circle cx="31" cy="17.6" r=".9" fill="${c2}"/>`,
  // três listras inclinadas dentro de um anel
  adidaz: (c) => `<defs><clipPath id="cAdz"><circle cx="20" cy="20" r="14"/></clipPath></defs><circle cx="20" cy="20" r="17" fill="none" stroke="${c}" stroke-width="2.6"/><g clip-path="url(#cAdz)" fill="${c}" transform="skewX(-22) translate(8 0)">${[9.6, 17.6, 25.6].map((x) => `<rect x="${x}" y="4" width="4.6" height="32"/>`).join("")}</g>`,
  // um círculo dividido em três
  mercedez: (c) => `<circle cx="20" cy="20" r="16.4" fill="none" stroke="${c}" stroke-width="2.8"/><path d="M20 20 V3.6 M20 20 L5.8 28.2 M20 20 L34.2 28.2" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`,
  // um sinal de mais gordo e em itálico
  chevrole: (c) => `<path d="M15 6 H25 V15 H34 V25 H25 V34 H15 V25 H6 V15 H15 Z" fill="${c}" transform="skewX(-16) translate(5.8 0)" stroke-linejoin="round"/>`,
  // três anéis entrelaçados
  audy: (c) => `<g fill="none" stroke="${c}" stroke-width="2.6">${[9.6, 20, 30.4].map((x) => `<circle cx="${x}" cy="20" r="7.6"/>`).join("")}</g>`,
  // dois bonequinhos sentados, de costas um para o outro
  kapa: (c) => `<g fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17.6 13.6 L16.6 25 L8.4 25.6 L7 33.4 M16.8 18 L9.6 15.6"/><path d="M22.4 13.6 L23.4 25 L31.6 25.6 L33 33.4 M23.2 18 L30.4 15.6"/></g><circle cx="16.4" cy="8.8" r="3.4" fill="${c}"/><circle cx="23.6" cy="8.8" r="3.4" fill="${c}"/>`,
  // um quadrado com o nome escrito à mão, na diagonal
  reiban: (c, c2) => `<rect x="3" y="5" width="34" height="30" rx="3" fill="${c}"/><text x="20" y="24" text-anchor="middle" transform="rotate(-14 20 20)" font-family="'Brush Script MT', 'Segoe Script', cursive" font-style="italic" font-weight="700" font-size="12" textLength="30" lengthAdjust="spacingAndGlyphs" fill="${c2}">Rei-Ban</text>`,
  // dois U curvos se encontrando: um para cima e um de cabeça para baixo (o de baixo vira o arco de um A)
  underarmadura: (c) => `<g fill="none" stroke="${c}" stroke-width="4.2" stroke-linecap="round"><path d="M9.4 4 C9.4 29 30.6 29 30.6 4"/><path d="M9.4 36 C9.4 11 30.6 11 30.6 36"/></g>`,
  // oval com o nome escrito dentro
  samsong: (c, c2) => `<ellipse cx="20" cy="20" rx="19" ry="11" fill="${c}" transform="rotate(-10 20 20)"/><text x="20" y="23.6" text-anchor="middle" font-family="'Barlow', Arial, sans-serif" font-weight="800" font-size="9" letter-spacing=".4" textLength="30" lengthAdjust="spacingAndGlyphs" fill="${c2}">SAMSONG</text>`,
  // um oval com as laterais mais grossas, que parece um O
  ouclei: (c) => `<path fill="${c}" fill-rule="evenodd" d="M20 7 C32 7 38 13 38 20 C38 27 32 33 20 33 C8 33 2 27 2 20 C2 13 8 7 20 7 Z M20 10.6 C27.6 10.6 30.6 15 30.6 20 C30.6 25 27.6 29.4 20 29.4 C12.4 29.4 9.4 25 9.4 20 C9.4 15 12.4 10.6 20 10.6 Z"/>`,
  // um oval com um H grosso e curvo, inclinado
  hyundai: (c) => `<ellipse cx="20" cy="20" rx="18.4" ry="12.4" fill="none" stroke="${c}" stroke-width="2.4"/><path d="M13.4 11.6 C12.4 17 11.6 23 12.2 28.6 M26.8 11.4 C27.6 17 28.4 23 27.8 28.4 M11.8 21.8 C17 17.2 23.4 23.6 28.2 18.4" fill="none" stroke="${c}" stroke-width="3.8" stroke-linecap="round"/>`,
  // cabeça de leão de frente, só o contorno (vazado), com os olhos vazados, e o nome embaixo
  criptocom: (c) => `<g fill="none" stroke="${c}" stroke-width="1.9" stroke-linejoin="round"><path d="M20 2.6 L26.4 5 L31.6 4.6 L31.2 10 L35 14.6 L31.6 18.6 L31.2 24 L25.6 26.4 L20 30.4 L14.4 26.4 L8.8 24 L8.4 18.6 L5 14.6 L8.8 10 L8.4 4.6 L13.6 5 Z"/><path d="M14 9.6 L20 7.6 L26 9.6 L27 17.6 L23.6 22.4 L20 24.4 L16.4 22.4 L13 17.6 Z"/><path d="M15.6 13.6 L18.6 14.8 L15.8 16 Z M24.4 13.6 L21.4 14.8 L24.2 16 Z M18 19 H22 L20 21 Z"/></g><text x="20" y="38.4" text-anchor="middle" font-family="'Barlow', Arial, sans-serif" font-weight="800" font-size="6.4" textLength="34" lengthAdjust="spacingAndGlyphs" fill="${c}">Cripto.com</text>`,
  // um quadrado tão arredondado que quase é um círculo, com o nome em itálico, de letras altas
  fiato: (c, c2) => `<path d="M20 2.6 C33 2.6 37.4 7 37.4 20 C37.4 33 33 37.4 20 37.4 C7 37.4 2.6 33 2.6 20 C2.6 7 7 2.6 20 2.6 Z" fill="${c}"/><text x="20" y="27.6" text-anchor="middle" font-family="'Barlow Condensed', 'Arial Narrow', sans-serif" font-style="italic" font-weight="800" font-size="20" textLength="27" lengthAdjust="spacingAndGlyphs" fill="${c2}">Fiato</text>`,
  // uma asa de penas abertas, em pé (diferente da asa deitada das outras marcas)
  penalte: (c) => `<path d="M8 36 C6 26 8.4 16 15 9 C20 4 27 2.6 34.6 3.4 C31.4 5.4 29.6 7 28.6 9 C32.4 8.6 35.6 9.4 37.4 10.6 C33.6 11.6 31 13 29.6 15 C32.6 15.2 35 16.2 36.4 17.6 C32.4 18.4 29.4 19.6 27.6 21.6 C30 22.2 31.6 23.2 32.6 24.6 C27.6 24.8 23.4 26 20 28.4 C16 31.2 12.6 34 8 36 Z" fill="${c}"/>`,
  // uma folha azul com a gotinha laranja caindo da ponta
  oranjinha: () => `<path d="M4 6 C14 2.6 25.4 6 28.4 17.4 C17.6 20.4 7 16.4 4 6 Z" fill="#1E5BC6"/><path d="M6 7.4 C12 10.4 18 13.4 26.4 16.6" fill="none" stroke="#FFFFFF" stroke-width=".9" stroke-linecap="round"/><path d="M29 21.4 C32.6 26.4 35 29.4 35 32.2 A6 6 0 0 1 23 32.2 C23 29.4 25.4 26.4 29 21.4 Z" fill="#FF8C1A" stroke="#FFFFFF" stroke-width=".8"/>`,
  // escudo dividido: em cima verde com TAGUE, embaixo vermelho com ROIER, cada nome enchendo a sua metade
  taguer: () => `<defs><clipPath id="cTag"><path d="M4 3 H36 V20 Q36 32 20 38 Q4 32 4 20 Z"/></clipPath></defs><g clip-path="url(#cTag)"><rect width="40" height="19" fill="#00703C"/><rect y="19" width="40" height="21" fill="#D0102C"/></g>`
    + `<path d="M4 19 H36" stroke="#FFFFFF" stroke-width="1"/><path d="M4 3 H36 V20 Q36 32 20 38 Q4 32 4 20 Z" fill="none" stroke="#FFFFFF" stroke-width="1.4"/>`
    + `<g font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="900" fill="#FFFFFF" text-anchor="middle"><text x="20" y="16.6" font-size="13" textLength="28" lengthAdjust="spacingAndGlyphs">TAGUE</text><text x="20" y="31" font-size="12" textLength="24" lengthAdjust="spacingAndGlyphs">ROIER</text></g>`,
  // dois arcos dourados
  macdonaldo: () => `<path d="M5.4 35 V17 Q5.4 5.4 12.7 5.4 Q20 5.4 20 17 Q20 5.4 27.3 5.4 Q34.6 5.4 34.6 17 V35" fill="none" stroke="#FFC72C" stroke-width="5.2" stroke-linejoin="round"/>`,
};
function simbolo(s: Simbolo, c: string, c2: string, letra: string): string {
  switch (s) {
    case "aviao": return `<path d="M20 3 C22 3 23 6 23 9 V16 L37 24 V28 L23 24 V32 L28 36 V38 L20 36 L12 38 V36 L17 32 V24 L3 28 V24 L17 16 V9 C17 6 18 3 20 3 Z" fill="${c}"/>`;
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
    // duas mãos se cumprimentando dentro de um oval deitado (tipo um pãozinho)
    case "aperto": return `<ellipse cx="20" cy="20" rx="18.5" ry="12.5" fill="${c}"/><g fill="none" stroke="${c2}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">`
      + `<path d="M3.5 21 L10 17.4 C12.6 16 15 15.8 17.4 16.6 L25.6 20.2 C27.2 21 26.6 23.4 24.6 22.8 L20.4 21.4"/><path d="M36.5 18.4 L30.4 14.6 C28 13.2 25.4 13.4 23.2 14.8 L17.6 18.6 C16.4 19.6 17.6 21.4 19 20.6 L22.4 18.6"/>`
      + `<path d="M13.4 21.6 L16.4 24.4 M16.2 20.6 L19.6 23.8 M19.6 23.6 L22 25.6 M23.2 23.4 L24.4 24.6"/></g>`;
    case "letra": return `<rect x="3" y="3" width="34" height="34" rx="6" fill="${c}"/><path d="M10 30 L20 10 L30 30" stroke="${c2}" stroke-width="5" fill="none" stroke-linejoin="round"/>`;
  }
}

const estiloLetra = (m: Marca) => m.letra === "italica" ? `font-style="italic" font-weight="800"` : m.letra === "fina" ? `font-weight="600" letter-spacing="2"` : m.letra === "redonda" ? `font-weight="700"` : `font-weight="900"`;
const fonteLetra = (m: Marca) => (m.letra === "fina" || m.letra === "redonda" ? TEXTO : DISPLAY);

/** Logo: ícone + nome. Devolve um <g> com ~ (40 + texto) de largura e 40 de altura. */
export function logoMarca(m: Marca, cor = m.cores[1], cor2 = m.cores[0], tamanho = 22): string {
  const nome = m.letra === "fina" ? m.nome.toUpperCase() : m.nome;
  return `<g>${`<g>${desenhoMarca(m, cor, cor2)}</g>`}<text x="48" y="${20 + tamanho * 0.36}" font-family="${fonteLetra(m)}" ${estiloLetra(m)} font-size="${tamanho}" fill="${cor}">${esc(nome)}</text></g>`;
}
export function logoSvg(m: Marca, altura = 28): string {
  const larg = 58 + m.nome.length * (m.letra === "fina" ? 17 : 13);
  return `<svg class="logo-marca" viewBox="0 0 ${larg} 40" height="${altura}" role="img" aria-label="${esc(m.nome)}"><rect width="${larg}" height="40" rx="8" fill="${m.cores[0]}"/><g transform="translate(4 0)">${logoMarca(m)}</g></svg>`;
}

/** Aeroporto-base de cada companhia (vai no cartão de embarque do cartaz). */
const HUB: Record<string, string> = { katarair: "DOH", emiratez: "DXB", etihade: "AUH", saudita: "JED", turquinha: "IST", lufthanza: "FRA", iberica: "MAD", airfranca: "CDG", britair: "LHR", tapa: "LIS", latao: "GRU", azulzinha: "VCP", deltta: "ATL", avianka: "BOG", rdutch: "AMS" };
/** O produto desenhado no cartaz, perto do jogador. */
function produto(m: Marca, apelido: string, numero: string): string {
  const [a, b, c] = m.cores;
  switch (m.categoria) {
    case "banco": return `<g transform="translate(150 250) rotate(-10)"><rect width="150" height="94" rx="12" fill="${b}" stroke="${c}" stroke-width="2"/><rect x="14" y="30" width="24" height="18" rx="3" fill="#E3B341"/><text x="14" y="72" font-family="monospace" font-size="11" fill="${a}">5023 •••• •••• ${numero.padStart(4, "0")}</text><text x="14" y="86" font-family="${TEXTO}" font-weight="700" font-size="10" fill="${a}">${esc(apelido.toUpperCase())}</text><g transform="translate(104 8) scale(.9)">${desenhoMarca(m, a, b)}</g></g>`;
    case "refrigerante": case "cerveja": case "energetico": return `<g transform="translate(222 222)"><rect x="0" y="12" width="64" height="118" rx="10" fill="${a}" stroke="${c}" stroke-width="2"/><rect x="4" y="2" width="56" height="14" rx="5" fill="#C9CCD1"/><rect x="0" y="52" width="64" height="40" fill="${b}"/><g transform="translate(12 52)">${desenhoMarca(m, a, b)}</g><path d="M8 20 V124" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/></g>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${214 + i * 18}" cy="${214 - (i % 2) * 10}" r="${3 + (i % 3)}" fill="${b}" opacity=".7"/>`).join("")}`;
    case "carro": return `<g transform="translate(14 300)"><path d="M10 52 L22 30 Q30 18 52 16 H172 Q196 16 214 30 L262 38 Q284 42 286 56 V66 H10 Z" fill="${b}" stroke="${c}" stroke-width="2"/><path d="M58 22 H160 Q178 22 190 34 H44 Z" fill="${a}" opacity=".55"/><circle cx="70" cy="68" r="18" fill="#1A1A1A"/><circle cx="70" cy="68" r="7" fill="#C9CCD1"/><circle cx="226" cy="68" r="18" fill="#1A1A1A"/><circle cx="226" cy="68" r="7" fill="#C9CCD1"/><g transform="translate(128 34) scale(.55)">${desenhoMarca(m, a, b)}</g></g>`;
    case "celular": return `<g transform="translate(196 196) rotate(8)"><rect width="96" height="176" rx="18" fill="#1A1A1A"/><rect x="6" y="8" width="84" height="160" rx="13" fill="${b}"/><circle cx="48" cy="18" r="4" fill="#1A1A1A"/><g transform="translate(28 64)">${desenhoMarca(m, a, b)}</g><text x="48" y="140" text-anchor="middle" font-family="${TEXTO}" font-weight="700" font-size="11" fill="${a}">200 MP</text></g>`;
    case "material": return `<g transform="translate(150 300) rotate(-14)"><path d="M6 46 Q4 22 22 18 L70 14 Q84 4 104 8 Q128 12 150 30 Q162 42 156 52 H14 Q6 52 6 46 Z" fill="${b}" stroke="${c}" stroke-width="2"/><path d="M14 52 H156" stroke="${a}" stroke-width="6"/>${[30, 56, 82, 108, 134].map((x) => `<rect x="${x}" y="54" width="8" height="9" rx="2" fill="${a}"/>`).join("")}<g transform="translate(60 18) scale(.7)">${desenhoMarca(m, a, b)}</g></g>`;
    case "oculos": {
      const ac = m.acessorio?.tipo === "oculos" ? m.acessorio : undefined, lente = ac?.lente ?? "#2A2A2A", arm = ac?.armacao ?? "#1A1A1A";
      return `<g transform="translate(176 300) rotate(-8)"><path d="M0 10 Q40 0 120 10" stroke="${arm}" stroke-width="5" fill="none"/><ellipse cx="30" cy="26" rx="28" ry="20" fill="${lente}" stroke="${arm}" stroke-width="4"/><ellipse cx="92" cy="26" rx="28" ry="20" fill="${lente}" stroke="${arm}" stroke-width="4"/><path d="M14 18 L28 14 M76 18 L90 14" stroke="#FFFFFF" stroke-width="3" opacity=".5" stroke-linecap="round"/><g transform="translate(44 44) scale(.6)">${desenhoMarca(m, a, b)}</g></g>`;
    }
    case "relogio": {
      const ac = m.acessorio?.tipo === "relogio" ? m.acessorio : undefined;
      return `<g transform="translate(226 270)"><rect x="18" y="-10" width="30" height="130" rx="10" fill="${ac?.pulseira ?? b}" stroke="${c}" stroke-width="2"/><circle cx="33" cy="55" r="34" fill="${ac?.mostrador ?? a}" stroke="${ac?.pulseira ?? b}" stroke-width="7"/><path d="M33 55 V32 M33 55 L48 62" stroke="#F2F0EA" stroke-width="3" stroke-linecap="round"/>${[0, 1, 2, 3].map((k) => `<circle cx="${33 + 26 * Math.cos(k * Math.PI / 2)}" cy="${55 + 26 * Math.sin(k * Math.PI / 2)}" r="2.4" fill="#F2F0EA"/>`).join("")}</g>`;
    }
    case "fone": {
      const ac = m.acessorio?.tipo === "fone" ? m.acessorio : undefined, cor = ac?.cor ?? a, det = ac?.detalhe ?? b;
      return `<g transform="translate(200 250)"><path d="M10 70 Q10 0 55 0 Q100 0 100 70" stroke="${cor}" stroke-width="10" fill="none"/><rect x="-4" y="60" width="30" height="46" rx="12" fill="${cor}" stroke="#1A1A1A" stroke-width="2"/><rect x="84" y="60" width="30" height="46" rx="12" fill="${cor}" stroke="#1A1A1A" stroke-width="2"/><circle cx="11" cy="83" r="8" fill="${det}"/><circle cx="99" cy="83" r="8" fill="${det}"/></g>`;
    }
    case "aerea": return `<g transform="translate(160 250) rotate(-12)"><rect width="150" height="70" rx="10" fill="#FFFFFF" stroke="${c}" stroke-width="2"/><rect width="150" height="20" rx="10" fill="${a}"/><rect y="12" width="150" height="8" fill="${a}"/>
      <text x="10" y="15" font-family="${TEXTO}" font-weight="800" font-size="10" fill="${b}">${esc(m.nome.toUpperCase())}</text><text x="10" y="44" font-family="${DISPLAY}" font-weight="900" font-size="22" fill="#1A1A1A">${HUB[m.id] ?? "GRU"} ✈ FINAL</text>
      <text x="10" y="62" font-family="${TEXTO}" font-weight="700" font-size="9" fill="#555">PASSAGEIRO ${esc(apelido.toUpperCase())} · ASSENTO ${esc(numero)}A</text><path d="M118 20 V70" stroke="#999" stroke-dasharray="3 3"/><g transform="translate(122 30) scale(.6)">${simbolo("aviao", a, b, "")}</g></g>`;
    case "comida": return `<g transform="translate(196 262)"><path d="M6 46 Q50 -6 94 46 Z" fill="#E0A34A"/><rect x="2" y="46" width="96" height="12" rx="5" fill="#5A9E3A"/><rect x="0" y="57" width="100" height="16" rx="6" fill="#6B3A1E"/><rect x="2" y="72" width="96" height="10" rx="4" fill="#F2C200"/><path d="M4 82 Q50 104 96 82 Z" fill="#E0A34A"/>${[18, 40, 62, 80].map((x) => `<ellipse cx="${x}" cy="${26 + (x % 3) * 4}" rx="2.4" ry="1.4" fill="#FFF4DA"/>`).join("")}</g><g transform="translate(150 268) scale(1.2)">${simbolo("batata", a, b, "")}</g>`;
    // marcas só de clube não têm cartaz de jogador
    default: return "";
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
