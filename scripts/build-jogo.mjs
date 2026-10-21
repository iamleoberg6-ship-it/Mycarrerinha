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
mkdirSync("dist/jogo", { recursive: true });
await pagina("app/jogo/main.ts", "app/jogo/template.html", "dist/jogo/index.html", true);
await pagina("app/criacao/main.ts", "app/criacao/template.html", "dist/jogo/criacao.html", true);
await pagina("app/casa/main.ts", "app/casa/template.html", "dist/jogo/casa.html", true);
