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
import { ganharReliquia, registrarReliquias, ehReliquia, trocarCor } from "../src/casa.js";
import { mundo } from "../src/mundo.js";
import { aceitar, mercadoDe, semanaDoMercado, trocarAgente, podeContratarAgente, mudarDeClube, fimDaTemporadaNoMercado, contratoVencido, papelNoClube, pedirParaSair, type PropostaSave } from "../src/transferencias.js";
import { CONQUISTAS, reliquiasDaPartida, premiosDaTemporada, type DadosPartida } from "../src/reliquias.js";
import { bonusJovem, chanceSubir, culturaBase } from "../src/identidade.js";
import { alvoSeguidores, semanaRedes, imposto } from "../src/vida.js";
import { tetoSalarial } from "../src/mercado.js";
import { MARCAS, MARCA, ofertasDaMarca, marcaInteressada } from "../src/marcas.js";
import { novoJogo, ofertasDeBase, semanaAutomatica, SEMANAS_TEMPORADA, prepararPartida, planoPadrao, resolverDecisao, concluirSemana, decisaoComemoracao, decisaoPosJogo, migrarSave, resolverEvento } from "../src/jogo.js";
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
  for (const tipo of Object.keys(TIPOS)) if (TIPOS[tipo as keyof typeof TIPOS].categoria !== "conquistas") assert.ok(CATALOGO.some((i) => i.tipo === tipo), `sem produto: ${tipo}`);
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

teste("Relíquias: primeiro gol, hat-trick, prêmios; vão para a casa e não se vendem", () => {
  const d: DadosPartida = { tipo: "profissional", ano: 2027, semana: 5, adversario: "Galo", clubeId: "FLA", clubeNome: "CR Flamingo", cores: ["#C8102E", "#000000"], numero: "29",
    placar: "3 × 1", gols: 3, minutos: 90, jogosPro: 1, golsPro: 3, jogosBase: 20, golsBase: 8, jogosNoClube: 1, golacos: ["escanteioAtaque/bicicleta"] };
  const g = reliquiasDaPartida(d, () => false), chaves = g.map((x) => x.conquista);
  for (const k of ["camisa-estreia", "bola-estreia", "camisa-primeiro-gol", "bola-primeiro-gol", "bola-hattrick", "bola-bicicleta"]) assert.ok(chaves.includes(k), k);
  assert.equal(reliquiasDaPartida({ ...d, jogosPro: 2, golsPro: 5, gols: 2, golacos: [] }, () => false).length, 0, "segundo jogo comum não libera nada");
  for (const x of g) assert.ok(CONQUISTAS.some((c) => c.chave === x.conquista), x.conquista);
  const e = novoEstado(0, "casa-cond");
  for (const x of g) assert.ok(ganharReliquia(e, x.reliquia).ok);
  assert.equal(ganharReliquia(e, g[0].reliquia).ok, false, "não repete");
  const naCasa = e.objetos.filter((o) => ehReliquia(o.item));
  assert.equal(naCasa.length + e.deposito.length, g.length);
  for (const o of naCasa) { assert.ok(cabe(e, o)); assert.equal(vender(e, o.uid).ok, false); assert.equal(trocarCor(e, o.uid, 1).ok, false); }
  // um save recarregado (JSON) volta a reconhecer as relíquias
  const copia = JSON.parse(JSON.stringify(e)); registrarReliquias(copia);
  assert.ok(efeitosDaCasa(copia).total.moral >= Math.min(TETO.moral, naCasa.length));
  const p = premiosDaTemporada(new RNG("x"), { ano: 2028, idade: 20, clubeId: "FLA", clubeNome: "CR Flamingo", cores: ["#C8102E", "#000000"], numero: "9",
    jogos: 34, gols: 30, assist: 15, nota: 7.8, titulo: true, base: 0, golsBase: 0, notaBase: 0, temporadasCheias: 0 }).map((x) => x.conquista);
  for (const k of ["trofeu-campeao", "camisa-titulo", "trofeu-artilheiro", "trofeu-garcom", "trofeu-craque", "trofeu-selecao", "trofeu-revelacao", "trofeu-sub21"]) assert.ok(p.includes(k), k);
  assert.equal(premiosDaTemporada(new RNG("y"), { ano: 2028, idade: 25, clubeId: "FLA", clubeNome: "x", cores: [], numero: "9", jogos: 30, gols: 2, assist: 1, nota: 6.4, titulo: false, base: 0, golsBase: 0, notaBase: 0, temporadasCheias: 3 }).length, 0);
});

