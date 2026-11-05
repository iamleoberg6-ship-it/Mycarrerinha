// A vida fora do campo na carreira de técnico: a mesma família e os mesmos relacionamentos da carreira de jogador
// (pais, irmãos, companheira, filhos, ex), que continuam vivos. As mesmas regras do modo jogador (src/familia.ts e
// src/namoro.ts), com o dinheiro do bolso do técnico (o salário dele, não o caixa do clube).
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { infoClube } from "../mundo.js";
import { infoLiga } from "../ligas.js";
import { agirFamilia, acoesDe, semanaFamilia, type AcaoFamilia, type CtxFamilia, type EstadoFamilia } from "../familia.js";
import {
  agirNamoro, acoesNamoro, agirFilho, acoesFilho, agirEx, acoesEx, exesDe, semanaNamoro, estaGravida, arrumarNamoro, baralhoDaSemana, curtir,
  type AcaoNamoro, type AcaoFilho, type AcaoEx, type CtxNamoro, type EstadoNamoro, type ResultadoNamoro,
} from "../namoro.js";
import type { SaveTecnico } from "./motor.js";
import { casaNaFamilia, novoEstado, fecharMes as fecharMesCasa, manutencaoMensal, mudar, IMOVEL, type EstadoCasa, type ClubeCasa } from "../casa.js";

const ANO0 = 2026;
/** Semana na escala da carreira de jogador (40 por temporada): é nela que a família e o namoro guardam datas. */
export const semanaVida = (s: SaveTecnico) => s.temporada * 40 + Math.min(39, s.semana);
export const anoVida = (s: SaveTecnico) => ANO0 + s.temporada;
/** Salário do técnico por mês: cresce com a reputação e com o tamanho da liga. */
export const salarioTecnico = (s: SaveTecnico) => Math.round((18_000 + s.tecnico.reputacao * 2_600) * Math.max(0.35, infoLiga(s.ligaId).fLiga) / 100) * 100;
/** Dinheiro do técnico: com casa, é o saldo da casa (o mesmo da tela da casa); sem, o do bolso. */
export const bolso = (s: SaveTecnico) => (s.casa ? s.casa.saldo : (s.tecnico.saldo ??= 0));
const mexer = (s: SaveTecnico, v: number) => { if (s.casa) s.casa.saldo += v; else s.tecnico.saldo = bolso(s) + v; };
const clubeCasaT = (pacote: PacoteDados, s: SaveTecnico): ClubeCasa | undefined => { const c = infoClube(pacote, s.clubeId); return c ? { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca } : undefined; };
/** A casa do técnico (a da carreira de jogador, se veio de lá; senão um apartamento alugado perto do clube). */
export function casaT(pacote: PacoteDados, s: SaveTecnico): EstadoCasa {
  if (!s.casa) { s.casa = novoEstado(bolso(s), "ap-2q", clubeCasaT(pacote, s)); delete s.tecnico.saldo; }
  s.casa.clube = clubeCasaT(pacote, s);
  // técnico não mora em alojamento de clube: vai para um apartamento alugado
  // técnico não mora em alojamento de clube: vai para a melhor casa que já é dele (comprada na época de jogador) ou aluga um apartamento
  if (IMOVEL[s.casa.imovel]?.categoria === "alojamento") {
    const minha = [...s.casa.proprios].filter((id) => IMOVEL[id] && IMOVEL[id].categoria !== "alojamento").sort((a, b) => (IMOVEL[b].compra ?? 0) - (IMOVEL[a].compra ?? 0))[0];
    const r = mudar(s.casa, minha ?? "ap-2q", "alugar", salarioTecnico(s));
    if (!r.ok) s.casa.imovel = minha ?? "ap-2q";
  }
  return s.casa;
}

