// Clubes convidados: existem só para as copas continentais (países sem liga jogável no jogo).
// Paródias como as outras ligas: nome, apelido, cores e padrão de camisa. A força é a média dos titulares;
// o elenco é gerado com nomes da língua do país, sempre igual para o mesmo clube.
import { RNG, clamp } from "./rng.js";
import type { Posicao } from "./atributos.js";
import type { Clube, JogadorNPC } from "./liga.js";

export interface Convidado { id: string; nome: string; apelido: string; cidade: string; estadio: string; pais: string; cores: string[]; padrao: string; forca: number; regiao: "SUL" | "EUR" | "ASO" | "ASL" | "AFR" | "OCE" }

export const TODOS_CONVIDADOS: Convidado[] = [
  // América do Sul
  { id: "UY-PEN", nome: "CA Peñarolo", apelido: "Carboneros", cidade: "Montevidéu", estadio: "Campeão do Século", pais: "URU", cores: ["#F5C400", "#111111"], padrao: "listrasV", forca: 70, regiao: "SUL" },
  { id: "UY-NAC", nome: "Nacional de Montevidéu", apelido: "Bolsilludos", cidade: "Montevidéu", estadio: "Parque Central", pais: "URU", cores: ["#FFFFFF", "#0B2F7A"], padrao: "lisa", forca: 70, regiao: "SUL" },
  { id: "UY-LIV", nome: "Liverpul Montevideano", apelido: "Negriazul", cidade: "Montevidéu", estadio: "Belvedere", pais: "URU", cores: ["#111111", "#1C4FA1"], padrao: "listrasV", forca: 66, regiao: "SUL" },
  { id: "CO-NAC", nome: "Atlético Nacionalista", apelido: "Verdolaga", cidade: "Medellín", estadio: "Atanasio", pais: "COL", cores: ["#0B7A3B", "#FFFFFF"], padrao: "listrasV", forca: 70, regiao: "SUL" },
  { id: "CO-MIL", nome: "Milionários FC", apelido: "Embaixador", cidade: "Bogotá", estadio: "El Campín", pais: "COL", cores: ["#0B3D91", "#FFFFFF"], padrao: "lisa", forca: 68, regiao: "SUL" },
  { id: "CO-JUN", nome: "Júnior de Barranquilha", apelido: "Tubarão", cidade: "Barranquilla", estadio: "Metropolitano", pais: "COL", cores: ["#C8102E", "#FFFFFF"], padrao: "listrasV", forca: 67, regiao: "SUL" },
  { id: "CL-COL", nome: "Colo-Colinho", apelido: "Cacique", cidade: "Santiago", estadio: "Monumental de Santiago", pais: "CHI", cores: ["#FFFFFF", "#111111"], padrao: "lisa", forca: 68, regiao: "SUL" },
  { id: "CL-UCH", nome: "Universidade do Chile", apelido: "La U", cidade: "Santiago", estadio: "Nacional de Santiago", pais: "CHI", cores: ["#0B3D91", "#C8102E"], padrao: "lisa", forca: 67, regiao: "SUL" },
  { id: "CL-UCA", nome: "Universidade Católica", apelido: "Cruzados", cidade: "Santiago", estadio: "San Carlos", pais: "CHI", cores: ["#FFFFFF", "#1C4FA1"], padrao: "faixaH", forca: 66, regiao: "SUL" },
  { id: "PY-OLI", nome: "Olimpiano", apelido: "Decano", cidade: "Assunção", estadio: "Manuel Ferreira", pais: "PAR", cores: ["#FFFFFF", "#111111"], padrao: "faixaH", forca: 67, regiao: "SUL" },
  { id: "PY-CER", nome: "Cerro Portenho", apelido: "Ciclone", cidade: "Assunção", estadio: "La Nueva Olla", pais: "PAR", cores: ["#0B3D91", "#C8102E"], padrao: "listrasV", forca: 67, regiao: "SUL" },
  { id: "PY-LIB", nome: "Libertad Assunção", apelido: "Gumarelo", cidade: "Assunção", estadio: "La Huerta", pais: "PAR", cores: ["#111111", "#FFFFFF"], padrao: "listrasV", forca: 65, regiao: "SUL" },
  { id: "EC-LDU", nome: "Liga de Quito", apelido: "Albos", cidade: "Quito", estadio: "Casa Blanca", pais: "ECU", cores: ["#FFFFFF", "#C8102E"], padrao: "lisa", forca: 69, regiao: "SUL" },
  { id: "EC-BSC", nome: "Barcelona de Guayaquil", apelido: "Ídolo", cidade: "Guayaquil", estadio: "Monumental de Guayaquil", pais: "ECU", cores: ["#F5C400", "#111111"], padrao: "lisa", forca: 67, regiao: "SUL" },
  { id: "EC-IDV", nome: "Independente do Vale", apelido: "Rayados", cidade: "Sangolquí", estadio: "Banco Guayaquil", pais: "ECU", cores: ["#111111", "#1C4FA1"], padrao: "listrasV", forca: 70, regiao: "SUL" },
  { id: "PE-ALI", nome: "Aliança Lima", apelido: "Íntimos", cidade: "Lima", estadio: "Matute", pais: "PER", cores: ["#0B2F7A", "#FFFFFF"], padrao: "listrasV", forca: 65, regiao: "SUL" },
  { id: "PE-UNI", nome: "Universitário de Esportes", apelido: "Crema", cidade: "Lima", estadio: "Monumental de Lima", pais: "PER", cores: ["#F2E6C9", "#9B1B30"], padrao: "lisa", forca: 65, regiao: "SUL" },
  { id: "BO-BOL", nome: "Club Bolívar", apelido: "Academia", cidade: "La Paz", estadio: "Hernando Siles", pais: "BOL", cores: ["#6CB4E4", "#FFFFFF"], padrao: "lisa", forca: 63, regiao: "SUL" },
  { id: "BO-STR", nome: "The Strongo", apelido: "Tigre", cidade: "La Paz", estadio: "Rafael Mendoza", pais: "BOL", cores: ["#F5C400", "#111111"], padrao: "listrasV", forca: 62, regiao: "SUL" },
  // Europa
  { id: "BE-BRU", nome: "Clube Bruges", apelido: "Blauw-Zwart", cidade: "Bruges", estadio: "Jan Breydel", pais: "BEL", cores: ["#0B4EA2", "#111111"], padrao: "listrasV", forca: 75, regiao: "EUR" },
  { id: "BE-AND", nome: "Anderlechte", apelido: "Mauves", cidade: "Bruxelas", estadio: "Lotto Park", pais: "BEL", cores: ["#5B2A86", "#FFFFFF"], padrao: "lisa", forca: 72, regiao: "EUR" },
  { id: "SC-CEL", nome: "Céltico FC", apelido: "Bhoys", cidade: "Glasgow", estadio: "Celtic Park", pais: "SCO", cores: ["#0B7A3B", "#FFFFFF"], padrao: "listrasH", forca: 74, regiao: "EUR" },
  { id: "SC-RAN", nome: "Rangeres FC", apelido: "Gers", cidade: "Glasgow", estadio: "Ibrox", pais: "SCO", cores: ["#1C4FA1", "#FFFFFF"], padrao: "lisa", forca: 73, regiao: "EUR" },
  { id: "AT-SAL", nome: "Salzburgo Touro", apelido: "Roten Bullen", cidade: "Salzburgo", estadio: "Wals-Siezenheim", pais: "AUT", cores: ["#FFFFFF", "#C8102E"], padrao: "lisa", forca: 73, regiao: "EUR" },
  { id: "TR-GAL", nome: "Galatassaray", apelido: "Cimbom", cidade: "Istambul", estadio: "Rams Park", pais: "TUR", cores: ["#B2102F", "#F5A800"], padrao: "metade", forca: 75, regiao: "EUR" },
  // Ásia — Oeste
  { id: "AE-AIN", nome: "Al-Ainé", apelido: "O Chefe", cidade: "Al Ain", estadio: "Hazza bin Zayed", pais: "UAE", cores: ["#5B2A86", "#FFFFFF"], padrao: "lisa", forca: 68, regiao: "ASO" },
  { id: "AE-SHA", nome: "Shabab Al-Ahlí", apelido: "Cavaleiros", cidade: "Dubai", estadio: "Rashid", pais: "UAE", cores: ["#C8102E", "#111111"], padrao: "listrasV", forca: 67, regiao: "ASO" },
  { id: "AE-WAH", nome: "Al-Wahdá", apelido: "Os Grenás", cidade: "Abu Dhabi", estadio: "Al Nahyan", pais: "UAE", cores: ["#7A1E2B", "#FFFFFF"], padrao: "lisa", forca: 65, regiao: "ASO" },
  { id: "QA-SAD", nome: "Al-Sadd", apelido: "O Líder", cidade: "Doha", estadio: "Jassim bin Hamad", pais: "QAT", cores: ["#FFFFFF", "#111111"], padrao: "lisa", forca: 69, regiao: "ASO" },
  { id: "QA-DUH", nome: "Al-Duhaíl", apelido: "Cavaleiros Vermelhos", cidade: "Doha", estadio: "Abdullah bin Khalifa", pais: "QAT", cores: ["#C8102E", "#FFFFFF"], padrao: "lisa", forca: 67, regiao: "ASO" },
  { id: "QA-RAY", nome: "Al-Raiyan", apelido: "Os Leões", cidade: "Al Rayyan", estadio: "Ahmad bin Ali", pais: "QAT", cores: ["#F5C400", "#C8102E"], padrao: "faixaH", forca: 65, regiao: "ASO" },
  { id: "IR-PER", nome: "Persépolis FC", apelido: "Vermelhos de Teerã", cidade: "Teerã", estadio: "Azadi", pais: "IRN", cores: ["#C8102E", "#FFFFFF"], padrao: "lisa", forca: 66, regiao: "ASO" },
  { id: "IR-EST", nome: "Esteghlalé", apelido: "Os Azuis", cidade: "Teerã", estadio: "Azadi", pais: "IRN", cores: ["#0B4EA2", "#FFFFFF"], padrao: "lisa", forca: 66, regiao: "ASO" },
  // Ásia — Leste
  { id: "JP-KAW", nome: "Kawasaqui Frontal", apelido: "Frontale", cidade: "Kawasaki", estadio: "Todoroki", pais: "JPN", cores: ["#3FA9DF", "#111111"], padrao: "listrasV", forca: 69, regiao: "ASL" },
  { id: "JP-YOK", nome: "Iocoama Marinhos", apelido: "Tricolore", cidade: "Yokohama", estadio: "Nissan", pais: "JPN", cores: ["#0B3D91", "#FFFFFF"], padrao: "faixaH", forca: 69, regiao: "ASL" },
  { id: "JP-URA", nome: "Urawa Diamantes", apelido: "Reds", cidade: "Saitama", estadio: "Saitama 2002", pais: "JPN", cores: ["#C8102E", "#FFFFFF"], padrao: "lisa", forca: 68, regiao: "ASL" },
  { id: "KR-ULS", nome: "Ulsã HD", apelido: "Tigres", cidade: "Ulsan", estadio: "Munsu", pais: "KOR", cores: ["#0B4EA2", "#F5C400"], padrao: "lisa", forca: 69, regiao: "ASL" },
  { id: "KR-JEO", nome: "Jeonbuque Motores", apelido: "Verdes", cidade: "Jeonju", estadio: "Jeonju World Cup", pais: "KOR", cores: ["#0B7A3B", "#111111"], padrao: "lisa", forca: 69, regiao: "ASL" },
  { id: "KR-POH", nome: "Pohangue Siderúrgica", apelido: "Steelers", cidade: "Pohang", estadio: "Steelyard", pais: "KOR", cores: ["#C8102E", "#111111"], padrao: "listrasV", forca: 66, regiao: "ASL" },
  { id: "CN-SHP", nome: "Xangai Portuário", apelido: "Águias Vermelhas", cidade: "Xangai", estadio: "Pudong", pais: "CHN", cores: ["#C8102E", "#FFFFFF"], padrao: "lisa", forca: 66, regiao: "ASL" },
  { id: "CN-SHS", nome: "Xangai Shenhuá", apelido: "Diabos Azuis", cidade: "Xangai", estadio: "Hongkou", pais: "CHN", cores: ["#1C4FA1", "#FFFFFF"], padrao: "lisa", forca: 65, regiao: "ASL" },
  { id: "AU-CCM", nome: "Costa Central Marinheiros", apelido: "Mariners", cidade: "Gosford", estadio: "Industree", pais: "AUS", cores: ["#F5C400", "#0B2F7A"], padrao: "lisa", forca: 62, regiao: "ASL" },
  { id: "AU-MEL", nome: "Melburno Cidade", apelido: "City", cidade: "Melbourne", estadio: "AAMI Park", pais: "AUS", cores: ["#6CB4E4", "#FFFFFF"], padrao: "lisa", forca: 63, regiao: "ASL" },
  { id: "TH-BUR", nome: "Buriram Unidos", apelido: "Castelo do Trovão", cidade: "Buriram", estadio: "Chang Arena", pais: "THA", cores: ["#0B2F7A", "#F58220"], padrao: "lisa", forca: 62, regiao: "ASL" },
  { id: "MY-JDT", nome: "Johor Tigres do Sul", apelido: "Tigres do Sul", cidade: "Johor Bahru", estadio: "Sultan Ibrahim", pais: "MAS", cores: ["#1C4FA1", "#C8102E"], padrao: "faixaH", forca: 63, regiao: "ASL" },  // África e Oceania: só para o Mundial de Clubes
  { id: "EG-AHL", nome: "Al-Ahlí do Cairo", apelido: "Diabos Vermelhos", cidade: "Cairo", estadio: "Cairo Internacional", pais: "EGY", cores: ["#C8102E", "#FFFFFF"], padrao: "lisa", forca: 70, regiao: "AFR" },
  { id: "MA-WAC", nome: "Uidade Casablanca", apelido: "Wydadis", cidade: "Casablanca", estadio: "Mohammed V", pais: "MAR", cores: ["#C8102E", "#FFFFFF"], padrao: "lisa", forca: 67, regiao: "AFR" },
  { id: "TN-EST", nome: "Esperança de Túnis", apelido: "Sang et Or", cidade: "Túnis", estadio: "Hammadi Agrebi", pais: "TUN", cores: ["#C8102E", "#F5C400"], padrao: "listrasV", forca: 66, regiao: "AFR" },
  { id: "ZA-SUN", nome: "Mamelodi Sundaunes", apelido: "Brasileiros", cidade: "Pretória", estadio: "Loftus Versfeld", pais: "RSA", cores: ["#F5C400", "#0B7A3B"], padrao: "lisa", forca: 67, regiao: "AFR" },
  { id: "EG-PYR", nome: "Pirâmides FC", apelido: "Faraós", cidade: "Cairo", estadio: "30 de Junho", pais: "EGY", cores: ["#0B3D91", "#FFFFFF"], padrao: "lisa", forca: 67, regiao: "AFR" },
  { id: "NZ-AUC", nome: "Auclande City", apelido: "Navy Blues", cidade: "Auckland", estadio: "Kiwitea Street", pais: "NZL", cores: ["#0B2F7A", "#FFFFFF"], padrao: "lisa", forca: 55, regiao: "OCE" },
];
/** Países que ganharam liga própria (src/ligas-extra.ts): os clubes deles jogam a liga e entram nas copas pela tabela. */
const COM_LIGA = new Set(["URU", "COL", "CHI", "PAR", "ECU", "TUR"]);
/** Os convidados que seguem sem liga (só copas). */
export const CONVIDADOS: Convidado[] = TODOS_CONVIDADOS.filter((c) => !COM_LIGA.has(c.pais));

