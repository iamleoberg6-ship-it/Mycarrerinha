// Testes do motor: fórmulas do documento e propriedades da simulação.
import assert from "node:assert/strict";
import { RNG } from "../src/rng.js";
import { ATRIBUTOS, ovr, evoluirSemana, type Atributos } from "../src/atributos.js";
import { valorMercado, salarioMensal } from "../src/mercado.js";
import { carregarPacote, ligaDoPacote, criarMundo, simularTemporada, tabelaTurnoReturno } from "../src/liga.js";
import { Carreira } from "../src/carreira.js";
import { definirPerfil, estiloDeJogo } from "../src/perfil.js";
import { MORADIAS, FORMATO, CATALOGO, areaDoSlot, novoEstado, comprar, mudar, fecharMes, efeitosDaCasa, conforto, vender, instalarGuardado, itemNoSlot } from "../src/casa.js";
import { criarJogador, formacaoPermitida, PAISES, FORMACOES, FAMILIAS, type EscolhasCriacao } from "../src/dna.js";

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

const base: EscolhasCriacao = { nome: "Teste", pais: "BRA", familia: "humilde", formacao: "rua", alturaCm: 178, pe: "direito", posicao: "ATA", semente: "s1" };

teste("DNA: mesma escolha e semente geram o mesmo jogador", () => {
  assert.deepEqual(criarJogador(base), criarJogador(base));
});

teste("DNA: escola muda os atributos na direção do documento", () => {
  const bra = criarJogador(base), ita = criarJogador({ ...base, pais: "ITA" });
  assert.ok(bra.atributos.DRI > ita.atributos.DRI);
  assert.ok(ita.atributos.MAR > bra.atributos.MAR);
});

teste("DNA: Argentina e Uruguai são cartas separadas com a mesma escola", () => {
  const ar = criarJogador({ ...base, pais: "ARG" }), ur = criarJogador({ ...base, pais: "URU" });
  assert.equal(ar.escola, ur.escola);
  assert.notEqual(ar.nacionalidade, ur.nacionalidade);
});

teste("DNA: academia particular exige família de classe média ou rica", () => {
  assert.equal(formacaoPermitida("academia", "humilde"), false);
  assert.throws(() => criarJogador({ ...base, formacao: "academia" }));
});

teste("DNA: OVR inicial entre 42 e 58 em todas as combinações", () => {
  let n = 0, soma = 0;
  for (const e of PAISES) for (const f of FORMACOES) for (const fa of FAMILIAS) {
    if (!formacaoPermitida(f.id, fa.id)) continue;
    for (const pos of ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as const) {
      const r = criarJogador({ ...base, pais: e.id, formacao: f.id, familia: fa.id, posicao: pos, semente: `${e.id}${f.id}${fa.id}${pos}` });
      assert.ok(r.ovr >= 42 && r.ovr <= 58, `${e.id}/${f.id}/${fa.id}/${pos}: ${r.ovr}`);
      assert.ok(r.faixaPotencial[0] <= r.potencial + 8 && r.faixaPotencial[1] >= r.potencial - 8);
      n++; soma += r.ovr;
    }
  }
  console.log(`   média de OVR inicial: ${(soma / n).toFixed(1)} em ${n} combinações`);
});

teste("Perfil: todos os perfis aparecem e a joia rara é rara", () => {
  const cont: Record<string, number> = {};
  let n = 0;
  for (const e of PAISES) for (const f of FORMACOES) for (const fa of FAMILIAS) {
    if (!formacaoPermitida(f.id, fa.id)) continue;
    for (const pos of ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as const) for (const k of [1, 2, 3]) {
      const r = criarJogador({ ...base, pais: e.id, formacao: f.id, familia: fa.id, posicao: pos, semente: `p${e.id}${f.id}${fa.id}${pos}${k}` });
      const pf = definirPerfil(r);
      cont[pf.id] = (cont[pf.id] ?? 0) + 1; n++;
      assert.ok(estiloDeJogo(r).rotulo.length > 0);
      if (pf.evento) for (const o of pf.evento.opcoes) assert.ok(o.resultado.length > 0);
    }
  }
  const pct = Object.fromEntries(Object.entries(cont).map(([k, v]) => [k, Math.round((100 * v) / n)]));
  console.log("   distribuição (%):", JSON.stringify(pct));
  assert.equal(Object.keys(cont).length, 7);
  assert.ok(pct.joia_rara <= 10, "joia rara comum demais");
});

