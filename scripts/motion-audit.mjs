// Medidor de "cortes", "brincos" y "flashazos" en las interacciones del sitio (diseño: design/MOVIMIENTO.md §E).
//
//   node scripts/motion-audit.mjs scripts/motion/escenarios.json [--only N1,T] [--vp d|m] [--rm] [--out dir] [--check]
//   node scripts/motion-audit.mjs --selftest [--repeat 3]
//
// Cómo leerlo y cómo agregar escenarios: scripts/motion/README.md.
// Código de salida: 1 si algún escenario da CORTE, BRINCO, FLASHAZO, SIN REACCIÓN, RM-MOVIMIENTO o POST FALLÓ;
// 2 si no hubo nada de eso pero algún escenario no se pudo medir (ERROR); 0 si todo pasó.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import { analyze, strip } from "./lib/analyze.mjs";
import { recordRun } from "./lib/record.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
};
const stamp = () => new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "");

async function runOne(run, outDir, { retry = true } = {}) {
    let rec = await recordRun(run);
    let res = await analyze(rec, run);
    if (retry && (res.unstable || (res.verdict === "ERROR" && /colgada|sin respuesta|ERR_/.test(res.notes.join(" "))))) {
        const prev = res.notes.join("; ");
        rec = await recordRun(run);
        res = await analyze(rec, run);
        res.notes.unshift(`reintento (1.ª pasada: ${res.verdict === "ERROR" ? "error" : "inestable"}: ${prev.slice(0, 160)})`);
    }
    const name = `${run.scenario.id}-${run.vpName}${run.reduced ? "-rm" : ""}`.replace(/[^\w.-]+/g, "_");
    if (outDir) {
        try {
            res.strip = await strip(rec, res, join(outDir, `${name}.jpg`));
        } catch (e) {
            res.notes.push(`tira: ${e.message}`);
        }
    }
    res.console = rec.console;
    res.post = rec.post;
    res.id = run.scenario.id;
    res.title = run.scenario.title ?? "";
    res.vp = run.vpName;
    res.rm = !!run.reduced;
    return res;
}

function expand(spec, { only, vp, rm }) {
    const runs = [];
    const prefixes = only ? only.split(",").map((x) => x.trim()).filter(Boolean) : null;
    for (const sc of spec.scenarios) {
        if (sc.skip) continue;
        if (prefixes && !prefixes.some((p) => sc.id.startsWith(p))) continue;
        let vps = sc.vp ?? ["d"];
        if (vp) vps = vps.includes(vp) ? [vp] : [];
        const passes = sc.reduced === "only" ? [true] : sc.reduced === "both" || rm ? [false, true] : [false];
        for (const v of vps)
            for (const reduced of passes)
                runs.push({ scenario: sc, vpName: v, vp: spec.viewports[v], reduced, base: spec.base, defaults: spec.defaults ?? {} });
    }
    return runs;
}

