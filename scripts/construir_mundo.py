#!/usr/bin/env python3
"""Monta data/mundo-2026.json: as 12 ligas além da Série A, com clubes e jogadores em paródia.

Entradas (data/fontes):
  clubes-parodia.tsv    nome-paródia, cores, padrão, força e estádio de cada clube
  estadios-2026.tsv     cidade e capacidade reais
  elencos/<LIGA>.txt    elencos reais (Wikipédia, out/2026): "num|GK/DF/MF/FW|NAC|Nome"

Tudo é determinístico (hash do nome): rodar de novo gera o mesmo arquivo.
O arquivo final não leva os nomes reais, só as paródias.
"""
import json, math, os, re, sys, unicodedata, hashlib

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FONTES = os.path.join(RAIZ, "data", "fontes")
SAIDA = os.path.join(RAIZ, "data", "mundo-2026.json")
ANO = 2026

# ordem de prioridade quando o mesmo jogador aparece em dois clubes (fica no primeiro)
ORDEM = ["ENG1", "ESP1", "ITA1", "GER1", "FRA1", "KSA1", "POR1", "NED1", "ENG2", "ESP2", "ARG1", "BRA2", "USA1", "BRA3"]
PAIS_LIGA = {"ENG1": "ENG", "ENG2": "ENG", "ESP1": "ESP", "ESP2": "ESP", "ITA1": "ITA", "GER1": "GER", "FRA1": "FRA",
             "POR1": "POR", "NED1": "NED", "KSA1": "KSA", "ARG1": "ARG", "BRA2": "BRA", "USA1": "USA", "BRA3": "BRA"}
ALIAS = {"Bayern de Munique": "Bayern", "Central Córdoba (SdE)": "Central Córdoba", "Estudiantes (LP)": "Estudiantes",
         "Estudiantes (RC)": "Estudiantes de Río Cuarto", "Gimnasia (LP)": "Gimnasia La Plata", "Gimnasia (M)": "Gimnasia Mendoza"}
NAC_FIX = {"NGR": "NGA", "GBS": "GNB", "SLO": "SVN", "DRC": "COD", "CAF": "CTA", "GUF": "FRA", "GLP": "FRA", "MTQ": "FRA", "NCL": "FRA", "?": ""}


def h(*partes) -> int:
    return int(hashlib.md5("|".join(str(p) for p in partes).encode()).hexdigest()[:12], 16)


def normal(*partes) -> float:
    """Normal(0,1) determinística."""
    u1 = (h(*partes, "a") % 100000 + 1) / 100001
    u2 = (h(*partes, "b") % 100000) / 100000
    return math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)


