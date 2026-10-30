// Liga a vida no clube à carreira: vestiário e capitania, técnico (conversa com o novo, geladeira, ex-técnico que
// chama), rival pessoal, torcida (apelido, música, faixas, protesto, aeroporto), cidade onde mora e álbum de figurinhas.
// Os módulos de regra (vestiario, rival, torcida, cidades, figurinhas) não conhecem o Save; aqui é onde eles se encontram.
import { RNG, clamp } from "./rng.js";
import type { PacoteDados } from "./liga.js";
import { mundo, infoClube, idClube, idSelecao, ondeJoga, historicoDe, statsDaLinha, notasDaRodada, trocasDeTecnico } from "./mundo.js";
import { infoLiga } from "./ligas.js";
import { estrelas } from "./relacoes.js";
import { COPAS } from "./copas.js";
import { NOME_ESTILO } from "./tecnicos.js";
import { novoVestiario, semanaVestiario, conversaTecnicoNovo, talvezGeladeira, type Vestiario } from "./vestiario.js";
import { escolherRival, novoRival, registrarDuelo, semanaRival, anoDoRival } from "./rival.js";
import { torcidaDe, semanaTorcida, recepcaoAeroporto } from "./torcida.js";
import { perfilCidade, semanaCidade } from "./cidades.js";
import { figurinhaDaTemporada, figurinhaEspecial, figurinhaDeMomento, type Figurinha } from "./figurinhas.js";
import { propostaPorIndicacao, janelaAberta } from "./transferencias.js";
import { MARCA, type ContratoPatrocinio } from "./marcas.js";
import { temFuncao } from "./vida-social.js";
import { noticia, registrarMarco, agendaDe, elencoAtual, ovr, semanaAbsJogo, ANO_INICIAL, parcasDe, jogoDaSemana, jogoCopaDaSemana, ehClassico, type Save, type ResumoTemporada } from "./jogo.js";
import { valorBrl } from "./moeda.js";

const rngDe = (s: Save, ...p: (string | number)[]) => new RNG(`${s.semente}|${s.carreira.temporada}|${s.carreira.semana}|clube|${p.join("|")}`);
const ativo = (s: Save) => { const c = s.carreira; return !c.fase && !c.formacao && !c.mercado?.semClube && !c.encerrada; };

/** O vestiário do clube atual (novo ao trocar de clube; os ex-técnicos vão junto). */
export function vestiarioDe(pacote: PacoteDados, s: Save): Vestiario {
  const c = s.carreira, j = s.jogador, v = c.vestiario;
  if (v && v.clubeId === c.clubeId) return v;
  const ex = [...(v?.exTecnicos ?? [])];
  if (v?.tecnicoVisto && !ex.some((x) => x.nome === v.tecnicoVisto)) ex.push({ nome: v.tecnicoVisto, rel: v.relUlt ?? 50 });
  const elenco = (mundo(pacote).clube[idClube(c.clubeId)]?.elenco ?? []).filter((x) => x.nome !== j.apelido);
  const n = novoVestiario(rngDe(s, "vestiario-novo"), c.clubeId, elenco, { idade: j.idade, posicao: j.posicao, ovr: ovr(j) }, semanaAbsJogo(c));
  n.exTecnicos = ex.slice(-6); n.tecnicoVisto = c.tecnico?.nome;
  c.vestiario = n;
  return n;
}

export interface InfoSemanaClube { jogou: boolean; titular: boolean; nota: number; gols: number; adv?: string; rodada?: number; grande?: boolean }

