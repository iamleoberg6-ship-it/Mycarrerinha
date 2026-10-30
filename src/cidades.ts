import { curtoBrl } from "./moeda.js";
// Cidade onde o jogador mora (a do clube): clima, custo de vida, vida noturna, praia e perigo. Mexe no custo do mês,
// na noite, no humor no inverno de quem veio de país quente, e traz momentos próprios (conhecer a cidade, festa típica,
// a primeira neve, o trânsito).
import { RNG } from "./rng.js";
import { agendar, type EstadoAgenda, type OpcaoOcasiao, type EfeitoVida } from "./agenda.js";

const op = (id: string, rotulo: string, texto: string, ef: EfeitoVida, risco?: OpcaoOcasiao["risco"]): OpcaoOcasiao => ({ id, rotulo, texto, ef, ...(risco ? { risco } : {}) });

export type Clima = "tropical" | "quente" | "temperado" | "frio" | "deserto";
export const NOME_CLIMA: Record<Clima, string> = { tropical: "Tropical", quente: "Quente", temperado: "Temperado", frio: "Frio, com neve no inverno", deserto: "Desértico" };
export interface PerfilCidade {
  nome: string; clima: Clima;
  /** custo de vida em relação à média do país (0,7 a 1,8) */
  custo: number;
  /** 0 a 3 */ noite: number; praia: boolean;
  /** 0 a 2: assalto, assédio na rua */ perigo: number;
  /** trânsito pesado (atraso no treino) */ transito: boolean;
  descricao: string; pontos: string[];
  /** festa típica e as semanas da temporada em que acontece */
  festa?: { nome: string; semanas: [number, number] };
}
type Base = Omit<PerfilCidade, "nome" | "descricao" | "pontos"> & { pontos?: string[]; descricao?: string };
const PAIS: Record<string, Base> = {
  BRA: { clima: "tropical", custo: 1, noite: 2, praia: false, perigo: 1, transito: false, festa: { nome: "Festa junina", semanas: [22, 25] } },
  ARG: { clima: "temperado", custo: 0.8, noite: 2, praia: false, perigo: 1, transito: false, festa: { nome: "Asado do bairro", semanas: [10, 12] } },
  ENG: { clima: "frio", custo: 1.3, noite: 2, praia: false, perigo: 0, transito: false, festa: { nome: "Boxing Day", semanas: [19, 20] } },
  ESP: { clima: "quente", custo: 1.1, noite: 3, praia: false, perigo: 0, transito: false, festa: { nome: "Festa da cidade", semanas: [30, 32] } },
  ITA: { clima: "temperado", custo: 1.1, noite: 2, praia: false, perigo: 0, transito: false, festa: { nome: "Festa do padroeiro", semanas: [32, 34] } },
  GER: { clima: "frio", custo: 1.1, noite: 2, praia: false, perigo: 0, transito: false, festa: { nome: "Festa da cerveja", semanas: [6, 8] } },
  FRA: { clima: "temperado", custo: 1.2, noite: 2, praia: false, perigo: 0, transito: false, festa: { nome: "Festa da música", semanas: [38, 39] } },
  POR: { clima: "quente", custo: 0.9, noite: 2, praia: true, perigo: 0, transito: false, festa: { nome: "Santos Populares", semanas: [38, 39] } },
  NED: { clima: "frio", custo: 1.2, noite: 2, praia: false, perigo: 0, transito: false, festa: { nome: "Dia do Rei", semanas: [33, 34] } },
  KSA: { clima: "deserto", custo: 1.1, noite: 0, praia: false, perigo: 0, transito: true, festa: { nome: "Temporada de Riad", semanas: [12, 16] } },
  USA: { clima: "temperado", custo: 1.4, noite: 2, praia: false, perigo: 1, transito: true, festa: { nome: "Quatro de Julho", semanas: [24, 25] } },
};
const CIDADES: Record<string, Partial<PerfilCidade>> = {
  "São Paulo": { custo: 1.5, noite: 3, transito: true, perigo: 1, clima: "quente", descricao: "A cidade que nunca para: restaurante de todo lugar do mundo e trânsito de quatro horas.", pontos: ["Avenida Paulista", "Mercadão", "Parque Ibirapuera"] },
  "Rio de Janeiro": { custo: 1.4, noite: 3, praia: true, perigo: 2, transito: true, descricao: "Praia, samba e calor. A noite carioca já derrubou muito jogador bom.", pontos: ["Cristo Redentor", "Praia de Ipanema", "Lapa"], festa: { nome: "Réveillon em Copacabana", semanas: [0, 1] } },
  "Belo Horizonte": { custo: 1.1, noite: 3, clima: "quente", descricao: "A capital dos bares: pão de queijo de manhã, boteco à noite.", pontos: ["Mercado Central", "Lagoa da Pampulha", "Praça da Liberdade"] },
  "Porto Alegre": { custo: 1.1, clima: "temperado", noite: 2, descricao: "Chimarrão, churrasco e um inverno que pega quem vem do Nordeste desprevenido.", pontos: ["Orla do Guaíba", "Mercado Público", "Parque da Redenção"] },
  Curitiba: { custo: 1.1, clima: "temperado", noite: 1, perigo: 0, descricao: "Organizada, fria e cheia de parques.", pontos: ["Jardim Botânico", "Ópera de Arame", "Rua XV"] },
  Salvador: { custo: 0.9, praia: true, noite: 3, descricao: "Axé, acarajé e a praia logo ali.", pontos: ["Pelourinho", "Farol da Barra", "Mercado Modelo"], festa: { nome: "Carnaval de Salvador", semanas: [5, 7] } },
  Recife: { custo: 0.9, praia: true, noite: 3, descricao: "Frevo, praia de Boa Viagem e muita resenha.", pontos: ["Recife Antigo", "Boa Viagem", "Olinda"], festa: { nome: "Carnaval de Olinda", semanas: [5, 7] } },
  Fortaleza: { custo: 0.9, praia: true, noite: 3, descricao: "Sol o ano inteiro, praia e forró.", pontos: ["Beira-Mar", "Praia do Futuro", "Dragão do Mar"] },
  "Florianópolis": { custo: 1.2, praia: true, perigo: 0, clima: "temperado", descricao: "Ilha de praias e de surfista. Jogador gosta, técnico desconfia.", pontos: ["Lagoa da Conceição", "Jurerê", "Ponte Hercílio Luz"] },
  Santos: { praia: true }, Natal: { praia: true }, "Maceió": { praia: true }, "João Pessoa": { praia: true }, "Vitória": { praia: true }, "Aracaju": { praia: true }, "São Luís": { praia: true }, "Balneário Camboriú": { praia: true, noite: 3, custo: 1.4 },
  Manaus: { clima: "tropical", descricao: "Calor úmido, o encontro das águas e a floresta na porta.", pontos: ["Teatro Amazonas", "Encontro das Águas", "Ponta Negra"] },
  London: { custo: 1.8, noite: 3, transito: true, descricao: "A capital do futebol: metrô lotado, chuva fina e um clube em cada bairro.", pontos: ["Big Ben", "Camden Town", "Hyde Park"] },
  Manchester: { custo: 1.2, noite: 2, descricao: "Chuva, música e futebol 24 horas por dia.", pontos: ["Northern Quarter", "Museu do Futebol", "Deansgate"] },
  Liverpool: { custo: 1.1, noite: 3, descricao: "Porto, música e uma paixão por futebol que assusta.", pontos: ["Albert Dock", "Cavern Club", "Pier Head"] },
  Madrid: { custo: 1.4, noite: 3, clima: "quente", descricao: "Jantar às onze da noite, sol no inverno e pressão de clube gigante.", pontos: ["Puerta del Sol", "Parque do Retiro", "Gran Vía"], festa: { nome: "Festa de San Isidro", semanas: [36, 37] } },
  Barcelona: { custo: 1.4, noite: 3, praia: true, clima: "quente", descricao: "Praia, Gaudí e turista por todo lado.", pontos: ["Sagrada Família", "Barceloneta", "Parque Güell"], festa: { nome: "La Mercè", semanas: [6, 7] } },
  Sevilla: { clima: "quente", noite: 3, descricao: "Calor de quarenta graus e flamenco na rua.", pontos: ["Catedral", "Praça de Espanha", "Triana"], festa: { nome: "Feria de Abril", semanas: [33, 34] } },
  Valencia: { praia: true, noite: 3, pontos: ["Cidade das Artes", "Praia da Malvarrosa", "Mercado Central"], festa: { nome: "Las Fallas", semanas: [29, 30] } },
  Milano: { custo: 1.5, noite: 3, descricao: "Moda, negócios e dois gigantes no mesmo estádio.", pontos: ["Duomo", "Navigli", "Galeria Vittorio Emanuele"] },
  Roma: { custo: 1.3, noite: 3, transito: true, clima: "quente", descricao: "Três mil anos de história e um clássico que para a cidade.", pontos: ["Coliseu", "Fontana di Trevi", "Trastevere"] },
  Napoli: { custo: 0.9, noite: 3, perigo: 1, praia: true, clima: "quente", descricao: "Pizza, mar e uma devoção quase religiosa ao futebol.", pontos: ["Vesúvio", "Spaccanapoli", "Lungomare"] },
  Torino: { pontos: ["Mole Antonelliana", "Piazza Castello", "Parco del Valentino"] },
  Paris: { custo: 1.7, noite: 3, transito: true, descricao: "A cidade-luz: tudo caro, tudo bonito.", pontos: ["Torre Eiffel", "Champs-Élysées", "Montmartre"] },
  Marseille: { clima: "quente", praia: true, noite: 2, perigo: 1, pontos: ["Vieux-Port", "Notre-Dame de la Garde", "Calanques"] },
  Monaco: { custo: 1.8, praia: true, clima: "quente", noite: 3, perigo: 0, descricao: "Iates, cassino e imposto camarada.", pontos: ["Cassino de Monte Carlo", "Porto Hércules", "Palácio do Príncipe"] },
  Nice: { praia: true, clima: "quente", pontos: ["Promenade des Anglais", "Cidade Velha", "Colline du Château"] },
  "München": { custo: 1.4, pontos: ["Marienplatz", "Englischer Garten", "Allianz Arena"], festa: { nome: "Oktoberfest", semanas: [7, 9] } },
  Berlin: { custo: 1.2, noite: 3, pontos: ["Portão de Brandemburgo", "Muro de Berlim", "Kreuzberg"] },
  Dortmund: { pontos: ["Muralha Amarela", "Museu do Futebol Alemão", "Westfalenpark"] },
  Lisboa: { custo: 1.1, noite: 3, praia: true, descricao: "Ladeiras, bacalhau e um sotaque que o brasileiro entende quase tudo.", pontos: ["Belém", "Alfama", "Bairro Alto"] },
  Porto: { praia: true, pontos: ["Ribeira", "Ponte Dom Luís I", "Livraria Lello"], festa: { nome: "São João do Porto", semanas: [38, 39] } },
  Amsterdam: { custo: 1.5, noite: 3, descricao: "Bicicleta, canal e muita liberdade. Cuidado com ela.", pontos: ["Canais", "Museu Van Gogh", "Vondelpark"] },
  Riyadh: { custo: 1.2, descricao: "Arranha-céus no deserto, salário sem imposto e calor de cinquenta graus.", pontos: ["Kingdom Tower", "Boulevard", "Diriyah"] },
  Jeddah: { praia: true, pontos: ["Corniche", "Al-Balad", "Fonte do Rei Fahd"] },
  "Buenos Aires": { custo: 0.9, noite: 3, transito: true, descricao: "Tango, parrilla e a torcida mais barulhenta do mundo.", pontos: ["La Boca", "Palermo", "San Telmo"] },
  Miami: { custo: 1.6, noite: 3, praia: true, clima: "tropical", descricao: "Praia, festa e brasileiro em todo lugar.", pontos: ["South Beach", "Wynwood", "Little Havana"] },
  "Los Angeles": { custo: 1.7, noite: 3, praia: true, clima: "quente", transito: true, descricao: "Hollywood, sol e engarrafamento.", pontos: ["Hollywood", "Santa Monica", "Venice Beach"] },
  "New York": { custo: 1.9, noite: 3, transito: true, descricao: "Tudo acontece aqui, e tudo custa o dobro.", pontos: ["Times Square", "Central Park", "Brooklyn"] },
  Toronto: { clima: "frio" }, Montreal: { clima: "frio" }, Chicago: { clima: "frio" }, Vancouver: { clima: "temperado" },
};
const PRAIA_RE = /praia|mar|beach/i;

