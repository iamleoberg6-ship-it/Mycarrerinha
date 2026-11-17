// Curvas de desenvolvimento: cada jogador (o seu e os do mundo) tem um jeito de crescer.
// Estourou cedo (tipo Mbappé): explode antes dos 21 e segura o nível por muitos anos.
// Auge cedo (tipo Neymar): cresce rápido até uns 24 e depois para, e cai mais cedo.
// Normal: sobe bem até uns 23, devagar até 27.
// Sobe aos poucos: nunca dá salto, mas continua melhorando até perto dos 30.
// Floresce tarde (tipo Rodri): demora a aparecer e cresce forte dos 24 aos 28; o potencial também sobe nessa idade.
// Vinho do Porto (tipo Modrić): cresce normal e demora muito a cair.
import { clamp } from "./rng.js";

export type Curva = "precoce" | "picoCedo" | "normal" | "constante" | "tardio" | "longevo";
export const CURVAS: Curva[] = ["precoce", "picoCedo", "normal", "constante", "tardio", "longevo"];
export const NOME_CURVA: Record<Curva, string> = { precoce: "Estourou cedo", picoCedo: "Auge cedo", normal: "Evolução normal", constante: "Sobe aos poucos", tardio: "Floresce tarde", longevo: "Vinho do Porto" };
export const TEXTO_CURVA: Record<Curva, string> = {
  precoce: "Explode antes dos 21 e segura o nível por muitos anos (tipo Mbappé). Depois disso, quase não sobe mais.",
  picoCedo: "Cresce muito rápido até uns 24 anos e para ali; o corpo cobra mais cedo (tipo Neymar).",
  normal: "Cresce bem até uns 23 anos e um pouco até os 27.",
  constante: "Nunca dá um salto, mas vai melhorando um pouco por ano até perto dos 30.",
  tardio: "Demora a aparecer: cresce forte dos 24 aos 28 e o potencial sobe nessa fase (tipo Rodri).",
  longevo: "Cresce normal e demora muito a cair: joga em alto nível até tarde (tipo Modrić).",
};
const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** A curva de um jogador (sempre a mesma para o mesmo nome). */
export function curvaDe(chave: string): Curva {
  const x = (hash(`curva|${chave}`) % 1000) / 1000;
  return x < 0.11 ? "precoce" : x < 0.21 ? "picoCedo" : x < 0.6 ? "normal" : x < 0.75 ? "constante" : x < 0.91 ? "tardio" : "longevo";
}
/** Ritmo de crescimento por idade (multiplica o ganho do treino; a "normal" é a curva antiga do jogo). */
export function fIdadeCurva(curva: Curva, idade: number): number {
  const t: Record<Curva, [number, number][]> = {
    normal: [[19, 1.3], [23, 1.1], [26, 0.8], [28, 0.3], [30, 0.1]],
    precoce: [[19, 1.85], [21, 1.5], [23, 0.75], [26, 0.35], [28, 0.15], [30, 0.05]],
    picoCedo: [[19, 1.55], [22, 1.45], [24, 1.0], [25, 0.3], [27, 0.1]],
    constante: [[19, 0.95], [23, 0.9], [26, 0.85], [28, 0.65], [30, 0.4], [31, 0.15]],
    tardio: [[19, 0.75], [23, 0.7], [26, 1.25], [28, 1.05], [30, 0.5], [31, 0.2]],
    longevo: [[19, 1.25], [23, 1.1], [26, 0.85], [28, 0.4], [30, 0.15], [32, 0.05]],
  };
  for (const [ate, f] of t[curva]) if (idade <= ate) return f;
  return 0;
}
/** Quanto o declínio pesa (e a partir de quando): 1 = normal. Devolve a idade "do corpo" usada no declínio. */
export function idadeDoDeclinio(curva: Curva, idade: number): number {
  return curva === "picoCedo" ? idade + 2 : curva === "longevo" ? idade - 3 : curva === "precoce" ? idade - 1 : curva === "tardio" ? idade - 1 : idade;
}
export const fDeclinioCurva = (curva: Curva) => (curva === "longevo" ? 0.5 : curva === "precoce" ? 0.75 : curva === "picoCedo" ? 1.35 : curva === "tardio" ? 0.85 : 1);
/** Quanto o potencial escondido sobe num ano para quem floresce tarde (0 para os outros). */
export function potTardio(curva: Curva, idade: number, sorte: number): number {
  if (curva !== "tardio" || idade < 23 || idade > 27) return 0;
  return sorte < 0.35 ? 1 : sorte < 0.85 ? 2 : 3;
}
/** Até que idade dá para esticar o potencial com trabalho (cada curva tem o seu limite). */
export const idadeLimiteSuperacao = (curva: Curva) => ({ precoce: 28, picoCedo: 27, normal: 29, constante: 31, tardio: 32, longevo: 31 } as Record<Curva, number>)[curva];
export const fSuperacaoCurva = (curva: Curva, idade: number) => clamp(curva === "tardio" && idade >= 24 ? 1.2 : curva === "constante" ? 1.1 : curva === "precoce" && idade >= 22 ? 0.75 : 1, 0.5, 1.5);
