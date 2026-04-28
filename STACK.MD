# STACK.md — Projeto Travessia

Documento técnico de contexto para agentes de IA e desenvolvedores. Descreve stack, arquitetura, convenções e pontos de extensão do projeto no estado atual do `index.html`, `styles.css` e `app.js`.

---

## 1. O que é

Landing page estática de vendas do **Método Travessia**, curso de finanças pessoais da Letícia Kratka.

Não é SPA e não usa framework. É um site de uma página só com scroll longo, motion editorial, seções de conversão e uma jornada scroll-driven para explicar os 3 Destraves: **Clareza → Sobra → Crescimento**.

Objetivo principal: levar a pessoa ao bloco de oferta e ao CTA de entrada no Travessia.

---

## 2. Stack

### Core

- **HTML5 semântico** — `index.html`, página única.
- **CSS puro** — `styles.css`, design system e todas as seções.
- **JavaScript vanilla** — `app.js`, interações, scroll, motion, counters e FAQ.

### Dependências externas via CDN

- **Lenis `1.1.14`** — smooth scroll, exposto como `window.lenis`.
- **Anime.js `4.2.2` UMD** — motion do hero, diagnóstico e cards da jornada, exposto como `window.anime`.
- **Google Fonts** — `Cormorant Garamond`, `Inter`, `JetBrains Mono`.

### Não existe

- Sem React/Vue/Svelte.
- Sem bundler.
- Sem TypeScript.
- Sem Tailwind/Sass/PostCSS.
- Sem `package.json`.
- Sem build step.

Qualquer servidor HTTP estático serve o projeto. Abrir o HTML direto pode funcionar, mas um servidor local é mais fiel ao comportamento final.

---

## 3. Estrutura de arquivos

```txt
/
├── index.html              # Página única e conteúdo renderizado
├── styles.css              # Design system, layout, responsivo e motion CSS
├── app.js                  # Lenis, Anime.js, jornada, reveals, counters e FAQ
├── CLAUDE.md               # Briefing de produto e posicionamento
├── STACK.MD                # Este documento técnico
├── COPY.md                 # Copy de referência
├── assets/
│   ├── hero-leticia.webp
│   └── leticia-sorriso.jpg
├── screenshots/            # Capturas de debug
├── uploads/                # Materiais de origem/importação
└── old*, index2 copy.html   # Backups/versões antigas, não são fonte de produção
```

Arquivos de produção principais: `index.html`, `styles.css`, `app.js`, `assets/*`.

---

## 4. Design system

### Tokens principais

Os tokens ficam no `:root` do `styles.css`.

```css
--bg: #f6f1e8;
--bg-2: #efe8dc;
--bg-deep: #3d4a30;
--bg-deeper: #2b331f;
--ink: #1e2418;
--ink-muted: #4a5240;
--ink-soft: #7a7d6e;
--line: #d9cfbb;
--gold: #b8924a;
--gold-2: #d4b072;
--gold-deep: #8c6b2a;
--sage: #6b7a54;
--sage-light: #8d9b76;
--cream-card: #ebe2d0;
```

### Tipografia

- `--serif`: `Cormorant Garamond`, usada em títulos, números e ênfases editoriais.
- `--sans`: `Inter`, usada em corpo, UI e labels.
- `--mono`: `JetBrains Mono`, usada em tags, pequenos números e marcações técnicas.

### Convenções visuais

- `.serif` para títulos/editorial.
- `.eyebrow` para labels pequenas com espaçamento.
- `.on-dark` para seções escuras.
- `.reveal` e `.reveal-stagger` para entrada ao scroll.
- Classes seguem padrão BEM-like por seção: `.secao__elemento--modificador`.

---

## 5. Estrutura atual da página

Ordem real em `index.html`:

1. `header.nav` — navegação fixa.
2. `.hero` — abertura, intro motion, headline, CTA, provas e imagem.
3. `.problema#diagnostico` — diagnóstico on-dark com motion de reconhecimento.
4. `.solucao#metodo` — apresentação da jornada dos 3 Destraves.
5. `.jornada#jornada` — mapa SVG sticky + cards dos destraves.
6. `.cta-mid` — CTA após a jornada.
7. `.quem-ensina#quem` — autoridade e bio da Letícia.
8. `.para-quem` — qualificação de público.
9. `.produto#produto` — cursos, ferramentas, pack e acompanhamento.
10. `.prova.on-dark` — depoimentos e métricas.
11. `.cta-mid` — CTA pós-prova.
12. `.oferta#oferta` — preço, stack de valor e compra.
13. `.bonus` — bônus.
14. `.garantia` — garantia.
15. `.faq#faq` — perguntas frequentes.
16. `.last-call.on-dark` — CTA final.
17. `footer.foot`.

Observação: a seção principal do método hoje é `.solucao#metodo` com a jornada SVG. Referências antigas a `.mtl`/`.metodo` pertencem a versões anteriores.

---

## 6. Sistemas interativos

### Lenis

`app.js` inicializa `window.lenis` com RAF próprio:

- Scroll suave global.
- Anchors internos roteados por `window.lenis.scrollTo(target, { offset: -60, duration: 1.4 })`.
- Eventos críticos de scroll escutam `window.lenis.on('scroll', fn)`.

### Hero intro

`runHeroIntro()` usa Anime.js para a camada `.hero__intro`.

- Em desktop, pausa Lenis durante a intro.
- Ao terminar, libera a página e oculta a intro visual.
- Em mobile/reduced motion, entra direto no estado final.
- Se Anime.js falhar, o fallback deixa o conteúdo acessível imediatamente.

### Reveals

Sistema simples baseado em `getBoundingClientRect()`:

- `.reveal` entra quando aproxima do viewport.
- `.reveal-stagger` aplica delay visual nos filhos.
- Há safety net por timeout para evitar conteúdo preso invisível.

### Diagnóstico

`runDiagnosticoMotion()` anima a seção `.problema`:

- Scan visual.
- Headline com destaque no `90%`.
- Evidências textuais.
- Pull quote.
- Termos-chave.
- Closer.

Não trava Lenis. Em `prefers-reduced-motion` ou sem Anime.js, força estado final.

### Counters

Elementos com `[data-count]` animam até o valor alvo quando entram na viewport.

### Parallax

Elementos `.parallax[data-parallax]` movem imagens de forma sutil no scroll, principalmente no hero.

### FAQ

Cada `.faq-item` alterna `.is-open` no clique e controla `max-height` do painel de resposta.

---

## 7. Jornada dos 3 Destraves

A jornada é o bloco técnico mais sensível da página.

### HTML principal

```html
<section class="solucao" id="metodo">
  <div class="jornada" id="jornada">
    <div class="jornada__sticky">
      <div class="jornada__bg">...</div>
      <div class="jornada__stage">
        <div class="jornada__map">...</div>
        <div class="jornada__content">...</div>
      </div>
      <div class="jornada__dots">...</div>
    </div>
  </div>
</section>
```

### Marcadores e progresso

Os milestones são definidos no HTML e lidos pelo JS:

```html
<article class="jornada__step" data-step="1" data-progress="0.35">
<g class="jornada__map-mark" data-step="1" data-progress="0.35">
```

Valores atuais:

- `0` — Dia 0.
- `0.35` — Destrave 1, Clareza.
- `0.72` — Destrave 2, Sobra.
- `1` — Destrave 3, Crescimento.

O card ativo só muda quando o progresso real atinge o milestone correspondente. Isso evita a troca antecipada do card antes do pin chegar ao marco visual.

### SVG

- `#jornadaActivePath` usa `strokeDasharray`/`strokeDashoffset` para preencher a linha ativa.
- `#jornadaPin` usa `getPointAtLength()` para seguir o caminho.
- `.jornada__map-mark` recebe estados:
  - `.is-current`
  - `.is-complete`

### Motion dos cards

`playStepMotion(step, skipMotion)` anima somente o card e seus textos internos:

