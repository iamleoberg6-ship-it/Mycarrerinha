// Vida social fora de campo: os parças (o entourage), a família que envelhece, os filhos que crescem, os convites de
// celebridade, as encrencas (trânsito, justiça, Receita) e a escolha das férias. Quase tudo vira um momento na agenda
// (src/agenda.ts), com escolha; o resto (sobrinho que nasce, crise de um parça fofoqueiro) acontece sozinho.
import { RNG, clamp } from "./rng.js";
import { gerarNome } from "./nomes.js";
import { agendar, type EstadoAgenda, type OpcaoOcasiao, type EfeitoVida, type Ocasiao } from "./agenda.js";
import type { Familiar } from "./familia.js";
import type { Filho } from "./namoro.js";
import { valorBrl, curtoBrl } from "./moeda.js";

const op = (id: string, rotulo: string, texto: string, ef: EfeitoVida, risco?: OpcaoOcasiao["risco"]): OpcaoOcasiao => ({ id, rotulo, texto, ef, ...(risco ? { risco } : {}) });
const reais = (v: number) => `${valorBrl(Math.round(v))}`;
const primeiro = (n: string) => n.split(" ")[0];

// ------------------------------------------------------------------ parças
export type PerfilParca = "leal" | "festeiro" | "interesseiro" | "fofoqueiro" | "trabalhador";
export const NOME_PERFIL: Record<PerfilParca, string> = { leal: "Leal", festeiro: "Festeiro", interesseiro: "Interesseiro", fofoqueiro: "Boca solta", trabalhador: "Trabalhador" };
export type FuncaoParca = "motorista" | "seguranca" | "faztudo" | "midia";
export const FUNCOES: Record<FuncaoParca, { nome: string; custo: number; desc: string }> = {
  motorista: { nome: "Motorista", custo: 8_000, desc: "Menos cansaço e nada de multa ou blitz." },
  seguranca: { nome: "Segurança", custo: 15_000, desc: "Evita furto e confusão na rua." },
  faztudo: { nome: "Faz-tudo", custo: 6_000, desc: "Resolve a vida: a moral agradece." },
  midia: { nome: "Cuida das redes", custo: 10_000, desc: "Posta por você: engajamento sobe toda semana." },
};
export interface Parca { id: string; nome: string; apelido: string; perfil: PerfilParca; lealdade: number; desde: number; funcao?: FuncaoParca; divida?: number; churrasco?: number }
const APELIDOS = ["Magrão", "Pezão", "Bolinha", "Careca", "Alemão", "Tico", "Juninho", "Pardal", "Cabeça", "Primo", "Gordinho", "Neném", "Bigode", "Fumaça", "Dedé", "Tuta"];
const PERFIS: PerfilParca[] = ["leal", "leal", "festeiro", "interesseiro", "fofoqueiro", "trabalhador"];
export function novoParca(rng: RNG, nac: string, ano: number, usados: Set<string>, perfil?: PerfilParca, id = "p0"): Parca {
  const ja = new Set([...usados].map((x) => x.split(" ")[0]));
  const apelido = rng.pick(APELIDOS.filter((a) => !ja.has(a))) ?? rng.pick(APELIDOS);
  return { id, nome: gerarNome(rng, nac, usados), apelido, perfil: perfil ?? rng.pick(PERFIS), lealdade: rng.int(45, 75), desde: ano };
}
/** Os amigos de infância que acompanham o jogador desde o começo. */
export function parcasIniciais(rng: RNG, nac: string, ano: number): Parca[] {
  const usados = new Set<string>(), l: Parca[] = [];
  const perfis: PerfilParca[] = ["leal", rng.pick(["festeiro", "interesseiro", "fofoqueiro", "trabalhador"] as PerfilParca[])];
  if (rng.chance(0.6)) perfis.push(rng.pick(PERFIS));
  perfis.forEach((p, i) => { const x = novoParca(rng, nac, ano - 10, usados, p, `p${i + 1}`); x.lealdade += 10; usados.add(x.apelido); l.push(x); });
  return l;
}
export interface EfeitoSemanal { moral: number; cansaco: number; engajamento: number; vidaNoturna: number; custo: number }
export function efeitosParcas(ps: Parca[]): EfeitoSemanal {
  const e: EfeitoSemanal = { moral: 0, cansaco: 0, engajamento: 0, vidaNoturna: 0, custo: 0 };
  for (const p of ps) {
    if (p.perfil === "leal") e.moral += 0.25;
    if (p.perfil === "festeiro") e.vidaNoturna += 0.4;
    if (p.funcao === "motorista") e.cansaco -= 2;
    if (p.funcao === "faztudo") e.moral += 0.4;
    if (p.funcao === "midia") e.engajamento += 2;
    if (p.funcao) e.custo += FUNCOES[p.funcao].custo;
  }
  return e;
}
export const temFuncao = (ps: Parca[], f: FuncaoParca) => ps.some((p) => p.funcao === f);