const NOMES: Record<string, [string[], string[]]> = {
  es: [["Matías", "Nicolás", "Agustín", "Facundo", "Sebastián", "Juan", "Diego", "Santiago", "Felipe", "Andrés", "Camilo", "Brian", "Joaquín", "Lucas"],
    ["González", "Rodríguez", "Fernández", "López", "Martínez", "Pérez", "Gómez", "Díaz", "Romero", "Suárez", "Cabrera", "Olivera", "Vargas", "Rojas", "Benítez", "Castillo"]],
  nl: [["Jens", "Lars", "Thibaut", "Hans", "Maxim", "Arne", "Wout", "Dries", "Kevin", "Romeo"], ["Peeters", "Janssens", "Maes", "Jacobs", "Mertens", "Willems", "Claes", "Goossens", "De Smet", "Vermeulen"]],
  en: [["Callum", "Kyle", "Ryan", "Liam", "Jack", "Scott", "Jamie", "Connor", "Lewis", "Mitchell", "Riley", "Josh"], ["Murray", "Campbell", "Stewart", "McLean", "Wilson", "Fraser", "Morrison", "Taylor", "Brown", "Kelly", "Ross", "Bell"]],
  de: [["Lukas", "Florian", "David", "Stefan", "Maximilian", "Andreas", "Philipp", "Marcel"], ["Gruber", "Huber", "Wagner", "Pichler", "Steiner", "Moser", "Mayer", "Hofer"]],
  tr: [["Emre", "Burak", "Kerem", "Barış", "Okan", "Mert", "Arda", "Yusuf", "Kaan"], ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Aydın", "Öztürk", "Arslan", "Doğan"]],
  ar: [["Ali", "Omar", "Khalid", "Hassan", "Saeed", "Abdullah", "Yousef", "Fahad", "Hamad", "Mohammed", "Salem"], ["Al-Hammadi", "Al-Mansoori", "Al-Kaabi", "Al-Haydos", "Al-Shehri", "Khalfan", "Al-Dosari", "Rashid", "Al-Yami", "Afif"]],
  fa: [["Mehdi", "Ali", "Reza", "Saeid", "Milad", "Amir", "Hossein", "Vahid"], ["Rezaei", "Karimi", "Taremi", "Hosseini", "Ansari", "Mohammadi", "Ghoddos", "Jahanbakhsh"]],
  ja: [["Haruto", "Ren", "Sota", "Kaito", "Yuto", "Daichi", "Takumi", "Shota", "Kento", "Riku"], ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato"]],
  ko: [["Min-jae", "Seung-ho", "Jae-sung", "Hyun-woo", "Dong-gyeong", "Kang-in", "Ui-jo", "Young-gwon", "Tae-hwan"], ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang"]],
  zh: [["Wei", "Lei", "Hao", "Jun", "Yang", "Peng", "Tao", "Bin", "Xin"], ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Zhao", "Wu", "Zhou"]],
  th: [["Chanathip", "Teerasil", "Supachai", "Theerathon", "Ekanit", "Sarach", "Bordin", "Peeradon"], ["Songkrasin", "Dangda", "Chaided", "Bunmathan", "Panya", "Yooyen", "Phala", "Chamratsamee"]],
  ms: [["Safawi", "Arif", "Faisal", "Akhyar", "Syamer", "Hakimi", "Danial", "Nazmi"], ["Rasid", "Aiman", "Halim", "Rashid", "Kutty", "Azmi", "Ashraf", "Faiz"]],
};
const LINGUA: Record<string, string> = { URU: "es", COL: "es", CHI: "es", PAR: "es", ECU: "es", PER: "es", BOL: "es", BEL: "nl", SCO: "en", AUT: "de", TUR: "tr", UAE: "ar", QAT: "ar", IRN: "fa", JPN: "ja", KOR: "ko", CHN: "zh", AUS: "en", THA: "th", MAS: "ms", EGY: "ar", MAR: "ar", TUN: "ar", RSA: "en", NZL: "en" };

/** Clube de jogo (com elenco) de um convidado: sempre o mesmo para o mesmo id. */
export function clubeConvidado(c: Convidado): Clube {
  const rng = new RNG(`convidado|${c.id}`), [prim, sob] = NOMES[LINGUA[c.pais] ?? "es"];
  const comp: [Posicao | "GOL", number][] = [["GOL", 3], ["ZAG", 4], ["LAT", 4], ["VOL", 3], ["MEI", 4], ["PON", 4], ["ATA", 3]];
  const usados = new Set<string>(), elenco: JogadorNPC[] = [];
  let num = 1;
  for (const [pos, n] of comp) for (let i = 0; i < n; i++) {
    let nome = "";
    for (let t = 0; t < 30 && (!nome || usados.has(nome)); t++) nome = `${rng.pick(prim)} ${rng.pick(sob)}`;
    usados.add(nome);
    const titular = i < (pos === "GOL" ? 1 : pos === "VOL" || pos === "ATA" ? 1 : 2);
    elenco.push({ nome, posicao: pos, ovr: clamp(Math.round(c.forca + (titular ? 1.5 : -5) + rng.normal(0, 2)), 45, 90), idade: rng.int(19, 34), nacionalidade: c.pais, numero: num++ });
  }
  return { id: c.id, nome: c.nome, ligaId: "CONV", forca: c.forca, fClube: 0.8, elenco, pais: c.pais };
}
