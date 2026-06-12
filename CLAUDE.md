# CLAUDE.md — Meus Treinos (app de musculação)

PWA pessoal para registrar treinos de musculação. Funciona offline, instalável no
iPhone/PC, sincroniza na nuvem (opcional) e não tem mensalidade/login obrigatório.

## Arquitetura (importante)
- **App de arquivo único**: quase tudo vive em **`index.html`** — HTML + CSS + JS
  **inline** (~1400 linhas). **Sem build, sem dependências, sem framework.**
- Outros arquivos:
  - `sw.js` — service worker (offline + cache).
  - `manifest.json`, `icon.png` — PWA.
  - `netlify.toml` — proxy de autenticação do Firebase (ver Sync).
  - `README.md`, `exemplo-treino.csv` — docs/exemplo.
- 3 abas (views): **Treinar**, **Fichas**, **Histórico** — alternadas por `go(tab)`.

## Modelo de dados (localStorage, via `DB.get/set`)
- `gym_fichas_v1` → `fichas`: `[{ id, nome, exercicios:[{nome, series, reps, carga, descanso}] }]`
  - **descanso é por exercício** (segundos). `DEFAULT_REST = 90` é só semente.
- `gym_sessoes_v1` → `sessoes`: `[{ id, fichaId, fichaNome, data, itens:[{nome, series, reps, carga, sets:[{carga, reps, feito, tag}]}] }]`
  - `descanso` e `fichaIdx` existem **só na `sessaoAtiva`** (em memória) — o
    `finalizarTreino` descarta esses campos ao salvar no histórico.
- `gym_config_v1` → `cfg`: `{ somModo }` (`"mix"` ou `"bg"`).
- `gym_updated_v1` → `localUpdatedAt`: carimbo p/ a sincronização (LWW).
- Sessão de treino em andamento: `sessaoAtiva` (em memória, **não** persistida).

## Sincronização na nuvem (Firebase — opt-in)
- Login Google opcional (⚙️ Configurações). Sem login, o app é 100% local.
- Firestore em `users/{uid}` com `{fichas, sessoes, cfg, updatedAt}`.
- `FB_CONFIG` é **público por design** (segurança via Rules + login). `authDomain`
  aponta p/ `treinos-caio.netlify.app` em produção (via `location.hostname`).
- **`netlify.toml` faz proxy de `/__/auth/*`** → necessário p/ o login Google
  funcionar no **PWA standalone do iOS** (contorna o bloqueio ITP entre domínios).
- Estratégia "**último a salvar vence**" (`updatedAt`), com botões manuais
  **Enviar/Baixar**. Funções: `cloudPush`, `applyRemote`, `attachSnapshot`.

## Áudio / cronômetro de descanso (cuidado: regras do iOS)
Trade-off **inerente do iOS**: não dá p/ ter alarme tocando com a **tela bloqueada**
E **não interromper a música** de outros apps ao mesmo tempo. Por isso há um
interruptor (`cfg.somModo`):
- **`"mix"` (padrão)** — `audioSession` fica `"auto"`; durante a contagem **nada
  toca** (música 100% livre); no apito toca em `"transient"` (abaixa a música/ducking).
  Só funciona com app aberto/tela ligada.
- **`"bg"`** — `audioSession="playback"`; toca uma faixa contínua (silêncio+apitos)
  p/ tentar soar com a **tela bloqueada**, mas **interrompe a música**.
- **NUNCA** setar `navigator.audioSession.type` "eager" (na abertura/destrave) —
  isso rouba a música. Só aplicar na hora de tocar (`armAudioTimer`/`tocarBeepLoop`).
- Funções-chave: `aplicarAudioSession`, `armAudioTimer`, `tocarBeepLoop`,
  `onAlarmReached`, `buildTimerWav` (gera WAV), `wavBlobUrl`, `startOscAlarm`
  (fallback Web Audio), wake lock (`requestWakeLock`) mantém a tela ligada no descanso.
- A faixa é WAV gerada em runtime (Blob URL), nunca arquivo externo.

## Convenções / helpers
- Helpers: `DB.get/set`, `esc()` (anti-XSS em templates), `jsStr()` (p/ interpolar
  valores em handlers inline tipo `onclick` — `esc()` sozinho não basta lá),
  `uid()`, `el()`, `toast()`, `openModal/closeModal`, `go(tab)`. Funções de UI
  rendem HTML por string — **todo dado dinâmico passa por `esc()`/`jsStr()`**.
- **Selo de versão** (`#verBadge`) no topo mostra `v{APP_VERSION}`; tocar = "Forçar
  atualização" (desregistra SW + limpa caches + reload com cache-buster).
- CSV de fichas: colunas `treino, exercicio, series, repeticoes, carga, descanso`
  (separador `,` ou `;` auto-detectado).
- Trocar exercício no meio do treino: `trocarExercicio`/`_aplicarTroca` (só hoje ou
  permanente; `fichaIdx` mapeia o item da sessão de volta p/ a ficha).

## Deploy e ambiente (LER ANTES DE MEXER)
- **O ambiente é efêmero e costuma re-clonar uma versão ANTIGA.** Sempre comece com:
  `git fetch origin && git reset --hard origin/main` (a `main` é a fonte da verdade).
- Branch de trabalho: a branch `claude/...` indicada na sessão atual (muda a cada
  sessão). Push: `git push -u origin HEAD:<branch>`.
- **O Netlify publica a `main`.** Mudanças só chegam ao app após **PR → merge na main**.
  Não basta commitar na branch.
- A cada mudança publicável:
  1. Bumpar `APP_VERSION` e `APP_BUILD` (data + resumo curto).
  2. Bumpar `CACHE` no `sw.js` (`treinos-vN` → `treinos-vN+1`).
  3. (ver Skill `/release`.)

## Testes (o que dá pra fazer no sandbox)
- **Sintaxe do JS inline**: `node -e "const h=require('fs').readFileSync('index.html','utf8');new Function(h.match(/<script>([\\s\\S]*)<\\/script>/)[1]);console.log('ok')"`.
- **Lógica**: harness em Node com mocks de `window/navigator/document/Audio/Blob/URL/
  localStorage/firebase` (ex.: validar modos de áudio, sync, troca de exercício).
- **NÃO** dá p/ testar áudio do iOS nem a nuvem real daqui — teste fim-a-fim é no aparelho.

## Gotchas
- Esquecer de sincronizar com `origin/main` → editar versão antiga e regredir features.
- Esquecer de bumpar versão/cache → usuário não vê a mudança (cache do PWA).
- Setar `audioSession` eager → interrompe a música do usuário.
- Achar que commitar na branch publica → só publica via PR na `main`.
