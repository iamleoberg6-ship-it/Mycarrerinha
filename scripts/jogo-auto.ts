// Joga temporadas inteiras do modo carreira com uma política automática, para conferir os números.
import { carregarPacote } from "../src/pacote.js";
import { criarJogador, type EscolhasCriacao } from "../src/dna.js";
import { novoJogo, ofertasDeBase, semanaAutomatica, ovr, SEMANAS_TEMPORADA } from "../src/jogo.js";
import { efeitosDaCasa } from "../src/casa.js";

const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const casos: Partial<EscolhasCriacao>[] = [
  { posicao: "ATA", familia: "humilde", formacao: "rua" },
  { posicao: "MEI", familia: "media", formacao: "base_grande" },
  { posicao: "ZAG", familia: "rica", formacao: "academia" },
  { posicao: "PON", familia: "humilde", formacao: "futsal" },
];
for (const [i, c] of casos.entries()) {
  const e = { nome: `Teste ${i}`, pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "MEI", ...c, semente: `auto${i}` } as EscolhasCriacao;
  const r = criarJogador(e);
  const dados = { resultado: r, aparencia: {}, clube: "FLA" };
  const of = ofertasDeBase(pacote, dados);
  const s = novoJogo(pacote, dados, of[0].clubeId);
  console.log(`\n${e.posicao} ${e.familia}/${r.formacaoFinal} pot ${r.potencial} OVR ${Math.round(ovr(s.jogador))} → ${of.map((o) => `${o.apelido}(${o.nomeEstrutura})`).join(", ")}`);
  for (let t = 0; t < 4; t++) {
    const esc: Record<string, number> = {};
    for (let w = 0; w < SEMANAS_TEMPORADA; w++) { const r2 = semanaAutomatica(pacote, s); esc[r2.escalacao] = (esc[r2.escalacao] ?? 0) + 1; }
    const h = s.carreira.historico.at(-1)!;
    console.log(`  ${h.ano} idade ${h.idade} OVR ${h.ovr} | pro ${h.jogos}j ${h.gols}g ${h.assist}a nota ${h.nota} | base ${h.base} | ${JSON.stringify(esc)} | salário ${s.carreira.salario} saldo ${Math.round(s.casa.saldo)} fama ${s.carreira.fama.toFixed(1)} moral ${Math.round(s.carreira.moral)} | casa ${JSON.stringify(efeitosDaCasa(s.casa).total)}`);
  }
}
