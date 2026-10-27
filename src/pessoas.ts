// Nomes de gente comum (matches, família, filhos), pelo país: quem mora nos Estados Unidos se chama Emily, não Giovanna.
// Nomes masculinos e sobrenomes vêm das mesmas listas dos jogadores gerados (nomes.ts); aqui ficam os femininos e os
// nomes de bebê de hoje em dia. Nada de nomes de gente famosa: combinações comuns de cada lugar.
import type { RNG } from "./rng.js";
import { POOLS, LINGUA } from "./nomes.js";

const FEMININOS: Record<string, string[]> = {
  br: ["Ana", "Bia", "Bruna", "Camila", "Carol", "Clara", "Duda", "Fernanda", "Gabi", "Giovanna", "Helena", "Isabela", "Jéssica", "Júlia", "Larissa", "Laura", "Letícia",
    "Lívia", "Luana", "Manu", "Mariana", "Marina", "Natália", "Paula", "Rafaela", "Raquel", "Sofia", "Thaís", "Valentina", "Vitória", "Yasmin", "Lara", "Alice", "Nina", "Lorena"],
  pt: ["Inês", "Beatriz", "Mariana", "Joana", "Carolina", "Rita", "Catarina", "Leonor", "Matilde", "Sofia", "Margarida", "Teresa", "Marta", "Diana", "Filipa", "Sara", "Raquel", "Ana"],
  es: ["Lucía", "Sofía", "Martina", "Valentina", "Camila", "Paula", "Daniela", "Julieta", "Florencia", "Carla", "Alba", "Noelia", "Agustina", "Ximena", "Renata", "Elena", "Natalia", "Abril"],
  en: ["Emily", "Olivia", "Sophie", "Chloe", "Jessica", "Hannah", "Megan", "Lauren", "Amy", "Grace", "Ella", "Lucy", "Madison", "Ashley", "Brooke", "Taylor", "Kayla", "Abigail", "Holly", "Zoe"],
  fr: ["Camille", "Léa", "Chloé", "Manon", "Inès", "Jade", "Louise", "Clara", "Pauline", "Margaux", "Juliette", "Océane", "Elise", "Anaïs", "Laure", "Aminata", "Fatou", "Awa"],
  de: ["Lena", "Hannah", "Anna", "Lea", "Laura", "Julia", "Sophie", "Lisa", "Katharina", "Marie", "Johanna", "Leonie", "Clara", "Paula", "Nina", "Franziska", "Mia"],
  it: ["Giulia", "Francesca", "Chiara", "Sara", "Martina", "Alessia", "Federica", "Elisa", "Valentina", "Aurora", "Beatrice", "Ginevra", "Silvia", "Ilaria", "Arianna", "Bianca"],
  nl: ["Emma", "Sanne", "Lotte", "Fleur", "Anouk", "Femke", "Iris", "Lieke", "Noor", "Sophie", "Julia", "Eva", "Tess", "Roos", "Fenna", "Maud"],
  ar: ["Fatima", "Aisha", "Mariam", "Noura", "Layla", "Sara", "Huda", "Salma", "Yasmin", "Rania", "Amira", "Dina", "Hala", "Reem", "Lina", "Nadia"],
  afr: ["Aminata", "Fatou", "Awa", "Mariama", "Aïssatou", "Khady", "Ndeye", "Binta", "Kadiatou", "Rokia", "Oumou", "Djeneba", "Coumba", "Astou"],
  afe: ["Ngozi", "Ama", "Adaeze", "Efua", "Funmi", "Chioma", "Abena", "Akosua", "Yetunde", "Amara", "Zainab", "Wanjiru", "Thandi", "Nomvula", "Esi", "Ifeoma"],
  nord: ["Emma", "Ida", "Freja", "Sofie", "Maja", "Ingrid", "Astrid", "Elsa", "Saga", "Linnea", "Nora", "Sigrid", "Clara", "Alma", "Signe", "Tuva"],
  slav: ["Ana", "Ivana", "Marija", "Katarina", "Petra", "Jelena", "Milica", "Natalia", "Zofia", "Agnieszka", "Tereza", "Veronika", "Olena", "Daria", "Anastasia", "Lucija", "Mia"],
  tr: ["Elif", "Zeynep", "Ayşe", "Merve", "Büşra", "Ece", "Defne", "Selin", "Esra", "Derya", "Melis", "Ceren", "Nazlı", "İrem", "Seda"],
  fa: ["Sara", "Maryam", "Zahra", "Fatemeh", "Neda", "Leila", "Parisa", "Shirin", "Niloofar", "Mahsa", "Yasaman", "Roya", "Azadeh"],
  ja: ["Yui", "Hina", "Sakura", "Aoi", "Mei", "Yuna", "Rin", "Saki", "Miyu", "Haruka", "Ayaka", "Nanami", "Misaki", "Kaho"],
  ko: ["Ji-woo", "Seo-yeon", "Min-seo", "Ha-eun", "Soo-ah", "Ye-jin", "Da-eun", "Ji-min", "Seo-yun", "Yu-na", "Chae-won", "Hye-jin"],
  zh: ["Mei", "Lin", "Xiu", "Jing", "Fang", "Yan", "Hui", "Ling", "Xia", "Ying", "Qing", "Yue"],
  th: ["Ploy", "Fah", "Nok", "Mint", "Ploypailin", "Kanokwan", "Siriporn", "Pimchanok", "Nattaya", "Supaporn", "Anchalee"],
  eu: ["Ane", "Irati", "Maialen", "Nerea", "Leire", "Ainhoa", "Uxue", "Amaia", "Itziar", "Garazi", "Naiara", "Haizea"],
  ms: ["Nur", "Siti", "Aisyah", "Nurul", "Farah", "Aina", "Syafiqah", "Amira", "Hana", "Izzati", "Balqis"],
};
/** Nomes de bebê da moda em cada lugar (menino, menina). */
const BEBES: Record<string, [string[], string[]]> = {
  br: [["Miguel", "Arthur", "Heitor", "Théo", "Davi", "Gael", "Bernardo", "Benjamin", "Lorenzo", "Ravi", "Samuel", "Pedro", "Joaquim", "Bento", "Noah"],
    ["Helena", "Alice", "Laura", "Maitê", "Cecília", "Liz", "Aurora", "Maria Clara", "Valentina", "Heloísa", "Antonella", "Manuela", "Isis", "Lívia", "Ayla"]],
  pt: [["Francisco", "Afonso", "Duarte", "Tomás", "Santiago", "Lourenço", "Martim", "Gabriel", "Gonçalo", "Salvador"], ["Maria", "Leonor", "Matilde", "Carolina", "Benedita", "Alice", "Beatriz", "Francisca", "Constança", "Madalena"]],
  es: [["Mateo", "Santiago", "Thiago", "Benjamín", "Lucas", "Bautista", "Joaquín", "Hugo", "Martín", "Leo", "Dante", "Emiliano"], ["Sofía", "Martina", "Lucía", "Emma", "Olivia", "Isabella", "Valentina", "Catalina", "Julia", "Alma", "Renata", "Mía"]],
  en: [["Oliver", "Noah", "Liam", "Jack", "Leo", "Henry", "Theo", "Arthur", "Lucas", "James", "Mason", "Ethan", "Archie", "Logan"], ["Olivia", "Amelia", "Isla", "Ava", "Lily", "Mia", "Ivy", "Freya", "Charlotte", "Harper", "Evelyn", "Willow", "Grace", "Ella"]],
  fr: [["Gabriel", "Léo", "Raphaël", "Louis", "Jules", "Arthur", "Adam", "Hugo", "Maël", "Noah", "Sacha"], ["Jade", "Louise", "Ambre", "Alba", "Emma", "Rose", "Alice", "Romy", "Anna", "Lina", "Mila"]],
  de: [["Noah", "Leon", "Paul", "Ben", "Finn", "Elias", "Felix", "Emil", "Luca", "Henry", "Jonas"], ["Emilia", "Mia", "Sophia", "Hannah", "Emma", "Lina", "Ella", "Clara", "Mila", "Lea", "Marie"]],
  it: [["Leonardo", "Francesco", "Tommaso", "Edoardo", "Alessandro", "Lorenzo", "Mattia", "Gabriele", "Riccardo", "Andrea"], ["Sofia", "Aurora", "Giulia", "Ginevra", "Vittoria", "Beatrice", "Alice", "Ludovica", "Emma", "Matilde"]],
  nl: [["Noah", "Sem", "Luca", "Liam", "Lucas", "Daan", "Finn", "Levi", "Milan", "Bram"], ["Emma", "Julia", "Mila", "Tess", "Sophie", "Zoë", "Sara", "Nora", "Yara", "Liv"]],
  ar: [["Mohammed", "Omar", "Yousef", "Adam", "Zayd", "Hamza", "Ali", "Ibrahim", "Rayan", "Karim"], ["Maryam", "Fatima", "Layla", "Jana", "Lina", "Salma", "Nour", "Aya", "Hana", "Malak"]],
  afr: [["Moussa", "Mamadou", "Ibrahima", "Cheikh", "Amadou", "Ousmane", "Abdoulaye", "Souleymane"], ["Aminata", "Fatou", "Awa", "Mariama", "Khady", "Aïcha", "Binta", "Coumba"]],
  afe: [["Chinedu", "Kwame", "Kofi", "Tunde", "Emeka", "Obinna", "Femi", "Sipho", "David"], ["Amara", "Chioma", "Adaeze", "Ama", "Zainab", "Ife", "Esi", "Thandi", "Grace"]],
  nord: [["William", "Noah", "Oscar", "Lucas", "Emil", "Hugo", "Elias", "Oliver", "Isak", "Liam"], ["Alma", "Ella", "Nora", "Olivia", "Ebba", "Freja", "Maja", "Saga", "Astrid", "Selma"]],
  slav: [["Luka", "Jakub", "David", "Mateo", "Filip", "Antoni", "Ivan", "Marko", "Nikola", "Jan"], ["Mia", "Zofia", "Ema", "Lucija", "Hana", "Ana", "Eliška", "Sofia", "Mila", "Maja"]],
  tr: [["Yusuf", "Eymen", "Alparslan", "Miraç", "Ömer", "Aras", "Kerem", "Ali", "Mustafa"], ["Zeynep", "Elif", "Defne", "Asel", "Eylül", "Azra", "Nehir", "Ela", "Mira"]],
  fa: [["Amir", "Ali", "Mohammad", "Hossein", "Arshia", "Ilya", "Parsa", "Kian"], ["Fatemeh", "Zahra", "Helma", "Hasti", "Yasna", "Rozhina", "Asal", "Nazanin"]],
  ja: [["Haruto", "Minato", "Aoi", "Sota", "Ren", "Yuito", "Riku", "Itsuki"], ["Himari", "Tsumugi", "Mei", "Rin", "Yui", "Sana", "Hina", "Aoi"]],
  ko: [["Seo-jun", "Ha-jun", "Do-yun", "Eun-woo", "Si-woo", "Ji-ho", "Ye-jun", "Yu-jun"], ["Seo-ah", "Ha-yun", "Ji-an", "Ha-eun", "Seo-yun", "A-rin", "Ji-yu", "Yun-seo"]],
  zh: [["Hao", "Yu", "Zihan", "Haoran", "Yichen", "Mingyu", "Junjie", "Jiahao"], ["Yuxi", "Zixuan", "Xinyi", "Ruoxi", "Yutong", "Shiyu", "Mengqi", "Jiayi"]],
  th: [["Krit", "Phum", "Tawan", "Nont", "Pakorn", "Thanakorn"], ["Pim", "Ploy", "Praewa", "Nicha", "Kanyarat", "Fah"]],
  eu: [["Markel", "Aimar", "Oier", "Ibai", "Ekain", "Unax", "Julen", "Jon"], ["June", "Irati", "Nahia", "Ane", "Uxue", "Lucía", "Izaro", "Haizea"]],
  ms: [["Muhammad", "Aryan", "Rayyan", "Adam", "Harith", "Aidan", "Danish", "Iman"], ["Nur", "Aisyah", "Hana", "Sofea", "Puteri", "Alya", "Amna", "Medina"]],
};

