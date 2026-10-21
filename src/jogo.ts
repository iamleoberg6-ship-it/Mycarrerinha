// A carreira jogável, semana a semana. Tudo que o jogo precisa guardar fica num Save (JSON).
// Cada sorteio usa uma semente derivada do save + semana, então recarregar a página não muda resultados.
import { RNG, clamp } from "./rng.js";
import { ATRIBUTOS, ovr as calcOvr, evoluirSemana, type Atributo, type Atributos, type Grupo, type Intensidade, type Participacao, type Posicao } from "./atributos.js";
import { simularPlacar, desempenhoJogador, sortearLesao, pontuacaoTitular, VAGAS_433 } from "./partida.js";
import { ligaDoPacote, tabelaTurnoReturno, novaTabela, registrar, ordenar, type Clube, type Liga, type LinhaTabela, type PacoteDados } from "./liga.js";
import { salarioMensal, AGENTES, seguidoresDaFama, type TipoAgente } from "./mercado.js";
import type { PersonalidadeDNA, ResultadoCriacao, TracoId } from "./dna.js";
import { definirPerfil, type Efeitos as EfeitosPerfil } from "./perfil.js";
import { novoEstado, fecharMes, efeitosDaCasa, alojamentosDoClube, estruturaDoClube, ESTRUTURAS, IMOVEL, nomeImovel, type EstadoCasa, type ClubeCasa } from "./casa.js";

// ------------------------------------------------------------------ tipos
export interface Jogador {
  nome: string; apelido: string; posicao: Posicao; pais: string; nacionalidade: string; idade: number;
  at: Atributos; pot: number; faixaPot: [number, number]; personalidade: PersonalidadeDNA; tracos: TracoId[];
  perfilId: string; perfilNome: string; aparencia: unknown; numero: string; familia: string;
}
export interface Stats { jogos: number; titular: number; gols: number; assist: number; notas: number[]; base: number; baseGols: number }
export interface ResumoTemporada { ano: number; idade: number; clube: string; ovr: number; jogos: number; gols: number; assist: number; nota: number; posicao: number; titulo: boolean; base: number }
export interface Noticia { semana: string; titulo: string; texto: string; tipo: "jogo" | "clube" | "vida" | "dinheiro" | "polemica" | "lesao" }
export interface Carreira {
  clubeId: string; salario: number; anosContrato: number; formacao: boolean; agente: TipoAgente;
  moral: number; fama: number; seguidores: number; cansaco: number; lesao: number; relTecnico: number; formaUlt: number[];
  bonusEvolucao: number; patrocinioMensal: number; mesesPatrocinio: number; pressao: number; vidaNoturna: number; exposicao: number;
  temporada: number; semana: number; ordem: string[]; tabela: LinhaTabela[]; stats: Stats; historico: ResumoTemporada[];
}
export interface Save { versao: 1; semente: string; jogador: Jogador; carreira: Carreira; casa: EstadoCasa; noticias: Noticia[] }

export const ANO_INICIAL = 2026;
export const SEMANAS_PRE = 2, RODADAS = 38, SEMANAS_TEMPORADA = SEMANAS_PRE + RODADAS;
const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// ------------------------------------------------------------------ mundo (liga e clubes)
let ligaCache: { pacote: PacoteDados; liga: Liga } | undefined;
export function liga(pacote: PacoteDados): Liga {
  if (!ligaCache || ligaCache.pacote !== pacote) ligaCache = { pacote, liga: ligaDoPacote(pacote) };
  return ligaCache.liga;
}
export const clubeDe = (l: Liga, id: string) => l.clubes.find((c) => c.id === id)!;
export function clubeCasa(pacote: PacoteDados, id: string): ClubeCasa {
  const c = (pacote.clubes as unknown as { id: string; nome: string; apelido: string; cores: string[]; forca: number }[]).find((x) => x.id === id)!;
  return { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca };
}
const rngDe = (s: Save, ...partes: (string | number)[]) => new RNG(`${s.semente}|${s.carreira.temporada}|${s.carreira.semana}|${partes.join("|")}`);
export const ovr = (j: Jogador) => calcOvr(j.at, j.posicao);
export const forma = (c: Carreira) => (c.formaUlt.length ? c.formaUlt.reduce((a, b) => a + b, 0) / c.formaUlt.length : 6.5);

// ------------------------------------------------------------------ início
export interface DadosCriacao { resultado: ResultadoCriacao; aparencia: unknown; clube: string | null; perfil?: string; decisao?: string | null }
export interface OfertaBase { clubeId: string; nome: string; apelido: string; cores: string[]; forca: number; estrutura: number; nomeEstrutura: string; moradia: string; fila: number; texto: string }

/** Três clubes oferecem vaga na base. Promessa de clube grande recebe convites dos grandes; os outros, de clubes menores. */
export function ofertasDeBase(pacote: PacoteDados, d: DadosCriacao): OfertaBase[] {
  const l = liga(pacote), perfil = definirPerfil(d.resultado), rng = new RNG(`ofertas|${d.resultado.escolhas.nome}|${d.resultado.potencial}`);
  const min = perfil.efeitos.forcaMinimaClubeInicial;
  const casas = (pacote.clubes as unknown as { id: string; forca: number }[]);
  const forcaPacote = (id: string) => casas.find((c) => c.id === id)!.forca;
  let pool = l.clubes.filter((c) => (min ? forcaPacote(c.id) >= min : forcaPacote(c.id) <= 72));
  if (pool.length < 3) pool = [...l.clubes];
  const escolhidos: Clube[] = [];
  const coracao = l.clubes.find((c) => c.id === d.clube);
  if (coracao && pool.includes(coracao)) escolhidos.push(coracao);
  while (escolhidos.length < 3) { const c = rng.pick(pool); if (!escolhidos.includes(c)) escolhidos.push(c); }
  return escolhidos.map((c) => {
    const cc = clubeCasa(pacote, c.id), est = estruturaDoClube(cc), alojId = alojamentosDoClube(cc)[0], aloj = { nome: nomeImovel(novoEstado(0, alojId, cc), IMOVEL[alojId]) };
    const fila = c.elenco.filter((j) => j.posicao === d.resultado.escolhas.posicao).length;
    const texto = c.id === d.clube ? "O clube do seu coração abriu as portas." : est >= 4 ? "Estrutura de primeiro mundo, mas a fila para subir é longa." : est === 1 ? "Clube pobre: a moradia é apertada, mas a chance de jogar no profissional chega cedo." : est === 2 ? "Clube modesto: pouco conforto, caminho mais curto até o profissional." : "Clube organizado, meio do caminho.";
    return { clubeId: c.id, nome: c.nome, apelido: cc.apelido, cores: cc.cores, forca: Math.round(cc.forca), estrutura: est, nomeEstrutura: ESTRUTURAS[est], moradia: aloj.nome, fila, texto };
  });
}

