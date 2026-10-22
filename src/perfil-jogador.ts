// Perfil do jogador (estilo Football Manager): números da carreira, estatísticas estimadas pelo scout,
// reputação, estilo de jogo, personalidade, pontos fortes e fracos, clubes e conquistas.
import type { Atributo, Atributos, Posicao } from "./atributos.js";
import { RNG, clamp } from "./rng.js";

// ------------------------------------------------------------------ estatísticas estimadas
export interface EstatEstimada { passe: number; chute: number; drible: number; desarme: number }
/** O que os números de jogo mostrariam com esses atributos (com uma variação da temporada). */
export function estatisticasEstimadas(at: Atributos, pos: Posicao, semente: string): EstatEstimada {
  const r = new RNG(`estat|${semente}`), v = (d: number) => r.range(-d, d);
  const recuado = pos === "ZAG" || pos === "VOL" ? 3 : pos === "LAT" ? 1 : pos === "ATA" ? -5 : 0;
  return {
    passe: clamp(Math.round(62 + (at.PAS - 50) * 0.42 + (at.VIS - 50) * 0.08 + recuado + v(2.5)), 55, 95),
    chute: clamp(Math.round(30 + (at.FIN - 50) * 0.5 + (at.COM - 50) * 0.12 + v(4)), 15, 72),
    drible: clamp(Math.round((0.4 + (at.DRI - 40) * 0.045 + (pos === "PON" ? 0.8 : pos === "MEI" || pos === "ATA" ? 0.3 : -0.3) + v(0.3)) * 10) / 10, 0.1, 5),
    desarme: clamp(Math.round((0.6 + (at.MAR - 40) * 0.05 + (pos === "ZAG" || pos === "VOL" ? 0.9 : pos === "LAT" ? 0.6 : -0.3) + v(0.3)) * 10) / 10, 0.1, 5),
  };
}

// ------------------------------------------------------------------ rótulos
export function rotuloFama(fama: number): string {
  return fama >= 90 ? "Estrela mundial" : fama >= 75 ? "Conhecido no mundo todo" : fama >= 55 ? "Famoso no continente" : fama >= 35 ? "Conhecido no país" : fama >= 15 ? "Conhecido na cidade" : "Desconhecido";
}
export function rotuloTorcida(t: number): string {
  return t >= 85 ? "Ídolo" : t >= 70 ? "Querido pela torcida" : t >= 55 ? "Bem visto" : t >= 40 ? "Neutro" : t >= 25 ? "Questionado" : "Vaiado";
}
export function rotuloTecnico(t: number): string {
  return t >= 80 ? "Homem de confiança" : t >= 60 ? "Boa relação" : t >= 40 ? "Relação normal" : t >= 25 ? "Relação estremecida" : "Em atrito";
}

const PERSONALIDADES: [string, (p: P) => boolean, string][] = [
  ["Modelo de profissional", (p) => p.profissionalismo >= 16 && p.ambicao >= 14, "Treina como se cada sessão fosse final. Exemplo para os mais novos."],
  ["Ambicioso", (p) => p.ambicao >= 16, "Quer jogar no maior palco possível e não esconde isso."],
  ["Profissional", (p) => p.profissionalismo >= 15, "Cuida do corpo, chega cedo e raramente decepciona."],
  ["Temperamental", (p) => p.temperamento >= 15, "Joga no limite. Às vezes passa dele."],
  ["Carismático", (p) => p.carisma >= 15, "Câmera gosta dele, vestiário também."],
  ["Displicente", (p) => p.profissionalismo <= 6, "Talento não falta. Disciplina, às vezes."],
  ["Tranquilo", (p) => p.temperamento <= 5, "Não perde a cabeça nem em clássico."],
];
type P = { profissionalismo: number; ambicao: number; temperamento: number; carisma: number };
export function personalidade(p: P): { nome: string; texto: string } {
  const a = PERSONALIDADES.find(([, f]) => f(p));
  return a ? { nome: a[0], texto: a[2] } : { nome: "Equilibrado", texto: "Sem extremos: não é problema nem destaque fora de campo." };
}

