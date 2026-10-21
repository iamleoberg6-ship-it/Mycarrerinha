// Testes do motor: fórmulas do documento e propriedades da simulação.
import assert from "node:assert/strict";
import { RNG } from "../src/rng.js";
import { ATRIBUTOS, ovr, evoluirSemana, type Atributos } from "../src/atributos.js";
import { valorMercado, salarioMensal } from "../src/mercado.js";
import { ligaDoPacote, criarMundo, simularTemporada, tabelaTurnoReturno } from "../src/liga.js";
import { carregarPacote } from "../src/pacote.js";
import { Carreira } from "../src/carreira.js";
import { definirPerfil, estiloDeJogo } from "../src/perfil.js";
import { IMOVEIS, ITENS, TIPOS, TETO, CATALOGO, REVEST, REVESTIMENTOS, novoEstado, cabe, comprar, mover, girar, guardar, tirarDoDeposito, reformar, mudar, fecharMes, efeitosDaCasa, conforto, bonusDeEstilo, acabamento, travado, alojamentosDoClube, motivoNaoCabe, vender, nomeImovel, estruturaDoClube, imovelAtual, areaM2, IMOVEL } from "../src/casa.js";
import { CLUBES_CASA } from "../src/clubes.js";
import { novoJogo, ofertasDeBase, semanaAutomatica, SEMANAS_TEMPORADA, prepararPartida, planoPadrao, resolverDecisao, concluirSemana, decisaoComemoracao, decisaoPosJogo } from "../src/jogo.js";
import { SITUACOES, SITUACAO, POS_JOGO, COMEMORACAO } from "../src/lances.js";
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

teste("Casa: imóveis válidos, inclusos cabem, catálogo completo", () => {
  assert.ok(IMOVEIS.length >= 18);
  for (const cat of ["alojamento", "kitnet", "apartamento", "casa", "mansao"]) assert.ok(IMOVEIS.filter((m) => m.categoria === cat).length >= 3, cat);
  for (const m of IMOVEIS) {
    const e = novoEstado(0, m.id);
    const ids = new Set(m.comodos.map((c) => c.id)); assert.equal(ids.size, m.comodos.length, m.id);
    for (const o of e.objetos) assert.ok(ITENS[o.item] && cabe(e, o), `${m.id}: incluso ${o.item} não cabe`);
    for (const c of m.comodos) for (const l of ["parede", "piso"] as const) {
      const r = REVEST[c[l].id]; assert.ok(r && r.ambientes.includes(c.ambiente) && c[l].cor < r.cores.length, `${m.id}.${c.id} ${l}`);
    }
  }
  for (const tipo of Object.keys(TIPOS)) assert.ok(CATALOGO.some((i) => i.tipo === tipo), `sem produto: ${tipo}`);
  for (const it of CATALOGO) { assert.ok(it.preco > 0 && it.cores.length > 0, it.id); if (it.aVenda) assert.ok(Object.values(it.efeitos).some((v) => v !== 0), `${it.id} sem efeito`); }
  assert.equal(new Set(CATALOGO.map((i) => i.id)).size, CATALOGO.length);
  console.log(`   ${IMOVEIS.length} imóveis, ${CATALOGO.length} itens, ${REVESTIMENTOS.length} revestimentos`);
});

teste("Casa: comprar, mover, girar, guardar, reformar e mudar", () => {
  const e = novoEstado(20000);
  assert.equal(mover(e, e.objetos[0].uid, { x: 5, y: 5 }).ok, false); // beliche do clube
  const r = comprar(e, "tv-basico-1-1", 0, "quarto"); assert.ok(r.ok && r.uid);
  const o = e.objetos.find((x) => x.uid === r.uid)!;
  assert.ok(cabe(e, o));
  assert.equal(mover(e, o.uid, { x: 0, y: 0 }).ok, false); // em cima do beliche
  assert.ok(girar(e, o.uid).ok);
  assert.ok(comprar(e, "tapete-basico-1-1", 0, "quarto").ok); // tapete pode ficar embaixo de móvel
  assert.equal(comprar(e, "piscina-basico-1-3", 0, "quarto").ok, false); // sem dinheiro
  assert.equal(reformar(e, "quarto", "parede", "pintura", 3).ok, false); // alojamento
  assert.ok(guardar(e, o.uid).ok && e.deposito.length === 1);
  assert.ok(tirarDoDeposito(e, o.uid, "quarto").ok);
  // aluguel exige renda
  assert.equal(mudar(e, "ap-2q", "alugar", 2000).ok, false);
  e.saldo = 50000;
  assert.ok(mudar(e, "ap-2q", "alugar", 25000).ok);
  assert.ok(e.objetos.some((x) => x.item === "tv-basico-1-1"));
  assert.ok(reformar(e, "sala", "parede", "listras", 1).ok);
  assert.equal(reformar(e, "sala", "piso", "marmore", 0).ok, false); // alugado
  const s0 = e.saldo; fecharMes(e, 25000); assert.equal(e.saldo, s0 + 25000 - 6000);
  // compra, reforma completa e volta para um lugar pequeno
  e.saldo = 1e7;
  assert.ok(mudar(e, "casa-cond", "comprar", 0).ok);
  assert.ok(reformar(e, "sala", "piso", "marmore", 0).ok);
  assert.ok(comprar(e, "piscina-basico-1-3", 0, "quintal").ok);
  assert.ok(comprar(e, "carro-gamer-4-4", 2, "garagem").ok);
  const ef = efeitosDaCasa(e).total; assert.ok(ef.recuperacao >= 2 && ef.fama >= 6);
  assert.ok(mudar(e, "kit-ct", "alugar", 1e6).ok);
  assert.ok(e.deposito.some((g) => g.item === "piscina-basico-1-3") && e.deposito.some((g) => g.item === "carro-gamer-4-4"));
  assert.ok(mudar(e, "casa-cond", "alugar", 0).ok); // é dono
  assert.equal(acabamento(e, "sala").piso.id, "marmore");
  assert.ok(e.objetos.some((x) => x.item === "piscina-basico-1-3"));
  assert.equal(e.objetos.find((x) => x.item === "carro-gamer-4-4")!.cor, 2);
});

