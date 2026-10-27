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
import { mundo, sincronizarMundo, baseDoClube, viradaAtual, nivelDaBase, ondeJoga, rankingDaLiga, janelaDoMundo, historicoDe, statsDaLinha, agentesLivres, selecaoDaRodada, selecaoDoMes, premiosDaLiga, todasSelecoes, selecaoDe, idSelecao } from "../src/mundo.js";
import { convocado, participantesCopa, escalacaoSelecao } from "../src/jogo.js";
import { premiosDoAno, type ContextoPremios } from "../src/premios-mundo.js";
import type { Candidato } from "../src/mundo.js";
import { infoLiga } from "../src/ligas.js";
import { oferecerJogador, aceitar, mercadoDe, semanaDoMercado, trocarAgente, podeContratarAgente, mudarDeClube, fimDaTemporadaNoMercado, contratoVencido, papelNoClube, pedirParaSair, type PropostaSave } from "../src/transferencias.js";
import { CONQUISTAS, reliquiasDaPartida, premiosDaTemporada, type DadosPartida } from "../src/reliquias.js";
import { bonusJovem, chanceSubir, culturaBase } from "../src/identidade.js";
import { alvoSeguidores, semanaRedes, imposto } from "../src/vida.js";
import { tetoSalarial } from "../src/mercado.js";
import { MARCAS, MARCA, ofertasDaMarca, marcaInteressada } from "../src/marcas.js";
import { novoJogo, ofertasDeBase, semanaAutomatica, SEMANAS_TEMPORADA, prepararPartida, planoPadrao, resolverDecisao, concluirSemana, decisaoComemoracao, decisaoPosJogo, migrarSave, resolverEvento } from "../src/jogo.js";
import { agirRelacao, treinarPosicao, mudarPosicao, familiaridadeDe, jogoDaSemana, melhoresAmigos, ovr as ovrJ, ovrEm } from "../src/jogo.js";
import { estrelas, relacoesDe, chanceCamisa } from "../src/relacoes.js";
import { caminhoDe, aceitarConvite, caminhosDisponiveis } from "../src/caminhos.js";
import { ofertasDoCaminho, gradeDoClube, escolherNumero, saidasAtuais, elencoAtual, janelasDeLance, familiaDe, namoroDe, agirFamiliaJogo, curtirPerfil, perfisDaSemana, agirNamoroJogo, agirRelacao as agirRel2 } from "../src/jogo.js";
import { gerarFamilia, idadeDe, acoesDe, temporadaFamilia, semanaFamilia, riscoLesaoFamilia, membro as membroFam } from "../src/familia.js";
import { efeitosNamoro, IDADE_MINIMA_APP } from "../src/namoro.js";
import { RNG as RNG2 } from "../src/rng.js";
import { numerosDoClube } from "../src/numeros.js";
import { ganhoSemanal, semanasParaAprender } from "../src/posicoes.js";
import { SITUACOES, SITUACAO, POS_JOGO, COMEMORACAO } from "../src/lances.js";
import { COPAS, SEMANAS_COPA, novaCopa, rodarSemana, classificados, regiaoNaCopa, jogoDoClubeNaSemana, confederacao, type CopaId } from "../src/copas.js";
import { CONVIDADOS } from "../src/convidados.js";
import { nivelBase } from "../src/evolucao.js";
import { copasDe, jogoCopaDaSemana, diasTravados, concluirJogoDaCopa, escalacao, fatorDoClube, participantesMundial } from "../src/jogo.js";
import { criarJogador, formacaoPermitida, PAISES, FORMACOES, FAMILIAS, type EscolhasCriacao } from "../src/dna.js";

let ok = 0;
const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
// cada teste começa com o mundo de 2026 (as carreiras de outros testes fazem o mundo andar)
const teste = (nome: string, fn: () => void) => { sincronizarMundo(pacote, "", 0); fn(); ok++; console.log("ok -", nome); };
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
        for (const d of p.decisoes) assert.ok(d.min > p.entrada && d.min < Math.min(90, p.saida), `lance aos ${d.min}' fora do tempo em campo (${p.entrada}'–${p.saida}')`);
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