export function novoJogo(pacote: PacoteDados, d: DadosCriacao, clubeId: string, sementeFixa?: string): Save {
  const r = d.resultado, e = r.escolhas, perfil = definirPerfil(r);
  const ef: EfeitosPerfil = { ...perfil.efeitos };
  const dec = perfil.evento?.opcoes.find((o) => o.id === d.decisao);
  if (dec) for (const [k, v] of Object.entries(dec.efeitos)) {
    const chave = k as keyof EfeitosPerfil;
    if (typeof v === "number") (ef as Record<string, unknown>)[chave] = ((ef[chave] as number | undefined) ?? 0) + v; else (ef as Record<string, unknown>)[chave] = v;
  }
  const pers = { ...r.personalidade, profissionalismo: clamp(r.personalidade.profissionalismo + (ef.profissionalismo ?? 0), 1, 20) };
  const semente = sementeFixa ?? `${e.nome}|${r.potencial}|${Date.now() % 100000}`;
  const l = liga(pacote), rng = new RNG(semente);
  const jogador: Jogador = {
    nome: e.nome, apelido: e.apelido || e.nome.split(" ")[0], posicao: e.posicao, pais: e.pais, nacionalidade: r.nacionalidade, idade: 16,
    at: { ...r.atributos }, pot: r.potencial, faixaPot: r.faixaPotencial, personalidade: pers, tracos: r.tracos, perfilId: perfil.id, perfilNome: perfil.nome,
    aparencia: d.aparencia, numero: String(rng.int(26, 49)), familia: e.familia,
  };
  const ordem = l.clubes.map((c) => c.id);
  for (let i = ordem.length - 1; i > 0; i--) { const j = rng.int(0, i); [ordem[i], ordem[j]] = [ordem[j], ordem[i]]; }
  const fama = ef.fama ?? 0;
  const carreira: Carreira = {
    clubeId, salario: 3000, anosContrato: 2, formacao: true, agente: ef.agente ?? "pai",
    moral: 62, fama, seguidores: Math.round((ef.seguidores ?? 0) + 300), cansaco: 0, lesao: 0, relTecnico: clamp(50 + (ef.relTecnico ?? 0), 0, 100), formaUlt: [],
    bonusEvolucao: ef.bonusEvolucao ?? 0, patrocinioMensal: ef.patrocinioMensal ?? 0, mesesPatrocinio: ef.mesesPatrocinio ?? 0, pressao: ef.pressao ?? 0,
    vidaNoturna: r.vidaNoturnaInicial + (ef.vidaNoturna ?? 0), exposicao: ef.exposicao ?? 0,
    temporada: 0, semana: 0, ordem, tabela: novaTabela(l), stats: statsVazias(), historico: [],
  };
  const cc = clubeCasa(pacote, clubeId);
  const casa = novoEstado(r.dinheiroInicial, alojamentosDoClube(cc)[0], cc);
  const save: Save = { versao: 1, semente, jogador, carreira, casa, noticias: [] };
  const c = clubeDe(l, clubeId);
  noticia(save, "clube", `Bem-vindo ao ${c.nome}`, `${jogador.apelido} assina com a base do ${c.nome}. Mora em: ${nomeImovel(casa, IMOVEL[casa.imovel])}. Ajuda de custo de R$ 3.000 por mês.`);
  if (perfil.evento) noticia(save, "vida", perfil.evento.titulo, dec ? dec.resultado : perfil.evento.texto);
  return save;
}
const statsVazias = (): Stats => ({ jogos: 0, titular: 0, gols: 0, assist: 0, notas: [], base: 0, baseGols: 0 });

export function rotuloSemana(c: Carreira): string {
  const ano = ANO_INICIAL + c.temporada;
  return c.semana < SEMANAS_PRE ? `Pré-temporada ${ano} · semana ${c.semana + 1}` : `Temporada ${ano} · rodada ${c.semana - SEMANAS_PRE + 1}`;
}
function noticia(s: Save, tipo: Noticia["tipo"], titulo: string, texto: string) {
  s.noticias.unshift({ semana: rotuloSemana(s.carreira), titulo, texto, tipo });
  s.noticias = s.noticias.slice(0, 60);
}

// ------------------------------------------------------------------ calendário
export interface Jogo { casa: string; fora: string }
export function jogosDaRodada(c: Carreira, rodada: number): Jogo[] {
  return tabelaTurnoReturno(c.ordem.length)[rodada].map(([a, b]) => ({ casa: c.ordem[a], fora: c.ordem[b] }));
}
export function jogoDaSemana(s: Save): (Jogo & { rodada: number; souCasa: boolean; adversario: string }) | undefined {
  const c = s.carreira;
  if (c.semana < SEMANAS_PRE) return;
  const r = c.semana - SEMANAS_PRE, j = jogosDaRodada(c, r).find((x) => x.casa === c.clubeId || x.fora === c.clubeId)!;
  return { ...j, rodada: r, souCasa: j.casa === c.clubeId, adversario: j.casa === c.clubeId ? j.fora : j.casa };
}