// ------------------------------------------------------------------ contexto
export interface CtxSocial {
  semanaAbs: number; semana: number; ano: number; idade: number; fama: number; saldo: number; salario: number; patrimonio: number;
  vidaNoturna: number; apelido: string; nac: string; cidadeNatal: string; clube: string; exterior: boolean; temJogo: boolean;
  assessor: boolean; ferias: boolean; casado: boolean; nomePar?: string;
  familia: Familiar[]; filhos: Filho[]; parcas: Parca[]; carroEsportivo: boolean; valoresEmCasa: number;
}

// ------------------------------------------------------------------ semana: o que pode acontecer
export function semanaSocial(a: EstadoAgenda, rng: RNG, x: CtxSocial, avisos: string[]): { noticias: EfeitoVida["noticia"][]; ef: EfeitoVida } {
  const noticias: EfeitoVida["noticia"][] = [], ef: EfeitoVida = {};
  const ag = (o: Omit<Ocasiao, "uid" | "expira"> & { prazo?: number }, intervalo?: number) => agendar(a, x.semanaAbs, o, intervalo);
  // --- parças
  if (rng.chance(0.11) && x.parcas.length) {
    const p = rng.pick(x.parcas), n = `${p.apelido}`;
    if (p.perfil === "interesseiro" || (p.perfil !== "leal" && rng.chance(0.2))) {
      const v = Math.round(clamp(x.salario * rng.range(0.5, 2), 5_000, 400_000) / 1000) * 1000;
      ag({ origem: "parca", chave: `parca-grana-${p.id}`, titulo: `${n} pede dinheiro`, texto: `"Irmão, tô apertado. Me empresta ${reais(v)}? Te pago mês que vem, palavra."`, opcoes: [
        op("emprestar", `Emprestar ${reais(v)}`, `${n} agradeceu com um abraço.`, { dinheiro: -v, parca: [p.id, 10], gatilho: `parca-divida:${p.id}:${v}` }),
        op("dar", "Dar e não cobrar", `${n} ficou sem palavras.`, { dinheiro: -v, parca: [p.id, 18], moral: 1 }),
        op("negar", "Dizer que não dá", `${n} disse que entendia. Não entendeu.`, { parca: [p.id, -15] }),
      ] }, 20);
    } else if (p.perfil === "festeiro" && x.temJogo && rng.chance(0.65)) {
      ag({ origem: "parca", chave: `parca-balada-${p.id}`, titulo: "Balada na véspera do jogo", texto: `${n} manda áudio: "Hoje tem aniversário do DJ, camarote separado. Só uma horinha!"`, opcoes: [
        op("ir", "Ir só uma horinha", "Uma horinha virou cinco. Divertiu, mas o corpo sentiu.", { moral: 4, vidaNoturna: 8, cansaco: 15, parca: [p.id, 8] }, { chance: 0.25, texto: "Alguém filmou você no camarote às 4 da manhã. O vídeo chegou ao clube antes de você.", ef: { moral: 2, vidaNoturna: 10, cansaco: 15, relTecnico: -7, torcida: -4, noticia: { titulo: `${x.apelido} flagrado na balada na véspera do jogo`, texto: "Vídeo do camarote circulou nas redes e irritou a torcida.", tipo: "polemica" } } }),
        op("recusar", "Ficar em casa", `${n} chamou de "chato". Você dormiu cedo.`, { parca: [p.id, -5] }),
      ] }, 6);
    } else if (p.perfil === "fofoqueiro" && p.lealdade < 45) {
      ag({ origem: "parca", chave: `parca-fofoca-${p.id}`, titulo: `${n} anda falando demais`, texto: `Um amigo avisa: ${n} está contando histórias suas num grupo cheio de jornalista.`, opcoes: [
        op("conversa", "Chamar para uma conversa séria", `${n} jurou que não foi ele. Talvez tenha sido.`, { parca: [p.id, 12] }, { chance: 0.35, texto: `${n} se ofendeu e vendeu uma história para o perfil de fofoca.`, ef: { moral: -4, torcida: -2, gatilho: `parca-afastar:${p.id}`, noticia: { titulo: `Amigo de infância expõe bastidores de ${x.apelido}`, texto: "Ex-parça do jogador contou histórias da vida pessoal dele num podcast.", tipo: "polemica" } } }),
        op("afastar", "Afastar ele do grupo", `${n} saiu do grupo. Ficou um vazio, e um certo alívio.`, { moral: -2, gatilho: `parca-afastar:${p.id}` }, { chance: 0.4, texto: `${n} saiu atirando: deu entrevista contando tudo.`, ef: { moral: -5, torcida: -3, gatilho: `parca-afastar:${p.id}`, noticia: { titulo: `Ex-parça detona ${x.apelido}`, texto: "Amigo afastado falou da vida pessoal do jogador num programa de fofoca.", tipo: "polemica" } } }),
        op("ignorar", "Deixar para lá", "Você deixou para lá.", { parca: [p.id, -5] }),
      ] }, 25);
    } else {
      ag({ origem: "parca", chave: `parca-aniver-${p.id}`, titulo: `Aniversário do ${n}`, texto: `Churrasco na laje da mãe do ${n}, no bairro onde vocês cresceram. Ele faz questão.`, opcoes: [
        op("ir", "Ir e levar a carne", "Pagode até tarde, histórias da infância. Lavou a alma.", { moral: 5, cansaco: 6, parca: [p.id, 12], dinheiro: -3_000 }),
        op("presente", "Mandar um presente caro", `${n} postou o presente nas redes.`, { dinheiro: -15_000, parca: [p.id, 5] }),
        op("faltar", "Mandar mensagem", `${n} respondeu "valeu". Só isso.`, { parca: [p.id, -8] }),
      ] }, 45);
    }
  }
  // gente nova chegando quando a fama sobe
  if (x.fama >= 40 && x.parcas.length < 6 && rng.chance(0.012)) {
    const perfil = rng.pick(["festeiro", "interesseiro", "fofoqueiro", "leal"] as PerfilParca[]);
    ag({ origem: "parca", chave: "parca-novo", titulo: "Amigo novo na roda", texto: `Desde que você ficou famoso, um cara de outro clube social vive colando nos seus eventos. Simpático, sempre com convite.`, opcoes: [
      op("aceitar", "Trazer para o grupo", "Ele entrou no grupo do churrasco.", { gatilho: `parca-novo:${perfil}` }),
      op("distancia", "Manter distância", "Você foi educado e manteve a distância.", {}),
    ] }, 30);
  }
  // --- família que envelhece
  const vivos = x.familia.filter((m) => !m.falecido);
  for (const m of vivos) {
    const idade = x.ano - m.nasc, nome = primeiro(m.nome), pai = m.parentesco === "pai" || m.parentesco === "mae";
    if (!pai) continue;
    if (m.saude === "doente") {
      if (x.semanaAbs - (m.doenteDesde ?? 0) >= 4) {
        const morre = idade >= 62 && rng.chance((m.tratamento ? 0.12 : 0.28) + Math.max(0, idade - 75) * 0.02);
        if (morre) {
          m.falecido = x.ano; m.saude = undefined;
          ef.luto = 10; ef.moral = (ef.moral ?? 0) - 18;
          ef.marco = { tipo: "marco", texto: `Perde ${m.parentesco === "pai" ? "o pai" : "a mãe"}, ${nome}` };
          noticias.push({ titulo: `Luto: morre ${m.parentesco === "pai" ? "o pai" : "a mãe"} de ${x.apelido}`, texto: `${m.nome} tinha ${idade} anos. O clube decretou luto e a torcida mandou mensagens de apoio.`, tipo: "vida" });
          avisos.push(`${nome} se foi. Os próximos jogos vão ser difíceis.`);
        } else if (rng.chance(m.tratamento ? 0.6 : 0.35)) { m.saude = undefined; m.tratamento = undefined; avisos.push(`${nome} teve alta e está em casa, se recuperando.`); ef.moral = (ef.moral ?? 0) + 3; }
      }
      continue;
    }
    const chance = idade < 55 ? 0.0004 : idade < 65 ? 0.0015 : idade < 75 ? 0.003 : 0.006;
    if (rng.chance(chance)) {
      m.saude = "doente"; m.doenteDesde = x.semanaAbs;
      const v = Math.round(clamp(x.salario * 1.5, 30_000, 400_000) / 1000) * 1000;
      ag({ origem: "familia", chave: `doenca-${m.id}`, titulo: `${m.parentesco === "pai" ? "Seu pai" : "Sua mãe"} está internad${m.parentesco === "pai" ? "o" : "a"}`, texto: `${nome} passou mal e foi levad${m.parentesco === "pai" ? "o" : "a"} ao hospital. Os médicos pedem exames e falam em tratamento longo.`, prazo: 1, opcoes: [
        op("hospital", `Pagar o melhor hospital (${reais(v)})`, "Quarto particular, a melhor equipe. Agora é esperar.", { dinheiro: -v, familiar: [m.id, 10], moral: -3, gatilho: `familiar-hospital:${m.id}` }),
        op("ir", "Largar tudo e ir ficar com ele(a)", "Você faltou ao treino e passou a noite no hospital. O técnico entendeu, mais ou menos.", { familiar: [m.id, 15], relTecnico: -4, cansaco: 10, moral: -2, gatilho: `familiar-hospital:${m.id}` }),
        op("ligar", "Ligar todo dia e seguir a rotina", "Você ligou todo dia. A família achou pouco.", { familiar: [m.id, -8], moral: -5 }),
      ] }, 0);
    }
    if (idade % 10 === 0 && x.semana === (m.nasc % 30) + 4) {
      ag({ origem: "familia", chave: `aniver-${m.id}-${x.ano}`, titulo: `${idade} anos d${m.parentesco === "pai" ? "o seu pai" : "a sua mãe"}`, texto: `${nome} faz ${idade} anos no sábado, véspera de jogo. A família está organizando alguma coisa.`, opcoes: [
        op("festa", "Bancar uma festa surpresa", `${nome} chorou quando viu todo mundo. Valeu cada centavo.`, { dinheiro: -60_000, familiar: [m.id, 14], moral: 5, cansaco: 6 }),
        op("jantar", "Ir ao jantar da família", "Jantar simples, abraço apertado.", { familiar: [m.id, 7], moral: 2, cansaco: 3 }),
        op("mensagem", "Mandar uma mensagem carinhosa", `${nome} respondeu com um emoji. Esperava você lá.`, { familiar: [m.id, -5] }),
      ] }, 0);
    }
  }
  const irmaos = vivos.filter((m) => (m.parentesco === "irmao" || m.parentesco === "irma") && x.ano - m.nasc >= 20);
  if (irmaos.length && rng.chance(0.02)) {
    const m = rng.pick(irmaos), nome = primeiro(m.nome), ir = m.parentesco === "irmao";
    if (rng.chance(0.5)) {
      const v = Math.round(clamp(x.salario * 3, 40_000, 900_000) / 1000) * 1000;
      ag({ origem: "familia", chave: `irmao-grana-${m.id}`, titulo: `${nome} pede ajuda`, texto: `${nome} quer dar entrada num apartamento e pergunta se você ajuda com ${reais(v)}.`, opcoes: [
        op("dar", "Dar o dinheiro", `${nome} mandou foto da chave na mão.`, { dinheiro: -v, familiar: [m.id, 15] }),
        op("metade", "Ajudar com metade", `${nome} agradeceu e se virou com o resto.`, { dinheiro: -Math.round(v / 2), familiar: [m.id, 5] }),
        op("negar", "Dizer que agora não dá", `${nome} ficou magoad${ir ? "o" : "a"}. Ninguém fala, mas o clima mudou.`, { familiar: [m.id, -12] }),
      ] }, 60);
    } else {
      ag({ origem: "familia", chave: `casamento-${m.id}`, titulo: `${nome} vai casar!`, texto: `${nome} marcou o casamento para um sábado de rodada. A família conta com você, e com a festa.`, opcoes: [
        op("pagar", "Pagar a festa e ir", "Festa linda, você foi padrinho. Dançou até de manhã.", { dinheiro: -250_000, familiar: [m.id, 18], moral: 5, cansaco: 12, relTecnico: -2, marco: { tipo: "marco", texto: `Padrinho no casamento de ${nome}` } }),
        op("cerimonia", "Ir só à cerimônia", "Igreja, abraço, foto e direto para a concentração.", { familiar: [m.id, 8], cansaco: 5 }),
        op("faltar", "Faltar por causa do jogo", `${nome} disse que entende. O vídeo da festa tinha uma cadeira vazia.`, { familiar: [m.id, -15], moral: -3 }),
      ] }, 200);
    }
  }
  if (irmaos.length && rng.chance(0.003)) {
    const m = rng.pick(irmaos);
    ef.moral = (ef.moral ?? 0) + 3; ef.familiar = [m.id, 4];
    avisos.push(`Nasceu seu sobrinho, filho d${m.parentesco === "irmao" ? "o" : "a"} ${primeiro(m.nome)}!`);
    ef.marco = { tipo: "filho", texto: `Vira tio: nasce o filho d${m.parentesco === "irmao" ? "o" : "a"} ${primeiro(m.nome)}` };
  }
  // --- filhos que crescem
  x.filhos.forEach((f, i) => {
    const idade = x.ano - f.ano, nome = f.nome;
    if (idade < 3 || !rng.chance(0.04)) return;
    const k = `filho-${i}`;
    if ((f.relacao ?? 50) < 30) {
      ag({ origem: "filho", chave: `${k}-ausencia`, titulo: `${nome} sente a sua falta`, texto: idade < 12 ? `${nome} fez um desenho na escola: a família inteira, e você longe, num avião.` : `${nome} disse para a mãe que "pai famoso é pai de foto".`, opcoes: [
        op("semana", "Tirar uns dias só para ele", "Parque, sorvete, videogame até tarde. Vocês se reencontraram.", { filho: [i, 20], relTecnico: -3, moral: 4 }),
        op("prometer", "Prometer mais tempo", "Promessa feita. Ele quer ver cumprida.", { filho: [i, 3] }),
      ] }, 30);
      return;
    }
    if (idade <= 10) {
      const r = rng.int(0, 2);
      if (r === 0) ag({ origem: "filho", chave: `${k}-escola`, titulo: "Apresentação na escola", texto: `${nome} vai dançar na festa da escola na sexta. Ensaiou a semana toda e pergunta se você vai.`, opcoes: [
        op("ir", "Ir e sentar na primeira fila", `${nome} acenou para você no meio da dança. Valeu o dia.`, { filho: [i, 12], moral: 4, cansaco: 3 }),
        op("video", "Pedir para filmarem", "Você assistiu o vídeo no ônibus do time.", { filho: [i, -2] }),
        op("faltar", "Não dá: tem treino", `${nome} procurou você na plateia.`, { filho: [i, -8] }),
      ] }, 20);
      else if (r === 1) ag({ origem: "filho", chave: `${k}-treino`, titulo: `${nome} quer ir ao treino`, texto: `${nome} quer conhecer o CT e chutar uma bola com os seus companheiros.`, opcoes: [
        op("levar", "Levar", `Os companheiros adoraram. ${nome} voltou com uma camisa autografada pelo elenco.`, { filho: [i, 10], moral: 3, relTecnico: 1 }),
        op("depois", "Outro dia", "Ele ficou esperando o outro dia.", { filho: [i, -3] }),
      ] }, 30);
      else ag({ origem: "filho", chave: `${k}-pedido`, titulo: `${nome} quer um cachorro`, texto: `${nome} encontrou um filhote na rua e não para de pedir.`, opcoes: [
        op("sim", "Adotar o cachorro", `O cachorro já tem nome: o seu apelido. ${nome} está radiante.`, { filho: [i, 10], moral: 3, dinheiro: -2_000 }),
        op("nao", "Dizer que não", `${nome} chorou a noite toda.`, { filho: [i, -5] }),
      ] }, 200);
    } else if (idade <= 17) {
      const r = rng.int(0, 3);
      if (r === 0 && !f.futebol) ag({ origem: "filho", chave: `${k}-sonho`, titulo: `${nome} quer ser jogador`, texto: `${nome} disse que quer ser jogador como você. Joga na escola e o professor diz que leva jeito.`, opcoes: [
        op("incentivar", "Incentivar e colocar numa escolinha", `${nome} começou na escolinha. Agora é treino todo dia.`, { filho: [i, 10], moral: 3, gatilho: `filho-boleiro:${i}` }),
        op("estudar", "Dizer que estudo vem primeiro", "Ele não gostou, mas foi.", { filho: [i, -6] }),
        op("deixar", "Deixar ele decidir sozinho", "Ele vai pensar.", { filho: [i, 2] }),
      ] }, 200);
      else if (r === 1) ag({ origem: "filho", chave: `${k}-notas`, titulo: "Boletim vermelho", texto: `A escola chamou: ${nome} está com notas baixas e matando aula.`, opcoes: [
        op("estudar", "Estudar junto à noite", "Tabuada, redação e muita paciência. As notas subiram.", { filho: [i, 8], cansaco: 5 }),
        op("professor", "Contratar professor particular", "As notas subiram. A conversa entre vocês, não.", { dinheiro: -8_000, filho: [i, 2] }),
        op("bronca", "Dar uma bronca por telefone", "Ele desligou na sua cara.", { filho: [i, -7] }),
      ] }, 40);
      else if (r === 2) ag({ origem: "filho", chave: `${k}-rebelde`, titulo: "Fase rebelde", texto: `${nome} respondeu a mãe, pintou o cabelo de verde e anda com uma turma nova.`, opcoes: [
        op("conversar", "Sentar e conversar de verdade", "Duas horas de conversa. Ele chorou, você também.", { filho: [i, 12], moral: 2 }),
        op("castigo", "Tirar o celular por um mês", "Funcionou por uma semana.", { filho: [i, -6] }),
        op("deixar", "É da idade, deixa", "Passou. Mais ou menos.", { filho: [i, -2] }),
      ] }, 60);
      else ag({ origem: "filho", chave: `${k}-redes`, titulo: `${nome} viralizou`, texto: `${nome} postou um vídeo zoando o rival do seu time. Já são milhões de visualizações.`, opcoes: [
        op("rir", "Repostar rindo", "A torcida amou. O rival, nem tanto.", { filho: [i, 6], engajamento: 8, torcida: 2 }, { chance: 0.3, texto: "Virou guerra nas redes: torcedores rivais atacaram o seu filho.", ef: { filho: [i, 4], moral: -4, noticia: { titulo: `Filho de ${x.apelido} vira alvo nas redes`, texto: "Vídeo do filho do jogador provocou torcedores rivais.", tipo: "polemica" } } }),
        op("apagar", "Pedir para apagar", "Ele apagou, emburrado.", { filho: [i, -4] }),
      ] }, 60);
    } else if (idade === 18 && !f.adulto) {
      f.adulto = true;
      ag({ origem: "filho", chave: `${k}-faculdade`, titulo: `${nome} fez 18 anos`, texto: `${nome} passou no vestibular e quer morar sozinho perto da faculdade.`, opcoes: [
        op("bancar", "Bancar faculdade e apartamento", `${nome} mandou foto do primeiro dia de aula.`, { dinheiro: -400_000, filho: [i, 12], moral: 4, marco: { tipo: "filho", texto: `${nome} entra na faculdade` } }),
        op("faculdade", "Pagar só a faculdade", "Ele divide apartamento com dois amigos.", { dinheiro: -120_000, filho: [i, 5], marco: { tipo: "filho", texto: `${nome} entra na faculdade` } }),
        op("conselho", "Dar conselho e deixar ele se virar", "Ele arrumou um estágio. Orgulho e saudade.", { filho: [i, -2] }),
      ] }, 999);
    }
  });
  // --- convites de celebridade
  if (x.fama >= 35 && rng.chance(0.05 + x.fama / 1500)) {
    const opcoes: (() => void)[] = [];
    const v = (base: number) => Math.round(base * (0.5 + x.fama / 50) / 1000) * 1000;
    if (x.semana >= 5 && x.semana <= 8 && !x.exterior) opcoes.push(() => ag({ origem: "convite", chave: "carnaval", titulo: "Convite para o Carnaval", texto: "Uma escola de samba do grupo especial quer você no último carro alegórico. E tem camarote também.", opcoes: [
      op("desfilar", "Desfilar no carro alegórico", "A Sapucaí gritou o seu nome. Você sambou mal e ninguém ligou.", { fama: 3, engajamento: 12, hype: 0.1, cansaco: 25, vidaNoturna: 5, relTecnico: -5 }),
      op("camarote", "Só o camarote", "Camarote lotado de famosos. Foto com meio mundo.", { moral: 4, vidaNoturna: 8, fama: 1 }, { chance: 0.25, texto: "O camarote rendeu foto comprometedora às 6 da manhã.", ef: { vidaNoturna: 10, torcida: -4, relTecnico: -5, noticia: { titulo: `${x.apelido} amanhece no camarote`, texto: "Fotos do jogador no carnaval irritam a torcida.", tipo: "polemica" } } }),
      op("recusar", "Ficar concentrado", "Você viu o desfile pela TV, de pijama.", {}),
    ] }, 30));
    opcoes.push(() => ag({ origem: "convite", chave: "auditorio", titulo: "Programa de auditório", texto: "O maior programa de domingo quer você no palco: brincadeiras, entrevista e uma surpresa da família.", opcoes: [
      op("ir", "Ir ao programa", "Plateia em pé, mãe chorando no telão. O Brasil inteiro viu.", { fama: 1.5, imprensa: 4, engajamento: 6, cansaco: 8, familiar: ["mae", 5] }),
      op("recusar", "Recusar", "Você mandou um vídeo agradecendo.", {}),
    ] }, 25));
    opcoes.push(() => ag({ origem: "convite", chave: "comercial", titulo: "Comercial de TV", texto: `Uma marca de refrigerante quer você num comercial nacional: ${reais(v(150_000))} por dois dias de gravação.`, opcoes: [
      op("gravar", "Gravar", "Comercial no ar no intervalo da novela. Todo mundo comentou o seu sotaque.", { dinheiro: v(150_000), fama: 1, cansaco: 10 }),
      op("recusar", "Recusar", "Dinheiro fica para a próxima.", {}),
    ] }, 30));
    opcoes.push(() => ag({ origem: "convite", chave: "clipe", titulo: "Clipe de cantor famoso", texto: "Um cantor do topo das paradas quer você no clipe da música nova. Uma cena só, jogando bola com ele.", opcoes: [
      op("aparecer", "Aparecer no clipe", "O clipe bateu 50 milhões de visualizações. Sua cena virou figurinha.", { fama: 1, engajamento: 10, hype: 0.1, cansaco: 5 }),
      op("recusar", "Recusar", "Você recusou com educação.", {}),
    ] }, 40));
    opcoes.push(() => ag({ origem: "convite", chave: "gala", titulo: "Festa de gala", texto: "Convite para o baile de gala de uma revista de celebridades. Tapete vermelho, smoking, flashes.", opcoes: [
      op("ir", "Ir", "Você foi eleito o mais elegante da noite.", { fama: 1, moral: 3, vidaNoturna: 5 }, { chance: x.casado ? 0.2 : 0.1, texto: "Uma foto sua conversando com uma atriz rodou os sites de fofoca.", ef: { fama: 1.5, vidaNoturna: 5, gatilho: x.casado ? "par:-10" : undefined, noticia: { titulo: `${x.apelido} e atriz: só amizade?`, texto: "Foto da festa de gala virou especulação nos sites de fofoca.", tipo: "polemica" } } }),
      op("recusar", "Ficar em casa", "Sofá e série.", {}),
    ] }, 30));
    opcoes.push(() => ag({ origem: "convite", chave: "revista", titulo: "Capa de revista", texto: "Uma revista de moda quer você na capa, com ensaio fotográfico e entrevista.", opcoes: [
      op("aceitar", "Fazer o ensaio", "A capa esgotou nas bancas.", { fama: 2, engajamento: 8, imprensa: 3, cansaco: 4 }),
      op("recusar", "Recusar", "Talvez em outra edição.", {}),
    ] }, 40));
    opcoes.push(() => ag({ origem: "convite", chave: "podcast", titulo: "Podcast famoso", texto: "O podcast mais ouvido do país quer três horas de conversa com você.", opcoes: [
      op("ir", "Ir e falar de tudo", "Três horas de resenha. O corte com a sua história de infância viralizou.", { fama: 1, engajamento: 10, imprensa: 2 }, { chance: 0.25, texto: "Numa hora de papo, você soltou uma opinião sobre o técnico que virou manchete.", ef: { engajamento: 10, relTecnico: -8, imprensa: -3, noticia: { titulo: `${x.apelido} fala demais em podcast`, texto: "Declaração do jogador sobre o técnico repercutiu mal no clube.", tipo: "polemica" } } }),
      op("recusar", "Recusar", "Você agradeceu o convite.", {}),
    ] }, 30));
    if (x.ferias) {
      opcoes.push(() => ag({ origem: "convite", chave: "reality", titulo: "Reality show", texto: `Participação especial de uma semana num reality show famoso: ${reais(v(500_000))}.`, opcoes: [
        op("entrar", "Topar", "Uma semana de prova de resistência e festa. Você saiu como favorito do público.", { dinheiro: v(500_000), fama: 3, hype: 0.15, engajamento: 15, cansaco: 10 }),
        op("recusar", "Recusar", "Férias são para descansar.", {}),
      ] }, 60));
      opcoes.push(() => ag({ origem: "convite", chave: "beneficente", titulo: "Jogo beneficente", texto: "Um jogo de famosos contra ex-craques, com a renda para hospitais infantis.", opcoes: [
        op("jogar", "Jogar", `Golaço de bicicleta contra um ex-goleiro de seleção. ${curtoBrl(2_000_000)} arrecadados.`, { torcida: 3, impacto: 8, fama: 1, imprensa: 3, cansaco: 6 }),
        op("recusar", "Recusar", "Você mandou uma camisa autografada para o leilão.", { impacto: 1 }),
      ] }, 60));
    }
    rng.pick(opcoes)();
  }
  // --- encrencas
  const enc = 0.02 + x.vidaNoturna / 2500 + (x.carroEsportivo ? 0.006 : 0);
  if (rng.chance(enc)) {
    const r = rng.next(), motorista = temFuncao(x.parcas, "motorista"), seguranca = temFuncao(x.parcas, "seguranca");
    if (r < 0.25 && x.carroEsportivo && !motorista) ag({ origem: "encrenca", chave: "multa", titulo: "Multa por excesso de velocidade", texto: "O radar pegou você a 160 km/h na marginal. A multa veio com foto e tudo, e a foto vazou.", opcoes: [
      op("pagar", "Pagar e ficar quieto", "Multa paga. A foto rodou mesmo assim.", { dinheiro: -12_000, torcida: -1 }),
      op("recorrer", "Recorrer com advogado", "O advogado achou um erro no radar.", { dinheiro: -20_000 }, { chance: 0.5, texto: "O recurso foi negado e virou notícia.", ef: { dinheiro: -32_000, noticia: { titulo: `${x.apelido} perde recurso de multa`, texto: "O jogador foi flagrado a 160 km/h.", tipo: "polemica" } } }),
    ] }, 20);
    else if (r < 0.4 && x.vidaNoturna > 45 && !motorista) ag({ origem: "encrenca", chave: "blitz", titulo: "Parado na blitz", texto: "Saindo da balada às 4 da manhã, a polícia parou o seu carro numa blitz da Lei Seca.", prazo: 1, opcoes: [
      op("teste", "Fazer o teste do bafômetro", "Deu zero: você só tinha tomado refrigerante. Alívio.", { moral: -1 }, { chance: 0.45, texto: "O bafômetro acusou. Carteira suspensa, multa pesada e o vídeo no jornal da manhã.", ef: { dinheiro: -3_000, relTecnico: -8, torcida: -5, moral: -6, noticia: { titulo: `${x.apelido} é flagrado em blitz da Lei Seca`, texto: "O jogador teve a carteira suspensa depois de sair de uma balada.", tipo: "polemica" } } }),
      op("recusar", "Recusar o teste", "Recusar também é infração: multa, carteira suspensa e manchete.", { dinheiro: -3_000, relTecnico: -6, torcida: -4, noticia: { titulo: `${x.apelido} se recusa a fazer bafômetro`, texto: "O jogador foi parado numa blitz depois da balada.", tipo: "polemica" } }),
    ] }, 30);
    else if (r < 0.55 && x.valoresEmCasa > 300_000 && !seguranca) ag({ origem: "encrenca", chave: "furto", titulo: "Furto em casa", texto: "Enquanto você estava na concentração, entraram na sua casa e levaram relógios e joias.", prazo: 1, opcoes: [
      op("seguranca", "Registrar a ocorrência e reforçar a segurança", "Câmeras, alarme e um vigia. A polícia recuperou parte das coisas.", { dinheiro: -60_000, moral: -3, gatilho: "garagem-furto:metade" }),
      op("quieto", "Registrar e seguir", "Ficou o prejuízo e a sensação ruim.", { moral: -5, gatilho: "garagem-furto:tudo" }),
    ] }, 40);
    else if (r < 0.7 && x.parcas.some((p) => p.funcao)) ag({ origem: "encrenca", chave: "trabalhista", titulo: "Processo trabalhista", texto: "Um ex-funcionário entrou na justiça cobrando horas extras e férias que diz nunca ter recebido.", opcoes: [
      op("acordo", "Fazer acordo", "Acordo fechado, processo arquivado.", { dinheiro: -80_000 }),
      op("brigar", "Brigar na justiça", "O juiz deu razão a você.", { dinheiro: -30_000 }, { chance: 0.5, texto: "Perdeu a causa, pagou em dobro e o processo virou notícia.", ef: { dinheiro: -190_000, noticia: { titulo: `${x.apelido} perde processo trabalhista`, texto: "Ex-funcionário ganhou a causa contra o jogador.", tipo: "polemica" } } }),
    ] }, 60);
    else if (r < 0.82 && x.patrimonio > 15_000_000 && !x.assessor) {
      const v = Math.round(x.patrimonio * 0.03 / 1000) * 1000;
      ag({ origem: "encrenca", chave: "receita", titulo: "A Receita Federal bateu na porta", texto: `Uma fiscalização encontrou impostos atrasados das suas empresas e direitos de imagem: ${reais(v)}.`, opcoes: [
        op("pagar", "Pagar e regularizar", "Tudo pago, nome limpo.", { dinheiro: -v }),
        op("contestar", "Contestar com advogados", "Os advogados provaram que estava tudo certo.", { dinheiro: -Math.round(v * 0.1) }, { chance: 0.5, texto: "Perdeu na justiça: multa em dobro e manchete de sonegação.", ef: { dinheiro: -v * 2, torcida: -3, noticia: { titulo: `${x.apelido} é multado pela Receita`, texto: "O jogador perdeu a disputa com o fisco sobre impostos atrasados.", tipo: "polemica" } } }),
      ] }, 150);
    } else if (x.filhos.some((f) => f.pensao)) {
      const v = Math.round(clamp(x.salario * 4, 50_000, 2_000_000) / 1000) * 1000;
      ag({ origem: "encrenca", chave: "pensao", titulo: "Pensão na justiça", texto: `A mãe de um dos seus filhos entrou na justiça pedindo revisão da pensão: ${reais(v)} de atrasados.`, opcoes: [
        op("acordo", "Fazer acordo", "Acordo assinado. A relação com a criança melhorou.", { dinheiro: -v, moral: -2 }),
        op("brigar", "Brigar na justiça", "O juiz manteve o valor antigo.", { dinheiro: -40_000 }, { chance: 0.6, texto: "Perdeu a ação e o caso foi parar nos sites de fofoca.", ef: { dinheiro: -v * 1.5, torcida: -3, moral: -4, noticia: { titulo: `${x.apelido} perde ação de pensão`, texto: "A justiça mandou o jogador pagar os atrasados.", tipo: "polemica" } } }),
      ] }, 80);
    }
  }
  return { noticias, ef };
}

