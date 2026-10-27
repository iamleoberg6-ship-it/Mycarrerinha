// Nomes de jogadores gerados (garotos da base, reforços e substitutos de quem se aposenta), pela nacionalidade.
// Nada de nomes reais famosos: combinações comuns de cada país, sempre iguais para a mesma semente.
import type { RNG } from "./rng.js";

type Pool = { primeiros: string[]; sobrenomes: string[]; apelidos?: string[]; chanceApelido?: number };

const POOLS: Record<string, Pool> = {
  br: {
    primeiros: ["Gabriel", "Lucas", "Matheus", "Pedro", "Guilherme", "Rafael", "Felipe", "Gustavo", "João", "Vinícius", "Enzo", "Arthur", "Davi", "Samuel", "Kauã", "Ryan", "Breno", "Caio", "Igor", "Luan", "Thiago", "Diego", "Wesley", "Kaique", "Yuri", "Eduardo", "Henrique", "Murilo", "Nicolas", "Bruno", "Leonardo", "Miguel", "Heitor", "Otávio", "Renan", "Alisson", "Wallace", "Jhonata", "Erick", "Luiz"],
    sobrenomes: ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Carvalho", "Ferreira", "Rodrigues", "Almeida", "Costa", "Gomes", "Martins", "Araújo", "Barbosa", "Ribeiro", "Rocha", "Dias", "Moraes", "Teixeira", "Cardoso", "Nascimento", "Mendes", "Freitas", "Batista", "Correia", "Vieira", "Monteiro", "Pinheiro", "Campos", "Fonseca", "Brandão", "Moura", "Sales", "Bezerra", "Paixão"],
    apelidos: ["Vitinho", "Juninho", "Pedrinho", "Gabrielzinho", "Kaiky", "Biel", "Matheusinho", "Luquinhas", "Dudu", "Rafinha", "Netinho", "Thiaguinho", "Guga", "Lelê", "Kayky", "Joãozinho", "Caio Paulista", "Igor Mineiro", "Luan Baiano", "Wesley Gaúcho", "Davi Carioca", "Breninho", "Talles", "Andrey", "Patrick", "Welington", "Marlon", "Nathan", "Jean", "Iago"],
    chanceApelido: 0.3,
  },
  pt: {
    primeiros: ["João", "Diogo", "Rúben", "Tiago", "Gonçalo", "Rodrigo", "Francisco", "Miguel", "André", "Bruno", "Nuno", "Rafael", "Tomás", "Duarte", "Afonso", "Vasco", "Hélder", "Ivo"],
    sobrenomes: ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Sousa", "Fernandes", "Gonçalves", "Gomes", "Lopes", "Marques", "Alves", "Ribeiro", "Pinto", "Carvalho", "Teixeira", "Moreira", "Correia", "Mendes", "Nunes", "Vieira", "Monteiro", "Cardoso", "Rocha", "Neves", "Coelho"],
  },
  es: {
    primeiros: ["Matías", "Nicolás", "Agustín", "Facundo", "Sebastián", "Juan", "Diego", "Santiago", "Felipe", "Andrés", "Camilo", "Brian", "Joaquín", "Lucas", "Thiago", "Tomás", "Valentín", "Franco", "Lautaro", "Gonzalo", "Ignacio", "Bruno", "Pablo", "Álvaro", "Hugo", "Javier", "Sergio", "Alejandro", "Iker", "Unai", "Mario", "Adrián", "Raúl", "Óscar", "Rubén", "Daniel"],
    sobrenomes: ["González", "Rodríguez", "Fernández", "López", "Martínez", "Pérez", "Gómez", "Díaz", "Romero", "Suárez", "Cabrera", "Olivera", "Vargas", "Rojas", "Benítez", "Castillo", "Sánchez", "Ramírez", "Torres", "Flores", "Ruiz", "Herrera", "Medina", "Aguirre", "Molina", "Navarro", "Ortega", "Delgado", "Morales", "Ríos", "Sosa", "Acosta", "Ibáñez", "Vidal", "Serrano", "Iglesias", "Garrido", "Moreno"],
  },
  en: {
    primeiros: ["Callum", "Kyle", "Ryan", "Liam", "Jack", "Harry", "Jamie", "Connor", "Lewis", "Mason", "Riley", "Josh", "Oliver", "Charlie", "George", "Alfie", "Archie", "Ethan", "Tyler", "Jayden", "Noah", "Logan", "Owen", "Cole", "Reece", "Jordan", "Marcus", "Kai", "Tyrese", "Brandon"],
    sobrenomes: ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Robinson", "Wright", "Thompson", "Evans", "Walker", "White", "Roberts", "Green", "Hall", "Wood", "Jackson", "Clarke", "Hughes", "Edwards", "Turner", "Hill", "Cooper", "Ward", "Morris", "Moore", "Harris", "Murray", "Campbell", "Stewart", "Kelly", "Bennett", "Palmer", "Barnes"],
  },
  fr: {
    primeiros: ["Lucas", "Hugo", "Théo", "Nathan", "Mathis", "Enzo", "Louis", "Maxime", "Clément", "Antoine", "Baptiste", "Rayan", "Yanis", "Kylian", "Bastien", "Quentin", "Romain", "Florian", "Jordan", "Adrien", "Malo", "Warren", "Kenny", "Moussa", "Ibrahim", "Mehdi", "Wesley"],
    sobrenomes: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard", "André", "Mercier", "Blanc", "Guerin", "Boyer", "Lambert", "Fontaine", "Chevalier", "Diallo", "Traoré", "Camara", "Koné"],
  },
  de: {
    primeiros: ["Lukas", "Florian", "David", "Leon", "Maximilian", "Jonas", "Felix", "Paul", "Niklas", "Tim", "Jan", "Luca", "Finn", "Moritz", "Julian", "Tobias", "Kevin", "Marvin", "Yannik", "Fabian", "Malik", "Noah", "Elias", "Ben"],
    sobrenomes: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Braun", "Zimmermann", "Krüger", "Hartmann", "Lange", "Werner", "Krause", "Lehmann", "Huber", "Gruber", "Steiner", "Vogel", "Keller"],
  },
  it: {
    primeiros: ["Lorenzo", "Alessandro", "Francesco", "Mattia", "Andrea", "Leonardo", "Gabriele", "Riccardo", "Tommaso", "Davide", "Federico", "Matteo", "Marco", "Simone", "Nicolò", "Samuele", "Pietro", "Filippo", "Christian", "Giacomo", "Luca", "Daniele"],
    sobrenomes: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone"],
  },
  nl: {
    primeiros: ["Daan", "Sem", "Lars", "Jens", "Thijs", "Bram", "Ruben", "Stijn", "Jesse", "Milan", "Luuk", "Tijn", "Wout", "Dries", "Arne", "Siebe", "Jorrit", "Quinten", "Xavi", "Brian", "Calvin", "Jurriën"],
    sobrenomes: ["de Jong", "Jansen", "de Vries", "van den Berg", "van Dijk", "Bakker", "Visser", "Smit", "Meijer", "de Boer", "Mulder", "de Groot", "Bos", "Vos", "Peters", "Hendriks", "van Leeuwen", "Dekker", "Brouwer", "de Wit", "Peeters", "Janssens", "Maes", "Willems", "Claes", "Goossens", "Vermeulen"],
  },
  ar: {
    primeiros: ["Ali", "Omar", "Khalid", "Hassan", "Saeed", "Abdullah", "Yousef", "Fahad", "Hamad", "Mohammed", "Salem", "Nasser", "Faisal", "Sultan", "Rayan", "Ziyad", "Yassine", "Achraf", "Hakim", "Bilal", "Karim", "Amine", "Sofiane"],
    sobrenomes: ["Al-Hammadi", "Al-Mansoori", "Al-Kaabi", "Al-Shehri", "Al-Dosari", "Al-Yami", "Al-Qahtani", "Al-Harbi", "Al-Otaibi", "Al-Ghamdi", "Al-Zahrani", "Al-Malki", "Al-Amri", "Bensaid", "El Idrissi", "Benali", "Haddad", "Mansour", "Belkacem", "Ziani", "Amrani", "Chaouki"],
  },
  afr: {
    primeiros: ["Ibrahima", "Moussa", "Cheikh", "Pape", "Lamine", "Mamadou", "Abdoulaye", "Ousmane", "Seydou", "Youssouf", "Sékou", "Aliou", "Boubacar", "Idrissa", "Habib", "Krépin", "Wilfried", "Serge", "Franck", "Junior", "Brice", "Yves"],
    sobrenomes: ["Diallo", "Ndiaye", "Sarr", "Diop", "Koné", "Traoré", "Coulibaly", "Cissé", "Touré", "Bamba", "Keita", "Sow", "Fofana", "Kouassi", "Konaté", "Diatta", "Mbaye", "Sylla", "Kanté", "Diarra", "Ouattara", "Yao", "Mendy", "Gueye"],
  },
  afe: {
    primeiros: ["Emmanuel", "Samuel", "Daniel", "Victor", "Kelechi", "Chidi", "Kwame", "Kofi", "Kwabena", "Yaw", "Ebuka", "Tobi", "Femi", "Ademola", "Joseph", "Abdul", "Mohammed", "Isaac", "Richmond", "Dennis", "Patson", "Bongani"],
    sobrenomes: ["Mensah", "Osei", "Owusu", "Boateng", "Asante", "Appiah", "Okafor", "Okonkwo", "Adeyemi", "Balogun", "Eze", "Nwankwo", "Ogunleye", "Musa", "Abubakar", "Danso", "Sarpong", "Banda", "Phiri", "Mokoena", "Otieno", "Kamara"],
  },
  nord: {
    primeiros: ["Oliver", "William", "Emil", "Lucas", "Magnus", "Mikkel", "Rasmus", "Anders", "Erik", "Viktor", "Jonas", "Sander", "Mathias", "Kristoffer", "Elias", "Isak", "Linus", "Joakim", "Aron", "Gunnar"],
    sobrenomes: ["Hansen", "Nielsen", "Jensen", "Pedersen", "Andersen", "Larsen", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Olsen", "Berg", "Lund", "Holm", "Dahl", "Strand", "Lindqvist", "Sigurdsson", "Virtanen", "Korhonen"],
  },
  slav: {
    primeiros: ["Luka", "Marko", "Ivan", "Nikola", "Stefan", "Filip", "Josip", "Mateo", "Dušan", "Aleksandar", "Jakub", "Kamil", "Tomáš", "Patrik", "Mykola", "Artem", "Dmitri", "Bartosz", "Petar", "Andrej"],
    sobrenomes: ["Horvat", "Kovačić", "Babić", "Marić", "Jurić", "Petrović", "Jovanović", "Nikolić", "Popović", "Novak", "Kowalski", "Nowak", "Wiśniewski", "Dvořák", "Svoboda", "Shevchenko", "Kovalenko", "Ivanov", "Hadžić", "Begović"],
  },
  tr: { primeiros: ["Emre", "Burak", "Kerem", "Barış", "Okan", "Mert", "Arda", "Yusuf", "Kaan", "Cengiz", "Ozan", "Efe"], sobrenomes: ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Aydın", "Öztürk", "Arslan", "Doğan", "Koç", "Kurt", "Özdemir"] },
  fa: { primeiros: ["Mehdi", "Ali", "Reza", "Saeid", "Milad", "Amir", "Hossein", "Vahid", "Sardar", "Alireza"], sobrenomes: ["Rezaei", "Karimi", "Hosseini", "Ansari", "Mohammadi", "Ahmadi", "Jafari", "Rahimi", "Moradi", "Ghasemi"] },
  ja: { primeiros: ["Haruto", "Ren", "Sota", "Kaito", "Yuto", "Daichi", "Takumi", "Shota", "Kento", "Riku", "Hiroki", "Yuki"], sobrenomes: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada"] },
  ko: { primeiros: ["Min-jae", "Seung-ho", "Jae-sung", "Hyun-woo", "Dong-gyeong", "Kang-hyun", "Ui-jo", "Young-gwon", "Tae-hwan", "Ji-sung"], sobrenomes: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim"] },
  zh: { primeiros: ["Wei", "Lei", "Hao", "Jun", "Yang", "Peng", "Tao", "Bin", "Xin", "Chen"], sobrenomes: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Zhao", "Wu", "Zhou", "Xu"] },
  th: { primeiros: ["Chanathip", "Supachai", "Theerathon", "Ekanit", "Sarach", "Bordin", "Peeradon", "Suphanat"], sobrenomes: ["Songkrasin", "Chaided", "Bunmathan", "Panya", "Yooyen", "Phala", "Chamratsamee", "Mueanta"] },
  // bascos (Atlético Bilbau e vizinhos)
  eu: { primeiros: ["Iker", "Unai", "Aitor", "Mikel", "Ander", "Asier", "Gorka", "Iñaki", "Oier", "Julen", "Beñat", "Xabier", "Jon", "Ibai", "Endika", "Peio", "Urko", "Eneko", "Markel", "Iñigo", "Oihan", "Unax"], sobrenomes: ["Etxeberria", "Agirre", "Goikoetxea", "Zubiaurre", "Arrieta", "Olabarria", "Larrañaga", "Elizondo", "Urrutia", "Garmendia", "Iturralde", "Aranburu", "Zabala", "Mendizabal", "Ugarte", "Lekuona", "Bengoetxea", "Otxoa", "Uriarte", "Ibarrola", "Arana", "Etxebarria", "Zubeldia", "Goiri"] },
  ms: { primeiros: ["Safawi", "Arif", "Faisal", "Akhyar", "Syamer", "Hakimi", "Danial", "Nazmi"], sobrenomes: ["Rasid", "Aiman", "Halim", "Rashid", "Kutty", "Azmi", "Ashraf", "Faiz"] },
};

const LINGUA: Record<string, string> = {
  BRA: "br", POR: "pt", ANG: "pt", CPV: "pt", GNB: "pt", MOZ: "pt",
  ARG: "es", URU: "es", ESP: "es", COL: "es", CHI: "es", PAR: "es", ECU: "es", PER: "es", BOL: "es", VEN: "es", MEX: "es", CRC: "es", PAN: "es", HON: "es", GUA: "es", SLV: "es", DOM: "es", CUB: "es",
  ENG: "en", USA: "en", SCO: "en", WAL: "en", IRL: "en", NIR: "en", CAN: "en", AUS: "en", NZL: "en", JAM: "en", TRI: "en",
  FRA: "fr", SUI: "fr", HAI: "fr", GER: "de", AUT: "de", ITA: "it", NED: "nl", BEL: "nl",
  KSA: "ar", UAE: "ar", QAT: "ar", MAR: "ar", ALG: "ar", TUN: "ar", EGY: "ar", JOR: "ar", IRQ: "ar", SYR: "ar", LBY: "ar",
  SEN: "afr", CIV: "afr", MLI: "afr", GUI: "afr", CMR: "afr", BFA: "afr", COD: "afr", GAB: "afr", TOG: "afr", BEN: "afr", CGO: "afr", CTA: "afr",
  NGA: "afe", GHA: "afe", SLE: "afe", LBR: "afe", GAM: "afe", KEN: "afe", ZAM: "afe", ZIM: "afe", RSA: "afe", UGA: "afe", TAN: "afe",
  DEN: "nord", SWE: "nord", NOR: "nord", ISL: "nord", FIN: "nord",
  SRB: "slav", CRO: "slav", BIH: "slav", SVN: "slav", MNE: "slav", MKD: "slav", POL: "slav", CZE: "slav", SVK: "slav", UKR: "slav", RUS: "slav",
  BAS: "eu", TUR: "tr", IRN: "fa", JPN: "ja", KOR: "ko", CHN: "zh", THA: "th", MAS: "ms",
};

/** Nome novo para um jogador dessa nacionalidade, sem repetir os já usados no mundo. */
export function gerarNome(rng: RNG, nacionalidade: string, usados: Set<string>): string {
  const p = POOLS[LINGUA[nacionalidade] ?? "en"];
  for (let t = 0; t < 40; t++) {
    const nome = p.apelidos && rng.chance(p.chanceApelido ?? 0) ? rng.pick(p.apelidos) : `${rng.pick(p.primeiros)} ${rng.pick(p.sobrenomes)}`;
    if (!usados.has(nome)) { usados.add(nome); return nome; }
  }
  // tudo tomado: nome composto, do jeito de cada lugar (dois sobrenomes, sobrenome duplo, dois prenomes)
  const lingua = LINGUA[nacionalidade] ?? "en";
  for (;;) {
    const a = rng.pick(p.primeiros), b = rng.pick(p.sobrenomes), c = rng.pick(p.sobrenomes);
    const nome = lingua === "es" || lingua === "br" || lingua === "pt" ? `${a} ${b} ${c}` : lingua === "en" ? `${a} ${b}-${c}` : `${a} ${rng.pick(p.primeiros)} ${b}`;
    if (b !== c && !usados.has(nome)) { usados.add(nome); return nome; }
  }
}

/** Nacionalidade de um estrangeiro que chega a uma liga (pesos de onde vêm os jogadores no mundo). */
const ESTRANGEIROS: [string, number][] = [
  ["BRA", 8], ["ARG", 5], ["FRA", 6], ["ESP", 4], ["POR", 4], ["ENG", 3], ["GER", 3], ["NED", 3], ["ITA", 2], ["BEL", 2], ["SEN", 2], ["CIV", 2],
  ["NGA", 2], ["GHA", 2], ["MAR", 2], ["URU", 2], ["COL", 2], ["DEN", 2], ["CRO", 2], ["SRB", 1], ["SWE", 1], ["NOR", 1], ["JPN", 1], ["USA", 1],
  ["MLI", 1], ["CMR", 1], ["POL", 1], ["SUI", 1], ["AUT", 1],
];
export function nacionalidadeEstrangeira(rng: RNG, exceto: string): string {
  const l = ESTRANGEIROS.filter(([n]) => n !== exceto), tot = l.reduce((a, [, p]) => a + p, 0);
  let r = rng.next() * tot;
  for (const [n, p] of l) { r -= p; if (r <= 0) return n; }
  return l[0][0];
}
/** Parte do elenco que vem de fora, por país da liga. */
export const FATIA_ESTRANGEIRA: Record<string, number> = { URU: 0.08, COL: 0.08, CHI: 0.15, PAR: 0.1, ECU: 0.12, TUR: 0.4, MEX: 0.35, ENG: 0.6, ESP: 0.35, ITA: 0.5, GER: 0.45, FRA: 0.35, POR: 0.5, NED: 0.4, KSA: 0.45, BRA: 0.08, ARG: 0.1, USA: 0.45 };
