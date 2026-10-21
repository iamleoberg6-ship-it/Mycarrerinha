// Perfil de craque e estilo de jogo, definidos depois da criação a partir do DNA.
// Cada perfil dá efeitos iniciais e, em alguns casos, a primeira decisão da carreira.
import { type Atributo, ATRIBUTOS, peso } from "./atributos.js";
import type { ResultadoCriacao, TracoId } from "./dna.js";
import type { TipoAgente } from "./mercado.js";

export type PerfilId = "joia_rara" | "promessa_base" | "viral" | "diamante_bruto" | "batalhador" | "lapidado" | "sonhador";

export interface Efeitos {
  fama?: number;
  seguidores?: number;
  patrocinioMensal?: number; // R$ por mês
  mesesPatrocinio?: number;
  vidaNoturna?: number; // eixo de estilo de vida (0–100)
  exposicao?: number; // eixo de estilo de vida (0–100)
  profissionalismo?: number; // ajuste no traço oculto
  relTecnico?: number;
  agente?: TipoAgente;
  bonusEvolucao?: number; // multiplicador extra na evolução semanal (ex.: 0.05 = +5%)
  forcaMinimaClubeInicial?: number; // base de clube grande
  pressao?: number; // 0–100: expectativa da imprensa e da torcida
}

export interface OpcaoEvento { id: string; rotulo: string; resultado: string; efeitos: Efeitos }
export interface EventoInicial { remetente: string; titulo: string; texto: string; opcoes: OpcaoEvento[] }
export interface PerfilCraque { id: PerfilId; nome: string; descricao: string; efeitos: Efeitos; evento?: EventoInicial }

export const MARCA_CHUTEIRA = "Vortex";

const DRIBLADORES: TracoId[] = ["ginga", "bicicleta", "drible_curto"];