// ------------------------------------------------------------------ escalação
export type Escalacao = "titular" | "banco" | "base" | "fora" | "lesionado" | "semJogo";
export const NOME_ESCALACAO: Record<Escalacao, string> = {
  titular: "Titular", banco: "No banco", base: "Jogo da base", fora: "Fora dos relacionados", lesionado: "Lesionado", semJogo: "Sem jogo",
};
export function escalacao(pacote: PacoteDados, s: Save, cansacoPrevisto = s.carreira.cansaco): Escalacao {
  const c = s.carreira, j = s.jogador;
  if (c.lesao > 0) return "lesionado";
  if (c.semana < SEMANAS_PRE) return "semJogo";
  const clube = clubeDe(liga(pacote), c.clubeId);
  const meu = pontuacaoTitular(ovr(j), forma(c), c.relTecnico, cansacoPrevisto);
  const rank = clube.elenco.filter((x) => x.posicao === j.posicao).filter((x) => pontuacaoTitular(x.ovr, 6.5, 50, 0) > meu).length;
  const vagas = VAGAS_433[j.posicao];
  if (rank < vagas) return "titular";
  if (rank <= vagas + 1) return "banco";
  if (j.idade <= 19) {
    // garoto da base em grande fase ganha chance de ficar no banco do profissional
    if (forma(c) >= 7.4 && c.relTecnico >= 65 && rngDe(s, "relacionado").chance(0.35)) return "banco";
    return "base";
  }
  return "fora";
}

// ------------------------------------------------------------------ plano da semana
export type Acao = "treino" | "descanso" | "familia" | "amigos" | "redes" | "video";
export const ACOES: Record<Acao, { nome: string; efeito: string }> = {
  treino: { nome: "Treino extra", efeito: "+10% de evolução, +10 de cansaço" },
  descanso: { nome: "Descanso", efeito: "−15 de cansaço" },
  familia: { nome: "Família", efeito: "+2 de moral" },
  amigos: { nome: "Sair com amigos", efeito: "+4 de moral, +10 de cansaço, risco de polêmica" },
  redes: { nome: "Redes sociais", efeito: "Mais seguidores e fama, risco de polêmica" },
  video: { nome: "Estudar o adversário", efeito: "Melhora a nota do jogo e a relação com o técnico" },
};
export interface Plano { foco: Grupo; intensidade: Intensidade; acoes: Acao[] }
export const planoPadrao = (): Plano => ({ foco: "tecnico", intensidade: "normal", acoes: ["treino", "descanso", "familia", "video", "descanso"] });

/** O que o plano faz com cansaço e moral antes do jogo (sem sorteios). */
export function previaPlano(s: Save, p: Plano) {
  const casa = efeitosDaCasa(s.casa).total, cont = (a: Acao) => p.acoes.filter((x) => x === a).length;
  const cansaco = clamp(s.carreira.cansaco + 10 * cont("treino") - 15 * cont("descanso") + 10 * cont("amigos") + (p.intensidade === "alta" ? 10 : p.intensidade === "leve" ? -10 : 0) + 12, 0, 100);
  const moral = clamp(s.carreira.moral + 2 * cont("familia") + 4 * cont("amigos"), 0, 100);
  const evolucao = Math.round(100 * (cont("treino") * 0.1 + (p.intensidade === "alta" ? 0.2 : p.intensidade === "leve" ? -0.2 : 0) + casa.evolucao / 100 + s.carreira.bonusEvolucao));
  return { cansaco: Math.round(cansaco), moral: Math.round(moral), evolucao, notaExtra: Math.min(0.3, 0.15 * cont("video")) };
}

// ------------------------------------------------------------------ partida
export interface Opcao { id: string; rotulo: string }
export interface Decisao { min: number; titulo: string; texto: string; opcoes: Opcao[]; modelo: string }
export interface Lance { min: number; lado: "casa" | "fora"; meu?: "gol" | "assist"; texto: string }
export interface Partida {
  tipo: "profissional" | "base"; escalacao: Escalacao; casa: string; fora: string; nomeCasa: string; nomeFora: string; souCasa: boolean;
  entrada: number; saida: number; golsCasa: number; golsFora: number; lances: Lance[]; decisoes: Decisao[];
  base: { gols: number; assist: number; nota: number }; fAdv: number;
}
export interface ResultadoDecisao { sucesso: boolean; texto: string; golPro: boolean; golContra: boolean; meu?: "gol" | "assist"; nota: number }

interface Modelo { titulo: string; texto: string; opcoes: { id: string; rotulo: string; at: Partial<Record<Atributo, number>>; ajuste: number; tracos?: Partial<Record<TracoId, number>>;
  sucesso: { texto: string; golPro?: number; meu?: "gol" | "assist"; nota: number }; falha: { texto: string; golContra?: number; nota: number } }[] }
