// Carreira completa de um jogador, semana a semana. As decisões vêm de uma "política"
// (no jogo, do usuário; no balanceamento, de uma IA simples), para o motor rodar sem interface.
import { RNG, clamp } from "./rng.js";
import {
  type Atributos, type Posicao, type Grupo, type Personalidade, type Participacao, type Intensidade,
  ATRIBUTOS, GRUPO, peso, ovr as calcOvr, atributosIniciais, sortearPotencial, sortearPersonalidade, evoluirSemana,
} from "./atributos.js";
import { simularPlacar, desempenhoJogador, sortearLesao, pontuacaoTitular, VAGAS_433 } from "./partida.js";
import { type Liga, type Clube, type LinhaTabela, tabelaTurnoReturno, novaTabela, registrar, ordenar } from "./liga.js";
import {
  type TipoAgente, type Proposta, AGENTES, valorMercado, salarioMensal, gerarPropostas, clubeAceitaVenda, seguidoresDaFama,
  ambientacaoInicial, deltaAmbientacao, fAmb, filaNaPosicao,
} from "./mercado.js";

export type Origem = "humilde" | "media" | "rica";

export interface Contrato {
  clubeId: string;
  ligaId: string;
  salario: number; // R$ por mês, bruto
  anosRestantes: number;
  formacao: boolean;
}

export interface TemporadaResumo {
  ano: number; idade: number; clube: string; liga: string; ovr: number; jogos: number; titular: number;
  gols: number; assist: number; notaMedia: number; salario: number; vm: number; patrimonio: number; posicaoLiga: number; titulo: boolean;
}

export interface Bens { imovel: number; carro: number }

export const CALIB_VIDA = {
  rendaFixaMes: 0.005, // rendimento real mensal da renda fixa
  estiloNiveis: [2000, 8000, 30000, 100000, 300000],
  fracaoEstilo: 0.35, // política: gasta até 35% da renda líquida em estilo de vida
};

const DINHEIRO_INICIAL: Record<Origem, number> = { humilde: 2000, media: 20000, rica: 200000 };

export class Carreira {
  rng: RNG;
  mundo: Liga[];
  // identidade
  posicao: Posicao;
  nacionalidade = "BRA";
  origem: Origem;
  pot: number;
  personalidade: Personalidade;
  // estado
  at: Atributos;
  idade = 16;
  ano = 0;
  liga!: Liga;
  clube!: Clube;
  contrato!: Contrato;
  agente: TipoAgente = "pai";
  moral = 60;
  fama = 0;
  cansaco = 0;
  lesao = 0;
  formaUlt: number[] = [];
  ambientacao = 80;
  relTecnico = 50;
  // finanças
  caixa: number;
  investimentos = 0;
  bens: Bens = { imovel: 0, carro: 0 };
  patrocinioAnual = 0;
  // estatística
  aposentado = false;
  private ultimaTransferencia = -99; // semana absoluta
  private semanaAbs = 0;
  private clubesRecentes: string[] = [];
  historico: TemporadaResumo[] = [];
  totais = { jogos: 0, gols: 0, assist: 0, titulos: 0, lesoes: 0, semanasLesionado: 0, transferencias: 0, clubes: new Set<string>(), nivelMax: 5 as number, salarioMax: 0, ovrMax: 0, idadeOvrMax: 16 };
  private temp = { jogos: 0, titular: 0, gols: 0, assist: 0, notas: [] as number[], titularUlt: [] as boolean[] };