const FORTES: Record<Atributo, string> = {
  VEL: "Arranque que deixa o marcador para trás", RES: "Fôlego para os 90 minutos e mais", FOR: "Ganha quase toda dividida no corpo",
  PAS: "Passe limpo, raramente erra", CRU: "Cruzamento na medida para a área", DRI: "Drible curto em espaço apertado",
  FIN: "Finalização fria na cara do gol", CAB: "Forte no jogo aéreo", MAR: "Marcação colada, difícil de passar",
  VIS: "Enxerga o passe que ninguém vê", POS: "Sempre no lugar certo", COM: "Não treme em decisão",
};
const FRACOS: Record<Atributo, string> = {
  VEL: "Sofre contra atacantes rápidos", RES: "Cai de rendimento no segundo tempo", FOR: "Perde no corpo a corpo",
  PAS: "Erra passes simples sob pressão", CRU: "Cruzamentos sem direção", DRI: "Pouco recurso no um contra um",
  FIN: "Desperdiça chances claras", CAB: "Pouco jogo aéreo", MAR: "Marca de longe",
  VIS: "Joga de cabeça baixa", POS: "Se perde no posicionamento", COM: "Sente a pressão nos jogos grandes",
};
/** Atributos que importam para cada posição (os fracos só contam se pesarem na função). */
const IMPORTA: Record<Posicao, Atributo[]> = {
  ZAG: ["MAR", "CAB", "FOR", "POS", "VEL", "PAS", "COM"], LAT: ["VEL", "CRU", "MAR", "RES", "DRI", "PAS", "POS"],
  VOL: ["MAR", "PAS", "POS", "RES", "FOR", "VIS", "COM"], MEI: ["PAS", "VIS", "DRI", "FIN", "COM", "POS", "VEL"],
  PON: ["VEL", "DRI", "CRU", "FIN", "PAS", "COM", "RES"], ATA: ["FIN", "CAB", "COM", "VEL", "DRI", "FOR", "POS"],
};
export function pontos(at: Atributos, pos: Posicao): { fortes: string[]; fracos: string[] } {
  const lista = (Object.keys(at) as Atributo[]).sort((a, b) => at[b] - at[a]);
  const fortes = lista.slice(0, 3).map((a) => FORTES[a]);
  const fracos = [...IMPORTA[pos]].sort((a, b) => at[a] - at[b]).slice(0, 2).filter((a) => at[a] < lista.slice(0, 3).reduce((m, x) => Math.min(m, at[x]), 99) - 6).map((a) => FRACOS[a]);
  return { fortes, fracos };
}

