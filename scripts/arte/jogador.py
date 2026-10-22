"""Monta o jogador modelo: corpo (uma peça) + cabeça do kit + uniforme + tatuagem.
uso: python3 -I jogador.py cabeca.svg saida.svg"""
import sys, os, re, xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pecas import cabeca, recolorir

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

# ---------------- corpo paramétrico (uma peça: pescoço, tronco, braços, pernas) ----------------
# ac: centro do braço | ka: grossura do braço | peito/cintura/quadril: meia-largura | kl: grossura da perna
# barriga: quanto a camisa estufa | lc: centro da coxa
TIPOS = {
    "esguio":         dict(ka=0.90, peito=72, cintura=58, quadril=64, kl=0.78, barriga=0, lc=48),
    "magro":          dict(ka=0.98, peito=78, cintura=62, quadril=68, kl=0.86, barriga=0, lc=50),
    "atlético":       dict(ka=1.30, peito=86, cintura=64, quadril=72, kl=1.00, barriga=0, lc=52),
    "forte":          dict(ka=1.55, peito=96, cintura=74, quadril=80, kl=1.12, barriga=0, lc=54),
    "troncudo":       dict(ka=1.45, peito=106, cintura=96, quadril=92, kl=1.14, barriga=6, lc=57),
}
BRACO = [(244, 0.0), (266, 16), (300, 19.5), (336, 19), (372, 15.5), (388, 14.5), (412, 16), (448, 13.5), (474, 11)]

def braco(t):
    """Contorno de fora (de cima p/ baixo) e de dentro (de baixo p/ cima) do braço do lado direito da tela."""
    k = t["ka"]
    ac = t["peito"] + 19.5 * k + 5                                   # braço encostado no peito, sem invadir
    precisa = max(t["cintura"] + t["barriga"] + 14, t["quadril"] + 20)  # mão passa ao lado do quadril/barriga
    inc = max(-0.02, (precisa + 22 - ac) / 174)
    cx = lambda y: ac + (y - 300) * inc
    fora = [(cx(y) + r * t["ka"], y) for y, r in BRACO[1:]]
    dentro = [(cx(y) - r * t["ka"], y) for y, r in BRACO[2:]][::-1]
    return fora, dentro, cx

def corpo_pts(t):
    fora, dentro, cx = braco(t)
    rw = BRACO[-1][1] * t["ka"]; hx = cx(474)
    mao = [(hx + rw + 2, 494), (hx + rw + 1, 516), (hx + 8, 534), (hx - 3, 541), (hx - 12, 535), (hx - 16, 520),
           (hx - 22, 506), (hx - 20, 494), (hx - rw, 478)]
    axila = cx(300) - 19.5 * t["ka"] - 3
    tronco = [(axila, 300), (t["peito"], 334), (t["cintura"], 430), (t["quadril"], 485), (t["quadril"] + 8, 540)]
    lc, kl = t["lc"], t["kl"]
    perna_fora = [(lc + 44 * kl, 610), (lc + 34 * kl, 668), (lc + 32 * kl, 698), (43 + 32 * kl, 736), (43 + 27 * kl, 784), (64, 848)]
    pe = [(78, 880), (68, 896), (20, 898), (16, 870)]
    perna_dentro = [(22, 848), (43 - 25 * kl, 784), (43 - 29 * kl, 736), (lc - 30 * kl, 698), (lc - 32 * kl, 682), (max(6, lc - 40 * kl), 610), (4, 560)]
    ombro = [(32, 170), (34, 206), (70, 216), ((70 + cx(244)) / 2, 226), (cx(244), 242)]
    return ombro + fora + mao + dentro + tronco + perna_fora + pe + perna_dentro + [(0, 548)]

