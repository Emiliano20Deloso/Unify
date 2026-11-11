// Motor común de Chrome sin cabeza por CDP, sin dependencias (Node >= 22: fetch y WebSocket globales).
// Copiado y ampliado a partir de scripts/shot.mjs (que sigue siendo independiente).
//
//   const b = await launch();            // Chrome con perfil temporal y puerto libre
//   await runOp(b, {op:"goto", url:"/"}, {base:"http://localhost:3100"});
//   await b.close();
//
// Operaciones (objetos con `op`):
//   viewport {width,height,mobile?,dpr?}     media {reducedMotion}          goto {url,wait?,timeout?}
//   reload {wait?}                           wait {ms}                       scroll {y}|{selector,block?,smooth?}
//   click {selector|text,nth?}               hover {selector,nth?}           press {selector,ms}
//   type {text,delay?}                       key {key,times?}                clear {selector}
//   eval {expr,equals?}                      sweep {step?,pause?}            storage {key,value,area?}|{clear:true}
//   intercept {pattern,mode:"fail"|"429"|"delay",ms?}|{off:true}
//   throttle {latency,down,up}|{off:true}    nocache {}                      waitFor {selector,timeout?}
// En una acción grabada (ctx.recording = true), click/hover/press no desplazan la página ni esperan.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(opts = {}) {
    let last;
    for (let i = 0; i < 3; i++) {
        try {
            return await launchOnce(opts);
        } catch (e) {
            last = e;
            await sleep(500);
        }
    }
    throw last;
}

async function launchOnce({ extraArgs = [] } = {}) {
    const profile = mkdtempSync(join(tmpdir(), "motion-audit-"));
    const chrome = spawn(
        CHROME,
        [
            "--headless=new",
            "--remote-debugging-port=0",
            `--user-data-dir=${profile}`,
            "--no-first-run",
            "--no-default-browser-check",
            "--hide-scrollbars",
            "--mute-audio",
            "--disable-gpu", // con GPU el screencast se atora (pausas de ~400 ms); sin GPU entrega 60 fps estables
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
            "--disable-backgrounding-occluded-windows",
            ...extraArgs,
            "about:blank",
        ],
        { stdio: "ignore" },
    );
    let port = null;
    for (let i = 0; i < 250 && !port; i++) {
        const f = join(profile, "DevToolsActivePort");
        if (existsSync(f)) port = Number(readFileSync(f, "utf8").split("\n")[0]) || null;
        if (!port) await sleep(100);
    }
    const fail = (msg) => {
        try {
            chrome.kill("SIGKILL");
        } catch {}
        try {
            rmSync(profile, { recursive: true, force: true });
        } catch {}
        return new Error(msg);
    };
    if (!port) throw fail("Chrome no abrió el puerto de depuración");
    let wsUrl = null;
    for (let i = 0; i < 60 && !wsUrl; i++) {
        try {
            const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
            wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
        } catch {}
        if (!wsUrl) await sleep(150);
    }
    if (!wsUrl) throw fail("Chrome no expuso una pestaña");
    const ws = new WebSocket(wsUrl);
    await new Promise((r, j) => {
        ws.onopen = r;
        ws.onerror = j;
    });

    let seq = 0;
    const pending = new Map();
    const listeners = new Map();
    const problems = [];
    ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id && pending.has(msg.id)) {
            const { res, rej, timer } = pending.get(msg.id);
            clearTimeout(timer);
            pending.delete(msg.id);
            if (msg.error) rej(new Error(`${msg.error.message}`));
            else res(msg.result);
            return;
        }
        if (msg.method === "Runtime.exceptionThrown") {
            const d = msg.params.exceptionDetails;
            problems.push(`EXCEPCIÓN: ${d.exception?.description ?? d.text}`.slice(0, 400));
        }
        if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(msg.params.type)) {
            const text = msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
            problems.push(`${msg.params.type.toUpperCase()}: ${text}`.slice(0, 400));
        }
        for (const fn of listeners.get(msg.method) ?? []) {
            try {
                fn(msg.params);
            } catch (e) {
                problems.push(`listener ${msg.method}: ${e.message}`);
            }
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
    const on = (method, fn) => {
        if (!listeners.has(method)) listeners.set(method, new Set());
        listeners.get(method).add(fn);
        return () => listeners.get(method).delete(fn);
    };
    const once = (method, timeout = 30000) =>
        new Promise((res) => {
            const off = on(method, (p) => {
                off();
                clearTimeout(t);
                res(p);
            });
            const t = setTimeout(() => {
                off();
                res(null);
            }, timeout);
        });
    const evaluate = async (expression, timeout) => {
        const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, timeout);
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
        return r.result.value;
    };
    const close = async () => {
        try {
            ws.close();
        } catch {}
        try {
            chrome.kill("SIGKILL");
        } catch {}
        await sleep(150);
        try {
            rmSync(profile, { recursive: true, force: true });
        } catch {}
    };

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    const b = { send, on, once, evaluate, close, problems, state: { intercepts: [], fetchOn: false, vp: null } };
    on("Fetch.requestPaused", (p) => onPaused(b, p));
    return b;
}

