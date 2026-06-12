# 🏋️ Meus Treinos

App simples para controlar os treinos de musculação. Funciona no iPhone e no PC,
sem login e sem mensalidade. Os dados ficam salvos no próprio aparelho.

## O que ele faz
- **Registrar o treino do dia** — digitar carga, repetições e séries de cada exercício
- **Montar fichas** — Treino A, B, C... com lista de exercícios
- **Importar treino por CSV** — monte a planilha no PC e importe no app
- **Histórico e evolução** — veja seu progresso de carga em gráfico
- **Cronômetro de descanso** — timer entre as séries, com aviso sonoro e vibração

## Como usar no dia a dia
1. Abra a aba **Fichas** → crie uma ficha (ou importe um CSV).
2. Na aba **Treinar**, toque na ficha do dia.
3. Preencha carga/reps de cada série e marque ✓ quando concluir (o descanso inicia sozinho).
4. Toque em **Finalizar treino**. Ele vai pro **Histórico**.

## Subir treinos pelo PC (CSV)
Monte uma planilha no Excel com estas colunas:

| treino | exercicio | series | repeticoes | carga |
|--------|-----------|--------|------------|-------|
| Treino A | Supino reto | 4 | 10 | 40 |
| Treino A | Crucifixo | 3 | 12 | 16 |
| Treino B | Agachamento | 4 | 10 | 60 |

Colunas opcionais: **descanso** (segundos entre as séries, ex: 90) e
**series_tags** (uma letra por série: **A** = 🔥 aquecimento, **P** = ⚡ preparação;
ex: `AP` marca a 1ª série como aquecimento e a 2ª como preparação).

- Salve como **CSV** (vírgula ou ponto-e-vírgula — os dois funcionam).
- Mande o arquivo pro iPhone (e-mail, WhatsApp, iCloud Drive...).
- No app: **Fichas → 📄 CSV → escolher arquivo**.
- Veja o `exemplo-treino.csv` deste projeto como modelo.

Linhas com o mesmo nome de "treino" viram a mesma ficha. Importar uma ficha que já
existe (mesmo nome) **atualiza** ela.

## Como colocar no iPhone (instalar na tela inicial)
O app precisa estar publicado num endereço `https`. A forma mais fácil e grátis:

**Opção A — Netlify (arrastar e soltar):**
1. Acesse https://app.netlify.com/drop
2. Arraste a **pasta inteira** deste projeto para a página.
3. Ele gera um link tipo `https://seu-treino.netlify.app`.
4. Abra esse link no **Safari** do iPhone → botão **Compartilhar** → **Adicionar à Tela de Início**.

Pronto: vira um ícone de app, abre em tela cheia e funciona offline.

**Opção B — GitHub Pages:** suba os arquivos num repositório e ative o Pages.

## Testar no PC
Abra um terminal nesta pasta e rode:

```
python -m http.server 5500
```

Depois acesse `http://localhost:5500` no navegador.
(Abrir o `index.html` direto também funciona, mas o modo offline/instalação só
vale quando está publicado em `https`.)

## Backup dos dados
Como tudo fica salvo só no aparelho, de tempos em tempos use, na aba **Fichas**:
- **💾 Backup completo** → salva um arquivo com fichas + histórico.
- **↩️ Restaurar backup** → recarrega esse arquivo (ex: ao trocar de celular).

## Arquivos do projeto
- `index.html` — o app inteiro (interface + lógica)
- `manifest.json` / `sw.js` / `icon.png` — fazem virar app instalável e offline
- `exemplo-treino.csv` — modelo de planilha para importar
