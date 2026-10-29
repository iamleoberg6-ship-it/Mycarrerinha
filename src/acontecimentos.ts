// Acontecimentos da temporada: o que simplesmente acontece com um jogador de futebol, para o bem e para o mal.
// O gol que viraliza, a lenda que elogia, o fã-clube, o bicho do clássico, a folga extra; e também a gripe na
// concentração, o salário atrasado, a conta hackeada, a fake news, o voo de dez horas, o carro riscado.
// Uns só acontecem (viram notícia e mexem na vida); outros pedem uma escolha (vão para a agenda).
import { RNG } from "./rng.js";
import { agendar, type EstadoAgenda, type OpcaoOcasiao, type EfeitoVida } from "./agenda.js";

const op = (id: string, rotulo: string, texto: string, ef: EfeitoVida, risco?: OpcaoOcasiao["risco"]): OpcaoOcasiao => ({ id, rotulo, texto, ef, ...(risco ? { risco } : {}) });
const reais = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

export interface CtxAcontece {
  ab: number; semana: number; ano: number; apelido: string; clube: string; cidade: string; idade: number; fama: number; salario: number; saldo: number;
  /** o jogo da semana */
  jogou: boolean; nota: number; gols: number; resultado?: "vitoria" | "derrota" | "empate"; classico: boolean;
  titular: boolean; fClube: number; exterior: boolean; seguranca: boolean; temporadaBoa: boolean; profissional: boolean;
}
export interface Acontecido { titulo: string; texto: string; ef: EfeitoVida; bom: boolean }
interface Modelo { id: string; peso: number; bom: boolean; quando: (c: CtxAcontece) => boolean; faz: (c: CtxAcontece, rng: RNG, a: EstadoAgenda) => Acontecido | "agenda" | undefined }

