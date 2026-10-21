// Quantas relíquias e troféus uma carreira automática junta.
import { carregarPacote } from "../src/pacote.js";
import { criarJogador, type EscolhasCriacao } from "../src/dna.js";
import { novoJogo, ofertasDeBase, semanaAutomatica, SEMANAS_TEMPORADA } from "../src/jogo.js";

const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const T = Number(process.argv[2] ?? 8);
for (const [i, pos] of (["ATA", "MEI", "ZAG", "PON"] as const).entries()) {
  const e = { nome: `Rel ${i}`, pais: "BRA", familia: "media", formacao: "base_grande", alturaCm: 180, pe: "direito", posicao: pos, semente: `rel${i}` } as EscolhasCriacao;
  const dados = { resultado: criarJogador(e), aparencia: {}, clube: "FLA" };
  const s = novoJogo(pacote, dados, ofertasDeBase(pacote, dados)[0].clubeId);
  for (let w = 0; w < T * SEMANAS_TEMPORADA; w++) semanaAutomatica(pacote, s);
  const rs = s.casa.reliquias ?? [];
  console.log(`\n${pos} (${s.carreira.clubeId}) ${rs.length} relíquias; na casa ${s.casa.objetos.filter((o) => o.item.startsWith("rel-")).length}, depósito ${s.casa.deposito.filter((o) => o.item.startsWith("rel-")).length}`);
  for (const h of s.carreira.historico) console.log(`  ${h.ano} idade ${h.idade}: pro ${h.jogos}j ${h.gols}g ${h.assist}a nota ${h.nota} | base ${h.base}j ${h.baseGols ?? 0}g | ${h.premios?.join(", ") || "-"}`);
  console.log("  " + rs.map((r) => `${r.nome} (${r.legenda})`).join("\n  "));
}
