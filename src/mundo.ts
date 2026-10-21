// O mundo jogável: a Série A do pacote e mais quatro ligas com clubes-paródia (nome, cores, estádio,
// padrão de camisa) e elencos com nomes por nacionalidade. Tudo sai de uma semente fixa: os mesmos
// clubes e jogadores em qualquer carreira.
import { RNG, clamp } from "./rng.js";
import type { Posicao } from "./atributos.js";
import { forcaDoElenco, ligaDoPacote, type Clube, type JogadorNPC, type Liga, type PacoteDados } from "./liga.js";

export interface InfoClube { id: string; nome: string; apelido: string; cores: string[]; forca: number; cidade: string; estadio: string; padrao: string; ligaId: string; pais: string }
export interface InfoLiga { id: string; nome: string; curto: string; pais: string; regiao: "BRA" | "EUR" | "ARA"; nivel: Liga["nivel"]; fLiga: number; fSalario: number; bolas: [string, string][] }

export const LIGAS: InfoLiga[] = [
  { id: "EUR1", nome: "Liga Europeia Top", curto: "Europa Top", pais: "EUR", regiao: "EUR", nivel: 1, fLiga: 1.0, fSalario: 1.3, bolas: [["#1F3A5F", "#C9A14A"], ["#2B2B2B", "#C0392B"], ["#4B2A7B", "#18A0A8"], ["#0E5E3A", "#E3B341"]] },
  { id: "EUR2", nome: "Liga Europeia Média", curto: "Europa Média", pais: "EUR", regiao: "EUR", nivel: 2, fLiga: 0.85, fSalario: 1.0, bolas: [["#E35D24", "#1F3A5F"], ["#18A0A8", "#2B2B2B"], ["#C0392B", "#F2B705"]] },
  { id: "BRA1", nome: "Campeonato Nacional Série A", curto: "Série A", pais: "BRA", regiao: "BRA", nivel: 2, fLiga: 0.7, fSalario: 1, bolas: [["#2E7D4F", "#F2B705"], ["#1F3A5F", "#E3B341"], ["#C0392B", "#1F3A5F"], ["#18A0A8", "#F08A24"], ["#6A3FA0", "#F2B705"]] },
  { id: "ARA1", nome: "Liga do Golfo", curto: "Golfo", pais: "ARA", regiao: "ARA", nivel: 3, fLiga: 0.7, fSalario: 2.5, bolas: [["#0E5E3A", "#C9A14A"], ["#7A1F3D", "#E3B341"]] },
  { id: "BRA2", nome: "Campeonato Nacional Série B", curto: "Série B", pais: "BRA", regiao: "BRA", nivel: 4, fLiga: 0.5, fSalario: 0.6, bolas: [["#F2B705", "#1F3A5F"], ["#2B2B2B", "#2E7D4F"]] },
];
export const LIGA_INFO: Record<string, InfoLiga> = Object.fromEntries(LIGAS.map((l) => [l.id, l]));