const KEYS = {
    Enter: [13, "Enter", "\r"],
    Escape: [27, "Escape"],
    Tab: [9, "Tab"],
    Space: [32, " ", " ", "Space"],
    ArrowDown: [40, "ArrowDown"],
    ArrowUp: [38, "ArrowUp"],
    ArrowLeft: [37, "ArrowLeft"],
    ArrowRight: [39, "ArrowRight"],
    Home: [36, "Home"],
    End: [35, "End"],
    PageDown: [34, "PageDown"],
    Backspace: [8, "Backspace"],
};

function globToRegex(p) {
    return new RegExp("^" + p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
}

async function onPaused(b, p) {
    const rule = b.state.intercepts.find((r) => r.re.test(p.request.url));
    try {
        if (!rule) return await b.send("Fetch.continueRequest", { requestId: p.requestId });
        if (rule.mode === "fail") return await b.send("Fetch.failRequest", { requestId: p.requestId, errorReason: "Failed" });
        if (rule.mode === "429")
            return await b.send("Fetch.fulfillRequest", {
                requestId: p.requestId,
                responseCode: 429,
                responseHeaders: [{ name: "content-type", value: "application/json" }],
                body: Buffer.from(JSON.stringify({ error: "rate_limited" })).toString("base64"),
            });
        if (rule.mode === "delay") {
            await sleep(rule.ms ?? 1500);
            return await b.send("Fetch.continueRequest", { requestId: p.requestId });
        }
        await b.send("Fetch.continueRequest", { requestId: p.requestId });
    } catch {}
}

/** Expresión JS que encuentra el elemento: por selector (con nth) o por texto visible. */
export function finder(s) {
    if (s.selector)
        return s.nth != null
            ? `document.querySelectorAll(${JSON.stringify(s.selector)})[${Number(s.nth)}]`
            : `document.querySelector(${JSON.stringify(s.selector)})`;
    return `[...document.querySelectorAll("button,a,[role=option],[role=radio],[role=tab],label,input,summary")].find(e => (e.innerText||e.value||"").trim().includes(${JSON.stringify(s.text)}))`;
}

/** Centro del elemento en coordenadas del viewport y si está entero en pantalla. */
export async function locate(b, s) {
    return b.evaluate(`(() => { const e = ${finder(s)}; if (!e) return null; const r = e.getBoundingClientRect();
        return {x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height,
                inView: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && r.width > 0}; })()`);
}

export async function scrollIntoView(b, s, wait = 700) {
    await b.evaluate(`(() => { const e = ${finder(s)}; e?.scrollIntoView({block:"center",behavior:"instant"}); })()`);
    await sleep(wait);
}

async function pointAt(b, s, ctx) {
    let pos = await locate(b, s);
    if (!pos) throw new Error(`${s.op}: no encontré ${s.selector ?? s.text}`);
    if (!pos.inView) {
        if (ctx.recording) ctx.warn?.(`${s.op} ${s.selector ?? s.text}: fuera de pantalla dentro de la grabación; lo desplacé sin animación`);
        await scrollIntoView(b, s, ctx.recording ? 0 : 700);
        pos = await locate(b, s);
    }
    return pos;
}

const abs = (base, url) => (/^[a-z]+:/i.test(url) ? url : (base ?? "") + url);

export async function runOp(b, s, ctx = {}) {
    const rec = !!ctx.recording;
    switch (s.op) {
        case "viewport": {
            b.state.vp = s;
            await b.send("Emulation.setDeviceMetricsOverride", {
                width: s.width,
                height: s.height,
                deviceScaleFactor: s.dpr ?? 1,
                mobile: !!s.mobile,
            });
            await b.send("Emulation.setTouchEmulationEnabled", s.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
            return;
        }
        case "media":
            await b.send("Emulation.setEmulatedMedia", {
                features: [{ name: "prefers-reduced-motion", value: s.reducedMotion ? "reduce" : "no-preference" }],
            });
            return;
        case "goto":
        case "reload": {
            const loaded = b.once("Page.loadEventFired", s.timeout ?? 45000);
            if (s.op === "goto") {
                const r = await b.send("Page.navigate", { url: abs(ctx.base, s.url) });
                if (r.errorText) throw new Error(`goto ${s.url}: ${r.errorText}`);
            } else await b.send("Page.reload", { ignoreCache: !!s.ignoreCache });
            if (s.noWait) return; // la grabación sigue durante la carga
            await loaded;
            await sleep(s.wait ?? (rec ? 0 : 1500));
            return;
        }
        case "wait":
            return sleep(s.ms);
        case "waitFor": {
            const t0 = Date.now();
            while (Date.now() - t0 < (s.timeout ?? 8000)) {
                if (await b.evaluate(`!!(${finder(s)})`).catch(() => false)) return;
                await sleep(100);
            }
            throw new Error(`waitFor: no apareció ${s.selector}`);
        }
        case "scroll": {
            const behavior = s.smooth ? "smooth" : "instant";
            if (s.selector) {
                const ok = await b.evaluate(
                    `(() => { const e = ${finder(s)}; if (!e) return false; e.scrollIntoView({block:${JSON.stringify(s.block ?? "start")},behavior:"${behavior}"}); return true; })()`,
                );
                if (!ok) throw new Error(`scroll: no encontré ${s.selector}`);
            } else if (s.by != null) await b.evaluate(`window.scrollBy({top:${s.by},behavior:"${behavior}"})`);
            else await b.evaluate(`window.scrollTo({top:${s.y},behavior:"${behavior}"})`);
            await sleep(s.wait ?? (rec ? 0 : 500));
            return;
        }
        case "sweep": {
            const h = await b.evaluate("document.documentElement.scrollHeight");
            for (let y = 0; y < h; y += s.step ?? 500) {
                await b.evaluate(`window.scrollTo({top:${y},behavior:"instant"})`);
                await sleep(s.pause ?? 120);
            }
            await b.evaluate('window.scrollTo({top:0,behavior:"instant"})');
            await sleep(600);
            return;
        }
        case "click": {
            const pos = await pointAt(b, s, ctx);
            if (!rec) await sleep(0);
            await b.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pos.x, y: pos.y });
            await b.send("Input.dispatchMouseEvent", { type: "mousePressed", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
            await b.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
            await sleep(s.wait ?? (rec ? 0 : 400));
            return;
        }
        case "hover": {
            const pos = await pointAt(b, s, ctx);
            await b.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pos.x, y: pos.y });
            await sleep(s.wait ?? (rec ? 0 : 300));
            return;
        }
        case "unhover":
            await b.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
            await sleep(s.wait ?? (rec ? 0 : 300));
            return;
        case "press": {
            const pos = await pointAt(b, s, ctx);
            await b.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pos.x, y: pos.y });
            await b.send("Input.dispatchMouseEvent", { type: "mousePressed", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
            await sleep(s.ms ?? 150);
            await b.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
            await sleep(s.wait ?? 0);
            return;
        }
        case "type":
            for (const ch of s.text) {
                await b.send("Input.insertText", { text: ch });
                await sleep(s.delay ?? 30);
            }
            await sleep(s.wait ?? (rec ? 0 : 600));
            return;
        case "clear":
            await b.evaluate(`(() => { const e = ${finder(s)}; if (!e) return; e.focus(); e.select?.(); })()`);
            await b.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
            await b.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
            return;
        case "focus":
            await b.evaluate(`(${finder(s)})?.focus()`);
            await sleep(s.wait ?? (rec ? 0 : 200));
            return;
        case "key": {
            const [code, key, text, codeName] = KEYS[s.key] ?? [];
            if (!key) throw new Error(`key: tecla desconocida ${s.key}`);
            for (let i = 0; i < (s.times ?? 1); i++) {
                await b.send("Input.dispatchKeyEvent", { type: "keyDown", key, code: codeName ?? key, windowsVirtualKeyCode: code, text });
                await b.send("Input.dispatchKeyEvent", { type: "keyUp", key, code: codeName ?? key, windowsVirtualKeyCode: code });
                if (i + 1 < (s.times ?? 1)) await sleep(s.gap ?? 120);
            }
            await sleep(s.wait ?? (rec ? 0 : 400));
            return;
        }
        case "eval": {
            const v = await b.evaluate(s.expr);
            if ("equals" in s && JSON.stringify(v) !== JSON.stringify(s.equals))
                throw new Error(`eval ${s.label ?? s.expr.slice(0, 60)}: dio ${JSON.stringify(v)}, se esperaba ${JSON.stringify(s.equals)}`);
            if (s.wait) await sleep(s.wait);
            return v;
        }
        case "storage": {
            const area = s.area === "session" ? "sessionStorage" : "localStorage";
            if (s.clear) return b.evaluate(`${area}.clear()`);
            const v = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
            return b.evaluate(`${area}.setItem(${JSON.stringify(s.key)}, ${JSON.stringify(v)})`);
        }
        case "intercept": {
            if (s.off) b.state.intercepts = s.pattern ? b.state.intercepts.filter((r) => r.pattern !== s.pattern) : [];
            else b.state.intercepts.push({ pattern: s.pattern, re: globToRegex(s.pattern), mode: s.mode ?? "fail", ms: s.ms });
            if (b.state.intercepts.length && !b.state.fetchOn) {
                await b.send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
                b.state.fetchOn = true;
            } else if (!b.state.intercepts.length && b.state.fetchOn) {
                await b.send("Fetch.disable");
                b.state.fetchOn = false;
            }
            return;
        }
        case "throttle":
            await b.send(
                "Network.emulateNetworkConditions",
                s.off
                    ? { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }
                    : {
                          offline: false,
                          latency: s.latency ?? 400,
                          downloadThroughput: s.down ?? (1.5 * 1024 * 1024) / 8,
                          uploadThroughput: s.up ?? (750 * 1024) / 8,
                      },
            );
            return;
        case "nocache":
            await b.send("Network.setCacheDisabled", { cacheDisabled: s.off ? false : true });
            if (!s.off) await b.send("Network.clearBrowserCache");
            return;
        default:
            throw new Error(`operación desconocida: ${s.op}`);
    }
}
