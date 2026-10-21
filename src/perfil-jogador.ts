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
export interface Temporada { ano: number; idade: number; clube: string; clubeId?: string; liga?: string; ovr: number; jogos: number; gols: number; assist: number; nota: number; posicao: number; titulo: boolean; premios?: string[]; est?: EstatEstimada }
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
  const jogos = hist.reduce((a, h) => a + h.jogos, 0), gols = hist.reduce((a, h) => a + h.gols, 0), assist = hist.reduce((a, h) => a + h.assist, 0);
  const nota = jogos ? hist.reduce((a, h) => a + h.nota * h.jogos, 0) / jogos : 0;
  const comEst = hist.filter((h) => h.est && h.jogos);
  const pj = comEst.reduce((a, h) => a + h.jogos, 0);
  const est = pj ? { passe: Math.round(comEst.reduce((a, h) => a + h.est!.passe * h.jogos, 0) / pj), chute: Math.round(comEst.reduce((a, h) => a + h.est!.chute * h.jogos, 0) / pj), drible: +(comEst.reduce((a, h) => a + h.est!.drible * h.jogos, 0) / pj).toFixed(1), desarme: +(comEst.reduce((a, h) => a + h.est!.desarme * h.jogos, 0) / pj).toFixed(1) } : undefined;
  const titulos = hist.filter((h) => h.titulo).map((h) => ({ ano: h.ano, nome: `Campeão${h.liga ? ` da ${h.liga}` : ""}`, clube: h.clube }));
  const premios = hist.flatMap((h) => (h.premios ?? []).filter((p) => !/campe/i.test(p)).map((p) => ({ ano: h.ano, nome: p.replace(/\s\d{4}$/, ""), clube: h.clube })));
  return { jogos, gols, assist, nota, est, titulos, premios, temporadas: hist.length };
}