const MODELOS: Record<string, Modelo> = {
  caraACara: { titulo: "Cara a cara com o goleiro", texto: "A bola sobra na entrada da pequena área. Só tem o goleiro na sua frente.", opcoes: [
    { id: "colocado", rotulo: "Bater colocado", at: { FIN: 0.7, COM: 0.3 }, ajuste: 0, tracos: { frieza: 6 }, sucesso: { texto: "No canto, sem chance. GOL!", golPro: 1, meu: "gol", nota: 0.3 }, falha: { texto: "O goleiro se esticou todo e espalmou.", nota: -0.2 } },
    { id: "forte", rotulo: "Encher o pé", at: { FIN: 0.5, FOR: 0.5 }, ajuste: -0.05, tracos: { chute_longe: 4 }, sucesso: { texto: "Bomba! A rede estufou. GOL!", golPro: 1, meu: "gol", nota: 0.3 }, falha: { texto: "Foi por cima do travessão.", nota: -0.3 } },
    { id: "driblar", rotulo: "Driblar o goleiro", at: { DRI: 0.6, COM: 0.4 }, ajuste: -0.12, tracos: { ginga: 6, drible_curto: 5 }, sucesso: { texto: "Deixou o goleiro sentado e tocou pro gol vazio. Golaço!", golPro: 1, meu: "gol", nota: 0.6 }, falha: { texto: "O goleiro abafou o drible.", nota: -0.35 } },
    { id: "tocar", rotulo: "Rolar para o companheiro", at: { PAS: 0.6, VIS: 0.4 }, ajuste: 0.08, sucesso: { texto: "Passe açucarado, é só empurrar. Gol do time, assistência sua!", golPro: 1, meu: "assist", nota: 0.3 }, falha: { texto: "O zagueiro cortou o passe.", nota: -0.15 } },
  ] },
  ponta: { titulo: "Um contra um na ponta", texto: "Você recebe aberto, com o lateral adversário vindo sozinho.", opcoes: [
    { id: "cruzar", rotulo: "Passar e cruzar", at: { DRI: 0.5, CRU: 0.5 }, ajuste: 0, tracos: { ginga: 3 }, sucesso: { texto: "Passou e cruzou na cabeça do centroavante. Gol, assistência sua!", golPro: 1, meu: "assist", nota: 0.35 }, falha: { texto: "O cruzamento saiu forte demais.", nota: -0.2 } },
    { id: "cortar", rotulo: "Cortar para dentro e chutar", at: { DRI: 0.5, FIN: 0.5 }, ajuste: -0.1, tracos: { chute_longe: 5, drible_curto: 4 }, sucesso: { texto: "Cortou e bateu de chapa no ângulo. GOL!", golPro: 1, meu: "gol", nota: 0.5 }, falha: { texto: "O chute travou na defesa.", nota: -0.2 } },
    { id: "segurar", rotulo: "Segurar e tocar", at: { PAS: 0.6, VIS: 0.4 }, ajuste: 0.15, sucesso: { texto: "Prendeu a bola e o time respirou.", nota: 0.15 }, falha: { texto: "Perdeu a bola no meio do caminho.", nota: -0.2 } },
  ] },
  meio: { titulo: "Espaço entre as linhas", texto: "Você gira livre na intermediária. O centroavante pede em profundidade.", opcoes: [
    { id: "enfiar", rotulo: "Enfiar a bola", at: { VIS: 0.6, PAS: 0.4 }, ajuste: -0.05, sucesso: { texto: "Passe entre os zagueiros, o atacante só tocou. Assistência sua!", golPro: 1, meu: "assist", nota: 0.4 }, falha: { texto: "O passe ficou longo.", nota: -0.15 } },
    { id: "chute", rotulo: "Arriscar de fora da área", at: { FIN: 0.8, FOR: 0.2 }, ajuste: -0.2, tracos: { chute_longe: 12 }, sucesso: { texto: "De fora da área, no ângulo! Golaço!", golPro: 1, meu: "gol", nota: 0.7 }, falha: { texto: "Foi pela linha de fundo.", nota: -0.15 } },
    { id: "tabelar", rotulo: "Tabelar e entrar na área", at: { PAS: 0.5, DRI: 0.5 }, ajuste: -0.1, sucesso: { texto: "Tabelinha perfeita e você bateu na saída do goleiro. GOL!", golPro: 1, meu: "gol", nota: 0.5 }, falha: { texto: "O zagueiro chegou antes.", nota: -0.2 } },
  ] },
  contra: { titulo: "Contra-ataque do adversário", texto: "Eles roubaram a bola e vêm três contra dois. O atacante parte para cima de você.", opcoes: [
    { id: "bote", rotulo: "Dar o bote", at: { MAR: 0.6, FOR: 0.4 }, ajuste: -0.05, sucesso: { texto: "Bote limpo, bola recuperada. A torcida levantou.", nota: 0.45 }, falha: { texto: "Ele passou e tocou para o gol. Gol deles.", golContra: 1, nota: -0.45 } },
    { id: "acompanhar", rotulo: "Acompanhar e fechar o ângulo", at: { POS: 0.6, VEL: 0.4 }, ajuste: 0.08, sucesso: { texto: "Fechou o espaço e o chute saiu fraco.", nota: 0.3 }, falha: { texto: "Ele achou o espaço e bateu cruzado. Gol deles.", golContra: 1, nota: -0.35 } },
    { id: "falta", rotulo: "Fazer a falta tática", at: {}, ajuste: 0.4, sucesso: { texto: "Falta no meio-campo, cartão amarelo. Ataque parado.", nota: -0.05 }, falha: { texto: "O juiz deu vantagem e saiu o gol. Gol deles.", golContra: 1, nota: -0.3 } },
  ] },
  antecipar: { titulo: "Bola longa nas costas da defesa", texto: "O meia deles levantou a cabeça e vai lançar.", opcoes: [
    { id: "antecipar", rotulo: "Antecipar o lançamento", at: { POS: 0.5, VIS: 0.5 }, ajuste: -0.1, tracos: { lider_nato: 3 }, sucesso: { texto: "Leu a jogada, roubou e saiu jogando. O contra-ataque terminou em gol!", golPro: 1, meu: "assist", nota: 0.6 }, falha: { texto: "Chegou atrasado e o atacante saiu cara a cara. Gol deles.", golContra: 1, nota: -0.45 } },
    { id: "recuar", rotulo: "Recuar e proteger a área", at: { POS: 0.7, VEL: 0.3 }, ajuste: 0.1, sucesso: { texto: "Cobertura perfeita, bola afastada.", nota: 0.25 }, falha: { texto: "O lançamento caiu no pé do atacante. Gol deles.", golContra: 1, nota: -0.3 } },
  ] },
  escanteio: { titulo: "Escanteio a favor", texto: "O camisa 10 vai bater. Você está na área.", opcoes: [
    { id: "subir", rotulo: "Subir para cabecear", at: { CAB: 0.7, FOR: 0.3 }, ajuste: -0.12, tracos: { cabeceador: 12, bicicleta: 4 }, sucesso: { texto: "Subiu mais que todo mundo. Cabeçada no canto, GOL!", golPro: 1, meu: "gol", nota: 0.5 }, falha: { texto: "A cabeçada saiu por cima.", nota: -0.1 } },
    { id: "rebote", rotulo: "Ficar na sobra", at: { POS: 0.5, FIN: 0.5 }, ajuste: -0.05, sucesso: { texto: "A bola sobrou e você empurrou para a rede. GOL!", golPro: 1, meu: "gol", nota: 0.4 }, falha: { texto: "A defesa afastou.", nota: 0 } },
  ] },
  fundo: { titulo: "Linha de fundo livre", texto: "Você passou pelo marcador e chegou à linha de fundo.", opcoes: [
    { id: "cruzar", rotulo: "Cruzar na área", at: { CRU: 0.8, VIS: 0.2 }, ajuste: 0, sucesso: { texto: "Cruzamento na medida. Gol do time, assistência sua!", golPro: 1, meu: "assist", nota: 0.4 }, falha: { texto: "O goleiro saiu e pegou o cruzamento.", nota: -0.15 } },
    { id: "rasteiro", rotulo: "Tocar rasteiro para trás", at: { PAS: 0.7, VIS: 0.3 }, ajuste: 0.05, sucesso: { texto: "O volante chegou batendo. Gol, assistência sua!", golPro: 1, meu: "assist", nota: 0.35 }, falha: { texto: "A zaga cortou.", nota: -0.1 } },
    { id: "chutar", rotulo: "Chutar sem ângulo", at: { FIN: 0.7, COM: 0.3 }, ajuste: -0.25, sucesso: { texto: "Sem ângulo nenhum, entrou! GOL!", golPro: 1, meu: "gol", nota: 0.6 }, falha: { texto: "Bateu na rede pelo lado de fora.", nota: -0.25 } },
  ] },
};
const MODELOS_POS: Record<Posicao, string[]> = {
  ATA: ["caraACara", "escanteio", "caraACara", "meio"], PON: ["ponta", "caraACara", "fundo"], MEI: ["meio", "caraACara", "antecipar"],
  VOL: ["contra", "antecipar", "meio"], ZAG: ["contra", "escanteio", "antecipar"], LAT: ["fundo", "contra", "ponta"],
};

