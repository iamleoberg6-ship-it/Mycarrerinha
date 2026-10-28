// Banco de agentes: 40 agentes de níveis e países diferentes. A família ("pai") é o começo da carreira e fica fora do banco.
// O alcance vem do país do agente: ele conhece melhor o mercado de casa e dos vizinhos (ver mercado.ts).
// Módulo sem imports, para o mercado e o agente poderem usar os mesmos números sem ciclo.
export type TipoAgente = string;
export const FAMILIA = "pai";

export interface AgenteBanco { id: string; nome: string; pais: string; nivel: number; estilo: string; frase: string }

export const BANCO: AgenteBanco[] = [
  { id: "ag01", nome: "Rafael Quiroga", pais: "URU", nivel: 1, estilo: "paciente", frase: "Conheço os clubes de Montevidéu e do interior. Fora disso, não tenho portas." },
  { id: "ag02", nome: "Tomás Benavídez", pais: "PAR", nivel: 1, estilo: "cordial", frase: "Ponho você nos clubes da região. Os grandes ficam para outro agente." },
  { id: "ag03", nome: "Diego Ruiz Moncada", pais: "ECU", nivel: 1, estilo: "duro", frase: "Sou pequeno, mas cumpro o que prometo nos clubes que conheço." },
  { id: "ag04", nome: "Bruno Almeida Sá", pais: "POR", nivel: 1, estilo: "cordial", frase: "Conheço o futebol regional de Portugal, e os clubes de bairro me devem favores." },
  { id: "ag05", nome: "Lucas Ferreira Dantas", pais: "BRA", nivel: 1, estilo: "agressivo", frase: "Começo pequeno, mas tenho contatos em todo o estado." },
  { id: "ag06", nome: "Ivo Marchetti", pais: "CHI", nivel: 1, estilo: "paciente", frase: "Os clubes do Chile me conhecem. Mais que isso, eu não garanto." },
  { id: "ag07", nome: "Zoran Peric", pais: "CRO", nivel: 1, estilo: "duro", frase: "Clubes pequenos da Croácia, e um sorriso quando o jogador merece." },
  { id: "ag08", nome: "Youssef Haddad", pais: "MAR", nivel: 1, estilo: "cordial", frase: "Conheço os clubes do Marrocos que procuram talento jovem." },
  { id: "ag09", nome: "Miguel Ortega", pais: "COL", nivel: 1, estilo: "agressivo", frase: "Ponho você onde tem vaga. Não espere milagres." },
  { id: "ag10", nome: "Gilberto Pinheiro", pais: "BRA", nivel: 1, estilo: "paciente", frase: "Seu nome circula nas divisões de baixo. Vamos construir daí." },
  { id: "ag11", nome: "Hernán Vidal", pais: "ARG", nivel: 2, estilo: "analítico", frase: "Conheço o mercado argentino de ponta a ponta. Falo com quem decide." },
  { id: "ag12", nome: "Marcelo Quintas", pais: "BRA", nivel: 2, estilo: "cordial", frase: "Tenho portas no Brasil inteiro, menos as dos grandes." },
  { id: "ag13", nome: "Duarte Lopes", pais: "POR", nivel: 2, estilo: "paciente", frase: "Portugal é meu quintal. Os clubes de cima me atendem." },
  { id: "ag14", nome: "Sérgio Mendonça", pais: "BRA", nivel: 2, estilo: "duro", frase: "Negocio no Brasil e não aceito salário de vitrine." },
  { id: "ag15", nome: "Kamal Nasser", pais: "EGY", nivel: 2, estilo: "cordial", frase: "O Egito e o Golfo me conhecem. Tenho um bom nome nas duas pontas." },
  { id: "ag16", nome: "Felipe Arrieta", pais: "COL", nivel: 2, estilo: "agressivo", frase: "A Colômbia é minha. Você sobe com meu nome na frente." },
  { id: "ag17", nome: "Rui Cardoso Neves", pais: "POR", nivel: 2, estilo: "analítico", frase: "Gosto de contrato bem escrito. Cláusula boa vale mais que luva." },
  { id: "ag18", nome: "Nikola Vuković", pais: "CRO", nivel: 2, estilo: "paciente", frase: "Minha rede é da Croácia e dos vizinhos. Tenho paciência para você crescer." },
  { id: "ag19", nome: "Carlos Velasco", pais: "ESP", nivel: 2, estilo: "cordial", frase: "A Espanha tem muitos clubes. Eu conheço os de segunda, e conheço gente." },
  { id: "ag20", nome: "Tiago Abreu", pais: "BRA", nivel: 2, estilo: "agressivo", frase: "Quero fechar rápido. O clube que pagar bem leva você." },
  { id: "ag21", nome: "Márcia Valente", pais: "BRA", nivel: 3, estilo: "analítico", frase: "Abro portas no país inteiro, inclusive nos grandes. Negocio com calma." },
  { id: "ag22", nome: "Gustavo Ribas", pais: "ARG", nivel: 3, estilo: "duro", frase: "Argentina e vizinhos. Não saio da mesa sem o melhor contrato." },
  { id: "ag23", nome: "Ramón Ibarra", pais: "ESP", nivel: 3, estilo: "cordial", frase: "Espanha e Portugal me conhecem. Vou atrás do clube certo." },
  { id: "ag24", nome: "Lorenzo Bianchi", pais: "ITA", nivel: 3, estilo: "carismático", frase: "Itália e França: sei onde tem vaga e quem paga bem." },
  { id: "ag25", nome: "Jonas Brandt", pais: "GER", nivel: 3, estilo: "analítico", frase: "Alemanha e os vizinhos. Planilha na mão, sempre." },
  { id: "ag26", nome: "Mehmet Aydin", pais: "TUR", nivel: 3, estilo: "agressivo", frase: "A Turquia é difícil, e eu também. Consigo luvas boas." },
  { id: "ag27", nome: "Hugo Serrano", pais: "MEX", nivel: 3, estilo: "carismático", frase: "México e Estados Unidos: tenho contatos dos dois lados." },
  { id: "ag28", nome: "Daniel Okafor", pais: "ENG", nivel: 3, estilo: "paciente", frase: "A Inglaterra me conhece. Gosto de jogador que cresce." },
  { id: "ag29", nome: "Sofia Duarte", pais: "POR", nivel: 3, estilo: "analítico", frase: "Portugal e Espanha. Tudo que eu negocio tem número por trás." },
  { id: "ag30", nome: "Tadashi Mori", pais: "JPN", nivel: 3, estilo: "paciente", frase: "Japão e Coreia. Respeito e paciência fecham o contrato." },
  { id: "ag31", nome: "Vinícius Carrara", pais: "BRA", nivel: 4, estilo: "carismático", frase: "Brasil e vizinhos, com porta aberta para os grandes da Europa." },
  { id: "ag32", nome: "Pierre Lemaire", pais: "FRA", nivel: 4, estilo: "duro", frase: "França, Itália e Alemanha. Ninguém paga mais do que eu consigo." },
  { id: "ag33", nome: "Mauricio Sáenz", pais: "ARG", nivel: 4, estilo: "agressivo", frase: "Minha rede vai da Argentina ao Oriente Médio." },
  { id: "ag34", nome: "Erik Vandeberg", pais: "NED", nivel: 4, estilo: "analítico", frase: "Holanda e vizinhos. Olho para a base antes de todo mundo." },
  { id: "ag35", nome: "Ricardo Flores", pais: "USA", nivel: 4, estilo: "carismático", frase: "Estados Unidos e México. Vendo você como marca, não só como jogador." },
  { id: "ag36", nome: "Samuel Kim", pais: "KOR", nivel: 4, estilo: "paciente", frase: "Coreia e Japão. Cuido de cada detalhe do contrato." },
  { id: "ag37", nome: "Vítor Alencar", pais: "BRA", nivel: 5, estilo: "duro", frase: "Falo com qualquer clube do mundo. Quem quer você paga o meu preço." },
  { id: "ag38", nome: "Ana Beatriz Prado", pais: "ESP", nivel: 5, estilo: "analítico", frase: "Conheço a Europa inteira e a América do Sul. Você joga onde eu decidir." },
  { id: "ag39", nome: "Oliver Hartmann", pais: "GER", nivel: 5, estilo: "agressivo", frase: "Os grandes clubes atendem o meu telefone. Sempre." },
  { id: "ag40", nome: "Julien Marsh", pais: "ENG", nivel: 5, estilo: "carismático", frase: "Mundo inteiro. Só aceito o jogador que vai brilhar." },
];