/** A semana no clube e na cidade (chamado no fim de cada semana, depois da vida fora de campo). */
export function semanaDoClube(pacote: PacoteDados, s: Save, eventos: string[], info: InfoSemanaClube) {
  const c = s.carreira, j = s.jogador, ab = semanaAbsJogo(c), a = agendaDe(c), ano = ANO_INICIAL + c.temporada;
  const clube = infoClube(pacote, c.clubeId);
  if (!clube) return;
  // cidade (vale para qualquer fase: é onde o jogador mora)
  {
    const nome = clube.cidade, pais = clube.pais ?? infoLiga(c.ligaId).pais;
    if (!c.cidade || c.cidade.nome !== nome) {
      const primeira = !c.cidade;
      // save antigo: quem já morava aqui há tempo não ganha o "conhecer a cidade"
      c.cidade = { nome, pais, desde: ab, visitadas: [], ...(primeira && ab > 6 ? { conheceu: true } : {}) };
      if (!(c.cidadesMoradas ??= []).includes(nome)) c.cidadesMoradas.push(nome);
      if (!primeira) eventos.push(`Vida nova em ${nome}.`);
    }
    const p = perfilCidade(nome, pais);
    const ef = semanaCidade(c.cidade, p, a, rngDe(s, "cidade"), { ab, semana: c.semana, ano, nacionalidade: j.nacionalidade, apelido: j.apelido, fama: c.fama, salario: c.salario, motorista: temFuncao(parcasDe(s), "motorista") });
    c.moral = clamp(c.moral + ef.moral, 0, 100); c.vidaNoturna = clamp(c.vidaNoturna + ef.vidaNoturna, 0, 100);
    eventos.push(...ef.avisos);
  }
  if (!ativo(s)) return;
  // vestiário e técnico
  const v = vestiarioDe(pacote, s), tec = c.tecnico;
  if (tec && v.tecnicoVisto !== tec.nome) {
    if (v.tecnicoVisto) {
      (v.exTecnicos ??= []).push({ nome: v.tecnicoVisto, rel: v.relUlt ?? 50 });
      v.exTecnicos = v.exTecnicos.slice(-6);
      conversaTecnicoNovo(a, ab, tec.nome, NOME_ESTILO[tec.estilo][0], c.fama);
      v.geladeira = 0;
    }
    v.tecnicoVisto = tec.nome;
  }
  v.relUlt = c.relTecnico;
  if (v.geladeira) { v.geladeira--; if (!v.geladeira) { eventos.push("Fim da geladeira: o técnico voltou a contar com você."); c.relTecnico = clamp(c.relTecnico + 6, 0, 100); } }
  else if (tec && c.lesao <= 0) {
    const g = talvezGeladeira(v, a, rngDe(s, "geladeira"), ab, c.relTecnico, tec.nome, j.apelido);
    if (g) { eventos.push(`Na geladeira: ${tec.nome} te tirou dos relacionados.`); noticia(s, "polemica", `${j.apelido} na geladeira`, `Sem explicação pública, ${tec.nome} tirou ${j.apelido} dos relacionados.`); }
  }
  const elenco = elencoAtual(pacote, s).filter((x) => x.nome !== j.apelido);
  const jogosNoClube = c.jogosPorClube?.[c.clubeId] ?? 0, temporadas = Math.max(0, c.temporada - (c.chegadaClube ?? c.temporada));
  const titular = info.jogou ? info.titular : c.stats.jogos > 0 && c.stats.titular >= c.stats.jogos / 2;
  const prox = proximoJogoGrande(pacote, s);
  const papelAntes = v.papel;
  const ev = semanaVestiario(v, a, rngDe(s, "vestiario"), { ab, idade: j.idade, fama: c.fama, carisma: j.personalidade.carisma ?? 10, titular, nota: info.nota, jogosNoClube, temporadasNoClube: temporadas,
    relTecnico: c.relTecnico, tecnico: tec?.nome, tecnicoEstilo: tec?.estilo, apelido: j.apelido, clube: clube.nome, salario: c.salario, elenco, posicao: j.posicao, ovr: ovr(j), jogoGrande: prox });
  c.moral = clamp(c.moral + ev.moral, 0, 100); c.relTecnico = clamp(c.relTecnico + ev.relTecnico, 0, 100);
  c.torcida = clamp((c.torcida ?? 50) + ev.torcida, 0, 100); c.pressao = clamp(c.pressao + ev.pressao, 0, 100);
  eventos.push(...ev.avisos);
  for (const n of ev.noticias) noticia(s, n.tipo ?? "clube", n.titulo, n.texto);
  for (const m of ev.marcos) registrarMarco(s, { tipo: "clube", texto: m });
  if (v.papel === "capitao" && papelAntes !== "capitao") {
    const f = figurinhaEspecial(albumDe(c), "capitao", baseFigurinha(pacote, s), `Capitão do ${clube.nome}`);
    if (f) eventos.push("Figurinha nova no álbum: Capitão!");
  }
  // ex-técnico que assumiu outro clube e quer o jogador (só com a janela aberta)
  if (janelaAberta(c) && j.idade >= 18) {
    for (const ex of v.exTecnicos ?? []) {
      if (ex.rel < 65 || ex.avisado === c.temporada) continue;
      const t = trocasDeTecnico(pacote).find((x) => x.entrou === ex.nome && x.clubeId !== c.clubeId);
      if (!t) continue;
      ex.avisado = c.temporada;
      const p = propostaPorIndicacao(pacote, s, t.clubeId);
      if (p) {
        const nome = infoClube(pacote, t.clubeId)?.nome ?? t.clubeId;
        eventos.push(`Seu ex-técnico ${ex.nome} assumiu o ${nome} e pediu você.`);
        noticia(s, "clube", `${ex.nome} quer reencontrar ${j.apelido}`, `Recém-chegado ao ${nome}, o técnico ${ex.nome} pediu a contratação do ex-comandado ${j.apelido}. A proposta está na mesa.`);
      }
    }
  }
  // rival
  semanaDoRival(pacote, s, eventos, info);
  // torcida
  {
    const tv = torcidaDe((c.torcidaViva ??= {}), c.clubeId);
    const et = semanaTorcida(tv, a, rngDe(s, "torcida"), { ab, ano, clubeId: c.clubeId, clube: clube.nome, torcida: c.torcida ?? 50, jogosNoClube, apelido: j.apelido, posicao: j.posicao, fama: c.fama,
      ...(info.jogou && info.adv ? { jogo: { nota: info.nota, gols: info.gols, grande: !!info.grande, adv: infoClube(pacote, info.adv)?.nome ?? info.adv } } : {}) });
    c.moral = clamp(c.moral + et.moral, 0, 100);
    eventos.push(...et.avisos);
    for (const n of et.noticias) noticia(s, n.tipo ?? "vida", n.titulo, n.texto);
    for (const m of et.marcos) registrarMarco(s, { tipo: "clube", texto: m });
  }
}
/** Jogo grande na semana que vem (clássico ou decisão de copa), para o discurso do capitão. */
function proximoJogoGrande(pacote: PacoteDados, s: Save): string | undefined {
  const jc = jogoCopaDaSemana(pacote, s);
  if (jc && ["final", "semi"].includes(jc.copa.fase)) return `a ${jc.copa.fase === "final" ? "final" : "semifinal"} ${COPAS[jc.copa.id].prep} ${COPAS[jc.copa.id].nome}`;
  const jl = jogoDaSemana(s);
  if (jl && ehClassico(pacote, jl.casa, jl.fora)) return `o clássico contra o ${infoClube(pacote, jl.adversario)?.nome ?? "rival"}`;
  return undefined;
}