export function estiloDeJogo(at: Atributos, pos: Posicao): { nome: string; texto: string } {
  const alto = (...a: Atributo[]) => a.every((x) => at[x] >= Math.max(...Object.values(at)) - 8);
  switch (pos) {
    case "ATA":
      if (alto("FIN", "CAB")) return { nome: "Centroavante de área", texto: "Vive dentro da área: cabeça, pé direito, pé esquerdo, rebote." };
      if (alto("VEL")) return { nome: "Atacante de velocidade", texto: "Ataca o espaço nas costas da zaga e decide no contra-ataque." };
      if (alto("DRI") || alto("VIS")) return { nome: "Falso 9", texto: "Sai da área para armar e aparece de surpresa para concluir." };
      return { nome: "Finalizador", texto: "Toca pouco na bola, mas quando toca é para o gol." };
    case "PON":
      if (alto("FIN")) return { nome: "Ponta artilheiro", texto: "Corta para dentro e bate no gol. Ponta que faz gol de centroavante." };
      if (alto("CRU")) return { nome: "Ponta clássico", texto: "Vai à linha de fundo e cruza na cabeça de quem chega." };
      return { nome: "Ponta driblador", texto: "Um contra um é com ele: chama o marcador e passa." };
    case "MEI":
      if (alto("VIS") || alto("PAS")) return { nome: "Armador criativo", texto: "Dita o ritmo e coloca o atacante na cara do gol." };
      if (alto("FIN")) return { nome: "Meia chegador", texto: "Aparece na área na hora certa: meia com número de atacante." };
      return { nome: "Meia driblador", texto: "Carrega a bola entre as linhas e desmonta a marcação." };
    case "VOL":
      if (alto("PAS", "VIS") || alto("PAS")) return { nome: "Volante construtor", texto: "Primeiro passe da saída de bola. Joga de cabeça erguida." };
      if (alto("RES")) return { nome: "Box-to-box", texto: "Defende na sua área e chega na do adversário." };
      return { nome: "Volante destruidor", texto: "Protege a zaga e quebra o jogo do adversário." };
    case "LAT":
      if (alto("MAR")) return { nome: "Lateral defensivo", texto: "Primeiro fecha o lado, depois pensa em apoiar." };
      return { nome: "Lateral ofensivo", texto: "Vira ponta quando o time ataca e volta voando." };
    case "ZAG":
      if (alto("PAS")) return { nome: "Zagueiro construtor", texto: "Sai jogando de trás e encontra o meia entre as linhas." };
      if (alto("VEL")) return { nome: "Zagueiro de cobertura", texto: "Corrige os erros dos outros com velocidade." };
      return { nome: "Zagueiro de imposição", texto: "Ganha pelo alto e pelo chão. Atacante sente o jogo." };
  }
}

// ------------------------------------------------------------------ carreira
export interface Temporada { ano: number; idade: number; clube: string; clubeId?: string; liga?: string; ovr: number; jogos: number; gols: number; assist: number; nota: number; posicao: number; titulo: boolean; premios?: string[]; est?: EstatEstimada; copa?: { nome: string; campeao: boolean; jogos: number; gols: number; assist: number } }
export interface ResumoClube { clube: string; clubeId?: string; de: number; ate: number; jogos: number; gols: number; assist: number; titulos: number }
export function clubesDaCarreira(hist: Temporada[]): ResumoClube[] {
  const out: ResumoClube[] = [];
  for (const h of hist) {
    if (!h.jogos && out.length && out[out.length - 1].clube === h.clube) { out[out.length - 1].ate = h.ano; continue; }
    const u = out[out.length - 1];
    if (u && u.clube === h.clube) { u.ate = h.ano; u.jogos += h.jogos; u.gols += h.gols; u.assist += h.assist; u.titulos += h.titulo ? 1 : 0; }
    else out.push({ clube: h.clube, clubeId: h.clubeId, de: h.ano, ate: h.ano, jogos: h.jogos, gols: h.gols, assist: h.assist, titulos: h.titulo ? 1 : 0 });
  }
  return out;
}
export function totaisDaCarreira(hist: Temporada[]) {
  // jogos de copa continental contam no total da carreira
  const jogos = hist.reduce((a, h) => a + h.jogos + (h.copa?.jogos ?? 0), 0), gols = hist.reduce((a, h) => a + h.gols + (h.copa?.gols ?? 0), 0), assist = hist.reduce((a, h) => a + h.assist + (h.copa?.assist ?? 0), 0);
  const nota = jogos ? hist.reduce((a, h) => a + h.nota * h.jogos, 0) / jogos : 0;
  const comEst = hist.filter((h) => h.est && h.jogos);
  const pj = comEst.reduce((a, h) => a + h.jogos, 0);
  const est = pj ? { passe: Math.round(comEst.reduce((a, h) => a + h.est!.passe * h.jogos, 0) / pj), chute: Math.round(comEst.reduce((a, h) => a + h.est!.chute * h.jogos, 0) / pj), drible: +(comEst.reduce((a, h) => a + h.est!.drible * h.jogos, 0) / pj).toFixed(1), desarme: +(comEst.reduce((a, h) => a + h.est!.desarme * h.jogos, 0) / pj).toFixed(1) } : undefined;
  const titulos = [...hist.filter((h) => h.titulo).map((h) => ({ ano: h.ano, nome: `Campeão${h.liga ? ` da ${h.liga}` : ""}`, clube: h.clube })),
    ...hist.filter((h) => h.copa?.campeao).map((h) => ({ ano: h.ano, nome: `Campeão da ${h.copa!.nome}`, clube: h.clube }))].sort((a, b) => a.ano - b.ano);
  const premios = hist.flatMap((h) => (h.premios ?? []).filter((p) => !/campe/i.test(p)).map((p) => ({ ano: h.ano, nome: p.replace(/\s\d{4}$/, ""), clube: h.clube })));
  return { jogos, gols, assist, nota, est, titulos, premios, temporadas: hist.length };
}

