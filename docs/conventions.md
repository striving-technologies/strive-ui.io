# StriveUI Conventions & Style Guide

This document covers CSS naming conventions, component file structure, TypeScript patterns, SCSS architecture, and theming for the StriveUI library. It is the single reference for how things are named and organized.

---

## 1. CSS Class Naming (BEM with `stc-` prefix)

All CSS classes use a modified BEM structure with the `stc-` prefix.

| Pattern | Format | Example |
|---------|--------|---------|
| Block | `stc-<component>` | `.stc-button` |
| Variant modifier | `stc-<component>-var--<value>` | `.stc-button-var--primary` |
| Size modifier | `stc-<component>-size--<value>` | `.stc-button-size--small` |
| Shape modifier | `stc-<component>-shape--<value>` | `.stc-button-shape--pill` |
| State modifier | `stc-<component>--<state>` | `.stc-button--danger` |
| Sub-element | `stc-<component>__<element>` | `.stc-button__loader` |
| Sub-element state | `stc-<component>__<element>--<state>` | `.stc-select__option--selected` |
| CSS variable | `--stc-<name>` | `--stc-primary-color` |

### Key rules

- **Default size (`"medium"`) never emits a class** — only `small` and `large` add a size class.
- **Utility classes** are prefixed with `stc-` (no double underscore):
  - `.stc-off-screen` — visually hides content for screen readers.
  - `.stc-keyboard-focusable` — adds a visible focus ring on `:focus-visible`.

---

## 2. `classnames` Library Usage

Every component builds its CSS class string using the `classnames` library with object notation. The standard pattern is:

```ts
const generatedClasses = classNames({
  "stc-<component>": true,                                     // always on
  "stc-keyboard-focusable": true,                               // if keyboard-focusable
  [`stc-<component>-var--${variant}`]: variant,                 // conditional variant
  [`stc-<component>-size--${size}`]: size !== "medium" && size, // skip default size
  [`stc-<component>-shape--${shape}`]: shape,                   // conditional shape
  "stc-<component>--<state>": booleanProp,                      // boolean state toggle
  ...(className && { [className]: true }),                      // consumer override
});
```

### Real example — Button

```ts
const generatedClasses = classNames({
  "stc-button": true,
  "stc-keyboard-focusable": true,
  [`stc-button-var--${variant}`]: variant,
  [`stc-button-size--${size}`]: size !== "medium" && size,
  [`stc-button-shape--${shape}`]: shape,
  [`stc-button--danger`]: danger,
  [`stc-button--loading`]: loading,
  [`stc-button__loader--${loadingIconPosition}`]: loadingIconPosition,
  [`stc-button__icon--${iconPosition}`]: iconPosition,
  "stc-button--borderless": borderless,
  ...(className && { [className]: true }),
});
```

### Why this pattern?

- **Falsy values are excluded** — `classnames` drops any key whose value is falsy, so conditional classes are handled declaratively.
- **Consumer overrides** — the spread of `className` lets consumers add their own classes without replacing the generated ones.

---

## 3. Component File Structure

Each component lives in its own directory under `src/components/`:

```
src/components/<ComponentName>/
├── <ComponentName>.tsx         — Component implementation
├── <ComponentName>.types.ts    — TypeScript interfaces and types
├── <ComponentName>.spec.tsx    — Unit tests (Jest + React Testing Library)
├── index.ts                    — Public re-exports
└── _shared.ts                  — (optional) Shared context or utilities
```

### `index.ts` re-exports

```ts
import Button from "./Button";

export * from "./Button.types";

export { Button };
```

### TypeScript conventions

- **Props interfaces extend native HTML attributes:**

  ```ts
  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariantType;
    size?: DefaultComponentSize;
    // ...
  }
  ```

- **Shared types** live in `src/components/types.ts`:

  ```ts
  export type DefaultComponentSize = "small" | "medium" | "large";
  ```

- **Component-specific types** (e.g., `ButtonVariantType`) live in the component's own `<ComponentName>.types.ts`.

### Default prop values

Defaults are declared via destructuring in the component function signature:

```ts
const Button = ({
  variant = undefined,
  size = "medium",
  disabled = false,
  // ...
}: ButtonProps) => { ... };
```

---

## 4. SCSS Architecture

All styles live in `src/styles/`:

| File | Purpose |
|------|---------|
| `_settings.scss` | All CSS custom properties (`--stc-*`) on `:root` and `.stc--dark` |
| `_utils.scss` | Utility classes (`.stc-off-screen`, `.stc-keyboard-focusable`) |
| `_icons.scss` | Icon styles |
| `<component>.scss` | Component-specific styles, each wrapped in a mixin |
| `main.scss` | Master file that imports everything and exposes the `striveui` mixin |

### Component style mixin convention

Each component file wraps its styles in a mixin named `stc__<component-name>` (double underscore):

```scss
// button.scss
@mixin stc__button {
  .stc-button {
    // component-level CSS variable overrides
    --stc-button--padding-x: var(--stc-spacing-m);
    --stc-button--padding-y: var(--stc-spacing-s);

    // base styles...

    &.stc-button-var--primary { /* ... */ }
    &.stc-button-size--small  { /* ... */ }
  }
}
```

### Master mixin

`main.scss` composes all component mixins into a single `striveui` mixin:

```scss
@mixin striveui {
  @include stc__icons;
  @include stc__utils;
  @include stc__button;
  @include stc__input;
  @include stc__pagination;
  @include stc__search;
  @include stc__select;
  @include stc__spinner;
}
```

### Independent imports

Because each component is wrapped in its own mixin, consumers can import individual component styles for tree-shaking:

```scss
@import "@stritech/strive-ui/src/styles/button.scss";
@import "@stritech/strive-ui/src/styles/_utils.scss";

@include stc__utils;
@include stc__button;
```

> **Note:** `_utils.scss` and `_icons.scss` must be imported alongside any component for utility classes to work.

### Prefix distinction

| Context | Prefix | Example |
|---------|--------|---------|
| CSS class names | `stc-` (single hyphen) | `.stc-button` |
| SCSS mixin names | `stc__` (double underscore) | `@mixin stc__button` |

---

## 5. Theming & CSS Variables

All design tokens are defined as CSS custom properties in `src/styles/_settings.scss`.

### Seed variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stc-primary-color` | `rgb(242, 105, 46)` | Primary brand color |
| `--stc-secondary-color` | `rgb(215, 215, 215)` | Secondary/neutral color |
| `--stc-text-color` | `#000` | Default text color |
| `--stc-text-color--primary` | `#fff` | Text over primary backgrounds |
| `--stc-danger-color` | `rgb(210, 43, 43)` | Danger/error color |
| `--stc-disabled-bg-color` | `#f0efef` | Disabled background |
| `--stc-disabled-text-color` | `#a7a7a7` | Disabled text |
| `--stc-font-size` | `1rem` | Base font size |
| `--stc-spacing` | `0.5rem` | Base spacing unit |
| `--stc-transition` | `all 0.2s linear` | Default transition |
| `--stc-border-radius` | `0.25rem` | Default border radius |

### Derived scales

Spacing and font sizes derive from their base values:

| Variable | Derivation |
|----------|------------|
| `--stc-font-size-s` | `0.8 * --stc-font-size` |
| `--stc-font-size-m` | `--stc-font-size` |
| `--stc-font-size-l` | `1.2 * --stc-font-size` |
| `--stc-spacing-s` | `0.5 * --stc-spacing` |
| `--stc-spacing-m` | `--stc-spacing` |
| `--stc-spacing-l` | `1.4 * --stc-spacing` |

### Component-level variable overrides

Components declare their own CSS variables scoped to their block class, falling back to global tokens:

```css
.stc-button {
  --stc-button--padding-x: var(--stc-spacing-m);
  --stc-button--padding-y: var(--stc-spacing-s);
  --stc-button--border-radius: var(--stc-border-radius);
  --stc-button--box-shadow: var(--stc-box-shadow);
  --stc-button--text-color: var(--stc-text-color);
  --stc-button--transition: var(--stc-transition);
}
```

This lets consumers override a single component without affecting others:

```css
.stc-button {
  --stc-button--border-radius: 8px;
}
```

### Dark mode

Apply the `.stc--dark` class to any parent element. It overrides the relevant CSS variables:

```html
<div class="stc--dark">
  <!-- all StriveUI components inside inherit dark-mode variables -->
</div>
```

Variables overridden in dark mode include `--stc-secondary-color`, `--stc-text-color`, and disabled-state colors. See `_settings.scss` for the full list.