function semanaDoRival(pacote: PacoteDados, s: Save, eventos: string[], info: InfoSemanaClube) {
  const c = s.carreira, j = s.jogador, ab = semanaAbsJogo(c), ano = ANO_INICIAL + c.temporada, w = mundo(pacote);
  let r = c.rival && !c.rival.fim ? c.rival : undefined;
  const jogosPro = c.stats.jogos + c.historico.reduce((x, h) => x + h.jogos, 0);
  if (!r && c.fama >= 28 && jogosPro >= 10 && rngDe(s, "rival-nasce").chance(0.08)) {
    const passados = (c.rivaisPassados ?? []).map((x) => x.nome);
    const cand = escolherRival(estrelas(pacote), { idade: j.idade, posicao: j.posicao, ovr: ovr(j), clubeId: c.clubeId, ligaDe: (id) => w.info[id]?.ligaId, ligaId: infoLiga(c.ligaId).id }, passados);
    if (cand) {
      r = c.rival = novoRival(cand, ano);
      const nc = infoClube(pacote, cand.clubeId)?.nome ?? "";
      eventos.push(`A imprensa já tem a rivalidade do momento: você × ${cand.nome}.`);
      noticia(s, "jogo", `${j.apelido} × ${cand.nome}: nasce uma rivalidade`, `Mesma geração, mesma faixa do campo, ${cand.nome} (${nc}) e ${j.apelido} viraram a comparação favorita da imprensa e das redes.`);
      registrarMarco(s, { tipo: "marco", texto: `Nasce a rivalidade com ${cand.nome}` });
    }
  }
  if (!r) return;
  const onde = ondeJoga(pacote, r.nome);
  if (!onde) {
    r.fim = { ano, motivo: "aposentou" };
    (c.rivaisPassados ??= []).push(r); c.rival = undefined;
    noticia(s, "jogo", `${r.nome} pendura as chuteiras`, `O rival de tantos duelos se aposentou. No placar particular: ${r.placar.eu} vitórias de ${j.apelido}, ${r.placar.ele} dele e ${r.placar.empate} empates.`);
    return;
  }
  if (!onde.base) r.clubeId = onde.clubeId;
  // caminhos separados: um ano inteiro em ligas diferentes, sem duelo, e a imprensa esquece
  r.longe = w.info[r.clubeId]?.ligaId === infoLiga(c.ligaId).id ? 0 : (r.longe ?? 0) + 1;
  if (r.longe >= 40 && r.temp < 25) {
    r.fim = { ano, motivo: "caminhos separados" };
    (c.rivaisPassados ??= []).push(r); c.rival = undefined;
    eventos.push(`A rivalidade com ${r.nome} esfriou: cada um seguiu seu caminho.`);
    return;
  }
  if (info.jogou && info.adv && info.adv === r.clubeId && info.rodada !== undefined) {
    const dele = notasDaRodada(pacote, infoLiga(c.ligaId).id, info.rodada, [info.adv]).find((x) => x.nome === r!.nome);
    if (dele) {
      const d = registrarDuelo(r, { ano, adv: infoClube(pacote, r.clubeId)?.nome ?? "", meu: info.nota, dele: dele.nota, golsEu: info.gols, golsEle: dele.gols });
      const ele = r.nome.split(" ")[0];
      eventos.push(`Duelo com ${r.nome}: ${info.nota.toFixed(1)} × ${dele.nota.toFixed(1)} (${d.venceu === "eu" ? "você levou" : d.venceu === "ele" ? `${ele} levou` : "empate"}).`);
      noticia(s, "jogo", `Duelo particular: ${j.apelido} ${info.nota.toFixed(1)} × ${dele.nota.toFixed(1)} ${ele}`, d.venceu === "eu" ? `${j.apelido} levou a melhor no reencontro com ${r.nome}. No placar dos duelos: ${r.placar.eu} × ${r.placar.ele}.` : d.venceu === "ele" ? `${r.nome} ganhou o duelo desta vez. No placar dos duelos: ${r.placar.eu} × ${r.placar.ele}.` : `Duelo equilibrado entre ${j.apelido} e ${r.nome}.`);
      c.moral = clamp(c.moral + (d.venceu === "eu" ? 3 : d.venceu === "ele" ? -2 : 0), 0, 100);
      if (d.venceu === "eu") c.fama = clamp(c.fama + 0.4, 0, 100);
    }
  }
  semanaRival(r, agendaDe(c), rngDe(s, "rival"), { ab, ano, apelido: j.apelido, fama: c.fama, nomeClubeEle: infoClube(pacote, r.clubeId)?.nome ?? "", temperamento: j.personalidade.temperamento });
}