/** Força dos times da base (sub-17/20) a partir da força do profissional. */
const forcaBase = (forcaPro: number) => 46 + (forcaPro - 70) * 0.6;

export function prepararPartida(pacote: PacoteDados, s: Save, plano: Plano): Partida | undefined {
  const l = liga(pacote), c = s.carreira, j = s.jogador, jogo = jogoDaSemana(s);
  if (!jogo) return;
  const prev = previaPlano(s, plano);
  const esc = escalacao(pacote, s, prev.cansaco);
  if (esc === "lesionado" || esc === "fora") return { tipo: "profissional", escalacao: esc, casa: jogo.casa, fora: jogo.fora, nomeCasa: clubeDe(l, jogo.casa).nome, nomeFora: clubeDe(l, jogo.fora).nome, souCasa: jogo.souCasa, entrada: 0, saida: 0, golsCasa: 0, golsFora: 0, lances: [], decisoes: [], base: { gols: 0, assist: 0, nota: 0 }, fAdv: 0 };
  const rng = rngDe(s, "partida");
  const base = esc === "base";
  const meuClube = clubeDe(l, c.clubeId), adv = clubeDe(l, jogo.adversario);
  let fCasa = clubeDe(l, jogo.casa).forca, fFora = clubeDe(l, jogo.fora).forca;
  const ovrEf = ovr(j) * (0.92 + (0.08 * prev.moral) / 100) * (prev.cansaco > 70 ? 0.9 : 1);
  if (base) { fCasa = forcaBase(fCasa); fFora = forcaBase(fFora); }
  const meuF = jogo.souCasa ? fCasa : fFora, advF = jogo.souCasa ? fFora : fCasa;
  const entrada = esc === "banco" ? (rng.chance(0.6) ? rng.int(55, 80) : 91) : 0;
  const saida = esc === "titular" && prev.cansaco > 75 ? rng.int(60, 75) : 90;
  const minutos = Math.max(0, Math.min(90, saida) - entrada);
  if (minutos > 0 && (esc === "titular" || base)) {
    const bonus = (ovrEf - (base ? meuF + 4 : meuClube.forca)) / 11;
    if (jogo.souCasa) fCasa += bonus; else fFora += bonus;
  }
  const [gc, gf] = simularPlacar(rng, fCasa, fFora);
  const golsMeu = jogo.souCasa ? gc : gf, golsAdv = jogo.souCasa ? gf : gc;
  const d = minutos > 0 ? desempenhoJogador(rng, { posicao: j.posicao, ovrEfetivo: ovrEf, fin: j.at.FIN, passeOuCruz: Math.max(j.at.PAS, j.at.CRU), minutos, golsTime: golsMeu, golsSofridos: golsAdv, fAdv: advF }) : { gols: 0, assistencias: 0, nota: 0 };
  // lances: minutos dos gols; os do jogador caem dentro do tempo em campo
  const lado = (meu: boolean): "casa" | "fora" => (meu === jogo.souCasa ? "casa" : "fora");
  const lances: Lance[] = [];
  const minutosLivres = () => rng.int(2, 89);
  const meusGolsMin: number[] = Array.from({ length: golsMeu }, minutosLivres).sort((a, b) => a - b);
  let g = d.gols, a = d.assistencias;
  for (const m of meusGolsMin) {
    const emCampo = m >= entrada && m <= saida;
    let meu: Lance["meu"];
    if (emCampo && g > 0) { meu = "gol"; g--; } else if (emCampo && a > 0) { meu = "assist"; a--; }
    lances.push({ min: m, lado: lado(true), meu, texto: "" });
  }
  for (let i = 0; i < golsAdv; i++) lances.push({ min: minutosLivres(), lado: lado(false), texto: "" });
  // decisões dentro do tempo em campo
  const nDec = minutos <= 0 ? 0 : minutos >= 45 ? 2 : 1;
  const modelos = [...MODELOS_POS[j.posicao]];
  const decisoes: Decisao[] = [];
  for (let i = 0; i < nDec; i++) {
    const id = modelos.splice(rng.int(0, modelos.length - 1), 1)[0], mod = MODELOS[id];
    const lo = Math.max(entrada + 3, i === 0 ? 8 : 50), hi = Math.min(saida - 2, i === 0 ? 44 : 88);
    decisoes.push({ min: rng.int(Math.min(lo, hi), Math.max(lo, hi)), titulo: mod.titulo, texto: mod.texto, opcoes: mod.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo })), modelo: id });
  }
  lances.sort((x, y) => x.min - y.min);
  const nomeC = base ? `${clubeDe(l, jogo.casa).nome} sub-17` : clubeDe(l, jogo.casa).nome, nomeF = base ? `${clubeDe(l, jogo.fora).nome} sub-17` : clubeDe(l, jogo.fora).nome;
  void adv;
  return { tipo: base ? "base" : "profissional", escalacao: esc, casa: jogo.casa, fora: jogo.fora, nomeCasa: nomeC, nomeFora: nomeF, souCasa: jogo.souCasa,
    entrada, saida, golsCasa: gc, golsFora: gf, lances, decisoes, base: { gols: d.gols, assist: d.assistencias, nota: d.nota }, fAdv: advF };
}