/** O perfil da cidade (o país dá o padrão; as cidades conhecidas têm o seu). */
export function perfilCidade(nome: string, pais: string): PerfilCidade {
  const b = PAIS[pais] ?? PAIS.BRA, x = CIDADES[nome] ?? {};
  const praia = x.praia ?? (b.praia || PRAIA_RE.test(nome));
  const p: PerfilCidade = {
    nome, clima: x.clima ?? b.clima, custo: x.custo ?? b.custo, noite: x.noite ?? b.noite, praia, perigo: x.perigo ?? b.perigo, transito: x.transito ?? b.transito,
    festa: x.festa ?? b.festa,
    descricao: x.descricao ?? (pais === "BRA" ? "Cidade de futebol: no mercado, na padaria e no ponto de ônibus, todo mundo comenta o jogo." : "Vida nova, língua nova, comida nova."),
    pontos: x.pontos ?? ["O centro histórico", praia ? "A praia" : "O parque da cidade", "O estádio vazio de noite"],
  };
  return p;
}
const PAISES_QUENTES = new Set(["BRA", "ARG", "URU", "COL", "MEX", "SEN", "NGA", "CMR", "CIV", "GHA", "ECU", "PAR", "VEN", "KSA", "EGY", "MAR", "POR", "ESP"]);
const INVERNO_NORTE: [number, number] = [16, 28], INVERNO_SUL: [number, number] = [20, 30];
export const inverno = (pais: string, semana: number) => { const [a, b] = ["BRA", "ARG", "URU", "CHI", "PAR"].includes(pais) ? INVERNO_SUL : INVERNO_NORTE; return semana >= a && semana <= b; };

