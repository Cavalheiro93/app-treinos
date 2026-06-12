---
name: release
description: Publicar/entregar uma mudança do app de treinos (Meus Treinos PWA). Use quando o usuário pedir para "subir", "publicar", "lançar", "deployar", "fazer release" ou abrir um PR de uma alteração no index.html/sw.js. Cuida do ritual completo: sincronizar com origin/main, bumpar versão e cache, checar sintaxe e abrir o PR para a main.
---

# Release do "Meus Treinos" (PWA de arquivo único)

Siga este ritual para publicar uma mudança. O app é `index.html` (HTML+CSS+JS inline)
+ `sw.js`. O Netlify publica a `main`, então **a mudança só chega ao usuário após PR
mesclado na main**. Veja o `CLAUDE.md` na raiz para arquitetura e gotchas.

## Passos

1. **Sincronizar (o ambiente é efêmero e re-clona versões antigas).**
   - Se NÃO houver trabalho local não commitado a preservar:
     `git fetch origin` e `git reset --hard origin/main`.
   - Confirme a versão base: `grep "APP_VERSION =" index.html`.

2. **Aplicar a mudança** em `index.html` (e `sw.js` se necessário).

3. **Bumpar a versão** (no `index.html`):
   - `APP_VERSION` (ex.: "2.7" → "2.8").
   - `APP_BUILD` = `"<AAAA-MM-DD> · <resumo curto da mudança>"`.

4. **Bumpar o cache do service worker** (`sw.js`): `const CACHE = "treinos-vN"` →
   `"treinos-vN+1"`. (Sem isso o PWA pode servir cache antigo.)

5. **Validar**:
   - Sintaxe do JS inline:
     `node -e "const h=require('fs').readFileSync('index.html','utf8');new Function(h.match(/<script>([\\s\\S]*)<\\/script>/)[1]);console.log('JS OK')"`
   - Sintaxe do `sw.js`:
     `node -e "new Function(require('fs').readFileSync('sw.js','utf8'));console.log('sw OK')"`
   - Se houver lógica nova, escreva um teste rápido em Node com mocks
     (`window/navigator/document/Audio/Blob/URL/localStorage`) e rode.

6. **Commit + push** para a branch de trabalho:
   - `git add -A && git commit -m "<mensagem clara>"`
   - `git push -u origin HEAD:claude/exercise-summary-view-36flg3`

7. **Abrir PR para a `main`** com os tools `mcp__github` (owner `Cavalheiro93`,
   repo `app-treinos`, base `main`). Descreva o problema, a correção e como testar.
   (Não abra PR se o usuário pediu explicitamente para não abrir.)

8. **Avisar o usuário** para **mesclar o PR** e, após o deploy, conferir o **selo de
   versão** no topo do app (usar o botão "🔄 Forçar atualização" se vier do cache).

## Lembretes
- iOS/áudio: nunca setar `navigator.audioSession.type` "eager" (interrompe a música).
- Não dá para testar áudio do iOS nem a nuvem (Firebase) real do sandbox — sinalize
  que o teste fim-a-fim é no aparelho.
- Tudo continua em arquivo único: sem adicionar dependências/build.
