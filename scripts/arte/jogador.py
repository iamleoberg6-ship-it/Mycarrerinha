"""Monta o jogador modelo: corpo (uma peça) + cabeça do kit + uniforme + tatuagem.
uso: python3 -I jogador.py cabeca.svg saida.svg"""
import sys, re, xml.etree.ElementTree as ET

NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS); ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
CX = 300  # eixo do corpo

def cr(pts, fechado=False):
    """Catmull-Rom -> Bézier cúbica (curva suave passando pelos pontos)."""
    p = pts[:]
    n = len(p)
    d = f"M{p[0][0]:.1f},{p[0][1]:.1f}"
    rng = range(n if fechado else n - 1)
    for i in rng:
        p0 = p[(i - 1) % n] if (fechado or i > 0) else p[i]
        p1, p2 = p[i], p[(i + 1) % n]
        p3 = p[(i + 2) % n] if (fechado or i + 2 < n) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d + (" Z" if fechado else "")

def espelho(meio):
    """meio: pontos do lado direito (dx, y) de cima p/ baixo terminando no eixo. Devolve contorno fechado."""
    dir_ = [(CX + x, y) for x, y in meio]
    esq = [(CX - x, y) for x, y in reversed(meio[:-1])]
    return dir_ + esq[:-1] if meio[0][0] == 0 else dir_ + esq

def lado(pts):  # mesmo contorno nos dois lados (pernas, braços)
    return [(CX + x, y) for x, y in pts], [(CX - x, y) for x, y in pts]

# ---------------- corpo (uma peça: pescoço, tronco, braços, pernas) ----------------
CORPO_DIR = [
    (32, 170), (34, 206), (70, 216), (102, 226), (128, 242),
    # braço: deltoide, bíceps, cotovelo, antebraço, punho, mão (polegar para dentro)
    (142, 266), (147, 300), (145, 336), (139, 370), (137, 388), (142, 412), (137, 448), (128, 474),
    (132, 494), (131, 516), (122, 534), (109, 541), (98, 535), (94, 520), (88, 506), (90, 494),
    (99, 478), (104, 444), (106, 410), (105, 388), (110, 352), (107, 318), (100, 296),
    # tronco
    (94, 330), (80, 420), (84, 480), (94, 540),
    # perna: coxa, joelho, panturrilha, tornozelo, pé
    (99, 610), (88, 668), (88, 698), (97, 730), (92, 778), (66, 848), (78, 880), (68, 896),
    (20, 898), (16, 870), (22, 848), (13, 780), (10, 732), (15, 700), (19, 684), (12, 640),
    (8, 590), (6, 545), (0, 540),
]
corpo = cr(espelho([(0, 170)] + CORPO_DIR[:]) , fechado=True)

# ---------------- uniforme ----------------
CAMISA_DIR = [(0, 214), (30, 204), (44, 206), (80, 216), (116, 228), (142, 248), (154, 286), (158, 318),
              (114, 332), (108, 316), (98, 330), (90, 400), (92, 470), (96, 490), (0, 494)]
camisa = cr(espelho(CAMISA_DIR), fechado=True)
gola = cr(espelho([(0, 230), (20, 224), (34, 212), (44, 206), (38, 202), (24, 214), (0, 220)]), fechado=True)
CALCAO_DIR = [(0, 470), (90, 468), (97, 520), (106, 600), (100, 618), (12, 618), (8, 570), (0, 560)]
calcao = cr(espelho(CALCAO_DIR), fechado=True)
# meião acompanha a perna (2 de folga): abaixo do joelho até o tornozelo
MEIAO = [(91, 702), (100, 732), (94, 780), (68, 850), (20, 850), (11, 780), (8, 732), (13, 702)]
meiao_d, meiao_e = (cr(p, True) for p in lado(MEIAO))

