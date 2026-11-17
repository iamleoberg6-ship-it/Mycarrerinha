// Mercado avançado (inspirado no TransferRoom do FM26): você anuncia o que procura e os clubes oferecem jogadores; outros
// clubes anunciam o que procuram e você oferece os seus; clubes parceiros (para emprestar garotos com garantia de jogo e
// ter prioridade nos garotos deles); e o último dia da janela, com propostas de última hora.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo, infoClube } from "../mundo.js";
import { infoLiga } from "../ligas.js";
import { ovrDe, valorAtleta, type Atleta, type PosT } from "./modelo.js";
import type { SaveTecnico } from "./motor.js";
import { _int, janelaT, semanaAbs, buscarJogadores, interesseDo } from "./motor.js";
import { novaPropostaVenda } from "./negociacao.js";

export interface Necessidade { id: string; pos: PosT; idadeMax: number; tipo: "compra" | "emprestimo" | "qualquer"; nivel: "titular" | "elenco" | "jovem"; desde: number }
export interface Oferecido { nome: string; clubeId: string; pos: PosT; idade: number; nac: string; valor: number; tipo: "compra" | "emprestimo"; nota: string; expira: number; nec?: string; parceiro?: boolean }
export interface Procura { id: string; clubeId: string; pos: PosT; idadeMax: number; tipo: "compra" | "emprestimo"; expira: number; respondida?: boolean }
export const NOME_NIVEL_NEC = { titular: "Para ser titular", elenco: "Para compor o elenco", jovem: "Jovem para desenvolver" } as const;

export function anunciar(s: SaveTecnico, n: Omit<Necessidade, "id" | "desde">): { ok: boolean; msg: string } {
  const l = (s.necessidades ??= []);
  if (l.length >= 3) return { ok: false, msg: "Você pode ter até 3 anúncios ao mesmo tempo." };
  l.push({ ...n, id: `${semanaAbs(s)}-${n.pos}-${l.length}`, desde: semanaAbs(s) });
  return { ok: true, msg: `Anúncio publicado: ${n.pos}${n.idadeMax < 40 ? ` até ${n.idadeMax} anos` : ""}. Os clubes vão oferecer jogadores enquanto a janela estiver aberta.` };
}
export function tirarAnuncio(s: SaveTecnico, id: string) { s.necessidades = (s.necessidades ?? []).filter((x) => x.id !== id); s.oferecidos = (s.oferecidos ?? []).filter((x) => x.nec !== id); }

/** Fim da janela atual: na semana em que ela fecha, é o último dia. */
export function ultimoDia(s: SaveTecnico): boolean {
  if (!janelaT(s).aberta) return false;
  return !janelaT({ ...s, semana: s.semana + 1 } as SaveTecnico).aberta;
}
const parceirosDe = (s: SaveTecnico) => s.parceiros ?? [];