teste("Casa: todo móvel cabe no cômodo e nenhum se sobrepõe", () => {
  for (const m of MORADIAS) for (const c of m.comodos) {
    const ids = new Set<string>();
    const areas = c.slots.filter((sl) => !FORMATO[sl.tipo].parede && !FORMATO[sl.tipo].plano).map((sl) => ({ sl, a: areaDoSlot(sl) }));
    for (const sl of c.slots) { assert.ok(!ids.has(sl.id), `${m.id}.${c.id}.${sl.id} repetido`); ids.add(sl.id); }
    for (const sl of c.slots) {
      const a = areaDoSlot(sl);
      if (FORMATO[sl.tipo].parede) { assert.ok(sl.x > 1 && sl.x < (sl.parede === "esq" ? c.d : c.w) - 1, `${m.id}.${c.id}.${sl.id} fora da parede`); continue; }
      assert.ok(a.x >= 0 && a.y >= 0 && a.x + a.w <= c.w && a.y + a.d <= c.d, `${m.id}.${c.id}.${sl.id} fora do cômodo`);
    }
    for (let i = 0; i < areas.length; i++) for (let j = i + 1; j < areas.length; j++) {
      const p = areas[i].a, q = areas[j].a;
      const cruza = p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.d && q.y < p.y + p.d;
      assert.ok(!cruza, `${m.id}.${c.id}: ${areas[i].sl.id} e ${areas[j].sl.id} se sobrepõem`);
    }
  }
  for (const it of CATALOGO) if (it.preco > 0) assert.ok(Object.keys(it.efeitos).length > 0, `${it.id} sem efeito`);
});

teste("Casa: comprar, guardar, mudar e fechar o mês", () => {
  const e = novoEstado(10000);
  assert.equal(comprar(e, "quarto", "beliche", "cama-1").ok, false);
  assert.ok(comprar(e, "quarto", "tv", "tv-1").ok);
  assert.ok(comprar(e, "quarto", "tv", "tv-2").ok);
  assert.deepEqual(e.guardados, ["tv-1"]);
  assert.equal(e.saldo, 10000 - 1200 - 4500);
  assert.equal(comprar(e, "quarto", "mesa", "mesa-3").ok, false);
  const c0 = conforto(e);
  assert.ok(vender(e, "tv-1").ok && e.guardados.length === 0);
  e.saldo = 1e6;
  assert.ok(mudar(e, "apartamento", "alugar").ok);
  assert.equal(itemNoSlot(e, "quarto", "tv")?.id ?? itemNoSlot(e, "sala", "tv")?.id, "tv-2");
  assert.ok(!Object.values(e.instalados).includes("beliche-1"));
  const s0 = e.saldo;
  fecharMes(e, 50000);
  assert.equal(e.saldo, s0 + 50000 - 8000);
  e.saldo = 3e6;
  assert.ok(mudar(e, "casa", "comprar").ok);
  const s1 = e.saldo; fecharMes(e, 0); assert.equal(e.saldo, s1);
  assert.ok(comprar(e, "externa", "piscina", "piscina-1").ok);
  assert.ok(efeitosDaCasa(e).recuperacao >= 2);
  // volta para um lugar menor: o que não cabe fica guardado
  assert.ok(comprar(e, "garagem", "vaga1", "carro-1").ok);
  assert.ok(mudar(e, "kitnet", "alugar").ok);
  assert.ok(e.guardados.includes("piscina-1") && e.guardados.includes("carro-1"));
  assert.ok(mudar(e, "casa", "alugar").ok); // já é dono: volta sem pagar
  assert.ok(itemNoSlot(e, "externa", "piscina")?.id === "piscina-1");
  assert.ok(c0 > 0);
  assert.ok(instalarGuardado(e, "quarto", "cama", "inexistente").ok === false);
});

console.log(`\n${ok} testes passaram`);
