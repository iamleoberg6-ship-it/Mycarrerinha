// Testes do motor: fórmulas do documento e propriedades da simulação.
import assert from "node:assert/strict";
import { RNG } from "../src/rng.js";
import { ATRIBUTOS, ovr, evoluirSemana, type Atributos } from "../src/atributos.js";
import { valorMercado, salarioMensal } from "../src/mercado.js";
import { carregarPacote, ligaDoPacote, criarMundo, simularTemporada, tabelaTurnoReturno } from "../src/liga.js";
import { Carreira } from "../src/carreira.js";
import { criarJogador, formacaoPermitida, ESCOLAS, FORMACOES, FAMILIAS, type EscolhasCriacao } from "../src/dna.js";

let ok = 0;
const teste = (nome: string, fn: () => void) => { fn(); ok++; console.log("ok -", nome); };
const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const todos = (v: number) => Object.fromEntries(ATRIBUTOS.map((a) => [a, v])) as Atributos;

teste("OVR com todos os atributos iguais é o próprio valor", () => {
  assert.equal(ovr(todos(50), "ATA"), 50);
});

teste("Evolução cresce e para no potencial", () => {
  let at = todos(50);
  for (let s = 0; s < 52 * 15; s++) at = evoluirSemana(at, 80, { idade: 17, foco: "tecnico", intensidade: "normal", participacao: "titular", moral: 60, personalTrainer: false, profissionalismo: 10 });
  assert.ok(Math.max(...ATRIBUTOS.map((a) => at[a])) < 80);
  assert.ok(Math.min(...ATRIBUTOS.map((a) => at[a])) > 70);
});

teste("Valor de mercado bate com a tabela do documento", () => {
  const vm = (o: number) => valorMercado(o, 28, 3, 1);
  assert.equal(Math.round(vm(60) / 1e5), 5);
  assert.equal(Math.round(vm(80) / 1e6), 27);
  assert.equal(Math.round(vm(90) / 1e6), 202);
});

teste("Salário do exemplo do documento (OVR 75, 24 anos, Brasil) ≈ R$ 420 mil", () => {
  const liga = ligaDoPacote(pacote);
  const clube = { ...liga.clubes[0], fClube: 1 };
  const s = salarioMensal({ ovr: 75, idade: 24, liga, clube, agente: "iniciante", fama: 0 });
  assert.ok(Math.abs(s - 421700) < 2000, String(s));
});

teste("Tabela: 38 rodadas, cada par se enfrenta duas vezes", () => {
  const r = tabelaTurnoReturno(20);
  assert.equal(r.length, 38);
  const pares = new Map<string, number>();
  for (const j of r.flat()) { const k = [...j].sort((a, b) => a - b).join("-"); pares.set(k, (pares.get(k) ?? 0) + 1); }
  assert.equal(pares.size, 190);
  assert.ok([...pares.values()].every((n) => n === 2));
});

teste("Média de gols da liga entre 2,5 e 2,85 (real 2026: 2,67)", () => {
  const liga = ligaDoPacote(pacote);
  const rng = new RNG("teste");
  let g = 0;
  for (let i = 0; i < 200; i++) g += simularTemporada(rng, liga).golsPorJogo;
  const m = g / 200;
  assert.ok(m > 2.5 && m < 2.85, String(m));
});

teste("Mesma semente gera a mesma carreira", () => {
  const mundo = criarMundo(new RNG("mundo"), pacote);
  const a = new Carreira("x", mundo).simularCarreira();
  const b = new Carreira("x", mundo).simularCarreira();
  assert.deepEqual(a.historico, b.historico);
});

teste("Carreira termina entre 30 e 40 anos e o patrimônio é positivo", () => {
  const mundo = criarMundo(new RNG("mundo"), pacote);
  for (let i = 0; i < 50; i++) {
    const c = new Carreira(`t${i}`, mundo).simularCarreira();
    assert.ok(c.idade >= 30 && c.idade <= 40, `idade ${c.idade}`);
    assert.ok(c.patrimonio > 0, `patrimônio ${c.patrimonio}`);
  }
});

const base: EscolhasCriacao = { nome: "Teste", escola: "BRA", familia: "humilde", formacao: "rua", alturaCm: 178, pe: "direito", posicao: "ATA", semente: "s1" };

teste("DNA: mesma escolha e semente geram o mesmo jogador", () => {
  assert.deepEqual(criarJogador(base), criarJogador(base));
});

teste("DNA: escola muda os atributos na direção do documento", () => {
  const bra = criarJogador(base), ita = criarJogador({ ...base, escola: "ITA" });
  assert.ok(bra.atributos.DRI > ita.atributos.DRI);
  assert.ok(ita.atributos.MAR > bra.atributos.MAR);
});

teste("DNA: academia particular exige família de classe média ou rica", () => {
  assert.equal(formacaoPermitida("academia", "humilde"), false);
  assert.throws(() => criarJogador({ ...base, formacao: "academia" }));
});

teste("DNA: OVR inicial entre 42 e 58 em todas as combinações", () => {
  let n = 0, soma = 0;
  for (const e of ESCOLAS) for (const f of FORMACOES) for (const fa of FAMILIAS) {
    if (!formacaoPermitida(f.id, fa.id)) continue;
    for (const pos of ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as const) {
      const r = criarJogador({ ...base, escola: e.id, formacao: f.id, familia: fa.id, posicao: pos, semente: `${e.id}${f.id}${fa.id}${pos}` });
      assert.ok(r.ovr >= 42 && r.ovr <= 58, `${e.id}/${f.id}/${fa.id}/${pos}: ${r.ovr}`);
      assert.ok(r.faixaPotencial[0] <= r.potencial + 8 && r.faixaPotencial[1] >= r.potencial - 8);
      n++; soma += r.ovr;
    }
  }
  console.log(`   média de OVR inicial: ${(soma / n).toFixed(1)} em ${n} combinações`);
});

console.log(`\n${ok} testes passaram`);
