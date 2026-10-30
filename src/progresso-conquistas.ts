// Próximas conquistas mensuráveis, com quanto falta para cada uma. Usa os mesmos limiares de reliquias.ts
// (camisa de jogo a cada 100 jogos, bola de marca a cada 50 gols, camisa de clube a cada 10 jogos no mesmo clube).

export interface MetaConquista { chave: string; nome: string; atual: number; meta: number; dica: string }

export function proximasMetas(p: { jogos: number; gols: number; jogosNoClube: number }): MetaConquista[] {
  const proximo = (v: number, passo: number) => (Math.floor(v / passo) + 1) * passo;
  const noCiclo = p.jogosNoClube % 10;
  const metas: MetaConquista[] = [
    { chave: "camisa-jogo", nome: "Camisa de jogo marcante", atual: p.jogos, meta: proximo(p.jogos, 100), dica: "Chegue a 100, 200, 300... jogos como profissional." },
    { chave: "bola-marca", nome: "Bola de gol marcante", atual: p.gols, meta: proximo(p.gols, 50), dica: "Chegue a 50, 100, 150... gols como profissional." },
    { chave: "camisa-clube", nome: "Camisa do clube", atual: noCiclo, meta: 10, dica: "Faça 10 jogos como profissional por um clube." },
  ];
  // as mais perto de acontecer primeiro
  return metas.sort((a, b) => b.atual / b.meta - a.atual / a.meta);
}