const cell = (x) => String(x ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function writeReport(outDir, results, meta) {
    const count = (f) => results.filter((r) => r.flags.includes(f)).length;
    const summary = {
        corridas: results.length,
        OK: results.filter((r) => r.verdict === "OK").length,
        CORTE: count("CORTE"),
        "CORTE?": count("CORTE?"),
        BRINCO: count("BRINCO"),
        FLASHAZO: count("FLASHAZO"),
        "SIN REACCIÓN": count("SIN REACCIÓN"),
        "SIN CAMBIO": count("SIN CAMBIO"),
        "RM-MOVIMIENTO": count("RM-MOVIMIENTO"),
        "POST FALLÓ": count("POST FALLÓ"),
        ERROR: count("ERROR"),
    };
    const fpsAll = results.map((r) => r.fps).filter(Boolean);
    const L = [];
    L.push(`# Auditoría de movimiento — ${meta.when}`);
    L.push("");
    L.push(`Archivo: \`${meta.file}\` · base: ${meta.base} · commit: ${meta.commit}`);
    L.push(`Captura: screencast CDP (Chrome headless, sin GPU); cadencia mediana ${fpsAll.length ? Math.round(fpsAll.sort((a, b) => a - b)[fpsAll.length >> 1]) : "?"} fps (mín ${Math.min(...fpsAll)}).`);
    L.push("");
    L.push(Object.entries(summary).map(([k, v]) => `**${k}**: ${v}`).join(" · "));
    L.push("");
    L.push("| escenario | vp | rm | cuadros | fps | inicio ms | duración ms | salto máx % | cortes px | cortes DOM | brincos | flash | animaciones | veredicto | culpable |");
    L.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
    for (const r of results) {
        const culprit = r.domCuts[0]?.sel ?? r.pxCuts.find((c) => c.sel)?.sel ?? (r.pxCuts[0]?.box ? `zona ${r.pxCuts[0].box.join(",")}` : "") ?? "";
        const types = Object.entries(r.anims.types).map(([k, v]) => `${k}×${v}`).join(" ");
        L.push(
            `| ${cell(r.id)} | ${r.vp} | ${r.rm ? "sí" : ""} | ${r.frames} | ${r.fps ?? ""} | ${r.startMs ?? ""} | ${r.durMs || ""} | ${r.maxJumpPct} | ${r.pxCuts.length || ""} | ${r.domCuts.length || ""} | ${r.brincos.length || ""} | ${r.flashes.length || ""} | ${r.anims.n ? `${r.anims.n} (${types})` : ""} | **${r.verdict}** | ${cell(culprit).slice(0, 90)} |`,
        );
    }
    L.push("");
    L.push("## Detalle");
    for (const r of results) {
        if (r.verdict === "OK" && !r.notes.length && !r.domPartial.length) continue;
        L.push("");
        L.push(`### ${r.id} (${r.vp}${r.rm ? ", reducido" : ""}) — ${r.verdict}`);
        if (r.title) L.push(`_${r.title}_`);
        if (r.strip) L.push(`Tira: \`${r.strip.split("/").pop()}\``);
        for (const c of r.domCuts) L.push(`- CORTE DOM (${c.kind}) a ${c.t} ms: \`${cell(c.sel)}\` ${c.text ? `«${cell(c.text)}»` : ""} — ${c.pctVp}% del viewport, píxeles: ${c.pixeles}${c.frac != null ? ` (${c.frac})` : ""}`);
        for (const c of r.pxCuts) L.push(`- CORTE píxeles (${c.kind}) a ${c.t} ms: ${c.pct}%${c.ratio ? `, max/Σ = ${c.ratio}` : ""}${c.box ? `, zona ${c.box.join(",")}` : ""}${c.sel ? ` — cerca: \`${cell(c.sel)}\`` : ""}`);
        for (const c of r.brincos) L.push(`- BRINCO (${c.kind}) a ${c.t} ms: ${c.v ?? `${c.px} px`} — \`${cell(c.sel)}\``);
        for (const c of r.flashes) L.push(`- FLASHAZO (${c.kind}) a ${c.t} ms`);
        for (const c of r.rmMoves) L.push(`- RM-MOVIMIENTO: ${c.kind} \`${cell(c.sel)}\` (${cell(c.props)})`);
        for (const c of r.domPartial.slice(0, 5)) L.push(`- parcial (solo animan descendientes; decide el píxel): ${c.kind} \`${cell(c.sel)}\``);
        for (const p of r.post ?? []) if (!p.ok) L.push(`- POST FALLÓ: ${cell(p.error)}`);
        for (const n of r.notes) L.push(`- nota: ${cell(n)}`);
    }
    writeFileSync(join(outDir, "report.md"), L.join("\n") + "\n");
    writeFileSync(join(outDir, "report.json"), JSON.stringify({ meta, summary, results }, null, 1));
    return summary;
}

