// Carreiras longas com mercado: clubes, ligas, agente, salário e transferências por temporada.
import { carregarPacote } from "../src/pacote.js";
import { criarJogador, type EscolhasCriacao } from "../src/dna.js";
import { novoJogo, ofertasDeBase, semanaAutomatica, ovr, SEMANAS_TEMPORADA } from "../src/jogo.js";
import { mundo, LIGA_INFO } from "../src/mundo.js";

const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const T = Number(process.argv[2] ?? 12), w = mundo(pacote);
const casos: Partial<EscolhasCriacao>[] = [
  { posicao: "ATA", familia: "humilde", formacao: "rua" }, { posicao: "MEI", familia: "media", formacao: "base_grande" },
  { posicao: "ZAG", familia: "rica", formacao: "academia" }, { posicao: "PON", familia: "humilde", formacao: "futsal" },
  { posicao: "VOL", familia: "media", formacao: "escolinha" }, { posicao: "LAT", familia: "humilde", formacao: "rua" },
];
for (const [i, cso] of casos.entries()) {
  const e = { nome: `Mer ${i}`, pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "MEI", ...cso, semente: `mer${i}` } as EscolhasCriacao;
  const dados = { resultado: criarJogador(e), aparencia: {}, clube: "FLA" };
  const s = novoJogo(pacote, dados, ofertasDeBase(pacote, dados)[0].clubeId, `mer${i}`);
  console.log(`\n${e.posicao} pot ${dados.resultado.potencial}`);
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < SEMANAS_TEMPORADA; k++) semanaAutomatica(pacote, s);
    const h = s.carreira.historico.at(-1)!, c = s.carreira;
    const tr = (c.mercado?.transferencias ?? []).filter((x) => x.temporada === t).map((x) => `${x.tipo}:${w.clube[x.de].nome}→${w.clube[x.para].nome}${x.taxa ? ` €${(x.taxa / 1e6).toFixed(1)}mi` : ""}`);
    console.log(`  ${h.ano} ${h.idade}a OVR ${h.ovr} | ${h.clube} (${LIGA_INFO[w.info[c.clubeId].ligaId].curto} agora: ${w.clube[c.clubeId].nome}) | ${h.jogos}j ${h.gols}g ${h.nota} | ${c.agente} | R$ ${c.salario.toLocaleString("pt-BR")} ${c.anosContrato}a | ${tr.join("; ")}${h.premios?.length ? " | " + h.premios.join(", ") : ""}`);
  }
}
