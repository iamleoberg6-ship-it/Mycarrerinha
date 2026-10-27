// Saúde e longevidade: o corpo acumula desgaste (jogos, intensidade, cansaço, noitadas, idade) e se recupera com
// descanso, boa alimentação e uma equipe particular (fisioterapeuta, nutricionista, preparador, psicólogo). Lesões
// graves podem deixar uma lesão crônica. Tudo isso mexe no risco de lesão, na recuperação e no quanto o corpo cai
// com a idade. Os exames mostram a "idade do corpo" e até quando dá para jogar em alto nível.
import { RNG, clamp } from "./rng.js";

export type Staff = "fisio" | "nutri" | "preparador" | "psicologo";
export const STAFF: Record<Staff, { nome: string; custo: number; desc: string }> = {
  fisio: { nome: "Fisioterapeuta particular", custo: 18_000, desc: "Menos lesão, volta mais rápido e trata as dores crônicas." },
  nutri: { nome: "Nutricionista", custo: 12_000, desc: "Recupera melhor entre os jogos e o físico cai mais devagar com a idade." },
  preparador: { nome: "Preparador físico", custo: 25_000, desc: "Treino sob medida: evolui um pouco mais e segura o declínio." },
  psicologo: { nome: "Psicólogo do esporte", custo: 15_000, desc: "Moral mais estável e menos pressão nas costas." },
};
export type ParteCorpo = "joelho" | "tornozelo" | "coxa" | "lombar" | "pubis";
export const NOME_PARTE: Record<ParteCorpo, string> = { joelho: "Joelho", tornozelo: "Tornozelo", coxa: "Posterior da coxa", lombar: "Lombar", pubis: "Púbis" };
export interface Cronica { parte: ParteCorpo; nivel: 1 | 2 | 3; desde: number; tratando?: boolean }
export interface EstadoSaude { desgaste: number; cronicas: Cronica[]; equipe: Partial<Record<Staff, boolean>>; lesoesGraves: number }
export const novaSaude = (): EstadoSaude => ({ desgaste: 20, cronicas: [], equipe: {}, lesoesGraves: 0 });

export const custoEquipe = (sd: EstadoSaude) => (Object.keys(sd.equipe) as Staff[]).filter((k) => sd.equipe[k]).reduce((a, k) => a + STAFF[k].custo, 0);
const temStaff = (sd: EstadoSaude, k: Staff) => !!sd.equipe[k];
const pesoCronicas = (sd: EstadoSaude) => sd.cronicas.reduce((a, c) => a + c.nivel, 0);

/** Multiplicador do risco de lesão (1 = normal). */
export function riscoLesaoSaude(sd: EstadoSaude): number {
  return clamp((1 + (sd.desgaste - 30) / 90 + 0.12 * pesoCronicas(sd)) * (temStaff(sd, "fisio") ? 0.78 : 1), 0.6, 2.2);
}
/** Multiplicador do declínio pela idade (1 = normal): corpo gasto cai mais rápido, equipe e cuidado seguram. */
export function fatorDeclinio(sd: EstadoSaude): number {
  return clamp(0.8 + (sd.desgaste / 100) * 0.55 + 0.06 * pesoCronicas(sd) - (temStaff(sd, "nutri") ? 0.12 : 0) - (temStaff(sd, "preparador") ? 0.1 : 0), 0.5, 1.45);
}
/** Recuperação extra do cansaço por semana. */
export const recuperacaoSaude = (sd: EstadoSaude) => (temStaff(sd, "nutri") ? 3 : 0) + (temStaff(sd, "fisio") ? 2 : 0) - Math.max(0, (sd.desgaste - 60) / 10);
/** Idade do corpo pelos exames. */
export function idadeDoCorpo(sd: EstadoSaude, idade: number): number {
  const equipe = (Object.keys(sd.equipe) as Staff[]).filter((k) => sd.equipe[k]).length;
  return Math.round((idade + (sd.desgaste - 30) / 7 + 0.8 * pesoCronicas(sd) - 0.3 * equipe) * 10) / 10;
}
/** Até que idade, pelos exames, dá para jogar em alto nível (a resposta muda com o desgaste e o cuidado). */
export function previsaoAltoNivel(sd: EstadoSaude, idade: number, profissionalismo: number): number {
  const corpo = idadeDoCorpo(sd, idade) - idade;
  return Math.round(clamp(33.5 + profissionalismo / 10 - corpo * 0.9 - 0.5 * pesoCronicas(sd), 29, 41));
}
export function rotuloCorpo(d: number): string {
  return d < 20 ? "Inteiro" : d < 40 ? "Em dia" : d < 60 ? "Cansado" : d < 80 ? "Desgastado" : "No limite";
}