/** Língua dos nomes de um país (código FIFA de 3 letras). Sem lista própria, vale o inglês. */
export function linguaDe(pais: string | undefined): string {
  const l = LINGUA[pais ?? ""] ?? "en";
  return FEMININOS[l] ? l : "en";
}
/** Sobrenome feminino nos lugares onde ele muda (eslavos: -ski vira -ska, -ov vira -ova). */
function noFeminino(s: string, l: string): string {
  if (l !== "slav") return s;
  return s.replace(/ski$/, "ska").replace(/cki$/, "cka").replace(/(ov|ev|in)$/, "$1a");
}
export function sobrenomeDe(rng: RNG, pais: string | undefined, feminino = false): string {
  const l = linguaDe(pais), p = POOLS[l] ?? POOLS.en;
  return feminino ? noFeminino(rng.pick(p.sobrenomes), l) : rng.pick(p.sobrenomes);
}
/** Nome e sobrenome de uma mulher desse país (na mesma ordem dos nomes dos jogadores). */
export function nomeFeminino(rng: RNG, pais: string | undefined): string {
  const l = linguaDe(pais);
  return `${rng.pick(FEMININOS[l])} ${sobrenomeDe(rng, pais, true)}`;
}
export function primeiroNome(rng: RNG, pais: string | undefined, feminino: boolean): string {
  const l = linguaDe(pais);
  return feminino ? rng.pick(FEMININOS[l]) : rng.pick((POOLS[l] ?? POOLS.en).primeiros);
}
/** Sugestões de nome de bebê: o que está na moda no lugar (e, se for diferente, no país do pai). */
export function sugestoesBebe(rng: RNG, paises: string[], menina: boolean, n = 6): string[] {
  const ls = [...new Set(paises.map(linguaDe))], out: string[] = [];
  for (let t = 0; out.length < n && t < 60; t++) {
    const l = ls[t % ls.length], lista = BEBES[l]?.[menina ? 1 : 0] ?? BEBES.en[menina ? 1 : 0], x = rng.pick(lista);
    if (!out.includes(x)) out.push(x);
  }
  return out;
}
/** A lista inteira de primeiros nomes de um país (para quem precisa sortear sem repetir). */
export function nomesDoPais(pais: string | undefined, feminino: boolean): string[] {
  const l = linguaDe(pais);
  return feminino ? FEMININOS[l] : (POOLS[l] ?? POOLS.en).primeiros;
}