/** A vida chega da carreira de jogador (cópia: o save do jogador não muda) e envelhece no tempo da pausa. */
export function trazerVida(s: SaveTecnico, familia?: EstadoFamilia, namoro?: EstadoNamoro, saldo?: number, casa?: EstadoCasa) {
  if (casa && !s.casaDoJogador) { const atual = s.casa ? bolso(s) : undefined; s.casa = JSON.parse(JSON.stringify(casa)); if (atual !== undefined) s.casa!.saldo = atual; s.casaDoJogador = true; }
  if (familia) s.familia = JSON.parse(JSON.stringify(familia));
  if (namoro) {
    const n: EstadoNamoro = JSON.parse(JSON.stringify(namoro));
    arrumarNamoro(n);
    // o app de namoro recomeça na cidade nova; quem estava só no "deu match" fica para trás
    n.baralho = []; n.geradoEm = -1; n.matches = [];
    for (const f of n.filhos ?? []) if (f.nomear) delete f.nomear;
    s.namoro = n;
  }
  if (saldo !== undefined) { if (s.casa) s.casa.saldo = Math.max(0, Math.round(saldo)); else s.tecnico.saldo = Math.max(0, Math.round(saldo)); }
  // as datas guardadas (último contato) passam para a escala de agora: ninguém "some" só porque o relógio mudou
  const agora = semanaVida(s);
  for (const m of s.familia?.membros ?? []) m.contato = Math.max(m.contato, agora - 2);
  for (const f of s.namoro?.filhos ?? []) f.contato = Math.max(f.contato ?? 0, agora - 2);
  if (s.namoro?.par) s.namoro.par.desde = Math.min(s.namoro.par.desde, agora);
}

const cidadeDo = (pacote: PacoteDados, s: SaveTecnico) => infoClube(pacote, s.clubeId)?.cidade ?? "";
export function ctxNamoroT(pacote: PacoteDados, s: SaveTecnico): CtxNamoro {
  const pais = infoClube(pacote, s.clubeId)?.pais;
  return { ano: anoVida(s), semente: s.semente, semanaAbs: semanaVida(s), idadeJogador: s.tecnico.idade, fama: clamp(s.tecnico.reputacao, 0, 100), cidade: cidadeDo(pacote, s),
    salario: salarioTecnico(s), saldo: bolso(s), vidaNoturna: 30, ...(pais ? { pais } : {}), paisJogador: s.tecnico.nac };
}
export function ctxFamiliaT(pacote: PacoteDados, s: SaveTecnico, jogoEmCasa = false): CtxFamilia {
  const pais = infoClube(pacote, s.clubeId)?.pais;
  return { semanaAbs: semanaVida(s), ano: anoVida(s), idadeJogador: s.tecnico.idade, exterior: !!pais && pais !== s.tecnico.nac && !(pais === "BRA" && s.tecnico.nac === "BRA"),
    salario: salarioTecnico(s), saldo: bolso(s), profissional: false, clubeId: s.clubeId, forcaClube: 70, relTecnico: 60, fama: s.tecnico.reputacao, jogoEmCasa, janela: false, temporada: s.temporada };
}

