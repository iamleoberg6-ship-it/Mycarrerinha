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
    (32, 170), (34, 206), (70, 216), (102, 226), (126, 244), (136, 280), (138, 318), (134, 352),
    (128, 380), (133, 412), (126, 462), (124, 476), (128, 496), (122, 522), (110, 536), (100, 530),
    (97, 512), (91, 498), (97, 488), (101, 466), (106, 420), (102, 384), (106, 344), (99, 296),
    (94, 330), (80, 420), (84, 480), (94, 540), (96, 600), (84, 668), (82, 690), (90, 740), (66, 852),
    (78, 880), (68, 896), (20, 898), (16, 870), (22, 846), (18, 760), (14, 700), (20, 682), (12, 640),
    (8, 590), (6, 545), (0, 540),
]
corpo = cr(espelho([(0, 170)] + CORPO_DIR[:]) , fechado=True)

# ---------------- uniforme ----------------
CAMISA_DIR = [(0, 214), (30, 204), (44, 206), (80, 216), (114, 228), (138, 250), (148, 296), (150, 316),
              (110, 328), (104, 314), (98, 330), (90, 400), (92, 470), (96, 490), (0, 494)]
camisa = cr(espelho(CAMISA_DIR), fechado=True)
gola = cr(espelho([(0, 230), (20, 224), (34, 212), (44, 206), (38, 202), (24, 214), (0, 220)]), fechado=True)
CALCAO_DIR = [(0, 470), (90, 468), (96, 520), (104, 600), (98, 616), (12, 616), (8, 570), (0, 560)]
calcao = cr(espelho(CALCAO_DIR), fechado=True)
meiao_d, meiao_e = (cr(p, True) for p in lado([(90, 700), (84, 760), (64, 852), (20, 852), (16, 760), (14, 700)]))
chut_d, chut_e = (cr(p, True) for p in lado([(66, 846), (78, 872), (74, 896), (54, 902), (14, 900), (10, 880), (18, 846)]))

# ---------------- sombras (luz vindo da esquerda) ----------------
def sombra_membro(pts):
    return cr(pts, True)
sombras_pele = [
    # braço direito (do jogador = lado esquerdo da tela) fica claro; o outro escurece
    cr([(CX + 118, 322), (CX + 140, 322), (CX + 134, 356), (CX + 128, 380), (CX + 134, 412), (CX + 126, 470), (CX + 114, 470), (CX + 122, 412), (CX + 116, 380), (CX + 124, 352)], True),
    cr([(CX - 112, 330), (CX - 104, 330), (CX - 100, 380), (CX - 104, 420), (CX - 100, 466), (CX - 106, 466), (CX - 110, 420), (CX - 106, 380)], True),
    cr([(CX + 104, 500), (CX + 128, 496), (CX + 120, 530), (CX + 108, 536)], True),
    cr([(CX - 100, 500), (CX - 96, 512), (CX - 104, 524)], True),
    # pernas: lado de dentro
    cr([(CX + 60, 616), (CX + 92, 616), (CX + 80, 690), (CX + 86, 700), (CX + 70, 700), (CX + 64, 660)], True),
    cr([(CX - 16, 616), (CX - 30, 616), (CX - 26, 690), (CX - 16, 700)], True),
    # pescoço (sombra do queixo já vem da cabeça)
]
sombras_camisa = [
    cr([(CX + 40, 240), (CX + 98, 250), (CX + 92, 300), (CX + 86, 420), (CX + 92, 490), (CX + 56, 490), (CX + 62, 380), (CX + 54, 300)], True),
    cr([(CX + 112, 262), (CX + 140, 290), (CX + 144, 312), (CX + 116, 318)], True),
    cr([(CX - 60, 440), (CX - 20, 460), (CX + 10, 452), (CX - 10, 476), (CX - 60, 470)], True),
]
reflexos_camisa = [
    cr([(CX - 120, 256), (CX - 96, 246), (CX - 70, 262), (CX - 92, 280), (CX - 118, 290)], True),
    cr([(CX - 70, 300), (CX - 20, 290), (CX - 30, 360), (CX - 74, 380)], True),
]

def tatuagem():
    """Tatuagem no antebraço esquerdo do jogador (lado direito da tela): rosa + linhas."""
    x, y = CX + 116, 420
    rosa = (f'<g transform="translate({x},{y})" fill="none" stroke="#2b1d3a" stroke-width="1.6" stroke-linecap="round" opacity=".78">'
            '<path d="M0,-12 C7,-12 9,-4 4,0 C0,3 -6,1 -6,-4 C-6,-9 2,-9 2,-4"/>'
            '<path d="M-9,-8 C-12,0 -6,8 2,7 C9,6 12,-2 9,-10"/>'
            '<path d="M-3,8 C-4,18 -3,30 -1,42"/><path d="M-2,18 C-8,16 -11,20 -12,24 C-6,25 -3,22 -2,18"/>'
            '<path d="M-1,30 C5,27 9,30 10,34 C4,35 0,33 -1,30"/>'
            '<path d="M-10,-26 L10,-26 M-11,-31 L11,-31" stroke-width="1.2"/>'
            '</g>')
    return rosa

def montar(cabeca_svg, saida, cor="#c8102e", cor2="#8a0a1f", calc="#ffffff", calc2="#c9ccd6"):
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
  <linearGradient id="chuteira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f4a"/><stop offset="1" stop-color="#101217"/></linearGradient>
  <linearGradient id="pescoco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8714d"/><stop offset=".5" stop-color="#ef9372"/><stop offset="1" stop-color="#f6a989"/></linearGradient>
  <clipPath id="clipCorpo"><path d="{corpo}"/></clipPath>
  <clipPath id="clipCamisa"><path d="{camisa}"/></clipPath>