teste("Casa: estilo completo dá bônus e conforto cresce", () => {
  const e = novoEstado(1e8, "aloj-vila");
  assert.ok(mudar(e, "man-moderna", "comprar", 0).ok);
  const c0 = conforto(e);
  for (const id of ["sofa-rustico-2-2", "poltrona-rustico-1-2", "mesaCentro-rustico-3-2", "estante-rustico-1-2", "luminaria-rustico-2-2"]) assert.ok(comprar(e, id, 0, "sala").ok, id);
  const b = bonusDeEstilo(e); assert.ok(b.some((x) => x.comodo === "sala" && x.estilo === "rustico"));
  assert.ok(conforto(e) > c0);
  for (const it of CATALOGO) if (it.aVenda && it.nivel >= 3) comprar(e, it.id, 0, "sala");
  assert.ok(conforto(e) > 50, `conforto ${conforto(e)}`);
  const ef = efeitosDaCasa(e); assert.ok(ef.total.moral <= TETO.moral);
});
teste("Casa: cada móvel no seu cômodo, instalação só com escritura, alojamento do clube", () => {
  const e = novoEstado(1e7, "ap-2q");
  e.saldo = 1e7; mudar(e, "kit-ct", "alugar", 1e6); assert.ok(mudar(e, "ap-2q", "alugar", 1e6).ok);
  // pia do banheiro não vai para a sala, nem no aluguel
  assert.ok(motivoNaoCabe(e, "pia-moderno-2-2").includes("próprio"));
  assert.equal(comprar(e, "pia-moderno-2-2", 0, "banheiro").ok, false);
  const pia = e.objetos.find((o) => o.item === "pia-basico-1-1")!;
  assert.ok(travado(e, pia) && !vender(e, pia.uid).ok);
  // geladeira comprada estando na sala vai para a cozinha
  const r = comprar(e, "geladeira-basico-2-2", 0, "sala"); assert.ok(r.ok && r.comodo === "cozinha");
  const g = e.objetos.find((o) => o.uid === r.uid)!;
  assert.equal(cabe(e, { ...g, comodo: "quarto", x: 5, y: 3 }), false);
  // dono pode trocar e vender o que veio com o imóvel; o vendido não volta
  assert.ok(mudar(e, "casa-cond", "comprar", 0).ok);
  const pia2 = e.objetos.find((o) => o.comodo === "banheiro" && o.item.startsWith("pia"))!;
  assert.ok(!travado(e, pia2) && vender(e, pia2.uid).ok);
  assert.ok(comprar(e, "pia-moderno-2-2", 0, "banheiro").ok);
  mudar(e, "ap-2q", "alugar", 1e6); mudar(e, "casa-cond", "alugar", 0);
  assert.equal(e.objetos.filter((o) => o.comodo === "banheiro" && o.item.startsWith("pia")).length, 1);
  assert.equal((comprar(e, "carro-basico-1-1", 0, "sala") as { comodo?: string }).comodo, "garagem");
  // alojamento depende do clube
  const pal = CLUBES_CASA.find((c) => c.id === "PAL")!, pobre = CLUBES_CASA.find((c) => estruturaDoClube(c) === 1)!;
  assert.deepEqual(alojamentosDoClube(pal), ["aloj-elite", "aloj-familia"]);
  const p = novoEstado(0, "aloj-elite", pobre);
  assert.equal(p.imovel, "aloj-kitnet");
  assert.ok(nomeImovel(p, imovelAtual(p)).includes(pobre.nome));
  assert.equal(mudar(p, "aloj-elite", "alugar", 0).ok, false);
  const niveis = CLUBES_CASA.map(estruturaDoClube);
  for (const n of [1, 2, 3, 4, 5]) assert.ok(niveis.includes(n), `nenhum clube com estrutura ${n}`);
  assert.ok(areaM2(IMOVEL["aloj-elite"]) > areaM2(IMOVEL["aloj-ct"]) && areaM2(IMOVEL["aloj-ct"]) > areaM2(IMOVEL["aloj-kitnet"]));
});