/** Toda semana com a janela aberta: ofertas para os seus anúncios, anúncios de outros clubes e o último dia. */
export function semanaMercadoExtra(pacote: PacoteDados, s: SaveTecnico, eventos: string[]) {
  const ab = semanaAbs(s), w = mundo(pacote);
  s.oferecidos = (s.oferecidos ?? []).filter((o) => o.expira > ab);
  s.procurando = (s.procurando ?? []).filter((p) => p.expira > ab && !p.respondida);
  if (!janelaT(s).aberta) return;
  const rng = _int.rngT(s, "mercadoExtra"), ult = ultimoDia(s);
  // 1) ofertas para os seus anúncios (no último dia, mais e mais baratas)
  for (const n of s.necessidades ?? []) {
    const ja = s.oferecidos.filter((o) => o.nec === n.id).length;
    if (ja >= 4) continue;
    const quantos = ult ? rng.int(1, 3) : rng.chance(0.65) ? rng.int(1, 2) : 0;
    const meuF = w.clube[s.clubeId]?.forca ?? 60;
    const ovrMin = n.nivel === "titular" ? meuF - 2 : n.nivel === "elenco" ? meuF - 9 : 0;
    const cands = buscarJogadores(pacote, s, { pos: n.pos, idadeMax: n.idadeMax, ovrMin, alcance: true })
      .filter((x) => !s.oferecidos!.some((o) => o.nome === x.nome) && interesseDo(pacote, s, x).topa && (n.tipo !== "emprestimo" || !x.titular));
    for (const x of rng.shuffle(cands).slice(0, quantos)) {
      const tipo = n.tipo === "qualquer" ? (x.titular || rng.chance(0.55) ? "compra" : "emprestimo") : n.tipo;
      const desconto = ult ? rng.range(0.78, 0.92) : rng.range(0.92, 1.1);
      s.oferecidos.push({ nome: x.nome, clubeId: x.clubeId, pos: x.pos, idade: x.idade, nac: x.nac, valor: Math.round(x.valor * desconto / 1000) * 1000, tipo, nota: ult ? "Última hora: o clube quer resolver hoje" : x.titular ? "Titular, mas o clube aceita negociar" : "Sem espaço no time dele", expira: ab + (ult ? 1 : 3), nec: n.id });
    }
    if (quantos && cands.length) eventos.push(`Clubes ofereceram jogadores para o seu anúncio de ${n.pos}.`);
  }
  // os parceiros mostram os melhores garotos deles primeiro
  for (const pid of parceirosDe(s)) {
    const c = w.clube[pid]; if (!c || !rng.chance(ult ? 0.6 : 0.25)) continue;
    const g = c.elenco.filter((j) => j.idade <= 21 && !s.oferecidos!.some((o) => o.nome === j.nome) && !s.elenco.some((a) => a.nome === j.nome)).sort((a, b) => b.ovr + (b.idade <= 19 ? 4 : 0) - a.ovr)[0];
    if (!g) continue;
    const valor = Math.round(_int.valorNpc(g, infoLiga(c.ligaId).fLiga) * 0.85 / 1000) * 1000;
    s.oferecidos.push({ nome: g.nome, clubeId: c.id, pos: g.posicao as PosT, idade: g.idade, nac: g.nacionalidade, valor, tipo: "compra", nota: "Clube parceiro: prioridade e 15% de desconto", expira: ab + 3, parceiro: true });
    eventos.push(`O ${c.nome}, seu parceiro, ofereceu ${g.nome} (${g.posicao}, ${g.idade} anos) antes de todo mundo.`);
  }
  // 2) outros clubes anunciam o que procuram
  if (s.procurando.length < 5 && rng.chance(ult ? 0.9 : 0.55)) {
    const clubes = w.ligas.filter((l) => !infoLiga(l.id).amador).flatMap((l) => l.clubes).filter((c) => c.id !== s.clubeId);
    const meus = s.elenco.filter((a) => !a.emprestadoDe);
    for (let k = 0; k < (ult ? 2 : 1); k++) {
      const a = rng.pick(meus); if (!a) break;
      const o = ovrDe(a), cs = clubes.filter((c) => Math.abs(c.forca - o) <= 6);
      if (!cs.length) continue;
      const c = rng.pick(cs), tipo = a.idade <= 22 && rng.chance(0.5) ? "emprestimo" : "compra";
      s.procurando.push({ id: `${ab}-${c.id}-${k}`, clubeId: c.id, pos: a.pos, idadeMax: clamp(a.idade + rng.int(0, 5), 19, 35), tipo, expira: ab + (ult ? 1 : 3) });
    }
  }
  // 3) último dia: propostas de última hora por quem está à venda (ou pelos destaques), valendo só hoje
  if (ult) {
    eventos.push("Último dia da janela! Propostas de última hora chegando, e o que não fechar hoje fica para a próxima janela.");
    _int.noticia(s, "dinheiro", "Último dia da janela: as propostas e ofertas desta semana expiram hoje.");
    const fL = _int.fLigaDe(s), aVenda = new Set(s.aVenda ?? []);
    const alvos = s.elenco.filter((a) => !a.emprestadoDe && (aVenda.has(a.id) || ovrDe(a) >= (w.clube[s.clubeId]?.forca ?? 60) + 2)).sort((a, b) => (aVenda.has(b.id) ? 10 : 0) + ovrDe(b) - (aVenda.has(a.id) ? 10 : 0) - ovrDe(a)).slice(0, 4);
    const clubes = w.ligas.filter((l) => !infoLiga(l.id).amador).flatMap((l) => l.clubes).filter((c) => c.id !== s.clubeId);
    for (const a of alvos) {
      if ((s.propostasV ?? []).length >= 7 || !rng.chance(aVenda.has(a.id) ? 0.7 : 0.25)) continue;
      const o = ovrDe(a), cs = clubes.filter((c) => c.forca >= o - 3 && c.forca <= o + 10);
      if (!cs.length) continue;
      const c = rng.pick(cs), valor = valorAtleta(a, Math.max(fL, infoLiga(c.ligaId).fLiga), s.temporada) * rng.range(1.0, 1.3);
      const p = novaPropostaVenda(s, a, c.id, valor, rng, ab); p.id += "-ult"; p.expira = ab + 1;
      (s.propostasV ??= []).push(p);
      eventos.push(`Última hora: o ${infoClube(pacote, c.id)?.nome ?? c.id} oferece ${Math.round(valor / 1e5) / 10} mi por ${a.nome}, só até hoje.`);
    }
  }
}
/** Você oferece um jogador seu a um clube que anunciou procurar alguém assim. */
export function oferecerJogador(pacote: PacoteDados, s: SaveTecnico, procuraId: string, atletaId: string): { ok: boolean; msg: string } {
  const p = (s.procurando ?? []).find((x) => x.id === procuraId), a = s.elenco.find((x) => x.id === atletaId);
  if (!p || !a) return { ok: false, msg: "Esse anúncio não está mais valendo." };
  if (a.pos !== p.pos) return { ok: false, msg: `Eles procuram ${p.pos}.` };
  if (a.idade > p.idadeMax) return { ok: false, msg: `Eles querem alguém de até ${p.idadeMax} anos.` };
  const ab = semanaAbs(s), rng = new RNG(`${s.semente}|oferta|${p.id}|${a.id}`), w = mundo(pacote), c = w.clube[p.clubeId], nomeC = infoClube(pacote, p.clubeId)?.nome ?? p.clubeId;
  p.respondida = true;
  const o = ovrDe(a), cf = c?.forca ?? 65, gosta = clamp(0.75 - Math.abs(o - cf) * 0.05 + (a.idade <= 23 ? 0.08 : 0), 0.1, 0.92);
  if (!rng.chance(gosta)) return { ok: false, msg: `O ${nomeC} analisou ${a.nome} e preferiu outro perfil.` };
  if (p.tipo === "compra") {
    const valor = valorAtleta(a, Math.max(_int.fLigaDe(s), infoLiga(c?.ligaId ?? s.ligaId).fLiga), s.temporada) * rng.range(0.8, 1.05);
    (s.propostasV ??= []).push(novaPropostaVenda(s, a, p.clubeId, valor, rng, ab));
    return { ok: true, msg: `O ${nomeC} gostou e mandou uma proposta por ${a.nome}. Veja em Propostas.` };
  }
  const valor = valorAtleta(a, _int.fLigaDe(s), s.temporada), titular = cf <= o + 1;
  const max = { salarioPct: clamp(Math.round(rng.range(0.6, 1.05) * 10) * 10, 40, 100), taxa: Math.round(valor * rng.range(0, 0.06) / 1000) * 1000, titular };
  (s.ofertasEmp ??= []).push({ id: `${ab}-e-${a.id}-${p.clubeId}`, atletaId: a.id, clubeId: p.clubeId, salarioPct: Math.max(0, max.salarioPct - 10), taxa: Math.round(max.taxa * 0.6 / 1000) * 1000, opcao: 0, papel: titular ? "titular" : "rotacao", expira: ab + 2, max, rodadas: 0 });
  return { ok: true, msg: `O ${nomeC} quer ${a.nome} emprestado. Veja em Propostas.` };
}