/** Gatilhos dos momentos da agenda ligados ao clube (liderança, companheiros, geladeira, rival, cidade). */
export function gatilhoClube(pacote: PacoteDados, s: Save, g: string): boolean {
  const c = s.carreira, p = g.split(":");
  if (p[0] === "vest") {
    const v = vestiarioDe(pacote, s);
    if (p[1] === "lid") v.lideranca = clamp(v.lideranca + +p[2], 0, 100);
    else if (p[1] === "comp") { const x = v.comp.find((y) => y.nome === p[2]); if (x) x.rel = clamp(x.rel + +p[3], 0, 100); }
    else if (p[1] === "pupilo" && !v.comp.some((y) => y.nome === p[2])) { v.comp.push({ nome: p[2], tipo: "pupilo", rel: 70, desde: semanaAbsJogo(c) }); v.lideranca = clamp(v.lideranca + 4, 0, 100); }
    return true;
  }
  if (p[0] === "tec" && p[1] === "geladeira") { const v = vestiarioDe(pacote, s); v.geladeira = Math.max(0, (v.geladeira ?? 0) + +p[2]); return true; }
  if (p[0] === "rival") { if (c.rival && p[1] === "temp") c.rival.temp = clamp(c.rival.temp + +p[2], 0, 100); return true; }
  if (p[0] === "cid") { if (c.cidade && p[1] === "conheceu") c.cidade.conheceu = true; return true; }
  return false;
}

