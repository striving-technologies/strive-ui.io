# CLAUDE.md — StriveUI (@stritech/strive-ui)

Knowledge base for AI agents working in this repo. Read this first, then the two source-of-truth
docs it points to. Keep changes on-convention; this library is published to npm, so consumers depend
on its API and class names being stable.

## What this project is

`@stritech/strive-ui` (brand **StriveUI**, by Striving Technologies) is a **React + TypeScript
component library**, bundled with Rollup and shipped as ESM. It is **not** an app.

### Product vision — the north star for every component

Build components that feel like **Ant Design × shadcn/ui, but written entirely from scratch** — we do
**not** wrap Radix, MUI, Ant, or any other component library. Priorities, in order:

1. **Accessibility first.** WAI-ARIA APG compliant, fully keyboard operable, correct focus
   management, screen-reader announced. If a component isn't accessible, it isn't done.
2. **Usability & DX.** Sensible defaults, composable/headless-friendly APIs, correct
   controlled *and* uncontrolled behavior, native HTML semantics preserved.
3. **SCSS-first styling.** All styling **and** animation/transition work is authored in SCSS using
   design tokens — **never CSS-in-JS**, never inline style objects for anything themable.

## Commands (package manager is **yarn** — never use npm)

| Task | Command |
|------|---------|
| Install | `yarn install --immutable` |
| Run tests | `yarn test` (Jest + React Testing Library) |
| Typecheck | `yarn lint-ts` (`tsc --noEmit`) |
| Build library | `yarn build` (`build-components` + `build-css`) |
| Storybook (dev) | `yarn storybook` |
| Build Storybook | `yarn build-storybook` |

**Before opening any PR, `yarn test` and `yarn lint-ts` must both pass.** CI
(`.github/workflows/pr.yaml`) re-runs exactly these two on every PR.

## Source-of-truth docs (read, don't restate)

- **`docs/conventions.md`** — CSS/BEM naming, `classnames` pattern, component file structure,
  TypeScript conventions, SCSS mixin architecture, theming. **Authoritative.**
- **`docs/contributing.md`** — branch prefixes (`feat/`, `bug/`, `doc/`, `mnt/` + optional issue
  number), atomic conventional commits (imperative present tense, ≤72-char subject).

## Where things live

```
src/
├── components/<Name>/     component dirs (see structure below)
│   ├── icons/             inline React SVG icon components (tree-shakeable)
│   └── types.ts           shared types (e.g. DefaultComponentSize)
├── styles/                all SCSS — one file per component + shared partials
│   ├── _settings.scss     design tokens (--stc-* CSS custom properties, light + .stc--dark)
│   ├── _utils.scss        utility classes (.stc-off-screen, .stc-keyboard-focusable)
│   ├── _icons.scss        icon styles
│   ├── <component>.scss    per-component styles, each wrapped in @mixin stc__<component>
│   └── main.scss          composes all mixins into the `striveui` master mixin
├── utils/                 shared helpers
└── index.ts               public package entry — re-exports each component
```

## Component authoring conventions

Each component is a directory under `src/components/<Name>/`:

```
<Name>.tsx        implementation
<Name>.types.ts   props/types — props interface extends the native HTML attribute interface
<Name>.spec.tsx   co-located Jest + RTL tests
index.ts          re-exports:  import X from "./X"; export * from "./X.types"; export { X };
_shared.ts        (optional) shared context/util for the component family
_Private.tsx      (optional) internal sub-components — leading underscore = internal, not exported
```

**The `src/components/Input/` directory is the canonical reference** — it shows `forwardRef`
(`Input.displayName = "Input"`), a shared React context in `_shared.ts`, internal
`_StepButtons.tsx`, and pure helpers in `_currency.ts`. Imitate its structure for new work.

Rules:
- **`classnames` object notation** for every class string (see `docs/conventions.md §2`). Default
  size `"medium"` never emits a size class. Always spread the consumer `className` last.
- Props interfaces **extend native HTML attributes** (`extends InputHTMLAttributes<HTMLInputElement>`);
  shared cross-component types go in `src/components/types.ts`, component-specific types in
  `<Name>.types.ts`. Defaults via destructuring in the function signature.