export interface EstadoCidade { nome: string; pais: string; desde: number; conheceu?: boolean; visitadas: string[]; neve?: boolean }
export interface CtxCidade { ab: number; semana: number; ano: number; nacionalidade: string; apelido: string; fama: number; salario: number; motorista: boolean }
export interface EfeitoCidade { moral: number; vidaNoturna: number; cansaco: number; relTecnico: number; avisos: string[] }

/** Semana na cidade: efeitos do clima e da noite; momentos (conhecer, festa, neve, praia, trânsito). */
export function semanaCidade(e: EstadoCidade, p: PerfilCidade, a: EstadoAgenda, rng: RNG, c: CtxCidade): EfeitoCidade {
  const ef: EfeitoCidade = { moral: 0, vidaNoturna: 0.08 * p.noite, cansaco: 0, relTecnico: 0, avisos: [] };
  const semanasAqui = c.ab - e.desde, quente = PAISES_QUENTES.has(c.nacionalidade), inv = inverno(e.pais, c.semana);
  if (inv && p.clima === "frio" && quente) ef.moral -= semanasAqui < 45 ? 0.6 : 0.2;
  if (p.praia && !inv) ef.moral += 0.2;
  if (!e.conheceu && semanasAqui <= 6) agendar(a, c.ab, { origem: "cidade", chave: `conhecer-${p.nome}`, titulo: `Conhecer ${p.nome}`, texto: `${p.descricao} No dia de folga, dá para conhecer: ${p.pontos.join(", ")}.`, prazo: 4, opcoes: [
    op("tour", "Fazer o roteiro", `Fotos em ${p.pontos[0]}, comida local e a sensação de que essa cidade pode ser casa.`, { moral: 3, adaptacao: 6, cansaco: 4, engajamento: 4, gatilho: "cid:conheceu" }),
    op("guia", "Ir com um companheiro do clube", "Ele mostrou os lugares que turista não conhece.", { moral: 2, adaptacao: 8, gatilho: "cid:conheceu" }),
    op("casa", "Ficar em casa", "Fica para outra folga.", {}),
  ] }, 999);
  if (p.festa && c.semana >= p.festa.semanas[0] && c.semana <= p.festa.semanas[1]) agendar(a, c.ab, { origem: "cidade", chave: `festa-${p.nome}-${c.ano}`, titulo: p.festa.nome, prazo: 1, texto: `${p.festa.nome} em ${p.nome}: a cidade inteira na rua. Te chamaram para aparecer.`, opcoes: [
    op("ir", "Aparecer e curtir", "Foto com o povo, comida típica e a torcida te vendo como um deles.", { moral: 3, torcida: 2, vidaNoturna: 3, adaptacao: 3 }, { chance: 0.12, texto: "Exagerou na festa e apareceu num vídeo sem camisa.", ef: { relTecnico: -4, imprensa: -4, noticia: { titulo: `${c.apelido} na farra`, texto: `Vídeo de ${c.apelido} na ${p.festa.nome} viraliza.`, tipo: "polemica" } } }),
    op("rapido", "Passar rapidinho", "Meia hora, umas fotos e cama.", { moral: 1, torcida: 1 }),
    op("nao", "Ficar em casa", "Você ouviu os fogos de longe.", {}),
  ] }, 30);
  if (p.clima === "frio" && inv && !e.neve && rng.chance(0.2)) {
    e.neve = true;
    agendar(a, c.ab, { origem: "cidade", chave: `neve-${p.nome}`, titulo: "Primeira neve", prazo: 2, texto: quente ? "Você acordou e a rua estava branca. Primeira vez na vida vendo neve." : "Nevou forte de madrugada. O treino de amanhã vai ser no frio.", opcoes: [
      op("brincar", "Sair para brincar na neve", "Boneco de neve, guerra de bola e um vídeo que a família assistiu vinte vezes.", { moral: 4, engajamento: 6, cansaco: 3 }),
      op("casa", "Ficar no aquecedor", "Chocolate quente e série. Ninguém te tira daqui.", { moral: 1 }),
    ] }, 999);
  }
  if (p.praia && !inv && rng.chance(0.02)) agendar(a, c.ab, { origem: "cidade", chave: "praia-folga", titulo: "Praia na folga", prazo: 1, texto: "Dia lindo, folga do treino e a praia a dez minutos.", opcoes: [
    op("praia", "Praia com a galera", "Sol, futevôlei e foto com torcedor. Voltou queimado.", { moral: 3, cansaco: 3, engajamento: 3 }, { chance: 0.15, texto: "Foi reconhecido e virou tumulto na areia.", ef: { moral: -1, fama: 0.5, noticia: { titulo: `Tumulto na praia`, texto: `${c.apelido} vai à praia e é cercado por torcedores.`, tipo: "vida" } } }),
    op("descanso", "Descansar em casa", "Corpo agradece.", { cansaco: -4 }),
  ] }, 20);
  if (p.transito && !c.motorista && rng.chance(0.02)) agendar(a, c.ab, { origem: "cidade", chave: "transito", titulo: "Trânsito parado", prazo: 1, texto: `Duas horas parado no trânsito de ${p.nome}. Você vai chegar atrasado ao treino.`, opcoes: [
    op("ligar", "Ligar e avisar o técnico", "Ele entendeu, mas anotou.", { relTecnico: -1 }),
    op("helicoptero", "Pegar um helicóptero", "Chegou na hora, com estilo e com a conta salgada.", { dinheiro: -6000, fama: 0.3 }),
    op("atrasar", "Chegar quando der", "Multa do clube e cara feia do técnico.", { relTecnico: -4, dinheiro: -Math.round(c.salario * 0.05) }),
  ] }, 20);
  if (p.perigo >= 2 && c.fama >= 30 && rng.chance(0.01)) agendar(a, c.ab, { origem: "cidade", chave: "susto-rua", titulo: "Susto na rua", prazo: 1, texto: "Uma moto emparelhou no sinal. Você percebeu a tempo e saiu acelerando.", opcoes: [
    op("blindar", "Blindar o carro", `${curtoBrl(120000)} depois, a família dorme melhor.`, { dinheiro: -120000, moral: 1 }),
    op("seguir", "Seguir a vida", "Foi só um susto.", { moral: -3, pressao: 3 }),
  ] }, 40);
  return ef;
}
