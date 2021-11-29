# Workgrid Microapp

![Latest version](https://img.shields.io/npm/v/@workgrid/microapp.svg)

## Installation

```bash
$ npm install @workgrid/microapp
```

## Requirements

This following globals must be available at runtime. Minimal polyfill examples are provided below, and compatability information is available at MDN.


- `globalThis` ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis))
```js
  import 'core-js/stable/global-this'
```

- `Promise.any` ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any))
```js
  import 'core-js/stable/promise/any'
```

- `ResizeObserver` ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver))
```js
  if (!globalThis.ResizeObserver) globalThis.ResizeObserver = require('@juggle/resize-observer')
```

## Usage

```js
import Microapp from '@workgrid/microapp'
const microapp = new Microapp()

microapp.initialize()
const token = await microapp.getToken()
```