# ---------------- chuteira com marca de patrocinador (paródias) ----------------
MARCAS = {
    "Umbrella": dict(base=("#1b3d6e", "#0b1f3d"), sola="#e4e8ef", detalhe="#ffffff", trava="#c9ced8"),
    "Mizuna":   dict(base=("#ffffff", "#d9e1ee"), sola="#0047ab", detalhe="#0047ab", trava="#0047ab"),
    "Naiki":    dict(base=("#ff6a2b", "#c43b0a"), sola="#16181d", detalhe="#16181d", trava="#16181d"),
    "Adidaz":   dict(base=("#2b2f38", "#0d0f13"), sola="#e8ff3a", detalhe="#ffffff", trava="#e8ff3a"),
    "Pumba":    dict(base=("#ffd400", "#e0a800"), sola="#16181d", detalhe="#16181d", trava="#16181d"),
}
def logo(marca, cor):
    """Marca na lateral de fora da chuteira (coordenadas locais do pé)."""
    if marca == "Umbrella":  # guarda-chuva
        return (f'<path d="M30,34 Q41,22 52,34 Q49,31 46,34 Q44,31 41,34 Q38,31 36,34 Q33,31 30,34 Z" fill="{cor}"/>'
                f'<path d="M41,33 V41 Q41,44 38,43" stroke="{cor}" stroke-width="1.6" fill="none" stroke-linecap="round"/>')
    if marca == "Mizuna":  # onda
        return f'<path d="M28,40 C34,30 40,44 46,34 C49,29 53,30 56,33" stroke="{cor}" stroke-width="3" fill="none" stroke-linecap="round"/>'
    if marca == "Naiki":  # raio
        return f'<path d="M44,24 L34,36 L42,36 L37,46 L52,31 L44,31 L49,24 Z" fill="{cor}"/>'
    if marca == "Adidaz":  # três faixas na diagonal
        return "".join(f'<path d="M{28+i*8},44 L{34+i*8},30 L{38+i*8},31 L{32+i*8},45 Z" fill="{cor}"/>' for i in range(3))
    if marca == "Pumba":  # faixa curva
        return f'<path d="M26,42 C36,40 44,34 56,28 C50,36 42,42 30,46 Z" fill="{cor}"/>'
    return ""
def chuteira(marca, gid):
    m = MARCAS[marca]
    corpo_pe = cr([(-22, 2), (20, 0), (28, 14), (44, 24), (58, 34), (61, 44), (50, 52), (10, 54), (-20, 52), (-28, 40), (-27, 20)], True)
    sola = cr([(-27, 42), (10, 47), (50, 45), (61, 41), (59, 48), (50, 54), (10, 56), (-20, 54)], True)
    travas = "".join(f'<path d="M{x-3},55 h6 l-1,5 h-4 Z" fill="{m["trava"]}"/>' for x in (-18, 0, 22, 44))
    cadarco = "".join(f'<path d="M{-6+i*5},{8+i*4} l8,-3" stroke="#fff" stroke-opacity=".75" stroke-width="1.3" stroke-linecap="round"/>' for i in range(4))
    return (f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{m["base"][0]}"/><stop offset="1" stop-color="{m["base"][1]}"/></linearGradient>',
            f'{travas}<path d="{corpo_pe}" fill="url(#{gid})"/>'
            f'<path d="M-20,4 C-10,10 10,10 20,2 C10,-2 -10,-2 -20,4 Z" fill="#000" opacity=".35"/>'
            f'<path d="M-24,30 C-20,14 -10,8 0,8" stroke="#fff" stroke-opacity=".3" stroke-width="1.6" fill="none"/>'
            f'{cadarco}{logo(marca, m["detalhe"])}<path d="{sola}" fill="{m["sola"]}"/>')

# ---------------- sombras (luz vindo da esquerda) ----------------
def sombra_membro(pts):
    return cr(pts, True)
