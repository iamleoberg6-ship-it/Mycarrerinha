"""Exporta as peças da cabeça para o jogo: app/visual/arte/pecas.json.

Cada peça é um fragmento SVG no sistema do documento do kit, com "§" no lugar do prefixo dos ids
(o jogo troca por um prefixo único a cada desenho). As cores ficam as originais; o jogo recolore
(pele pelo tom, cabelo pela cor) com as mesmas regras de pecas.py.
uso: python3 -I scripts/arte/exportar.py
"""
import os, re, sys, json
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from pecas import catalogo, ref_cabelo, TONS, CORES_CABELO

RAIZ = os.path.join(AQUI, "..", "..")
KIT = os.path.join(RAIZ, "arte", "fontes", "rosto-masc.svg")
BB = os.path.join(RAIZ, "arte", "fontes", "rosto-masc-bbox.csv")
SAIDA = os.path.join(RAIZ, "app", "visual", "arte", "pecas.json")

def enxuga(x):
    """Tira espaços sobrando (as coordenadas ficam como estão: os caminhos usam comandos relativos,
    e arredondar acumularia erro ao longo do contorno)."""
    x = re.sub(r">\s+<", "><", x)
    x = re.sub(r"\s{2,}", " ", x)
    return x

def main():
    k, R, CB, F = catalogo(KIT, BB)
    def peca(spec, nome, costura=False):
        return enxuga(k.peca(spec["ids"], spec["T"], pref=f"§{nome}_", costura=costura))
    ordem_r = ["molde"] + [f"rosto {i}" for i in range(1, 7)]
    ordem_c = ["molde"] + [f"cabelo {i}" for i in range(1, 7)]
    ordem_f = ["molde"] + [str(i) for i in range(1, 7)]
    out = {
        "tons": TONS, "coresCabelo": CORES_CABELO,
        "rostos": [dict(svg=peca(R[r], "r", True), ref=R[r].get("ref"), queixo=round(R[r]["queixo"], 1)) for r in ordem_r],
        "cabelos": [],
        "olhos": [dict(e=peca(F["olho_e"][v], "oe"), d=peca(F["olho_d"][v], "od")) for v in ordem_f],
        "sobrancelhas": [dict(e=peca(F["sobr_e"][v], "se"), d=peca(F["sobr_d"][v], "sd"),
                              ref=ref_cabelo(k, F["sobr_e"][v]["ids"])) for v in ordem_f],
        "narizes": [peca(F["nariz"][v], "n", True) for v in ordem_f],
        "bocas": [peca(F["boca"][v], "b", True) for v in ordem_f],
    }
    for c in ordem_c:
        cb = CB[c]
        out["cabelos"].append(dict(
            svg=peca(cb, "c"),
            tras=(enxuga(k.peca(cb["tras"], cb["T"], pref="§t_")) if cb.get("tras") else None),
            ref=ref_cabelo(k, cb["ids"] + (cb.get("tras") or [])),
        ))
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w") as f: json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(SAIDA, os.path.getsize(SAIDA) // 1024, "KB")

if __name__ == "__main__":
    main()
