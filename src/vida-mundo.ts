// Notícias da vida dos outros jogadores do mundo, sem o jogador da carreira: uma por temporada, sorteada pela semente e
// pela temporada (a mesma em todo save com a mesma semente). Usa a vida fora do campo de cada um (src/vida-npc.ts).
import { RNG } from "./rng.js";
import { vidaDe } from "./vida-npc.js";

export interface JogadorDoMundo { nome: string; idade: number; clubeNome: string; clubeId: string }
export interface NoticiaVidaMundo { tipo: "vida" | "polemica"; titulo: string; texto: string }

/** Quatro a cinco histórias da temporada, de jogadores escolhidos ao acaso no mundo. */
export function noticiasDaVidaDoMundo(rng: RNG, jogadores: JogadorDoMundo[], porClube: Map<string, JogadorDoMundo[]>): NoticiaVidaMundo[] {
  const out: NoticiaVidaMundo[] = [];
  if (!jogadores.length) return out;
  const alvo = rng.int(4, 5);
  const usados = new Set<string>();
  for (let tentativa = 0; out.length < alvo && tentativa < 40; tentativa++) {
    const j = rng.pick(jogadores);
    if (usados.has(j.nome)) continue;
    usados.add(j.nome);
    const v = vidaDe(j.nome, j.idade), primeiro = j.nome.split(" ")[0];
    const tipo = rng.int(0, 9);
    if (tipo === 0 && v.familia[0]?.startsWith("Namora firme")) {
      out.push({ tipo: "vida", titulo: "Pedido de casamento", texto: `${primeiro} pediu a namorada em casamento num jantar fora de casa. Ela aceitou.` });
    } else if (tipo <= 2) {
      out.push({ tipo: "vida", titulo: "Sonho declarado", texto: `${primeiro}, do ${j.clubeNome}, disse que um dia quer ${v.sonho}.` });
    } else if (tipo === 3) {
      out.push({ tipo: "vida", titulo: "De volta ao bairro", texto: `${primeiro} voltou ao bairro onde cresceu e visitou a escolinha que o formou.` });
    } else if (tipo === 4) {
      out.push({ tipo: "vida", titulo: "Hobby fora do campo", texto: `${primeiro} apareceu numa competição de ${v.hobby} e surpreendeu os amigos.` });
    } else if (tipo === 5) {
      out.push({ tipo: "vida", titulo: "Doação", texto: `${primeiro} doou uniformes e bolas para a escolinha do bairro onde cresceu.` });
    } else if (tipo === 6) {
      out.push({ tipo: "vida", titulo: "Mudança", texto: `${primeiro} se mudou com a família para uma casa maior, perto do ${j.clubeNome}.` });
    } else if (tipo === 7 || tipo === 8) {
      // dois companheiros do mesmo clube: briga ou amizade
      const elenco = (porClube.get(j.clubeId) ?? []).filter((x) => x.nome !== j.nome);
      if (!elenco.length) continue;
      const outro = rng.pick(elenco), o = outro.nome.split(" ")[0];
      usados.add(outro.nome);
      if (tipo === 7) out.push({ tipo: "polemica", titulo: "Clima pesado", texto: `${primeiro} e ${o} discutiram no treino do ${j.clubeNome}. Os companheiros tiveram que separar.` });
      else out.push({ tipo: "vida", titulo: "Amizade de elenco", texto: `${primeiro} e ${o}, companheiros no ${j.clubeNome}, seguem amigos fora do campo e dividem as viagens.` });
    } else {
      if (rng.chance(0.5)) out.push({ tipo: "polemica", titulo: "Processo", texto: `${primeiro} responde a um processo por uma dívida antiga com uma imobiliária.` });
      else out.push({ tipo: "vida", titulo: "Família", texto: `${primeiro} levou a família inteira ao estádio pela primeira vez na temporada.` });
    }
  }
  return out;
}