// ------------------------------------------------------------------ armário de troféus
export interface Trofeu { nome: string; modelo: string; cores: [string, string]; vezes: { ano: number; clube: string; liga?: string }[] }
const OURO: [string, string] = ["#E3B341", "#9A7420"], PRATA: [string, string] = ["#C9CCD1", "#7F8389"];
const TIPOS_TROFEU: [RegExp, string, string, [string, string]][] = [
  [/^Taça da Libertadora/, "Copa Libertadora", "taca", OURO],
  [/^Taça da Champions Asiática/, "Champions Asiática", "taca", OURO],
  [/^Taça da Champions/, "Champions Ligue", "taca", OURO],
  [/^Taça de campeão/, "Campeão da liga", "taca", OURO],
  [/^Artilheiro do sub-17/, "Artilheiro do sub-17", "chuteira", PRATA],
  [/^Craque do sub-17/, "Craque do sub-17", "bola", PRATA],
  [/^Artilheiro/, "Artilheiro", "chuteira", OURO],
  [/^Rei das assistências/, "Rei das assistências", "prato", OURO],
  [/^Craque do campeonato/, "Craque do campeonato", "bola", OURO],
  [/^Seleção do campeonato/, "Seleção do campeonato", "placa", OURO],
  [/^Revelação/, "Revelação", "estrela", OURO],
  [/^Melhor sub-21/, "Melhor sub-21", "estrela", PRATA],
  [/^Melhor contratação/, "Melhor contratação", "placa", PRATA],
];
export function armario(hist: Temporada[]): Trofeu[] {
  const mapa = new Map<string, Trofeu>();
  const add = (nome: string, modelo: string, cores: [string, string], h: Temporada) => {
    const t = mapa.get(nome) ?? { nome, modelo, cores, vezes: [] };
    if (!t.vezes.some((v) => v.ano === h.ano)) t.vezes.push({ ano: h.ano, clube: h.clube, liga: h.liga });
    mapa.set(nome, t);
  };
  for (const h of hist) {
    if (h.titulo) add("Campeão da liga", "taca", OURO, h);
    for (const p of h.premios ?? []) {
      const tipo = TIPOS_TROFEU.find(([re]) => re.test(p));
      if (tipo) add(tipo[1], tipo[2], tipo[3], h);
    }
  }
  const ordem = TIPOS_TROFEU.map((t) => t[1]);
  return [...mapa.values()].sort((a, b) => ordem.indexOf(a.nome) - ordem.indexOf(b.nome));
}

