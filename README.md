# Motor de simulação — Fase 0

Motor do jogo de carreira de jogador de futebol, em TypeScript puro e sem interface. Implementa as fórmulas do documento de design e foi calibrado com 1.000 carreiras simuladas.

## Como rodar

Precisa de Node 20 ou superior.

```bash
npm install
npm test                                # 8 testes das fórmulas e da simulação
npm run temporada                       # 500 temporadas da Série A: gols por jogo, pontos do campeão
npm run balanceamento                   # 1.000 carreiras; salva resultados-balanceamento.json
npm run carreira -- minha-semente ATA   # uma carreira temporada a temporada
```

## Estrutura

| Arquivo | O que faz |
| --- | --- |
| `src/rng.ts` | Gerador aleatório com semente (mesma semente = mesma carreira) |
| `src/atributos.ts` | 12 atributos, OVR por posição, atributos iniciais, evolução e declínio semanal |
| `src/partida.ts` | Placar (Poisson), gols, assistências, nota, lesões, titularidade |
| `src/liga.ts` | Pacote de dados, ligas do mundo, tabela turno e returno, temporada |
| `src/mercado.ts` | Valor de mercado, salário, agentes, interesse dos clubes, negociação, ambientação |
| `src/carreira.ts` | Carreira semana a semana, finanças mensais, janelas, renovação, aposentadoria |
| `data/pacote-brasil-serie-a-v0.3.json` | 20 clubes e 576 jogadores (nomes paródia) |

## O mundo da Fase 0

| Liga | Nível | Origem |
| --- | --- | --- |
| Liga Europeia Top | 1 | gerada (força 73–86) |
| Liga Europeia Média | 2 | gerada (força 66–78) |
| Campeonato Nacional Série A | 2 | pacote de dados |
| Liga do Golfo (alto salário) | 3 | gerada (força 64–75, salário ×2,5) |
| Campeonato Nacional Série B | 4 | gerada (força 58–67) |

## Decisões do jogador

Em `src/carreira.ts`, os métodos `escolherFoco`, `escolherIntensidade`, `avaliarProposta` e `atualizarAgente` formam a "política": no balanceamento quem decide é uma IA simples; na Fase 1 essas decisões passam para a interface.

## Ainda não implementado

Eventos de vida, relacionamentos, redes sociais (além da fórmula de seguidores), seleção, competições continentais e momentos de decisão na partida.
