// Revisión visual con Chrome sin cabeza, sin dependencias (Node >= 22: fetch y WebSocket globales).
// Sirve para ver el sitio en escritorio y en móvil real (390 px) y para probar flujos sin depender
// de un navegador abierto.
//
// Uso:  node scripts/shot.mjs pasos.json      (con `pnpm dev --port 3100` corriendo)
// Las rutas de `shot.path` son relativas al archivo de pasos; usa la carpeta `.shots/` (ignorada por git).
//
// Pasos disponibles (un arreglo JSON de objetos con `op`):
//   viewport {width,height,mobile?,dpr?}      goto {url,wait?}             wait {ms}
//   media {reducedMotion: true|false}  (emula prefers-reduced-motion)
//   sweep {}  (recorre la página para disparar las animaciones al entrar en pantalla)
//   scroll {y} | {selector}                    click {selector} | {text}    type {text}
//   key {key: Enter|Escape|Tab|ArrowDown|ArrowUp|Backspace}                 eval {expr,label?}
//   shot {path, clip?: {y,height}, full?, scale?, quality?}
//
// Ejemplo (móvil, portada por tramos):
//   [{"op":"viewport","width":390,"height":844,"mobile":true,"dpr":2},
//    {"op":"goto","url":"http://localhost:3100/"},{"op":"sweep"},
//    {"op":"shot","path":".shots/home-m-1.jpg","clip":{"y":0,"height":1600}}]
// Al final imprime los errores y advertencias de la consola del navegador.
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = Number(process.env.SHOT_PORT ?? 9377);
const steps = JSON.parse(readFileSync(process.argv[2], "utf8"));
const profile = resolve(dirname(process.argv[2]), `.chrome-profile-${PORT}`);

