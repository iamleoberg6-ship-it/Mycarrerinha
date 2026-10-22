"""Folha de aprovação das peças de rosto. uso: python3 -I folha_rostos.py kit.svg bboxes.csv saida.svg"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pecas import cabeca, catalogo, TONS, CORES_CABELO

kit, bb, saida = sys.argv[1:4]
k, R, CB, F = catalogo(kit, bb)
VB = "3500 500 2600 2300"
linhas = [
    ("Rostos com o próprio cabelo", [dict(rosto=r, cabelo=("molde" if r == "molde" else r.replace("rosto", "cabelo"))) for r in R]),
    ("Cabelos no mesmo rosto", [dict(cabelo=c) for c in CB]),
    ("Olhos, sobrancelhas, nariz e boca", [dict(olhos=n, sobr=n, nariz=n, boca=n) for n in ["molde", "1", "2", "3", "4", "5", "6"]]),
    ("Tons de pele", [dict(tom=t) for t in TONS]),
    ("Cores de cabelo (a sobrancelha acompanha)", [dict(cabelo=c, cor_cabelo=cor) for c, cor in zip(
        ["molde", "cabelo 1", "cabelo 5", "cabelo 4", "cabelo 6", "cabelo 3", "cabelo 2"],
        ["castanho", "loiro platinado", "loiro", "castanho escuro", "grisalho", "preto", "ruivo"])]),
    ("Mesmo tom em todos os rostos (moreno)", [dict(rosto=r, cabelo=("molde" if r == "molde" else r.replace("rosto", "cabelo")), tom="moreno") for r in R]),
]
W, H, cols = 260, 240, 7
out = [f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W*cols} {len(linhas)*(H+40)}" width="{W*cols}" height="{len(linhas)*(H+40)}"><rect width="100%" height="100%" fill="#fff"/>']
n = 0
for li, (titulo, cells) in enumerate(linhas):
    y = li * (H + 40)
    out.append(f'<text x="12" y="{y+28}" font-family="Arial" font-size="20" font-weight="bold" fill="#333">{titulo}</text>')
    for ci, kw in enumerate(cells):
        n += 1
        g, _ = cabeca(kit, bb, pref=f"k{n}_", **kw)
        out.append(f'<svg x="{ci*W}" y="{y+36}" width="{W}" height="{H}" viewBox="{VB}">{g}</svg>')
out.append("</svg>")
open(saida, "w").write("".join(out))