// ------------------------------------------------------------------ clubes parceiros
/** Clubes que aceitam ser parceiros: mais fracos que você, do seu país ou de ligas menores. */
export function candidatosParceiro(pacote: PacoteDados, s: SaveTecnico): { id: string; nome: string; liga: string; forca: number; custo: number }[] {
  const w = mundo(pacote), meu = w.clube[s.clubeId], pais = infoLiga(s.ligaId).pais;
  if (!meu) return [];
  return w.ligas.filter((l) => !infoLiga(l.id).amador).flatMap((l) => l.clubes.map((c) => ({ c, l })))
    .filter(({ c, l }) => c.id !== s.clubeId && c.forca <= meu.forca - 6 && c.forca >= meu.forca - 22 && (infoLiga(l.id).pais === pais || infoLiga(l.id).nivel > infoLiga(s.ligaId).nivel))
    .sort((a, b) => (infoLiga(a.l.id).pais === pais ? -1 : 0) - (infoLiga(b.l.id).pais === pais ? -1 : 0) || b.c.forca - a.c.forca)
    .slice(0, 12).map(({ c, l }) => ({ id: c.id, nome: infoClube(pacote, c.id)?.nome ?? c.id, liga: infoLiga(l.id).curto, forca: Math.round(c.forca), custo: custoParceria(s, c.forca) }));
}
/** Quanto custa por mês ajudar o parceiro (estrutura, material, técnicos da base). */
export const custoParceria = (s: SaveTecnico, forca: number) => Math.round(Math.max(20000, 180000 * clamp(_int.fLigaDe(s), 0.2, 1.4) * (forca / 70)) / 1000) * 1000;
export function firmarParceria(pacote: PacoteDados, s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const l = (s.parceiros ??= []);
  if (l.includes(id)) { s.parceiros = l.filter((x) => x !== id); return { ok: true, msg: `A parceria com o ${infoClube(pacote, id)?.nome ?? id} acabou.` }; }
  if (l.length >= 2) return { ok: false, msg: "Você pode ter até 2 clubes parceiros." };
  if (!candidatosParceiro(pacote, s).some((c) => c.id === id)) return { ok: false, msg: "Esse clube não topa a parceria." };
  l.push(id);
  return { ok: true, msg: `Parceria fechada com o ${infoClube(pacote, id)?.nome ?? id}: você empresta garotos com garantia de jogo e vê os melhores garotos deles antes de todo mundo.` };
}
export const custoParceiros = (pacote: PacoteDados, s: SaveTecnico) => parceirosDe(s).reduce((x, id) => x + custoParceria(s, mundo(pacote).clube[id]?.forca ?? 60), 0);
/** Empréstimo direto ao parceiro: ele joga como titular e o parceiro paga 60% do salário (até o fim da temporada). */
export function emprestarAoParceiro(pacote: PacoteDados, s: SaveTecnico, atletaId: string, parceiroId: string): { ok: boolean; msg: string } {
  const a = s.elenco.find((x) => x.id === atletaId);
  if (!a) return { ok: false, msg: "Jogador não encontrado." };
  if (!parceirosDe(s).includes(parceiroId)) return { ok: false, msg: "Esse clube não é seu parceiro." };
  if (a.idade > 23) return { ok: false, msg: "Para o parceiro vão só jogadores de até 23 anos." };
  if (a.emprestadoDe) return { ok: false, msg: "Ele já é emprestado." };
  if (!janelaT(s).aberta) return { ok: false, msg: "Só com a janela aberta." };
  if (s.elenco.length <= 18) return { ok: false, msg: "O elenco ficaria curto demais (mínimo de 18)." };
  _int.tirarDoElenco(s, a.id);
  (s.emprestados ??= []).push({ atleta: a, clubeId: parceiroId, ate: s.temporada, papel: "titular", salarioPct: 60, opcao: 0, jogos: 0, gols: 0 });
  return { ok: true, msg: `${a.nome} vai jogar no ${infoClube(pacote, parceiroId)?.nome ?? parceiroId} até o fim da temporada, como titular. O parceiro paga 60% do salário.` };
}
export type { Atleta };