const chrome = spawn(
    CHROME,
    [
        "--headless=new",
        `--remote-debugging-port=${PORT}`,
        `--user-data-dir=${profile}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--hide-scrollbars",
        "--disable-gpu",
        "--mute-audio",
        "about:blank",
    ],
    { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const finish = (code) => {
    try {
        chrome.kill("SIGKILL");
    } catch {}
    try {
        rmSync(profile, { recursive: true, force: true });
    } catch {}
    process.exit(code);
};

async function target() {
    for (let i = 0; i < 60; i++) {
        try {
            const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
            const page = list.find((t) => t.type === "page");
            if (page) return page.webSocketDebuggerUrl;
        } catch {}
        await sleep(250);
    }
    throw new Error("Chrome no abrió el puerto de depuración");
}

const ws = new WebSocket(await target());
await new Promise((r, j) => {
    ws.onopen = r;
    ws.onerror = j;
});

let seq = 0;
const pending = new Map();
const problems = [];
let loadResolve = null;
ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
        const { res, rej, timer } = pending.get(msg.id);
        clearTimeout(timer);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
        return;
    }
    if (msg.method === "Page.loadEventFired" && loadResolve) loadResolve();
    if (msg.method === "Runtime.exceptionThrown") {
        const d = msg.params.exceptionDetails;
        problems.push(`EXCEPCIÓN: ${d.exception?.description ?? d.text}`.slice(0, 400));
    }
    if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(msg.params.type)) {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
        problems.push(`${msg.params.type.toUpperCase()}: ${text}`.slice(0, 400));
    }
};

function send(method, params = {}, timeout = 20000) {
    const id = ++seq;
    return new Promise((res, rej) => {
        const timer = setTimeout(() => {
            pending.delete(id);
            rej(new Error(`${method} sin respuesta en ${timeout} ms (¿página colgada?)`));
        }, timeout);
        pending.set(id, { res, rej, timer });
        ws.send(JSON.stringify({ id, method, params }));
    });
}

const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
};

const KEYS = {
    Enter: [13, "Enter", "\r"],
    Escape: [27, "Escape"],
    Tab: [9, "Tab"],
    ArrowDown: [40, "ArrowDown"],
    ArrowUp: [38, "ArrowUp"],
    Backspace: [8, "Backspace"],
};

await send("Page.enable");
await send("Runtime.enable");

try {
    for (const s of steps) {
        if (s.op === "viewport") {
            await send("Emulation.setDeviceMetricsOverride", {
                width: s.width,
                height: s.height,
                deviceScaleFactor: s.dpr ?? 1,
                mobile: !!s.mobile,
            });
            await send("Emulation.setTouchEmulationEnabled", { enabled: !!s.mobile });
        } else if (s.op === "media") {
            await send("Emulation.setEmulatedMedia", {
                features: [{ name: "prefers-reduced-motion", value: s.reducedMotion ? "reduce" : "no-preference" }],
            });
        } else if (s.op === "goto") {
            const loaded = new Promise((r) => (loadResolve = r));
            await send("Page.navigate", { url: s.url });
            await Promise.race([loaded, sleep(s.timeout ?? 45000)]);
            await sleep(s.wait ?? 1500);
        } else if (s.op === "wait") {
            await sleep(s.ms);
        } else if (s.op === "scroll") {
            if (s.selector) {
                await evaluate(
                    `document.querySelector(${JSON.stringify(s.selector)})?.scrollIntoView({block:${JSON.stringify(s.block ?? "start")},behavior:"instant"})`,
                );
            } else {
                await evaluate(`window.scrollTo({top:${s.y},behavior:"instant"})`);
            }
            await sleep(s.wait ?? 500);
        } else if (s.op === "sweep") {
            // Recorre la página para disparar las animaciones "al entrar en pantalla" y vuelve arriba.
            const h = await evaluate("document.documentElement.scrollHeight");
            for (let y = 0; y < h; y += s.step ?? 500) {
                await evaluate(`window.scrollTo({top:${y},behavior:"instant"})`);
                await sleep(s.pause ?? 120);
            }
            await evaluate('window.scrollTo({top:0,behavior:"instant"})');
            await sleep(600);
            console.log(`alto de página: ${h}px`);
        } else if (s.op === "shot") {
            const path = resolve(dirname(process.argv[2]), s.path);
            mkdirSync(dirname(path), { recursive: true });
            const params = { format: "jpeg", quality: s.quality ?? 72 };
            if (s.clip) {
                const { cssContentSize: c } = await send("Page.getLayoutMetrics");
                params.captureBeyondViewport = true;
                params.clip = { x: 0, y: s.clip.y, width: c.width, height: Math.min(s.clip.height, c.height - s.clip.y), scale: s.scale ?? 1 };
            } else if (s.full) {
                const { cssContentSize: c } = await send("Page.getLayoutMetrics");
                params.captureBeyondViewport = true;
                params.clip = { x: 0, y: 0, width: c.width, height: Math.min(c.height, s.maxHeight ?? 12000), scale: s.scale ?? 1 };
            } else if (s.scale) {
                const { cssVisualViewport: v } = await send("Page.getLayoutMetrics");
                params.clip = { x: v.pageX, y: v.pageY, width: v.clientWidth, height: v.clientHeight, scale: s.scale };
                params.captureBeyondViewport = true;
            }
            const { data } = await send("Page.captureScreenshot", params, 40000);
            writeFileSync(path, Buffer.from(data, "base64"));
            console.log(`captura → ${path}`);
        } else if (s.op === "click") {
            const find = s.selector
                ? `document.querySelector(${JSON.stringify(s.selector)})`
                : `[...document.querySelectorAll("button,a,[role=option],[role=radio],label,input")].find(e => (e.innerText||e.value||"").trim().includes(${JSON.stringify(s.text)}))`;
            await evaluate(`(() => { const e = ${find}; e?.scrollIntoView({block:"center",behavior:"instant"}); })()`);
            await sleep(700); // por si el sitio usa scroll suave
            const pos = await evaluate(
                `(() => { const e = ${find}; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2}; })()`,
            );
            if (!pos) {
                console.log(`click: no encontré ${s.selector ?? s.text}`);
                continue;
            }
            await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pos.x, y: pos.y });
            await send("Input.dispatchMouseEvent", { type: "mousePressed", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
            await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
            await sleep(s.wait ?? 400);
        } else if (s.op === "type") {
            for (const ch of s.text) {
                await send("Input.insertText", { text: ch });
                await sleep(s.delay ?? 30);
            }
            await sleep(s.wait ?? 600);
        } else if (s.op === "clear") {
            await evaluate(
                `(() => { const e = document.querySelector(${JSON.stringify(s.selector)}); if (!e) return; e.focus(); e.select?.(); })()`,
            );
            await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
            await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
        } else if (s.op === "key") {
            const [code, key, text] = KEYS[s.key] ?? [];
            await send("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, windowsVirtualKeyCode: code, text });
            await send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode: code });
            await sleep(s.wait ?? 400);
        } else if (s.op === "eval") {
            console.log(`eval ${s.label ?? ""}→`, JSON.stringify(await evaluate(s.expr)));
        }
    }
} catch (e) {
    console.log(`FALLO: ${e.message}`);
    problems.forEach((p) => console.log(p));
    finish(1);
}

const unique = [...new Set(problems)];
console.log(unique.length ? `--- consola (${unique.length}) ---\n${unique.slice(0, 20).join("\n")}` : "consola: sin errores ni advertencias");
finish(0);
