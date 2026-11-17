// O robô que joga carreiras longas: roda todas as carreiras de scripts/robo/casos.ts (modo jogador até a aposentadoria
// e modo técnico por 15 temporadas), duas de cada vez, e aponta onde os números saem do normal.
// Uso: npx tsx scripts/robo-carreiras.ts [temporadasJogador=24] [temporadasTecnico=15] [saida.json]
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { CASOS_JOGADOR, CASOS_TECNICO } from "./robo/casos.js";

const tJ = process.argv[2] ?? "24", tT = process.argv[3] ?? "15", saida = process.argv[4];
type R = Record<string, any>;
const tarefas = [...CASOS_JOGADOR.map((_, i) => ["jogador", i, tJ] as const), ...CASOS_TECNICO.map((_, i) => ["tecnico", i, tT] as const)];

function rodar([modo, i, t]: readonly [string, number, string]): Promise<R> {
  return new Promise((ok) => {
    const p = spawn("npx", ["tsx", new URL(`./robo/${modo}.ts`, import.meta.url).pathname, String(i), t], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    p.on("close", () => { const linha = out.trim().split("\n").at(-1) ?? ""; try { ok(JSON.parse(linha)); } catch { ok({ modo, caso: `${modo} ${i}`, temporadas: [], erros: [`o processo quebrou: ${err.slice(-600) || linha.slice(-300)}`] }); } });
  });
}
async function todas(): Promise<R[]> {
  const res: R[] = new Array(tarefas.length); let prox = 0;
  const trabalhador = async () => { while (prox < tarefas.length) { const k = prox++; res[k] = await rodar(tarefas[k]); process.stderr.write(`  ✓ ${res[k].caso} (${res[k].segundos ?? "?"}s)\n`); } };
  await Promise.all([trabalhador(), trabalhador()]);
  return res;
}

const fmt = (n: number) => { const a = Math.abs(n), s = n < 0 ? "-" : ""; return a >= 1e9 ? `${s}${(a / 1e9).toFixed(1)} bi` : a >= 1e6 ? `${s}${(a / 1e6).toFixed(1)} mi` : a >= 1e3 ? `${s}${(a / 1e3).toFixed(0)} mil` : `${s}${Math.round(a)}`; };

/** Regras de alerta do modo jogador. */
function alertasJogador(r: R): string[] {
  const a: string[] = [], ts: R[] = r.temporadas;
  if (!ts.length) return a;
  const ult = ts.at(-1)!;
  if (!r.aposentou && ts.length >= 22) a.push(`não se aposentou até os ${ult.idade} anos`);
  if (r.aposentou && r.aposentou < 32) a.push(`aposentou cedo, aos ${r.aposentou}`);
  const ovrMax = Math.max(...ts.map((t) => t.ovr));
  if (ovrMax > r.potencial + 6) a.push(`OVR chegou a ${ovrMax}, bem acima do potencial (${r.potencial})`);
  if (ovrMax < r.potencial - 8) a.push(`nunca chegou perto do potencial: máximo ${ovrMax} de ${r.potencial}`);
  for (let k = 1; k < ts.length; k++) {
    const x = ts[k - 1], y = ts[k];
    if (y.ovr - x.ovr >= 8) a.push(`OVR pulou ${x.ovr}→${y.ovr} numa temporada (${y.idade} anos)`);
    if (y.idade > 19 && x.salario > 0 && y.salario / x.salario >= 8 && y.salario > 200_000) a.push(`salário multiplicou por ${(y.salario / x.salario).toFixed(0)} numa temporada (${fmt(x.salario)}→${fmt(y.salario)}, ${y.idade} anos)`);
  }
  const negativos = ts.filter((t) => t.saldo < 0).length;
  if (negativos >= 3) a.push(`saldo negativo em ${negativos} temporadas (pior: ${fmt(Math.min(...ts.map((t) => t.saldo)))})`);
  const saldoMax = Math.max(...ts.map((t) => t.saldo));
  if (saldoMax > 2e9) a.push(`saldo passou de 2 bilhões (${fmt(saldoMax)})`);
  const patroDemais = ts.filter((t) => t.ovr < 82 && t.patroMes > Math.max(3 * t.salario, 1e6));
  if (patroDemais.length) a.push(`patrocínios valendo mais de 3× o salário sem ser craque em ${patroDemais.length} temporada(s) (ex.: OVR ${patroDemais[0].ovr}, ${fmt(patroDemais[0].patroMes)}/mês contra ${fmt(patroDemais[0].salario)} de salário)`);
  const famaDemais = ts.filter((t) => t.ovr < 78 && t.fama >= 90);
  if (famaDemais.length >= 2) a.push(`fama de superastro (90+) com OVR abaixo de 78 em ${famaDemais.length} temporadas`);
  const salMax = Math.max(...ts.map((t) => t.salario));
  if (salMax > 15e6) a.push(`salário mensal chegou a ${fmt(salMax)}`);
  if (Math.max(...ts.map((t) => t.seguidores)) > 700e6) a.push(`mais de 700 mi de seguidores`);
  const lesao = ts.filter((t) => t.semanasLesao >= 20);
  if (lesao.length) a.push(`${lesao.length} temporada(s) com 20+ semanas lesionado (${lesao.map((t) => `${t.idade}a: ${t.semanasLesao}`).join(", ")})`);
  const banco = ts.filter((t) => t.idade >= 21 && t.idade <= 31 && t.jogos < 8 && t.ovr >= 70);
  if (banco.length >= 2) a.push(`bom (OVR 70+) e quase sem jogar em ${banco.length} temporadas`);
  const moralBaixa = ts.filter((t) => t.moral <= 15).length;
  if (moralBaixa >= 3) a.push(`moral no chão em ${moralBaixa} temporadas`);
  const moralTeto = ts.filter((t) => t.moral >= 98).length;
  if (moralTeto >= Math.max(4, ts.length * 0.6)) a.push(`moral grudada no máximo em ${moralTeto} temporadas`);
  const cans = ts.filter((t) => t.cansaco >= 85).length;
  if (cans >= 3) a.push(`cansaço acima de 85 no fim de ${cans} temporadas`);
  if (ult.saveKB > 2500) a.push(`save com ${(ult.saveKB / 1024).toFixed(1)} MB (o navegador guarda uns 5 MB no total)`);
  const lento = ts.filter((t) => t.seg > 6);
  if (lento.length) a.push(`temporadas lentas para simular (até ${Math.max(...lento.map((t) => t.seg))} s)`);
  return a;
}
/** Regras de alerta do modo técnico. */
function alertasTecnico(r: R): string[] {
  const a: string[] = [], ts: R[] = r.temporadas;
  if (!ts.length) return a;
  const ult = ts.at(-1)!;
  const titulos = ts.filter((t) => t.campeao).length;
  if (titulos >= Math.max(6, ts.length * 0.6)) a.push(`campeão da liga em ${titulos} de ${ts.length} temporadas (fácil demais?)`);
  const seguidos = ts.reduce((m, t, k) => { const n = t.campeao ? (m.cur + 1) : 0; return { cur: n, max: Math.max(m.max, n) }; }, { cur: 0, max: 0 }).max;
  if (seguidos >= 5) a.push(`${seguidos} títulos da liga seguidos`);
  if (r.demissoes >= 4) a.push(`demitido ${r.demissoes} vezes`);
  if (ts.some((t) => t.saldo > 3e9)) a.push(`caixa do clube passou de 3 bilhões (${fmt(Math.max(...ts.map((t) => t.saldo)))})`);
  const vermelho = ts.filter((t) => t.saldo < 0).length;
  if (vermelho >= 3) a.push(`caixa negativo no fim de ${vermelho} temporadas (pior: ${fmt(r.saldoMin)})`);
  for (let k = 1; k < ts.length; k++) {
    const x = ts[k - 1], y = ts[k];
    if (x.clube === y.clube && x.saldo > 5e6 && y.saldo / x.saldo > 4) a.push(`caixa multiplicou por ${(y.saldo / x.saldo).toFixed(1)} numa temporada (${fmt(x.saldo)}→${fmt(y.saldo)})`);
  }
  const sobra = ts.filter((t) => t.receitasAno > t.despesasAno * 1.8);
  if (sobra.length >= 3) a.push(`receita quase o dobro da despesa em ${sobra.length} temporadas (dinheiro sobrando)`);
  const curtos = ts.filter((t) => t.elenco < 18);
  if (curtos.length) a.push(`elenco com menos de 18 jogadores em ${curtos.length} temporada(s) (mínimo ${Math.min(...curtos.map((t) => t.elenco))})`);
  const inchados = ts.filter((t) => t.elenco > 40);
  if (inchados.length) a.push(`elenco com mais de 40 jogadores (máx ${Math.max(...inchados.map((t) => t.elenco))})`);
  if (ts[0].ovrTop11 - Math.min(...ts.map((t) => t.ovrTop11)) > 8) a.push(`o time desmanchou: top 11 de ${ts[0].ovrTop11} caiu para ${Math.min(...ts.map((t) => t.ovrTop11))}`);
  if (Math.max(...ts.map((t) => t.ovrTop11)) - ts[0].ovrTop11 > 10) a.push(`o time ficou forte demais: top 11 de ${ts[0].ovrTop11} para ${Math.max(...ts.map((t) => t.ovrTop11))}`);
  const idade = ts.map((t) => t.idadeMedia);
  if (Math.max(...idade) > 30.5) a.push(`elenco envelheceu: idade média chegou a ${Math.max(...idade)}`);
  if (Math.min(...idade) < 22) a.push(`elenco jovem demais: idade média ${Math.min(...idade)}`);
  if (ts.filter((t) => t.reputacao >= 100).length >= ts.length - 2 && ts.length > 4) a.push(`reputação do técnico no máximo (100) quase a carreira toda`);
  if (ts.filter((t) => t.confianca >= 99).length >= ts.length * 0.7 && ts.length > 4) a.push(`confiança da diretoria grudada no máximo`);
  if (ts.some((t) => t.folhaMes > t.tetoFolha * 1.3)) a.push(`folha passou 30% do teto (${fmt(Math.max(...ts.map((t) => t.folhaMes)))} com teto ${fmt(ult.tetoFolha)})`);
  if (ult.saveKB > 2500) a.push(`save com ${(ult.saveKB / 1024).toFixed(1)} MB (o navegador guarda uns 5 MB no total)`);
  const lento = ts.filter((t) => t.seg > 8);
  if (lento.length) a.push(`temporadas lentas para simular (até ${Math.max(...lento.map((t) => t.seg))} s)`);
  return a;
}
/** O mundo: ligas que ficaram fortes/fracas demais ou envelheceram. */
function alertasMundo(r: R): string[] {
  const a: string[] = [];
  for (const [id, f] of Object.entries<R>(r.mundoFim ?? {})) {
    const i = r.mundoInicio?.[id]; if (!i) continue;
    if (Math.abs(f.media - i.media) > 3) a.push(`${id}: força média foi de ${i.media} para ${f.media}`);
    if (f.max - f.min < 5) a.push(`${id}: clubes ficaram todos parecidos (força de ${f.min.toFixed(0)} a ${f.max.toFixed(0)})`);
    if (f.max - f.min > (i.max - i.min) + 8) a.push(`${id}: abismo entre clubes cresceu (${f.min.toFixed(0)} a ${f.max.toFixed(0)})`);
    if (Math.abs(f.idade - i.idade) > 2.5) a.push(`${id}: idade média dos elencos foi de ${i.idade} para ${f.idade}`);
  }
  return a;
}

const t0 = Date.now();
process.stderr.write(`Robô jogando ${tarefas.length} carreiras...\n`);
const res = await todas();
const linhas: string[] = [];
let total = 0;
for (const r of res) {
  const al = [...(r.erros ?? []).map((e: string) => `ERRO: ${e}`), ...(r.modo === "tecnico" ? alertasTecnico(r) : alertasJogador(r)), ...alertasMundo(r).map((x) => `mundo · ${x}`)];
  total += al.length;
  const ts: R[] = r.temporadas ?? [], ult = ts.at(-1);
  linhas.push(`\n■ ${r.modo === "tecnico" ? "TÉCNICO" : "JOGADOR"} · ${r.caso} (${r.descricao ?? ""}) · ${ts.length} temporadas · ${r.segundos ?? "?"}s`);
  if (r.modo === "jogador" && ult) {
    linhas.push(`  potencial ${r.potencial} · começou no ${r.primeiroClube} · ${r.aposentou ? `aposentou aos ${r.aposentou}` : `ainda jogando aos ${ult.idade}`}`);
    for (const t of ts) linhas.push(`  ${String(t.idade).padStart(2)}a OVR ${t.ovr} ${t.clube} [${t.liga}] ${t.jogos}j ${t.gols}g nota ${t.nota} ${t.titulo ? "🏆" : ""} | sal ${fmt(t.salario)} patro ${fmt(t.patroMes ?? 0)} saldo ${fmt(t.saldo)} fama ${t.fama} seg ${fmt(t.seguidores)} moral ${t.moral} lesão ${t.semanasLesao}sem | ${t.saveKB} KB`);
  }
  if (r.modo === "tecnico" && ult) {
    linhas.push(`  passagens: ${r.passagens.map((p: R) => `${p.clube} (${p.liga}, desde T${p.desde}${p.saiu ? `, ${p.saiu}` : ""})`).join(" → ")}`);
    linhas.push(`  demissões ${r.demissoes} · vendas ${r.vendas} · contratações ${r.contratacoes} · renovações ${r.renovacoes} · shows ${r.shows}`);
    for (const t of ts) linhas.push(`  T${String(t.t).padStart(2)} ${t.clube} [${t.liga}] ${t.pos}º (esp ${t.esperado}) ${t.pts}pts ${t.campeao ? "🏆" : ""} conf ${t.confiancaIni}→${t.confianca} rep ${t.reputacao} | caixa ${fmt(t.saldo)} dív ${fmt(t.divida)} rec ${fmt(t.receitasAno)} desp ${fmt(t.despesasAno)} folha ${fmt(t.folhaMes)}/${fmt(t.tetoFolha)} | elenco ${t.elenco} top11 ${t.ovrTop11} idade ${t.idadeMedia} | ${t.saveKB} KB`);
  }
  linhas.push(al.length ? al.map((x) => `  ⚠ ${x}`).join("\n") : "  ✓ nada fora do normal");
}
linhas.push(`\n${total} alerta(s) em ${res.length} carreiras · ${Math.round((Date.now() - t0) / 1000)}s`);
console.log(linhas.join("\n"));
if (saida) writeFileSync(saida, JSON.stringify(res, null, 1));