sombras_pele = [
    # luz da esquerda: lado de fora do braço da direita da tela e lado de dentro do outro escurecem
    cr([(CX + 132, 330), (CX + 147, 330), (CX + 145, 340), (CX + 139, 370), (CX + 137, 388), (CX + 142, 412), (CX + 137, 448), (CX + 128, 474),
        (CX + 118, 474), (CX + 128, 448), (CX + 132, 412), (CX + 126, 388), (CX + 132, 356)], True),
    cr([(CX - 110, 334), (CX - 104, 334), (CX - 102, 388), (CX - 101, 440), (CX - 98, 476), (CX - 104, 476), (CX - 106, 440), (CX - 108, 388)], True),
    cr([(CX + 106, 498), (CX + 132, 494), (CX + 124, 532), (CX + 110, 540)], True),
    cr([(CX - 94, 504), (CX - 90, 516), (CX - 100, 528)], True),
    # pernas: lado de fora da perna da direita, lado de dentro da outra
    cr([(CX + 74, 618), (CX + 100, 618), (CX + 88, 668), (CX + 88, 702), (CX + 76, 702), (CX + 76, 668)], True),
    cr([(CX - 13, 618), (CX - 24, 618), (CX - 22, 690), (CX - 15, 702)], True),
]
sombras_camisa = [
    cr([(CX + 40, 240), (CX + 98, 250), (CX + 92, 300), (CX + 86, 420), (CX + 92, 490), (CX + 56, 490), (CX + 62, 380), (CX + 54, 300)], True),
    cr([(CX + 116, 262), (CX + 146, 284), (CX + 156, 316), (CX + 118, 324)], True),
    cr([(CX - 60, 440), (CX - 20, 460), (CX + 10, 452), (CX - 10, 476), (CX - 60, 470)], True),
]
reflexos_camisa = [
    cr([(CX - 120, 256), (CX - 96, 246), (CX - 70, 262), (CX - 92, 280), (CX - 118, 290)], True),
    cr([(CX - 70, 300), (CX - 20, 290), (CX - 30, 360), (CX - 74, 380)], True),
]

def tatuagem():
    """Tatuagem no antebraço esquerdo do jogador (lado direito da tela): rosa + linhas."""
    x, y = CX + 121, 424
    rosa = (f'<g transform="translate({x},{y})" fill="none" stroke="#2b1d3a" stroke-width="1.6" stroke-linecap="round" opacity=".78">'
            '<path d="M0,-12 C7,-12 9,-4 4,0 C0,3 -6,1 -6,-4 C-6,-9 2,-9 2,-4"/>'
            '<path d="M-9,-8 C-12,0 -6,8 2,7 C9,6 12,-2 9,-10"/>'
            '<path d="M-3,8 C-4,18 -3,30 -1,42"/><path d="M-2,18 C-8,16 -11,20 -12,24 C-6,25 -3,22 -2,18"/>'
            '<path d="M-1,30 C5,27 9,30 10,34 C4,35 0,33 -1,30"/>'
            '<path d="M-10,-26 L10,-26 M-11,-31 L11,-31" stroke-width="1.2"/>'
            '</g>')
    return rosa

