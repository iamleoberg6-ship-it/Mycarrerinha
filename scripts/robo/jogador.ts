// Robô do modo jogador: joga uma carreira inteira no automático e devolve, temporada a temporada, os números que
// importam para o equilíbrio (OVR, salário, saldo, fama, lesões, clube, liga...) e uma foto do mundo (força média
// das ligas). Uso: tsx scripts/robo/jogador.ts <caso> <temporadas>  → imprime um JSON na última linha.
import { carregarPacote } from "../../src/pacote.js";
import { criarJogador, type EscolhasCriacao } from "../../src/dna.js";
import { novoJogo, ofertasDeBase, semanaAutomatica, ovr, anunciarAposentadoria, SEMANAS_TEMPORADA } from "../../src/jogo.js";
import { mundo } from "../../src/mundo.js";
import { infoLiga } from "../../src/ligas.js";
import { CASOS_JOGADOR } from "./casos.js";
import { fotoMundo, varrerNumeros } from "./comum.js";

const pacote = carregarPacote(new URL("../../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const i = Number(process.argv[2] ?? 0), maxT = Number(process.argv[3] ?? 22);
const caso = CASOS_JOGADOR[i];
const e = { nome: caso.nome, pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "MEI", semente: `robo-j${i}`, ...caso.escolhas } as EscolhasCriacao;
const r = criarJogador(e);
const dados = { resultado: r, aparencia: {}, clube: caso.clubeCoracao ?? null };
const of = ofertasDeBase(pacote, dados);
const s = novoJogo(pacote, dados, of[0].clubeId, `robo-j${i}`);
const w = mundo(pacote);
const inicioMundo = fotoMundo(w);
const temporadas: Record<string, unknown>[] = [], erros: string[] = [];
let lesaoSem = 0, semanas = 0, pico = 0;
const t0 = Date.now();
for (let t = 0; t < maxT && !s.carreira.encerrada; t++) {
  const ini = Date.now(); lesaoSem = 0; const clubes = new Set<string>();
  // como um jogador de verdade: pendura as chuteiras quando o corpo pede (35+ e bem abaixo do auge) ou aos 37
  pico = Math.max(pico, ovr(s.jogador));
  if (!s.carreira.aposentadoria && !s.carreira.fase && (s.jogador.idade >= 37 || (s.jogador.idade >= 35 && ovr(s.jogador) <= pico - 6))) anunciarAposentadoria(s);
  for (let k = 0; k < SEMANAS_TEMPORADA && !s.carreira.encerrada; k++) {
    try { semanaAutomatica(pacote, s); } catch (err) { erros.push(`T${t} S${k}: ${(err as Error).message}`); if (erros.length > 5) break; }
    semanas++; if (s.carreira.lesao > 0) lesaoSem++; clubes.add(s.carreira.clubeId);
  }
  if (erros.length > 5) break;
  const c = s.carreira, h = c.historico.filter((x) => !x.parcial).at(-1) ?? c.historico.at(-1);
  const json = JSON.stringify(s);
  temporadas.push({
    t, idade: s.jogador.idade, ovr: Math.round(ovr(s.jogador)), pot: s.jogador.pot,
    clube: w.info[c.clubeId]?.nome ?? c.clubeId, liga: infoLiga(c.ligaId ?? "BRA1").curto, trocas: clubes.size - 1,
    salario: c.salario, saldo: Math.round(s.casa.saldo), fama: Math.round(c.fama), seguidores: c.seguidores,
    moral: Math.round(c.moral), cansaco: Math.round(c.cansaco), torcida: Math.round(c.torcida ?? 50), semanasLesao: lesaoSem,
    jogos: h?.jogos ?? 0, gols: h?.gols ?? 0, nota: h?.nota ?? 0, titulo: !!h?.titulo, premios: h?.premios?.length ?? 0,
    selecao: c.selecao?.jogos ?? 0, patroMes: (c.patrocinios ?? []).reduce((a, k) => a + k.mensal, 0), carros: s.casa.carros?.length ?? 0, patrocinios: c.patrocinios?.length ?? 0,
    saveKB: Math.round(json.length / 1024), seg: +((Date.now() - ini) / 1000).toFixed(1),
  });
  for (const p of varrerNumeros(s)) erros.push(`T${t}: número estranho em ${p}`);
}
console.log(JSON.stringify({
  modo: "jogador", caso: caso.nome, descricao: caso.descricao, potencial: r.potencial, primeiroClube: w.info[of[0].clubeId]?.nome,
  aposentou: s.carreira.encerrada ? s.jogador.idade : undefined, temporadas, erros: [...new Set(erros)].slice(0, 20),
  mundoInicio: inicioMundo, mundoFim: fotoMundo(w), segundos: Math.round((Date.now() - t0) / 1000), semanas,
}));