export function definirPerfil(r: ResultadoCriacao): PerfilCraque {
  const e = r.escolhas, p = r.personalidade;
  const potTopo = r.faixaPotencial[1];

  if (r.potencial >= 84) {
    return {
      id: "joia_rara", nome: "Joia rara",
      descricao: "Os olheiros falam de você em voz baixa, como quem esconde um segredo. Antes de assinar o primeiro contrato, uma marca já bateu na porta.",
      efeitos: { fama: 15, seguidores: 60000, pressao: 40 },
      evento: {
        remetente: `${MARCA_CHUTEIRA} Brasil`, titulo: "Proposta de contrato de chuteira",
        texto: `A ${MARCA_CHUTEIRA} quer assinar com você por 3 anos: R$ 4.000 por mês, chuteiras exclusivas e uma sessão de fotos. Em troca, você vira o rosto da nova linha de base da marca.`,
        opcoes: [
          { id: "aceitar", rotulo: "Assinar com a marca", resultado: "Contrato assinado. Seu rosto vai estar em outdoor antes do primeiro jogo profissional.", efeitos: { patrocinioMensal: 4000, mesesPatrocinio: 36, fama: 8, seguidores: 90000, pressao: 20, exposicao: 15 } },
          { id: "recusar", rotulo: "Recusar e focar no futebol", resultado: "Seu pai achou cedo demais. A marca disse que a porta continua aberta.", efeitos: { profissionalismo: 1, pressao: -10 } },
        ],
      },
    };
  }
  if (r.formacaoFinal === "base_grande") {
    return {
      id: "promessa_base", nome: "Promessa da base",
      descricao: "Passou na peneira de um gigante e cresceu dentro do CT. O técnico do sub-17 já sabe seu nome.",
      efeitos: { fama: 5, seguidores: 8000, relTecnico: 10, forcaMinimaClubeInicial: 72 },
      evento: { remetente: "Técnico do sub-17", titulo: "Recado do técnico", texto: "Aqui ninguém tem lugar garantido. Mostra no treino o que você mostrou na peneira.", opcoes: [] },
    };
  }
  if (p.carisma >= 14 && r.tracos.some((t) => DRIBLADORES.includes(t))) {
    return {
      id: "viral", nome: "Craque viral",
      descricao: "Um drible seu no campinho foi filmado por um amigo e rodou o país. Agora todo mundo quer saber quem é o garoto do vídeo.",
      efeitos: { fama: 8, seguidores: 40000, exposicao: 20 },
      evento: {
        remetente: "Seu amigo que filmou", titulo: "O vídeo passou de 2 milhões de visualizações",
        texto: "Tem página de futebol pedindo mais vídeo seu. Dá pra crescer muito nas redes. Bora gravar mais?",
        opcoes: [
          { id: "gravar", rotulo: "Gravar mais vídeos", resultado: "Os vídeos explodiram. Seguidores chegando aos milhares por dia, e o técnico da base de cara feia.", efeitos: { seguidores: 260000, fama: 6, exposicao: 20, relTecnico: -5 } },
          { id: "quieto", rotulo: "Deixar o vídeo falar sozinho", resultado: "Você não postou mais nada. A fama esfriou, mas o técnico gostou da postura.", efeitos: { relTecnico: 5, profissionalismo: 1 } },
        ],
      },
    };
  }
  if (["rua", "praia", "futsal"].includes(r.formacaoFinal) && r.potencial >= 76 && p.profissionalismo <= 9) {
    return {
      id: "diamante_bruto", nome: "Diamante bruto",
      descricao: "Talento que não se ensina, disciplina que ainda não chegou. Se alguém lapidar, sai craque.",
      efeitos: { vidaNoturna: 10, fama: 3 },
      evento: {
        remetente: "Grupo dos amigos do bairro", titulo: "Baile no sábado",
        texto: "Sábado tem baile na quadra, todo mundo vai. Domingo cedo tem avaliação na base.",
        opcoes: [
          { id: "ir", rotulo: "Ir ao baile", resultado: "Noite boa, manhã difícil. A avaliação foi fraca e o preparador anotou seu nome.", efeitos: { vidaNoturna: 10, relTecnico: -8 } },
          { id: "ficar", rotulo: "Ficar em casa", resultado: "Você chegou inteiro na avaliação e foi o melhor do dia.", efeitos: { profissionalismo: 2, relTecnico: 6 } },
        ],
      },
    };
  }
  if (e.familia === "humilde" && p.profissionalismo >= 12) {
    return {
      id: "batalhador", nome: "Batalhador",
      descricao: "Ninguém aposta em você. Melhor: assim ninguém espera, e você chega antes de todo mundo no treino.",
      efeitos: { bonusEvolucao: 0.05 },
      evento: { remetente: "Pai", titulo: "Mensagem do pai", texto: "Fiz hora extra o mês todo e comprei a chuteira que você queria. Agora é com você, filho.", opcoes: [] },
    };
  }
  if ((r.formacaoFinal === "academia" || r.formacaoFinal === "escolinha") && potTopo >= 74) {
    return {
      id: "lapidado", nome: "Talento lapidado",
      descricao: "Fundamento limpo e cabeça no lugar. Os empresários começaram a aparecer nos jogos da base.",
      efeitos: { fama: 2 },
      evento: {
        remetente: "Empresário de jogadores", titulo: "Proposta de representação",
        texto: "Vi seus jogos. Quero te representar: cuido da carreira e fico com 5% do que você ganhar. Seu pai pode continuar perto.",
        opcoes: [
          { id: "assinar", rotulo: "Assinar com o empresário", resultado: "Agora você tem um agente profissional. Mais portas, mas parte do salário fica com ele.", efeitos: { agente: "iniciante" } },
          { id: "pai", rotulo: "Continuar com o pai", resultado: "Seu pai segue cuidando de tudo. Sem comissão, com menos contatos.", efeitos: {} },
        ],
      },
    };
  }
  return {
    id: "sonhador", nome: "Sonhador",
    descricao: "Ninguém te conhece ainda. Cada treino é uma chance de mudar isso.",
    efeitos: {},
  };
}

const ADJETIVO: Record<Atributo, string> = {
  VEL: "velocista", RES: "incansável", FOR: "de força", PAS: "armador", CRU: "cruzador", DRI: "driblador",
  FIN: "finalizador", CAB: "cabeceador", MAR: "marcador", VIS: "cerebral", POS: "posicional", COM: "frio",
};
const NOME_POS: Record<string, string> = { ZAG: "Zagueiro", LAT: "Lateral", VOL: "Volante", MEI: "Meia", PON: "Ponta", ATA: "Centroavante" };

/** Estilo de jogo: o atributo que mais se destaca, ponderado pela importância na posição. */
export function estiloDeJogo(r: ResultadoCriacao): { rotulo: string; destaque: Atributo } {
  const pos = r.escolhas.posicao;
  const destaque = [...ATRIBUTOS].sort((a, b) => (r.atributos[b] + 2 * peso(pos, b)) - (r.atributos[a] + 2 * peso(pos, a)))[0];
  return { rotulo: `${NOME_POS[pos]} ${ADJETIVO[destaque]}`, destaque };
}