teste("Mundo: 13 ligas reais em paródia, elencos completos e sempre os mesmos", () => {
  const w = mundo(pacote);
  assert.deepEqual(w.ligas.map((l) => l.id).sort(), ["ARG1", "BRA1", "BRA2", "ENG1", "ENG2", "ESP1", "ESP2", "FRA1", "GER1", "ITA1", "KSA1", "NED1", "POR1"]);
  assert.equal(Object.keys(w.clube).length, 266);
  const nomes = w.ligas.filter((l) => l.id !== "BRA1").flatMap((l) => l.clubes.flatMap((c) => c.elenco.map((j) => j.nome)));
  assert.equal(new Set(nomes).size, nomes.length, "nomes de jogadores repetidos");
  for (const c of Object.values(w.clube)) {
    const n = (p: string) => c.elenco.filter((j) => j.posicao === p).length;
    assert.ok(n("GOL") >= 2 && n("ZAG") >= 3 && n("LAT") >= 2 && n("ATA") >= 2, `posições em ${c.id}`);
  }
  for (const l of w.ligas) {
    assert.ok(l.clubes.length % 2 === 0 && l.clubes.length >= 18, l.id);
    for (const c of l.clubes) { assert.ok(w.info[c.id]?.estadio && w.info[c.id].cores.length >= 2, c.id); assert.ok(c.elenco.length >= 20 && c.elenco.every((j) => !/^[A-Z]{3}-\d/.test(j.nome)), c.id); }
  }
  const forca = (id: string) => w.liga[id].clubes.reduce((a, c) => a + c.forca, 0) / w.liga[id].clubes.length;
  assert.ok(forca("ENG1") > forca("ENG2") && forca("ESP1") > forca("ESP2") && forca("BRA1") > forca("BRA2") && forca("ENG1") > forca("BRA1"));
});

teste("Mundo: save antigo (ligas genéricas) migra para os clubes reais", () => {
  const r = criarJogador({ nome: "Antigo", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "antigo" });
  const dados = { resultado: r, aparencia: {}, clube: "FLA" };
  const s = novoJogo(pacote, dados, "FLA", "antigo");
  s.carreira.clubeId = "E1-RMD"; s.carreira.ligaId = "EUR1"; s.carreira.ordem = ["E1-RMD", "E1-BAR"];
  assert.ok(migrarSave(pacote, s));
  assert.equal(s.carreira.clubeId, "ES-RMA"); assert.equal(s.carreira.ligaId, "ESP1"); assert.equal(s.carreira.ordem.length, 20);
  assert.equal(migrarSave(pacote, s), false);
});

teste("Identidade: clube formador dá chance ao jovem, clube comprador não", () => {
  assert.ok(bonusJovem("SAN", 18) > 0 && bonusJovem("BOT", 18) < 0 && bonusJovem("FLA", 18) === 0);
  assert.equal(bonusJovem("SAN", 25), 0);
  assert.ok(bonusJovem("SAN", 20) < bonusJovem("SAN", 19));
  assert.ok(chanceSubir("PAL").chance > chanceSubir("SA-NAS").chance);
  for (const id of Object.keys(mundo(pacote).clube)) assert.ok(culturaBase(id) >= 1 && culturaBase(id) <= 5, id);
});