// ------------------------------------------------------------------ figurinhas
export const albumDe = (c: Save["carreira"]): Figurinha[] => (c.album ??= []);
function baseFigurinha(pacote: PacoteDados, s: Save): Omit<Figurinha, "id" | "tipo" | "raridade" | "legenda"> {
  const c = s.carreira, j = s.jogador, info = infoClube(pacote, c.clubeId), st = c.stats;
  return { ano: ANO_INICIAL + c.temporada, clubeId: c.clubeId, clube: info?.nome ?? "", cores: [info?.cores[0] ?? "#FFFFFF", info?.cores[1] ?? "#111111"], numero: String(j.numero ?? 10), posicao: j.posicao,
    ovr: Math.round(ovr(j)), idade: j.idade, jogos: st.jogos, gols: st.gols, assist: st.assist, ap: { ...((j.aparencia as Record<string, unknown>) ?? {}) } };
}
/** Base da figurinha para um clube específico (o da temporada, quando o jogador passou por mais de um). */
function baseDoClube(pacote: PacoteDados, s: Save, clubeId: string): Omit<Figurinha, "id" | "tipo" | "raridade" | "legenda"> {
  const b = baseFigurinha(pacote, s), ic = infoClube(pacote, clubeId);
  return { ...b, clubeId, clube: ic?.nome ?? b.clube, cores: ic ? [ic.cores[0], ic.cores[1]] : b.cores };
}
/** Patrocínio fechado: a figurinha é da marca (logo e cores dela), com o jogador no contrato. */
export function figurinhaDePatrocinio(pacote: PacoteDados, s: Save, k: ContratoPatrocinio, chave: string) {
  const m = MARCA[k.marca], b = baseFigurinha(pacote, s);
  const base = { ...b, clubeId: `marca-${k.marca}`, clube: m?.nome ?? k.marca, cores: m ? [m.cores[0], m.cores[1]] as [string, string] : b.cores };
  const f = figurinhaDeMomento(albumDe(s.carreira), "patrocinio", base, chave, `Contrato com a ${m?.nome ?? k.marca}`, "prata");
  if (f) f.contrato = { marca: k.marca, tipo: k.tipo, mensal: k.mensal, meses: k.meses, luvas: k.luvas };
}
/** Golaço (relíquia de gol de placa): figurinha do lance. */
export function figurinhaDeGolaco(pacote: PacoteDados, s: Save, chave: string, legenda: string) {
  figurinhaDeMomento(albumDe(s.carreira), "golaco", baseFigurinha(pacote, s), chave, legenda, "brilhante");
}
/** Noivado ou casamento: a pessoa da vida do jogador entra no álbum. */
export function figurinhaDeFamilia(pacote: PacoteDados, s: Save) {
  const par = s.carreira.namoro?.par;
  if (!par || (par.etapa !== "noivos" && par.etapa !== "casados")) return;
  const legenda = par.etapa === "casados" ? `Casou com ${par.nome.split(" ")[0]}` : `Noivou com ${par.nome.split(" ")[0]}`;
  const f = figurinhaDeMomento(albumDe(s.carreira), "familia", baseFigurinha(pacote, s), `${par.etapa}-${par.nome}`, legenda, par.etapa === "casados" ? "brilhante" : "prata");
  if (f) f.parId = par.id;
}
/** Filho que nasceu: figurinha com o retrato dele (o índice na lista de filhos). Uma por filho. */
export function figurinhaDeFilho(pacote: PacoteDados, s: Save, i: number, ano: number) {
  const f = figurinhaDeMomento(albumDe(s.carreira), "filho", baseFigurinha(pacote, s), `${i}-${ano}`, `Nasceu em ${ano}`, "brilhante");
  if (f) f.filhoIdx = i;
}
/** Primeira convocação: figurinha da seleção. */
export function figurinhaDaSelecao(pacote: PacoteDados, s: Save, nomeSelecao: string, cores: [string, string]) {
  const b = baseFigurinha(pacote, s);
  figurinhaEspecial(albumDe(s.carreira), "selecao", { ...b, clubeId: `sel-${s.jogador.nacionalidade}`, clube: nomeSelecao, cores }, `Primeira convocação · ${nomeSelecao}`);
}