/** Fim de temporada: a escolha das férias. */
export function agendarFerias(a: EstadoAgenda, x: CtxSocial) {
  const luxo = Math.round(clamp(x.salario * 2, 60_000, 1_500_000) / 1000) * 1000;
  agendar(a, x.semanaAbs, { origem: "ferias", chave: `ferias-${x.ano}`, titulo: "Férias: para onde?", texto: "A temporada acabou. Três semanas de folga antes da pré-temporada.", prazo: 2, opcoes: [
    op("praia", "Praia com a família", "Pé na areia, criança no colo, celular desligado. Voltou novo.", { dinheiro: -60_000, moral: 8, desgaste: -10, gatilho: "familia-todos:6", filho: [-1, 10] }),
    op("luxo", `Viagem de luxo (${reais(luxo)})`, "Iate, ilha particular, foto de capa nas redes.", { dinheiro: -luxo, moral: 7, fama: 1, engajamento: 12, desgaste: -6 }),
    op("natal", `Voltar para ${x.cidadeNatal}`, "Rua da infância, churrasco com os parças, a mãe fazendo o seu prato favorito.", { dinheiro: -15_000, moral: 6, desgaste: -6, gatilho: "familia-todos:10", torcida: 1 }),
    op("ibiza", "Festa em Ibiza", "Festa todo dia. Voltou bronzeado e destruído.", { dinheiro: -300_000, moral: 8, vidaNoturna: 15, fama: 1, desgaste: 4 }, { chance: 0.3, texto: "As fotos de Ibiza rodaram o mundo. Nem todas eram boas.", ef: { dinheiro: -300_000, moral: 5, vidaNoturna: 18, fama: 1.5, torcida: -4, noticia: { titulo: `${x.apelido} causa em Ibiza`, texto: "Fotos das férias do jogador geraram polêmica.", tipo: "polemica" } } }),
    op("treinar", "Ficar treinando com um personal", "Enquanto todo mundo descansava, você treinava. Voltou voando, e um pouco esgotado.", { dinheiro: -40_000, evolucao: 0.05, moral: -3, desgaste: 6, gatilho: "familia-todos:-4" }),
    op("casa", "Ficar em casa descansando", "Sofá, série e comida de mãe.", { moral: 3, desgaste: -6 }),
  ] }, 0);
}