function exitCode(results) {
    if (results.some((r) => r.failing)) return 1;
    if (results.some((r) => r.verdict === "ERROR")) return 2;
    return 0;
}

// ---------------------------------------------------------------- escenarios del sitio
async function main() {
    const file = args.find((a) => a.endsWith(".json"));
    if (!file) {
        console.log("uso: node scripts/motion-audit.mjs scripts/motion/escenarios.json [--only N1,T] [--vp d|m] [--rm] [--out dir]\n     node scripts/motion-audit.mjs --selftest [--repeat 3]");
        process.exit(2);
    }
    const spec = JSON.parse(readFileSync(file, "utf8"));
    const runs = expand(spec, { only: opt("--only"), vp: opt("--vp"), rm: flag("--rm") });
    const outDir = resolve(opt("--out") ?? join(ROOT, ".shots/motion", stamp()));
    if (!flag("--check")) mkdirSync(outDir, { recursive: true });
    let commit = "?";
    try {
        commit = readFileSync(join(ROOT, ".git/HEAD"), "utf8").trim();
        if (commit.startsWith("ref:")) commit = readFileSync(join(ROOT, ".git", commit.slice(5)), "utf8").trim().slice(0, 7);
    } catch {}
    const meta = { when: new Date().toISOString(), file, base: spec.base, commit };
    console.log(`${runs.length} corridas${flag("--check") ? "" : ` → ${outDir}`}`);
    if (flag("--check")) {
        // Verifica selectores sin grabar (útil cuando otro agente rehízo un componente).
        let bad = 0;
        for (const run of runs) {
            const rec = await recordRun({ ...run, check: true });
            const items = rec.errors.length ? [{ what: "preparación", sel: rec.errors.join("; "), n: -1 }] : rec.check ?? [];
            for (const it of items) {
                if (it.n > 0) continue;
                bad++;
                console.log(`${run.scenario.id} (${run.vpName}): ${it.what} ${it.n < 0 ? "ERROR" : "0 coincidencias"} → ${it.sel}`);
            }
        }
        console.log(bad ? `${bad} selectores sin coincidencia` : "todos los selectores encuentran algo");
        process.exit(bad ? 2 : 0);
    }
    const results = [];
    for (const run of runs) {
        const t = Date.now();
        const r = await runOne(run, outDir);
        results.push(r);
        console.log(`${r.id.padEnd(28)} ${r.vp}${r.rm ? " rm" : "   "} ${String(r.frames).padStart(4)} cuadros ${String(r.fps ?? "-").padStart(3)} fps  ${r.verdict}${r.domCuts[0] ? `  ← ${r.domCuts[0].sel}` : ""}  (${((Date.now() - t) / 1000).toFixed(1)} s)`);
        writeReport(outDir, results, meta);
    }
    const summary = writeReport(outDir, results, meta);
    console.log(JSON.stringify(summary));
    console.log(`informe: ${join(outDir, "report.md")}`);
    process.exit(exitCode(results));
}

// ---------------------------------------------------------------- autoprueba con páginas sintéticas
const CSS = `<style>
html,body{margin:0;height:100%;background:#101012;color:#ddd;font:18px/1.4 system-ui,sans-serif}
#b{position:absolute;left:40px;top:40px;width:180px;height:44px;background:#2a2a2e;color:#ddd;border:0;outline:none;font:inherit}
#b:hover,#b:active,#b:focus{background:#2a2a2e;outline:none}
.panel{position:absolute;left:300px;top:150px;width:640px;height:420px;background:#d8c39a;color:#111;padding:24px;box-sizing:border-box}
#list{position:absolute;left:300px;top:130px;width:640px}
.item{height:90px;margin:0 0 12px;background:#3b3b44;color:#eee;padding:12px;box-sizing:border-box}
.grow{overflow:hidden;background:#d8c39a;color:#111}
input{position:absolute;left:300px;top:150px;width:420px;height:48px;background:#1c1c20;color:#eee;border:1px solid #444;font:18px system-ui;padding:0 12px;outline:none}
#price{position:absolute;left:300px;top:180px;font:600 72px/1 system-ui;color:#f1e3c4}
</style>`;
const page = (body, script = "") => `<!doctype html><html><head><meta charset="utf-8">${CSS}</head><body><button id="b">Acción</button>${body}<script>${script}</script></body></html>`;
const PANEL_TXT = "<h2>Panel</h2><p>Contenido del panel con texto suficiente para pintar.</p>";