- Card entra com leve deslocamento, blur e opacidade.
- Header, título, promessa, bullets e regra entram com stagger.
- Não existe mais título editorial separado antes do card.
- Se o usuário passar rápido do ponto (`JOURNEY_SKIP_OFFSET`), o estado final é aplicado direto.
- Em `prefers-reduced-motion`, todos os cards aparecem prontos.

### Scroll fantasma

`JOURNEY_GHOST_SCROLL = 0.08` reserva uma pequena faixa final para o Destrave 3 não sair da viewport imediatamente quando chega ao fim da jornada.

### Background da jornada

Elementos com `[data-jornada-depth]` em `.jornada__bg` se movem com o progresso:

- Grid cartográfico.
- Ledger com nomes dos destraves.
- Selo `7 · 30 · 90`.
- Compasso.

O movimento é decorativo e não controla conteúdo.

### Mobile

Em telas menores:

- A jornada deixa de ser sticky.
- O mapa e o background decorativo são ocultos.
- Os steps ficam em fluxo vertical.
- A ativação/motion dos cards usa `IntersectionObserver` e fallback por scroll.
- A leitura não depende da animação.

---

## 8. Convenções de JavaScript

- Manter tudo em `app.js`, salvo mudança estrutural grande.
- Preferir enhancement progressivo: se Lenis/Anime falhar, conteúdo continua legível.
- Escutar `window.lenis.on('scroll', fn)` quando a interação depender do scroll suave.
- Para estados visuais, usar classes (`.is-active`, `.is-current`, `.is-complete`, `.is-card-ready`) e `data-*`.
- Respeitar `prefers-reduced-motion`.
- Evitar acoplar card da jornada a percentuais fixos fora do `data-progress`.

---

## 9. CSS e responsivo

Breakpoints principais vivem no final do `styles.css`.

- Desktop é a experiência principal.
- Mobile precisa permanecer em fluxo normal, sem depender de sticky.
- Cards e blocos de UI usam raio pequeno, mantendo a estética editorial.
- Incrementar `styles.css?v=N` no `index.html` quando CSS crítico mudar e houver cache no preview.

Valor atual no HTML:

```html
<link rel="stylesheet" href="styles.css?v=14" />
```

---

## 10. Conteúdo

- `CLAUDE.md` é o briefing de produto, avatar, tom e tese central.
- `COPY.md` é a referência de copy.
- O conteúdo renderizado está hardcoded no `index.html`.

Tom esperado: sofisticado, direto, empático, sem urgência falsa e sem promessa de enriquecimento rápido.

---

## 11. Como estender

### Nova seção

1. Adicionar `<section class="nova-secao" data-screen-label="NN Nome">` no `index.html`.
2. Criar CSS seguindo o padrão BEM-like da página.
3. Usar `.reveal` nos elementos que devem entrar ao scroll.
4. Atualizar `styles.css?v=N` se necessário.

### Novo step na jornada

1. Adicionar novo `.jornada__step` com `data-step` e `data-progress`.
2. Adicionar `.jornada__map-mark` correspondente no SVG.
3. Adicionar dot se a navegação visual precisar refletir o novo step.
4. Recalibrar path/marcos se o caminho visual mudar.

### Novo elemento de background na jornada

1. Inserir elemento dentro de `.jornada__bg`.
2. Adicionar `data-jornada-depth="N"`.
3. Estilizar no CSS. O JS passa a mover automaticamente.

---

## 12. Débitos técnicos conhecidos

- Sem testes automatizados, lint ou formatação automatizada.
- Sem analytics/pixel configurado.
- CTAs ainda apontam para âncoras internas; plugar checkout real antes de publicar.
- Acessibilidade é razoável, mas ainda falta auditoria formal com axe/WAVE.
- Copy é hardcoded; mudanças textuais exigem edição direta no HTML.
- Existem arquivos antigos/backups na raiz que não fazem parte da fonte de produção.
- A jornada é o bloco de maior risco visual: qualquer alteração em path, `data-progress` ou altura sticky deve ser testada em desktop e mobile.
