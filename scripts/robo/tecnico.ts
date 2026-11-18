// Robô do modo técnico: comanda um clube por várias temporadas com uma política simples (melhor time toda semana,
// renova quem joga, contrata agente livre quando falta gente, vende reserva com proposta boa, aceita shows, responde
// os eventos) e, se for demitido, assume o melhor clube que aceitar o nome dele. Devolve um JSON na última linha.
// Uso: tsx scripts/robo/tecnico.ts <caso> <temporadas>
import { carregarPacote } from "../../src/pacote.js";
import * as T from "../../src/tecnico/motor.js";
import { melhorEscalacao, ovrDe } from "../../src/tecnico/modelo.js";
import { responderEvento } from "../../src/tecnico/vida.js";
import { aceitarVenda, recusarVenda } from "../../src/tecnico/negociacao.js";
import { responderShow } from "../../src/tecnico/shows.js";
import { mundo, infoClube } from "../../src/mundo.js";
import { infoLiga } from "../../src/ligas.js";
import { CASOS_TECNICO } from "./casos.js";
import { fotoMundo, varrerNumeros } from "./comum.js";

const pacote = carregarPacote(new URL("../../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const i = Number(process.argv[2] ?? 0), maxT = Number(process.argv[3] ?? 15);
const caso = CASOS_TECNICO[i];
let s = T.novaCarreiraTecnico(pacote, caso.dados, caso.clubeId, `robo-t${i}`);
const w = mundo(pacote), inicioMundo = fotoMundo(w);
const nome = (id: string) => infoClube(pacote, id)?.nome ?? id;
const temporadas: Record<string, unknown>[] = [], erros: string[] = [], passagens: { clube: string; liga: string; desde: number; saiu?: string }[] = [];
passagens.push({ clube: nome(s.clubeId), liga: infoLiga(s.ligaId).curto, desde: 0 });
const falhasRenov: Record<string, number> = {};
let demissoes = 0, vendas = 0, contratacoes = 0, renovacoes = 0, shows = 0, receitaShows = 0, saldoMin = Infinity;
const t0 = Date.now();

/** Os 16 que importam: os melhores por OVR (titulares e o banco de verdade). */
const nucleo = () => new Set([...s.elenco].sort((a, b) => ovrDe(b) - ovrDe(a)).slice(0, 16).map((a) => a.id));

function decisoesDaSemana() {
  if (s.evento) responderEvento(pacote, s, s.evento.opcoes[0].id);
  const n = nucleo();
  for (const p of [...(s.propostasV ?? [])]) { const r = n.has(p.atletaId) ? recusarVenda(pacote, s, p.id) : aceitarVenda(pacote, s, p.id); if (r.ok && !n.has(p.atletaId)) vendas++; }
  for (const p of [...(s.propostas ?? [])]) { const r = T.responderPropostaT(pacote, s, p.id, n.has(p.atletaId) ? "recusar" : "aceitar"); if (r.ok && !n.has(p.atletaId)) vendas++; }
  for (const p of [...(s.showsOferta ?? [])]) if (responderShow(s, p.id, true).ok) shows++;
  if (s.ofertaEmprego) {
    const atual = w.clube[s.clubeId]?.forca ?? 60, novo = w.clube[s.ofertaEmprego.clubeId]?.forca ?? 0;
    if (novo > atual + 3) T.aceitarEmprego(pacote, s); else T.recusarEmprego(pacote, s);
  }
  // reta final: renova quem joga e está com o contrato acabando
  if (s.semana >= T.semanasDaTemporada(s) - 4) for (const a of s.elenco.filter((x) => n.has(x.id) && x.contratoAte <= s.temporada && x.idade <= 32)) { const r = T.renovar(pacote, s, a.id, 3); if (r.ok) renovacoes++; else { const k = r.msg.replace(/[A-ZÀ-Ú][a-zà-ú]+ [A-ZÀ-Ú][a-zà-ú]+/g, "X").replace(/[\d.,]+/g, "N").slice(0, 90); falhasRenov[k] = (falhasRenov[k] ?? 0) + 1; } }
  // pré-temporada: completa o elenco com agente livre
  if (s.semana === 0) {
    let tent = 0;
    while (s.elenco.length < 24 && tent++ < 6) {
      const livres = T.agentesLivresT(pacote, s).sort((a, b) => b.ovr - a.ovr);
      const alvo = livres.find((l) => l.pedido * 12 < s.clube.saldo * 0.1);
      // (agente livre não usa verba: só salário, dentro do teto)
      if (!alvo || !T.contratarLivre(pacote, s, alvo.nome, 2).ok) break;
      contratacoes++;
    }
  }
  s.esc = { ...melhorEscalacao(s.elenco.filter((a) => !a.emprestadoDe), s.tatica.formacao), capitao: s.esc.capitao, funcoes: s.esc.funcoes } as typeof s.esc;
}

function procurarClube() {
  const rep = s.tecnico.reputacao, lic = T.licencaT(s), tol = T.toleranciaLicenca(s.tecnico.prestigio ?? 0);
  const paisAntes = infoLiga(s.ligaId).pais;
  const ops = T.ligasParaComecar(pacote).flatMap((l) => T.clubesDaLiga(pacote, l.id).map((c) => ({ ...c, pais: infoLiga(l.id).pais })))
    .filter((c) => c.exige <= rep && c.licenca <= lic + tol && c.id !== s.clubeId)
    .sort((a, b) => (b.pais === paisAntes ? 3 : 0) + b.forca - ((a.pais === paisAntes ? 3 : 0) + a.forca));
  return ops[0]?.id;
}

for (let t = 0; t < maxT; t++) {
  const ini = Date.now(), tAntes = s.temporada, conf0 = s.diretoria.confianca;
  let guarda = 0;
  while (s.temporada === tAntes && guarda++ < 80) {
    if (s.demitido) {
      demissoes++; passagens.at(-1)!.saiu = s.demitido.split(":")[0];
      const novo = procurarClube();
      if (!novo) { erros.push(`T${t}: demitido e nenhum clube aceita (reputação ${s.tecnico.reputacao})`); break; }
      s = T.assumirNovoClube(pacote, s, novo);
      passagens.push({ clube: nome(s.clubeId), liga: infoLiga(s.ligaId).curto, desde: s.temporada });
      continue;
    }
    try {
      decisoesDaSemana();
      T.avancarSemana(pacote, s);
      if (s.novoClube && s.semana === 0 && !s.demitido) { passagens.at(-1)!.saiu = "trocou de clube"; s = T.assumirNovoClube(pacote, s, s.novoClube); passagens.push({ clube: nome(s.clubeId), liga: infoLiga(s.ligaId).curto, desde: s.temporada }); }
    } catch (err) { erros.push(`T${t} S${s.semana}: ${(err as Error).message} ${(err as Error).stack?.split("\n")[1]?.trim() ?? ""}`); if (erros.length > 5) break; s.semana++; }
    saldoMin = Math.min(saldoMin, s.clube.saldo);
  }
  if (erros.length > 5) break;
  if (guarda >= 80) erros.push(`T${t}: a temporada não virou depois de 80 semanas`);
  const h = s.historico.at(-1), el = [...s.elenco].sort((a, b) => ovrDe(b) - ovrDe(a)), top11 = el.slice(0, 11);
  const fin = s.financas.slice(-12), soma = (k: "receitas" | "despesas") => fin.reduce((a, l) => a + Object.values(l[k]).reduce((x, y) => x + y, 0), 0);
  temporadas.push({
    t, clube: nome(h?.clubeId ?? s.clubeId), liga: infoLiga(h?.ligaId ?? s.ligaId).curto, pos: h?.pos, esperado: h?.esperado, campeao: !!h?.campeao, pts: h?.pts,
    confiancaIni: Math.round(conf0), confianca: Math.round(s.diretoria.confianca), reputacao: s.tecnico.reputacao,
    saldo: Math.round(s.clube.saldo), divida: Math.round(s.clube.divida ?? 0), folhaMes: T.folhaDe(s), tetoFolha: s.clube.tetoFolha,
    receitasAno: Math.round(soma("receitas")), despesasAno: Math.round(soma("despesas")),
    elenco: s.elenco.length, ovrTop11: +(top11.reduce((a, x) => a + ovrDe(x), 0) / Math.max(1, top11.length)).toFixed(1),
    idadeMedia: +(s.elenco.reduce((a, x) => a + x.idade, 0) / Math.max(1, s.elenco.length)).toFixed(1),
    forcaClubeMundo: Math.round(w.clube[s.clubeId]?.forca ?? 0), torcida: Math.round(s.clube.torcida), capacidade: s.clube.capacidade,
    titulosCopa: (s.titulosCopa ?? []).filter((x) => x.t === tAntes).length, bolsoTecnico: Math.round(s.tecnico.saldo ?? 0),
    saveKB: Math.round(JSON.stringify(s).length / 1024), seg: +((Date.now() - ini) / 1000).toFixed(1),
  });
  for (const p of varrerNumeros(s)) erros.push(`T${t}: número estranho em ${p}`);
}
console.log(JSON.stringify({
  modo: "tecnico", caso: caso.nome, descricao: caso.descricao, temporadas, passagens, demissoes, vendas, contratacoes, renovacoes, shows, receitaShows,
  saldoMin: Math.round(saldoMin), falhasRenov, erros: [...new Set(erros)].slice(0, 20), mundoInicio: inicioMundo, mundoFim: fotoMundo(w), segundos: Math.round((Date.now() - t0) / 1000),
}));
