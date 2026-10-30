// Negócios e investimentos fora de campo: empresas próprias (restaurante, escolinha, marca...), aplicações (renda fixa,
// ações, cripto) e as propostas que chegam pelo celular, algumas delas golpes. O mês fecha junto com o salário.
import { RNG, clamp } from "./rng.js";
import { bonusVitrine, type DesignMarca } from "./marca-propria.js";
import { valorBrl, curtoBrl } from "./moeda.js";

export type TipoEmpresa = "escolinha" | "barbearia" | "restaurante" | "academia" | "imoveis" | "marca" | "app" | "perfumaria" | "energetico" | "padaria";
export interface InfoEmpresa {
  id: TipoEmpresa; nome: string; desc: string; custo: number; famaMin: number;
  /** lucro mensal sobre o valor da empresa quando ela vai bem (saúde 70) */
  retorno: number;
  /** quanto a saúde da empresa balança por mês */
  risco: number;
  /** a fama do dono puxa o movimento (restaurante, marca) */
  famaPuxa?: boolean;
  /** efeito semanal na vida do jogador enquanto ele tem a empresa */
  bonus?: { moral?: number; torcida?: number; fama?: number };
  nomes: string[];
}
export const EMPRESAS: Record<TipoEmpresa, InfoEmpresa> = {
  perfumaria: { id: "perfumaria", nome: "Perfumaria e cosméticos", desc: "Linha de beleza com o seu nome na tampa. Vende bem quando a fama está alta.", custo: 600_000, famaMin: 45, retorno: 0.012, risco: 8, famaPuxa: true, nomes: ["{apelido} Perfumes", "Essência {apelido}", "Cosméticos {numero}"] },
  energetico: { id: "energetico", nome: "Bebida energética", desc: "Lata com a sua cara na geladeira do posto. Dá muito dinheiro e muito trabalho de estoque.", custo: 1_200_000, famaMin: 50, retorno: 0.014, risco: 11, famaPuxa: true, nomes: ["{apelido} Energy", "Pico {numero}", "Turbo {apelido}"] },
  padaria: { id: "padaria", nome: "Padaria de bairro", desc: "Pão quentinho de manhã e a vizinhança toda na fila. Negócio de bairro, lucro pequeno e firme.", custo: 220_000, famaMin: 20, retorno: 0.009, risco: 5, nomes: ["Padaria do {apelido}", "Café {apelido}", "Pão do {numero}"] },
  escolinha: { id: "escolinha", nome: "Escolinha de futebol", desc: "Pouco lucro, muito carinho: a molecada do bairro com a sua camisa.", custo: 250_000, famaMin: 10, retorno: 0.006, risco: 4, bonus: { moral: 0.3, torcida: 0.05 }, nomes: ["Escolinha {apelido}", "Instituto {apelido}", "Projeto Craque {apelido}"] },
  barbearia: { id: "barbearia", nome: "Barbearia", desc: "Negócio pequeno e estável. Os companheiros cortam lá de graça.", custo: 180_000, famaMin: 15, retorno: 0.01, risco: 6, nomes: ["Barbearia do {apelido}", "{apelido} Barber Club", "Navalha {numero}"] },
  restaurante: { id: "restaurante", nome: "Restaurante", desc: "Dá dinheiro quando a fama ajuda e o dono aparece. Fecha rápido quando ninguém cuida.", custo: 700_000, famaMin: 30, retorno: 0.011, risco: 9, famaPuxa: true, bonus: { fama: 0.02 }, nomes: ["Cantina {apelido}", "{apelido} Grill", "Boteco da Camisa {numero}"] },
  academia: { id: "academia", nome: "Rede de academias", desc: "Cresce devagar. Combina com quem cuida do corpo.", custo: 900_000, famaMin: 35, retorno: 0.009, risco: 6, nomes: ["{apelido} Fit", "Academia Camisa {numero}", "Arena {apelido}"] },
  imoveis: { id: "imoveis", nome: "Imóveis para alugar", desc: "O mais seguro: aluguel todo mês, quase sem susto.", custo: 2_000_000, famaMin: 0, retorno: 0.0045, risco: 2, nomes: ["Apartamentos na praia", "Salas comerciais no centro", "Prédio de kitnets"] },
  marca: { id: "marca", nome: "Marca de roupas", desc: "Vive dos seus seguidores. Pode estourar, pode encalhar.", custo: 1_500_000, famaMin: 55, retorno: 0.017, risco: 12, famaPuxa: true, bonus: { fama: 0.04 }, nomes: ["{apelido} Wear", "Coleção {numero}", "{apelido} Original"] },
  app: { id: "app", nome: "Startup de tecnologia", desc: "Quase nunca dá lucro. Às vezes vale dez vezes mais. Às vezes, nada.", custo: 1_000_000, famaMin: 40, retorno: 0, risco: 10, nomes: ["App de pelada {apelido}", "Scout.ai", "Chuteira Digital"] },
};
export interface Empresa { uid: string; tipo: TipoEmpresa; nome: string; valor: number; investido: number; saude: number; desde: number; /** unidades abertas por franquia (além da primeira) */ unidades?: number; /** decisão do mês, aplicada quando o mês fecha */ decisao?: DecisaoMes; /** a marca de roupas do jogador: logo, nome e peças da coleção */ marca?: DesignMarca; lucroUlt?: number; cuidado?: number; acao?: number }
export type TipoInvest = "rendaFixa" | "acoes" | "cripto";
export const INVEST: Record<TipoInvest, { nome: string; desc: string }> = {
  rendaFixa: { nome: "Renda fixa", desc: "Rende pouco e sempre." },
  acoes: { nome: "Ações", desc: "Sobe e desce. No longo prazo, costuma subir." },
  cripto: { nome: "Cripto", desc: "Montanha-russa. Pode dobrar, pode derreter." },
};
/** Proposta que chega pelo celular: abrir uma empresa (às vezes com sócio, mais barato), ou um "investimento" que é golpe. */
export interface PropostaNegocio { de: string; titulo: string; texto: string; valor: number; promessa: string; tipo?: TipoEmpresa; golpe?: boolean; expira: number }
export interface Golpe { nome: string; valor: number; revela: number; mostrado: number }
export interface EstadoNegocios {
  empresas: Empresa[]; invest: Record<TipoInvest, number>; proposta?: PropostaNegocio; golpes: Golpe[];
  /** assessor financeiro contratado (desconfia de golpes, cuida um pouco das empresas) */
  assessor?: boolean;
  /** histórico do mês: lucro das empresas e dos investimentos */
  mes?: { empresas: number; invest: number; custo: number };
  uid: number;
}
export const novoNegocios = (): EstadoNegocios => ({ empresas: [], invest: { rendaFixa: 0, acoes: 0, cripto: 0 }, golpes: [], uid: 0 });
export const CUSTO_ASSESSOR = 15_000;

