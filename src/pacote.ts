// Leitura do pacote de dados no Node (scripts e testes). No navegador o JSON entra direto no bundle.
import { readFileSync } from "node:fs";
import type { PacoteDados } from "./liga.js";

export function carregarPacote(caminho: string): PacoteDados {
  return JSON.parse(readFileSync(caminho, "utf8"));
}
