// Service worker: online busca a versão mais nova; offline usa o cache de reserva
const CACHE = "treinos-v7";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const req = e.request;
  // Não interceptar o handler de autenticação do Firebase (proxy do login).
  if (new URL(req.url).pathname.startsWith("/__/")) return;
  const isHTML = req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // Network-first para a página: pega a versão atual quando há internet
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  // Demais arquivos: usa cache e atualiza em segundo plano
  e.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(resp => {
        if (resp && resp.status === 200 && resp.type === "basic") {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