// [id, nome, apelido, cidade, país (nacionalidade da maioria), cor 1, cor 2, estádio, força, fClube, padrão]
type L = [string, string, string, string, string, string, string, string, number, number, string];
const CLUBES: Record<string, L[]> = {
  EUR1: [
    ["E1-RMD", "Real Madrigal", "Merengue", "Madri", "ESP", "#FFFFFF", "#C9A14A", "Estádio Bernabé", 86, 1.5, "lisa"],
    ["E1-BAR", "Barcelova", "Blaugrana", "Barcelona", "ESP", "#A50044", "#004D98", "Camp Novo", 84, 1.45, "listrasV"],
    ["E1-MCI", "Manchester Celeste", "Cidadãos", "Manchester", "ENG", "#6CABDD", "#FFFFFF", "Estádio da Cidade", 86, 1.5, "lisa"],
    ["E1-MUN", "Manchester Vermelho", "Diabos Vermelhos", "Manchester", "ENG", "#DA291C", "#FFFFFF", "Old Traforte", 80, 1.4, "lisa"],
    ["E1-LIV", "Liverpul", "Reds", "Liverpool", "ENG", "#C8102E", "#F6EB61", "Anfilde", 84, 1.4, "lisa"],
    ["E1-ARS", "Arsenau", "Canhoneiros", "Londres", "ENG", "#EF0107", "#FFFFFF", "Emirates Arena", 84, 1.35, "lisa"],
    ["E1-CHE", "Chelsi", "Blues", "Londres", "ENG", "#034694", "#FFFFFF", "Stamforde Bridge", 81, 1.35, "lisa"],
    ["E1-TOT", "Tottenhão", "Esporas", "Londres", "ENG", "#FFFFFF", "#132257", "Arena do Norte", 79, 1.3, "lisa"],
    ["E1-BAY", "Bayern Munike", "Bávaros", "Munique", "GER", "#DC052D", "#FFFFFF", "Allianza Arena", 85, 1.45, "lisa"],
    ["E1-BVB", "Borússia Dortmundo", "Aurinegros", "Dortmund", "GER", "#FDE100", "#000000", "Muralha Amarela", 80, 1.25, "lisa"],
    ["E1-PSG", "Paris São Germano", "Parisienses", "Paris", "FRA", "#004170", "#DA291C", "Parque dos Príncipes", 84, 1.5, "centro"],
    ["E1-JUV", "Juventudo", "Velha Senhora", "Turim", "ITA", "#000000", "#FFFFFF", "Estádio de Turim", 80, 1.3, "listrasV"],
    ["E1-INT", "Internazionale Milanesa", "Nerazzurri", "Milão", "ITA", "#0068A8", "#000000", "San Ciro", 82, 1.3, "listrasV"],
    ["E1-MIL", "Milão Rossonero", "Diavolo", "Milão", "ITA", "#FB090B", "#000000", "San Ciro", 79, 1.25, "listrasV"],
    ["E1-NAP", "Napole", "Partenopei", "Nápoles", "ITA", "#12A0D7", "#FFFFFF", "Estádio Diego", 79, 1.15, "lisa"],
    ["E1-ROM", "Roma Giallorossa", "Lobos", "Roma", "ITA", "#8E1F2F", "#F0BC42", "Olímpico de Roma", 77, 1.1, "lisa"],
    ["E1-ATM", "Atlético Madrilenho", "Colchoneros", "Madri", "ESP", "#CB3524", "#FFFFFF", "Metropolitano", 81, 1.3, "listrasV"],
    ["E1-BEN", "Benfiga", "Águias", "Lisboa", "POR", "#E83030", "#FFFFFF", "Estádio da Luzinha", 77, 1.05, "lisa"],
    ["E1-POR", "Portu", "Dragões", "Porto", "POR", "#00428C", "#FFFFFF", "Estádio do Dragão", 76, 1.0, "listrasV"],
    ["E1-AJX", "Ájax Amsterdã", "Filhos dos Deuses", "Amsterdã", "NED", "#FFFFFF", "#D2122E", "Arena Johan", 75, 0.95, "centro"],
  ],
  EUR2: [
    ["E2-SEV", "Sevilha Andaluz", "Nervionenses", "Sevilha", "ESP", "#FFFFFF", "#D20A11", "Sánchez Pizarrán", 75, 1.0, "lisa"],
    ["E2-VAL", "Valência Morcego", "Che", "Valência", "ESP", "#FFFFFF", "#000000", "Mestalha", 73, 0.95, "lisa"],
    ["E2-VIL", "Villareal Amarelo", "Submarino", "Vila-real", "ESP", "#FFE667", "#005187", "Estádio da Louça", 75, 0.95, "lisa"],
    ["E2-OM", "Olympique Marselhês", "Foceenses", "Marselha", "FRA", "#FFFFFF", "#2FAEE0", "Velódromo", 76, 1.0, "lisa"],
    ["E2-LYO", "Lyon Leonês", "Gones", "Lyon", "FRA", "#FFFFFF", "#DA001A", "Parque Leonês", 74, 0.95, "faixaH"],
    ["E2-MON", "Mônaco Principesco", "Monegascos", "Mônaco", "FRA", "#E31B23", "#FFFFFF", "Estádio Luís Segundo", 75, 1.1, "faixa"],
    ["E2-LIL", "Lille Dogue", "Dogues", "Lille", "FRA", "#E01E13", "#20325F", "Pierre-Moreau", 73, 0.85, "lisa"],
    ["E2-SCP", "Sporting Lisboeta", "Leões", "Lisboa", "POR", "#008057", "#FFFFFF", "Alvaladinho", 76, 0.9, "listrasH"],
    ["E2-PSV", "PSV Eindhovense", "Camponeses", "Eindhoven", "NED", "#ED1C24", "#FFFFFF", "Arena da Lâmpada", 75, 0.9, "listrasV"],
    ["E2-FEY", "Feyenorde", "Roterdameses", "Roterdã", "NED", "#E30613", "#FFFFFF", "De Kuipinha", 73, 0.85, "centro"],
    ["E2-LEV", "Bayer Leverkusena", "Farmacêuticos", "Leverkusen", "GER", "#E32221", "#000000", "FarmArena", 77, 1.05, "lisa"],
    ["E2-RBL", "Leipzig Touro Vermelho", "Touros", "Leipzig", "GER", "#FFFFFF", "#DD0741", "Arena de Leipzig", 76, 1.05, "lisa"],
    ["E2-SGE", "Frankfurt Águia", "Águias", "Frankfurt", "GER", "#000000", "#E1000F", "Waldestádio", 73, 0.9, "lisa"],
    ["E2-LAZ", "Lazio Celeste", "Biancocelesti", "Roma", "ITA", "#87D8F7", "#FFFFFF", "Olímpico de Roma", 74, 0.9, "lisa"],
    ["E2-ATA", "Atalanta Bergamasca", "Deusa", "Bérgamo", "ITA", "#1E71B8", "#000000", "Arena de Bérgamo", 75, 0.9, "listrasV"],
    ["E2-FIO", "Fiorentina Viola", "Viola", "Florença", "ITA", "#482E92", "#FFFFFF", "Artêmio Franco", 72, 0.85, "lisa"],
    ["E2-CEL", "Céltico Glasgow", "Bhoys", "Glasgow", "SCO", "#018749", "#FFFFFF", "Parque Céltico", 70, 0.8, "listrasH"],
    ["E2-GAL", "Galatasarai", "Leões de Istambul", "Istambul", "TUR", "#A90432", "#FDB912", "Arena do Leão", 72, 0.85, "centro"],
  ],
  ARA1: [
    ["AR-HIL", "Al-Hilaal", "O Líder", "Riade", "KSA", "#0047BB", "#FFFFFF", "Estádio do Reino", 75, 1.5, "lisa"],
    ["AR-NAS", "Al-Nasir", "Cavaleiros de Najd", "Riade", "KSA", "#FCE300", "#1C3F94", "Arena Al-Awwal", 75, 1.5, "lisa"],
    ["AR-ITT", "Al-Ittihade", "Tigres", "Jidá", "KSA", "#FCE300", "#000000", "Cidade Esportiva Rei Abdullah", 74, 1.45, "listrasV"],
    ["AR-AHL", "Al-Ahli Jidá", "Os Reais", "Jidá", "KSA", "#00843D", "#FFFFFF", "Joia Brilhante", 73, 1.4, "lisa"],
    ["AR-SHA", "Al-Shabaab", "Leões Brancos", "Riade", "KSA", "#FFFFFF", "#000000", "Estádio Príncipe Faisal", 70, 1.1, "faixaH"],
    ["AR-ETT", "Al-Ettifaque", "Comandantes", "Dammam", "KSA", "#00843D", "#C8102E", "Estádio Príncipe Mohamed", 69, 1.0, "lisa"],
    ["AR-QAD", "Al-Qadisiya", "Cavaleiros do Leste", "Khobar", "KSA", "#C8102E", "#FCE300", "Estádio de Khobar", 70, 1.2, "lisa"],
    ["AR-TAA", "Al-Taawon", "Lâmpada", "Buraidá", "KSA", "#FCE300", "#1C3F94", "Estádio Rei Abdullah", 68, 0.95, "lisa"],
    ["AR-FAT", "Al-Fateh", "Conquistadores", "Al-Hasa", "KSA", "#00843D", "#1C3F94", "Estádio Príncipe Abdullah", 67, 0.9, "lisa"],
    ["AR-FAY", "Al-Fayha", "Laranjas", "Majmaá", "KSA", "#F08A24", "#1C3F94", "Estádio de Majmaá", 66, 0.85, "lisa"],
    ["AR-DAM", "Damaque", "Cavaleiros do Sul", "Khamis Mushait", "KSA", "#C8102E", "#FCE300", "Estádio Príncipe Sultan", 65, 0.8, "lisa"],
    ["AR-KHA", "Al-Khaleej", "Gaivotas", "Saihat", "KSA", "#00843D", "#FCE300", "Estádio de Saihat", 65, 0.8, "listrasV"],
    ["AR-RAE", "Al-Raed", "Pioneiros", "Buraidá", "KSA", "#C8102E", "#FFFFFF", "Estádio de Buraidá", 64, 0.75, "lisa"],
    ["AR-WEH", "Al-Wehda", "Cavaleiros de Meca", "Meca", "KSA", "#C8102E", "#FFFFFF", "Estádio Rei Abdulaziz", 66, 0.85, "faixa"],
    ["AR-OKH", "Al-Okhdood", "Guardiões", "Najrã", "KSA", "#FFFFFF", "#1C3F94", "Estádio de Najrã", 64, 0.75, "lisa"],
    ["AR-RIY", "Al-Riyadh", "Escola", "Riade", "KSA", "#1C3F94", "#C8102E", "Estádio Príncipe Turki", 64, 0.75, "lisa"],
    ["AR-KHO", "Al-Kholood", "Imortais", "Al-Rass", "KSA", "#5B2C83", "#FFFFFF", "Estádio de Al-Rass", 64, 0.75, "lisa"],
    ["AR-ORO", "Al-Orobah", "Arábicos", "Sakaka", "KSA", "#FCE300", "#00843D", "Estádio de Sakaka", 64, 0.75, "lisa"],
  ],
  BRA2: [
    ["B2-PON", "Ponte Pretinha", "Macaca", "Campinas", "BRA", "#000000", "#FFFFFF", "Moisés Lucarello", 64, 0.7, "listrasV"],
    ["B2-GUA", "Bugre Campineiro", "Bugre", "Campinas", "BRA", "#009A44", "#FFFFFF", "Brinco de Prata", 62, 0.6, "lisa"],
    ["B2-SPT", "Leão do Recife", "Leão da Ilha", "Recife", "BRA", "#000000", "#C8102E", "Ilha do Recreio", 66, 0.8, "listrasH"],
    ["B2-NAU", "Timbu Alvirrubro", "Timbu", "Recife", "BRA", "#C8102E", "#FFFFFF", "Aflitinhos", 62, 0.6, "listrasV"],
    ["B2-CEA", "Vovô Alvinegro", "Vovô", "Fortaleza", "BRA", "#000000", "#FFFFFF", "Castelão do Norte", 66, 0.8, "listrasV"],
    ["B2-FOR", "Leão do Pici", "Tricolor do Pici", "Fortaleza", "BRA", "#1C3F94", "#E2231A", "Arena do Pici", 67, 0.85, "faixaH"],
    ["B2-GOI", "Verdão Goiano", "Esmeraldino", "Goiânia", "BRA", "#006437", "#FFFFFF", "Serrinha Verde", 65, 0.7, "lisa"],
    ["B2-ACG", "Dragão Goiano", "Dragão", "Goiânia", "BRA", "#E2231A", "#000000", "Antônio Acióli", 64, 0.65, "listrasV"],
    ["B2-VNO", "Tigrão Colorado", "Tigrão", "Goiânia", "BRA", "#C8102E", "#FFFFFF", "Onésio Brasileirinho", 59, 0.5, "lisa"],
    ["B2-AME", "Coelho Mineiro", "Coelho", "Belo Horizonte", "BRA", "#006437", "#000000", "Independencinha", 65, 0.7, "listrasH"],
    ["B2-AVA", "Leão da Ilha Catarinense", "Leão", "Florianópolis", "BRA", "#00529F", "#FFFFFF", "Ressaquinha", 62, 0.6, "listrasV"],
    ["B2-CRI", "Tigre do Carvão", "Tigre", "Criciúma", "BRA", "#FDD100", "#000000", "Heriberto Hulso", 61, 0.55, "listrasV"],
    ["B2-PAY", "Papão da Curuzu", "Papão", "Belém", "BRA", "#4FC3F7", "#FFFFFF", "Curuzuzinho", 61, 0.55, "listrasV"],
    ["B2-OPE", "Fantasma Ferroviário", "Fantasma", "Ponta Grossa", "BRA", "#000000", "#FFFFFF", "Germano Krugo", 60, 0.5, "lisa"],
    ["B2-CRB", "Galo da Pajuçara", "Galo", "Maceió", "BRA", "#C8102E", "#FFFFFF", "Rei Pelezinho", 60, 0.5, "listrasH"],
    ["B2-NOV", "Tigre do Vale", "Novorizontino", "Novo Horizonte", "BRA", "#FDD100", "#000000", "Jorjinho", 61, 0.55, "lisa"],
    ["B2-AMZ", "Onça Amazonense", "Onça", "Manaus", "BRA", "#FDD100", "#000000", "Carlos Zamito", 58, 0.45, "lisa"],
    ["B2-FER", "Locomotiva Grená", "Ferrinha", "Araraquara", "BRA", "#7B1E3A", "#FFFFFF", "Fonte Iluminada", 59, 0.45, "lisa"],
    ["B2-VRE", "Voltaço", "Esquadrão de Aço", "Volta Redonda", "BRA", "#FDD100", "#000000", "Raulino de Oliva", 58, 0.45, "faixaH"],
    ["B2-BFR", "Pantera de Ribeirão", "Pantera", "Ribeirão Preto", "BRA", "#C8102E", "#FFFFFF", "Santa Cruzinha", 59, 0.5, "faixa"],
  ],
};

