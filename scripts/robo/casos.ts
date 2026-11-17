// As carreiras que o robô joga: perfis bem diferentes, para pegar problemas de cada canto do jogo.
import type { EscolhasCriacao } from "../../src/dna.js";

export const CASOS_JOGADOR: { nome: string; descricao: string; escolhas: Partial<EscolhasCriacao>; clubeCoracao?: string }[] = [
  { nome: "Atacante da rua", descricao: "Atacante, família humilde, formado na rua", escolhas: { posicao: "ATA", familia: "humilde", formacao: "rua" } },
  { nome: "Meia da base grande", descricao: "Meia, família média, base de clube grande", escolhas: { posicao: "MEI", familia: "media", formacao: "base_grande" }, clubeCoracao: "FLA" },
  { nome: "Zagueiro rico", descricao: "Zagueiro, família rica, academia", escolhas: { posicao: "ZAG", familia: "rica", formacao: "academia", alturaCm: 190 } },
  { nome: "Ponta do futsal", descricao: "Ponta, família humilde, futsal", escolhas: { posicao: "PON", familia: "humilde", formacao: "futsal", alturaCm: 170 } },
  { nome: "Lateral da escolinha", descricao: "Lateral, família média, escolinha", escolhas: { posicao: "LAT", familia: "media", formacao: "escolinha", alturaCm: 176 } },
  { nome: "Volante da praia", descricao: "Volante, família humilde, futebol de praia", escolhas: { posicao: "VOL", familia: "humilde", formacao: "praia" } },
];

export interface CasoTecnico { nome: string; descricao: string; clubeId: string; dados: { nome: string; nac: string; idade: number; prestigio?: number } }
export const CASOS_TECNICO: CasoTecnico[] = [
  { nome: "Técnico no Palmeiras", descricao: "Clube grande do Brasil, técnico experiente", clubeId: "PAL", dados: { nome: "Robô Palmeiras", nac: "BRA", idade: 45, prestigio: 60 } },
  { nome: "Técnico no Fluminense", descricao: "Clube médio do Brasil, estádio dividido", clubeId: "FLU", dados: { nome: "Robô Flu", nac: "BRA", idade: 40 } },
  { nome: "Técnico no Mirassol", descricao: "Clube pequeno do Brasil, pouco dinheiro", clubeId: "MIR", dados: { nome: "Robô Mirassol", nac: "BRA", idade: 38 } },
  { nome: "Técnico na Inglaterra", descricao: "Clube grande inglês, muito dinheiro", clubeId: "EN-CHE", dados: { nome: "Robô Londres", nac: "BRA", idade: 50, prestigio: 80 } },
];