const M: Modelo[] = [
  // ------------------------------------------------------------ bons
  { id: "viraliza", peso: 3, bom: true, quando: (c) => c.jogou && c.gols > 0 && c.nota >= 8, faz: (c) => ({ bom: true, titulo: `Gol de ${c.apelido} viraliza no mundo`, texto: "O lance passou dos 30 milhões de visualizações. Até jornal estrangeiro postou.", ef: { hype: 0.6, fama: 1.5, engajamento: 8, moral: 3 } }) },
  { id: "lenda", peso: 2, bom: true, quando: (c) => c.fama >= 35 && c.temporadaBoa, faz: (c, r) => ({ bom: true, titulo: `Lenda do futebol elogia ${c.apelido}`, texto: `"${r.pick(["Ele me lembra eu quando jovem", "Esse menino vai longe", "Hoje é o jogador que eu pagaria ingresso para ver"])}", disse um campeão do mundo numa entrevista.`, ef: { moral: 5, fama: 1.2, imprensa: 4 } }) },
  { id: "fa-clube", peso: 1.5, bom: true, quando: (c) => c.fama >= 45, faz: (c) => ({ bom: true, titulo: `Nasce o fã-clube oficial de ${c.apelido}`, texto: "Camisetas, perfil nas redes e encontro marcado na porta do estádio.", ef: { moral: 3, torcida: 3, engajamento: 6 } }) },
  { id: "bicho", peso: 3, bom: true, quando: (c) => c.jogou && c.resultado === "vitoria" && c.classico, faz: (c) => ({ bom: true, titulo: "Bicho do clássico", texto: `A diretoria do ${c.clube} pagou prêmio extra pela vitória no clássico: ${reais(c.salario * 0.25)} para cada um.`, ef: { dinheiro: c.salario * 0.25, moral: 4, torcida: 2 } }) },
  { id: "folga", peso: 2, bom: true, quando: (c) => c.jogou && c.resultado === "vitoria", faz: () => ({ bom: true, titulo: "Folga extra", texto: "Depois da sequência de vitórias, o técnico liberou o grupo por dois dias.", ef: { cansaco: -12, moral: 3 } }) },
  { id: "escola", peso: 1, bom: true, quando: (c) => c.fama >= 25, faz: (c) => ({ bom: true, titulo: `Escola onde ${c.apelido} estudou faz homenagem`, texto: "Um mural no pátio e as crianças com a sua camisa. A professora da 4ª série chorou.", ef: { moral: 5, torcida: 1 } }) },
  { id: "tatuagem-fa", peso: 1, bom: true, quando: (c) => c.fama >= 50, faz: (c) => ({ bom: true, titulo: `Torcedor tatua o rosto de ${c.apelido}`, texto: "A tatuagem ocupa as costas inteiras. O vídeo do torcedor mostrando para você rodou o país.", ef: { fama: 0.8, engajamento: 5, moral: 2 } }) },
  { id: "craque-torcida", peso: 2, bom: true, quando: (c) => c.profissional && c.jogou && c.nota >= 7.8, faz: (c) => ({ bom: true, titulo: `${c.apelido} é eleito pela torcida`, texto: "Na votação das redes do clube, você foi o craque do jogo com folga.", ef: { torcida: 3, moral: 2 } }) },
  { id: "jogo-beneficente", peso: 1.2, bom: true, quando: (c) => c.fama >= 30, faz: (c, _r, a) => agendar(a, c.ab, { origem: "acontece", chave: "beneficente", titulo: "Jogo beneficente", texto: "Um amigo de infância está organizando um jogo beneficente no bairro onde você cresceu. Querem você lá.", opcoes: [
    op("ir", "Ir e jogar", "Bola, criança, churrasco e a quadra lotada. O dinheiro arrecadado vai para a creche do bairro.", { moral: 5, torcida: 3, imprensa: 3, cansaco: 6 }),
    op("doar", "Não ir, mas doar", `Você mandou ${reais(Math.max(5000, c.salario * 0.2))} e um vídeo. Ajudou, mas sentiram sua falta.`, { dinheiro: -Math.max(5000, c.salario * 0.2), moral: 1, imprensa: 1 }),
    op("nao", "Não dá agora", "O jogo aconteceu sem você.", { moral: -1 }),
  ] }, 30) ? "agenda" : undefined },
  // ------------------------------------------------------------ ruins
  { id: "gripe", peso: 3, bom: false, quando: () => true, faz: (c) => ({ bom: false, titulo: `${c.apelido} pega gripe forte`, texto: "Febre de 39 graus na concentração. O departamento médico vetou você do treino da semana.", ef: { cansaco: 18, moral: -3, lesao: 1 } }) },
  { id: "intoxicacao", peso: 2, bom: false, quando: (c) => c.profissional, faz: (c) => ({ bom: false, titulo: "Intoxicação na concentração", texto: `Metade do elenco do ${c.clube} passou mal depois do jantar do hotel. Você foi um deles.`, ef: { cansaco: 14, moral: -2 } }) },
  { id: "salario-atrasado", peso: 3, bom: false, quando: (c) => c.profissional && c.fClube < 0.8, faz: (c, _r, a) => agendar(a, c.ab, { origem: "acontece", chave: "salario-atrasado", titulo: "Salário atrasado", texto: `O ${c.clube} atrasou dois meses de salário. O elenco ameaça não treinar.`, opcoes: [
    op("greve", "Apoiar a greve", "O clube pagou em uma semana. A diretoria anotou quem liderou.", { dinheiro: c.salario * 0.2, relTecnico: -4, moral: 2 }),
    op("paciencia", "Ter paciência", "Pagaram atrasado e sem correção. O mês ficou apertado.", { moral: -4, pressao: 4 }),
    op("justica", "Acionar a justiça", "O advogado custou caro, mas você recebeu tudo e mais a multa.", { dinheiro: c.salario * 0.4 - 15000, relTecnico: -8, torcida: -3 }, { chance: 0.3, texto: "O processo travou e a diretoria passou a te tratar como inimigo.", ef: { dinheiro: -15000, relTecnico: -12, moral: -4 } }),
  ] }, 40) ? "agenda" : undefined },
  { id: "hack", peso: 1.5, bom: false, quando: (c) => c.fama >= 30, faz: (c, _r, a) => agendar(a, c.ab, { origem: "acontece", chave: "hack", titulo: "Hackearam suas redes", texto: "Alguém invadiu seu perfil e está postando propaganda de jogo de azar com a sua cara.", opcoes: [
    op("especialista", "Pagar um especialista", `Conta recuperada em horas. Custou ${reais(20000)}.`, { dinheiro: -20000, engajamento: -2 }),
    op("plataforma", "Esperar a plataforma resolver", "Levou uma semana. Os posts ficaram no ar e viraram piada.", { engajamento: -12, imprensa: -4, fama: -0.5 }),
  ] }, 60) ? "agenda" : undefined },
  { id: "fake-news", peso: 1.5, bom: false, quando: (c) => c.fama >= 35, faz: (c, r, a) => agendar(a, c.ab, { origem: "acontece", chave: "fake-news", titulo: "Fake news", texto: `Um site inventou que ${c.apelido} ${r.pick(["brigou com o técnico no vestiário", "pediu para sair do clube", "foi visto numa festa na véspera do jogo"])}. Está em todo grupo de WhatsApp.`, opcoes: [
    op("desmentir", "Desmentir com vídeo", "O vídeo calmo e direto convenceu quase todo mundo.", { imprensa: 3, engajamento: 4 }),
    op("processar", "Processar o site", "O site tirou a matéria e pediu desculpas. Advogado caro.", { dinheiro: -25000, imprensa: 2, moral: 2 }),
    op("ignorar", "Ignorar", "A mentira ficou circulando por semanas.", { torcida: -3, imprensa: -2, pressao: 4 }),
  ] }, 40) ? "agenda" : undefined },
  { id: "assalto", peso: 1, bom: false, quando: (c) => c.fama >= 30 && !c.seguranca && c.saldo > 50000, faz: (c, r) => { const v = Math.min(c.saldo * 0.05, r.int(30, 120) * 1000); return { bom: false, titulo: `Casa de ${c.apelido} é assaltada`, texto: `Levaram relógios, eletrônicos e ${reais(v)} em objetos. Ninguém se feriu.`, ef: { dinheiro: -v, moral: -6, pressao: 6 } }; } },
  { id: "voo", peso: 2, bom: false, quando: (c) => c.profissional, faz: () => ({ bom: false, titulo: "Viagem infernal", texto: "Voo cancelado, conexão de madrugada e onze horas para chegar ao hotel da concentração.", ef: { cansaco: 12, moral: -2 } }) },
  { id: "carro-riscado", peso: 1.2, bom: false, quando: (c) => c.fama >= 20, faz: (c) => ({ bom: false, titulo: "Carro riscado", texto: "Depois da derrota, alguém riscou seu carro no estacionamento do CT. O vídeo da câmera não mostrou o rosto.", ef: { dinheiro: -Math.max(3000, c.salario * 0.05), moral: -3 } }) },
  { id: "audio", peso: 1, bom: false, quando: (c) => c.profissional && c.fama >= 30, faz: (c) => ({ bom: false, titulo: "Áudio vazado", texto: `Um áudio seu reclamando do esquema tático vazou de um grupo de jogadores do ${c.clube}.`, ef: { relTecnico: -8, imprensa: -3, pressao: 5 } }) },
  { id: "briga-torcida", peso: 1.2, bom: false, quando: (c) => c.jogou && c.resultado === "derrota" && c.classico, faz: (c) => ({ bom: false, titulo: "Cobrança na saída do estádio", texto: `Depois da derrota no clássico, torcedores cercaram o ônibus do ${c.clube}. Teve pedra no vidro.`, ef: { moral: -5, pressao: 6, torcida: -2 } }) },
  { id: "lesao-treino", peso: 1.5, bom: false, quando: (c) => c.profissional, faz: () => ({ bom: false, titulo: "Pancada no treino", texto: "Uma dividida no coletivo e o tornozelo inchou. Nada grave, mas fica de fora uns dias.", ef: { lesao: 1, moral: -2, desgaste: 2 } }) },
  { id: "imposto", peso: 0.8, bom: false, quando: (c) => c.saldo > 1e6, faz: (c) => ({ bom: false, titulo: "Malha fina", texto: "O contador errou uma declaração antiga. Multa e imposto atrasado.", ef: { dinheiro: -Math.min(c.saldo * 0.03, 400000), moral: -3 } }) },
  // ------------------------------------------------------------ com escolha, bom ou ruim conforme a escolha
  { id: "proposta-tv", peso: 1, bom: true, quando: (c) => c.fama >= 40, faz: (c, _r, a) => agendar(a, c.ab, { origem: "acontece", chave: "reality", titulo: "Participação num quadro de TV", texto: "Um programa de domingo quer você num quadro de culinária com celebridades. Gravação na sua folga.", opcoes: [
    op("aceitar", "Aceitar", `Você queimou o arroz e ganhou o público. Cachê de ${reais(Math.max(30000, c.salario * 0.3))}.`, { dinheiro: Math.max(30000, c.salario * 0.3), fama: 1, cansaco: 6, engajamento: 6 }),
    op("recusar", "Recusar: folga é folga", "Descansou de verdade.", { cansaco: -4 }),
  ] }, 60) ? "agenda" : undefined },
  { id: "crianca-doente", peso: 0.8, bom: true, quando: (c) => c.fama >= 30, faz: (c, _r, a) => agendar(a, c.ab, { origem: "acontece", chave: "visita-hospital", titulo: "Pedido de um fã no hospital", texto: "A mãe de um menino internado escreveu: o sonho dele é conhecer você antes da cirurgia.", opcoes: [
    op("visitar", "Ir até o hospital", "Uma tarde com ele e uma camisa autografada. A cirurgia deu certo.", { moral: 6, torcida: 3, imprensa: 4, cansaco: 3 }),
    op("video", "Mandar um vídeo", "O vídeo chegou e ele assistiu vinte vezes.", { moral: 2, torcida: 1 }),
  ] }, 60) ? "agenda" : undefined },
];

/** A semana: às vezes acontece alguma coisa. Devolve o que aconteceu direto (o resto foi para a agenda). */
export function semanaAcontecimentos(a: EstadoAgenda, rng: RNG, c: CtxAcontece, vistos: Record<string, number>): Acontecido | undefined {
  if (!rng.chance(0.3)) return undefined;
  const pool = M.filter((m) => m.quando(c) && !(vistos[m.id] !== undefined && c.ab - vistos[m.id] < 30));
  if (!pool.length) return undefined;
  // vida boa puxa mais coisa boa; fase ruim, mais coisa ruim
  const pesos = pool.map((m) => m.peso * (m.bom ? (c.temporadaBoa ? 1.3 : 0.9) : (c.temporadaBoa ? 0.8 : 1.2)));
  let x = rng.next() * pesos.reduce((s, p) => s + p, 0), esc = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) { x -= pesos[i]; if (x <= 0) { esc = pool[i]; break; } }
  const r = esc.faz(c, rng, a);
  if (!r) return undefined;
  vistos[esc.id] = c.ab;
  return r === "agenda" ? undefined : r;
}