/** Chance de sucesso de uma opção, de 0 a 1 (mostrada como dica na tela). */
export function chanceOpcao(s: Save, p: Partida, i: number, opcaoId: string): number {
  const mod = MODELOS[p.decisoes[i].modelo], op = mod.opcoes.find((o) => o.id === opcaoId)!;
  const peso = Object.values(op.at).reduce((a, b) => a + b, 0);
  const hab = peso ? Object.entries(op.at).reduce((acc, [k, w]) => acc + s.jogador.at[k as Atributo] * w, 0) / peso : 60;
  const tr = Object.entries(op.tracos ?? {}).reduce((acc, [t, v]) => acc + (s.jogador.tracos.includes(t as TracoId) ? v : 0), 0);
  const dif = p.tipo === "base" ? p.fAdv + 2 : p.fAdv - 2;
  return clamp(0.5 + (hab + tr - dif) / 30 + op.ajuste, 0.08, 0.92);
}

/** Mesmo uma boa jogada nem sempre vira gol (e um erro nem sempre custa um gol). */
const CONVERSAO: Record<string, number> = {
  "caraACara.colocado": 0.6, "caraACara.forte": 0.5, "caraACara.driblar": 0.7, "caraACara.tocar": 0.6,
  "ponta.cruzar": 0.35, "ponta.cortar": 0.4, "meio.enfiar": 0.45, "meio.chute": 0.45, "meio.tabelar": 0.45,
  "escanteio.subir": 0.4, "escanteio.rebote": 0.35, "fundo.cruzar": 0.35, "fundo.rasteiro": 0.4, "fundo.chutar": 0.5, "antecipar.antecipar": 0.3,
  "contra.bote": 0.55, "contra.acompanhar": 0.45, "contra.falta": 0.6, "antecipar.recuar": 0.4,
};
export function resolverDecisao(s: Save, p: Partida, i: number, opcaoId: string): ResultadoDecisao {
  const modelo = p.decisoes[i].modelo, mod = MODELOS[modelo], op = mod.opcoes.find((o) => o.id === opcaoId)!;
  const rng = rngDe(s, "decisao", i, opcaoId);
  const ok = rng.chance(chanceOpcao(s, p, i, opcaoId)), conv = rng.chance(CONVERSAO[`${modelo}.${opcaoId}`] ?? 0.5);
  if (ok) {
    if (op.sucesso.golPro && !conv) return { sucesso: true, texto: op.sucesso.meu === "assist" ? "Jogada perfeita, mas o companheiro chutou em cima do goleiro." : "Foi quase! A bola passou raspando a trave.", golPro: false, golContra: false, nota: op.sucesso.nota / 2 };
    return { sucesso: true, texto: op.sucesso.texto, golPro: !!op.sucesso.golPro, golContra: false, meu: op.sucesso.meu, nota: op.sucesso.nota };
  }
  if (op.falha.golContra && !conv) return { sucesso: false, texto: "Ele passou e finalizou, mas o goleiro salvou.", golPro: false, golContra: false, nota: op.falha.nota / 2 };
  return { sucesso: false, texto: op.falha.texto, golPro: false, golContra: !!op.falha.golContra, nota: op.falha.nota };
}

// ------------------------------------------------------------------ fim da semana
export interface ResumoSemana {
  rotulo: string; escalacao: Escalacao; partida?: { nomeCasa: string; nomeFora: string; golsCasa: number; golsFora: number; nota: number; gols: number; assist: number; minutos: number; tipo: Partida["tipo"] };
  ovrAntes: number; ovrDepois: number; ganhos: [Atributo, number][]; moral: [number, number]; cansaco: [number, number]; fama: [number, number];
  dinheiro?: { salario: number; aluguel: number }; eventos: string[]; posicaoTabela: number; fimDeTemporada?: ResumoTemporada;
}

const POLEMICAS = [
  "Um vídeo seu dançando na balada às 3 da manhã rodou os grupos da torcida.",
  "Você respondeu um torcedor nas redes e virou assunto no programa de esporte.",
  "Uma foto sua na fila do show apareceu no perfil de fofoca na véspera do treino.",
];

