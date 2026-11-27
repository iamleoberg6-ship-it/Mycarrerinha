// Ícones de linha do jogo (um traço só, cor do texto). Substituem os emoji da interface:
// um observador troca, depois de cada desenho da tela, os emoji por estes ícones. Conversas,
// posts e comentários ficam como estão (lá o emoji é a voz das pessoas, não ícone).

const P = (d: string) => `<path d="${d}"/>`;
const C = (cx: number, cy: number, r: number, cheio = false) => `<circle cx="${cx}" cy="${cy}" r="${r}"${cheio ? ' fill="currentColor" stroke="none"' : ""}/>`;
const R = (x: number, y: number, w: number, h: number, rx = 1.5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;

export const ICONES = {
  trofeu: P("M8 21h8M12 16v5M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"),
  bola: C(12, 12, 9) + P("M12 7.5l4 2.9-1.5 4.6h-5L8 10.4zM12 3v4.5M16 10.4l4.3-1.4M14.5 15l2.6 3.7M9.5 15l-2.6 3.7M8 10.4L3.7 9"),
  estrela: P("M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"),
  brilho: P("M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16v4M17 18h4"),
  coracao: P("M12 20s-7.5-4.5-9.2-9.4A4.9 4.9 0 0 1 12 7.4a4.9 4.9 0 0 1 9.2 3.2C19.5 15.5 12 20 12 20z"),
  fogo: P("M12 3c.8 3.3 5 5.2 5 10a5 5 0 0 1-10 0c0-2.2 1-3.7 2.2-4.8.1 1.9.9 3 2 3.3-.4-3.2.1-5.8.8-8.5z"),
  microfone: R(9, 3, 6, 11, 3) + P("M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"),
  estadio: P("M3 9c0-1.9 4-3.5 9-3.5S21 7.1 21 9v6.5c0 1.9-4 3.5-9 3.5s-9-1.6-9-3.5zM3 9c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5M12 12.5V19"),
  dinheiro: R(3, 6, 18, 12) + C(12, 12, 2.6) + P("M6.5 9.5h.01M17.5 14.5h.01"),
  camisa: P("M8 3.5L4 6.5l2 3.8 2-1V20.5h8V9.3l2 1 2-3.8-4-3h-1.8a2.2 2.2 0 0 1-4.4 0z"),
  aviao: P("M21 15.5v-2l-8-5V4a1.5 1.5 0 0 0-3 0v4.5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-4.5z"),
  controle: P("M7 8.5h10a4.5 4.5 0 0 1 4.4 5.4l-.6 3a2 2 0 0 1-3.5.9L15 15H9l-2.3 2.8a2 2 0 0 1-3.5-.9l-.6-3A4.5 4.5 0 0 1 7 8.5zM7.5 11.5v3M6 13h3M15.5 12.5h.01M17.5 14h.01"),
  prancheta: R(5, 4.5, 14, 16.5) + P("M9 4.5V3h6v1.5M8.5 10h7M8.5 13.5h7M8.5 17h4"),
  sobe: P("M3 17l6-6 4 4 8-8M15 7h6v6"),
  desce: P("M3 7l6 6 4-4 8 8M15 17h6v-6"),
  check: P("M5 12.5l4.5 4.5L19 7"),
  bebe: C(8, 19, 1.6) + C(17, 19, 1.6) + P("M2.5 5H5l2 8.5h11.5a4.5 4.5 0 0 0-4.5-8.5h-2.5v8.5"),
  crianca: C(12, 6.5, 3) + P("M7 21v-5a5 5 0 0 1 10 0v5"),
  pessoa: C(12, 8, 4) + P("M4.5 21a7.5 7.5 0 0 1 15 0"),
  pessoas: C(9, 8, 3.5) + P("M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.6.9 2.6 2.6 3 5.2"),
  chuteira: P("M3 15.5V7.5h5l2.2 3.2h3.6c4.4 0 7.2 1.6 7.2 4.1v.7zM6 19v-3.5M10 19v-3.5M14 19v-3.5M18 19v-3.5"),
  curativo: P("M4.2 13.8l9.6-9.6a3 3 0 0 1 4.2 0l1.8 1.8a3 3 0 0 1 0 4.2l-9.6 9.6a3 3 0 0 1-4.2 0l-1.8-1.8a3 3 0 0 1 0-4.2zM10.5 10.5h.01M13.5 13.5h.01M12 12h.01"),
  espadas: P("M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5L13 3h3v3l-3.5 3.5M5 14l-2 2 3 3 2-2"),
  megafone: P("M3 10v4h3.5l9 5V5l-9 5zM18.5 9a4.2 4.2 0 0 1 0 6M6.5 14l1 5h3l-1-4"),
  maleta: R(3, 7, 18, 13) + P("M8.5 7V5h7v2M3 12.5h18"),
  carro: P("M4 16.5h16v-4l-2.2-5H6.2L4 12.5zM4 12.5h16") + C(7.5, 16.5, 1.8) + C(16.5, 16.5, 1.8),
  barco: P("M3 15h18l-3 5H6zM12 3v12M12 4.5l6 8.5h-6"),
  celular: R(7, 2.5, 10, 19, 2) + P("M11 18.5h2"),
  cartaoV: `<rect x="7" y="3.5" width="10" height="15" rx="1.2" fill="#E5534B" stroke="none" transform="rotate(8 12 11)"/>`,
  cartaoA: `<rect x="7" y="3.5" width="10" height="15" rx="1.2" fill="#F2C230" stroke="none" transform="rotate(8 12 11)"/>`,
  broto: P("M12 21v-9M12 12c0-4.2 3-6.5 7-6.5 0 4.2-3 6.5-7 6.5zM12 14.5c0-3.2-2.6-5.2-6-5.2 0 3.2 2.6 5.2 6 5.2z"),
  acordo: P("M2.5 11.5l4-4 4.5 2 2.5-1.2M21.5 11.5l-4-4-5 2.5-2.5 2.5a1.4 1.4 0 0 0 2 2l2.5-2 4.5 4M6.5 14.5l2 2M9 17l1.5 1.5M17.5 14.5l-3 3"),
  casa: P("M4 11l8-7 8 7v9.5H4zM10 20.5V15h4v5.5"),
  raio: P("M13 2.5L4.5 14H11l-1 7.5L18.5 10H12z"),
  gelo: P("M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"),
  duvida: C(12, 12, 9) + P("M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.4") + C(12, 17, 0.6, true),
  dado: R(4, 4, 16, 16, 2.5) + C(9, 9, 1.1, true) + C(15, 15, 1.1, true) + C(12, 12, 1.1, true),
  cidade: P("M3 21h18M5 21V9.5h5V21M10 21V4h7v17M17 21v-8h3v8M12.5 8h2M12.5 11.5h2M12.5 15h2"),
  obra: P("M4 21V5.5L16 3.5v4M4 7.5h16M16 7.5v3.5M14 11h4v3h-4zM2 21h8"),
  filme: R(3, 8, 18, 12, 1) + P("M3 8l2.2-4h13.6L16.6 8M8.5 4l-1.6 4M13.5 4l-1.6 4"),
  camera: R(3, 7, 18, 13) + P("M8 7l2-3h4l2 3") + C(12, 13.5, 3.5),
  folha: P("M5 19c0-8 6-14 15-14 0 9-6 15-14 15zM5 19l7-7"),
  fala: P("M4 5h16v11H9.5L4 20z"),
  alvo: C(12, 12, 9) + C(12, 12, 5) + C(12, 12, 1.2, true),
  grafico: P("M4 20V11M10 20V4.5M16 20v-7M2 20.5h20"),
  lua: P("M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"),
  jornal: P("M4 5h12.5v14a1.5 1.5 0 0 0 1.5 1.5H5.5A1.5 1.5 0 0 1 4 19zM16.5 9H20v10a1.5 1.5 0 0 1-3 0M7 9h6.5M7 12.5h6.5M7 16h4"),
  balanca: P("M12 3.5v17M7 20.5h10M5 7h14M5 7l-3 6.5a3 3 0 0 0 6 0zM19 7l-3 6.5a3 3 0 0 0 6 0z"),
  documento: P("M6 3h9l4 4v14H6zM14.5 3v4.5H19M9 12.5h6M9 16.5h6"),
  mapa: P("M3 6.5l6-2 6 2 6-2V18l-6 2-6-2-6 2zM9 4.5V18M15 6.5V20"),
  palmeira: P("M12.5 21c0-4.5.3-8.5.8-11.5M13.3 9.5C12 6.5 9 5.5 5 6.5c2.2.2 4.3 1.6 5.4 3.4M13.3 9.5c1.2-3 4.2-4 7.7-3-2.2.4-4.3 1.9-5.4 3.5M13.3 9.5c-3-.8-6 .4-8 3.3M13.3 9.5c3-.6 6 .6 7.2 3.4M4 21h16"),
  anzol: P("M14 3v11a4.5 4.5 0 0 1-9 0v-1.5l3 2.5M14 3l3 3"),
  caneta: P("M4 20l4.2-1 11-11a2.1 2.1 0 0 0-3-3l-11 11zM14.5 6.5l3 3"),
  calendario: R(4, 5, 16, 15, 1) + P("M4 10h16M9 3v4M15 3v4"),
  banco: P("M3 11h18M5 11v8M19 11v8M3 7h18M6 7V5M18 7V5"),
  bateria: R(3, 7, 16, 10) + P("M21.5 10.5v3M6.5 10v4M9.5 10v4"),
  alerta: P("M12 4l9.5 16.5h-19zM12 10v4.5") + C(12, 17.5, 0.6, true),
  mais: P("M12 5v14M5 12h14"),
  haltere: P("M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"),
  escudo: P("M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"),
  ancora: C(12, 5, 2) + P("M12 7v14M5 13a7 7 0 0 0 14 0M8.5 11h7"),
  globo: C(12, 12, 9) + P("M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"),
  carta: R(3, 5, 18, 14) + P("M3.5 6.5l8.5 6 8.5-6"),
  formatura: P("M2 9.5l10-5 10 5-10 5zM6 11.5V16c3 2.2 9 2.2 12 0v-4.5M22 9.5V14"),
  medalha: C(12, 15, 5) + P("M8 3l2.5 7.3M16 3l-2.5 7.3M8 3h8"),
  musica: P("M9 18V5.5l11-2V16") + C(6, 18, 3) + C(17, 16, 3),
  chave: C(8, 15, 4) + P("M11 12l9-9M16.5 6.5l3 3"),
  vento: P("M3 8.5h11a3 3 0 1 0-3-3M3 12.5h16a3 3 0 1 1-3 3M3 16.5h7"),
  pino: P("M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z") + C(12, 10, 2.5),
  festa: P("M4 20.5L8.5 8l7.5 7.5zM14 3.5v2.5M18.5 9h2.5M16.5 6l2-2M11 9.5c.5-2 2-3 4-3"),
  porta: P("M6 21V3h11v18M3 21h18M14 12h.01"),
  sirene: P("M7 18v-5.5a5 5 0 0 1 10 0V18M5 21h14v-3H5zM12 3v2M4.5 7l1.5 1M19.5 7L18 8"),
  ideia: P("M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"),
  sol: C(12, 12, 4) + P("M12 2.5v2M12 19.5v2M4.5 4.5L6 6M18 18l1.5 1.5M2.5 12h2M19.5 12h2M4.5 19.5L6 18M18 6l1.5-1.5"),
  ampulheta: P("M7 3h10M7 21h10M8 3c0 4.5 8 5 8 9s-8 4.5-8 9M16 3c0 4.5-8 5-8 9s8 4.5 8 9"),
  repetir: P("M4 9h13l-3-3M20 15H7l3 3"),
  joia: P("M12 4v-1M12 21l-8-10 3-5h10l3 5zM4 11h16M9.5 6l2.5 15 2.5-15"),
  lupa: C(11, 11, 6) + P("M20 20l-4.5-4.5"),
  sacola: P("M5 8h14l-1 13H6zM9 8V6.5a3 3 0 0 1 6 0V8"),
  talheres: P("M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1-3.2 4-3.2 8H17"),
  quadro: R(3, 4, 18, 16, 1) + P("M3 16l5-5 4 4 3-3 6 6") + C(15.5, 8.5, 1.5),
  bandeira: P("M6 21V3.5l11 4-11 4"),
  peao: C(12, 6.5, 2.5) + P("M9.5 10.5h5l1 5.5h-7zM7 21h10l-1-5H8z"),
  flor: C(12, 8, 4) + P("M12 12v9M12 17.5c-2 0-4-1-5-3M12 15.5c2 0 4-1 5-3"),
  polegarCima: P("M7 11v9.5H3.5V11zM7 11l4-8a2.2 2.2 0 0 1 2.2 2.2V9h5.4a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.4 20H7"),
  polegarBaixo: `<g transform="rotate(180 12 12)">${P("M7 11v9.5H3.5V11zM7 11l4-8a2.2 2.2 0 0 1 2.2 2.2V9h5.4a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.4 20H7")}</g>`,
  rostoBom: C(12, 12, 9) + P("M8 14.5a4.5 4.5 0 0 0 8 0") + C(9, 10, 0.9, true) + C(15, 10, 0.9, true),
  rostoNeutro: C(12, 12, 9) + P("M8.5 15h7") + C(9, 10, 0.9, true) + C(15, 10, 0.9, true),
  rostoRuim: C(12, 12, 9) + P("M8 16.5a4.5 4.5 0 0 1 8 0") + C(9, 10, 0.9, true) + C(15, 10, 0.9, true),
  capitao: C(12, 12, 9) + P("M15 9.2a4 4 0 1 0 0 5.6"),
  play: `<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>`,
  lados: P("M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"),
  osso: P("M7 4.5a2 2 0 0 0-3 2.6 2 2 0 0 0 1.9 3.2L13.7 18a2 2 0 0 0 3.2 1.9 2 2 0 0 0 2.6-3 2 2 0 0 0-1.4-3.4L10.3 5.9A2 2 0 0 0 7 4.5z"),
} as const;
export type NomeIcone = keyof typeof ICONES;

/** Ícone de linha pronto para pôr no HTML (herda a cor e o tamanho do texto). */
export const ico = (nome: NomeIcone, rotulo?: string) =>
  `<svg class="ico ico-${nome}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${rotulo ? ` role="img" aria-label="${rotulo}"` : ' aria-hidden="true"'}>${ICONES[nome]}</svg>`;

/** Que ícone substitui cada emoji da interface. */
const DE_EMOJI: Record<string, NomeIcone> = {
  "🏆": "trofeu", "⚽": "bola", "⭐": "estrela", "🌟": "brilho", "✨": "brilho", "❤": "coracao", "♥": "coracao", "💛": "coracao", "💞": "coracao", "💕": "coracao", "🥰": "coracao",
  "🔥": "fogo", "🎤": "microfone", "🎙": "microfone", "🏟": "estadio", "💰": "dinheiro", "💵": "dinheiro", "💸": "dinheiro", "👕": "camisa", "🎽": "camisa", "🧴": "camisa",
  "✈": "aviao", "🎮": "controle", "📋": "prancheta", "📈": "sobe", "📉": "desce", "✅": "check", "🍼": "bebe", "👶": "bebe", "🧒": "crianca", "👦": "crianca", "👧": "crianca",
  "👵": "pessoa", "🧓": "pessoa", "👴": "pessoa", "👨": "pessoas", "👩": "pessoas", "👥": "pessoas", "👟": "chuteira", "🥾": "chuteira", "🩹": "curativo", "🦴": "osso", "⚔": "espadas",
  "📣": "megafone", "💼": "maleta", "🧳": "maleta", "🏎": "carro", "🚗": "carro", "🚙": "carro", "🏁": "bandeira", "🛥": "barco", "📱": "celular", "🟥": "cartaoV", "🟨": "cartaoA",
  "🌱": "broto", "🤝": "acordo", "🤙": "acordo", "🏠": "casa", "🏡": "casa", "🏫": "casa", "⚡": "raio", "🧊": "gelo", "❄": "gelo", "❔": "duvida", "❓": "duvida", "🎲": "dado",
  "🏙": "cidade", "🏗": "obra", "🎬": "filme", "📸": "camera", "🕊": "folha", "🗣": "fala", "💬": "fala", "🎯": "alvo", "📊": "grafico", "🌙": "lua", "📰": "jornal",
  "⚖": "balanca", "📄": "documento", "🗺": "mapa", "🌍": "globo", "🌎": "globo", "🌏": "globo", "🌴": "palmeira", "🏝": "palmeira", "🏖": "palmeira", "🎣": "anzol", "✍": "caneta", "✎": "caneta",
  "📅": "calendario", "🗓": "calendario", "🪑": "banco", "🔋": "bateria", "⚠": "alerta", "✚": "mais", "💪": "haltere", "🛡": "escudo", "⚓": "ancora", "✉": "carta", "📩": "carta",
  "📨": "carta", "🎓": "formatura", "🥇": "medalha", "🏅": "medalha", "📿": "joia", "💎": "joia", "🎵": "musica", "🎶": "musica", "🪩": "musica", "🔑": "chave", "💨": "vento",
  "📍": "pino", "🎉": "festa", "🎈": "festa", "🚪": "porta", "🚨": "sirene", "🧠": "ideia", "☀": "sol", "⏳": "ampulheta", "⌛": "ampulheta", "🔁": "repetir", "🧐": "lupa",
  "🛍": "sacola", "🍝": "talheres", "🍲": "talheres", "🍖": "talheres", "🍹": "talheres", "🖼": "quadro", "⛳": "bandeira", "♟": "peao", "🌹": "flor", "👍": "polegarCima",
  "👎": "polegarBaixo", "🅒": "capitao", "😄": "rostoBom", "😊": "rostoBom", "😍": "rostoBom", "🙂": "rostoBom", "😌": "rostoBom", "😂": "rostoBom", "🥹": "rostoBom",
  "😐": "rostoNeutro", "😅": "rostoNeutro", "😏": "rostoNeutro", "🤔": "rostoNeutro", "😠": "rostoRuim", "😕": "rostoRuim", "😒": "rostoRuim", "😤": "rostoRuim",
  "😰": "rostoRuim", "🥺": "rostoRuim", "😢": "rostoRuim", "💔": "rostoRuim", "😈": "fogo", "🙏": "acordo", "↔": "lados", "▶": "play",
};
// emoji (com seletor de variação e sequências unidas por ZWJ, como famílias)
const PADRAO = /(?:[\u2190-\u21FF\u25B6]\uFE0F|[\u{1F000}-\u{1FAFF}]|[⌀-⏿☀-➿⭐⭕])️?(?:‍(?:[\u{1F000}-\u{1FAFF}]|[☀-➿])️?)*/gu;
// sinais tipográficos que continuam como texto (estrelas de nota, setas, xis, visto)
const TEXTO = new Set(["★", "☆", "✓", "✔", "✕", "✖", "✗", "☰", "⚬"]);
/** Onde o emoji é a fala das pessoas e fica como está. */
const MANTER = ".bolha, .post, .midia-post, .mp-f, .comentarios, .comentario, .chat-texto, [data-emoji], textarea, input";

const icoDe = (e: string): NomeIcone | undefined => DE_EMOJI[[...e.replace(/️/g, "")][0]];
const temEmoji = (t: string) => (t.match(PADRAO) ?? []).some((m) => !TEXTO.has(m));
const limpo = (t: string) => t.replace(PADRAO, (m) => (TEXTO.has(m) ? m : "")).replace(/\s{2,}/g, " ");

function trocarTexto(no: Text) {
  const pai = no.parentElement;
  if (!pai || pai.closest(MANTER)) return;
  const t = no.data;
  if (!temEmoji(t)) return;
  // dentro de SVG, em <option> e em <title> não cabe ícone: o emoji só sai
  if (pai.namespaceURI === "http://www.w3.org/2000/svg" || pai.closest("option, title, select")) { const l = limpo(t); if (l !== t) no.data = l; return; }
  const frag = document.createDocumentFragment();
  let ult = 0;
  PADRAO.lastIndex = 0;
  for (let m = PADRAO.exec(t); m; m = PADRAO.exec(t)) {
    if (TEXTO.has(m[0])) continue;
    if (m.index > ult) frag.append(t.slice(ult, m.index));
    const nome = icoDe(m[0]);
    if (nome) {
      const tmp = document.createElement("span");
      tmp.innerHTML = ico(nome);
      frag.append(tmp.firstChild!);
    }
    ult = m.index + m[0].length;
  }
  if (ult < t.length) frag.append(t.slice(ult));
  no.replaceWith(frag);
}
function varrer(raiz: Node) {
  if (raiz.nodeType === 3) { trocarTexto(raiz as Text); return; }
  if (raiz.nodeType !== 1) return;
  const el = raiz as Element;
  if (el.closest?.(MANTER)) return;
  const textos: Text[] = [];
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (temEmoji((n as Text).data)) textos.push(n as Text);
  textos.forEach(trocarTexto);
  for (const a of el.querySelectorAll("[title], [aria-label]")) for (const at of ["title", "aria-label"]) { const v = a.getAttribute(at); if (v && temEmoji(v)) a.setAttribute(at, limpo(v).trim()); }
}

let instalado = false;
/** Liga a troca automática de emoji por ícones em toda a página. */
export function instalarIcones() {
  if (instalado || typeof MutationObserver === "undefined") return;
  instalado = true;
  varrer(document.body);
  new MutationObserver((ms) => { for (const m of ms) { if (m.type === "characterData") varrer(m.target); else m.addedNodes.forEach(varrer); } })
    .observe(document.body, { childList: true, subtree: true, characterData: true });
}