export interface CtxSaudeSemana { minutos: number; intensidadeAlta: boolean; cansaco: number; vidaNoturna: number; idade: number; descansos: number; alimentacao: number; recuperacaoCasa: number; lesaoNova: number; ano: number }
export interface SemanaSaude { avisos: string[]; lesao?: number; moral: number; pressao: number; noticia?: string }
export function semanaSaude(sd: EstadoSaude, rng: RNG, x: CtxSaudeSemana): SemanaSaude {
  const r: SemanaSaude = { avisos: [], moral: 0, pressao: 0 };
  // o desgaste caminha para o nível que a rotina impõe: carga de jogo, intensidade, cansaço, noitadas e idade sobem;
  // descanso, equipe, boa alimentação e uma casa confortável seguram
  const alvo = 16 + (x.minutos / 90) * 22 + (x.intensidadeAlta ? 8 : 0) + (x.cansaco > 70 ? 8 : 0) + x.vidaNoturna / 6 + Math.max(0, x.idade - 26) * 3.2
    - 4 * x.descansos - (temStaff(sd, "fisio") ? 6 : 0) - (temStaff(sd, "nutri") ? 5 : 0) - 2 * x.alimentacao - x.recuperacaoCasa / 2;
  sd.desgaste = clamp(sd.desgaste + (clamp(alvo, 0, 100) - sd.desgaste) * 0.08, 0, 100);
  // lesão grave nesta semana: pode virar crônica
  if (x.lesaoNova >= 6) {
    sd.lesoesGraves++;
    const chance = 0.25 + 0.1 * (sd.lesoesGraves - 1) + (temStaff(sd, "fisio") ? -0.1 : 0);
    if (rng.chance(chance)) {
      const ja = sd.cronicas.length ? rng.pick(sd.cronicas) : undefined;
      if (ja && rng.chance(0.5)) { ja.nivel = Math.min(3, ja.nivel + 1) as Cronica["nivel"]; r.avisos.push(`A lesão piorou a dor crônica no ${NOME_PARTE[ja.parte].toLowerCase()}.`); }
      else {
        const livres = (Object.keys(NOME_PARTE) as ParteCorpo[]).filter((p) => !sd.cronicas.some((c) => c.parte === p));
        if (livres.length) { const parte = rng.pick(livres); sd.cronicas.push({ parte, nivel: 1, desde: x.ano }); r.avisos.push(`Os exames mostram uma lesão crônica: ${NOME_PARTE[parte].toLowerCase()}.`); r.noticia = `${NOME_PARTE[parte]}: a lesão vira problema crônico`; }
      }
    }
  }
  // dores crônicas: crise de vez em quando; o tratamento (com fisioterapeuta) faz o nível cair aos poucos
  for (const c of sd.cronicas) {
    if (c.tratando && temStaff(sd, "fisio") && rng.chance(0.04)) {
      if (c.nivel === 1) { sd.cronicas = sd.cronicas.filter((y) => y !== c); r.avisos.push(`Alta do tratamento: o ${NOME_PARTE[c.parte].toLowerCase()} não dói mais.`); r.moral += 4; continue; }
      c.nivel = (c.nivel - 1) as Cronica["nivel"]; r.avisos.push(`O tratamento do ${NOME_PARTE[c.parte].toLowerCase()} está funcionando.`);
    }
    if (x.minutos > 0 && rng.chance(0.012 * c.nivel * (c.tratando ? 0.6 : 1))) { r.lesao = Math.max(r.lesao ?? 0, rng.int(1, 1 + c.nivel)); r.avisos.push(`Crise no ${NOME_PARTE[c.parte].toLowerCase()}: fora por uns dias.`); }
  }
  if (temStaff(sd, "psicologo")) { r.moral += 0.6; r.pressao -= 1.2; }
  if (sd.desgaste >= 80 && rng.chance(0.15)) r.avisos.push("O corpo está pedindo descanso: desgaste no limite.");
  return r;
}
/** Férias do fim de temporada. */
export function feriasSaude(sd: EstadoSaude) { sd.desgaste = clamp(sd.desgaste - 8, 0, 100); }
/** Cirurgia: fica fora um tempo e quase sempre resolve. */
export function operar(sd: EstadoSaude, parte: ParteCorpo, rng: RNG): { semanas: number; curou: boolean; msg: string } {
  const c = sd.cronicas.find((x) => x.parte === parte);
  if (!c) return { semanas: 0, curou: false, msg: "Nada para operar aí." };
  const semanas = 6 + 2 * c.nivel + rng.int(0, 3), curou = rng.chance(0.8);
  if (curou) sd.cronicas = sd.cronicas.filter((x) => x !== c); else c.nivel = 1;
  sd.desgaste = clamp(sd.desgaste - 10, 0, 100);
  return { semanas, curou, msg: curou ? `Cirurgia no ${NOME_PARTE[parte].toLowerCase()} deu certo. ${semanas} semanas de recuperação.` : `Cirurgia feita, mas ainda vai doer um pouco. ${semanas} semanas fora.` };
}
