<h1 align="center">StriveUI</h1>

<div align="center">

A robust UI library that gives you the ability to build out your own design system, but **without** all the _hassle_.

</div>

## ✨ Features

- 🎁 High-quality React components out of the box.
- ⚔️ Written in TypeScript with well defined and predictable types.
- 🎨 Expandable theme and design system customization with SASS variables.

## 🌍 Environments

- Modern browsers
- Server-side Rendering

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)
[<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)
[<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)
[<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)

## 🎁 Install

```bash
$ npm install @stritech/strive-ui
```

```bash
$ yarn add @stritech/strive-ui
```

## 🔨 Usage

```jsx
import React from "react";
import { Button } from "@stritech/strive-ui";

const App = () => (
  <>
    <Button variant="primary">Click Me!</Button>
  </>
);
```

## ⌨️ Development

##### Clone and run locally

```bash
$ git clone git@github.com:Striving-Technologies/strive-ui.io.git
$ cd strive-ui.io
$ npm install
$ npm run storybook
```

A new tab should automatically open in the browser on port [`6006`](http://localhost:6006), if not,
open your browser and visit http://127.0.0.1:6006 or http://localhost:6006.

##### Testing locally (in a separate project)

In the Strive UI directory run:

```bash
$ npm link
```

Navigate to the application you want to use for the test and run:

```bash
$ npm link @stritech/strive-ui
```

You should now be able to import and use components as shown [above](#-usage).

## 🤝 Contribution

There are tons of ways you can contribute, and we're happy to accept all. Please checkout our [guide to contributing here](docs/contributing.md). For CSS naming conventions, component file structure, SCSS architecture, and theming details, see the [conventions & style guide](docs/conventions.md). We can't wait to see what you've got for us.