teste("Vida: seguidores com teto, imposto por país, teto salarial e eventos fora de campo", () => {
  // seguidores: nunca passam de ~700 mi, mesmo com fama máxima, gigante, marqueteiro e postando muito
  assert.ok(alvoSeguidores(100, 2, 20, 100, 1.5) < 7e8 && alvoSeguidores(100, 2, 20, 100, 1.5) > 4e8);
  assert.ok(alvoSeguidores(40, 0.4, 10, 40, 0) < 1e6);
  assert.ok(alvoSeguidores(70, 2, 10, 40, 0) > alvoSeguidores(70, 0.5, 10, 40, 0) * 3, "clube grande dá mais seguidores");
  assert.equal(semanaRedes(1e12, 5e6), 5e6, "save com seguidores absurdos é corrigido");
  assert.ok(semanaRedes(10e6, 5e6) < 10e6 && semanaRedes(10e6, 5e6) > 9e6, "perde devagar");
  assert.equal(imposto(1e6, "KSA1"), 0); assert.ok(imposto(1e6, "ENG1") > imposto(1e6, "BRA1"));
  const w = mundo(pacote);
  assert.ok(tetoSalarial(w.clube["SA-HIL"], w.liga.KSA1) > tetoSalarial(w.clube["EN-MCI"], w.liga.ENG1), "o Golfo paga mais");
  assert.ok(salarioMensal({ ovr: 92, idade: 27, liga: w.liga.BRA2, clube: w.clube.SBE, agente: "top", fama: 100 }) <= tetoSalarial(w.clube.SBE, w.liga.BRA2));
  // eventos: aparecem, resolvem e não repetem os únicos
  const r = criarJogador({ nome: "Vida", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "MEI", semente: "vida" });
  const sv = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "vida");
  let vistos = 0;
  for (let k = 0; k < 160; k++) { if (sv.carreira.evento) vistos++; semanaAutomatica(pacote, sv); }
  assert.ok(vistos >= 8, `poucos eventos: ${vistos}`);
  sv.carreira.evento = "mae-casa"; const saldo = sv.casa.saldo;
  assert.ok(resolverEvento(pacote, sv, "comprar")); assert.ok(sv.casa.saldo < saldo); assert.equal(sv.carreira.evento, undefined);
});

