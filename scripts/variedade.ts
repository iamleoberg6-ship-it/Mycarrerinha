// Mede a variedade de lances numa carreira longa: situações vistas, repetição e textos distintos.
import { carregarPacote } from "../src/pacote.js";
import { criarJogador, type EscolhasCriacao } from "../src/dna.js";
import { novoJogo, ofertasDeBase, planoAutomatico, prepararPartida, resolverDecisao, melhorOpcao, decisaoComemoracao, decisaoPosJogo, concluirSemana, SEMANAS_TEMPORADA, type ResultadoDecisao } from "../src/jogo.js";
import { SITUACOES, POS_JOGO } from "../src/lances.js";

const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const TEMPORADAS = Number(process.argv[2] ?? 10);
for (const [i, pos] of (["ATA", "MEI", "ZAG", "LAT"] as const).entries()) {
  const e = { nome: `Var ${i}`, pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: pos, semente: `var${i}` } as EscolhasCriacao;
  const dados = { resultado: criarJogador(e), aparencia: {}, clube: "FLA" };
  const s = novoJogo(pacote, dados, ofertasDeBase(pacote, dados)[0].clubeId);
  const visto: Record<string, number> = {}, textos = new Set<string>(), narr = new Set<string>(), titulos = new Set<string>();
  let decis = 0, jogos = 0, golDec = 0, repetidoSeguido = 0, ultimo = "";
  const porTemp: string[] = [];
  for (let t = 0; t < TEMPORADAS; t++) {
    const antes = Object.keys(visto).length;
    for (let w = 0; w < SEMANAS_TEMPORADA; w++) {
      const plano = planoAutomatico(s), p = prepararPartida(pacote, s, plano);
      const ds: ResultadoDecisao[] = [];
      if (p && p.decisoes.length) {
        jogos++;
        for (const l of p.narracao) narr.add(l.texto);
        let fora = 99;
        for (const d of p.decisoes) {
          if (d.min > fora) break;
          titulos.add(d.titulo + " | " + d.texto);
          const r = resolverDecisao(s, p, d, melhorOpcao(s, p, d)); ds.push(r); decis++;
          visto[d.situacao] = (visto[d.situacao] ?? 0) + 1; textos.add(r.texto); if (r.golPro && r.meu === "gol") golDec++;
          if (d.situacao === ultimo) repetidoSeguido++; ultimo = d.situacao;
          if (r.vermelho || r.sai || ds.filter((x) => x.amarelo).length >= 2) fora = d.min;
        }
        const g = [...p.lances.filter((l) => l.meu === "gol").map((l) => l.min), ...ds.filter((r) => r.meu === "gol").map((r) => r.min)].sort((a, b) => a - b)[0];
        if (g !== undefined) { const d = decisaoComemoracao(s, p, g); const r = resolverDecisao(s, p, d, melhorOpcao(s, p, d)); ds.push(r); visto[d.situacao] = (visto[d.situacao] ?? 0) + 1; textos.add(r.texto); }
        const pj = decisaoPosJogo(s, p, ds);
        if (pj) { const r = resolverDecisao(s, p, pj, melhorOpcao(s, p, pj)); ds.push(r); visto[pj.situacao] = (visto[pj.situacao] ?? 0) + 1; textos.add(r.texto); titulos.add(pj.titulo + " | " + pj.texto); }
      }
      concluirSemana(pacote, s, plano, p, ds);
    }
    porTemp.push(`${t + 1}:+${Object.keys(visto).length - antes}`);
  }
  const total = SITUACOES.length + POS_JOGO.length + 1;
  const nunca = [...SITUACOES, ...POS_JOGO].filter((x) => !visto[x.id]).map((x) => x.id);
  const top = Object.entries(visto).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} ${v}`).join(", ");
  console.log(`\n${pos}: ${jogos} jogos com decisão, ${decis} decisões, ${golDec} gols do jogador vindos de decisão`);
  console.log(`  situações vistas ${Object.keys(visto).length}/${total} | novas por temporada ${porTemp.join(" ")} | mesma situação seguida ${repetidoSeguido}`);
  console.log(`  textos de resultado distintos ${textos.size} | aberturas de lance distintas ${titulos.size} | linhas de narração distintas ${narr.size}`);
  console.log(`  mais frequentes: ${top}`);
  console.log(`  nunca vistas: ${nunca.join(", ") || "nenhuma"}`);
}