export function patrimonioInvestido(n: EstadoNegocios): number {
  return n.empresas.reduce((a, e) => a + e.valor, 0) + n.invest.rendaFixa + n.invest.acoes + n.invest.cripto + n.golpes.reduce((a, g) => a + g.mostrado, 0);
}
const nomeDaEmpresa = (rng: RNG, info: InfoEmpresa, apelido: string, numero: string) => rng.pick(info.nomes).replaceAll("{apelido}", apelido).replaceAll("{numero}", numero);

export interface CtxNegocios { ano: number; semanaAbs: number; fama: number; seguidores: number; saldo: number; apelido: string; numero: string }
export interface ResultadoNeg { ok: boolean; msg: string; custo?: number; ganho?: number; cansaco?: number; engajamento?: number }

export function abrirEmpresa(n: EstadoNegocios, tipo: TipoEmpresa, ctx: CtxNegocios, rng: RNG, preco?: number): ResultadoNeg {
  const info = EMPRESAS[tipo], custo = preco ?? info.custo;
  if (ctx.fama < info.famaMin) return { ok: false, msg: `Ainda falta nome para isso: precisa de fama ${info.famaMin}.` };
  if (ctx.saldo < custo) return { ok: false, msg: "Não tem dinheiro em conta para isso." };
  const nome = nomeDaEmpresa(rng, info, ctx.apelido, ctx.numero);
  n.empresas.push({ uid: `e${++n.uid}`, tipo, nome, valor: custo, investido: custo, saude: 55 + rng.int(0, 10), desde: ctx.ano });
  return { ok: true, msg: `${nome} abriu as portas!`, custo };
}
/** Decisões do mês de gestão: cada uma mexe no lucro, na saúde e no custo do negócio. */
export type DecisaoMes = "preco" | "marketing" | "equipe";
export const DECISOES: Record<DecisaoMes, { nome: string; desc: string; lucro: number; custo: number; saude: number }> = {
  preco: { nome: "Subir o preço", desc: "Mais lucro por venda; a saúde sente um pouco.", lucro: 1.25, custo: 0, saude: -3 },
  marketing: { nome: "Campanha nas redes", desc: "Custa 2% do valor da empresa, mas a fila volta.", lucro: 1, custo: 0.02, saude: 6 },
  equipe: { nome: "Treinar a equipe", desc: "Custa 1,5% do valor; o atendimento melhora e o lucro cresce um pouco.", lucro: 1.1, custo: 0.015, saude: 3 },
};
/** Franquia: só negócios de bairro e de consumo abrem unidades. */
export const FRANQUIAVEIS: TipoEmpresa[] = ["barbearia", "padaria", "perfumaria"];
export const MAX_UNIDADES = 4;
export type AcaoEmpresa = "cuidar" | "divulgar" | "investir" | "vender";
/** Grava a marca (nome, logo e peças) numa empresa de roupas do jogador. */
export function salvarMarca(n: EstadoNegocios, uid: string, marca: DesignMarca): ResultadoNeg {
  const e = n.empresas.find((x) => x.uid === uid && x.tipo === "marca");
  if (!e) return { ok: false, msg: "Essa marca não existe mais." };
  e.marca = marca; e.nome = marca.nome;
  return { ok: true, msg: `Coleção de ${marca.nome} pronta: ${marca.pecas.length} peça(s) à venda.` };
}
/** Escolhe a decisão do mês para um negócio (vale no fim do mês). */
export function decidirMes(n: EstadoNegocios, uid: string, op: DecisaoMes): ResultadoNeg {
  const e = n.empresas.find((x) => x.uid === uid);
  if (!e) return { ok: false, msg: "Essa empresa não existe mais." };
  e.decisao = op;
  return { ok: true, msg: `${DECISOES[op].nome} em ${e.nome}: vale no fim do mês.` };
}
/** Abre uma unidade por franquia: cada uma aumenta o lucro do negócio (até o máximo). */
export function abrirUnidade(n: EstadoNegocios, uid: string, ctx: CtxNegocios): ResultadoNeg {
  const e = n.empresas.find((x) => x.uid === uid);
  if (!e || !FRANQUIAVEIS.includes(e.tipo)) return { ok: false, msg: "Esse negócio não abre franquia." };
  const feitas = e.unidades ?? 0;
  if (feitas >= MAX_UNIDADES - 1) return { ok: false, msg: "Já são unidades demais para uma pessoa só cuidar." };
  if (e.saude < 60) return { ok: false, msg: "Antes de abrir outra unidade, a saúde do negócio precisa estar acima de 60." };
  const custo = Math.round(EMPRESAS[e.tipo].custo * 0.5 * (1 + feitas * 0.5));
  if (ctx.saldo < custo) return { ok: false, msg: "Não tem dinheiro em conta para isso." };
  e.unidades = feitas + 1; e.valor += custo * 0.5; e.investido += custo;
  return { ok: true, msg: `Unidade nova de ${e.nome} aberta: agora são ${e.unidades + 1}.`, custo };
}
export function agirEmpresa(n: EstadoNegocios, uid: string, acao: AcaoEmpresa, ctx: CtxNegocios): ResultadoNeg {
  const e = n.empresas.find((x) => x.uid === uid);
  if (!e) return { ok: false, msg: "Essa empresa não existe mais." };
  const info = EMPRESAS[e.tipo];
  if (acao === "vender") {
    const v = Math.round(e.valor * (0.6 + e.saude / 250));
    n.empresas = n.empresas.filter((x) => x !== e);
    return { ok: true, msg: `Vendeu ${e.nome} por ${valorBrl(v)}.`, ganho: v };
  }
  if (e.acao === ctx.semanaAbs) return { ok: false, msg: "Já mexeu nessa empresa nesta semana." };
  if (acao === "investir") {
    const v = Math.round(info.custo * 0.25);
    if (ctx.saldo < v) return { ok: false, msg: "Não tem dinheiro em conta para isso." };
    e.valor += v; e.investido += v; e.saude = clamp(e.saude + 4, 0, 100); e.acao = ctx.semanaAbs;
    return { ok: true, msg: `Mais ${valorBrl(v)} em ${e.nome}: reforma e gente nova.`, custo: v };
  }
  e.acao = ctx.semanaAbs;
  if (acao === "cuidar") { e.cuidado = ctx.semanaAbs; e.saude = clamp(e.saude + 5, 0, 100); return { ok: true, msg: `Você passou a tarde em ${e.nome}: conferiu as contas, conversou com a equipe.`, cansaco: 4 }; }
  const ganho = 3 + ctx.fama / 20 * (info.famaPuxa ? 1.5 : 1);
  e.saude = clamp(e.saude + ganho, 0, 100);
  return { ok: true, msg: `Post sobre ${e.nome}: ${ganho >= 6 ? "fila na porta no fim de semana" : "algum movimento a mais"}.`, engajamento: 2 };
}
export function aplicar(n: EstadoNegocios, tipo: TipoInvest, valor: number, saldo: number): ResultadoNeg {
  if (valor > 0 && saldo < valor) return { ok: false, msg: "Não tem esse dinheiro em conta." };
  if (valor < 0 && n.invest[tipo] <= 0) return { ok: false, msg: "Não tem nada aplicado aí." };
  const v = valor < 0 ? -Math.min(n.invest[tipo], -valor) : valor;
  n.invest[tipo] += v;
  return v > 0 ? { ok: true, msg: `Aplicou ${valorBrl(v)} em ${INVEST[tipo].nome.toLowerCase()}.`, custo: v } : { ok: true, msg: `Resgatou ${valorBrl((-v))} de ${INVEST[tipo].nome.toLowerCase()}.`, ganho: -v };
}

