// Carreira dos 16 aos 40: seguidores, salário, saldo e de onde vêm as propostas.
import { carregarPacote } from "../src/pacote.js";
import { criarJogador } from "../src/dna.js";
import { novoJogo, ofertasDeBase, semanaAutomatica, ovr, SEMANAS_TEMPORADA } from "../src/jogo.js";
import { mercadoDe } from "../src/transferencias.js";
import { mundo } from "../src/mundo.js";
import { infoLiga } from "../src/ligas.js";
const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const w = mundo(pacote);
const fmt = (n: number) => n >= 1e9 ? (n / 1e9).toFixed(1) + " bi" : n >= 1e6 ? (n / 1e6).toFixed(1) + " mi" : n >= 1e3 ? (n / 1e3).toFixed(0) + " mil" : String(Math.round(n));
const casos = (process.argv[2] ?? "carreira1,carreira2,carreira3").split(",");
for (const sem of casos) {
  const r = criarJogador({ nome: sem, pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: sem });
  const d = { resultado: r, aparencia: {}, clube: null };
  const s = novoJogo(pacote, d, ofertasDeBase(pacote, d)[0].clubeId, sem);
  console.log(`\n${sem} · pot ${r.potencial} · carisma ${s.jogador.personalidade.carisma}`);
  for (let t = 0; t < 25; t++) {
    const props = new Set<string>();
    for (let k = 0; k < SEMANAS_TEMPORADA; k++) { semanaAutomatica(pacote, s); for (const p of mercadoDe(s.carreira).propostas) if (p.tipo !== "renovacao") props.add(`${w.info[p.clubeId].nome}(${infoLiga(p.ligaId).curto}, R$${fmt(p.salario)})`); }
    const c = s.carreira;
    console.log(`  ${s.jogador.idade - 1}a OVR ${Math.round(ovr(s.jogador))} ${w.info[c.clubeId].nome} [${infoLiga(c.ligaId).curto}] fama ${c.fama.toFixed(0)} seg ${fmt(c.seguidores)} sal R$${fmt(c.salario)} saldo R$${fmt(s.casa.saldo)} | ${[...props].slice(0, 5).join("; ")}`);
  }
}