def roupa_pts(t):
    fora, dentro, cx = braco(t)
    k = t["ka"]
    manga_fora = [(cx(266) + 16 * k + 3, 268), (cx(300) + 19.5 * k + 3, 300), (cx(322) + 19.5 * k + 3, 324)]
    manga_dentro = (cx(334) - 19.5 * k - 3, 334)
    axila = cx(300) - 19.5 * k - 3
    b = t["barriga"]
    camisa = [(0, 214), (30, 204), (44, 206), (80, 216), ((80 + cx(244)) / 2 + 4, 226), (cx(244) + 6, 242)] + manga_fora + [
        manga_dentro, (axila + 2, 318), (t["peito"] + 6, 350), (t["cintura"] + 10 + b, 430), (t["quadril"] + 8 + b * 0.5, 478),
        (t["quadril"] + 10, 494), (0, 498)]
    lc, kl = t["lc"], t["kl"]
    calcao = [(0, 474), (t["quadril"] + 10, 472), (t["quadril"] + 15, 520), (lc + 44 * kl + 10, 604), (lc + 44 * kl + 6, 620),
              (8, 620), (6, 574), (0, 564)]
    meiao = [(lc + 32 * kl + 2, 704), (43 + 32 * kl + 2, 736), (43 + 27 * kl + 2, 784), (66, 850),
             (20, 850), (43 - 25 * kl - 2, 784), (43 - 29 * kl - 2, 736), (lc - 30 * kl - 2, 704)]
    bainha_manga = (manga_dentro, manga_fora[-1])
    bainha_calcao = ((8, 616), (lc + 44 * kl + 6, 616))
    return camisa, calcao, meiao, bainha_manga, bainha_calcao

gola = cr(espelho([(0, 230), (20, 224), (34, 212), (44, 206), (38, 202), (24, 214), (0, 220)]), fechado=True)

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
def faixa(pts, dx):
    """Faixa colada a um contorno: o contorno e ele mesmo deslocado dx para dentro."""
    return cr(pts + [(x - dx, y) for x, y in reversed(pts)], True)

def sombras(t):
    fora, dentro, cx = braco(t)
    lc, kl = t["lc"], t["kl"]
    perna = [(lc + 44 * kl, 618), (lc + 34 * kl, 668), (lc + 32 * kl, 698)]
    pele = [
        faixa([(CX + x, y) for x, y in fora[2:]], 11 * t["ka"]),                    # braço da direita, lado de fora
        faixa([(CX - x, y) for x, y in reversed(dentro[:-1])], -6),                   # braço da esquerda, lado de dentro
        faixa([(CX + x, y) for x, y in perna], 12 * kl),                               # coxa/joelho
        faixa([(CX - (lc - 40 * kl), 618), (CX - (lc - 30 * kl), 698)], -8),
    ]
    camisa = [
        cr([(CX + 40, 240), (CX + 98, 250), (CX + t["peito"] - 2, 320), (CX + t["cintura"], 430), (CX + t["quadril"], 492),
            (CX + t["quadril"] - 34, 492), (CX + t["cintura"] - 24, 380), (CX + 54, 300)], True),
        cr([(CX + cx(266), 262), (CX + cx(300) + 30 * t["ka"], 300), (CX + cx(320) + 28 * t["ka"], 326), (CX + cx(320) + 2, 328)], True),
        cr([(CX - 60, 446), (CX - 20, 462), (CX + 10, 456), (CX - 10, 480), (CX - 60, 474)], True),
    ]
    return pele, camisa

reflexos_camisa = [
    cr([(CX - 116, 258), (CX - 94, 246), (CX - 70, 262), (CX - 90, 280), (CX - 112, 290)], True),
    cr([(CX - 66, 300), (CX - 22, 292), (CX - 30, 360), (CX - 70, 380)], True),
]

