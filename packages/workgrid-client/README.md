# Workgrid Client

![Latest version](https://img.shields.io/npm/v/@workgrid/client.svg)

## Installation

```bash
$ npm install @workgrid/client
```

## Usage

```js
import Client from '@workgrid/client'
const client = new Client()

const notifications = await client.query('getNotifications', { variables: { location: 'toknow' } })
```