// ------------------------------------------------------------------ propostas e golpes
const AMIGOS = ["um primo de segundo grau", "o empresário de um ex-companheiro", "um amigo da época da base", "o cunhado do seu agente", "um ex-jogador famoso", "um investidor que você conheceu numa festa"];
const GOLPES = [
  { titulo: "Pirâmide de cripto", texto: "Uma moeda nova \"que só os grandes conhecem\". Ele mostra prints de gente ganhando muito.", promessa: "rende 12% ao mês, garantido" },
  { titulo: "Gado de investimento", texto: "Você compra bois numa fazenda de Mato Grosso e recebe todo mês pela engorda. Ninguém nunca viu a fazenda.", promessa: "8% ao mês, sem risco" },
  { titulo: "Hotel em Dubai", texto: "Cotas de um hotel de luxo na planta. O folder é lindo, o CNPJ é de ontem.", promessa: "dobra o dinheiro em um ano" },
  { titulo: "Loteamento na praia", texto: "Terrenos a preço de banana num condomínio que vai ser o novo point. A licença ambiental \"sai semana que vem\".", promessa: "vale três vezes mais em dois anos" },
  { titulo: "Robô de apostas", texto: "Um algoritmo que \"nunca perde\" nas casas de aposta. Precisa de um aporte grande para rodar.", promessa: "15% ao mês, saque quando quiser" },
];
/** Uma proposta por vez, de tempos em tempos: abrir uma empresa (às vezes como sócio, com desconto) ou um golpe bem contado. */
export function sortearProposta(n: EstadoNegocios, rng: RNG, ctx: CtxNegocios): PropostaNegocio | undefined {
  if (n.proposta || ctx.fama < 12 || ctx.saldo < 150_000) return;
  if (!rng.chance(0.06 + ctx.fama / 1000)) return;
  const de = rng.pick(AMIGOS);
  if (rng.chance(0.3)) {
    const g = rng.pick(GOLPES), valor = Math.round(Math.min(ctx.saldo * rng.range(0.25, 0.6), 8_000_000) / 10_000) * 10_000;
    return { de, titulo: g.titulo, texto: g.texto, promessa: g.promessa, valor, golpe: true, expira: ctx.semanaAbs + 3 };
  }
  const tipos = (Object.keys(EMPRESAS) as TipoEmpresa[]).filter((t) => EMPRESAS[t].famaMin <= ctx.fama && EMPRESAS[t].custo * 0.7 <= ctx.saldo && !n.empresas.some((e) => e.tipo === t));
  if (!tipos.length) return;
  const t = rng.pick(tipos), info = EMPRESAS[t], valor = Math.round(info.custo * rng.range(0.7, 0.95) / 10_000) * 10_000;
  return { de, tipo: t, titulo: `Sociedade: ${info.nome.toLowerCase()}`, texto: `${info.desc} Ele entra com o ponto e a gestão; você, com o dinheiro e o nome.`, promessa: `retorno de uns ${(info.retorno * 100).toFixed(1).replace(".", ",")}% ao mês se der certo`, valor, expira: ctx.semanaAbs + 3 };
}
export function responderProposta(n: EstadoNegocios, aceitar: boolean, ctx: CtxNegocios, rng: RNG): ResultadoNeg {
  const p = n.proposta;
  if (!p) return { ok: false, msg: "A proposta não está mais de pé." };
  n.proposta = undefined;
  if (!aceitar) return { ok: true, msg: p.golpe ? "Você recusou. Meses depois, o assunto apareceu no jornal." : "Você agradeceu e recusou." };
  if (ctx.saldo < p.valor) { n.proposta = p; return { ok: false, msg: "Não tem esse dinheiro em conta." }; }
  if (p.golpe) { n.golpes.push({ nome: p.titulo, valor: p.valor, mostrado: p.valor, revela: ctx.semanaAbs + rng.int(8, 22) }); return { ok: true, msg: `Dinheiro transferido para "${p.titulo}". O primeiro extrato já veio no positivo.`, custo: p.valor }; }
  return abrirEmpresa(n, p.tipo!, ctx, rng, p.valor);
}