// ------------------------------------------------------------------ biografia
export interface DadosBio {
  nome: string; apelido: string; pais: string; posicao: string; idade: number; perfil: string;
  hist: Temporada[]; clubeAtual: string; fama: number; estilo: string; forte: string; traco?: string;
  idolo?: string; querido?: string; amigos: { nome: string; clube: string }[]; semente: string;
}
export function biografia(d: DadosBio): string {
  const r = new RNG(`bio|${d.semente}`);
  const pro = d.hist.filter((h) => h.jogos > 0);
  const t = totaisDaCarreira(d.hist), clubes = clubesDaCarreira(d.hist.filter((h) => h.jogos || h === d.hist[0]));
  const base = d.hist[0]?.clube ?? d.clubeAtual;
  const frases: string[] = [];
  frases.push(`${d.nome}, o ${d.apelido}, é ${d.posicao.toLowerCase()} nascido ${d.pais}. Começou na base do ${base}${d.perfil ? ` com fama de ${d.perfil.toLowerCase()}` : ""}.`);
  if (!pro.length) { frases.push(`Ainda sonha com a estreia no profissional e, aos ${d.idade} anos, já chama atenção pelo ${d.forte.charAt(0).toLowerCase() + d.forte.slice(1)}.`); return frases.join(" "); }
  const estreia = pro[0];
  frases.push(`Estreou como profissional em ${estreia.ano}, aos ${estreia.idade} anos, pelo ${estreia.clube}.`);
  if (clubes.length > 1) {
    const caminho = clubes.slice(1).map((k) => k.clube);
    frases.push(caminho.length === 1 ? `Depois foi para o ${caminho[0]}.` : `Rodou por ${caminho.slice(0, -1).map((c) => `${c}`).join(", ")} e ${caminho[caminho.length - 1]}.`);
  }
  const casa = [...clubes].sort((a, b) => b.jogos - a.jogos)[0];
  if (d.idolo) frases.push(`Virou ídolo no ${d.idolo}, onde a torcida canta o nome dele até hoje.`);
  else if (d.querido) frases.push(`Foi muito querido pela torcida do ${d.querido}.`);
  else if (casa && casa.jogos >= 40) frases.push(`Onde mais jogou foi no ${casa.clube}: ${casa.jogos} jogos e ${casa.gols} gols.`);
  const pico = [...pro].sort((a, b) => (b.titulo ? 10 : 0) + (b.premios?.length ?? 0) * 3 + b.gols + b.assist * 0.6 - ((a.titulo ? 10 : 0) + (a.premios?.length ?? 0) * 3 + a.gols + a.assist * 0.6))[0];
  if (pico) {
    const feitos = [pico.titulo ? `campeão${pico.liga ? ` da ${pico.liga}` : ""}` : "", pico.gols >= 10 ? `${pico.gols} gols` : "", pico.assist >= 8 ? `${pico.assist} assistências` : "", ...(pico.premios ?? []).filter((p) => !/campe/i.test(p)).slice(0, 2).map((p) => p.replace(/\s\d{4}$/, "").toLowerCase())].filter(Boolean);
    if (feitos.length) frases.push(`O ponto alto veio em ${pico.ano}, no ${pico.clube}: ${feitos.length > 1 ? feitos.slice(0, -1).join(", ") + " e " + feitos[feitos.length - 1] : feitos[0]}.`);
  }
  frases.push(`${r.pick(["É conhecido pelo", "Ficou marcado pelo", "Quem viu jogar lembra do"])} ${d.forte.charAt(0).toLowerCase() + d.forte.slice(1)}${d.traco ? `, com ${d.traco.toLowerCase()} como marca registrada` : ""}: um ${d.estilo.toLowerCase()} ${d.fama >= 75 ? "que o mundo inteiro conhece" : d.fama >= 45 ? "conhecido no país todo" : "ainda em busca do grande palco"}.`);
  if (d.amigos.length) frases.push(`No vestiário, ${d.amigos.length > 1 ? `os parceiros mais próximos foram ${d.amigos.map((a) => `${a.nome} (${a.clube})`).join(" e ")}` : `o parceiro mais próximo foi ${d.amigos[0].nome}, no ${d.amigos[0].clube}`}.`);
  frases.push(`Soma ${t.jogos} jogos, ${t.gols} gols e ${t.assist} assistências na carreira.`);
  return frases.join(" ");
}