teste("Patrocínio: marcas por categoria, três modelos de contrato e pagamento com bônus", () => {
  assert.ok(MARCAS.length >= 30 && new Set(MARCAS.map((m) => m.id)).size === MARCAS.length);
  const rng = new RNG("patro");
  const of = ofertasDaMarca(rng, MARCA.nobanco, 60, 5e6);
  assert.deepEqual(of.map((o) => o.tipo), ["fixo", "desempenho", "longo"]);
  assert.ok(of[2].meses >= 36 && of[2].luvas > 0 && of[1].bonusGol > 0 && of[0].mensal > of[2].mensal);
  // exclusividade por categoria e cerveja só para maiores
  const ativo = [{ ...of[0], marca: "itao", restantes: 5, desde: 2026 }];
  for (let k = 0; k < 50; k++) { const m = marcaInteressada(new RNG(`m${k}`), 90, 17, ativo, []); assert.ok(m && m.categoria !== "banco" && m.categoria !== "cerveja"); }
  assert.equal(marcaInteressada(rng, 5, 20, [], [])?.id, "penalte");
  // na carreira: aparece proposta, aceita e recebe
  const r = criarJogador({ nome: "Patro", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "patro" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "patro");
  s.carreira.fama = 70; s.carreira.formacao = false; s.jogador.idade = 22;
  let achou = false;
  for (let k = 0; k < 120 && !achou; k++) { semanaAutomatica(pacote, s, false); achou = (s.carreira.patrocinios?.length ?? 0) > 0; }
  assert.ok(achou, "nenhum patrocinador em 120 semanas com fama 70");
});

teste("Mercado: pedir para sair para um mercado específico tira o jogador do Golfo", () => {
  const r = criarJogador({ nome: "Golfo", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "golfo" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "golfo");
  const w = mundo(pacote), c = s.carreira, m = mercadoDe(c);
  s.jogador.idade = 29; c.formacao = false; c.salario = 900000; c.anosContrato = 3; c.fama = 70;
  for (const k of Object.keys(s.jogador.at) as (keyof typeof s.jogador.at)[]) s.jogador.at[k] = 78;
  mudarDeClube(pacote, s, w.clube["SA-AHL"], "transferencia", 20e6); m.transferencias = [];
  const rel0 = c.relTecnico;
  assert.ok(pedirParaSair(s, true, "europa").ok); assert.ok(c.relTecnico < rel0 - 8, "pedido com destino pesa mais");
  for (let k = 0; k < 4; k++) { c.semana = 20 + k; semanaDoMercado(pacote, s, new RNG(`g${k}`), []); }
  const europa = m.propostas.filter((p) => ["ENG1", "ENG2", "ESP1", "ESP2", "ITA1", "GER1", "FRA1", "POR1", "NED1"].includes(p.ligaId));
  assert.ok(europa.length > 0, `sem proposta da Europa: ${m.propostas.map((p) => p.ligaId).join(",")}`);
  m.propostas = []; pedirParaSair(s, false); assert.ok(pedirParaSair(s, true, "casa").ok);
  for (let k = 0; k < 4; k++) { c.semana = 20 + k; semanaDoMercado(pacote, s, new RNG(`h${k}`), []); }
  assert.ok(m.propostas.some((p) => p.ligaId.startsWith("BRA")), "sem proposta do Brasil");
});

teste("Mercado: transferência para outra liga, empréstimo, renovação, agente e passe livre", () => {
  const r = criarJogador({ nome: "Mercado", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "MEI", semente: "mercado" });
  const dados = { resultado: r, aparencia: {}, clube: "FLA" };
  const s = novoJogo(pacote, dados, ofertasDeBase(pacote, dados)[0].clubeId, "mercado");
  const w = mundo(pacote), c = s.carreira, m = mercadoDe(c);
  s.jogador.idade = 19; c.formacao = false; c.salario = 20000; c.anosContrato = 3;
  for (const k of Object.keys(s.jogador.at) as (keyof typeof s.jogador.at)[]) s.jogador.at[k] = 74;
  // janela aberta: aparecem propostas em algumas semanas
  c.semana = 0; let eventos: string[] = [];
  for (let k = 0; k < 4; k++) { c.semana = k; semanaDoMercado(pacote, s, new RNG(`t${k}`), eventos); }
  assert.ok(m.propostas.length > 0, "nenhuma proposta para um jogador de nível 74");
  // aceitar uma proposta de outra liga muda liga, tabela e calendário
  const destino = w.liga.FRA1.clubes[3];
  const p: PropostaSave = { id: "x1", tipo: "livre", clubeId: destino.id, ligaId: "FRA1", salario: 90000, anos: 3, taxa: 0, luvas: 100000, papel: "titular", interesse: 0.8, expira: 999 };
  m.propostas = [p]; c.semana = 22;
  const saldo0 = s.casa.saldo;
  assert.ok(aceitar(pacote, s, "x1").ok);
  assert.equal(c.ligaId, "FRA1"); assert.equal(c.clubeId, destino.id); assert.equal(c.ordem.length, 18);
  assert.ok(c.tabela.every((t) => w.clube[t.clube].ligaId === "FRA1") && c.tabela.some((t) => t.j > 0), "tabela da liga nova com as rodadas já jogadas");
  assert.ok(s.casa.saldo > saldo0, "luvas na conta");
  assert.equal(m.transferencias.at(-1)!.para, destino.id);
  // empréstimo: volta ao fim da temporada
  m.propostas = [{ id: "x2", tipo: "emprestimo", clubeId: w.liga.FRA1.clubes[10].id, ligaId: "FRA1", salario: c.salario, anos: 0, taxa: 0, luvas: 0, papel: "titular", interesse: 0.7, expira: 999 }];
  assert.ok(aceitar(pacote, s, "x2").ok);
  assert.equal(c.clubeId, w.liga.FRA1.clubes[10].id);
  c.temporada++; eventos = [];
  fimDaTemporadaNoMercado(pacote, s, eventos);
  assert.equal(c.clubeId, destino.id, "voltou do empréstimo");
  // renovação muda contrato
  m.propostas = [{ id: "x3", tipo: "renovacao", clubeId: c.clubeId, ligaId: "FRA1", salario: 150000, anos: 4, taxa: 0, luvas: 0, papel: "titular", interesse: 0.8, expira: 999 }];
  assert.ok(aceitar(pacote, s, "x3").ok); assert.equal(c.anosContrato, 4); assert.equal(c.salario, 150000);
  // agente: superagente exige fama ou nível
  c.fama = 0; for (const k of Object.keys(s.jogador.at) as (keyof typeof s.jogador.at)[]) s.jogador.at[k] = 60;
  assert.equal(podeContratarAgente(s, "top").ok, false);
  c.fama = 40; mercadoDe(c).agenteDesde = undefined;
  assert.ok(trocarAgente(s, "top").ok); assert.equal(c.agente, "top");
  // contrato vencido: assina com outro clube ou fica com contrato curto
  c.anosContrato = 0; const antes = c.clubeId; eventos = [];
  assert.ok(contratoVencido(pacote, s, eventos)); assert.ok(c.anosContrato >= 1); assert.ok(eventos.length === 1, antes);
  // papel no clube faz sentido
  for (const k of Object.keys(s.jogador.at) as (keyof typeof s.jogador.at)[]) s.jogador.at[k] = 90;
  assert.equal(papelNoClube(w.liga.BRA2.clubes[0], s), "titular");
  void mudarDeClube;
});

console.log(`\n${ok} testes passaram`);
