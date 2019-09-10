# Workgrid Courier

![Latest version](https://img.shields.io/npm/v/@workgrid/courier.svg)

## Installation

```bash
$ npm install @workgrid/courier
```

## Usage

```js
// Workgrid
import Courier from '@workgrid/courier'
const courier = new Courier({ id: 'workgrid' })

courier.on('token:refresh', async (event, callback) => {
  callback(null, await getToken())
})

// Microapp
import Courier from '@workgrid/courier'
const courier = new Courier({ id: 'microapp' })

courier.emit('token:refresh', (err, data) => {
  console.log(err, data)
})
```