  constructor(seed: string, mundo: Liga[], opts?: { posicao?: Posicao; origem?: Origem; potencial?: number }) {
    this.rng = new RNG(seed);
    this.mundo = mundo;
    this.posicao = opts?.posicao ?? this.rng.pick(["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as Posicao[]);
    this.origem = opts?.origem ?? this.rng.pick(["humilde", "humilde", "media", "rica"] as Origem[]);
    this.pot = opts?.potencial ?? sortearPotencial(this.rng);
    this.personalidade = sortearPersonalidade(this.rng);
    this.at = atributosIniciais(this.rng, this.posicao);
    this.caixa = DINHEIRO_INICIAL[this.origem];
    // começa na base de um clube brasileiro
    const ligaInicial = this.rng.chance(0.7) ? this.ligaPorId("BRA1") : this.ligaPorId("BRA2");
    this.entrarNoClube(ligaInicial, this.rng.pick(ligaInicial.clubes), { salario: 3000, anos: 2, formacao: true }, true);
  }

  get ovr(): number { return calcOvr(this.at, this.posicao); }
  get forma(): number { return this.formaUlt.length ? this.formaUlt.reduce((a, b) => a + b, 0) / this.formaUlt.length : 6.5; }
  get patrimonio(): number { return this.caixa + this.investimentos + this.bens.imovel + this.bens.carro; }
  get vm(): number { return valorMercado(this.ovr, this.idade, this.contrato.anosRestantes, this.liga.fLiga); }

  ligaPorId(id: string): Liga { return this.mundo.find((l) => l.id === id)!; }

  private entrarNoClube(liga: Liga, clube: Clube, c: { salario: number; anos: number; formacao?: boolean }, inicial = false) {
    this.liga = liga;
    this.clube = clube;
    this.contrato = { clubeId: clube.id, ligaId: liga.id, salario: c.salario, anosRestantes: c.anos, formacao: !!c.formacao };
    this.ambientacao = inicial ? 80 : ambientacaoInicial(this.nacionalidade, liga, clube, this.personalidade.profissionalismo);
    this.relTecnico = 50;
    this.totais.clubes.add(clube.id);
    this.totais.nivelMax = Math.min(this.totais.nivelMax, liga.nivel);
    if (!inicial) { this.totais.transferencias++; this.ultimaTransferencia = this.semanaAbs; }
    this.clubesRecentes = [...this.clubesRecentes.slice(-2), clube.id];
  }

  // ---------- política (IA de balanceamento) ----------
  private escolherFoco(): Grupo {
    const gap: Record<Grupo, number> = { fisico: 0, tecnico: 0, tatico: 0 };
    for (const a of ATRIBUTOS) gap[GRUPO[a]] += peso(this.posicao, a) * Math.max(0, this.pot - this.at[a]);
    return (Object.entries(gap).sort((a, b) => b[1] - a[1])[0][0]) as Grupo;
  }
  private escolherIntensidade(): Intensidade {
    return this.cansaco > 60 ? "leve" : "normal";
  }
  private avaliarProposta(p: Proposta): number {
    const titularAqui = filaNaPosicao(this.clube, this.posicao, this.ovr) < VAGAS_433[this.posicao];
    const ambicao = this.personalidade.ambicao / 20;
    return 1.5 * (p.clube.forca - this.clube.forca) + (p.titularProvavel ? 6 : -6) - (titularAqui ? 4 : -4)
      + (4 + 4 * ambicao) * Math.log(p.salario / Math.max(3000, this.contrato.salario)) + 3 * (this.liga.nivel - p.liga.nivel);
  }
  private atualizarAgente() {
    if (this.agente !== "top" && (this.ovr >= 75 || this.fama >= 50)) this.agente = "top";
    else if ((this.agente === "pai" || this.agente === "iniciante") && (this.ovr >= 65 || this.fama >= 20)) this.agente = "experiente";
    else if (this.agente === "pai" && this.idade >= 18 && this.ovr >= 55 && this.origem !== "humilde") this.agente = "iniciante";
  }

  // ---------- semana ----------
  private titularidade(): { participa: Participacao; minutos: number } {
    if (this.lesao > 0) return { participa: "naoJogou", minutos: 0 };
    const pos = this.posicao;
    const rivais = this.clube.elenco.filter((j) => j.posicao === pos).map((j) => j.ovr);
    const meu = pontuacaoTitular(this.ovr, this.forma, this.relTecnico, this.cansaco);
    const rank = rivais.filter((o) => pontuacaoTitular(o, 6.5, 50, 0) > meu).length;
    const vagas = VAGAS_433[pos];
    if (this.idade < 18 && rank > vagas) return { participa: "base", minutos: 0 };
    if (rank < vagas) return { participa: "titular", minutos: 90 };
    if (rank === vagas && this.rng.chance(0.5)) return { participa: "entrou", minutos: this.rng.int(15, 35) };
    if (this.idade <= 19) return { participa: "base", minutos: 0 };
    return { participa: "naoJogou", minutos: 0 };
  }

  private jogarRodada(tab: LinhaTabela[], jogos: [number, number][], meuIdx: number) {
    const { participa, minutos } = this.titularidade();
    const clubes = this.liga.clubes;
    for (const [a, b] of jogos) {
      const souCasa = a === meuIdx, souFora = b === meuIdx;
      let fa = clubes[a].forca, fb = clubes[b].forca;
      if ((souCasa || souFora) && participa === "titular") {
        const bonus = (this.ovr * fAmb(this.ambientacao) - this.clube.forca) / 11;
        if (souCasa) fa += bonus; else fb += bonus;
      }
      const [gc, gf] = simularPlacar(this.rng, fa, fb);
      registrar(tab[a], gc, gf);
      registrar(tab[b], gf, gc);
      if ((souCasa || souFora) && minutos > 0) {
        const golsTime = souCasa ? gc : gf, golsSofridos = souCasa ? gf : gc;
        const ovrEf = this.ovr * fAmb(this.ambientacao) * (0.92 + (0.08 * this.moral) / 100) * (this.cansaco > 70 ? 0.9 : 1);
        const d = desempenhoJogador(this.rng, {
          posicao: this.posicao, ovrEfetivo: ovrEf, fin: this.at.FIN, passeOuCruz: Math.max(this.at.PAS, this.at.CRU),
          minutos, golsTime, golsSofridos, fAdv: souCasa ? fb : fa,
        });
        this.temp.jogos++; this.temp.gols += d.gols; this.temp.assist += d.assistencias; this.temp.notas.push(d.nota);
        if (participa === "titular") this.temp.titular++;
        this.formaUlt = [...this.formaUlt.slice(-4), d.nota];
        this.moral = clamp(this.moral + 4 * (d.nota - 6.5), 0, 100);
        const grande = this.clube.forca >= 75 ? 1.5 : 1;
        this.fama = clamp(this.fama + grande * (0.5 * d.gols + (d.nota >= 8 ? 0.3 : 0)), 0, 100);
        this.relTecnico = clamp(this.relTecnico + (d.nota - 6.5), 0, 100);
        this.cansaco = clamp(this.cansaco + (30 * minutos) / 90, 0, 100);
        const l = sortearLesao(this.rng, this.cansaco, false, this.idade, this.temNutricionista() ? 0.15 : 0);
        if (l) { this.lesao = l.semanas; this.totais.lesoes++; }
      }
    }
    this.temp.titularUlt = [...this.temp.titularUlt.slice(-18), participa === "titular"];
    if (participa === "naoJogou" && this.lesao === 0) this.moral = clamp(this.moral - 3, 0, 100);
    return participa;
  }

  private semana(participa: Participacao) {
    if (this.lesao > 0) { this.lesao--; this.totais.semanasLesionado++; participa = "ferias"; }
    this.at = evoluirSemana(this.at, this.pot, {
      idade: this.idade, foco: this.escolherFoco(), intensidade: this.escolherIntensidade(), participacao: participa,
      moral: this.moral, personalTrainer: this.temPersonal(), profissionalismo: this.personalidade.profissionalismo,
    });
    this.cansaco = clamp(this.cansaco - 20, 0, 100);
    this.moral = clamp(this.moral + 0.1 * (60 - this.moral), 0, 100);
    const comp = this.clube.elenco.filter((j) => j.nacionalidade === this.nacionalidade).length;
    this.ambientacao = clamp(this.ambientacao + deltaAmbientacao(comp, participa === "titular"), 0, 100);
    if (participa !== "titular" && participa !== "entrou") this.fama = clamp(this.fama * 0.99, 0, 100);
  }

  // ---------- finanças (mensal) ----------
  private rendaLiquidaMensal(): number {
    const s = this.contrato.salario;
    const ir = 0.275 * Math.max(0, s - 5000);
    return s - ir - AGENTES[this.agente].comissao * s + this.patrocinioAnual / 12;
  }
  private temPersonal() { return this.rendaLiquidaMensal() >= 60000; }
  private temNutricionista() { return this.rendaLiquidaMensal() >= 40000; }
  private mes() {
    const liquida = this.rendaLiquidaMensal();
    const niveis = CALIB_VIDA.estiloNiveis;
    const estilo = [...niveis].reverse().find((c) => c <= CALIB_VIDA.fracaoEstilo * liquida) ?? niveis[0];
    const equipe = (this.temPersonal() ? 15000 : 0) + (this.temNutricionista() ? 10000 : 0);
    const manutencao = 0.001 * this.bens.imovel + 0.006 * this.bens.carro;
    const aluguel = this.bens.imovel === 0 && this.idade >= 18 ? Math.min(0.15 * liquida, 15000) : 0;
    this.caixa += liquida - estilo - equipe - manutencao - aluguel;
    this.investimentos *= 1 + CALIB_VIDA.rendaFixaMes;
    // política de compras e investimento
    const casas = [400000, 2500000, 15000000];
    const carros = [90000, 600000, 3000000];
    const proxCasa = casas.find((v) => v > this.bens.imovel);
    if (proxCasa && this.caixa + this.investimentos > 2 * proxCasa) this.comprar("imovel", proxCasa);
    const proxCarro = carros.find((v) => v > this.bens.carro);
    if (proxCarro && this.caixa + this.investimentos > 4 * proxCarro && (proxCarro < 3e6 || this.fama >= 60)) this.comprar("carro", proxCarro);
    const reserva = 6 * Math.max(estilo, 2000);
    if (this.caixa > reserva) { this.investimentos += this.caixa - reserva; this.caixa = reserva; }
    if (this.caixa < 0 && this.investimentos > 0) { const t = Math.min(this.investimentos, -this.caixa); this.investimentos -= t; this.caixa += t; }
  }
  private comprar(tipo: keyof Bens, valor: number) {
    const revenda = tipo === "carro" ? this.bens.carro * 0.8 : this.bens.imovel;
    let custo = valor - revenda;
    const doCaixa = Math.min(this.caixa, custo); this.caixa -= doCaixa; custo -= doCaixa;
    this.investimentos -= custo;
    this.bens[tipo] = valor;
  }

  // ---------- mercado ----------
  private janela(): void {
    this.atualizarAgente();
    const pct = this.temp.titularUlt.length ? this.temp.titularUlt.filter(Boolean).length / this.temp.titularUlt.length : 0;
    const livre = this.contrato.anosRestantes <= 0;
    if (!livre && this.semanaAbs - this.ultimaTransferencia < 52) return; // fica pelo menos um ano
    const props = gerarPropostas(this.rng, {
      ovr: this.ovr, pot: this.pot, idade: this.idade, posicao: this.posicao, nacionalidade: this.nacionalidade, fama: this.fama,
      seguidores: seguidoresDaFama(this.fama), pctTitular: pct, ligaAtual: this.liga, clubeAtual: livre ? null : this.clube,
      anosContrato: this.contrato.anosRestantes, agente: this.agente, continental: false, selecao: false, salarioAtual: this.contrato.salario,
    }, this.mundo, this.fama);
    if (!props.length) {
      if (livre && this.idade < 30) {
        // ninguém quis: fica no clube com contrato curto e salário menor
        const s = salarioMensal({ ovr: this.ovr, idade: this.idade, liga: this.liga, clube: this.clube, agente: this.agente, fama: this.fama });
        this.contrato = { ...this.contrato, anosRestantes: 2, salario: Math.max(8000, 0.8 * s) };
      }
      return;
    }
    const validas = props.filter((p) => !this.clubesRecentes.includes(p.clube.id));
    if (!validas.length) return;
    const melhor = validas.map((p) => ({ p, u: this.avaliarProposta(p) })).sort((a, b) => b.u - a.u)[0];
    const encostado = pct < 0.3 && this.idade >= 20 && melhor.p.titularProvavel;
    if (!livre && melhor.u < (encostado ? -5 : 5)) return;
    if (!livre) {
      const fila = filaNaPosicao(this.clube, this.posicao, this.ovr);
      const importancia = this.ovr >= this.clube.forca + 5 ? 1.6 : fila < VAGAS_433[this.posicao] ? 1.3 : 1.0;
      if (!clubeAceitaVenda(this.rng, melhor.p, this.vm, importancia)) return;
    }
    const luvas = (livre ? 6 : 1) * melhor.p.salario * (1 - AGENTES[this.agente].comissao);
    this.caixa += luvas * 0.725;
    this.entrarNoClube(melhor.p.liga, melhor.p.clube, { salario: melhor.p.salario, anos: melhor.p.anos });
  }

  private renovarOuSair() {
    this.contrato.anosRestantes--;
    if (this.contrato.formacao && this.idade >= 18) {
      // primeiro contrato profissional
      this.contrato = { ...this.contrato, formacao: false, anosRestantes: 3, salario: salarioMensal({ ovr: this.ovr, idade: this.idade, liga: this.liga, clube: this.clube, agente: this.agente, fama: this.fama }) };
      return;
    }
    if (this.contrato.anosRestantes <= 0) {
      const pct = this.temp.titularUlt.filter(Boolean).length / Math.max(1, this.temp.titularUlt.length);
      if (pct >= 0.4 || this.idade < 21) {
        const novo = salarioMensal({ ovr: this.ovr, idade: this.idade, liga: this.liga, clube: this.clube, agente: this.agente, fama: this.fama, formacao: this.idade < 18 });
        this.contrato = { ...this.contrato, anosRestantes: this.rng.int(2, 4), salario: Math.max(novo, this.contrato.formacao ? 3000 : 8000) };
      }
    }
  }

  // ---------- temporada ----------
  simularTemporada(): void {
    const tab = novaTabela(this.liga);
    const rodadas = tabelaTurnoReturno(this.liga.clubes.length);
    this.temp = { jogos: 0, titular: 0, gols: 0, assist: 0, notas: [], titularUlt: this.temp.titularUlt };
    const ligaDaTemporada = this.liga;
    let semanaDoAno = 0;
    const passarSemana = (p: Participacao) => { this.semana(p); semanaDoAno++; this.semanaAbs++; if (semanaDoAno % 4 === 0) this.mes(); };
    this.janela();
    for (let s = 0; s < 6; s++) passarSemana("base");
    rodadas.forEach((jogos, r) => {
      if (r === 19) this.janela();
      if (this.liga !== ligaDaTemporada) {
        // mudou de liga no meio do ano: a tabela antiga segue sem ele
        for (const [a, b] of jogos) { const [x, y] = simularPlacar(this.rng, ligaDaTemporada.clubes[a].forca, ligaDaTemporada.clubes[b].forca); registrar(tab[a], x, y); registrar(tab[b], y, x); }
        const p = this.jogarRodadaAvulsa();
        passarSemana(p);
        return;
      }
      const meuIdx = this.liga.clubes.indexOf(this.clube);
      passarSemana(this.jogarRodada(tab, jogos, meuIdx));
    });
    for (let s = 0; s < 8; s++) passarSemana("ferias");
    // fim de temporada
    const ordem = ordenar(tab);
    const posicaoLiga = ordem.findIndex((t) => t.clube === this.clube.id) + 1;
    const titulo = posicaoLiga === 1 && this.temp.jogos >= 10;
    if (titulo) { this.totais.titulos++; this.fama = clamp(this.fama + 5, 0, 100); }
    this.patrocinioAnual = this.fama >= 30 ? 2000 * this.fama ** 2 : 0;
    this.bens.carro *= 0.85; this.bens.imovel *= 1.03;
    const media = this.temp.notas.length ? this.temp.notas.reduce((a, b) => a + b, 0) / this.temp.notas.length : 0;
    this.historico.push({
      ano: this.ano, idade: this.idade, clube: this.clube.nome, liga: this.liga.nome, ovr: Math.round(this.ovr), jogos: this.temp.jogos,
      titular: this.temp.titular, gols: this.temp.gols, assist: this.temp.assist, notaMedia: +media.toFixed(2),
      salario: Math.round(this.contrato.salario), vm: Math.round(this.vm), patrimonio: Math.round(this.patrimonio), posicaoLiga: posicaoLiga || 0, titulo,
    });
    this.totais.jogos += this.temp.jogos; this.totais.gols += this.temp.gols; this.totais.assist += this.temp.assist;
    this.totais.salarioMax = Math.max(this.totais.salarioMax, this.contrato.salario);
    if (this.ovr > this.totais.ovrMax) { this.totais.ovrMax = this.ovr; this.totais.idadeOvrMax = this.idade; }
    this.idade++; this.ano++;
    this.renovarOuSair();
    this.verificarAposentadoria();
  }

  /** Rodada no clube novo depois de uma transferência no meio da temporada (sem tabela própria). */
  private jogarRodadaAvulsa(): Participacao {
    const tab = novaTabela(this.liga);
    const meuIdx = this.liga.clubes.indexOf(this.clube);
    const adv = (meuIdx + 1 + this.rng.int(0, this.liga.clubes.length - 2)) % this.liga.clubes.length;
    return this.jogarRodada(tab, [[meuIdx, adv]], meuIdx);
  }

  private verificarAposentadoria() {
    if (this.idade >= 40) { this.aposentado = true; return; }
    if (this.idade >= 33) {
      const p = 0.1 + 0.15 * (this.idade - 33) + 0.02 * Math.max(0, 70 - this.ovr);
      if (this.rng.chance(p)) this.aposentado = true;
    }
    if (this.contrato.anosRestantes <= 0 && this.idade >= 30) {
      // sem contrato: tenta a janela; se ninguém quiser, encerra a carreira
      this.janela();
      if (this.contrato.anosRestantes <= 0) this.aposentado = true;
    }
  }

  simularCarreira(): this {
    while (!this.aposentado && this.ano < 30) this.simularTemporada();
    return this;
  }
}
