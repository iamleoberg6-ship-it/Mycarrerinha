// Mostra uma carreira simulada, temporada a temporada. Uso: npm run carreira -- <semente> [posicao]
import { RNG } from "../src/rng.js";
import { criarMundo } from "../src/liga.js";
import { carregarPacote } from "../src/pacote.js";
import { Carreira } from "../src/carreira.js";
import type { Posicao } from "../src/atributos.js";

const seed = process.argv[2] ?? "exemplo";
const posicao = process.argv[3] as Posicao | undefined;
const mundo = criarMundo(new RNG("mundo"), carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname));
const c = new Carreira(seed, mundo, { posicao }).simularCarreira();
const brl = (x: number) => "R$ " + (x >= 1e6 ? (x / 1e6).toFixed(1) + " mi" : Math.round(x / 1e3) + " mil");
console.log(`Posição ${c.posicao} · origem ${c.origem} · potencial ${c.pot} · aposentou aos ${c.idade}`);
console.log("Idade | Clube | OVR | Jogos (tit.) | Gols | Assist. | Nota | Salário/mês | Valor | Patrimônio | Pos.");
for (const h of c.historico) {
  console.log([h.idade, h.clube, h.ovr, `${h.jogos} (${h.titular})`, h.gols, h.assist, h.notaMedia || "-", brl(h.salario), "€ " + (h.vm / 1e6).toFixed(1) + " mi", brl(h.patrimonio), h.posicaoLiga + (h.titulo ? " campeão" : "")].join(" | "));
}
console.log(`Total: ${c.totais.jogos} jogos, ${c.totais.gols} gols, ${c.totais.assist} assistências, ${c.totais.titulos} títulos, ${c.totais.transferencias} transferências`);
