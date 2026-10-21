// Gera dist/criacao.html: a tela de criação com o motor embutido num único arquivo.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const r = await build({
  entryPoints: ["app/criacao/main.ts"], bundle: true, format: "iife", minify: true, write: false, target: "es2020",
});
const js = r.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = readFileSync("app/criacao/template.html", "utf8").replace("/*__SCRIPT__*/", () => js);
mkdirSync("dist", { recursive: true });
writeFileSync("dist/criacao.html", html);
console.log(`dist/criacao.html (${(html.length / 1024).toFixed(1)} KB)`);
