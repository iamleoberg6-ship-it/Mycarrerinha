// Vida fora do campo de cada jogador do mundo: origem, família, jeito, hobby e sonho. Não guarda nada no save:
// é sorteada de forma fixa pelo nome e pela idade, então o mesmo jogador tem a mesma vida em qualquer carreira.
import { RNG } from "./rng.js";

export interface VidaNPC { origem: string; familia: string[]; jeito: string[]; hobby: string; sonho: string }

const ORIGENS = [
  "Cresceu numa casa simples, jogando na rua até escurecer.",
  "Filho de professores: estudou antes de virar profissional.",
  "Começou na escolinha do bairro aos 6 anos, com a bola que o pai comprou.",
  "Filho único de um mecânico; a mãe ainda é quem mais cobra.",
  "Veio do interior com a família inteira para tentar a sorte na capital.",
  "Criado pela avó, que até hoje não perde um jogo dele pela TV.",
  "Teve uma infância difícil e a bola foi o refúgio dele.",
  "De uma família de agricultores; quer comprar uma terra para os pais.",
];
const JEITOS = [
  "Líder no vestiário, fala com todo mundo.",
  "Brincalhão: sempre tem uma piada na hora errada.",
  "Fechado: fala pouco, mas é respeitado.",
  "Competitivo até no treino.",
  "Tranquilo: nada o tira do sério.",
  "Pavio curto dentro de campo.",
  "Reza antes de cada jogo e faz questão de contar.",
  "Gosta de aparecer e de ser reconhecido.",
  "Caseiro: prefere a casa a qualquer festa.",
  "Ajuda os mais novos do elenco sem alarde.",
];
const HOBBIES = ["pescaria", "videogame", "churrasco com a família", "música sertaneja", "surfe", "cozinhar", "ler", "cinema", "golfe", "pagode", "jogar cartas", "cuidar de cachorros"];
const SONHOS = [
  "ser campeão da Libertadores", "jogar uma Copa do Mundo", "abrir uma escolinha de futebol", "voltar para a cidade natal",
  "ganhar a Bola de Ouro", "comprar a casa da mãe", "morar fora do país", "ser técnico um dia",
];
const FAMILIA_SOLTEIRA = ["Solteiro, sem filhos.", "Solteiro e sem pressa de casar.", "Namora firme, ainda sem filhos."];

/** A vida de um jogador do mundo: sempre a mesma para o mesmo nome (e para a mesma idade, na família). */
export function vidaDe(nome: string, idade: number): VidaNPC {
  const r = new RNG(`vida|${nome}`), f = new RNG(`familia-npc|${nome}|${Math.floor(idade / 3)}`);
  const familia: string[] = [];
  if (idade < 23) familia.push(f.pick(FAMILIA_SOLTEIRA));
  else if (f.chance(0.45)) familia.push(f.pick(FAMILIA_SOLTEIRA));
  else {
    const filhos = f.int(1, 3);
    familia.push(`Casado${f.chance(0.5) ? "" : " (ou quase)"}, ${filhos === 1 ? "um filho" : `${filhos} filhos`}.`);
  }
  const jeitos = [...JEITOS].sort(() => r.next() - 0.5).slice(0, 2);
  return { origem: r.pick(ORIGENS), familia, jeito: jeitos, hobby: r.pick(HOBBIES), sonho: r.pick(SONHOS) };
}