def tatuagem(t):
    """Tatuagem no antebraço esquerdo do jogador (lado direito da tela): rosa + linhas."""
    _, _, cx = braco(t)
    x, y = CX + cx(424) + 2, 424
    return (f'<g transform="translate({x:.1f},{y})" fill="none" stroke="#2b1d3a" stroke-width="1.6" stroke-linecap="round" opacity=".78">'
            '<path d="M0,-12 C7,-12 9,-4 4,0 C0,3 -6,1 -6,-4 C-6,-9 2,-9 2,-4"/>'
            '<path d="M-9,-8 C-12,0 -6,8 2,7 C9,6 12,-2 9,-10"/>'
            '<path d="M-3,8 C-4,18 -3,30 -1,42"/><path d="M-2,18 C-8,16 -11,20 -12,24 C-6,25 -3,22 -2,18"/>'
            '<path d="M-1,30 C5,27 9,30 10,34 C4,35 0,33 -1,30"/>'
            '<path d="M-10,-26 L10,-26 M-11,-31 L11,-31" stroke-width="1.2"/></g>')

KIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "arte", "fontes", "rosto-masc.svg")
BBOX = os.environ.get("KIT_BBOX", os.path.join(os.path.dirname(KIT), "rosto-masc-bbox.csv"))

def preparar_cabeca(pref="c", **aparencia):
    """Cabeça montada por peças (pecas.py), com o pescoço do kit cortado no queixo, no eixo do corpo."""
    g, queixo = cabeca(KIT, BBOX, pref=pref, recorte=True, **aparencia)
    s = 0.088
    vx, vy, vw, vh = 3000, 300, 3600, 3000
    x = CX - (4806.6 - vx) * s; y = 188 - (queixo - 12 - vy) * s
    return (f'<svg x="{x:.1f}" y="{y:.1f}" width="{vw * s:.1f}" height="{vh * s:.1f}" viewBox="{vx} {vy} {vw} {vh}" overflow="visible">'
            f'{g}</svg>')