/** Ações com os pais e irmãos (sem as de jogador: indicar à base e pedir indicação). */
export const acoesFamiliaT = (pacote: PacoteDados, s: SaveTecnico, id: string, jogoEmCasa: boolean): AcaoFamilia[] => {
  const m = s.familia?.membros.find((x) => x.id === id);
  return m ? acoesDe(m, ctxFamiliaT(pacote, s, jogoEmCasa)).filter((a) => a !== "indicarBase" && a !== "pedirIndicacao") : [];
};
const pagar = (s: SaveTecnico, r: { ok: boolean; custo?: number }) => { if (r.ok && r.custo) mexer(s, -r.custo); };
export function agirFamiliaT(pacote: PacoteDados, s: SaveTecnico, id: string, acao: AcaoFamilia, jogoEmCasa: boolean): { ok: boolean; msg: string } {
  if (!s.familia) return { ok: false, msg: "Sem família por aqui." };
  const r = agirFamilia(s.familia, id, acao, ctxFamiliaT(pacote, s, jogoEmCasa), new RNG(`${s.semente}|famT|${id}|${acao}|${semanaVida(s)}`));
  pagar(s, r);
  return r;
}
/** Programas com a companheira (ou um casinho/match): os mesmos do modo jogador. */
export function acoesParT(s: SaveTecnico, id: string): AcaoNamoro[] {
  const n = s.namoro, p = n && (n.par?.id === id ? n.par : n.ficantes?.find((x) => x.id === id) ?? n.matches.find((x) => x.id === id));
  return p && n ? acoesNamoro(p, semanaVida(s), false, estaGravida(n, p.nome)) : [];
}
export function agirParT(pacote: PacoteDados, s: SaveTecnico, id: string, acao: AcaoNamoro): ResultadoNamoro {
  const n = (s.namoro ??= { baralho: [], geradoEm: -1, vistos: 0, matches: [], semana: -1, feitas: 0, ex: [], ficantes: [], casos: [], filhos: [] });
  const r = agirNamoro(n, id, acao, ctxNamoroT(pacote, s));
  pagar(s, r);
  return r;
}
export const acoesFilhoT = (s: SaveTecnico, i: number): AcaoFilho[] => { const f = s.namoro?.filhos?.[i]; return f ? acoesFilho(f, Math.max(0, anoVida(s) - f.ano)).filter((a) => a !== "gol") : []; };
export function agirFilhoT(pacote: PacoteDados, s: SaveTecnico, i: number, acao: AcaoFilho): ResultadoNamoro {
  if (!s.namoro) return { ok: false, msg: "Sem filhos." };
  const r = agirFilho(s.namoro, i, acao, ctxNamoroT(pacote, s));
  pagar(s, r);
  return r;
}
export const exesT = (s: SaveTecnico) => (s.namoro ? exesDe(s.namoro, s.tecnico.idade) : []);
export const acoesExT = (s: SaveTecnico, id: string): AcaoEx[] => { const e = exesT(s).find((x) => x.par.id === id); return e && s.namoro ? acoesEx(s.namoro, e) : []; };
export function agirExT(pacote: PacoteDados, s: SaveTecnico, id: string, acao: AcaoEx): ResultadoNamoro {
  if (!s.namoro) return { ok: false, msg: "Sem ex." };
  const r = agirEx(s.namoro, id, acao, ctxNamoroT(pacote, s));
  pagar(s, r);
  return r;
}
/** App de namoro (para quem está solteiro): os perfis da semana e o curtir. */
export function perfisDaSemanaT(pacote: PacoteDados, s: SaveTecnico) {
  const n = (s.namoro ??= { baralho: [], geradoEm: -1, vistos: 0, matches: [], semana: -1, feitas: 0, ex: [], ficantes: [], casos: [], filhos: [] });
  return baralhoDaSemana(n, ctxNamoroT(pacote, s));
}
export function curtirT(pacote: PacoteDados, s: SaveTecnico, id: string, sim: boolean) { return curtir(s.namoro!, id, sim, ctxNamoroT(pacote, s)); }

/** A semana da vida: a família esfria sem contato, o namoro anda (gravidez, nascimento, brigas) e o salário cai no mês. */
export function semanaDaVida(pacote: PacoteDados, s: SaveTecnico, nota: (texto: string) => void) {
  if (s.familia) for (const a of semanaFamilia(s.familia, { semanaAbs: semanaVida(s), exterior: ctxFamiliaT(pacote, s).exterior, padraoFamilia: 1, polemica: false, clubeId: s.clubeId }).avisos) nota(a);
  if (s.casa) {
    const est = casaNaFamilia(s.casa, s.namoro?.filhos ?? [], s.familia?.membros ?? []);
    if (s.semana === 6 && (s.namoro?.filhos ?? []).some((f) => !f.pensao && !f.adulto && anoVida(s) - f.ano >= 2) && !est.filhos) nota("As crianças dividem o quarto com vocês. Um quarto só delas ajudaria (dá para montar na tela da casa).");
  }
  if (s.namoro) {
    const antes = s.namoro.filhos?.length ?? 0;
    const r = semanaNamoro(s.namoro, ctxNamoroT(pacote, s));
    for (const a of r.avisos) nota(a);
    if (r.custo) mexer(s, -r.custo);
    // bebê novo: nasce com o primeiro nome sugerido (dá para ver na aba Família)
    for (const f of (s.namoro.filhos ?? []).slice(antes)) { delete f.nomear; nota(`Nasceu ${f.nome}, ${f.menina ? "sua filha" : "seu filho"} com ${f.mae.split(" ")[0]}!`); }
  }
}
/** Fim do mês: o salário líquido do técnico cai (sai o custo de vida, a pensão dos filhos que moram com a mãe,
 *  o aluguel e a manutenção da casa; entra o aluguel das casas que ele aluga para outros). */
export function mesDaVida(s: SaveTecnico) {
  const sal = salarioTecnico(s), pensao = (s.namoro?.filhos ?? []).filter((f) => f.pensao && !f.adulto).length * Math.round(sal * 0.08);
  const liquido = Math.round(sal * 0.62) - pensao;
  if (s.casa) { const manut = manutencaoMensal(s.casa).reduce((a, x) => a + x.valor, 0); fecharMesCasa(s.casa, liquido - manut); }
  else s.tecnico.saldo = bolso(s) + liquido;
}