const CASES = [
    {
        id: "a-aparece-de-golpe",
        html: page(`<div class="panel" id="p" hidden>${PANEL_TXT}</div>`, `b.onclick=()=>{p.hidden=false}`),
        want: ["CORTE"],
        not: ["FLASHAZO"],
    },
    {
        id: "b-fundido-300ms",
        html: page(
            `<div class="panel" id="p" style="opacity:0;transition:opacity 300ms ease">${PANEL_TXT}</div>`,
            `b.onclick=()=>{p.style.opacity=1}`,
        ),
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "FLASHAZO", "BRINCO", "SIN REACCIÓN"],
    },
    {
        id: "c-empuja-de-golpe",
        html: page(`<div id="list">${[1, 2, 3, 4].map((i) => `<div class="item">Fila ${i}</div>`).join("")}</div>`, `b.onclick=()=>{const d=document.createElement('div');d.className='item grow';d.style.height='220px';d.textContent='Nuevo bloque';list.prepend(d)}`),
        want: ["CORTE", "BRINCO"],
    },
    {
        id: "d-alto-animado",
        html: page(
            `<div id="list">${[1, 2, 3, 4].map((i) => `<div class="item">Fila ${i}</div>`).join("")}</div>`,
            `b.onclick=()=>{const d=document.createElement('div');d.className='item grow';d.style.height='0px';d.style.padding='0';d.style.transition='height 380ms ease, opacity 380ms ease';d.style.opacity='0';d.textContent='Nuevo bloque';list.prepend(d);d.offsetHeight;d.style.height='220px';d.style.opacity='1'}`,
        ),
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "BRINCO", "FLASHAZO"],
    },
    {
        id: "e-destello-blanco",
        html: page(`<div class="panel" style="background:#222">${PANEL_TXT}</div>`, `b.onclick=()=>{document.documentElement.style.background='#fff';document.body.style.background='#fff';requestAnimationFrame(()=>requestAnimationFrame(()=>{document.documentElement.style.background='';document.body.style.background=''}))}`),
        want: ["FLASHAZO"],
    },
    {
        id: "f-sin-reaccion",
        html: page(`<div class="panel" style="background:#222">${PANEL_TXT}</div>`, ``),
        expect: { animated: true },
        want: ["SIN REACCIÓN"],
    },
    {
        id: "g-teclear-un-caracter",
        html: page(`<input id="i" placeholder="">`),
        setup: [{ op: "click", selector: "#i" }],
        action: [{ op: "type", text: "a" }],
        not: ["CORTE", "CORTE?", "FLASHAZO", "BRINCO"],
    },
    {
        id: "h-raf-como-motion",
        html: page(
            ``,
            `b.onclick=()=>{const p=document.createElement('div');p.className='panel';p.innerHTML=${JSON.stringify(PANEL_TXT)};p.style.opacity='0';p.style.transform='translateY(24px)';document.body.append(p);const t0=performance.now();const D=320;const step=(now)=>{const k=Math.min(1,(now-t0)/D);const e=1-Math.pow(1-k,3);p.style.opacity=String(e);p.style.transform='translateY('+(24*(1-e)).toFixed(2)+'px)';if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}`,
        ),
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "FLASHAZO", "BRINCO", "SIN REACCIÓN"],
    },
    {
        id: "i1-reducido-solo-opacidad",
        reduced: true,
        html: page(`<div class="panel" id="p" style="opacity:0;transition:opacity 260ms ease">${PANEL_TXT}</div>`, `b.onclick=()=>{p.style.opacity=1}`),
        expect: { animated: true },
        not: ["RM-MOVIMIENTO", "CORTE", "CORTE?", "FLASHAZO"],
    },
    {
        id: "i2-reducido-con-desplazamiento",
        reduced: true,
        html: page(
            `<div class="panel" id="p" style="opacity:0;transform:translateY(40px);transition:opacity 300ms ease, transform 300ms ease">${PANEL_TXT}</div>`,
            `b.onclick=()=>{p.style.opacity=1;p.style.transform='none'}`,
        ),
        expect: { animated: true },
        want: ["RM-MOVIMIENTO"],
    },
    {
        id: "j-texto-de-golpe",
        html: page(`<div id="price">$1,200 MXN</div>`, `b.onclick=()=>{price.firstChild.nodeValue='$1,850 MXN'}`),
        want: ["CORTE"],
    },
    {
        id: "k-quita-de-golpe",
        html: page(`<div class="panel" id="p">${PANEL_TXT}</div>`, `b.onclick=()=>{p.remove()}`),
        want: ["CORTE"],
    },
    {
        id: "l-quita-con-fundido",
        html: page(`<div class="panel" id="p">${PANEL_TXT}</div>`, `b.onclick=()=>{const a=p.animate([{opacity:1},{opacity:0}],{duration:260,easing:'ease-in',fill:'forwards'});a.onfinish=()=>p.remove()}`),
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "FLASHAZO"],
    },
    {
        id: "m-waapi-entrada",
        html: page(``, `b.onclick=()=>{const p=document.createElement('div');p.className='panel';p.innerHTML=${JSON.stringify(PANEL_TXT)};document.body.append(p);p.animate([{opacity:0,transform:'scale(.96)'},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.8,.2,1)'})}`),
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "FLASHAZO"],
    },
    {
        id: "n-clase-sin-transicion",
        html: page(`<style>#p{opacity:0}#p.on{opacity:1}</style><div class="panel" id="p">${PANEL_TXT}</div>`, `b.onclick=()=>{p.classList.add('on')}`),
        want: ["CORTE"],
    },
    {
        id: "o-color-de-golpe-sin-dom",
        html: page(`<style>#p{background:#2a2a30}#p.on{background:#d8c39a}</style><div class="panel" id="p">${PANEL_TXT}</div>`, `b.onclick=()=>{p.classList.add('on')}`),
        want: ["CORTE"],
    },
    {
        id: "p-fundido-rapido-expo-150ms",
        html: page(`<div class="panel" id="p" style="opacity:0;transition:opacity 150ms cubic-bezier(.16,1,.3,1)">${PANEL_TXT}</div>`, `b.onclick=()=>{p.style.opacity=1}`),
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "FLASHAZO"],
    },
    {
        id: "q-corte-local-durante-fundido-largo",
        html: page(
            `<div class="panel" id="p" style="opacity:0;transition:opacity 700ms linear">${PANEL_TXT}</div><div id="tag" hidden style="position:absolute;left:980px;top:150px;width:240px;height:140px;background:#9ab8d8"></div>`,
            `b.onclick=()=>{p.style.opacity=1;setTimeout(()=>{tag.hidden=false},200)}`,
        ),
        want: ["CORTE"],
    },
    {
        id: "r-scroll-revela-con-fundido",
        html: page(
            `<style>.rv{opacity:0;transition:opacity 400ms ease}.rv.in{opacity:1}</style><div style="height:2400px"></div>${[0, 1, 2].map((i) => `<div class="rv panel" style="position:absolute;top:${1300 + i * 460}px;height:400px">Bloque ${i}</div>`).join("")}`,
            `const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}));document.querySelectorAll('.rv').forEach(x=>io.observe(x))`,
        ),
        action: [{ op: "scroll", y: 1200 }],
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "FLASHAZO", "BRINCO"],
    },
    {
        id: "s-scroll-revela-de-golpe",
        html: page(
            `<style>.rv{opacity:0}.rv.in{opacity:1}</style><div style="height:2400px"></div>${[0, 1, 2].map((i) => `<div class="rv panel" style="position:absolute;top:${1300 + i * 460}px;height:400px">Bloque ${i}</div>`).join("")}`,
            `const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}));document.querySelectorAll('.rv').forEach(x=>io.observe(x))`,
        ),
        action: [{ op: "scroll", y: 1200 }],
        want: ["CORTE"],
    },
    {
        id: "t-parpadeo-a-b-a",
        html: page(`<div class="panel" id="p" hidden style="background:#55555c">${PANEL_TXT}</div>`, `b.onclick=()=>{p.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>{p.hidden=true}))}`),
        want: ["FLASHAZO"],
    },
    {
        // Un hermano empujado por un alto animado se mueve muchos px por cuadro, pero repartidos: no es brinco.
        id: "w-hermano-con-alto-animado",
        html: page(
            `<div id="list">${[1, 2, 3, 4].map((i) => `<div class="item">Fila ${i}</div>`).join("")}</div>`,
            `b.onclick=()=>{const d=document.createElement('div');d.className='item grow';d.style.height='0px';d.style.padding='0';d.style.transition='height 380ms cubic-bezier(.22,1,.36,1), opacity 380ms ease';d.style.opacity='0';d.textContent='Nuevo bloque';list.prepend(d);d.offsetHeight;d.style.height='260px';d.style.opacity='1'}`,
        ),
        track: ["#list .item:last-child"],
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "BRINCO", "FLASHAZO"],
    },
    {
        id: "x-hermano-empujado-de-golpe",
        html: page(`<div id="list">${[1, 2, 3, 4].map((i) => `<div class="item">Fila ${i}</div>`).join("")}</div>`, `b.onclick=()=>{const d=document.createElement('div');d.className='item grow';d.style.height='260px';d.textContent='Nuevo bloque';list.prepend(d)}`),
        track: ["#list .item:last-child"],
        want: ["BRINCO"],
    },
    {
        // Lo invisible puede reacomodarse (una cabecera que todavía no entra): no es un brinco a la vista.
        id: "x2-reacomodo-invisible",
        html: page(
            `<div id="list" style="opacity:0">${[1, 2, 3, 4].map((i) => `<div class="item">Fila ${i}</div>`).join("")}</div><div class="panel" id="p" style="left:980px;width:300px;height:200px;opacity:0;transition:opacity 300ms ease">Visible</div>`,
            `b.onclick=()=>{const d=document.createElement('div');d.className='item grow';d.style.height='260px';d.textContent='Nuevo bloque';list.prepend(d);p.style.opacity=1}`,
        ),
        expect: { animated: true },
        not: ["BRINCO", "CORTE", "CORTE?", "FLASHAZO"],
    },
    {
        // React pone animaciones de duración 0 en ::view-transition: no mueven nada.
        id: "y-reducido-duracion-cero",
        reduced: true,
        html: page(`<div class="panel" id="p" style="opacity:0;transition:opacity 260ms ease">${PANEL_TXT}</div>`, `b.onclick=()=>{p.style.opacity=1;p.animate([{transform:'translateY(40px)'},{transform:'none'}],{duration:0,fill:'forwards'})}`),
        expect: { animated: true },
        not: ["RM-MOVIMIENTO", "CORTE", "CORTE?", "FLASHAZO"],
    },
    {
        // Con movimiento reducido el alto cambia al instante y el contenido se funde: permitido.
        id: "z1-reducido-alto-al-instante-con-fundido",
        reduced: true,
        html: page(
            `<div id="list">${[1, 2, 3, 4].map((i) => `<div class="item">Fila ${i}</div>`).join("")}</div>`,
            `b.onclick=()=>{const d=document.createElement('div');d.className='item grow';d.style.height='220px';d.style.opacity='0';d.style.transition='opacity 280ms ease';d.textContent='Nuevo bloque';list.prepend(d);d.offsetHeight;d.style.opacity='1'}`,
        ),
        track: ["#list .item:last-child"],
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "BRINCO", "RM-MOVIMIENTO", "FLASHAZO", "SIN REACCIÓN"],
    },
    {
        // Con movimiento reducido, una animación por estilo en línea (rAF, como motion) sí es movimiento…
        id: "z3-reducido-raf-desplaza",
        reduced: true,
        html: page(
            `<div class="panel" id="p">${PANEL_TXT}</div>`,
            `b.onclick=()=>{const t0=performance.now();const D=320;const step=(now)=>{const k=Math.min(1,(now-t0)/D);p.style.transform='translateY('+(40*(1-k)).toFixed(2)+'px)';p.style.opacity=String(0.4+0.6*k);if(k<1)requestAnimationFrame(step)};p.style.transform='translateY(40px)';requestAnimationFrame(step)}`,
        ),
        expect: { animated: true },
        want: ["RM-MOVIMIENTO"],
    },
    {
        // …pero varios cambios de alto sueltos e instantáneos (una lista que se ajusta con cada tecla) no.
        id: "z4-reducido-pasos-sueltos",
        reduced: true,
        html: page(
            `<div id="list"><div class="item grow" id="g" style="height:120px;transition:none">Lista</div>${[1, 2].map((i) => `<div class="item">Fila ${i}</div>`).join("")}</div><div class="panel" id="p" style="left:980px;width:300px;height:200px;opacity:0;transition:opacity 300ms ease">Visible</div>`,
            `b.onclick=()=>{p.style.opacity=1;[180,90,240].forEach((h,i)=>setTimeout(()=>{g.style.height=h+'px'},120*i))}`,
        ),
        expect: { animated: true },
        not: ["RM-MOVIMIENTO", "CORTE", "CORTE?", "FLASHAZO"],
    },
    {
        // …pero algo que aparece sin fundido sigue siendo un corte, también con movimiento reducido.
        id: "z2-reducido-aparece-de-golpe",
        reduced: true,
        html: page(`<div class="panel" id="p" hidden>${PANEL_TXT}</div>`, `b.onclick=()=>{p.hidden=false}`),
        want: ["CORTE"],
    },
    {
        id: "sc1-scroll-animado-no-permitido",
        html: page(`<div style="height:2600px"></div>${[0, 1, 2, 3].map((i) => `<div class="panel" style="position:absolute;top:${200 + i * 480}px;height:400px">Bloque ${i}</div>`).join("")}`, `b.onclick=()=>{window.scrollTo({top:900,behavior:'smooth'})}`),
        expect: { maxScrollFrames: 1 },
        want: ["BRINCO"],
    },
    {
        id: "sc2-scroll-de-un-cuadro",
        html: page(`<div style="height:2600px"></div>${[0, 1, 2, 3].map((i) => `<div class="panel" style="position:absolute;top:${200 + i * 480}px;height:400px">Bloque ${i}</div>`).join("")}`, `b.onclick=()=>{window.scrollTo({top:900,behavior:'instant'})}`),
        expect: { maxScrollFrames: 1 },
        not: ["BRINCO", "CORTE", "FLASHAZO"],
    },
    {
        id: "u-movil-aparece-de-golpe",
        vp: "m",
        html: page(`<div class="panel" id="p" hidden style="left:20px;top:120px;width:340px;height:300px">${PANEL_TXT}</div>`, `b.onclick=()=>{p.hidden=false}`),
        want: ["CORTE"],
    },
    {
        id: "v-movil-fundido",
        vp: "m",
        html: page(`<div class="panel" id="p" style="left:20px;top:120px;width:340px;height:300px;opacity:0;transition:opacity 280ms ease">${PANEL_TXT}</div>`, `b.onclick=()=>{p.style.opacity=1}`),
        expect: { animated: true },
        not: ["CORTE", "CORTE?", "FLASHAZO", "SIN REACCIÓN"],
    },
];