def corpo_svg(tipo, k="", cor="#c8102e", cor2="#8a0a1f", calc="#ffffff", calc2="#c9ccd6", marca="Umbrella", tatu=True, numero="10", tom="padrão", **aparencia):
    """Devolve (defs, desenho) do corpo vestido. k: sufixo dos ids (vários corpos no mesmo svg)."""
    t = TIPOS[tipo]
    corpo = cr(espelho([(0, 170)] + corpo_pts(t)), fechado=True)
    cam_p, calc_p, meiao_p, b_manga, b_calcao = roupa_pts(t)
    camisa = cr(espelho(cam_p), fechado=True)
    calcao = cr(espelho(calc_p), fechado=True)
    meiao_d, meiao_e = (cr(p, True) for p in lado(meiao_p))
    sp, sc = sombras(t)
    grad_chut, pe = chuteira(marca, "chut" + k)
    _, _, cx = braco(t)
    lc, kl = t["lc"], t["kl"]
    (mx0, my0), (mx1, my1) = b_manga
    (hx0, hy0), (hx1, hy1) = b_calcao
    defs = f'''<linearGradient id="pele{k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc8b0"/><stop offset=".45" stop-color="#f7ab8a"/><stop offset="1" stop-color="#ee9070"/></linearGradient>
  <linearGradient id="camisa{k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{cor}"/><stop offset="1" stop-color="{cor2}"/></linearGradient>
  <linearGradient id="calcao{k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{calc}"/><stop offset="1" stop-color="{calc2}"/></linearGradient>
  {grad_chut}
  <linearGradient id="pescoco{k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8714d"/><stop offset=".5" stop-color="#ef9372"/><stop offset="1" stop-color="#f6a989"/></linearGradient>
  <clipPath id="clipCorpo{k}"><path d="{corpo}"/></clipPath>
  <clipPath id="clipCamisa{k}"><path d="{camisa}"/></clipPath>
  <clipPath id="clipCalcao{k}"><path d="{calcao}"/></clipPath>
  <clipPath id="clipMeiao{k}"><path d="{meiao_d}"/><path d="{meiao_e}"/></clipPath>'''
    cotovelo = lambda sx: f'M{CX + sx * (cx(388) + 10 * t["ka"]):.1f},386 C{CX + sx * (cx(388) + 4):.1f},391 {CX + sx * (cx(388) - 4):.1f},391 {CX + sx * (cx(388) - 9 * t["ka"]):.1f},387'
    joelho = lambda sx: f'M{CX + sx * (lc + 14 * kl):.1f},688 C{CX + sx * (lc + 6):.1f},695 {CX + sx * (lc - 6):.1f},695 {CX + sx * (lc - 14 * kl):.1f},688'
    desenho = f'''<path d="{corpo}" fill="url(#pele{k})"/>
<path d="M{CX-33},176 L{CX+33},176 L{CX+34},214 L{CX-34},214 Z" fill="url(#pescoco{k})"/>
<g clip-path="url(#clipCorpo{k})" fill="#e8714d" opacity=".42">{''.join(f'<path d="{d}"/>' for d in sp)}</g>
{f'<g clip-path="url(#clipCorpo{k})">{tatuagem(t)}</g>' if tatu else ''}
<g fill="none" stroke="#d9714f" stroke-opacity=".5" stroke-width="1.1" clip-path="url(#clipCorpo{k})">
  <path d="{cotovelo(1)}"/><path d="{cotovelo(-1)}"/><path d="{joelho(1)}"/><path d="{joelho(-1)}"/></g>
<g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".7" clip-path="url(#clipCorpo{k})">
  <path d="M{CX - cx(340) - 14 * t["ka"]:.1f},336 C{CX - cx(350) - 15 * t["ka"]:.1f},352 {CX - cx(366) - 12 * t["ka"]:.1f},366 {CX - cx(378) - 10 * t["ka"]:.1f},378"/>
  <path d="M{CX - (lc + 20 * kl):.1f},630 C{CX - (lc + 22 * kl):.1f},650 {CX - (lc + 21 * kl):.1f},664 {CX - (lc + 19 * kl):.1f},672"/></g>
<path d="{meiao_d}" fill="url(#camisa{k})"/><path d="{meiao_e}" fill="url(#camisa{k})"/>
<g clip-path="url(#clipMeiao{k})">
  <g fill="none" stroke="#fff" stroke-width="5" opacity=".92"><path d="M{CX+4},716 C{CX+40},721 {CX+80},721 {CX+110},714"/><path d="M{CX-4},716 C{CX-40},721 {CX-80},721 {CX-110},714"/></g>
  <path d="{faixa([(CX + x, y) for x, y in meiao_p[:4]], 9 * kl)}" fill="#000" opacity=".16"/>
  <path d="M{CX - 43 + 6},744 C{CX - 43 + 8},774 {CX - 43 + 6},804 {CX - 43 + 4},834" stroke="#fff" stroke-opacity=".22" stroke-width="1.6" fill="none"/>
</g>
<g transform="translate({CX+43},848)">{pe}</g>
<g transform="translate({CX-43},848) scale(-1,1)">{pe}</g>
<path d="{calcao}" fill="url(#calcao{k})"/>
<g clip-path="url(#clipCalcao{k})">
  <path d="{faixa([(CX + x, y) for x, y in calc_p[1:5]], 12)}" fill="#000" opacity=".09"/>
  <path d="M{CX},562 L{CX},620" stroke="{calc2}" stroke-width="1.2"/>
  <g fill="none" stroke="{cor}" stroke-width="4.5"><path d="M{CX + hx0},{hy0} C{CX + hx0 + 30},{hy0 + 3} {CX + hx1 - 20},{hy1 + 1} {CX + hx1 + 6},{hy1 - 4}"/>
  <path d="M{CX - hx0},{hy0} C{CX - hx0 - 30},{hy0 + 3} {CX - hx1 + 20},{hy1 + 1} {CX - hx1 - 6},{hy1 - 4}"/></g>
</g>
<path d="{camisa}" fill="url(#camisa{k})"/>
<g clip-path="url(#clipCamisa{k})">
  <g fill="#000" opacity=".16">{''.join(f'<path d="{d}"/>' for d in sc)}</g>
  <g fill="#fff" opacity=".12">{''.join(f'<path d="{d}"/>' for d in reflexos_camisa)}</g>
  <g fill="none" stroke="#fff" stroke-width="7" opacity=".92">
    <path d="M{CX + mx0 - 2:.1f},{my0 + 3} L{CX + mx1 + 4:.1f},{my1 + 1}"/><path d="M{CX - mx0 + 2:.1f},{my0 + 3} L{CX - mx1 - 4:.1f},{my1 + 1}"/></g>
  <g stroke="#fff" stroke-opacity=".28" stroke-width=".7" fill="none">
    <path d="M{CX - t["peito"]:.1f},262 C{CX - t["peito"] + 2:.1f},310 {CX - t["peito"] + 6:.1f},370 {CX - t["cintura"]:.1f},430"/><path d="M{CX+20},300 C{CX+26},360 {CX+30},420 {CX+30},470"/></g>
</g>
<path d="{gola}" fill="#fff"/>
<text x="{CX - t["peito"] * 0.62:.1f}" y="300" font-family="Arial Black, Arial" font-weight="900" font-size="20" fill="#fff" opacity=".95">{numero}</text>
{preparar_cabeca(pref="h" + k + "_", tom=tom, **aparencia)}'''
    defs = re.sub(r'<linearGradient id="(pele|pescoco)' + k + r'".*?</linearGradient>', lambda m: recolorir(m.group(0), tom), defs, flags=re.S)
    desenho = P(desenho, tom)
    return defs, desenho