def sem_acento(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower()


# ---------------------------------------------------------------- estrelas: (ovr, ano de nascimento)
ESTRELAS = {
    "Harry Kane": (90, 1993), "Jamal Musiala": (88, 2003), "Michael Olise": (87, 2001), "Joshua Kimmich": (87, 1995),
    "Manuel Neuer": (84, 1986), "Luis Díaz": (85, 1997), "Alphonso Davies": (82, 2000), "Dayot Upamecano": (83, 1998),
    "Kim Min-jae": (82, 1996), "Jonathan Tah": (83, 1996), "Serge Gnabry": (80, 1995), "Konrad Laimer": (80, 1997),
    "Ousmane Dembélé": (89, 1997), "Khvicha Kvaratskhelia": (87, 2001), "Vitinha": (88, 2000), "João Neves": (86, 2004),
    "Achraf Hakimi": (87, 1998), "Nuno Mendes": (86, 2002), "Marquinhos": (84, 1994), "Désiré Doué": (84, 2005),
    "Willian Pacho": (84, 2001), "Warren Zaïre-Emery": (81, 2006), "Lucas Chevalier": (82, 2001), "Fabián Ruiz": (83, 1996),
    "Cristiano Ronaldo": (83, 1985), "Sadio Mané": (81, 1992), "João Félix": (80, 1999), "Kingsley Coman": (81, 1996),
    "Rúben Neves": (82, 1997), "Kalidou Koulibaly": (80, 1991), "Sergej Milinković-Savić": (82, 1995), "Yassine Bounou": (83, 1991),
    "Théo Hernandez": (83, 1997), "Gabriel Martinelli": (82, 2001), "Ollie Watkins": (82, 1995), "Ivan Toney": (81, 1996),
    "Riyad Mahrez": (80, 1991), "Édouard Mendy": (79, 1992), "Merih Demiral": (80, 1998), "Darwin Núñez": (80, 1999),
    "Tijjani Reijnders": (84, 1998), "Mateo Retegui": (80, 1999), "Julián Quiñones": (79, 1997), "Nacho": (78, 1990),
    "Youssef En-Nesyri": (79, 1997), "Thomas Partey": (79, 1993), "Yannick Carrasco": (78, 1993), "Georginio Wijnaldum": (77, 1990),
    "Marc-André ter Stegen": (84, 1992), "Julian Brandt": (80, 1996), "Ángel Di María": (78, 1988), "Leandro Paredes": (78, 1994),
    "Edinson Cavani": (74, 1987), "Nicolás Otamendi": (76, 1988), "Gonzalo Montiel": (77, 1997), "Marcos Acuña": (76, 1991),
    "Ángel Correa": (78, 1995), "Thiago Almada": (79, 2001), "Fernando Muslera": (75, 1986), "Marcos Rojo": (73, 1990),
    "Edin Džeko": (76, 1986), "Olivier Giroud": (76, 1986), "Alexandre Lacazette": (77, 1991), "Nabil Fekir": (77, 1993),
    "Ansu Fati": (75, 2002), "Takumi Minamino": (77, 1995), "Denis Zakaria": (79, 1996), "Aleksandr Golovin": (79, 1996),
    "Christopher Nkunku": (80, 1997), "Loïs Openda": (79, 2000), "Patrik Schick": (79, 1996), "Victor Boniface": (78, 2000),
    "Ermedin Demirović": (78, 1998), "Deniz Undav": (79, 1996), "Angelo Stiller": (80, 2001), "Maximilian Mittelstädt": (78, 1997),
    "Chris Führich": (77, 1998), "Robin Gosens": (76, 1994), "Hwang Hee-chan": (75, 1996), "Loris Karius": (72, 1993),
    "Florian Thauvin": (78, 1993), "Thorgan Hazard": (74, 1993), "Amine Gouiri": (79, 2000), "Pierre-Emile Højbjerg": (80, 1995),
    "Geoffrey Kondogbia": (77, 1993), "Nayef Aguerd": (78, 1996), "Igor Paixão": (78, 2000), "Angel Gomes": (78, 2000),
    "Ivan Perišić": (77, 1989), "Sergiño Dest": (77, 2000), "Ricardo Pepi": (77, 2003), "Filip Kostić": (75, 1992),
    "Dušan Tadić": (75, 1988), "Kasper Dolberg": (76, 1997), "Sofyan Amrabat": (77, 1996), "Yves Bissouma": (77, 1996),
    "Daley Blind": (73, 1990), "Steven Berghuis": (75, 1991), "Vangelis Pavlidis": (80, 1998), "Fredrik Aursnes": (80, 1995),
    "Anatoliy Trubin": (80, 2001), "Heorhiy Sudakov": (79, 2002), "João Palhinha": (80, 1995), "Nicolás Otamendi ": (76, 1988),
    "Samu Aghehowa": (79, 2004), "Gabri Veiga": (78, 2002), "Jan Bednarek": (77, 1996), "Chris Smalling": (73, 1989),
    "Seko Fofana": (77, 1995), "Alan Varela": (80, 2001), "Pepê": (78, 1997), "Santiago Giménez": (79, 2001),
    "Rodrigo Zalazar": (78, 1999), "Maximiliano Araújo": (79, 2000), "Gonçalo Inácio": (80, 2001), "Geny Catamo": (77, 2001),
    "Rui Silva": (78, 1994), "Zeno Debast": (78, 2003), "Ricardo Horta": (77, 1994), "João Moutinho": (73, 1986),
    "Éver Banega": (73, 1988), "Edinson Cavani ": (74, 1987), "Mauro Arambarri": (77, 1995), "Sebastián Driussi": (77, 1996),
    "Rafael Santos Borré": (77, 1995), "Lucas Martínez Quarta": (77, 1996), "Manuel Lanzini": (73, 1993),
    # Premier League
    "Erling Haaland": (91, 2000), "Bukayo Saka": (88, 2001), "Martin Ødegaard": (86, 1998), "Declan Rice": (88, 1999),
    "William Saliba": (88, 2001), "Gabriel Magalhães": (87, 1997), "David Raya": (86, 1995), "Cole Palmer": (87, 2002),
    "Bruno Fernandes": (86, 1994), "Virgil van Dijk": (87, 1991), "Alexis Mac Allister": (86, 1998), "Florian Wirtz": (88, 2003),
    "Alexander Isak": (87, 1999), "Phil Foden": (86, 2000), "Rodri": (89, 1996), "Joško Gvardiol": (86, 2002),
    "Rúben Dias": (87, 1997), "Gianluigi Donnarumma": (88, 1999), "Moisés Caicedo": (87, 2001), "Enzo Fernández": (85, 2001),
    "Bruno Guimarães": (86, 1997), "Dominik Szoboszlai": (85, 2000), "Ryan Gravenberch": (85, 2002), "Viktor Gyökeres": (86, 1998),
    "Kai Havertz": (83, 1999), "Mikel Merino": (83, 1996), "Jurriën Timber": (84, 2001), "Riccardo Calafiori": (82, 2002),
    "Myles Lewis-Skelly": (80, 2006), "Ben White": (82, 1997), "Piero Hincapié": (83, 2002), "Benjamin Šeško": (83, 2003),
    "Matheus Cunha": (84, 1999), "Bryan Mbeumo": (84, 1999), "Kobbie Mainoo": (81, 2005), "Marcus Rashford": (81, 1997),
    "Alejandro Garnacho": (81, 2004), "Noni Madueke": (81, 2002), "Eberechi Eze": (84, 1998), "Morgan Rogers": (83, 2002),
    "Emiliano Martínez": (85, 1992), "Youri Tielemans": (82, 1997), "Amadou Onana": (81, 2001), "Boubacar Kamara": (82, 1999),
    "Ezri Konsa": (81, 1997), "Pau Torres": (81, 1997), "Micky van de Ven": (84, 2001), "James Maddison": (82, 1996),
    "Dan Ndoye": (80, 2000), "Hugo Larsson": (80, 2004), "Nico González": (81, 2002),
    # La Liga
    "Kylian Mbappé": (91, 1998), "Vinícius Júnior": (89, 2000), "Jude Bellingham": (89, 2003), "Federico Valverde": (88, 1998),
    "Thibaut Courtois": (89, 1992), "Aurélien Tchouaméni": (85, 2000), "Eduardo Camavinga": (84, 2002), "Arda Güler": (84, 2005),
    "Dean Huijsen": (83, 2005), "Trent Alexander-Arnold": (85, 1998), "Lamine Yamal": (90, 2007), "Pedri": (89, 2002),
    "Raphinha": (89, 1996), "Frenkie de Jong": (86, 1997), "Jules Koundé": (86, 1998), "Pau Cubarsí": (84, 2007),
    "Alejandro Balde": (83, 2003), "Dani Olmo": (84, 1998), "Gavi": (83, 2004), "Fermín López": (83, 2003), "Marc Casadó": (80, 2003),
    "Bernardo Silva": (85, 1994), "Jan Oblak": (87, 1993), "Julián Álvarez": (87, 2000), "Giuliano Simeone": (80, 2002),
    "Álex Baena": (83, 2001), "Cristian Romero": (85, 1998), "Nico Williams": (85, 2002), "Unai Simón": (84, 1997),
    "Mikel Oyarzabal": (83, 1997), "Ademola Lookman": (83, 1997), "Karim Adeyemi": (80, 2002),
    # Serie A
    "Lautaro Martínez": (88, 1997), "Nicolò Barella": (86, 1997), "Alessandro Bastoni": (86, 1999), "Hakan Çalhanoğlu": (84, 1994),
    "Marcus Thuram": (84, 1997), "Kevin De Bruyne": (85, 1991), "Scott McTominay": (85, 1996), "Rasmus Højlund": (81, 2003),
    "Mike Maignan": (86, 1995), "Christian Pulisic": (84, 1998), "Luka Modrić": (82, 1985), "Kenan Yıldız": (84, 2005),
    "Teun Koopmeiners": (81, 1998), "Khéphren Thuram": (82, 2001), "Paulo Dybala": (81, 1993), "Charles De Ketelaere": (82, 2001),
    "Guglielmo Vicario": (83, 1996), "Franco Mastantuono": (79, 2007), "Nicolás Paz": (81, 2004),
    # Bundesliga
    "Ferran Torres": (81, 2000), "Mohamed Simakan": (80, 2000), "Ângelo Gabriel": (77, 2004), "Bento": (79, 1999), "Samú Costa": (79, 2000),
    "Tom Bischof": (80, 2005),
    # MLS
    "Lionel Messi": (86, 1987), "Luis Suárez": (78, 1987), "Rodrigo De Paul": (81, 1994), "Casemiro": (80, 1992), "Son Heung-min": (84, 1992),
    "Hugo Lloris": (78, 1986), "Denis Bouanga": (79, 1994), "Antoine Griezmann": (83, 1991), "Thomas Müller": (80, 1989), "Marco Reus": (76, 1989),
    "Timo Werner": (77, 1996), "Wilfried Zaha": (76, 1992), "Hirving Lozano": (77, 1995), "Riqui Puig": (77, 1999), "Alexis Sánchez": (74, 1988),
    "Evander": (78, 1998), "Kévin Denkey": (76, 2000), "Hany Mukhtar": (77, 1995), "Sam Surridge": (76, 1998), "Anders Dreyer": (78, 1998),
    "Eric Maxim Choupo-Moting": (74, 1989), "Emil Forsberg": (76, 1991), "Carles Gil": (76, 1992), "Ryan Gauld": (76, 1995),
    "Breel Embolo": (77, 1997), "Miguel Almirón": (76, 1994), "Aleksei Miranchuk": (76, 1995), "Sergi Roberto": (74, 1992), "Hugo Cuypers": (75, 1997),
    "Petar Musa": (76, 1998), "Josh Sargent": (75, 2000), "Cavan Sullivan": (71, 2009), "Pedro de la Vega": (76, 2001), "Diego Luna": (75, 2003),
    "Brian White": (74, 1996), "Matt Turner": (75, 1994), "Roman Bürki": (74, 1990), "Brais Méndez": (76, 1997),
    "Wessam Abou Ali": (75, 1999), "Martín Ojeda": (75, 1998), "Dejan Joveljić": (74, 1999), "Andre Blake": (74, 1990), "Angus Gunn": (74, 1996),
    "Kyōgo Furuhashi": (74, 1995), "Telasco Segovia": (75, 2003), "Tai Baribo": (74, 1998), "Sergio Reguilón": (75, 1996), "Eric Bailly": (73, 1994), "Gregor Kobel": (86, 1997), "Nico Schlotterbeck": (84, 1999), "Serhou Guirassy": (85, 1996), "Jobe Bellingham": (79, 2005),
}
# posição detalhada conhecida (a heurística por número erra em alguns)
POSICAO = {
    "William Saliba": "ZAG", "Gabriel Magalhães": "ZAG", "Rúben Dias": "ZAG", "Joško Gvardiol": "LAT", "Virgil van Dijk": "ZAG",
    "Jurriën Timber": "LAT", "Riccardo Calafiori": "LAT", "Ben White": "LAT", "Myles Lewis-Skelly": "LAT", "Piero Hincapié": "ZAG",
    "Trent Alexander-Arnold": "LAT", "Achraf Hakimi": "LAT", "Nuno Mendes": "LAT", "Marquinhos": "ZAG", "Willian Pacho": "ZAG",
    "Jules Koundé": "LAT", "Pau Cubarsí": "ZAG", "Alejandro Balde": "LAT", "Dean Huijsen": "ZAG", "Alessandro Bastoni": "ZAG",
    "Cristian Romero": "ZAG", "Micky van de Ven": "ZAG", "Théo Hernandez": "LAT", "Kalidou Koulibaly": "ZAG", "Alphonso Davies": "LAT",
    "Dayot Upamecano": "ZAG", "Kim Min-jae": "ZAG", "Jonathan Tah": "ZAG", "Nico Schlotterbeck": "ZAG", "Gonçalo Inácio": "ZAG",
    "Rodri": "VOL", "Declan Rice": "VOL", "Moisés Caicedo": "VOL", "Aurélien Tchouaméni": "VOL", "Joshua Kimmich": "VOL",
    "Bruno Guimarães": "VOL", "Enzo Fernández": "MEI", "Pedri": "MEI", "Jude Bellingham": "MEI", "Federico Valverde": "MEI",
    "Martin Ødegaard": "MEI", "Florian Wirtz": "MEI", "Jamal Musiala": "MEI", "Vitinha": "VOL", "João Neves": "MEI", "Cole Palmer": "MEI",
    "Bruno Fernandes": "MEI", "Kevin De Bruyne": "MEI", "Nicolò Barella": "MEI", "Lamine Yamal": "PON", "Vinícius Júnior": "PON",
    "Bukayo Saka": "PON", "Raphinha": "PON", "Ousmane Dembélé": "ATA", "Khvicha Kvaratskhelia": "PON", "Michael Olise": "PON",
    "Kylian Mbappé": "ATA", "Erling Haaland": "ATA", "Harry Kane": "ATA", "Cristiano Ronaldo": "ATA", "Lautaro Martínez": "ATA",
    "Viktor Gyökeres": "ATA", "Alexander Isak": "ATA", "Julián Álvarez": "ATA", "Désiré Doué": "PON", "Sadio Mané": "PON",
    "Lionel Messi": "MEI", "Luis Suárez": "ATA", "Rodrigo De Paul": "MEI", "Casemiro": "VOL", "Son Heung-min": "PON", "Denis Bouanga": "PON",
    "Antoine Griezmann": "MEI", "Thomas Müller": "MEI", "Timo Werner": "PON", "Wilfried Zaha": "PON", "Hirving Lozano": "PON", "Riqui Puig": "MEI",
    "Evander": "MEI", "Kévin Denkey": "ATA", "Hany Mukhtar": "MEI", "Sam Surridge": "ATA", "Anders Dreyer": "PON", "Carles Gil": "MEI",
    "Ryan Gauld": "MEI", "Cavan Sullivan": "MEI", "Emil Forsberg": "MEI", "Petar Musa": "ATA", "Josh Sargent": "ATA",
}
# corrige chaves com espaço extra (duplicatas de digitação)
ESTRELAS = {k.strip(): v for k, v in ESTRELAS.items()}

# ---------------------------------------------------------------- motor de paródia de nomes
PARTICULAS = {"de", "da", "do", "dos", "das", "del", "della", "di", "van", "von", "der", "den", "ter", "ten", "al", "el", "la", "le", "bin", "y", "e", "mac", "st.", "of", "jr.", "júnior", "junior", "filho", "neto"}
DUPLAS = [("nn", "n"), ("ll", "l"), ("ss", "s"), ("tt", "t"), ("rr", "r"), ("ck", "k"), ("ph", "f"), ("th", "t"), ("ch", "k"), ("qu", "k"), ("gu", "g"), ("sh", "x")]
SIMPLES = {"n": "m", "m": "n", "v": "b", "b": "v", "r": "l", "l": "r", "d": "t", "t": "d", "z": "s", "s": "z", "p": "b", "f": "v", "j": "g", "k": "c", "y": "i", "c": "k", "g": "gu"}
VOGAIS = set("aeiouáéíóúâêôãõàäëïöüy")


def _candidatos(tok: str):
    """Trocas possíveis no token (índice, tamanho, substituto), sem mexer na primeira letra."""
    low = tok.lower()
    cands = []
    for i in range(1, len(low)):
        for a, b in DUPLAS:
            if low.startswith(a, i):
                if a == "ch" and i + 2 < len(low) and low[i + 2] not in VOGAIS:
                    continue
                if a == "gu" and (i + 2 >= len(low) or low[i + 2] not in "ei"):
                    continue
                cands.append((i, len(a), b))
        c = low[i]
        if c in SIMPLES:
            ant = low[i - 1]
            prox = low[i + 1] if i + 1 < len(low) else ""
            if c == "s" and not (ant in VOGAIS and prox in VOGAIS):
                continue  # s→z só entre vogais (Rosa → Roza)
            if c == "c" and prox not in "aou":
                continue
            if c == "g" and prox not in "ei":
                continue
            if c == "y" and (prox == "" or prox in VOGAIS):
                continue
            if c in "rl" and ant == c:
                continue
            cands.append((i, 1, SIMPLES[c]))
    return cands


def _aplicar(tok: str, i: int, n: int, sub: str) -> str:
    orig = tok[i:i + n]
    if orig[:1].isupper():
        sub = sub[:1].upper() + sub[1:]
    return tok[:i] + sub + tok[i + n:]


def parodia(nome: str, usados: set) -> str:
    partes = nome.split(" ")
    # alvo: o último token "de verdade" (sobrenome); se só tem um, ele mesmo
    idxs = [k for k, p in enumerate(partes) if sem_acento(p).strip(".") not in PARTICULAS and len(p) > 1]
    if not idxs:
        idxs = [len(partes) - 1]
    ordem = list(reversed(idxs))  # tenta o sobrenome, depois os anteriores
    for alvo in ordem:
        tok = partes[alvo]
        # nomes com hífen (Al-Dawsari, Simpson-Pusey): mexe no último pedaço
        seg = tok.split("-")
        j = len(seg) - 1
        while j > 0 and len(seg[j]) < 3:
            j -= 1
        cands = _candidatos(seg[j])
        if not cands:
            continue
        k0 = h(nome) % len(cands)
        for t in range(len(cands)):
            i, n, sub = cands[(k0 + t) % len(cands)]
            novo_seg = _aplicar(seg[j], i, n, sub)
            s2 = seg[:]; s2[j] = novo_seg
            p2 = partes[:]; p2[alvo] = "-".join(s2)
            res = " ".join(p2)
            if res != nome and res not in usados:
                usados.add(res)
                return res
    # sem troca possível: acrescenta uma terminação
    for suf in ["o", "inho", "ini", "son"]:
        res = nome + suf
        if res not in usados:
            usados.add(res)
            return res
    return nome + "zinho"


# ---------------------------------------------------------------- nomes gerados (para completar elencos)
NOMES = {
    "BRA": (["Lucas", "Gabriel", "Pedro", "Matheus", "Rafael", "Thiago", "Bruno", "Felipe", "Gustavo", "Vinícius", "Caio", "Diego", "André", "Rodrigo", "Luan", "Igor", "Wesley", "Kaio", "Renan", "Douglas"],
            ["Silva", "Souza", "Santos", "Oliveira", "Pereira", "Lima", "Costa", "Ferreira", "Almeida", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha", "Barbosa", "Araújo", "Moura", "Teixeira"]),
    "ESP": (["Álvaro", "Sergio", "Pablo", "Javier", "Iker", "Carlos", "Raúl", "Dani", "Marcos", "Adrián", "Hugo", "Unai"], ["García", "Martínez", "López", "Sánchez", "Romero", "Navarro", "Torres", "Ruiz", "Moreno", "Herrera"]),
    "ENG": (["Jack", "Harry", "James", "Tom", "Oliver", "Charlie", "Mason", "Jordan", "Callum", "Reece"], ["Smith", "Walker", "Taylor", "Brown", "Wilson", "Clarke", "Robinson", "Wright", "Hughes", "Bennett"]),
    "FRA": (["Lucas", "Hugo", "Théo", "Antoine", "Mathis", "Jules", "Enzo", "Yanis", "Nathan", "Rayan"], ["Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Fournier", "Girard", "Mercier", "Diallo", "Traoré"]),
    "ITA": (["Marco", "Luca", "Alessandro", "Federico", "Matteo", "Davide", "Lorenzo", "Andrea", "Simone"], ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Ricci", "Marino", "Greco", "Conti"]),
    "GER": (["Leon", "Lukas", "Jonas", "Felix", "Niklas", "Tim", "Florian", "Jan", "Kai", "Max"], ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Wagner", "Becker", "Hoffmann", "Koch", "Krause"]),
    "POR": (["João", "Diogo", "Rúben", "Tiago", "Gonçalo", "Nuno", "Bernardo", "Rafael", "Francisco"], ["Silva", "Fernandes", "Gonçalves", "Pereira", "Costa", "Mendes", "Lopes", "Carvalho", "Dias"]),
    "NED": (["Daan", "Sem", "Luuk", "Bram", "Joey", "Thijs", "Stefan", "Kevin"], ["de Jong", "Bakker", "Visser", "Smit", "de Vries", "Mulder", "Dekker", "van Beek"]),
    "ARG": (["Nicolás", "Lautaro", "Julián", "Rodrigo", "Enzo", "Thiago", "Facundo", "Matías", "Gonzalo"], ["Fernández", "González", "Rodríguez", "Gómez", "Díaz", "Álvarez", "Romero", "Sosa", "Acosta"]),
    "USA": (["Jake", "Tyler", "Brandon", "Kyle", "Austin", "Cole", "Ryan", "Logan", "Mason", "Ethan", "Caden", "Diego", "Owen", "Luca", "Nico", "Malik", "Jaden", "Isaiah"],
            ["Johnson", "Miller", "Davis", "Anderson", "Thompson", "Harris", "Martinez", "Clark", "Lewis", "Walker", "Young", "Allen", "Hernandez", "King", "Scott", "Green", "Baker", "Adams", "Nelson", "Carter", "Mitchell", "Roberts", "Turner", "Parker", "Reyes", "Brooks"]),
    "KSA": (["Mohammed", "Abdullah", "Salem", "Fahad", "Saud", "Nasser", "Yasser", "Faisal", "Hassan", "Turki", "Sami", "Ziyad", "Rayan", "Khalid", "Majed", "Ali"],
            ["Al-Dosari", "Al-Shahrani", "Al-Faraji", "Al-Ghamidi", "Al-Qahtani", "Al-Harbi", "Al-Otaibi", "Al-Mutairi", "Al-Zahrani", "Al-Maliki", "Al-Amri", "Al-Anazi", "Al-Shammari", "Al-Subaie"]),
}


NOMES["BRX"] = (NOMES["BRA"][0] + ["João", "Miguel", "Arthur", "Davi", "Heitor", "Bernardo", "Samuel", "Enzo", "Murilo", "Guilherme", "Nicolas", "Henrique", "Ryan", "Eduardo", "Otávio", "Kauã", "Erick", "Cauã", "Breno", "Leandro", "Marcos", "Fábio", "Júnior", "Robson", "Jefferson", "Anderson", "Wellington", "Alisson", "Everton", "Jonathan", "Danilo", "Márcio", "Cleiton", "Edson", "Paulo", "Valdir", "Tiago", "Juliano", "Patrick", "Emerson"],
                 NOMES["BRA"][1] + ["Nascimento", "Cardoso", "Melo", "Correia", "Dias", "Monteiro", "Mendes", "Freitas", "Vieira", "Batista", "Lopes", "Fernandes", "Nunes", "Soares", "Machado", "Cavalcanti", "Rezende", "Pinto", "Farias", "Campos", "Andrade", "Sales", "Brito", "Xavier", "Queiroz", "Bezerra", "Macedo", "Santana", "Porto", "Assis", "Siqueira", "Tavares", "Coelho", "Ramos", "Matos", "Leite", "Guimarães", "Prado", "Fonseca", "Medeiros"])
NOMES["USX"] = (NOMES["USA"][0] + ["Aiden", "Liam", "Noah", "Elijah", "Carter", "Hunter", "Wyatt", "Chase", "Bryce", "Gavin", "Landon", "Connor", "Dylan", "Evan", "Julian", "Marco", "Mateo", "Andre", "Xavier", "Trey", "Zach", "Dominic", "Sebastian", "Javier"],
                 NOMES["USA"][1] + ["Hall", "Wright", "Lopez", "Hill", "Campbell", "Phillips", "Evans", "Collins", "Stewart", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "Watson", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler", "Simmons", "Foster", "Bryant"])


def nome_gerado(pais: str, semente: str, usados: set) -> str:
    ps, ss = NOMES.get(pais, NOMES["ENG"])
    for t in range(50):
        n = f"{ps[h(semente, t, 'p') % len(ps)]} {ss[h(semente, t, 's') % len(ss)]}"
        if n not in usados:
            usados.add(n)
            return n
    for t in range(200):
        n = f"{ps[h(semente, t, 'p2') % len(ps)]} {ss[h(semente, t, 's2') % len(ss)]} {ss[h(semente, t, 's3') % len(ss)]}"
        if n not in usados:
            usados.add(n)
            return n
    return f"{ps[0]} {ss[0]} {h(semente) % 90 + 10}"


# ---------------------------------------------------------------- posições detalhadas
def posicoes(jogs):
    """GK→GOL; DF→ZAG/LAT; MF→VOL/MEI; FW→PON/ATA, pela numeração e equilibrando o elenco."""
    def dividir(lista, pref_a, pref_b, a, b, frac_a):
        n = len(lista)
        alvo_a = round(n * frac_a)
        marcados = {}
        for j in lista:
            if j["num"] in pref_a: marcados[id(j)] = a
            elif j["num"] in pref_b: marcados[id(j)] = b
        resto = [j for j in lista if id(j) not in marcados]
        resto.sort(key=lambda j: h(j["real"], "pos"))
        ja_a = sum(1 for v in marcados.values() if v == a)
        for j in resto:
            if ja_a < alvo_a:
                marcados[id(j)] = a; ja_a += 1
            else:
                marcados[id(j)] = b
        for j in lista:
            j["pos"] = marcados[id(j)]

    fixos = [j for j in jogs if j["real"] in POSICAO]
    for j in fixos: j["pos"] = POSICAO[j["real"]]
    livres = [j for j in jogs if j["real"] not in POSICAO]
    por = {k: [j for j in livres if j["g"] == k] for k in ["GK", "DF", "MF", "FW"]}
    for j in por["GK"]: j["pos"] = "GOL"
    dividir(por["DF"], {4, 5, 6, 14, 15, 24, 33, 44}, {2, 3, 12, 13, 22, 21, 27, 28, 17}, "ZAG", "LAT", 0.55)
    dividir(por["MF"], {5, 6, 16, 18, 15, 25, 4}, {10, 8, 20, 21, 22, 23, 14}, "VOL", "MEI", 0.45)
    dividir(por["FW"], {7, 11, 17, 19, 27, 77, 70}, {9, 14, 18, 99, 90, 29}, "PON", "ATA", 0.55)


# ---------------------------------------------------------------- leitura
def ler_tsv(caminho):
    with open(caminho, encoding="utf-8") as f:
        linhas = [l.rstrip("\n").split("\t") for l in f if l.strip()]
    cab = linhas[0]
    return [dict(zip(cab, l)) for l in linhas[1:]]


def ler_elencos(liga):
    caminho = os.path.join(FONTES, "elencos", f"{liga}.txt")
    blocos = {}
    if not os.path.exists(caminho):
        return blocos
    with open(caminho, encoding="utf-8") as f:
        texto = f.read()
    for bloco in re.split(r"\n\s*\n", texto.strip()):
        linhas = [l.strip() for l in bloco.split("\n") if l.strip()]
        if not linhas: continue
        clube = ALIAS.get(linhas[0], linhas[0])
        js = []
        for l in linhas[1:]:
            p = l.split("|")
            if len(p) < 4: continue
            num = int(p[0]) if p[0].strip().isdigit() else 0
            g = p[1].strip() or "MF"
            nac = p[2].strip().upper()
            nac = NAC_FIX.get(nac, nac)
            js.append({"num": num, "g": g if g in ("GK", "DF", "MF", "FW") else "MF", "nac": nac, "real": p[3].strip()})
        blocos.setdefault(clube, []).extend(js)
    return blocos


# ---------------------------------------------------------------- clubes menores e amadores
UF_ORDEM = ["AC", "RO", "AM", "RR", "AP", "PA", "TO", "MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA", "MT", "MS", "GO", "DF", "MG", "ES", "RJ", "SP", "PR", "SC", "RS"]
REGIAO_UF = {**{u: "Norte" for u in ["AC", "RO", "AM", "RR", "AP", "PA", "TO"]}, **{u: "Nordeste" for u in ["MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"]},
             **{u: "Centro-Oeste" for u in ["MT", "MS", "GO", "DF"]}, **{u: "Sudeste" for u in ["MG", "ES", "RJ", "SP"]}, **{u: "Sul" for u in ["PR", "SC", "RS"]}}
# várzea: bairros por cidade (os clubes são inventados)
VARZEA = {
    "SP": ("São Paulo", ["Capão Redondo", "Brasilândia", "Itaquera", "Grajaú", "Cidade Tiradentes", "Heliópolis", "Parelheiros", "Jardim Ângela", "Vila Prudente", "Perus"]),
    "RJ": ("Rio de Janeiro", ["Rocinha", "Maré", "Cidade de Deus", "Realengo", "Pavuna", "Irajá", "Penha", "Jacarezinho", "Rio das Pedras", "Vigário Geral"]),
    "BH": ("Belo Horizonte", ["Venda Nova", "Barreiro", "Serra", "Pampulha", "Cabana", "Taquaril", "Lindéia", "Primeiro de Maio", "Alípio de Melo", "Jardim Leblon"]),
    "POA": ("Porto Alegre", ["Restinga", "Lomba do Pinheiro", "Rubem Berta", "Partenon", "Sarandi", "Cruzeiro", "Bom Jesus", "Vila Jardim", "Belém Novo", "Humaitá"]),
    "SSA": ("Salvador", ["Liberdade", "Cajazeiras", "Pituaçu", "Uruguai", "São Caetano", "Itapuã", "Pernambués", "Sussuarana", "Periperi", "Lobato"]),
    "REC": ("Recife", ["Ibura", "Casa Amarela", "Água Fria", "Brasília Teimosa", "Coque", "Jordão", "Nova Descoberta", "Várzea", "Afogados", "Peixinhos"]),
    "FOR": ("Fortaleza", ["Bom Jardim", "Pirambu", "Barra do Ceará", "Messejana", "Mucuripe", "Jangurussu", "Conjunto Ceará", "Granja Portugal", "Lagamar", "Serrinha"]),
    "CWB": ("Curitiba", ["Boqueirão", "CIC", "Sítio Cercado", "Cajuru", "Tatuquara", "Bairro Alto", "Uberaba", "Pinheirinho", "Santa Felicidade", "Xaxim"]),
}
PREFIXOS_VARZEA = ["União do", "Leões do", "Unidos do", "Juventude do", "Estrela do", "Grêmio do", "Real", "Esporte Clube", "Comercial do", "Ousados do", "Calangos do", "Primavera do"]
CORES_VARZEA = [("#E2231A", "#FFFFFF"), ("#003DA5", "#FFFFFF"), ("#00843D", "#FFFFFF"), ("#000000", "#FFFFFF"), ("#FFD100", "#003DA5"), ("#7A1E2E", "#FFFFFF"),
                ("#F58220", "#000000"), ("#6A3FA0", "#FFFFFF"), ("#000000", "#E2231A"), ("#00843D", "#FFD100")]
ESCOLAS_EUA = ["Coral Bay High", "Biscayne Prep", "Everglades High", "Ocean Drive Prep", "Key Largo Academy", "Brickell Prep", "Sunrise High", "Palmetto Ridge High", "Weston Lakes Prep", "Bayview Academy"]
UNIVERSIDADES = [("Wake Floresta", "Diáconos", "#9E7E38", "#000000", 58), ("Estanforde", "Cardeais", "#8C1515", "#FFFFFF", 57), ("UCLÁ", "Ursos", "#2D68C4", "#F2A900", 57),
                 ("Indiana Fazendeiros", "Hoosiers", "#990000", "#FFFFFF", 56), ("Clemsom", "Tigres", "#F56600", "#522D80", 57), ("Marylândia", "Tartarugas", "#E03A3E", "#FFD520", 55),
                 ("Virgínia Cavaleiros", "Cavaleiros", "#232D4B", "#F84C1E", 56), ("Georgetaum", "Hoyas", "#041E42", "#8D817B", 56), ("Duque", "Diabos Azuis", "#012169", "#FFFFFF", 54),
                 ("Carolina do Norte", "Calcanhares", "#7BAFD4", "#FFFFFF", 55), ("Kentaki", "Gatos Selvagens", "#0033A0", "#FFFFFF", 53), ("Oregão", "Patos", "#154733", "#FEE123", 52),
                 ("Notre Dama", "Irlandeses", "#0C2340", "#C99700", 55), ("Siracusa", "Laranjas", "#F76900", "#000E54", 54)]


def montar_elenco(cid, liga, pais, forca, jogs, idades=None, minimo_tam=24, piso=42):
    """Completa posições, sorteia idade e OVR (média dos titulares = força) e dá os nomes."""
    global TOTAL_REAIS, TOTAL_GERADOS
    posicoes(jogs)
    minimo = {"GOL": 3, "ZAG": 4, "LAT": 3, "VOL": 3, "MEI": 3, "PON": 3, "ATA": 2}
    for pos, mn in minimo.items():
        for t in range(max(0, mn - sum(1 for j in jogs if j["pos"] == pos))):
            jogs.append({"num": 0, "g": "", "pos": pos, "nac": pais, "real": None, "gerado": True})
    while len(jogs) < minimo_tam:
        jogs.append({"num": 0, "g": "", "pos": ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"][len(jogs) % 6], "nac": pais, "real": None, "gerado": True})
    for k, j in enumerate(jogs):
        semente = j["real"] or f"{cid}-{k}"
        est_ = ESTRELAS.get(j["real"] or "")
        if est_:
            j["idade"] = ANO - est_[1]; j["ovr"] = est_[0]; j["estrela"] = True
            continue
        num = j["num"]
        if idades:
            idade = idades[0] + h(semente, "id") % (idades[1] - idades[0] + 1)
        elif j.get("gerado"):
            idade = 17 + h(semente, "id") % 6
        elif num >= 30 and num not in (33, 44, 77, 99, 90, 70):
            idade = 18 + h(semente, "id") % 5
        elif 1 <= num <= 11:
            idade = 21 + h(semente, "id") % 14
        else:
            idade = 18 + h(semente, "id") % 16
        if j["pos"] == "GOL" and idade < 24 and num in (1, 12, 13, 25) and not idades:
            idade += 6
        desloc = 1 if 1 <= num <= 11 else -2 if num == 0 and not j.get("gerado") else -3 if num <= 29 else -6
        if j["pos"] == "GOL" and num != 1: desloc -= 4
        if liga == "KSA1": desloc += 3 if j["nac"] not in ("KSA", "") else -2
        if j.get("gerado"): desloc = -7 if not idades else (2 if k % 2 == 0 else -4)
        if not idades:
            if idade <= 20: desloc -= 4
            elif idade >= 33: desloc -= 1
        j["idade"] = idade
        j["ovr_base"] = forca + desloc + normal(semente, "ovr") * 2.6
    for it in range(4):
        for j in jogs:
            if "ovr_base" in j:
                j["ovr"] = max(piso, min(91, forca + 3, round(j["ovr_base"])))
        gols = sorted([j["ovr"] for j in jogs if j["pos"] == "GOL"], reverse=True)
        linha = sorted([j["ovr"] for j in jogs if j["pos"] != "GOL"], reverse=True)
        top = linha[:10] + [gols[0] if gols else 55]
        delta = forca - sum(top) / len(top)
        if abs(delta) < 0.3: break
        for j in jogs:
            if "ovr_base" in j: j["ovr_base"] += delta
    for k, j in enumerate(jogs):
        if j.get("gerado"):
            j["nome"] = nome_gerado(j["nac"] if j["nac"] in NOMES else pais, f"{cid}-{k}", USADOS)
            TOTAL_GERADOS += 1
        else:
            j["nome"] = parodia(j["real"], USADOS)
            TOTAL_REAIS += 1
    jogs.sort(key=lambda j: (["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"].index(j["pos"]), -j["ovr"]))
    nac = lambda x: {"BRX": "BRA", "USX": "USA"}.get(x, x)
    return [[j["nome"], j["pos"], j["ovr"], j["idade"], nac(j["nac"] or pais), j["num"], 1 if j.get("gerado") else 0] for j in jogs]


def clube_json(cid, nome, apelido, cidade, estadio, capacidade, cores, padrao, forca, fclube, elenco, extra=None):
    d = {"id": cid, "nome": nome, "apelido": apelido, "cidade": cidade, "estadio": estadio, "capacidade": capacidade,
         "cores": cores, "padrao": padrao, "forca": forca, "fClube": fclube, "elenco": elenco}
    if extra: d.update(extra)
    return d


TOTAL_REAIS = TOTAL_GERADOS = 0
USADOS: set = set()


def main():
    global USADOS
    clubes_tsv = ler_tsv(os.path.join(FONTES, "clubes-parodia.tsv"))
    estadios = {(r["liga"], r["clube"]): r for r in ler_tsv(os.path.join(FONTES, "estadios-2026.tsv"))}
    pacote = json.load(open(os.path.join(RAIZ, "data", "pacote-brasil-serie-a-v0.3.json"), encoding="utf-8"))
    reais_vistos = {j["inspirado_em"] for j in pacote["jogadores"] if j.get("inspirado_em")}
    USADOS |= {j["nome"] for j in pacote["jogadores"]}  # paródias já existentes na Série A
    avisos = []
    saida = {"versao": "2026.2", "gerado_em": "2026-10-21",
             "aviso": "Clubes, estádios e jogadores em paródia, inspirados nos elencos de out/2026 (Wikipédia). Idades e OVR são estimativas. Série D, várzea, colégios e universidades são gerados. Escudos não são reproduzidos.",
             "ligas": []}
    por_liga = {}
    for r in clubes_tsv:
        por_liga.setdefault(r["liga"], []).append(r)
    for liga in ORDEM:
        elencos = ler_elencos(liga)
        pais = PAIS_LIGA[liga]
        nomes_tsv = {r["real"] for r in por_liga[liga]}
        for k in elencos:
            if k not in nomes_tsv:
                avisos.append(f"{liga}: elenco sem clube na tabela: {k}")
        clubes_out = []
        for r in por_liga[liga]:
            est = estadios.get((liga, r["real"]))
            if not est:
                avisos.append(f"{liga}: sem estádio para {r['real']}")
            jogs = []
            for j in elencos.get(r["real"], []):
                if j["real"] in reais_vistos:
                    continue
                reais_vistos.add(j["real"])
                jogs.append(j)
            if not elencos.get(r["real"]):
                avisos.append(f"{liga}: {r['real']} sem elenco real (gerado)")
            elenco = montar_elenco(r["id"], liga, pais, int(r["forca"]), jogs, piso=42 if liga != "BRA3" else 40)
            clubes_out.append(clube_json(r["id"], r["nome"], r["apelido"], (est or {}).get("cidade", ""), r["estadio"], int((est or {}).get("capacidade") or 0),
                                         [r["cor1"], r["cor2"]], r["padrao"], int(r["forca"]), float(r["fClube"]), elenco))
        saida["ligas"].append({"id": liga, "clubes": clubes_out})

    # Série D: 96 clubes em 8 grupos regionais de 12 (gerados)
    sd = ler_tsv(os.path.join(FONTES, "clubes-serie-d.tsv"))
    sd.sort(key=lambda r: (UF_ORDEM.index(r["uf"]), r["real"]))
    for g in range(8):
        grupo = sd[g * 12:(g + 1) * 12]
        clubes_out = []
        for r in grupo:
            cid = "D-" + re.sub(r"[^A-Z]", "", sem_acento(r["real"]).upper())[:6] + r["uf"]
            forca = int(r["forca"])
            cap = 3000 + h(cid, "cap") % 12 * 1000
            elenco = montar_elenco(cid, "BRA4", "BRX", forca, [], idades=(18, 34), minimo_tam=23, piso=36)
            clubes_out.append(clube_json(cid, r["nome"], r["apelido"], r["cidade"], f"Estádio Municipal de {r['cidade']}", cap, [r["cor1"], r["cor2"]], r["padrao"],
                                         forca, round(0.08 + (forca - 44) * 0.012, 3), elenco, {"uf": r["uf"]}))
        regioes = [REGIAO_UF[r["uf"]] for r in grupo]
        regiao = max(set(regioes), key=regioes.count)
        saida["ligas"].append({"id": f"BRA4{'ABCDEFGH'[g]}", "regiao": regiao, "clubes": clubes_out})

    # várzea: 10 clubes por cidade, força 36–45
    for sigla, (cidade, bairros) in VARZEA.items():
        clubes_out = []
        for k, bairro in enumerate(bairros):
            cid = f"V-{sigla}-{k}"
            pref = PREFIXOS_VARZEA[h(cid, "pref") % len(PREFIXOS_VARZEA)]
            nome = f"{pref} {bairro}" if pref in ("Real", "Esporte Clube") else f"{pref} {bairro}".replace(" do ", " da " if bairro.split()[0] in ("Vila", "Cidade", "Lomba", "Brasília", "Água", "Casa", "Nova", "Barra", "Serra", "Penha", "Maré", "Restinga", "Cruzeiro", "Liberdade", "Várzea", "Granja", "Serrinha", "Cabana", "Pampulha", "Pavuna", "Rocinha", "Lindéia") else " do ")
            forca = 36 + h(cid, "f") % 10
            c1, c2 = CORES_VARZEA[h(cid, "cor") % len(CORES_VARZEA)]
            elenco = montar_elenco(cid, "VAR", "BRX", forca, [], idades=(16, 37), minimo_tam=20, piso=28)
            clubes_out.append(clube_json(cid, nome, bairro, cidade, f"Campo do {bairro}" if not bairro.startswith(("Vila", "Cidade")) else f"Campão da {bairro}", 0, [c1, c2],
                                         ["lisa", "listrasV", "faixaH", "faixa"][h(cid, "pad") % 4], forca, 0.02, elenco))
        saida["ligas"].append({"id": f"VAR-{sigla}", "cidade": cidade, "clubes": clubes_out})

    # EUA: colegial (14–17) e universitário (18–22)
    clubes_out = []
    for k, nome in enumerate(ESCOLAS_EUA):
        cid = f"HS-{k}"
        forca = 40 + h(cid, "f") % 7
        c1, c2 = CORES_VARZEA[h(cid, "cor") % len(CORES_VARZEA)]
        elenco = montar_elenco(cid, "HS", "USX", forca, [], idades=(14, 17), minimo_tam=20, piso=30)
        clubes_out.append(clube_json(cid, nome, nome.split()[0], "Miami", f"Campo do {nome}", 2000, [c1, c2], "lisa", forca, 0.02, elenco))
    saida["ligas"].append({"id": "USA-HS", "clubes": clubes_out})
    clubes_out = []
    for k, (nome, apelido, c1, c2, forca) in enumerate(UNIVERSIDADES):
        cid = f"NC-{k}"
        elenco = montar_elenco(cid, "NCAA", "USX", forca, [], idades=(18, 22), minimo_tam=24, piso=38)
        clubes_out.append(clube_json(cid, nome, apelido, "", f"Campo Universitário de {nome}", 5000, [c1, c2], "lisa", forca, 0.05, elenco))
    saida["ligas"].append({"id": "USA-NCAA", "clubes": clubes_out})

    with open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, separators=(",", ":"))
    for a in avisos:
        print("aviso:", a)
    print(f"ok: {sum(len(l['clubes']) for l in saida['ligas'])} clubes, {TOTAL_REAIS} jogadores paródia, {TOTAL_GERADOS} gerados, {os.path.getsize(SAIDA)//1024} KB")


if __name__ == "__main__":
    main()