teste("Lances só com o jogador em campo: entrou do banco, saiu cansado", () => {
  for (const [ent, sai] of [[0, 90], [55, 90], [80, 90], [87, 90], [0, 60], [0, 75], [62, 90]]) for (const n of [1, 2, 3]) {
    const js = janelasDeLance(ent, sai, n);
    for (const [lo, hi] of js) assert.ok(lo > ent && hi < sai && lo <= hi, `${ent}-${sai} n${n}: [${lo}, ${hi}]`);
    for (let i = 1; i < js.length; i++) assert.ok(js[i][0] > js[i - 1][1], "janelas sem sobreposição");
  }
  assert.equal(janelasDeLance(91, 90, 1).length, 0, "não entrou: nenhum lance");
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

teste("Mundo: ligas reais em paródia, pirâmide brasileira até a Série D, MLS e ligas amadoras", () => {
  const w = mundo(pacote);
  assert.deepEqual(w.ligas.map((l) => l.id).sort(), ["ARG1", "BRA1", "BRA2", "BRA3", ..."ABCDEFGH".split("").map((g) => `BRA4${g}`), "CHI1", "COL1", "ECU1", "ENG1", "ENG2", "ESP1", "ESP2", "FRA1", "GER1", "ITA1", "KSA1", "MEX1", "NED1", "PAR1", "POR1", "TUR1", "URU1", "USA1"]);
  assert.equal(w.amadoras.length, 10);
  assert.equal(Object.values(w.clube).filter((c) => c.ligaId !== "SELECOES").length, 516 + CONVIDADOS.length + 116);
  assert.equal(w.liga.USA1.clubes.length, 30); assert.equal(w.liga.BRA3.clubes.length, 20);
  assert.equal("ABCDEFGH".split("").reduce((a, g) => a + w.liga[`BRA4${g}`].clubes.length, 0), 96);
  assert.ok(w.clube["US-MIA"].elenco.some((j) => j.nome === "Lionel Mesi" && j.ovr >= 85), "o craque da liga americana");
  const nomes = w.ligas.filter((l) => l.id !== "BRA1").flatMap((l) => l.clubes.flatMap((c) => c.elenco.map((j) => j.nome)));
  assert.equal(new Set(nomes).size, nomes.length, "nomes de jogadores repetidos");
  for (const c of Object.values(w.clube)) {
    const n = (p: string) => c.elenco.filter((j) => j.posicao === p).length;
    assert.ok(n("GOL") >= 2 && n("ZAG") >= 3 && n("LAT") >= 2 && n("ATA") >= 2, `posições em ${c.id}`);
  }
  for (const l of w.ligas) {
    assert.ok(l.clubes.length % 2 === 0 && l.clubes.length >= (l.id.startsWith("BRA4") || ["URU1", "CHI1", "PAR1", "ECU1"].includes(l.id) ? 12 : 18), l.id);
    for (const c of l.clubes) { assert.ok(w.info[c.id]?.estadio && w.info[c.id].cores.length >= 2, c.id); assert.ok(c.elenco.length >= 20 && c.elenco.every((j) => !/^[A-Z]{3}-\d/.test(j.nome)), c.id); }
  }
  const forca = (id: string) => w.liga[id].clubes.reduce((a, c) => a + c.forca, 0) / w.liga[id].clubes.length;
  assert.ok(forca("ENG1") > forca("ENG2") && forca("ESP1") > forca("ESP2") && forca("BRA1") > forca("BRA2") && forca("ENG1") > forca("BRA1"));
  assert.ok(forca("BRA2") > forca("BRA3") && forca("BRA3") > forca("BRA4G") && forca("BRA4G") > forca("VAR-SP"), "pirâmide brasileira");
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
  // contrato vencido: vira agente livre (sem salário, escolhe entre as propostas)
  c.anosContrato = 0; const antes = c.clubeId; eventos = [];
  assert.ok(contratoVencido(pacote, s, eventos)); assert.ok(mercadoDe(c).semClube && (c.salario as number) === 0); assert.ok(eventos.length === 1, antes);
  // papel no clube faz sentido
  for (const k of Object.keys(s.jogador.at) as (keyof typeof s.jogador.at)[]) s.jogador.at[k] = 90;
  assert.equal(papelNoClube(w.liga.BRA2.clubes[0], s), "titular");
  void mudarDeClube;
});

teste("Estrelas espalhadas por todas as ligas, craques de verdade no topo", () => {
  const est = estrelas(pacote), w = mundo(pacote);
  assert.ok(est[0].ovr >= 88 && est.filter((e) => e.ovr >= 85).length >= 15);
  for (const l of w.ligas.filter((x) => !x.id.startsWith("BRA4"))) {
    const n = est.filter((e) => w.info[e.clubeId].ligaId === l.id).length;
    assert.ok(n >= Math.floor(l.clubes.length / 2) - 2, `${l.id}: ${n} estrelas para ${l.clubes.length} clubes`);
  }
  assert.ok(chanceCamisa(90, 50, 90) > chanceCamisa(10, 50, 90), "amizade aumenta a chance da camisa");
  assert.ok(chanceCamisa(50, 90, 90) > chanceCamisa(50, 10, 90), "fama aumenta a chance da camisa");
});

teste("Relações: convivência cria amigos, limite de conversas e troca de camisa", () => {
  const r = criarJogador({ nome: "Amigo", pais: "BRA", familia: "media", formacao: "rua", alturaCm: 178, pe: "direito", posicao: "PON", semente: "rel" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "rel");
  for (let k = 0; k < 12; k++) semanaAutomatica(pacote, s);
  const rr = relacoesDe(s.carreira);
  assert.ok(Object.values(rr.lista).filter((x) => x.companheiro).length >= 7, "conheceu o elenco");
  const est = estrelas(pacote)[0];
  assert.ok(agirRelacao(pacote, s, est.nome, "redes").ok);
  assert.equal(agirRelacao(pacote, s, est.nome, "mensagem").ok, false, "uma vez por semana com cada um");
  const comp = Object.values(rr.lista).filter((x) => x.companheiro);
  assert.ok(agirRelacao(pacote, s, comp[0].nome, "mensagem").ok && agirRelacao(pacote, s, comp[1].nome, "mensagem").ok);
  assert.equal(agirRelacao(pacote, s, comp[2].nome, "mensagem").ok, false, "três por semana");
  // troca de camisa: profissional, amigo de todas as estrelas e pedindo a camisa toda semana
  const c = s.carreira; c.formacao = false; c.fama = 80; s.jogador.idade = 24;
  for (const k of Object.keys(s.jogador.at) as (keyof typeof s.jogador.at)[]) s.jogador.at[k] = 92;
  let trocas = 0;
  for (let k = 0; k < 30 && !trocas; k++) {
    const jg = jogoDaSemana(s), e = jg && estrelas(pacote).find((x) => x.clubeId === jg.adversario);
    if (e) { const x = rr.lista[e.nome] ?? (rr.lista[e.nome] = { nome: e.nome, clubeId: e.clubeId, nivel: 100, desde: 2026 }); x.nivel = 100; rr.camisaPedida = e.nome; }
    semanaAutomatica(pacote, s);
    trocas = Object.values(rr.lista).filter((x) => x.camisa).length;
  }
  assert.ok(trocas >= 1, "trocou ao menos uma camisa");
  assert.ok((s.casa.reliquias ?? []).some((x) => x.chave === "camisa-troca"), "a camisa vai para a casa");
  assert.ok(melhoresAmigos(pacote, c).length >= 1);
});

teste("Treino de posição: ponta vira centroavante mais rápido do que zagueiro", () => {
  const r = criarJogador({ nome: "Pos", pais: "BRA", familia: "media", formacao: "rua", alturaCm: 178, pe: "direito", posicao: "PON", semente: "pos" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "pos"), j = s.jogador;
  assert.ok(ganhoSemanal(j.at, "PON", "ATA", false, 0) > 2 * ganhoSemanal(j.at, "PON", "ZAG", false, 0));
  assert.ok(semanasParaAprender(j.at, "PON", "ATA", 28) < semanasParaAprender(j.at, "PON", "LAT", 21));
  assert.ok(ovrEm(j, "ZAG") < ovrJ(j), "posição sem treino rende menos");
  assert.equal(mudarPosicao(s, "ATA").ok, false);
  treinarPosicao(s, "ATA");
  const antes = familiaridadeDe(j).ATA!;
  for (let k = 0; k < 20; k++) semanaAutomatica(pacote, s);
  assert.ok(familiaridadeDe(j).ATA! > antes + 30, `ATA ${antes} → ${familiaridadeDe(j).ATA}`);
  assert.ok(mudarPosicao(s, "ATA").ok); assert.equal(j.posicao, "ATA");
});

teste("Caminhos: várzea aos 14, família paga as contas e olheiro leva para a base", () => {
  const r = criarJogador({ nome: "Varzeano", pais: "BRA", familia: "humilde", formacao: "rua", alturaCm: 175, pe: "direito", posicao: "PON", semente: "varzea" });
  assert.deepEqual(caminhosDisponiveis("BRA", "humilde"), ["base", "varzea"]);
  assert.ok(caminhosDisponiveis("ARG", "rica").includes("eua_escola") && !caminhosDisponiveis("ARG", "rica").includes("varzea"));
  const d = { resultado: r, aparencia: {}, clube: "FLA", caminho: "varzea" as const, cidade: "RJ" };
  const of = ofertasDoCaminho(pacote, d, "varzea", "RJ");
  assert.ok(of.length === 3 && of.every((o) => o.clubeId.startsWith("V-RJ")));
  const s = novoJogo(pacote, d, of[0].clubeId, "varzea");
  assert.equal(s.jogador.idade, 14); assert.equal(s.carreira.fase, "varzea"); assert.equal(s.carreira.salario, 0); assert.equal(s.carreira.ligaId, "VAR-RJ");
  assert.ok(ovrJ(s.jogador) < r.ovr, "aos 14 ainda é menos desenvolvido");
  const saldo = s.casa.saldo;
  for (let k = 0; k < 8; k++) semanaAutomatica(pacote, s, false);
  assert.equal(s.casa.saldo, saldo, "a família banca a várzea");
  let convite = false;
  for (let k = 0; k < 40 * 3 && s.carreira.fase === "varzea"; k++) { if (caminhoDe(s.carreira).convites.length) convite = true; semanaAutomatica(pacote, s); }
  assert.ok(convite, "apareceu convite de peneira");
  assert.ok(!s.carreira.fase && s.carreira.formacao && mundo(pacote).info[s.carreira.clubeId].ligaId.startsWith("BRA"), "foi para a base de um clube profissional");
});

teste("Caminhos: high school, universidade e draft da liga americana", () => {
  const r = criarJogador({ nome: "Colegial", pais: "BRA", familia: "rica", formacao: "academia", alturaCm: 182, pe: "direito", posicao: "MEI", semente: "colegial" });
  const d = { resultado: r, aparencia: {}, clube: "PAL", caminho: "eua_escola" as const };
  const s = novoJogo(pacote, d, ofertasDoCaminho(pacote, d, "eua_escola")[0].clubeId, "colegial"), c = s.carreira;
  assert.equal(s.jogador.idade, 15); assert.equal(c.ligaId, "USA-HS"); assert.equal(s.casa.imovel, "aloj-familia");
  while (s.jogador.idade < 18) semanaAutomatica(pacote, s, false);
  const unis = caminhoDe(c).convites.filter((x) => x.tipo === "universidade");
  assert.equal(unis.length, 3, "três bolsas no fim do colégio");
  assert.ok(aceitarConvite(pacote, s, unis[0].id).ok);
  assert.equal(c.fase, "universidade"); assert.equal(c.ligaId, "USA-NCAA");
  for (const k of Object.keys(s.jogador.at) as (keyof typeof s.jogador.at)[]) s.jogador.at[k] = Math.max(s.jogador.at[k], 66);
  s.jogador.pot = 82;
  for (let k = 0; k < 40 * 2; k++) semanaAutomatica(pacote, s, false);
  const dr = caminhoDe(c).convites.find((x) => x.tipo === "draft");
  assert.ok(dr && dr.pick! <= 30 && mundo(pacote).info[dr.clubeId].ligaId === "USA1", "escolhido no draft");
  assert.ok(aceitarConvite(pacote, s, dr!.id).ok);
  assert.ok(!c.fase && !c.formacao && c.ligaId === "USA1" && c.salario >= 40000, "profissional na liga americana");
});

teste("Caminhos: academia nos EUA e contrato homegrown antes dos 18", () => {
  const r = criarJogador({ nome: "Homegrown", pais: "ENG", familia: "rica", formacao: "academia", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "homegrown" });
  const d = { resultado: r, aparencia: {}, clube: null, caminho: "eua_academia" as const };
  const s = novoJogo(pacote, d, "US-PHI", "homegrown"), c = s.carreira;
  assert.equal(c.fase, "academia"); assert.ok(c.formacao);
  for (const k of Object.keys(s.jogador.at) as (keyof typeof s.jogador.at)[]) s.jogador.at[k] = 64;
  for (let k = 0; k < 40; k++) semanaAutomatica(pacote, s, false);
  const hg = caminhoDe(c).convites.find((x) => x.tipo === "homegrown");
  assert.ok(hg && s.jogador.idade === 15, "homegrown aos 15");
  aceitarConvite(pacote, s, hg!.id);
  assert.ok(!c.formacao && c.clubeId === "US-PHI" && c.salario >= 40000);
});

teste("Número da camisa: únicos no elenco, saídas liberam número, escolha ao chegar e no começo da temporada", () => {
  const w = mundo(pacote);
  for (const c of Object.values(w.clube)) { const ns = [...numerosDoClube(c).values()]; assert.equal(new Set(ns).size, ns.length, c.id); assert.ok(ns.every((n) => n >= 1 && n <= 99), c.id); }
  assert.equal(numerosDoClube(w.clube["US-MIA"]).get("Lionel Mesi"), 10);
  const r = criarJogador({ nome: "Camisa", pais: "BRA", familia: "media", formacao: "rua", alturaCm: 178, pe: "direito", posicao: "PON", semente: "camisa" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "camisa"), c = s.carreira;
  c.formacao = false; s.jogador.idade = 20;
  const g = gradeDoClube(pacote, s), ocupado = g.find((x) => x.dono)!, livre = g.find((x) => !x.dono && !x.meu)!;
  assert.equal(escolherNumero(pacote, s, ocupado.numero).ok, false);
  assert.ok(escolherNumero(pacote, s, livre.numero).ok); assert.equal(s.jogador.numero, String(livre.numero));
  // virada de temporada: gente sai (aposentadoria, venda, dispensa), os números ficam livres e a escolha aparece
  while (c.temporada === 0) semanaAutomatica(pacote, s);
  const fora = saidasAtuais(pacote, s);
  assert.ok(fora.length >= 1);
  assert.ok(elencoAtual(pacote, s).every((j) => !fora.includes(j.nome)));
  assert.ok(gradeDoClube(pacote, s).filter((x) => x.liberado).length >= 1);
  assert.ok(c.escolhaNumero, "começo de temporada: hora de escolher a camisa");
  semanaAutomatica(pacote, s);
  assert.equal(c.escolhaNumero, undefined, "a política automática escolheu");
  // chegada: transferência pede escolha
  {
    mercadoDe(c).propostas = [{ id: "n1", tipo: "livre", clubeId: "US-MIA", ligaId: "USA1", salario: 50000, anos: 2, taxa: 0, luvas: 0, papel: "reserva", interesse: 0.7, expira: 999 }];
    c.semana = 1;
    assert.ok(aceitar(pacote, s, "n1").ok);
    assert.equal(c.escolhaNumero, "chegada");
    const dez = gradeDoClube(pacote, s)[9];
    assert.equal(escolherNumero(pacote, s, 10).ok, !dez.dono, "a 10 só se estiver livre");
  }
});

teste("Família: pai, mãe e irmãos sorteados; irmão mais velho jogador num clube; irmão mais novo vai para a base", () => {
  let comIrmaoPro = 0, comNovo = 0, treinador = 0, total = 0;
  for (let i = 0; i < 300; i++) {
    const f = gerarFamilia(pacote, { semente: `fam${i}`, nome: "Lucas Andrade", pais: i % 3 ? "BRA" : "ARG", origem: ["humilde", "media", "rica"][i % 3], idade: 16, ano: 2026 });
    total++;
    assert.ok(f.membros.some((m) => m.id === "pai") && f.membros.some((m) => m.id === "mae"));
    assert.ok(f.membros.length <= 4);
    for (const m of f.membros) {
      assert.ok(m.relacao >= 0 && m.relacao <= 100);
      if (m.parentesco === "pai" || m.parentesco === "mae") assert.ok(idadeDe(m, 2026) >= 34, "pais adultos");
      if (m.futebol?.fase === "pro") { comIrmaoPro++; assert.ok(m.futebol.clubeId && mundo(pacote).clube[m.futebol.clubeId], "irmão joga num clube que existe"); assert.ok(idadeDe(m, 2026) >= 18); }
      if (m.futebol && m.futebol.fase !== "pro") comNovo++;
    }
    if (f.membros[0].traco === "treinador") treinador++;
  }
  assert.ok(comIrmaoPro > 5 && comIrmaoPro < 80, `irmãos profissionais: ${comIrmaoPro}`);
  assert.ok(comNovo > 30, `irmãos mais novos que jogam: ${comNovo}`);
  assert.ok(treinador > 20 && treinador < 90, `pais treinadores: ${treinador}`);
  // na carreira: sorteada sozinha, ações gastam o limite da semana, indicar o irmão à base
  const r = criarJogador({ nome: "Lucas Andrade", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "familia-teste" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "familia-teste");
  const f = familiaDe(pacote, s);
  assert.ok(agirFamiliaJogo(pacote, s, "mae", "ligar").ok);
  assert.ok(agirFamiliaJogo(pacote, s, "pai", "ligar").ok);
  assert.equal(agirFamiliaJogo(pacote, s, "mae", "ligar").ok, false, "só duas por semana");
  f.membros.push({ id: "irmT", parentesco: "irmao", nome: "Davi Andrade", nasc: 2026 - 15, profissao: "Estudante", relacao: 70, contato: 0, futebol: { fase: "amador", posicao: "MEI", ovr: 50, pot: 92 } });
  s.carreira.formacao = false; s.carreira.semana = 3; s.carreira.temporada = 0;
  const ctx = { semanaAbs: 99, ano: 2026, idadeJogador: 18, exterior: false, salario: 20000, saldo: 0, profissional: true, clubeId: "FLA", forcaClube: 78, relTecnico: 70, fama: 30, jogoEmCasa: false, janela: false, temporada: 0 };
  assert.ok(acoesDe(f.membros.at(-1)!, ctx).includes("indicarBase"));
  // irmão na base sobe a profissional aos 18 se for bom o bastante
  const irm = f.membros.at(-1)!; irm.futebol = { fase: "base", posicao: "MEI", ovr: 70, pot: 92, clubeId: "FLA" }; irm.nasc = 2026 - 17;
  const ev: string[] = []; temporadaFamilia(pacote, f, new RNG2("t"), 2027, "BRA", ev);
  assert.equal(irm.futebol!.fase, "pro"); assert.ok(ev.some((e) => e.includes("primeiro contrato")));
  // a semana roda com a família sem quebrar (moral dentro do limite)
  for (let w = 0; w < 6; w++) semanaAutomatica(pacote, s);
  assert.ok(s.carreira.moral >= 0 && s.carreira.moral <= 100);
});

teste("Namoro: app só para maiores; match, encontro, namoro; profissão mexe no jogo; quem some leva fora", () => {
  const r = criarJogador({ nome: "Rafael Dias", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "PON", semente: "namoro-teste" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "namoro-teste");
  s.jogador.idade = 17;
  assert.equal(perfisDaSemana(pacote, s).length, 0, "menor de idade não vê o app");
  s.jogador.idade = 20; s.carreira.fama = 60; s.casa.saldo = 1e6; s.carreira.salario = 50000;
  const perfis = perfisDaSemana(pacote, s);
  assert.equal(perfis.length, 6);
  assert.ok(perfis.every((p) => p.idade >= IDADE_MINIMA_APP), "todas adultas");
  let matches = 0;
  for (let w = 0; w < 8 && !matches; w++) { for (const p of perfisDaSemana(pacote, s).slice()) if (curtirPerfil(pacote, s, p.id, true).match) matches++; s.carreira.semana++; }
  assert.ok(matches > 0, "com fama alta, sai match");
  const n = namoroDe(s.carreira), m = n.matches[0];
  m.relacao = 80; m.conversas = 3;
  assert.ok(agirNamoroJogo(pacote, s, m.id, "convidar").ok);
  if (n.par) {
    n.par.relacao = 95; s.carreira.semana++;
    agirNamoroJogo(pacote, s, n.par.id, "pedirNamoro");
    assert.equal(n.par.etapa, "namorando");
    n.par.profissao = "psicologa"; assert.ok(efeitosNamoro(n).moral > efeitosNamoro({ ...n, par: { ...n.par, profissao: "estudante" } }).moral, "psicóloga dá moral");
    n.par.profissao = "influencer"; assert.ok(efeitosNamoro(n).fama > 0, "influencer dá fama");
    n.par.relacao = 6; s.carreira.vidaNoturna = 90;
    for (let w = 0; w < 4 && n.par; w++) semanaAutomatica(pacote, s);
    assert.equal(n.par, undefined, "relação fria demais termina");
    assert.ok(n.ex.length >= 1);
  }
});

teste("Busca do celular: qualquer jogador de qualquer clube vira contato", () => {
  const r = criarJogador({ nome: "Teste Busca", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "busca" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: "FLA" }, "FLA", "busca");
  const cl = mundo(pacote).liga.ENG2.clubes[0], alvo = cl.elenco[5].nome;
  assert.ok(agirRel2(pacote, s, alvo, "mensagem", cl.id).ok);
  assert.ok(s.carreira.relacoes!.lista[alvo], "virou contato");
});

teste("Família escolhida na criação: pai e irmãos do jeito pedido, com lado bom e lado ruim", () => {
  const base = { semente: "esc", nome: "Lucas Andrade", pais: "BRA", origem: "media", idade: 16, ano: 2026 };
  const t = gerarFamilia(pacote, { ...base, escolha: { pai: "treinador", irmaos: "unico" } });
  assert.equal(membroFam(t, "pai")!.traco, "treinador");
  assert.equal(t.membros.length, 2, "filho único: só pai e mãe");
  assert.equal(riscoLesaoFamilia(t), 1.15, "pai treinador: treino extra em casa, mais lesão");
  const cobra = semanaFamilia(t, { semanaAbs: 1, exterior: false, padraoFamilia: 1, polemica: false, clubeId: "x", nota: 5.2, ovrJogador: 50 });
  const tranquilo = semanaFamilia(gerarFamilia(pacote, { ...base, escolha: { pai: "treinador", irmaos: "unico" } }), { semanaAbs: 1, exterior: false, padraoFamilia: 1, polemica: false, clubeId: "x", nota: 7.5, ovrJogador: 50 });
  assert.ok(cobra.moral < tranquilo.moral && cobra.avisos.length > 0, "jogo ruim: o pai cobra");
  const ex = gerarFamilia(pacote, { ...base, escolha: { pai: "exJogador", irmaos: "velhoPro" } });
  assert.equal(membroFam(ex, "pai")!.traco, "exJogador");
  const irm = ex.membros.find((m) => m.futebol?.fase === "pro")!;
  assert.ok(irm && irm.futebol!.clubeId && idadeDe(irm, 2026) >= 19, "irmão mais velho profissional num clube do mundo");
  assert.ok(semanaFamilia(ex, { semanaAbs: 1, exterior: false, padraoFamilia: 1, polemica: false, clubeId: "x", nota: 7, ovrJogador: 45 }).pressao > 0, "a sombra do pai ex-jogador");
  const nv = gerarFamilia(pacote, { ...base, escolha: { pai: "comum", irmaos: "novoBoleiro" } });
  assert.equal(membroFam(nv, "pai")!.traco, undefined);
  const novo = nv.membros.find((m) => m.futebol)!;
  assert.ok(novo && idadeDe(novo, 2026) < 16 && (novo.futebol!.fase === "amador" || novo.futebol!.fase === "crianca"), "irmão mais novo boleiro");
  assert.equal(riscoLesaoFamilia(nv), 1);
});

teste("Base no país do jogador: espanhol começa na La Lyga, uruguaio na Argentina, brasileiro na Série A", () => {
  for (const [pais, liga] of [["ESP", "ESP1"], ["URU", "URU1"], ["JPN", "GER1"], ["BRA", undefined]] as const) {
    const r = criarJogador({ nome: "Teste Pais", pais, familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "MEI", semente: `base${pais}` });
    const dados = { resultado: r, aparencia: {}, clube: null };
    const of = ofertasDeBase(pacote, dados);
    assert.equal(of.length, 3);
    const s = novoJogo(pacote, dados, of[0].clubeId, `base${pais}`);
    assert.equal(s.carreira.ligaId, liga, `${pais}: liga da base`);
    if (liga) assert.ok(of.every((o) => mundo(pacote).info[o.clubeId].ligaId === liga), `${pais}: ofertas da liga certa`);
    for (let i = 0; i < 6; i++) semanaAutomatica(pacote, s);
  }
});

teste("Copas continentais: formatos, classificados, sem jogo duplo na semana e um campeão", () => {
  const w = mundo(pacote), forca = (id: string) => w.clube[id]?.forca ?? 60, pais = (id: string) => w.clube[id]?.pais ?? "";
  const fonte = { ligas: w.liga, semente: "copas", temporada: 2026 };
  const esperado: Partial<Record<CopaId, { clubes: number; jogos: number }>> = { LIB: { clubes: 32, jogos: 125 }, UCL: { clubes: 36, jogos: 189 }, ACL: { clubes: 24, jogos: 119 } };
  for (const id of ["LIB", "UCL", "ACL"] as CopaId[]) {
    const cl = classificados(fonte, id);
    assert.equal(cl.length, esperado[id]!.clubes, `${id}: classificados`);
    assert.equal(new Set(cl).size, cl.length, `${id}: clube repetido`);
    const e = novaCopa(id, 2026, cl, forca, pais, regiaoNaCopa, "copas");
    const rng = new RNG(`rodar-${id}`);
    for (let sem = 0; sem < SEMANAS_TEMPORADA; sem++) {
      rodarSemana(e, sem, forca, rng);
      for (const c of cl) assert.ok(e.jogos.filter((j) => j.semana === sem && (j.casa === c || j.fora === c)).length <= 1, `${id}: ${c} joga duas vezes na semana ${sem}`);
    }
    assert.equal(e.jogos.length, esperado[id]!.jogos, `${id}: número de jogos`);
    assert.ok(e.jogos.every((j) => j.gc !== undefined), `${id}: jogo sem resultado`);
    assert.ok(e.campeao && cl.includes(e.campeao), `${id}: campeão`);
    const final = e.jogos.filter((j) => j.fase === "final");
    assert.equal(final.length, 1, `${id}: final em jogo único`); assert.ok(final[0].neutro, `${id}: final em campo neutro`);
    assert.ok(Object.values(SEMANAS_COPA[id as "LIB"]).flat().every((x) => x >= 2 && x < SEMANAS_TEMPORADA), `${id}: semanas dentro da temporada`);
  }
  // Libertadora: grupos sem dois clubes do mesmo país; Champions: 8 rodadas de liga para todo mundo
  const lib = novaCopa("LIB", 2026, classificados(fonte, "LIB"), forca, pais, regiaoNaCopa, "copas");
  for (const g of Object.values(lib.tabelas)) { const ps = g.map((x) => pais(x.clube)); assert.equal(new Set(ps).size, ps.length, "país repetido no grupo"); }
  const ucl = novaCopa("UCL", 2026, classificados(fonte, "UCL"), forca, pais, regiaoNaCopa, "copas");
  for (const c of ucl.clubes) assert.equal(ucl.jogos.filter((j) => j.fase === "liga" && (j.casa === c || j.fora === c)).length, 8, c);
});

teste("Semana com jogo de copa: quarta travada, jogo de quarta antes do domingo e temporada fechada com copa", () => {
  const r = criarJogador({ nome: "Teste Copa", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "copaFLA" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "FLA", "copaFLA");
  for (const k of ATRIBUTOS) s.jogador.at[k] = 86;
  s.jogador.idade = 22; s.carreira.formacao = false;
  const e = copasDe(pacote, s).LIB!;
  assert.ok(e.clubes.includes("FLA"), "Flamingo na Libertadora");
  while (!jogoCopaDaSemana(pacote, s)) { assert.deepEqual(diasTravados(s), []); semanaAutomatica(pacote, s); }
  assert.deepEqual(diasTravados(s), [2]);
  const plano = planoPadrao(), jc = jogoCopaDaSemana(pacote, s)!;
  assert.notEqual(escalacao(pacote, s, 0, true), "base");
  const p = prepararPartida(pacote, s, plano, jc)!;
  const cid = jc.copa.id, meu = s.carreira.clubeId;
  assert.equal(p.copa?.id, cid); assert.ok([p.casa, p.fora].includes(meu));
  const resumo = concluirJogoDaCopa(pacote, s, plano, p, [])!;
  assert.equal(resumo.competicao, COPAS[cid].nome);
  assert.equal(jogoCopaDaSemana(pacote, s), undefined, "jogo de quarta já jogado");
  assert.deepEqual(diasTravados(s), [2], "quarta segue travada até a semana fechar");
  const sem = s.carreira.semana, liga = prepararPartida(pacote, s, plano);
  const rs = concluirSemana(pacote, s, plano, liga, []);
  assert.equal(rs.copa?.competicao, COPAS[cid].nome); assert.equal(s.carreira.semana, sem + 1); assert.equal(s.carreira.meioSemana, undefined);
  let fim;
  for (let i = 0; i < SEMANAS_TEMPORADA && !fim; i++) fim = semanaAutomatica(pacote, s, false).fimDeTemporada;
  assert.ok((fim?.copa?.jogos ?? 0) + (fim?.estadual?.jogos ?? 0) >= 6, "campanha nas copas no fim da temporada");
  assert.ok(s.carreira.historico.at(-1)!.copa || s.carreira.historico.at(-1)!.estadual);
  assert.ok(e.jogos.filter((j) => (j.casa === "FLA" || j.fora === "FLA")).every((j) => jogoDoClubeNaSemana({ LIB: e }, "FLA", j.semana)?.jogo.id === j.id));
});

teste("Base de cada clube: garotos de 15 a 19 anos, melhores no clube grande e formador, nomes que não são do profissional", () => {
  sincronizarMundo(pacote, "base", 0);
  const w = mundo(pacote), nomesPro = new Set(Object.values(w.clube).flatMap((c) => c.elenco.map((j) => j.nome)));
  const media = (id: string) => { const b = baseDoClube(pacote, id); return b.reduce((a, j) => a + (j.pot ?? 0), 0) / b.length; };
  for (const l of w.ligas) for (const c of l.clubes) {
    const b = baseDoClube(pacote, c.id);
    assert.equal(b.length, 25, c.id);
    assert.ok(b.every((j) => j.idade >= 15 && j.idade <= 19 && j.base && !nomesPro.has(j.nome) && (j.pot ?? 0) >= j.ovr), c.id);
  }
  assert.equal(baseDoClube(pacote, "V-SP-0").length, 0, "várzea não tem base");
  assert.ok(media("ES-BAR") > media("FLA") && media("FLA") > media("D-GALVEZAC"), "clube maior, base melhor");
  assert.ok(nivelBase("SAN", 72, "BRA").potMedio > nivelBase("BOT", 72, "BRA").potMedio && nivelBase("SAN", 72, "BRA").maxSobe > nivelBase("BOT", 72, "BRA").maxSobe, "a cultura de base pesa");
  assert.ok(nivelDaBase(pacote, "ES-BAR")!.fEvolucao > nivelDaBase(pacote, "SA-HIL")!.fEvolucao, "estrutura e cultura: evoluem mais");
});

teste("Mundo anda: todos envelhecem, jovem evolui, veterano cai ou se aposenta, base sobe, liga não infla, sempre igual", () => {
  const w = mundo(pacote), pos = (c: { elenco: { posicao: string }[] }, p: string) => c.elenco.filter((j) => j.posicao === p).length;
  const ref = Object.fromEntries(w.ligas.map((l) => [l.id, l.clubes.reduce((a, c) => a + c.forca, 0) / l.clubes.length]));
  const todosAntes = Object.values(w.clube).flatMap((c) => c.elenco.map((j) => j.nome));
  const repetidos = new Set(todosAntes.filter((n, i) => todosAntes.indexOf(n) !== i)); // homônimos dos dados reais
  const antes = new Map(Object.values(w.clube).flatMap((c) => c.elenco.filter((j) => !repetidos.has(j.nome)).map((j) => [j.nome, { ...j }])));
  // dois anos: quem tinha 30+ caiu
  sincronizarMundo(pacote, "anda", 2);
  let caiu = 0, veteranos = 0;
  for (const [nome, j0] of antes) {
    if (j0.idade < 30) continue;
    const o = ondeJoga(pacote, nome), j = o && w.clube[o.clubeId].elenco.find((x) => x.nome === nome);
    if (!j) continue;
    veteranos++; if (j.ovr < j0.ovr) caiu++;
  }
  assert.ok(veteranos > 500 && caiu / veteranos > 0.7, `${caiu}/${veteranos}`);
  sincronizarMundo(pacote, "anda", 6);
  for (const l of w.ligas) assert.ok(Math.abs(l.clubes.reduce((a, c) => a + c.forca, 0) / l.clubes.length - ref[l.id]) < 1.2, `${l.id} estável`);
  let cresceu = 0, aposentou = 0;
  for (const [nome, j0] of antes) {
    const o = ondeJoga(pacote, nome);
    if (!o) { if (j0.idade >= 30) aposentou++; continue; }
    const j = w.clube[o.clubeId].elenco.find((x) => x.nome === nome)!;
    if (!j) continue;
    assert.equal(j.idade, j0.idade + 6, nome);
    if (j0.idade <= 20 && j.ovr > j0.ovr + 3) cresceu++;
  }
  assert.ok(cresceu > 300 && aposentou > 1000, `${cresceu} ${aposentou}`);
  const nomes = Object.values(w.clube).filter((c) => c.ligaId !== "SELECOES").flatMap((c) => c.elenco.map((j) => j.nome)).filter((n) => !repetidos.has(n));
  assert.equal(new Set(nomes).size, nomes.length, "nomes únicos");
  for (const c of Object.values(w.clube)) {
    assert.ok(pos(c, "GOL") >= 2 && pos(c, "ZAG") >= 3 && pos(c, "LAT") >= 2 && pos(c, "ATA") >= 2, c.id);
    const ns = [...numerosDoClube(c).values()]; assert.equal(new Set(ns).size, ns.length, `números ${c.id}`);
  }
  const subiram = Object.values(viradaAtual(pacote).chegadas).flat().filter((x) => x.motivo === "subiu");
  assert.ok(subiram.length > 100 && subiram.every((x) => x.idade >= 18 && x.idade <= 20));
  const foto = JSON.stringify(w.clube["ES-BAR"].elenco);
  sincronizarMundo(pacote, "outra", 6); assert.notEqual(JSON.stringify(w.clube["ES-BAR"].elenco), foto, "outra carreira, outro mundo");
  sincronizarMundo(pacote, "anda", 6); assert.equal(JSON.stringify(w.clube["ES-BAR"].elenco), foto, "mesma carreira, mesmo mundo");
});

teste("Carreira na base: jogos e amigos com os garotos da base; o mundo acompanha a temporada; estrutura pesa no treino", () => {
  const r = criarJogador({ nome: "Teste Base", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 178, pe: "direito", posicao: "MEI", semente: "naBase" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "SAN", "naBase");
  const garotos = new Set(baseDoClube(pacote, "SAN").map((j) => j.nome.split(" ").pop()!));
  let p;
  for (let i = 0; i < 6 && !p; i++) { const pp = prepararPartida(pacote, s, planoPadrao()); if (pp && pp.escalacao === "base") p = pp; else semanaAutomatica(pacote, s); }
  assert.ok(p, "jogo da base");
  assert.ok([p!.nomes.goleiro, p!.nomes.meia, p!.nomes.zagMeu].some((n) => garotos.has(n)), "companheiros da base");
  for (let i = 0; i < 6; i++) semanaAutomatica(pacote, s);
  const amigos = Object.values(relacoesDe(s.carreira).lista).filter((x) => x.companheiro);
  assert.ok(amigos.length && amigos.every((x) => baseDoClube(pacote, "SAN").some((j) => j.nome === x.nome)), "amigos da base");
  while (s.carreira.temporada < 2) semanaAutomatica(pacote, s);
  assert.equal(JSON.stringify(mundo(pacote).clube.SAN.elenco), (sincronizarMundo(pacote, s.semente, 2), JSON.stringify(mundo(pacote).clube.SAN.elenco)));
  assert.ok(s.noticias.length > 0);
  const s2 = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "D-GALVEZAC", "naBase2");
  assert.ok(fatorDoClube(pacote, s) > 0.9 && fatorDoClube(pacote, s2) < fatorDoClube(pacote, { ...s, carreira: { ...s.carreira, clubeId: "ES-BAR" } }));
});

teste("Estatísticas dos outros: artilharia cresce rodada a rodada, marcas plausíveis, prêmio contra o melhor da liga", () => {
  sincronizarMundo(pacote, "stats", 0);
  for (const l of ["ENG1", "BRA1", "ARG1"]) {
    const meio = rankingDaLiga(pacote, l, 10, "g", 1)[0].valor, fim = rankingDaLiga(pacote, l, 999, "g", 1)[0].valor, a = rankingDaLiga(pacote, l, 999, "a", 1)[0].valor;
    assert.ok(meio < fim && fim >= 12 && fim <= 40 && a >= 7 && a <= 25, `${l}: ${meio} ${fim} ${a}`);
  }
  assert.ok(rankingDaLiga(pacote, "BRA1", 999, "g", 10).every((x) => mundo(pacote).clube[x.clubeId].elenco.some((j) => j.nome === x.nome && j.posicao !== "GOL")));
  const base = { ano: 2026, idade: 24, clubeId: "FLA", clubeNome: "x", cores: [], numero: "9", jogos: 30, assist: 0, nota: 6.5, titulo: false, base: 0, golsBase: 0, notaBase: 0, temporadasCheias: 3 };
  const tem = (g: number, max: number) => premiosDaTemporada(new RNG("p"), { ...base, gols: g, maxGols: max }).some((x) => x.conquista === "trofeu-artilheiro");
  assert.ok(tem(20, 19) && tem(19, 19) && !tem(18, 19));
});

teste("Janela do meio do ano dos outros clubes: fecha na semana 24, quem muda joga a segunda metade no clube novo", () => {
  sincronizarMundo(pacote, "meio", 0, 10);
  assert.equal(janelaDoMundo(pacote, 0, true).length, 0, "antes da semana 24 não tem");
  sincronizarMundo(pacote, "meio", 0, 24);
  const jan = janelaDoMundo(pacote, 0, true), tr = jan.filter((x) => x.tipo === "transferencia");
  assert.ok(tr.length > 50 && tr.every((x) => x.taxa > 0 && x.de !== x.para));
  const x = tr[0], h = historicoDe(pacote, x.nome).linhas.filter((l) => l.t === 0);
  assert.equal(h.length, 2); assert.equal(h[1].clubeId, x.para);
  const [a, b] = h.map((l) => statsDaLinha(pacote, x.nome, l)!);
  assert.ok(a.jr!.every((r) => r < 22) && b.jr!.every((r) => r >= 22), "cada metade no seu clube");
  sincronizarMundo(pacote, "meio", 0, 10);
  assert.equal(janelaDoMundo(pacote, 0, true).length, 0, "voltar a semana desfaz");
  sincronizarMundo(pacote, "meio", 2, 0);
  assert.ok(janelaDoMundo(pacote, 1, true).length > 0, "temporadas passadas têm a janela do meio");
});

teste("Agentes livres: banco de quem ficou sem clube; contratar de lá é de graça; ninguém aparece do nada com taxa", () => {
  sincronizarMundo(pacote, "livres", 3);
  const al = agentesLivres(pacote);
  assert.ok(al.length > 200 && al.filter((x) => ondeJoga(pacote, x.nome)).length <= 3, "sem clube de verdade (só homônimos)");
  for (const t of [1, 2, 3]) for (const x of janelaDoMundo(pacote, t)) {
    if (!x.de && x.tipo !== "base" && x.tipo !== "aposentadoria") assert.ok(x.taxa === 0 && x.ovr <= 75, `${x.nome} veio do nada com taxa ${x.taxa}`);
    if (x.tipo === "livre") assert.equal(x.taxa, 0);
  }
});

teste("Estaduais: clubes do estado de todas as divisões, turno único, semifinal e final ida e volta, sem bater com a Libertadora", () => {
  const w = mundo(pacote), forca = (id: string) => w.clube[id]?.forca ?? 60;
  const fonte = { ligas: w.liga, semente: "est", temporada: 0, cidade: (id: string) => w.info[id]?.cidade ?? "" };
  const lib = new Set(classificados(fonte, "LIB"));
  for (const id of ["PAU", "CAR", "MIN", "GAU", "PRN", "CAT", "BAI", "PER", "CEA", "GOI"] as CopaId[]) {
    const cl = classificados(fonte, id);
    assert.equal(cl.length, COPAS[id].vagas, id);
    const e = novaCopa(id, 0, cl, forca, () => "BRA", () => "", "est"), rng = new RNG(id);
    for (let sem = 0; sem < SEMANAS_TEMPORADA; sem++) rodarSemana(e, sem, forca, rng);
    assert.ok(e.campeao && cl.includes(e.campeao), `${id}: campeão`);
    assert.equal(e.jogos.filter((j) => j.fase === "final").length, 2, `${id}: final ida e volta`);
    for (const j of e.jogos) if (lib.has(j.casa) || lib.has(j.fora)) assert.ok(![5, 7, 9, 12, 14, 16].includes(j.semana), `${id}: bate com a Libertadora`);
  }
  assert.deepEqual(classificados(fonte, "PAU").slice(0, 3).sort(), ["COR", "PAL", "SAN", "SPA"].filter((x) => classificados(fonte, "PAU").slice(0, 3).includes(x)).sort());
  // carreira: o jogador do Palmeral joga o Paulistão às quartas e a campanha vai para o histórico
  const r = criarJogador({ nome: "Teste Est", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "estadual" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "PAL", "estadual");
  for (const k of ATRIBUTOS) s.jogador.at[k] = 78;
  s.jogador.idade = 22; s.carreira.formacao = false;
  assert.equal(jogoCopaDaSemana(pacote, s)?.copa.id, "PAU", "estreia no Paulistão na semana 1");
  assert.ok(["titular", "banco"].includes(prepararPartida(pacote, s, planoPadrao(), jogoCopaDaSemana(pacote, s))!.escalacao), "joga o estadual na pré-temporada");
  let fim;
  for (let i = 0; i < SEMANAS_TEMPORADA && !fim; i++) fim = semanaAutomatica(pacote, s, false).fimDeTemporada;
  assert.ok(fim?.estadual && fim.estadual.jogos >= 5 && fim.estadual.nome === "Campeonato Paulista", JSON.stringify(fim?.estadual));
});

teste("Seleção da rodada e do mês: 4-3-3 com os melhores da liga; o jogador entra com nota alta; melhor em campo", () => {
  sincronizarMundo(pacote, "sel", 0);
  const sel = selecaoDaRodada(pacote, "BRA1", 5);
  assert.equal(sel.length, 11);
  for (const [p, k] of [["GOL", 1], ["ZAG", 2], ["LAT", 2], ["VOL", 1], ["MEI", 2], ["PON", 2], ["ATA", 1]] as const) assert.equal(sel.filter((x) => x.posicao === p).length, k, p);
  const eu = { nome: "Eu", clubeId: "FLA", posicao: "ATA", nota: 10, gols: 3, assist: 0, eu: true };
  assert.ok(selecaoDaRodada(pacote, "BRA1", 5, [eu]).some((x) => x.eu));
  assert.ok(!selecaoDaRodada(pacote, "BRA1", 5, [{ ...eu, nota: 5 }]).some((x) => x.eu));
  const mes = selecaoDoMes(pacote, "BRA1", [0, 1, 2, 3]);
  assert.equal(mes.length, 11);
  const r = criarJogador({ nome: "Teste Mvp", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "mvp" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "FLA", "mvp");
  for (const k of ATRIBUTOS) s.jogador.at[k] = 88;
  s.jogador.idade = 24; s.carreira.formacao = false;
  let fim;
  for (let i = 0; i < SEMANAS_TEMPORADA && !fim; i++) fim = semanaAutomatica(pacote, s, false).fimDeTemporada;
  assert.ok((fim!.mvp ?? 0) >= 3 && (fim!.selRodada ?? 0) >= 1, JSON.stringify([fim!.mvp, fim!.selRodada]));
  assert.ok((s.casa.reliquias ?? []).some((x) => x.id === "rel-trofeu-mvp-1"), "troféu do primeiro melhor em campo");
});

teste("Prêmios do campeonato: seleção, craque, artilheiro, garçom e revelação entre todos; o jogador ganha se for o melhor", () => {
  sincronizarMundo(pacote, "premios", 0);
  const p = premiosDaLiga(pacote, "BRA1", 2026);
  assert.equal(p.selecao.length, 11);
  assert.ok(p.craque && p.artilheiro && p.garcom && p.revelacao && (p.revelacao.idade ?? 99) <= 21);
  assert.ok(p.artilheiro!.gols >= p.selecao.reduce((a, x) => Math.max(a, x.gols), 0));
  const eu = { nome: "Eu", clubeId: "FLA", posicao: "ATA", nota: 8.5, gols: 40, assist: 15, jogos: 34, idade: 20, eu: true };
  const q = premiosDaLiga(pacote, "BRA1", 2026, [eu]);
  assert.ok(q.craque?.eu && q.artilheiro?.eu && q.selecao.some((x) => x.eu) && q.revelacao?.eu);
  const r = premiosDaLiga(pacote, "BRA1", 2026, [{ ...eu, nota: 6, gols: 2, assist: 1 }]);
  assert.ok(!r.craque?.eu && !r.selecao.some((x) => x.eu));
});

teste("Intercontinental todo ano e Mundial de Clubes a cada quatro anos, com os critérios da FIFA adaptados", () => {
  const r = criarJogador({ nome: "Teste Mundo", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "mundial" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "FLA", "mundial");
  const w = mundo(pacote), pais = (id: string) => w.info[id]?.pais ?? "";
  const int = copasDe(pacote, s).INT!;
  assert.equal(int.clubes.length, 4);
  assert.deepEqual(int.clubes.map((x) => confederacao(pais(x))), ["CONCACAF", "CONMEBOL", "AFC", "UEFA"]);
  // Concachampions: 8 do México e 8 da MLS, mata-mata, um campeão
  const fonteC = { ligas: w.liga, semente: "con", temporada: 0 };
  const cl = classificados(fonteC, "CON"), con = novaCopa("CON", 0, cl, (id) => w.clube[id]?.forca ?? 60, pais, regiaoNaCopa, "con"), rc = new RNG("con");
  assert.equal(new Set(cl).size, 16);
  for (let sem = 0; sem < 40; sem++) rodarSemana(con, sem, (id) => w.clube[id]?.forca ?? 60, rc);
  assert.ok(con.campeao && con.jogos.length === 16 + 8 + 4 + 1, `${con.jogos.length}`);
  const forca = (id: string) => w.clube[id]?.forca ?? 60, rng = new RNG("int");
  for (let sem = 0; sem < 40; sem++) rodarSemana(int, sem, forca, rng);
  assert.ok(int.campeao && int.jogos.length === 3 && int.jogos.every((j) => j.neutro && [17, 27, 34].includes(j.semana)));
  assert.ok(!copasDe(pacote, s).MUN, "2026 não é ano de Mundial");
  const m = participantesMundial(pacote, s, 3);
  assert.equal(m.length, 32); assert.equal(new Set(m).size, 32);
  const conta = (cf: string) => m.filter((x) => confederacao(pais(x)) === cf).length;
  assert.ok(conta("UEFA") === 12 && conta("CAF") === 4 && conta("OFC") === 1 && conta("AFC") === 4 && conta("CONCACAF") === 4 && conta("CONMEBOL") >= 6, JSON.stringify(["UEFA", "CONMEBOL", "AFC", "CONCACAF"].map(conta)));
  const e = novaCopa("MUN", 3, m, forca, pais, (id) => confederacao(pais(id)), "mundial"), r2 = new RNG("mun");
  for (const g of Object.values(e.tabelas)) assert.ok(g.filter((x) => confederacao(pais(x.clube)) === "UEFA").length <= 2);
  for (let sem = 40; sem <= 46; sem++) rodarSemana(e, sem, forca, r2);
  assert.ok(e.campeao && m.includes(e.campeao));
  assert.equal(e.jogos.length, 48 + 8 + 4 + 2 + 1);
});

teste("Sem clube: fim de contrato vira agente livre, não joga, propostas chegam a qualquer semana, assinar acaba a fase", () => {
  const r = criarJogador({ nome: "Teste Livre", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "livre" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "BOT", "livre");
  for (const k of ATRIBUTOS) s.jogador.at[k] = 74;
  s.jogador.idade = 27; s.carreira.formacao = false; s.carreira.salario = 200000; s.carreira.anosContrato = 0; s.carreira.semana = 10;
  const ev: string[] = [];
  contratoVencido(pacote, s, ev);
  const m = mercadoDe(s.carreira);
  assert.ok(m.semClube && s.carreira.salario === 0, "agente livre");
  assert.equal(escalacao(pacote, s), "semJogo"); assert.equal(prepararPartida(pacote, s, planoPadrao()), undefined);
  assert.ok(oferecerJogador(s).ok); assert.ok(!oferecerJogador(s).ok, "já está oferecendo");
  m.propostas = [];
  for (let i = 0; i < 8 && !m.propostas.length; i++) semanaAutomatica(pacote, s, false);
  assert.ok(m.propostas.length > 0 && m.propostas.every((p) => p.taxa === 0), "propostas sem taxa fora da janela");
  assert.ok(aceitar(pacote, s, m.propostas[0].id).ok);
  assert.ok(!m.semClube && s.carreira.salario > 0 && s.carreira.anosContrato > 0, "assinou");
});

teste("Seleção nacional: 44 seleções com os melhores do país, convocação pelo nível, datas FIFA e Copa do Mundo de 32", () => {
  const r = criarJogador({ nome: "Teste Sel", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "selecao" });
  const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "FLA", "selecao");
  const sels = todasSelecoes(pacote), bra = selecaoDe(pacote, "BRA")!;
  assert.ok(sels.length >= 40 && bra.elenco.length === 24, `${sels.length}`);
  assert.ok(bra.forca > selecaoDe(pacote, "NZL")!.forca, "Brasil mais forte que Nova Zelândia");
  const copas = copasDe(pacote, s), sel = copas.SEL!;
  assert.equal(sel.jogos.length, 3); assert.ok(sel.jogos.every((j) => j.casa === bra.id || j.fora === bra.id));
  assert.ok(sel.jogos.every((j) => j.fase === "amistoso"), "2026: ano de Copa, amistosos");
  // garoto da base não é chamado; craque é
  s.jogador.idade = 16; assert.ok(!convocado(pacote, s, "x1"));
  for (const k of ATRIBUTOS) s.jogador.at[k] = 92;
  s.jogador.idade = 26; s.carreira.formacao = false; s.carreira.fase = undefined as any; s.carreira.fama = 80;
  assert.ok(convocado(pacote, s, "x2"), "craque convocado");
  assert.ok(["titular", "banco"].includes(escalacaoSelecao(pacote, s, 0)));
  const m = participantesCopa(pacote, 4), w = mundo(pacote), pais = (id: string) => w.clube[id]?.pais ?? "";
  assert.equal(new Set(m).size, 32); for (const p of ["ESP", "POR", "MAR"]) assert.ok(m.includes(idSelecao(p)), p);
  const e = novaCopa("COP", 4, m, (id) => w.clube[id]?.forca ?? 60, pais, (id) => confederacao(pais(id)), "cop"), rr = new RNG("cop");
  for (let sem = 40; sem <= 46; sem++) rodarSemana(e, sem, (id) => w.clube[id]?.forca ?? 60, rr);
  assert.ok(e.campeao && m.includes(e.campeao));
});

teste("Prêmios do mundo: Bola de Ouro, Melhor da Europa, Rei da América... cada júri vota do seu jeito", () => {
  const cand = (nome: string, ligaId: string, clubeId: string, nota: number, gols: number, ovr: number, extra: Partial<Candidato> = {}): Candidato => ({ nome, ligaId, clubeId, posicao: "ATA", nota, gols, assist: 5, jogos: 30, idade: 26, ovr, nacionalidade: "BRA", minimo: 19, ...extra });
  const base = [cand("Craque Europa", "ENG1", "EN-MCI", 7.6, 25, 90), cand("Segundo Europa", "ESP1", "ES-RMA", 7.5, 22, 89), cand("Craque Brasil", "BRA1", "PAL", 7.7, 24, 82), cand("Goleiro", "ITA1", "IT-INT", 7.45, 0, 87, { posicao: "GOL" }), cand("Joia", "GER1", "DE-FCB", 7.3, 12, 80, { idade: 19 })];
  for (let i = 0; i < 40; i++) base.push(cand(`Jogador ${i}`, ["ENG1", "ESP1", "ITA1", "BRA1", "ARG1"][i % 5], `X${i}`, 6.8 + (i % 7) * 0.05, 5 + (i % 9), 78 + (i % 6), { posicao: ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA", "GOL"][i % 7] }));
  const ctx = (sem: string, extra: Partial<ContextoPremios> = {}): ContextoPremios => ({ semente: sem, ano: 2027, campeaoLiga: {}, faseCopa: () => undefined, faseCopaDoMundo: () => undefined, regiaoLiga: (id) => infoLiga(id).regiao, nivelLiga: (id) => infoLiga(id).nivel, confederacao, ...extra });
  let difere = 0, bolaEuropa = 0;
  for (let k = 0; k < 40; k++) {
    const p = premiosDoAno(base, ctx(`s${k}`)), v = (id: string) => p.premios.find((x) => x.id === id)?.ranking[0];
    if (v("BOLA")!.nome !== v("UEFA")!.nome) difere++;
    if (["Craque Europa", "Segundo Europa"].includes(v("BOLA")!.nome)) bolaEuropa++;
    assert.equal(v("REI")!.nome, "Craque Brasil"); assert.equal(v("YASHIN")!.nome, "Goleiro"); assert.equal(v("KOPA")!.nome, "Joia");
    assert.ok(["ENG1", "ESP1", "ITA1", "GER1"].includes(base.find((x) => x.nome === v("UEFA")!.nome)!.ligaId), "Melhor da Europa joga na Europa");
    assert.equal(p.selecao.length, 11);
  }
  assert.ok(bolaEuropa >= 32, `Bola de Ouro quase sempre na Europa (${bolaEuropa}/40)`);
  assert.ok(difere >= 2 && difere <= 18, `de vez em quando Bola de Ouro ≠ Melhor da Europa (${difere}/40)`);
  // o usuário, com uma temporada absurda e a Champions, ganha
  const eu = cand("Eu", "ENG1", "EN-ARS", 8.1, 38, 88, { eu: true });
  const p = premiosDoAno([...base, eu], ctx("eu", { faseCopa: (cp, id) => (cp === "UCL" && id === "EN-ARS" ? "campeao" : undefined), campeaoLiga: { ENG1: "EN-ARS" } }));
  assert.ok(p.premios.find((x) => x.id === "BOLA")!.ranking[0].eu && p.premios.find((x) => x.id === "UEFA")!.ranking[0].eu);
});

teste("Atlético Bilbau: só bascos, temporada após temporada (base, mercado e reposição)", () => {
  for (let t = 0; t <= 6; t++) {
    sincronizarMundo(pacote, "bilbau", t, 30);
    const ath = mundo(pacote).clube["ES-ATH"];
    assert.ok(ath.elenco.length >= 20);
    const fora = ath.elenco.filter((j) => !j.basco);
    assert.equal(fora.length, 0, `temporada ${t}: ${fora.map((j) => j.nome).join(", ")}`);
    assert.ok(baseDoClube(pacote, "ES-ATH").every((j) => j.basco));
  }
  sincronizarMundo(pacote, "", 0);
});

console.log(`\n${ok} testes passaram`);
