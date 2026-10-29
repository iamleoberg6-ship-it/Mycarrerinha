/**
 * Artilheiros históricos de cada seleção (gols com a camisa do país).
 * `nome` é o nome real; `jogo` é o nome que aparece no jogo: o nome que já existe no mundo do jogo para quem
 * joga numa liga do jogo (paródia já usada), e o nome real para quem não está no mundo do jogo.
 * Números: a primeira posição de cada país vem da lista de artilheiros por país (snapshot de 2026);
 * as demais são aproximadas e devem ser conferidas.
 */
export interface Artilheiro { nome: string; gols: number; jogo: string }

export const ARTILHEIROS: Record<string, Artilheiro[]> = {
  BRA: [{ nome: "Neymar", gols: 80, jogo: "Neymal Jr." }, { nome: "Pelé", gols: 77, jogo: "Pelé" }, { nome: "Zico", gols: 66, jogo: "Zico" }, { nome: "Ronaldo", gols: 62, jogo: "Ronaldo" }, { nome: "Romário", gols: 55, jogo: "Romário" }],
  ARG: [{ nome: "Lionel Messi", gols: 125, jogo: "Lionel Mesi" }, { nome: "Gabriel Batistuta", gols: 54, jogo: "Gabriel Batistuta" }, { nome: "Sergio Agüero", gols: 41, jogo: "Sergio Agüero" }, { nome: "Hernán Crespo", gols: 35, jogo: "Hernán Crespo" }, { nome: "Gonzalo Higuaín", gols: 31, jogo: "Gonzalo Higuaín" }],
  URU: [{ nome: "Luis Suárez", gols: 69, jogo: "Luis Suáres" }, { nome: "Edinson Cavani", gols: 58, jogo: "Edinson Cavani" }, { nome: "Diego Forlán", gols: 36, jogo: "Diego Forlán" }, { nome: "Héctor Scarone", gols: 31, jogo: "Héctor Scarone" }],
  COL: [{ nome: "Radamel Falcao", gols: 36, jogo: "Radamel Falcao" }],
  CHI: [{ nome: "Alexis Sánchez", gols: 51, jogo: "Alexis Sánches" }, { nome: "Iván Zamorano", gols: 34, jogo: "Iván Zamorano" }],
  PAR: [{ nome: "Roque Santa Cruz", gols: 32, jogo: "Roque Santa Cruz" }],
  ECU: [{ nome: "Enner Valencia", gols: 49, jogo: "Enner Valencia" }],
  PER: [{ nome: "Paolo Guerrero", gols: 40, jogo: "Paolo Guerrero" }],
  MEX: [{ nome: "Javier Hernández", gols: 52, jogo: "Javier Hernández" }, { nome: "Jared Borgetti", gols: 46, jogo: "Jared Borgetti" }],
  USA: [{ nome: "Clint Dempsey", gols: 57, jogo: "Clint Dempsey" }, { nome: "Landon Donovan", gols: 57, jogo: "Landon Donovan" }],
  CAN: [{ nome: "Jonathan David", gols: 42, jogo: "Jonathan David" }],
  ENG: [{ nome: "Harry Kane", gols: 85, jogo: "Harry Kame" }, { nome: "Wayne Rooney", gols: 53, jogo: "Wayne Rooney" }, { nome: "Bobby Charlton", gols: 49, jogo: "Bobby Charlton" }, { nome: "Gary Lineker", gols: 48, jogo: "Gary Lineker" }, { nome: "Michael Owen", gols: 40, jogo: "Michael Owen" }],
  FRA: [{ nome: "Kylian Mbappé", gols: 66, jogo: "Kylian Mbapbé" }, { nome: "Olivier Giroud", gols: 57, jogo: "Olivier Giroud" }, { nome: "Thierry Henry", gols: 51, jogo: "Thierry Henry" }, { nome: "Michel Platini", gols: 41, jogo: "Michel Platini" }, { nome: "Karim Benzema", gols: 37, jogo: "Karim Benzema" }],
  ESP: [{ nome: "David Villa", gols: 59, jogo: "David Villa" }, { nome: "Raúl", gols: 44, jogo: "Raúl" }, { nome: "Fernando Torres", gols: 38, jogo: "Fernando Torres" }],
  POR: [{ nome: "Cristiano Ronaldo", gols: 146, jogo: "Cristiano Ronardo" }, { nome: "Pauleta", gols: 47, jogo: "Pauleta" }, { nome: "Eusébio", gols: 41, jogo: "Eusébio" }],
  ITA: [{ nome: "Gigi Riva", gols: 35, jogo: "Gigi Riva" }, { nome: "Giuseppe Meazza", gols: 33, jogo: "Giuseppe Meazza" }, { nome: "Silvio Piola", gols: 30, jogo: "Silvio Piola" }, { nome: "Roberto Baggio", gols: 27, jogo: "Roberto Baggio" }],
  GER: [{ nome: "Miroslav Klose", gols: 71, jogo: "Miroslav Klose" }, { nome: "Gerd Müller", gols: 68, jogo: "Gerd Müller" }, { nome: "Jürgen Klinsmann", gols: 47, jogo: "Jürgen Klinsmann" }, { nome: "Rudi Völler", gols: 47, jogo: "Rudi Völler" }, { nome: "Uwe Seeler", gols: 43, jogo: "Uwe Seeler" }],
  NED: [{ nome: "Memphis Depay", gols: 55, jogo: "Memphis Debay" }, { nome: "Robin van Persie", gols: 50, jogo: "Robin van Persie" }, { nome: "Patrick Kluivert", gols: 40, jogo: "Patrick Kluivert" }],
  BEL: [{ nome: "Romelu Lukaku", gols: 93, jogo: "Romelu Lukacu" }],
  NOR: [{ nome: "Erling Haaland", gols: 62, jogo: "Erling Haalant" }],
  SWE: [{ nome: "Zlatan Ibrahimović", gols: 62, jogo: "Zlatan Ibrahimović" }],
  DEN: [{ nome: "Jon Dahl Tomasson", gols: 52, jogo: "Jon Dahl Tomasson" }],
  CRO: [{ nome: "Davor Šuker", gols: 45, jogo: "Davor Šuker" }],
  SUI: [{ nome: "Alexander Frei", gols: 42, jogo: "Alexander Frei" }],
  AUT: [{ nome: "Marko Arnautović", gols: 49, jogo: "Marko Arnautovik" }],
  POL: [{ nome: "Robert Lewandowski", gols: 89, jogo: "Robert Lewandovsk" }],
  SRB: [{ nome: "Aleksandar Mitrović", gols: 64, jogo: "Alexander Mitrovich" }],
  TUR: [{ nome: "Hakan Şükür", gols: 51, jogo: "Hakan Şükür" }],
  UKR: [{ nome: "Andriy Shevchenko", gols: 48, jogo: "Andriy Shevchenko" }],
  SCO: [{ nome: "Denis Law", gols: 30, jogo: "Denis Law" }, { nome: "Kenny Dalglish", gols: 30, jogo: "Kenny Dalglish" }],
  MAR: [{ nome: "Ahmed Faras", gols: 36, jogo: "Ahmed Faras" }],
  SEN: [{ nome: "Sadio Mané", gols: 55, jogo: "Sadio Mané" }],
  NGA: [{ nome: "Rashidi Yekini", gols: 37, jogo: "Rashidi Yekini" }],
  GHA: [{ nome: "Asamoah Gyan", gols: 51, jogo: "Asamoah Gyan" }],
  CIV: [{ nome: "Didier Drogba", gols: 65, jogo: "Didier Drogba" }],
  CMR: [{ nome: "Samuel Eto'o", gols: 56, jogo: "Samuel Eto'o" }],
  EGY: [{ nome: "Hossam Hassan", gols: 69, jogo: "Hossam Hassan" }],
  ALG: [{ nome: "Islam Slimani", gols: 46, jogo: "Islam Slimani" }],
  TUN: [{ nome: "Issam Jemâa", gols: 36, jogo: "Issam Jemâa" }],
  JPN: [{ nome: "Kunishige Kamamoto", gols: 75, jogo: "Kunishige Kamamoto" }],
  KOR: [{ nome: "Cha Bum-kun", gols: 58, jogo: "Cha Bum-kun" }],
  KSA: [{ nome: "Majed Abdullah", gols: 72, jogo: "Majed Abdullah" }],
  AUS: [{ nome: "Tim Cahill", gols: 50, jogo: "Tim Cahill" }],
  IRN: [{ nome: "Ali Daei", gols: 108, jogo: "Ali Daei" }],
  IRQ: [{ nome: "Hussein Saeed", gols: 78, jogo: "Hussein Saeed" }],
  QAT: [{ nome: "Almoez Ali", gols: 60, jogo: "Almoez Ali" }],
  UAE: [{ nome: "Ali Mabkhout", gols: 85, jogo: "Ali Mabkhout" }],
  CRC: [{ nome: "Rolando Fonseca", gols: 47, jogo: "Rolando Fonseca" }],
  PAN: [{ nome: "Luis Tejada", gols: 43, jogo: "Luis Tejada" }],
  HON: [{ nome: "Carlos Pavón", gols: 57, jogo: "Carlos Pavón" }],
  JAM: [{ nome: "Luton Shelton", gols: 35, jogo: "Luton Shelton" }],
  VEN: [{ nome: "Salomón Rondón", gols: 50, jogo: "Salomón Rondón" }],
  BOL: [{ nome: "Marcelo Moreno", gols: 31, jogo: "Marcelo Moreno" }],
  MLI: [{ nome: "Seydou Keita", gols: 25, jogo: "Seydou Keita" }],
  RSA: [{ nome: "Benni McCarthy", gols: 31, jogo: "Benni McCarthy" }],
  NZL: [{ nome: "Chris Wood", gols: 45, jogo: "Chris Wood" }],
};

/** Até 5 artilheiros históricos da seleção, com o nome que aparece no jogo. */
export const artilheirosDaSelecao = (pais: string): Artilheiro[] => (ARTILHEIROS[pais] ?? []).slice(0, 5);