// ------------------------------------------------------------------ nomes
const NOMES: Record<string, [string[], string[]]> = {
  BRA: [["Lucas", "Gabriel", "Pedro", "Matheus", "Rafael", "Thiago", "Bruno", "Felipe", "Gustavo", "Vinícius", "Caio", "Diego", "André", "Rodrigo", "Luan", "Igor", "Wesley", "Kaio", "Renan", "Douglas", "Everton", "Jean", "Marlon", "Yago"],
    ["Silva", "Souza", "Santos", "Oliveira", "Pereira", "Lima", "Costa", "Ferreira", "Almeida", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha", "Barbosa", "Araújo", "Moura", "Teixeira", "Cardoso", "Nunes", "Batista", "Freitas"]],
  ESP: [["Álvaro", "Sergio", "Pablo", "Javier", "Iker", "Carlos", "Raúl", "Dani", "Marcos", "Adrián", "Hugo", "Unai", "Mikel", "Íñigo"], ["García", "Martínez", "López", "Sánchez", "Romero", "Navarro", "Torres", "Ruiz", "Moreno", "Herrera", "Ortega", "Iglesias", "Gil", "Vidal"]],
  ENG: [["Jack", "Harry", "James", "Tom", "Oliver", "Charlie", "Mason", "Jordan", "Callum", "Reece", "Ben", "Ethan"], ["Smith", "Walker", "Taylor", "Brown", "Wilson", "Clarke", "Robinson", "Wright", "Hughes", "Bennett", "Cooper", "Ward"]],
  SCO: [["Callum", "Ryan", "Scott", "Liam", "Kieran", "Andy"], ["McGregor", "Robertson", "Campbell", "Stewart", "Murray", "Fraser"]],
  FRA: [["Lucas", "Hugo", "Théo", "Antoine", "Mathis", "Jules", "Enzo", "Yanis", "Nathan", "Rayan", "Moussa"], ["Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Fournier", "Girard", "Mercier", "Blanc", "Diallo", "Traoré", "Camara"]],
  ITA: [["Marco", "Luca", "Alessandro", "Federico", "Matteo", "Davide", "Lorenzo", "Andrea", "Simone", "Nicolò"], ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Ricci", "Marino", "Greco", "Conti", "Gallo"]],
  GER: [["Leon", "Lukas", "Jonas", "Felix", "Niklas", "Tim", "Florian", "Jan", "Kai", "Max"], ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Wagner", "Becker", "Hoffmann", "Koch", "Richter", "Krause"]],
  POR: [["João", "Diogo", "Rúben", "Tiago", "Gonçalo", "Nuno", "Bernardo", "Rafael", "André", "Francisco"], ["Silva", "Fernandes", "Gonçalves", "Pereira", "Costa", "Mendes", "Lopes", "Carvalho", "Dias", "Moreira"]],
  NED: [["Daan", "Sem", "Luuk", "Bram", "Joey", "Thijs", "Stefan", "Kevin", "Jurriën"], ["de Jong", "van Dijk", "Bakker", "Visser", "Smit", "de Vries", "Mulder", "Dekker", "van Beek"]],
  ARG: [["Nicolás", "Lautaro", "Julián", "Rodrigo", "Enzo", "Thiago", "Facundo", "Matías", "Gonzalo", "Ezequiel"], ["Fernández", "González", "Rodríguez", "Gómez", "Díaz", "Álvarez", "Romero", "Sosa", "Acosta", "Benítez"]],
  URU: [["Federico", "Matías", "Agustín", "Santiago", "Maximiliano"], ["Pereira", "Suárez", "Núñez", "Cáceres", "Olivera"]],
  KSA: [["Mohammed", "Abdullah", "Salem", "Fahad", "Saud", "Nasser", "Yasser", "Faisal", "Hassan", "Turki", "Sami", "Firas"], ["Al-Dawsari", "Al-Shehri", "Al-Faraj", "Al-Ghamdi", "Al-Qahtani", "Al-Harbi", "Al-Otaibi", "Al-Mutairi", "Al-Zahrani", "Al-Malki", "Al-Amri"]],
  TUR: [["Emre", "Arda", "Kerem", "Burak", "Mert", "Hakan", "Barış"], ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Aydın", "Öztürk"]],
};
/** De onde vêm os estrangeiros de cada região. */
const ESTRANGEIROS: Record<InfoLiga["regiao"], string[]> = {
  EUR: ["BRA", "BRA", "ARG", "FRA", "POR", "ESP", "ENG", "GER", "NED", "ITA", "URU"],
  ARA: ["BRA", "BRA", "POR", "FRA", "ARG", "ESP", "ENG"],
  BRA: ["ARG", "URU", "BRA"],
};

function nomeDe(rng: RNG, nac: string, usados: Set<string>): string {
  const [ps, ss] = NOMES[nac] ?? NOMES.BRA;
  for (let t = 0; t < 20; t++) {
    const n = nac === "BRA" && rng.chance(0.35) ? `${rng.pick(ps)}${rng.chance(0.3) ? " " + rng.pick(["Júnior", "Henrique", "Paulo", "Vítor"]) : ""}` : `${rng.pick(ps)} ${rng.pick(ss)}`;
    if (!usados.has(n)) { usados.add(n); return n; }
  }
  return `${rng.pick(ps)} ${rng.pick(ss)} ${rng.int(2, 9)}`;
}

function elencoNomeado(rng: RNG, forca: number, pais: string, regiao: InfoLiga["regiao"], usados: Set<string>): JogadorNPC[] {
  const composicao: [Posicao | "GOL", number][] = [["GOL", 3], ["ZAG", 4], ["LAT", 4], ["VOL", 3], ["MEI", 4], ["PON", 4], ["ATA", 3]];
  const el: JogadorNPC[] = [];
  const local = pais === "SCO" ? "SCO" : pais;
  for (const [pos, n] of composicao) for (let i = 0; i < n; i++) {
    const titular = i < (pos === "GOL" ? 1 : pos === "VOL" || pos === "ATA" ? 1 : 2);
    const nac = rng.chance(regiao === "BRA" ? 0.9 : regiao === "ARA" ? 0.55 : 0.6) ? local : rng.pick(ESTRANGEIROS[regiao]);
    // a base de cada clube: alguns garotos de 17 a 21
    const idade = i === n - 1 && rng.chance(0.6) ? rng.int(17, 21) : rng.int(19, 34);
    el.push({ nome: nomeDe(rng, nac, usados), posicao: pos, ovr: clamp(Math.round(forca + (titular ? 1 : -5) + rng.normal(0, 2.5) - (idade <= 20 ? 6 : 0)), 45, 93), idade, nacionalidade: nac });
  }
  return el;
}

// ------------------------------------------------------------------ montagem
export interface Mundo { ligas: Liga[]; liga: Record<string, Liga>; clube: Record<string, Clube>; info: Record<string, InfoClube> }
let cache: { pacote: PacoteDados; m: Mundo } | undefined;

export function mundo(pacote: PacoteDados): Mundo {
  if (cache?.pacote === pacote) return cache.m;
  const ligas: Liga[] = [], info: Record<string, InfoClube> = {};
  for (const li of LIGAS) {
    if (li.id === "BRA1") {
      const l = ligaDoPacote(pacote);
      ligas.push(l);
      type CP = { id: string; nome: string; apelido: string; cores: string[]; forca: number; cidade: string; estadio: { nome: string } };
      for (const c of pacote.clubes as unknown as CP[]) info[c.id] = { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca, cidade: c.cidade, estadio: c.estadio.nome, padrao: PADRAO_BRA1[c.id] ?? "lisa", ligaId: "BRA1", pais: "BRA" };
      continue;
    }
    const rng = new RNG(`mundo-v1|${li.id}`), usados = new Set<string>();
    const clubes: Clube[] = CLUBES[li.id].map(([id, nome, apelido, cidade, pais, c1, c2, estadio, forca, fClube, padrao]) => {
      const elenco = elencoNomeado(rng, forca, pais, li.regiao, usados);
      info[id] = { id, nome, apelido, cores: [c1, c2], forca, cidade, estadio, padrao, ligaId: li.id, pais };
      return { id, nome, ligaId: li.id, forca: forcaDoElenco(elenco), fClube, elenco, pais: li.pais };
    });
    ligas.push({ id: li.id, nome: li.nome, pais: li.pais, nivel: li.nivel, fLiga: li.fLiga, fSalario: li.fSalario, rebaixados: 4, clubes });
  }
  const m: Mundo = { ligas, liga: Object.fromEntries(ligas.map((l) => [l.id, l])), clube: Object.fromEntries(ligas.flatMap((l) => l.clubes.map((c) => [c.id, c]))), info };
  cache = { pacote, m };
  return m;
}

/** Padrão das camisas da Série A (só cores e desenho, nada de escudo). */
const PADRAO_BRA1: Record<string, string> = {
  FLA: "listrasH", FLU: "listrasV", BOT: "listrasV", VAS: "faixa", GRE: "listrasV", CAM: "listrasV", BAH: "listrasH", VIT: "listrasH", CAP: "listrasH",
  SPA: "faixaH", SAN: "lisa", PAL: "lisa", COR: "lisa", INT: "lisa", CRU: "lisa", CFC: "lisa", RBB: "lisa", MIR: "lisa", REM: "lisa", CHA: "lisa",
};
export const infoClube = (pacote: PacoteDados, id: string): InfoClube => mundo(pacote).info[id];
export const ligaDoClube = (pacote: PacoteDados, id: string): Liga => mundo(pacote).liga[mundo(pacote).info[id].ligaId];
