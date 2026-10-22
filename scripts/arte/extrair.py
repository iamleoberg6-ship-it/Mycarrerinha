"""Extrai peças de um kit SVG (convertido do Adobe Stock) por região.
uso: python3 extrair.py kit.svg bboxes.csv saida.svg x0 y0 x1 y1 [--excluir id,id] [--so-centro]
Mantém os filhos diretos do grupo de desenho cujo centro cai na região."""
import sys, csv, copy, xml.etree.ElementTree as ET
NS = "http://www.w3.org/2000/svg"; ET.register_namespace("", NS); ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
kit, csvp, out = sys.argv[1:4]; x0, y0, x1, y1 = map(float, sys.argv[4:8])
excl = set(); 
if "--excluir" in sys.argv: excl = set(sys.argv[sys.argv.index("--excluir") + 1].split(","))
bb = {r[0]: tuple(map(float, r[1:5])) for r in csv.reader(open(csvp)) if len(r) == 5}
t = ET.parse(kit); r = t.getroot()
g10 = r.find(f".//{{{NS}}}g[@id='g10']")
keep = []; ux0 = uy0 = 1e9; ux1 = uy1 = -1e9
for e in list(g10):
    i = e.get("id"); b = bb.get(i)
    if not b or i in excl: g10.remove(e); continue
    x, y, w, h = b; cx, cy = x + w / 2, y + h / 2
    if w > 5000 or not (x0 <= cx <= x1 and y0 <= cy <= y1): g10.remove(e); continue
    keep.append(i); ux0, uy0, ux1, uy1 = min(ux0, x), min(uy0, y), max(ux1, x + w), max(uy1, y + h)
r.set("viewBox", f"{ux0:.1f} {uy0:.1f} {ux1-ux0:.1f} {uy1-uy0:.1f}"); r.set("width", f"{ux1-ux0:.0f}"); r.set("height", f"{uy1-uy0:.0f}")
t.write(out)
print(len(keep), "peças; viewBox", r.get("viewBox"))