</defs>
<path d="{corpo}" fill="url(#pele)"/>
<path d="M{CX-33},176 L{CX+33},176 L{CX+34},214 L{CX-34},214 Z" fill="url(#pescoco)"/>
<g clip-path="url(#clipCorpo)" fill="#e8714d" opacity=".45">{''.join(f'<path d="{d}"/>' for d in sombras_pele)}</g>
<g clip-path="url(#clipCorpo)">{tatuagem()}</g>
<g stroke="#fff" stroke-opacity=".35" stroke-width=".6" fill="none" clip-path="url(#clipCorpo)">
  <path d="M{CX-128},300 C{CX-126},340 {CX-122},370 {CX-118},384"/><path d="M{CX-124},396 C{CX-122},430 {CX-120},450 {CX-116},466"/>
  <path d="M{CX-70},672 C{CX-58},664 {CX-38},664 {CX-28},674"/><path d="M{CX+70},672 C{CX+58},664 {CX+38},664 {CX+28},674"/>
  <path d="M{CX-60},630 C{CX-62},650 {CX-60},660 {CX-58},664"/></g>
<g fill="none" stroke="#d9714f" stroke-opacity=".55" stroke-width="1.1" clip-path="url(#clipCorpo)">
  <path d="M{CX-66},686 C{CX-56},694 {CX-40},694 {CX-30},686"/><path d="M{CX+66},686 C{CX+56},694 {CX+40},694 {CX+30},686"/>
  <path d="M{CX-120},378 C{CX-114},384 {CX-108},384 {CX-104},380"/><path d="M{CX+120},378 C{CX+114},384 {CX+108},384 {CX+104},380"/></g>
<path d="{meiao_d}" fill="url(#meiao)"/><path d="{meiao_e}" fill="url(#meiao)"/>
<path d="M{CX+14},712 H{CX+88} M{CX-14},712 H{CX-88}" stroke="#fff" stroke-width="5" opacity=".9"/>
<path d="M{CX+50},700 C{CX+56},760 {CX+50},820 {CX+40},852 L{CX+64},852 C{CX+74},810 {CX+84},760 {CX+90},700 Z" fill="#000" opacity=".15"/>
<path d="{chut_d}" fill="url(#chuteira)"/><path d="{chut_e}" fill="url(#chuteira)"/>
<path d="M{CX+14},896 H{CX+74} M{CX-14},896 H{CX-74}" stroke="#d6ff3a" stroke-width="3" stroke-linecap="round"/>
<path d="M{CX+44},866 l14,8 M{CX-44},866 l-14,8" stroke="#d6ff3a" stroke-width="2.4" stroke-linecap="round"/>
<path d="M{CX+24},858 C{CX+34},852 {CX+50},852 {CX+58},860 M{CX-24},858 C{CX-34},852 {CX-50},852 {CX-58},860" stroke="#fff" stroke-opacity=".35" stroke-width="1.4" fill="none"/>
<path d="M{CX+22},886 C{CX+30},880 {CX+46},880 {CX+64},886 M{CX-22},886 C{CX-30},880 {CX-46},880 {CX-64},886" stroke="#fff" stroke-opacity=".2" stroke-width="1.2" fill="none"/>
<g fill="#d6ff3a">{''.join(f'<rect x="{CX+dx-2}" y="899" width="4" height="4" rx="1"/>' for dx in (-64,-46,-28,28,46,64))}</g>
<path d="{calcao}" fill="url(#calcao)"/>
<path d="M{CX},560 L{CX},616" stroke="{calc2}" stroke-width="1.2"/>
<path d="M{CX+58},480 C{CX+70},540 {CX+82},590 {CX+92},616 L{CX+102},616 C{CX+96},560 {CX+92},510 {CX+90},470 Z" fill="#000" opacity=".1"/>
<path d="M{CX+98},600 L{CX+104},600 L{CX+98},616 L{CX+12},616 L{CX+10},608 Z M{CX-98},600 L{CX-104},600 L{CX-98},616 L{CX-12},616 L{CX-10},608 Z" fill="{cor}"/>
<path d="{camisa}" fill="url(#camisa)"/>
<g clip-path="url(#clipCamisa)">
  <g fill="#000" opacity=".16">{''.join(f'<path d="{d}"/>' for d in sombras_camisa)}</g>
  <g fill="#fff" opacity=".12">{''.join(f'<path d="{d}"/>' for d in reflexos_camisa)}</g>
  <path d="M{CX+104},312 L{CX+146},304 L{CX+146},318 L{CX+110},326 Z M{CX-104},312 L{CX-146},304 L{CX-146},318 L{CX-110},326 Z" fill="#fff" opacity=".9"/>
  <g stroke="#fff" stroke-opacity=".28" stroke-width=".7" fill="none">
    <path d="M{CX-98},250 C{CX-96},300 {CX-92},360 {CX-88},420"/><path d="M{CX+20},300 C{CX+26},360 {CX+30},420 {CX+30},470"/></g>
</g>
<path d="{gola}" fill="#fff"/>
<text x="{CX-62}" y="300" font-family="Arial Black, Arial" font-weight="900" font-size="22" fill="#fff" opacity=".95">10</text>
{cab_xml}
</svg>'''
    open(saida, "w").write(svg)

if __name__ == "__main__":
    montar(sys.argv[1], sys.argv[2])