teste("Carreira jogável: temporada completa, tabela fechada e mesma semente, mesmo resultado", () => {
  const r = criarJogador({ nome: "Teste", pais: "BRA", familia: "humilde", formacao: "rua", alturaCm: 178, pe: "direito", posicao: "ATA", semente: "carreira" });
  const dados = { resultado: r, aparencia: {}, clube: "PAL" };
  const of = ofertasDeBase(pacote, dados);
  assert.equal(of.length, 3); assert.equal(new Set(of.map((o) => o.clubeId)).size, 3);
  const a = novoJogo(pacote, dados, of[0].clubeId, "fixa"), b = novoJogo(pacote, dados, of[0].clubeId, "fixa");
  for (let w = 0; w < SEMANAS_TEMPORADA; w++) { semanaAutomatica(pacote, a); semanaAutomatica(pacote, b); }
  assert.deepEqual(a.jogador.at, b.jogador.at);
  assert.equal(a.carreira.temporada, 1); assert.equal(a.carreira.semana, 0); assert.equal(a.jogador.idade, 17);
  const h = a.carreira.historico[0];
  assert.ok(h.posicao >= 1 && h.posicao <= 20);
  assert.ok(a.casa.saldo > r.dinheiroInicial, "salário entrou");
  // partida interativa: decisões mudam o placar de forma coerente
  for (let w = 0; w < 3; w++) {
    const plano = planoPadrao(), p = prepararPartida(pacote, a, plano);
    const ds = (p?.decisoes ?? []).map((d) => resolverDecisao(a, p!, d, d.opcoes[0].id));
    const res = concluirSemana(pacote, a, plano, p, ds);
    if (res.partida && res.partida.minutos > 0) assert.ok(res.partida.nota >= 3 && res.partida.nota <= 10);
  }
});

teste("Lances: catálogo completo, sem marcador vazio e sem repetir a mesma situação no jogo", () => {
  const todas = [...SITUACOES, ...POS_JOGO, COMEMORACAO];
  assert.ok(SITUACOES.length >= 40, `só ${SITUACOES.length} situações de jogo`);
  assert.equal(new Set(todas.map((x) => x.id)).size, todas.length, "id repetido");
  for (const st of todas) for (const o of st.opcoes) assert.equal(o.niveis.length, 5, `${st.id}/${o.id}`);
  const vazio = (t: string, onde: string) => assert.ok(!/[{}]/.test(t), `marcador sem nome em ${onde}: ${t}`);
  for (const [i, pos] of (["ATA", "ZAG", "MEI", "LAT", "VOL", "PON"] as const).entries()) {
    const r = criarJogador({ nome: "Var", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: pos, semente: `lances${i}` });
    const dados = { resultado: r, aparencia: {}, clube: "FLA" };
    const s = novoJogo(pacote, dados, ofertasDeBase(pacote, dados)[i % 3].clubeId, `lances${i}`);
    for (let w = 0; w < 16; w++) {
      const plano = planoPadrao(), p = prepararPartida(pacote, s, plano);
      if (p && p.decisoes.length) {
        vazio(p.abertura, "abertura"); p.narracao.forEach((l) => vazio(l.texto, "narração")); p.lances.forEach((l) => vazio(l.texto, "gol"));
        assert.equal(new Set(p.decisoes.map((d) => d.situacao)).size, p.decisoes.length, "situação repetida no mesmo jogo");
        const ds = p.decisoes.map((d) => { vazio(d.titulo + d.texto, d.situacao); return resolverDecisao(s, p, d, d.opcoes[w % d.opcoes.length].id); });
        ds.forEach((x) => { vazio(x.texto, x.situacao); if (x.noticia) vazio(x.noticia, x.situacao); });
        const c = decisaoComemoracao(s, p, 30); vazio(c.titulo + c.texto, "comemoração"); assert.ok(c.opcoes.length <= 4);
        const pj = decisaoPosJogo(s, p, ds);
        if (pj) { vazio(pj.titulo + pj.texto, pj.situacao); const rr = resolverDecisao(s, p, pj, pj.opcoes[0].id); vazio(rr.texto, pj.situacao); assert.equal(SITUACAO[pj.situacao].momento, "pos"); }
        concluirSemana(pacote, s, plano, p, ds);
      } else concluirSemana(pacote, s, plano, p, []);
    }
    assert.ok(Object.keys(s.carreira.memoria?.vistos ?? {}).length > 0, "memória de lances vazia");
  }
});

console.log(`\n${ok} testes passaram`);