async function selftest() {
    const pages = new Map(CASES.map((c) => [`/${c.id}`, c.html]));
    const server = createServer((req, res) => {
        const html = pages.get(req.url.split("?")[0]);
        res.writeHead(html ? 200 : 404, { "content-type": "text/html; charset=utf-8" });
        res.end(html ?? "no");
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const base = `http://127.0.0.1:${server.address().port}`;
    const repeat = Number(opt("--repeat") ?? 1);
    const outDir = resolve(opt("--out") ?? join(ROOT, ".shots/motion", `selftest-${stamp()}`));
    mkdirSync(outDir, { recursive: true });
    const VPS = { d: { width: 1440, height: 900 }, m: { width: 390, height: 844, mobile: true, dpr: 2 } };
    const only = opt("--only");
    let allOk = true;
    const rounds = [];
    for (let rep = 1; rep <= repeat; rep++) {
        const results = [];
        let fails = 0;
        for (const c of CASES) {
            if (only && !c.id.startsWith(only)) continue;
            const sc = {
                id: c.id,
                setup: [{ op: "goto", url: `/${c.id}`, wait: 300 }, ...(c.setup ?? [])],
                action: c.action ?? [{ op: "click", selector: "#b" }],
                expect: c.expect ?? {},
                track: c.track,
                settleMs: 300,
                maxMs: 1500,
            };
            const r = await runOne({ scenario: sc, vpName: c.vp ?? "d", vp: VPS[c.vp ?? "d"], reduced: !!c.reduced, base, defaults: {} }, rep === repeat ? outDir : null, { retry: false });
            const missing = (c.want ?? []).filter((f) => !r.flags.includes(f));
            const extra = (c.not ?? []).filter((f) => r.flags.includes(f));
            const ok = !missing.length && !extra.length && r.verdict !== "ERROR";
            if (!ok) fails++;
            r.selftest = { ok, want: c.want ?? [], not: c.not ?? [], missing, extra };
            results.push(r);
            console.log(
                `${ok ? "PASA " : "FALLA"} ${c.id.padEnd(32)} ${String(r.fps ?? "-").padStart(3)} fps ${String(r.frames).padStart(3)} cuadros  ${r.verdict}` +
                    (missing.length ? `  faltó: ${missing.join(",")}` : "") +
                    (extra.length ? `  sobró: ${extra.join(",")}` : "") +
                    (ok ? "" : `  [px:${r.pxCuts.map((x) => `${x.kind}@${x.t}(${x.pct}%)`).join(" ")} dom:${r.domCuts.map((x) => `${x.kind}@${x.t}/${x.pixeles}`).join(" ")} br:${r.brincos.length} fl:${r.flashes.map((f) => f.kind).join(",")} notas:${r.notes.join("; ")}]`),
            );
        }
        console.log(`ronda ${rep}: ${results.length - fails}/${results.length} pasan`);
        rounds.push({ rep, pass: results.length - fails, total: results.length });
        if (fails) allOk = false;
        if (rep === repeat) writeReport(outDir, results, { when: new Date().toISOString(), file: "--selftest", base, commit: "-" });
    }
    server.close();
    writeFileSync(join(outDir, "rounds.json"), JSON.stringify(rounds));
    console.log(allOk ? `AUTOPRUEBA OK (${repeat} ronda${repeat > 1 ? "s" : ""})` : "AUTOPRUEBA FALLÓ");
    console.log(`informe: ${join(outDir, "report.md")}`);
    process.exit(allOk ? 0 : 1);
}

if (flag("--selftest")) await selftest();
else await main();