/** Comissão de referência por nível (fração do salário e das luvas). O agente negocia a partir dela. */
const COMISSAO_NIVEL = [0, 0.04, 0.05, 0.08, 0.09, 0.1];
const BONUS_NIVEL = [0, 0, 0.02, 0.1, 0.15, 0.2];
const HABILIDADE_NIVEL = [0, 0.05, 0.1, 0.2, 0.25, 0.3];
const REQ_FAMA = [0, 0, 0, 12, 20, 30];
const REQ_OVR = [0, 0, 0, 64, 68, 72];
/** Quantas propostas o agente traz (multiplicador do interesse dos clubes). */
const ALCANCE_NIVEL = [0, 1, 1, 1.5, 1.8, 2];

export interface PerfilAgente { comissao: number; bonus: number; habilidade: number; alcance: number; nivel: number; pais: string | null; requisito: { fama: number; ovr: number } }

export const agenteDoBanco = (t: TipoAgente) => BANCO.find((a) => a.id === t);
export const nivelDoAgente = (t: TipoAgente) => t === FAMILIA ? 0 : agenteDoBanco(t)?.nivel ?? 1;

/** Perfil fixo de um agente (sem a comissão negociada). A família não cobra e não tem requisito. O nível dá o acesso; cada tópico vem das estrelas dele. */
export function perfilAgente(t: TipoAgente): PerfilAgente {
  if (t === FAMILIA) return { comissao: 0, bonus: -0.1, habilidade: 0, alcance: 1, nivel: 0, pais: null, requisito: { fama: 0, ovr: 0 } };
  const a = agenteDoBanco(t) ?? BANCO[0], st = habilidadesDoAgente(a.id);
  return { comissao: COMISSAO_NIVEL[a.nivel], bonus: BONUS_NIVEL[a.nivel], habilidade: HABILIDADE_NIVEL[st.negociacao], alcance: ALCANCE_NIVEL[st.rede], nivel: a.nivel, pais: a.pais, requisito: { fama: REQ_FAMA[a.nivel], ovr: REQ_OVR[a.nivel] } };
}
/** Comissão que vale: a negociada, se houver; senão a de referência do agente. */
export const comissaoDo = (t: TipoAgente, acordada?: number) => t === FAMILIA ? 0 : acordada ?? perfilAgente(t).comissao;

/** Agentes com id de referência para a simulação de fundo (carreira headless). */
export const AGENTE_INICIAL = "ag05", AGENTE_MEDIO = "ag21", AGENTE_TOP = "ag37";
const hashId = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** Estrelas (1 a 5) de cada tópico. Cada agente tem a sua combinação: em alguns tópicos ele é bom, em outros nem tanto. Uma minoria é igual em tudo (o próprio nível). */
export function habilidadesDoAgente(id: string): { negociacao: number; rede: number; salario: number } {
  const a = agenteDoBanco(id);
  if (!a) return { negociacao: 1, rede: 1, salario: 1 };
  const h = hashId(id);
  const nota = (topico: string) => (h % 5 === 0 ? a.nivel : Math.min(5, Math.max(1, a.nivel + (hashId(`${id}|${topico}`) % 5) - 2)));
  return { negociacao: nota("negociacao"), rede: nota("rede"), salario: nota("salario") };
}
/** Saves antigos: os quatro agentes fixos viram agentes do banco. */
export const AGENTE_LEGADO: Record<string, string> = { iniciante: AGENTE_INICIAL, experiente: AGENTE_MEDIO, top: AGENTE_TOP };