def montar(cabeca_svg, saida, cor="#c8102e", cor2="#8a0a1f", calc="#ffffff", calc2="#c9ccd6", marca="Umbrella"):
    grad_chut, pe = chuteira(marca, "chut")
    cab = ET.parse(cabeca_svg).getroot()
    # tira camiseta e gola do kit
    tirar = {"g6554", "g6572", "g6592", "g6608", "g6624", "g6644", "g6660", "path6552", "path6570", "path6590", "path6640", "path6642"}
    g10 = cab.find(f".//{{{NS}}}g[@id='g10']")
    for e in list(g10):
        if e.get("id") in tirar: g10.remove(e)
    vb = [float(v) for v in cab.get("viewBox").split()]
    s = 0.088
    # recorte: cabeça inteira acima do pescoço + coluna do pescoço
    clip = ET.SubElement(cab.find(f"{{{NS}}}defs"), f"{{{NS}}}clipPath", {"id": "recorteCabeca"})
    ET.SubElement(clip, f"{{{NS}}}path", {"d": "M3800,800 H5800 V2380 H5176 L5176,2540 Q4806,2660 4440,2540 L4440,2380 H3800 Z"})
    g8 = cab.find(f"{{{NS}}}g")
    cab.remove(g8)
    wrap = ET.SubElement(cab, f"{{{NS}}}g", {"clip-path": "url(#recorteCabeca)"}); wrap.append(g8)
    largura = vb[2] * s; alt = vb[3] * s
    queixo = 2405
    cab.set("x", f"{CX - (4806.6 - vb[0]) * s:.1f}"); cab.set("y", f"{188 - (queixo - vb[1]) * s:.1f}")
    cab.set("width", f"{largura:.1f}"); cab.set("height", f"{alt:.1f}")
    cab.attrib.pop("id", None)
    cab_xml = ET.tostring(cab, encoding="unicode")

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="140 40 320 870" width="640" height="1740">
<defs>
  <linearGradient id="pele" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="#ffc8b0"/><stop offset=".45" stop-color="#f7ab8a"/><stop offset="1" stop-color="#ee9070"/></linearGradient>
  <linearGradient id="camisa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{cor}"/><stop offset="1" stop-color="{cor2}"/></linearGradient>
  <linearGradient id="calcao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{calc}"/><stop offset="1" stop-color="{calc2}"/></linearGradient>
  <linearGradient id="meiao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{cor}"/><stop offset="1" stop-color="{cor2}"/></linearGradient>
  {grad_chut}
  <linearGradient id="pescoco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8714d"/><stop offset=".5" stop-color="#ef9372"/><stop offset="1" stop-color="#f6a989"/></linearGradient>
  <clipPath id="clipCorpo"><path d="{corpo}"/></clipPath>
  <clipPath id="clipCamisa"><path d="{camisa}"/></clipPath>
</defs>
<path d="{corpo}" fill="url(#pele)"/>
<path d="M{CX-33},176 L{CX+33},176 L{CX+34},214 L{CX-34},214 Z" fill="url(#pescoco)"/>
<g clip-path="url(#clipCorpo)" fill="#e8714d" opacity=".45">{''.join(f'<path d="{d}"/>' for d in sombras_pele)}</g>
<g clip-path="url(#clipCorpo)">{tatuagem()}</g>
<g stroke="#fff" stroke-opacity=".35" stroke-width=".6" fill="none" clip-path="url(#clipCorpo)">
  <path d="M{CX-138},334 C{CX-138},350 {CX-134},366 {CX-130},380"/><path d="M{CX-134},400 C{CX-134},420 {CX-131},446 {CX-124},470"/>
  <path d="M{CX+58},748 C{CX+66},770 {CX+70},800 {CX+66},830"/>
  <path d="M{CX-70},672 C{CX-58},664 {CX-38},664 {CX-28},674"/><path d="M{CX+70},672 C{CX+58},664 {CX+38},664 {CX+28},674"/>
  <path d="M{CX-60},630 C{CX-62},650 {CX-60},660 {CX-58},664"/></g>
<g fill="none" stroke="#d9714f" stroke-opacity=".55" stroke-width="1.1" clip-path="url(#clipCorpo)">
  <path d="M{CX-66},686 C{CX-56},694 {CX-40},694 {CX-30},686"/><path d="M{CX+66},686 C{CX+56},694 {CX+40},694 {CX+30},686"/>
  <path d="M{CX-126},384 C{CX-120},390 {CX-112},390 {CX-108},386"/><path d="M{CX+126},384 C{CX+120},390 {CX+112},390 {CX+108},386"/>
  <path d="M{CX-112},346 C{CX-118},352 {CX-122},364 {CX-120},374" stroke-opacity=".3"/></g>