/** Fim de temporada: figurinha do ano, títulos (bônus de contrato, aeroporto, figurinha de campeão) e a briga com o rival. */
export function fimDeTemporadaClube(pacote: PacoteDados, s: Save, r: ResumoTemporada, ev: string[]) {
  const c = s.carreira, j = s.jogador, ano = r.ano, info = infoClube(pacote, c.clubeId);
  figurinhaDeFamilia(pacote, s);
  // títulos do clube no ano (liga e copas de clubes)
  const titulos: string[] = [];
  if (r.titulo && !c.formacao && !c.fase) titulos.push(r.liga ?? "a liga");
  for (const e of Object.values(c.copas ?? {})) if (e && e.campeao === c.clubeId && e.temporada === c.temporada) titulos.push(COPAS[e.id].nome);
  if (titulos.length && ativo(s)) {
    const bt = c.contrato?.bonusTitulo ?? 0;
    if (bt) { s.casa.saldo += bt * titulos.length; noticia(s, "dinheiro", "Bônus por título", `Pela cláusula do contrato: ${valorBrl((bt * titulos.length))} por ${titulos.length === 1 ? "título" : `${titulos.length} títulos`}.`); }
    if ((c.torcida ?? 50) >= 40 && info) {
      const tv = torcidaDe((c.torcidaViva ??= {}), c.clubeId), n = recepcaoAeroporto(tv, { clube: info.nome, apelido: j.apelido, torcida: c.torcida ?? 50, titulo: titulos[0] });
      if (n) { noticia(s, "vida", n.titulo, n.texto); c.moral = clamp(c.moral + 5, 0, 100); }
    }
    figurinhaEspecial(albumDe(c), "titulo", baseFigurinha(pacote, s), `Campeão: ${titulos.join(" e ")}`);
  }
  // figurinhas do ano: uma por clube em que jogou na temporada, com os números daquele clube
  // toda temporada tem ao menos um escudo: na base, no amador e na faculdade, o clube da fase (com os jogos da base)
  if (info) {
    const conv = Object.entries(c.selecao?.conv ?? {}).some(([k, v]) => v && k.startsWith(`${c.temporada}-`));
    const porClube = Object.entries(c.clubesTemp ?? {}).filter(([, t]) => t.jogos > 0);
    const fase = !!(c.fase || c.formacao);
    const lista: [string, { jogos: number; gols: number; assist: number }][] = porClube.length ? porClube : [[c.clubeId, fase ? { jogos: c.stats.base, gols: c.stats.baseGols, assist: 0 } : { jogos: r.jogos, gols: r.gols, assist: r.assist }]];
    // a seleção do ano: uma figurinha quando foi convocado no ano (com as cores e o nome da seleção)
    if (conv) {
      const sel = infoClube(pacote, idSelecao(j.nacionalidade));
      if (sel) { const f = figurinhaEspecial(albumDe(c), "selecao", { ...baseFigurinha(pacote, s), ano, clubeId: `sel-${j.nacionalidade}`, clube: sel.nome, cores: [sel.cores[0] ?? "#FFFFFF", sel.cores[1] ?? "#111111"] }, `Temporada na seleção · ${sel.nome}`, "prata"); if (f) ev.push(`Figurinha da seleção em ${ano}.`); }
    }
    for (const [id, t] of lista) {
      const atual = id === c.clubeId, ic = infoClube(pacote, id);
      if (!ic) continue;
      const f = figurinhaDaTemporada(albumDe(c), { ...baseDoClube(pacote, s, id), ano, ovr: r.ovr, idade: r.idade, jogos: t.jogos, gols: t.gols, assist: t.assist, titulo: atual && r.titulo, premios: atual ? r.premios ?? [] : [], selecao: atual && conv, capitao: atual && c.vestiario?.papel === "capitao" });
      if (f) ev.push(`Figurinha ${ano} no álbum: ${ic.nome} (${f.raridade}).`);
    }
    if (albumDe(c).some((f) => f.ano === ano)) ev.push(`Pacote de figurinhas de ${ano}: abra no álbum.`);
  }
  // rival: quem fez mais gols no ano
  const rv = c.rival;
  if (rv && !rv.fim) {
    const linha = historicoDe(pacote, rv.nome).linhas.find((x) => x.t === c.temporada && !x.base);
    const st = linha ? statsDaLinha(pacote, rv.nome, linha) : undefined;
    if (st) {
      anoDoRival(rv, ano, r.gols, st.g, infoClube(pacote, linha!.clubeId)?.nome ?? "");
      const ganhou = r.gols > st.g, empate = r.gols === st.g;
      noticia(s, "jogo", `Balanço de ${ano}: ${j.apelido} ${r.gols} × ${st.g} ${rv.nome.split(" ")[0]}`, empate ? `Empate na briga particular de gols em ${ano}.` : ganhou ? `${j.apelido} fez mais gols que ${rv.nome} na temporada.` : `${rv.nome} terminou o ano com mais gols que ${j.apelido}.`);
    }
  }
}
