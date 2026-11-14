// Cópia do save na conta Claude do jogador (armazenamento do artifact), além do navegador. Cada carreira fica na sua
// própria chave (criar outra não apaga a antiga). O save vai comprimido e dividido em partes (cada documento tem
// limite de tamanho). Tudo é opcional: fora do Claude, ou sem login, a nuvem simplesmente não existe e o jogo segue.
type Ref = { get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>; set(d: Record<string, unknown>): Promise<void> };
type Col = { doc(id: string): Ref; where(f: string, op: string, v: unknown): { get(): Promise<{ docs: { id: string; data(): Record<string, unknown> | undefined }[] }> } };
type Db = { collection(p: string): Col };
type User = { id(): Promise<string | null> };

const rt = () => (window as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
let conexao: Promise<{ col: Col } | null> | undefined;
function conectar(): Promise<{ col: Col } | null> {
  if (conexao) return conexao;
  const c = rt();
  if (!c?.use) return (conexao = Promise.resolve(null));
  const tentar = (async () => {
    const [db, user] = (await Promise.all([c.use("db"), c.use("user")])) as [Db | null, User | null];
    if (!db || !user) return null;
    const id = await user.id();
    return id ? { col: db.collection(`data/users/${id}`) } : null;
  })().catch(() => null);
  return (conexao = Promise.race([tentar, new Promise<null>((r) => setTimeout(() => r(null), 12000))]));
}
export const nuvemDisponivel = async () => !!(await conectar());

async function comprimir(txt: string): Promise<{ z: boolean; s: string }> {
  if (typeof CompressionStream === "undefined") return { z: false, s: txt };
  const buf = new Uint8Array(await new Response(new Blob([txt]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { z: true, s: btoa(bin) };
}
async function descomprimir(z: boolean, s: string): Promise<string> {
  if (!z) return s;
  const bin = atob(s), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
}

const PARTE = 180_000;
/** Chave de documento segura a partir de qualquer texto (a semente da carreira). */
export const chaveNuvem = (prefixo: string, semente: string) => {
  let h = 2166136261;
  for (const ch of semente) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `${prefixo}_${h.toString(36)}`;
};
export interface MetaNuvem { chave: string; quando: number; partes: number; z: boolean; rotulo: string; tipo: string; modo: string }

let fila: Promise<unknown> = Promise.resolve();
/** Envia o save (uma escrita por vez). Devolve true se gravou. */
export function salvarNaNuvem(chave: string, modo: string, json: string, rotulo: string): Promise<boolean> {
  const tarefa = fila.then(async () => {
    const c = await conectar();
    if (!c) return false;
    const { z, s } = await comprimir(json), partes = Math.max(1, Math.ceil(s.length / PARTE));
    for (let i = 0; i < partes; i++) await c.col.doc(`${chave}_p${i}`).set({ tipo: "parte", d: s.slice(i * PARTE, (i + 1) * PARTE) });
    const meta: MetaNuvem = { chave, quando: Date.now(), partes, z, rotulo, tipo: "meta", modo };
    await c.col.doc(chave).set({ ...meta });
    await c.col.doc(`ultimo_${modo}`).set({ tipo: "ponteiro", chave, quando: meta.quando });
    return true;
  }).catch(() => false);
  fila = tarefa;
  return tarefa;
}
/** Os saves guardados na conta (um por carreira), do mais novo ao mais velho. */
export async function listarNuvem(modo: string): Promise<MetaNuvem[]> {
  const c = await conectar();
  if (!c) return [];
  try {
    const r = await c.col.where("tipo", "==", "meta").get();
    return r.docs.map((d) => d.data() as unknown as MetaNuvem).filter((m) => m.modo === modo).sort((a, b) => b.quando - a.quando);
  } catch { return []; }
}
export async function lerDaNuvem(chave: string): Promise<{ meta: MetaNuvem; json: string } | null> {
  const c = await conectar();
  if (!c) return null;
  try {
    const m = await c.col.doc(chave).get();
    if (!m.exists) return null;
    const meta = m.data() as unknown as MetaNuvem;
    const partes = await Promise.all(Array.from({ length: meta.partes }, (_, i) => c.col.doc(`${chave}_p${i}`).get()));
    if (partes.some((p) => !p.exists)) return null;
    return { meta, json: await descomprimir(meta.z, partes.map((p) => String(p.data()?.d ?? "")).join("")) };
  } catch { return null; }
}
/** Apaga uma carreira da conta (o documento vira "apagado" e as partes ficam vazias). */
export async function apagarDaNuvem(chave: string): Promise<boolean> {
  const c = await conectar();
  if (!c) return false;
  try {
    const m = await c.col.doc(chave).get(), partes = Number((m.data() as { partes?: number } | undefined)?.partes ?? 0);
    for (let i = 0; i < partes; i++) await c.col.doc(`${chave}_p${i}`).set({ tipo: "apagado", d: "" });
    await c.col.doc(chave).set({ tipo: "apagado", chave, quando: Date.now() });
    return true;
  } catch { return false; }
}
/** A carreira mais recente guardada na conta (para recuperar quando o navegador perdeu o save). */
export async function ultimoDaNuvem(modo: string): Promise<{ meta: MetaNuvem; json: string } | null> {
  const lista = await listarNuvem(modo);
  return lista[0] ? lerDaNuvem(lista[0].chave) : null;
}

/** Agenda o envio: junta os salvamentos de uma rajada num só, e manda na hora quando a página vai sumir. */
export function criarAgendador(obter: () => { chave: string; modo: string; json: string; rotulo: string } | null, aviso?: (ok: boolean, quando: number) => void) {
  let timer: ReturnType<typeof setTimeout> | undefined, ultimoEnviado = "";
  const enviar = async () => {
    timer = undefined;
    const x = obter();
    if (!x || x.json === ultimoEnviado) return;
    const ok = await salvarNaNuvem(x.chave, x.modo, x.json, x.rotulo);
    if (ok) ultimoEnviado = x.json;
    aviso?.(ok, Date.now());
  };
  const agendar = (ms = 15000) => { if (timer) clearTimeout(timer); timer = setTimeout(() => void enviar(), ms); };
  const agora = () => { if (timer) clearTimeout(timer); void enviar(); };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") agora(); });
  window.addEventListener("pagehide", agora);
  return { agendar, agora };
}