<path d="{meiao_d}" fill="url(#meiao)"/><path d="{meiao_e}" fill="url(#meiao)"/>
<g fill="none" stroke="#fff" stroke-width="5" opacity=".92"><path d="M{CX+11},716 C{CX+40},720 {CX+70},720 {CX+95},714"/><path d="M{CX-11},716 C{CX-40},720 {CX-70},720 {CX-95},714"/></g>
<path d="M{CX+66},726 C{CX+82},740 {CX+82},780 {CX+60},850 L{CX+68},850 C{CX+94},780 {CX+100},740 {CX+91},702 C{CX+82},712 {CX+74},718 {CX+66},726 Z" fill="#000" opacity=".16"/>
<path d="M{CX-30},740 C{CX-32},770 {CX-30},800 {CX-26},830" stroke="#fff" stroke-opacity=".25" stroke-width="1.6" fill="none"/>
<g transform="translate({CX+43},848)">{pe}</g>
<g transform="translate({CX-43},848) scale(-1,1)">{pe}</g>
<path d="{calcao}" fill="url(#calcao)"/>
<path d="M{CX},560 L{CX},616" stroke="{calc2}" stroke-width="1.2"/>
<path d="M{CX+58},480 C{CX+70},540 {CX+82},590 {CX+92},616 L{CX+102},616 C{CX+96},560 {CX+92},510 {CX+90},470 Z" fill="#000" opacity=".1"/>
<path d="M{CX+100},602 L{CX+106},602 L{CX+100},618 L{CX+12},618 L{CX+10},610 Z M{CX-100},602 L{CX-106},602 L{CX-100},618 L{CX-12},618 L{CX-10},610 Z" fill="{cor}"/>
<path d="{camisa}" fill="url(#camisa)"/>
<g clip-path="url(#clipCamisa)">
  <g fill="#000" opacity=".16">{''.join(f'<path d="{d}"/>' for d in sombras_camisa)}</g>
  <g fill="#fff" opacity=".12">{''.join(f'<path d="{d}"/>' for d in reflexos_camisa)}</g>
  <path d="M{CX+108},316 L{CX+157},306 L{CX+158},320 L{CX+114},332 Z M{CX-108},316 L{CX-157},306 L{CX-158},320 L{CX-114},332 Z" fill="#fff" opacity=".9"/>
  <g stroke="#fff" stroke-opacity=".28" stroke-width=".7" fill="none">
    <path d="M{CX-98},250 C{CX-96},300 {CX-92},360 {CX-88},420"/><path d="M{CX+20},300 C{CX+26},360 {CX+30},420 {CX+30},470"/></g>
</g>
<path d="{gola}" fill="#fff"/>
<text x="{CX-62}" y="300" font-family="Arial Black, Arial" font-weight="900" font-size="22" fill="#fff" opacity=".95">10</text>
{cab_xml}
</svg>'''
    open(saida, "w").write(svg)

def vitrine(saida):
    """As chuteiras de cada marca lado a lado."""
    partes, defs = [], []
    for i, m in enumerate(MARCAS):
        g, pe = chuteira(m, f"c{i}"); defs.append(g)
        partes.append(f'<g transform="translate({60+i*110},20) scale(1.3)">{pe}</g>'
                      f'<text x="{78+i*110}" y="118" font-family="Arial" font-size="13" text-anchor="middle" fill="#333">{m}</text>')
    open(saida, "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 130" width="1160" height="260"><rect width="580" height="130" fill="#fff"/><defs>{"".join(defs)}</defs>{"".join(partes)}</svg>')

if __name__ == "__main__":
    if sys.argv[1] == "--vitrine": vitrine(sys.argv[2])
    else: montar(sys.argv[1], sys.argv[2], marca=sys.argv[3] if len(sys.argv) > 3 else "Umbrella")
