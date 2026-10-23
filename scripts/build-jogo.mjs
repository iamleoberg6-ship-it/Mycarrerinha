// Gera dist/jogo/: o jogo completo em três páginas que dividem o mesmo save (index = semana, criacao, casa).
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

async function pagina(entrada, template, saida, carreira) {
  const r = await build({ entryPoints: [entrada], bundle: true, format: "iife", minify: true, write: false, target: "es2020", define: { __CARREIRA__: String(carreira) } });
  const js = r.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  const html = readFileSync(template, "utf8").replace("/*__SCRIPT__*/", () => js);
  writeFileSync(saida, html);
  console.log(`${saida} (${(html.length / 1024).toFixed(1)} KB)`);
}
// clubes do coração da criação: só nome, apelido, cores e padrão das primeiras divisões (sem os elencos do mundo)
{
  const m = JSON.parse(readFileSync("data/mundo-2026.json", "utf8"));
  const ligas = ["ARG1", "ESP1", "NED1", "GER1", "ITA1", "ENG1", "FRA1"];
  const out = Object.fromEntries(m.ligas.filter((l) => ligas.includes(l.id)).map((l) => [l.id, l.clubes.map((c) => ({ id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, padrao: c.padrao, forca: c.forca })).sort((a, b) => b.forca - a.forca)]));
  // Uruguai (liga nova): os clubes da paródia, com os ex-convidados das copas
  const extra = JSON.parse(readFileSync("data/ligas-extra.json", "utf8")).ligas.URU1, conv = { "UY-PEN": ["CA Peñarolo", "Carboneros", ["#F5C400", "#111111"], "listrasV", 70], "UY-NAC": ["Nacional de Montevidéu", "Bolsilludos", ["#FFFFFF", "#0B2F7A"], "lisa", 70], "UY-LIV": ["Liverpul Montevideano", "Negriazul", ["#111111", "#1C4FA1"], "listrasV", 66] };
  out.URU1 = extra.map((c) => c.convidado ? { id: c.convidado, nome: conv[c.convidado][0], apelido: conv[c.convidado][1], cores: conv[c.convidado][2], padrao: conv[c.convidado][3], forca: conv[c.convidado][4] } : { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, padrao: c.padrao, forca: c.forca }).sort((a, b) => b.forca - a.forca);
  writeFileSync("app/criacao/clubes-coracao.json", JSON.stringify(out));
}
mkdirSync("dist/jogo", { recursive: true });
await pagina("app/jogo/main.ts", "app/jogo/template.html", "dist/jogo/index.html", true);
await pagina("app/criacao/main.ts", "app/criacao/template.html", "dist/jogo/criacao.html", true);
await pagina("app/casa/main.ts", "app/casa/template.html", "dist/jogo/casa.html", true);