// ------------------------------------------------------------------ o mês
export interface MesNegocios { lucro: number; invest: number; avisos: string[]; noticias: { titulo: string; texto: string; polemica?: boolean }[]; moral: number; fama: number; torcida: number }
export function mesNegocios(n: EstadoNegocios, rng: RNG, ctx: CtxNegocios): MesNegocios {
  const r: MesNegocios = { lucro: 0, invest: 0, avisos: [], noticias: [], moral: 0, fama: 0, torcida: 0 };
  for (const e of [...n.empresas]) {
    const info = EMPRESAS[e.tipo];
    // a saúde balança: sorte, cuidado do dono, assessor, fama (restaurante e marca)
    const cuidou = e.cuidado !== undefined && ctx.semanaAbs - e.cuidado <= 6;
    e.saude = clamp(e.saude + rng.normal(0, info.risco) * 0.6 + (cuidou ? 1.5 : -1.5) + (n.assessor ? 1 : 0) + (info.famaPuxa ? (ctx.fama - 50) / 25 : 0), 0, 100);
    if (e.tipo === "app") {
      if (rng.chance(0.025)) { e.valor *= rng.range(4, 10); e.saude = 85; r.avisos.push(`${e.nome} recebeu um aporte milionário: a startup agora vale ${valorBrl(Math.round(e.valor))}!`); r.noticias.push({ titulo: `A startup de ${ctx.apelido} vale milhões`, texto: `${e.nome} recebeu investimento de um fundo estrangeiro.` }); }
      else if (rng.chance(0.03) || e.saude < 12) { r.avisos.push(`${e.nome} fechou. O dinheiro investido virou pó.`); r.noticias.push({ titulo: `Startup de ${ctx.apelido} fecha as portas`, texto: `${e.nome} não conseguiu novo investimento.` }); n.empresas = n.empresas.filter((x) => x !== e); r.moral -= 3; continue; }
      e.lucroUlt = 0; continue;
    }
    const dec = e.decisao ? DECISOES[e.decisao] : undefined; e.decisao = undefined;
    if (dec) e.saude = clamp(e.saude + dec.saude, 0, 100);
    const segs = info.id === "marca" ? clamp(Math.log10(Math.max(1e4, ctx.seguidores)) / 6.5, 0.5, 1.5) : 1;
    const unidades = 1 + (e.unidades ?? 0);
    const lucro = Math.round(e.valor * info.retorno * segs * (e.saude - 35) / 35 * bonusVitrine(e.marca) * (dec?.lucro ?? 1) * unidades) - (dec ? Math.round(e.valor * dec.custo) : 0);
    e.lucroUlt = lucro; r.lucro += lucro;
    e.valor = Math.max(info.custo * 0.2, e.valor * (1 + (e.saude - 50) / 2500));
    // acontecimentos do mês
    if (rng.chance(0.05)) {
      if (rng.chance(0.55)) { e.saude = clamp(e.saude + 15, 0, 100); r.avisos.push(`${e.nome} apareceu num programa de TV. Movimento lá em cima.`); }
      else if (rng.chance(0.5)) { const m = Math.round(info.custo * 0.04); r.lucro -= m; e.saude = clamp(e.saude - 8, 0, 100); r.avisos.push(`Fiscalização em ${e.nome}: multa de ${valorBrl(m)}.`); }
      else { e.valor *= 0.75; e.saude = clamp(e.saude - 10, 0, 100); r.avisos.push(`O gerente de ${e.nome} desviou dinheiro. A empresa perdeu um quarto do valor.`); r.noticias.push({ titulo: `Desfalque em empresa de ${ctx.apelido}`, texto: `O gerente de ${e.nome} sumiu com parte do caixa.`, polemica: true }); }
    }
    if (e.saude < 12) {
      const v = Math.round(e.valor * 0.2);
      r.lucro += v; r.moral -= 4; n.empresas = n.empresas.filter((x) => x !== e);
      r.avisos.push(`${e.nome} faliu. Sobraram ${valorBrl(v)} na venda dos móveis.`);
      r.noticias.push({ titulo: `${e.nome} fecha as portas`, texto: `O negócio de ${ctx.apelido} não resistiu.`, polemica: true });
      continue;
    }
    if (info.bonus) { r.moral += (info.bonus.moral ?? 0) * 4; r.torcida += (info.bonus.torcida ?? 0) * 4; r.fama += (info.bonus.fama ?? 0) * 4; }
  }
  // investimentos
  const antes = n.invest.rendaFixa + n.invest.acoes + n.invest.cripto;
  n.invest.rendaFixa *= 1.008;
  n.invest.acoes *= Math.max(0.6, 1 + rng.normal(0.009, 0.05));
  if (n.invest.cripto) {
    if (rng.chance(0.025)) { n.invest.cripto *= 0.35; r.avisos.push("A cripto derreteu: −65% em uma semana."); }
    else n.invest.cripto *= Math.max(0.4, 1 + rng.normal(0.015, 0.18));
  }
  for (const k of ["rendaFixa", "acoes", "cripto"] as TipoInvest[]) n.invest[k] = Math.round(n.invest[k]);
  r.invest = n.invest.rendaFixa + n.invest.acoes + n.invest.cripto - antes;
  // golpes: o extrato sobe até o dia em que some tudo
  for (const g of [...n.golpes]) {
    if (ctx.semanaAbs >= g.revela) {
      n.golpes = n.golpes.filter((x) => x !== g); r.moral -= 10;
      r.avisos.push(`"${g.nome}" era golpe. Os ${valorBrl(g.valor)} sumiram.`);
      r.noticias.push({ titulo: `${ctx.apelido} cai em golpe de ${curtoBrl(g.valor)}`, texto: `O jogador investiu em "${g.nome}". A polícia investiga o esquema, que fez outras vítimas no futebol.`, polemica: true });
    } else g.mostrado = Math.round(g.mostrado * 1.08);
  }
  if (n.assessor) r.lucro -= CUSTO_ASSESSOR;
  n.mes = { empresas: r.lucro, invest: r.invest, custo: n.assessor ? CUSTO_ASSESSOR : 0 };
  return r;
}
