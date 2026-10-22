"""Peças do kit "Man Face Constructor" (Adobe Stock 622079498) separadas e alinhadas na cabeça central.

Tudo fica no sistema de coordenadas do documento convertido (px do rosto-masc.svg).
A cabeça central é o molde: os rostos/cabelos da direita são escalados para o rosto dela e as
feições da esquerda (olhos, sobrancelhas, nariz, boca) são centralizadas nas posições dela.
"""
import csv, re, colorsys, xml.etree.ElementTree as ET
from functools import lru_cache

NS = "http://www.w3.org/2000/svg"; XL = "http://www.w3.org/1999/xlink"
ET.register_namespace("", NS); ET.register_namespace("xlink", XL)
Q = lambda t: f"{{{NS}}}{t}"
TRANSF = "matrix(1.3333333,0,0,-1.3333333,0,3200) scale(0.1)"  # g8 ∘ g10 do arquivo convertido


class Kit:
    def __init__(self, svg, bboxes):
        self.raiz = ET.parse(svg).getroot()
        self.defs = {e.get("id"): e for e in self.raiz.find(Q("defs"))}
        g10 = self.raiz.find(f".//{Q('g')}[@id='g10']")
        bb = {r[0]: tuple(map(float, r[1:5])) for r in csv.reader(open(bboxes)) if len(r) == 5}
        self.el = [e for e in g10 if bb.get(e.get("id"), (0, 0, 9999, 0))[2] < 5000]
        self.bb = [bb[e.get("id")] for e in self.el]
        self.idx = {e.get("id"): i for i, e in enumerate(self.el)}

    def cores(self, i):
        """Cores (hex) usadas por um elemento, incluindo gradientes referenciados."""
        txt = ET.tostring(self.el[i], encoding="unicode") + "".join(
            ET.tostring(self.defs[r], encoding="unicode") for r in self.refs([i]))
        return re.findall(r"#[0-9a-fA-F]{6}\b", txt)

    def eh_pele(self, i):
        cs = [colorsys.rgb_to_hls(*_hex(c)) for c in self.cores(i)]
        return bool(cs) and sum(_ehpele(*c) for c in cs) >= len(cs) / 2

    def faixa(self, a, b):
        return list(range(self.idx[a], self.idx[b] + 1))

    def caixa(self, ids):
        xs = [self.bb[i] for i in ids]
        x0 = min(b[0] for b in xs); y0 = min(b[1] for b in xs)
        return x0, y0, max(b[0] + b[2] for b in xs) - x0, max(b[1] + b[3] for b in xs) - y0

    def refs(self, ids):
        """Ids de defs (gradientes, recortes) usados por esses elementos, recursivamente."""
        vistos, fila = set(), []
        def pega(e):
            for x in e.iter():
                for v in (x.get("style", ""), x.get("clip-path", ""), x.get("mask", ""), x.get("fill", "")):
                    fila.extend(re.findall(r"url\(#([\w.-]+)\)", v))
                h = x.get(f"{{{XL}}}href") or x.get("href")
                if h and h.startswith("#"): fila.append(h[1:])
        for i in ids: pega(self.el[i])
        while fila:
            r = fila.pop()
            if r in vistos or r not in self.defs: continue
            vistos.add(r); pega(self.defs[r])
        return vistos

    def ref_pele(self, ids):
        """Claro e escuro da pele de um conjunto (para normalizar rostos de outros tons)."""
        cs = sorted({c for i in ids for c in self.cores(i)}, key=lambda c: colorsys.rgb_to_hls(*_hex(c))[1])
        cs = [c for c in cs if _ehpele(*colorsys.rgb_to_hls(*_hex(c)))]
        if len(cs) < 2: return None
        ls = [colorsys.rgb_to_hls(*_hex(c))[1] for c in cs]
        # percentis 15/85 para fugir de brilhos e sombras extremas
        return cs[int(len(cs) * 0.85)], cs[int(len(cs) * 0.15)]

    def forro(self, i):
        """Cópia do elemento em que cada forma recortada vira a própria silhueta, cor sólida média e contorno
        grosso. Vai por baixo e tapa as frestas de antialiasing entre facetas vizinhas."""
        import copy
        cs = sorted(self.cores(i), key=lambda c: colorsys.rgb_to_hls(*_hex(c))[1])
        if not cs: return ""
        meio = cs[len(cs) // 2]
        e = copy.deepcopy(self.el[i])
        for pai in list(e.iter()):
            for g in list(pai):
                m = re.match(r"url\(#([\w.-]+)\)", g.get("clip-path", ""))
                if not m or m.group(1) not in self.defs: continue
                novo = ET.Element(Q("g"))
                if g.get("transform"): novo.set("transform", g.get("transform"))
                for cp in self.defs[m.group(1)]:
                    c = copy.deepcopy(cp)
                    c.set("style", f"fill:{meio};stroke:{meio};stroke-width:14;stroke-linejoin:round")
                    if c.get("d"):  # só o contorno de fora: os furos (onde iam boca/nariz do molde) ficam preenchidos
                        sub = re.search(r"(?<=.)[mM]", c.get("d"))
                        if sub: c.set("d", c.get("d")[:sub.start()])
                    novo.append(c)
                pai.insert(list(pai).index(g), novo); pai.remove(g)
        for x in e.iter():  # tira formas soltas que não eram recortes (já estão no desenho de cima)
            if x.tag == Q("image"): x.set("visibility", "hidden")
        return ET.tostring(e, encoding="unicode")

    def tem_imagem(self, i):
        return any(x.tag == Q("image") for x in self.el[i].iter())

    def peca(self, ids, T="", cores=None, pref="", ref=None, costura=False):
        """<g> com os elementos, na posição T (transform extra em px do documento).
        costura: contorna cada forma com a própria cor, fechando as frestas claras entre as facetas."""
        corpo = "".join(ET.tostring(self.el[i], encoding="unicode") for i in ids)
        if costura: corpo = "".join(self.forro(i) for i in ids) + corpo
        d = "".join(ET.tostring(self.defs[r], encoding="unicode") for r in sorted(self.refs(ids)))
        x = f'<defs>{d}</defs><g transform="{T}"><g transform="{TRANSF}">{corpo}</g></g>'
        x = re.sub(r'\s(id|inkscape:\w+)="[^"]*"', lambda m: m.group(0) if m.group(1) == "id" else "", x)
        if pref:  # ids únicos por peça (várias peças no mesmo svg)
            x = re.sub(r'id="([\w.-]+)"', rf'id="{pref}\1"', x)
            x = re.sub(r'url\(#([\w.-]+)\)', rf'url(#{pref}\1)', x)
            x = re.sub(r'href="#([\w.-]+)"', rf'href="#{pref}\1"', x)
        if cores: x = recolorir(x, cores, ref)
        return x


# ---------------- tons de pele ----------------
def _hex(c): return tuple(int(c[i:i + 2], 16) / 255 for i in (1, 3, 5))
def _cor(r, g, b): return "#%02x%02x%02x" % tuple(max(0, min(255, round(v * 255))) for v in (r, g, b))

# referência = tom do molde; cada tom diz para onde vão o claro e o escuro da pele
TONS = {
    "claro":       ("#ffd9c6", "#ee8e6c"),
    "padrão":      ("#ffc8b0", "#e8714d"),
    "bronzeado":   ("#f2b48c", "#c8653e"),
    "moreno":      ("#d99a6c", "#a4532c"),
    "pardo":       ("#b97a50", "#7e3f1f"),
    "negro":       ("#8d5638", "#4e2312"),
    "negro escuro": ("#6a3d27", "#33150a"),
}
_REF = TONS["padrão"]

def _ehpele(h, l, s):
    # laranjas/rosados quentes do molde (pele, sombras da pele); deixa brancos, roxos, pretos, verdes
    return (h < 0.11 or h > 0.96) and s > 0.25 and 0.25 < l < 0.97

def recolorir(x, tom, ref=None):
    """Leva as cores de pele para o tom pedido (interpola no claro→escuro da pele).
    ref: (claro, escuro) da pele original da peça; padrão = o molde."""
    ref = ref or _REF
    if tom == "padrão" and ref == _REF: return x
    c0, c1 = (_hex(c) for c in TONS[tom]); r0, r1 = (_hex(c) for c in ref)
    l_r0 = colorsys.rgb_to_hls(*r0)[1]; l_r1 = colorsys.rgb_to_hls(*r1)[1]
    def troca(m):
        rgb = _hex(m.group(0)); h, l, s = colorsys.rgb_to_hls(*rgb)
        if not _ehpele(h, l, s): return m.group(0)
        t = max(-0.06, min(1.4, (l_r0 - l) / (l_r0 - l_r1)))  # 0 = claro do molde, 1 = escuro
        alvo = [a + (b - a) * t for a, b in zip(c0, c1)]
        # mantém o desvio de matiz/saturação (lábios mais rosados, sombras mais vermelhas)
        base = [a + (b - a) * t for a, b in zip(r0, r1)]
        return _cor(*[al + (v - bs) * 0.6 for al, v, bs in zip(alvo, rgb, base)])
    return re.sub(r"#[0-9a-fA-F]{6}\b", troca, x)


# ---------------- cores de cabelo ----------------
CORES_CABELO = {  # (escuro, claro)
    "preto":           ("#0d0a0c", "#3a2f36"),
    "castanho escuro": ("#1f120c", "#5a3522"),
    "castanho":        ("#3a2214", "#94603b"),
    "castanho claro":  ("#5e3a1e", "#c48a55"),
    "loiro":           ("#8c6420", "#ffe39a"),
    "loiro platinado": ("#b9ad98", "#fffaf0"),
    "ruivo":           ("#7a2410", "#f2874a"),
    "grisalho":        ("#55555a", "#dcdce0"),
    "azul":            ("#0b1f5c", "#4f8cff"),
    "rosa":            ("#7a1240", "#ff7ab8"),
}

def recolorir_cabelo(x, cor, ref):
    """Leva todas as cores da peça (escuro→claro de ref) para o escuro→claro da cor pedida."""
    if not cor or cor == "original": return x
    d0, d1 = (_hex(c) for c in CORES_CABELO[cor])
    l0 = colorsys.rgb_to_hls(*_hex(ref[0]))[1]; l1 = colorsys.rgb_to_hls(*_hex(ref[1]))[1]
    def troca(m):
        h, l, sat = colorsys.rgb_to_hls(*_hex(m.group(0)))
        if l > 0.985: return m.group(0)  # só o branco puro fica
        t = max(0.0, min(1.0, (l - l0) / max(0.05, l1 - l0)))
        return _cor(*[a + (b - a) * t for a, b in zip(d0, d1)])
    x = re.sub(r"#[0-9a-fA-F]{6}\b", troca, x)
    if "<image" in x:  # texturas em imagem: pinta pela luminância (escuro→claro da cor pedida)
        fid = "f" + re.sub(r"\W", "", cor) + str(abs(hash(x)) % 10**6)
        tab = lambda i: f"{d0[i]:.3f} {d1[i]:.3f}"
        filtro = (f'<filter id="{fid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="'
                  f'.3 .59 .11 0 0 .3 .59 .11 0 0 .3 .59 .11 0 0 0 0 0 1 0"/><feComponentTransfer>'
                  f'<feFuncR type="table" tableValues="{tab(0)}"/><feFuncG type="table" tableValues="{tab(1)}"/>'
                  f'<feFuncB type="table" tableValues="{tab(2)}"/></feComponentTransfer></filter>')
        x = x.replace("<defs>", f"<defs>{filtro}", 1).replace("<image ", f'<image filter="url(#{fid})" ')
    return x


# ---------------- catálogo de peças ----------------
@lru_cache(None)
def catalogo(svg, bboxes):
    k = Kit(svg, bboxes)
    F = k.faixa
    C = {
        "base": F("g6282", "g6534"),            # pescoço, orelhas, rosto (sem o peito do kit)
        "cabelo": F("g6676", "path6802"),
        "olho_e": F("path6804", "path6900"), "olho_d": F("path6902", "path6998"),
        "sobr_e": F("g7000", "g7052"), "sobr_d": F("g7068", "g7120"),
        "boca": F("g7136", "g7198"), "nariz": F("g7216", "path7334"),
    }
    rosto_c = k.caixa(F("g6406", "g6406"))
    centro = {p: k.caixa(C[p]) for p in ("olho_e", "olho_d", "sobr_e", "sobr_d", "boca", "nariz")}

    # rostos sem feição da direita: (início cabeça, fim cabeça, início cabelo, fim cabelo, cabelo de trás)
    CELULAS = [("g2340", "g2598", "g4578", "g4830", None), ("g2616", "g3070", "path4846", "g5148", None),
               ("g3088", "g3372", "g5160", "g5466", ("g2256", "g2324")), ("g3390", "g3854", "g5720", "g6250", None),
               ("g3872", "g4464", "g5502", "g5708", None), ("path4482", "g4560", "path5482", "path5500", None)]
    rostos = {"molde": dict(ids=C["base"], T="", queixo=rosto_c[1] + rosto_c[3])}
    cabelos = {"molde": dict(ids=C["cabelo"], T="", tras=None)}
    for n, (a, b, ca, cb, tras) in enumerate(CELULAS, 1):
        cab = F(a, b)
        # rosto = maior elemento de pele perto do centro da cabeça
        cx0, cy0, cw, ch = k.caixa(cab)
        cand = [i for i in cab if k.bb[i][3] > k.bb[i][2] * 0.9 and k.bb[i][2] > cw * 0.35]
        face = max(cand, key=lambda i: k.bb[i][2] * k.bb[i][3])
        fx, fy, fw, fh = k.bb[face]
        s = rosto_c[2] / fw
        T = f"translate({rosto_c[0] + rosto_c[2] / 2:.1f},{rosto_c[1]:.1f}) scale({s:.4f}) translate({-(fx + fw / 2):.1f},{-fy:.1f})"
        fundo = fy + fh
        so_cabeca = [i for i in cab if k.bb[i][1] + k.bb[i][3] / 2 < fundo + fh * 0.12]  # sem camiseta/peito
        couro = [i for i in so_cabeca if not k.eh_pele(i) and k.bb[i][1] + k.bb[i][3] / 2 < fy + fh * 0.45]
        pele = [i for i in so_cabeca if i not in couro]
        rostos[f"rosto {n}"] = dict(ids=pele, T=T, queixo=rosto_c[1] + fh * s, ref=k.ref_pele(pele))
        cabelos[f"cabelo {n}"] = dict(ids=couro + F(ca, cb), T=T, tras=(F(*tras) if tras else None))

    # feições da esquerda: grade 6 linhas
    LINHAS = [1213, 1530, 1853, 2170, 2487, 2800]
    COLS = {"nariz": (0, 800), "boca": (800, 1800), "sobr_e": (1800, 2290), "sobr_d": (2290, 2800),
            "olho_e": (2800, 3310), "olho_d": (3310, 3800)}
    feicoes = {p: {"molde": dict(ids=C[p], T="")} for p in COLS}
    for p, (x0, x1) in COLS.items():
        for li, ly in enumerate(LINHAS):
            ids = [i for i in range(len(k.el)) if x0 <= k.bb[i][0] + k.bb[i][2] / 2 < x1 and abs(k.bb[i][1] + k.bb[i][3] / 2 - ly) < 150
                   and k.bb[i][2] < 900]
            if not ids: continue
            bx, by, bw, bh = k.caixa(ids)
            mx, my, mw, mh = centro[p]
            s = mw / bw if p.startswith(("olho", "sobr")) else min(1.3, mw / bw)
            T = f"translate({mx + mw / 2:.1f},{my + mh / 2:.1f}) scale({s:.4f}) translate({-(bx + bw / 2):.1f},{-(by + bh / 2):.1f})"
            feicoes[p][f"{li + 1}"] = dict(ids=ids, T=T)
    return k, rostos, cabelos, feicoes


def ref_cabelo(k, ids):
    cs = sorted({c for i in ids for c in k.cores(i)}, key=lambda c: colorsys.rgb_to_hls(*_hex(c))[1])
    cs = [c for c in cs if colorsys.rgb_to_hls(*_hex(c))[1] < 0.97]
    return cs[int(len(cs) * 0.08)], cs[int(len(cs) * 0.92)]

def cabeca(kit_svg, bboxes, rosto="molde", cabelo="molde", olhos="molde", sobr="molde", nariz="molde", boca="molde",
           tom="padrão", cor_cabelo="original", pref="c", recorte=False):
    """SVG (conteúdo, sem <svg>) da cabeça montada, no sistema do documento do kit."""
    k, R, CB, F = catalogo(kit_svg, bboxes)
    partes = []
    def add(spec, nome):
        partes.append(k.peca(spec["ids"], spec["T"], cores=tom, pref=f"{pref}{nome}_", ref=spec.get("ref"), costura=(nome in ("r", "nariz", "boca"))))
    cb = CB[cabelo]
    rc = ref_cabelo(k, cb["ids"] + (cb.get("tras") or []))
    if cb.get("tras"): partes.append(recolorir_cabelo(k.peca(cb["tras"], cb["T"], pref=f"{pref}tras_"), cor_cabelo, rc))
    # couro cabeludo dos outros rostos fica atrás do rosto (só aparece onde o cabelo não cobre a testa)
    # calota de pele atrás do rosto: cabelos com a linha do cabelo alta não deixam buraco na testa
    calota = (f'<defs><linearGradient id="{pref}calota" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd2bd"/>'
              f'<stop offset="1" stop-color="#ffc0a4"/></linearGradient></defs>'
              f'<ellipse cx="4818" cy="1470" rx="450" ry="330" fill="url(#{pref}calota)"/>')
    partes.append(recolorir(calota, tom))
    partes.append(recolorir(f'<defs><linearGradient id="{pref}miolo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7ab8a"/>'
                            f'<stop offset="1" stop-color="#ee9070"/></linearGradient></defs>'
                            f'<ellipse cx="4818" cy="1930" rx="370" ry="310" fill="url(#{pref}miolo)"/>', tom))
    add(R[rosto], "r")
    if recorte:  # corta pescoço/peito do kit logo abaixo do queixo (o pescoço do corpo continua)
        q = R[rosto]["queixo"] - 2417
        partes[-1] = (f'<defs><clipPath id="{pref}rec"><path d="M3000,300 H6600 V{2500 + q} H5176 L5176,{2540 + q} '
                      f'Q4806,{2660 + q} 4440,{2540 + q} L4440,{2500 + q} H3000 Z"/></clipPath></defs>'
                      f'<g clip-path="url(#{pref}rec)">{partes[-1]}</g>')
    for p, v in (("olho_e", olhos), ("olho_d", olhos), ("nariz", nariz), ("boca", boca)):
        add(F[p][v], p)
    for p in ("sobr_e", "sobr_d"):
        sp = F[p][sobr]
        partes.append(recolorir_cabelo(k.peca(sp["ids"], sp["T"], pref=f"{pref}{p}_"), cor_cabelo, ref_cabelo(k, sp["ids"])))
    partes.append(recolorir_cabelo(k.peca(cb["ids"], cb["T"], pref=f"{pref}cab_"), cor_cabelo, rc))
    return "".join(partes), R[rosto]["queixo"]