export function concluirSemana(pacote: PacoteDados, s: Save, plano: Plano, partida: Partida | undefined, decisoes: ResultadoDecisao[]): ResumoSemana {
  const l = liga(pacote), c = s.carreira, j = s.jogador, rng = rngDe(s, "semana");
  const casa = efeitosDaCasa(s.casa).total;
  const rotulo = rotuloSemana(c);
  const ovrAntes = ovr(j), atAntes = { ...j.at }, moral0 = c.moral, cansaco0 = c.cansaco, fama0 = c.fama;
  const eventos: string[] = [];
  const cont = (a: Acao) => plano.acoes.filter((x) => x === a).length;

  // 1. a semana fora de campo
  const prev = previaPlano(s, plano);
  c.cansaco = prev.cansaco; c.moral = prev.moral;
  c.relTecnico = clamp(c.relTecnico + cont("video") + (cont("treino") >= 2 ? 1 : 0), 0, 100);
  if (cont("redes")) {
    const ganho = Math.round(c.seguidores * 0.01 * cont("redes") + 200 * cont("redes") * (1 + j.personalidade.carisma / 10));
    c.seguidores += ganho; c.fama = clamp(c.fama + 0.3 * cont("redes"), 0, 100); c.exposicao = clamp(c.exposicao + 2 * cont("redes"), 0, 100);
    eventos.push(`+${ganho.toLocaleString("pt-BR")} seguidores nas redes.`);
  }
  if (cont("amigos")) c.vidaNoturna = clamp(c.vidaNoturna + 2 * cont("amigos"), 0, 100);
  plano.acoes.forEach((a, dia) => {
    const risco = a === "amigos" ? (dia === 4 && partida ? 0.1 : 0.05) : a === "redes" ? 0.01 + j.personalidade.temperamento / 400 : 0;
    if (risco && rng.chance(risco)) {
      const t = rng.pick(POLEMICAS);
      c.moral = clamp(c.moral - 5, 0, 100); c.relTecnico = clamp(c.relTecnico - 4, 0, 100); c.fama = clamp(c.fama + 1, 0, 100);
      eventos.push(`Polêmica na ${DIAS[dia].toLowerCase()}: ${t}`);
      noticia(s, "polemica", "Polêmica", t);
    }
  });

  // 2. o jogo
  let participacao: Participacao = c.semana < SEMANAS_PRE ? "base" : "naoJogou";
  let resumoPartida: ResumoSemana["partida"];
  const jogo = jogoDaSemana(s);
  let placarMeuJogo: [number, number] | undefined;
  if (partida && jogo && partida.escalacao !== "lesionado" && partida.escalacao !== "fora") {
    let gc = partida.golsCasa, gf = partida.golsFora, gols = partida.base.gols, assist = partida.base.assist, nota = partida.base.nota;
    for (const d of decisoes) {
      if (d.golPro) { if (partida.souCasa) gc++; else gf++; }
      if (d.golContra) { if (partida.souCasa) gf++; else gc++; }
      if (d.meu === "gol") gols++; if (d.meu === "assist") assist++;
      nota += d.nota;
    }
    const minutos = Math.max(0, Math.min(90, partida.saida) - partida.entrada);
    if (minutos > 0) nota = Math.round(clamp(nota + prev.notaExtra, 3, 10) * 10) / 10; else nota = 0;
    if (partida.tipo === "profissional") placarMeuJogo = [gc, gf];
    resumoPartida = { nomeCasa: partida.nomeCasa, nomeFora: partida.nomeFora, golsCasa: gc, golsFora: gf, nota, gols, assist, minutos, tipo: partida.tipo };
    if (minutos > 0) {
      const pro = partida.tipo === "profissional";
      participacao = pro ? (partida.escalacao === "titular" ? "titular" : "entrou") : "base";
      if (pro) { c.stats.jogos++; if (partida.escalacao === "titular") c.stats.titular++; c.stats.gols += gols; c.stats.assist += assist; c.stats.notas.push(nota); }
      else { c.stats.base++; c.stats.baseGols += gols; }
      c.formaUlt = [...c.formaUlt.slice(-4), nota];
      c.moral = clamp(c.moral + 3 * (nota - 6.5), 0, 100);
      c.relTecnico = clamp(c.relTecnico + (nota - 6.5) * (pro ? 1 : 1.5), 0, 100);
      const grande = clubeDe(l, c.clubeId).forca >= 75 ? 1.5 : 1;
      c.fama = clamp(c.fama + (pro ? grande * (0.5 * gols + (nota >= 8 ? 0.3 : 0)) : 0.1 * gols + (nota >= 8 ? 0.1 : 0)), 0, 100);
      c.cansaco = clamp(c.cansaco + (30 * minutos) / 90, 0, 100);
      const l2 = sortearLesao(rng, c.cansaco, plano.intensidade === "alta", j.idade, 1 - (1 - casa.lesao / 100) * (pro ? 1 : 0.6));
      if (l2) { c.lesao = l2.semanas; eventos.push(`Lesão ${l2.tipo === "leve" ? "leve" : l2.tipo === "media" ? "muscular" : "grave"}: ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); noticia(s, "lesao", "Lesão", `${j.apelido} se machucou e fica ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); }
      const res = (partida.souCasa ? gc - gf : gf - gc) > 0 ? "vitória" : gc === gf ? "empate" : "derrota";
      noticia(s, "jogo", `${partida.nomeCasa} ${gc} × ${gf} ${partida.nomeFora}`,
        `${res[0].toUpperCase() + res.slice(1)}${pro ? "" : " na base"}. ${j.apelido} jogou ${minutos} minutos${gols ? `, fez ${gols} ${gols > 1 ? "gols" : "gol"}` : ""}${assist ? `, deu ${assist} ${assist > 1 ? "assistências" : "assistência"}` : ""} e tirou nota ${nota.toFixed(1)}.`);
    } else if (partida.escalacao === "banco") { c.moral = clamp(c.moral - 1, 0, 100); eventos.push("Ficou no banco o jogo todo."); }
  } else if (partida?.escalacao === "fora") { c.moral = clamp(c.moral - 3, 0, 100); eventos.push("Não foi relacionado para o jogo."); }

  // 3. a rodada da liga
  if (jogo) {
    for (const g of jogosDaRodada(c, jogo.rodada)) {
      const meu = g.casa === c.clubeId || g.fora === c.clubeId;
      const [a, b] = meu && placarMeuJogo ? placarMeuJogo : simularPlacar(rng, clubeDe(l, g.casa).forca, clubeDe(l, g.fora).forca);
      registrar(c.tabela.find((t) => t.clube === g.casa)!, a, b);
      registrar(c.tabela.find((t) => t.clube === g.fora)!, b, a);
    }
  }

  // 4. evolução e recuperação
  if (c.lesao > 0 && participacao !== "titular" && participacao !== "entrou") { participacao = "ferias"; }
  const evoluido = evoluirSemana(j.at, j.pot, { idade: j.idade, foco: plano.foco, intensidade: plano.intensidade, participacao, moral: c.moral, personalTrainer: false, profissionalismo: j.personalidade.profissionalismo });
  const mult = 1 + cont("treino") * 0.1 + casa.evolucao / 100 + c.bonusEvolucao;
  for (const k of ATRIBUTOS) j.at[k] = clamp(j.at[k] + (evoluido[k] - j.at[k]) * (evoluido[k] > j.at[k] ? mult : 1), 1, 99);
  if (c.lesao > 0) c.lesao--;
  c.cansaco = clamp(c.cansaco - 20 - casa.recuperacao, 0, 100);
  c.moral = clamp(c.moral + 0.18 * (60 + casa.moral - c.moral), 0, 100);
  c.fama = clamp(c.fama + casa.fama * 0.02, 0, 100);
  if (participacao !== "titular" && participacao !== "entrou") c.fama = clamp(c.fama * 0.995, 0, 100);
  c.seguidores = Math.max(c.seguidores, Math.round(seguidoresDaFama(c.fama) * 0.1 * (1 + c.exposicao / 50)));

  // 5. dinheiro no fim do mês
  let dinheiro: ResumoSemana["dinheiro"];
  if (c.semana % 4 === 3) {
    const liquido = salarioLiquido(c);
    const { aluguel } = fecharMes(s.casa, liquido);
    if (c.mesesPatrocinio > 0) c.mesesPatrocinio--; else c.patrocinioMensal = 0;
    dinheiro = { salario: Math.round(liquido), aluguel };
    noticia(s, "dinheiro", "Caiu o salário", `R$ ${Math.round(liquido).toLocaleString("pt-BR")} na conta${aluguel ? `, R$ ${aluguel.toLocaleString("pt-BR")} de aluguel` : ""}.`);
  }

  // 6. avança
  const ganhos = ATRIBUTOS.map((k) => [k, j.at[k] - atAntes[k]] as [Atributo, number]).sort((x, y) => y[1] - x[1]).slice(0, 3);
  c.semana++;
  let fim: ResumoTemporada | undefined;
  if (c.semana >= SEMANAS_TEMPORADA) fim = fimDeTemporada(pacote, s);
  return {
    rotulo, escalacao: partida?.escalacao ?? (c.semana - 1 < SEMANAS_PRE ? "semJogo" : "fora"), partida: resumoPartida,
    ovrAntes, ovrDepois: ovr(j), ganhos, moral: [moral0, c.moral], cansaco: [cansaco0, c.cansaco], fama: [fama0, c.fama], dinheiro, eventos,
    posicaoTabela: posicaoNaTabela(fim ? s.carreira.historico.at(-1)!.posicao : undefined, s), fimDeTemporada: fim,
  };
}