- **Forward refs** on any component wrapping a focusable/native element.
- **New components must be exported from `src/index.ts`.** (`Select` and `Icon` are currently missing
  from it — don't repeat that mistake.)

## SCSS-first styling & motion

- Every component's styles live in `src/styles/<component>.scss`, wrapped in `@mixin stc__<component>`
  (**double** underscore), and registered in `main.scss`'s `striveui` mixin.
- **Prefix rule:** CSS classes use `stc-` (single hyphen), SCSS mixins use `stc__` (double
  underscore).
- **Tokens** are `--stc-*` CSS custom properties defined in `_settings.scss` on `:root`, overridden
  under `.stc--dark` for dark mode. Colors are stored as raw RGB triplets
  (`--stc-primary-color--values: 242, 105, 46`) so alpha can be composed:
  `rgba(var(--stc-primary-color--values), 0.2)`. Reuse this pattern for new colors.
- **Component-scoped overrides:** declare `--stc-<component>--<prop>` variables on the block class,
  each falling back to a global token — so consumers can theme one component without touching others.
- **Motion is SCSS.** Transitions/animations use the token system (currently `--stc-transition`;
  a richer duration/easing scale is planned). **All new motion must respect
  `@media (prefers-reduced-motion: reduce)`** — the repo does not yet honor this consistently, so add
  it wherever you introduce animation. Prefer transitioning specific properties over `all`.

## Accessibility requirements (non-negotiable)

- Follow the relevant **WAI-ARIA Authoring Practices** pattern for the component (combobox, dialog,
  menu, tabs, tooltip, etc.): correct roles/states, full keyboard operation (arrows/Home/End/Enter/
  Escape/typeahead as applicable), `aria-activedescendant` or roving tabindex, focus trap + restore
  for overlays.
- Native interactive elements get correct semantics: buttons inside forms need `type="button"`;
  never nest interactive elements (`<a><button></a>`); a disabled/loading control must actually be
  non-interactive, not just `aria-disabled`.
- Prefer role/label-based queries in tests (matches the existing specs) — this doubles as an a11y
  check. `jest-axe` coverage is planned; when present, new components must pass it.
- Use `.stc-off-screen` for visually-hidden labels and `.stc-keyboard-focusable` for focus rings.

## Testing conventions

- Jest + `@testing-library/react` + `@testing-library/jest-dom` (setup in `src/setupTest.ts`).
  **No vitest, no Playwright.** Tests are co-located as `<Name>.spec.tsx`.
- Query by role/text, not test-ids (e.g. `screen.getByRole("combobox")`). Use `user-event` /
  `fireEvent` for interaction, `jest.fn()` for callback assertions.
- Cover controlled + uncontrolled paths, keyboard interaction, disabled/loading states, and edge
  cases called out in the issue's acceptance criteria.

## Git & PR conventions

- **Never commit or push to `main`.** Always branch: `feat/<slug>` / `bug/<slug>` / `doc/<slug>` /
  `mnt/<slug>` (optionally `feat/123-<slug>` with the issue number).
- **Conventional commits**, atomic, imperative present tense, subject ≤72 chars — e.g.
  `feat(select): add keyboard navigation`. No "magic" issue-closing words inside commit messages.
- **Do not add `Co-authored-by`, `Generated with`, or any similar trailer** to commit messages or
  PR bodies. (`.claude/settings.json` sets `includeCoAuthoredBy: false`; keep it that way.)
- PRs use `.github/pull_request_template.md` (Description / QA / Issue / Screenshots / Checklist) and
  link the issue with `Closes #<n>`.

## Known gaps (context, so agents don't trip on them)

- ESLint 9 is installed but only a legacy `.eslintrc.json` exists and it isn't run in CI.
- No `prefers-reduced-motion` handling yet; some `--stc-*` tokens referenced in `select.scss` are
  undefined; `main.scss` has a stale path comment. Fix opportunistically when touching those files.
- `Icon` fetches SVGs at runtime — prefer the inline React icons in `src/components/icons/`.