def P(desenho, tom):
    """Recolore só as cores de pele do corpo (sombras e vincos), sem tocar no uniforme."""
    for c in ("#e8714d", "#d9714f"):
        desenho = desenho.replace(f'"{c}"', f'"{recolorir(c, tom)}"')
    return desenho

def montar(cabeca_svg, saida, tipo="atlético", **kw):
    defs, desenho = corpo_svg(tipo, **kw)
    open(saida, "w").write(f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="130 40 340 870" width="680" height="1740">
<defs>{defs}</defs>{desenho}</svg>''')

def fila(cabeca_svg, saida, **kw):
    """Os 7 tipos de corpo lado a lado, do mais magro ao mais pesado."""
    ordem = [
        ("esguio", dict(rosto="rosto 3", cabelo="cabelo 3", cor_cabelo="ruivo", tom="claro", olhos="2", sobr="2", numero="7")),
        ("magro", dict(rosto="rosto 1", cabelo="cabelo 1", cor_cabelo="loiro", tom="padrão", olhos="3", boca="3", numero="11")),
        ("atlético", dict(cabelo="molde", cor_cabelo="preto", tom="moreno", tatu=True, numero="10")),
        ("forte", dict(rosto="rosto 2", cabelo="cabelo 2", cor_cabelo="preto", tom="negro", olhos="4", boca="2", tatu=True, numero="9")),
        ("troncudo", dict(rosto="rosto 4", cabelo="cabelo 4", cor_cabelo="castanho", tom="pardo", olhos="5", nariz="5", numero="5")),
    ]
    partes, todos = [], []
    for i, (tp, ap) in enumerate(ordem):
        ap = {"tatu": False, **ap, **kw}
        d, g = corpo_svg(tp, k=str(i), **ap); todos.append(d)
        partes.append(f'<g transform="translate({i * 360},0)">{g}<text x="{CX}" y="935" font-family="Arial" font-size="22" text-anchor="middle" fill="#333">{tp}</text></g>')
    w = 360 * len(ordem)
    open(saida, "w").write(f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="120 30 {w + 20} 920" width="{w + 20}" height="920">
<rect x="120" y="30" width="{w + 20}" height="920" fill="#fff"/><defs>{"".join(todos)}</defs>{"".join(partes)}</svg>''')

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
    elif sys.argv[1] == "--fila": fila(sys.argv[2], sys.argv[3])
    else: montar(sys.argv[1], sys.argv[2], tipo=sys.argv[3] if len(sys.argv) > 3 else "atlético")