export function salarioLiquido(c: Carreira): number {
  const s = c.salario, ir = 0.275 * Math.max(0, s - 5000);
  return s - ir - AGENTES[c.agente].comissao * s + c.patrocinioMensal;
}
function posicaoNaTabela(fixa: number | undefined, s: Save): number {
  if (fixa) return fixa;
  return ordenar(s.carreira.tabela).findIndex((t) => t.clube === s.carreira.clubeId) + 1;
}

function fimDeTemporada(pacote: PacoteDados, s: Save): ResumoTemporada {
  const l = liga(pacote), c = s.carreira, j = s.jogador;
  const posicao = ordenar(c.tabela).findIndex((t) => t.clube === c.clubeId) + 1;
  const titulo = posicao === 1 && c.stats.jogos >= 10;
  const notas = c.stats.notas;
  const r: ResumoTemporada = { ano: ANO_INICIAL + c.temporada, idade: j.idade, clube: clubeDe(l, c.clubeId).nome, ovr: Math.round(ovr(j)), jogos: c.stats.jogos, gols: c.stats.gols, assist: c.stats.assist, nota: notas.length ? +(notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2) : 0, posicao, titulo, base: c.stats.base };
  c.historico.push(r);
  if (titulo) c.fama = clamp(c.fama + 5, 0, 100);
  noticia(s, "clube", `Fim da temporada ${r.ano}`, `${r.clube} terminou em ${posicao}º. ${j.apelido}: ${r.jogos} jogos no profissional, ${r.gols} gols, ${r.assist} assistências${r.base ? `, ${r.base} jogos na base` : ""}.`);
  // nova temporada
  j.idade++; c.temporada++; c.semana = 0; c.anosContrato--;
  c.tabela = novaTabela(l); c.stats = statsVazias();
  const clube = clubeDe(l, c.clubeId);
  if (c.formacao && j.idade >= 18) {
    c.formacao = false; c.anosContrato = 3;
    c.salario = Math.round(salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama }));
    noticia(s, "clube", "Primeiro contrato profissional", `${j.apelido} assina por 3 anos: R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  } else if (c.anosContrato <= 0) {
    c.anosContrato = 2;
    c.salario = Math.round(Math.max(c.formacao ? 3000 : 8000, salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama, formacao: c.formacao })));
    noticia(s, "clube", "Contrato renovado", `Mais 2 anos, R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  }
  return r;
}

// ------------------------------------------------------------------ política automática (para testes e balanceamento)
export function planoAutomatico(s: Save): Plano {
  const c = s.carreira, foco: Grupo = (["fisico", "tecnico", "tatico"] as Grupo[])[(c.semana + c.temporada) % 3];
  const acoes: Acao[] = c.cansaco > 40 ? ["descanso", "treino", "descanso", "familia", "video"] : ["treino", "familia", "treino", "video", "descanso"];
  return { foco, intensidade: c.cansaco > 60 ? "leve" : "normal", acoes };
}
/** Joga uma semana inteira sem interface, escolhendo a primeira opção de cada decisão. */
export function semanaAutomatica(pacote: PacoteDados, s: Save): ResumoSemana {
  const plano = planoAutomatico(s), p = prepararPartida(pacote, s, plano);
  const ds = (p?.decisoes ?? []).map((d, i) => {
    const melhor = d.opcoes.map((o) => ({ o, ch: chanceOpcao(s, p!, i, o.id) })).sort((a, b) => b.ch - a.ch)[0].o.id;
    return resolverDecisao(s, p!, i, melhor);
  });
  return concluirSemana(pacote, s, plano, p, ds);
}
